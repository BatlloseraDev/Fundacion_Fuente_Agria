require('dotenv/config');
//import { PrismaClient } from '../../generated/prisma/client';
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { seedInicio } = require('./seeds/inicio.seed.cjs');

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL no esta definida');
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(url),
});

async function main() {
  console.log('🚀 Iniciando seed con Prisma 7 + Adapter...');

  const { seedRoles } = require('./seeds/roles.seed.cjs');
  const { seedUsers } = require('./seeds/users.seed.cjs');
  const { seedCategoryArticles } = require('./seeds/category-articles.seed.cjs');
  const { seedLabels } = require('./seeds/labels.seed.cjs');
  const { seedArticles } = require('./seeds/articles.seed.cjs');

  const roles = await seedRoles(prisma);
  const users = await seedUsers(prisma, roles);

  const categorias = await seedCategoryArticles(prisma);
  const etiquetas = await seedLabels(prisma);
  await seedArticles(prisma, users, categorias, etiquetas);

  await seedInicio(prisma);

  console.log('🏁 Seed completado correctamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });