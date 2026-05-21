// back/prisma/seeds/users.seed.cjs
const bcrypt = require('bcrypt');

async function seedUsers(prisma, roles) {
  console.log('🌱 Seeding users...');

  if (!roles || !roles.ADMIN) {
    throw new Error('roles.ADMIN no existe. Revisa seedRoles.');
  }

  const email = 'admin@fuenteagria.com';
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: adminPasswordHash },
    create: {
      email,
      password: adminPasswordHash,
      name: 'Admin',
      subname: 'Sistema',
      address: 'Calle Falsa 123',
      dni: '01234567U',
      roles: {
        create: [{ role: { connect: { id: roles.ADMIN.id } } }],
      },
    },
    include: { roles: { include: { role: true } } },
  });

  console.log(`✅ Usuario Admin creado/actualizado: ${user.email}`);
}

module.exports = { seedUsers };