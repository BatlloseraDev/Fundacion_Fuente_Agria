


async function seedUsers(prisma, roles) {
  console.log('🌱 Seeding users...');

  const email = 'admin@fuenteagria.com';
  
  // Verificamos si existe
  const existingUser = await prisma.user.findUnique({ 
    where: { email } 
  });

  if (!existingUser) {
    
    
   
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Admin',
        subname: 'Sistema',
        password: "admin",
        address: "Calle Falsa 123",
        dni: "01234567U",
        roles: {
          create: [
            { role: { connect: { id: roles.admin.id } } }
          ]
        }   
      },
      include: { roles: true } // Para ver qué roles se crearon en el log
    });
    
    console.log(`✅ Usuario Admin creado: ${user.email} con rol ADMIN`);
  } else {
    console.log('ℹ️ El usuario Admin ya existe. Saltando...');
  }
}

module.exports = { seedUsers };