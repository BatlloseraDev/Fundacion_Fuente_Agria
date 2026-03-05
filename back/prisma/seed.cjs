// back/prisma/seed.cjs
require('dotenv/config');
//import { PrismaClient } from '../../generated/prisma/client';
const { PrismaClient } = require('../generated/prisma');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

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

  const roles = await seedRoles(prisma);
  await seedUsers(prisma, roles);

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