// back/prisma/seeds/roles.seed.cjs
async function seedRoles(prisma) {
  console.log('🌱 Seeding roles...');

  const roleNames = ['ADMIN', 'USER', 'EDITOR'];

  const roles = {};

  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    roles[name] = role;
  }

  console.log(`✅ Roles listos: ${Object.keys(roles).join(', ')}`);
  return roles; // { ADMIN: {...}, USER: {...}, EDITOR: {...} }
}

module.exports = { seedRoles };