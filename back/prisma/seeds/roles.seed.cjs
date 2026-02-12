
async function seedRoles(prisma) {
  console.log('🌱 Seeding roles...');

  // Usamos upsert para no duplicar si ya existen
  const admin = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const user = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  });

  console.log(`✅ Roles listos: ${admin.name}, ${user.name}`);
  return { admin, user };
}

module.exports = { seedRoles };