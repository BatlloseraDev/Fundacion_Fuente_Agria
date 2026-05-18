import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RoleName } from '../common/types/role-name.enum';

const CART_INCLUDE = {
  items: {
    include: {
      article: {
        include: {
          categories: { include: { categoryArticle: true } },
          labels: { include: { label: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class CartService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CartService.name);
  private cleanupTimer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    this.cleanupTimer = setInterval(
      () => this.processAbandonedCarts().catch((error) => this.logger.error(error)),
      60 * 60 * 1000,
    );

    this.processAbandonedCarts().catch((error) => this.logger.error(error));
  }

  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }

  async getActiveCart(userId: number) {
    return this.ensureActiveCart(userId);
  }

  async addItem(userId: number, articleId: number, quantity: number) {
    if (quantity < 1) throw new BadRequestException('La cantidad debe ser mayor que 0');

    const cart = await this.ensureActiveCart(userId);

    await this.prisma.$transaction(async (tx) => {
      const article = await tx.article.findUnique({ where: { id: articleId } });
      if (!article) throw new NotFoundException('Producto no encontrado');
      if (!article.available || article.stock < quantity) {
        throw new BadRequestException('No hay suficiente inventario disponible');
      }

      const updated = await tx.article.updateMany({
        where: { id: articleId, available: true, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });

      if (updated.count === 0) {
        throw new BadRequestException('No hay suficiente inventario disponible');
      }

      await this.syncArticleAvailability(tx, articleId);

      await tx.cartItem.upsert({
        where: { cartId_articleId: { cartId: cart.id, articleId } },
        update: { quantity: { increment: quantity } },
        create: { cartId: cart.id, articleId, quantity },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { reminderSentAt: null },
      });
    });

    return this.ensureActiveCart(userId);
  }

  async setItemQuantity(userId: number, articleId: number, quantity: number) {
    if (quantity < 1) throw new BadRequestException('La cantidad debe ser mayor que 0');

    const cart = await this.ensureActiveCart(userId);
    const item = cart.items.find((cartItem) => cartItem.articleId === articleId);
    if (!item) throw new NotFoundException('Producto no encontrado en el carrito');

    const difference = quantity - item.quantity;

    await this.prisma.$transaction(async (tx) => {
      const article = await tx.article.findUnique({ where: { id: articleId } });
      if (!article) throw new NotFoundException('Producto no encontrado');

      if (difference > 0) {
        if (!article.available || article.stock < difference) {
          throw new BadRequestException('No hay suficiente inventario disponible');
        }

        const updated = await tx.article.updateMany({
          where: { id: articleId, available: true, stock: { gte: difference } },
          data: { stock: { decrement: difference } },
        });

        if (updated.count === 0) {
          throw new BadRequestException('No hay suficiente inventario disponible');
        }

        await this.syncArticleAvailability(tx, articleId);
      }

      if (difference < 0) {
        const restoredStock = article.stock + Math.abs(difference);
        await tx.article.update({
          where: { id: articleId },
          data: {
            stock: { increment: Math.abs(difference) },
            available: restoredStock > 0,
          },
        });
      }

      await tx.cartItem.update({
        where: { cartId_articleId: { cartId: cart.id, articleId } },
        data: { quantity },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { reminderSentAt: null },
      });
    });

    return this.ensureActiveCart(userId);
  }

  async removeItem(userId: number, articleId: number) {
    const cart = await this.ensureActiveCart(userId);
    const item = cart.items.find((cartItem) => cartItem.articleId === articleId);
    if (!item) return cart;

    await this.restoreItems(cart.id, [item]);
    return this.ensureActiveCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.ensureActiveCart(userId);
    await this.restoreItems(cart.id, cart.items);
    return this.ensureActiveCart(userId);
  }

  async reserve(userId: number) {
    const cart = await this.ensureActiveCart(userId);
    if (cart.items.length === 0) {
      throw new BadRequestException('El carrito esta vacio');
    }

    const ticketCode = this.createTicketCode();
    const expiresAt = this.addBusinessDays(new Date(), 3);

    const purchase = await this.prisma.$transaction(async (tx) => {
      const createdPurchase = await tx.purchase.create({
        data: {
          userId,
          ticketCode,
          reservationExpiresAt: expiresAt,
          articles: {
            create: cart.items.map((item) => ({
              articleId: item.articleId,
              estimatedPrice: item.article.price,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          user: true,
          articles: { include: { article: true } },
        },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { status: 'RESERVED' },
      });

      return createdPurchase;
    });

    const admins = await this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: { in: [RoleName.ADMIN, RoleName.EDITOR] },
            },
          },
        },
      },
      select: { email: true },
    });

    await this.mailService.sendReservationConfirmation(purchase.user.email, purchase);
    await this.mailService.sendReservationAdminNotice(
      admins.map((admin) => admin.email),
      purchase,
    );

    return {
      ticketCode,
      reservationExpiresAt: expiresAt,
      purchase,
      cart: await this.ensureActiveCart(userId),
    };
  }

  async processAbandonedCarts() {
    const now = Date.now();
    const twelveHoursAgo = new Date(now - 12 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    const carts = await this.prisma.cart.findMany({
      where: {
        status: 'ACTIVE',
        items: { some: {} },
        updatedAt: { lte: twelveHoursAgo },
      },
      include: {
        user: true,
        ...CART_INCLUDE,
      },
    });

    for (const cart of carts) {
      if (!cart.reminderSentAt) {
        await this.mailService.sendCartReminder(cart.user.email, cart);
        await this.prisma.cart.update({
          where: { id: cart.id },
          data: { reminderSentAt: new Date() },
        });
        continue;
      }

      if (cart.reminderSentAt <= twelveHoursAgo || cart.updatedAt <= twentyFourHoursAgo) {
        await this.restoreItems(cart.id, cart.items);
        await this.prisma.cart.update({
          where: { id: cart.id },
          data: { status: 'EXPIRED' },
        });
      }
    }
  }

  private async ensureActiveCart(userId: number) {
    const existing = await this.prisma.cart.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: CART_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) return existing;

    return this.prisma.cart.create({
      data: { userId },
      include: CART_INCLUDE,
    });
  }

  private async restoreItems(cartId: number, items: Array<{ articleId: number; quantity: number }>) {
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const article = await tx.article.findUnique({ where: { id: item.articleId } });
        if (!article) continue;

        await tx.article.update({
          where: { id: item.articleId },
          data: {
            stock: { increment: item.quantity },
            available: article.stock + item.quantity > 0,
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: {
          cartId,
          articleId: { in: items.map((item) => item.articleId) },
        },
      });

      await tx.cart.update({
        where: { id: cartId },
        data: { reminderSentAt: null },
      });
    });
  }

  private createTicketCode() {
    return `FFA-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;
  }

  private addBusinessDays(date: Date, days: number) {
    const result = new Date(date);
    let added = 0;

    while (added < days) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) added += 1;
    }

    return result;
  }

  private async syncArticleAvailability(tx: any, articleId: number) {
    const article = await tx.article.findUnique({ where: { id: articleId } });
    if (article && article.stock <= 0 && article.available) {
      await tx.article.update({
        where: { id: articleId },
        data: { available: false },
      });
    }
  }
}
