// back/prisma/seed.cjs
require('dotenv/config');
const { PrismaClient } = require('../generated/prisma2/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')



const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || 'mysql',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || process.env.MYSQL_USER,
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.DB_DATABASE || process.env.MYSQL_DATABASE
});


const prisma = new PrismaClient({ adapter });

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