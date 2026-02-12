// back/prisma/seed.cjs
require('dotenv/config');
const { PrismaClient } = require('../generated/prisma2/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { pg } = require('pg'); 

const { Pool } = require('pg');

const { seedRoles } = require('./seeds/roles.seed.cjs');
const { seedUsers } = require('./seeds/users.seed.cjs');

// Configuración de conexión explícita como pide el README
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Iniciando seed con Prisma 7 + Adapter...');
  
  
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