async function seedActividades(prisma) {
  console.log('📅 Seedeando actividades...');

  const categoria = await prisma.categoriaActividad.upsert({
    where: { name: 'Taller Creativo' },
    update: { deletedAt: null },
    create: { name: 'Taller Creativo', color: 'primary' },
  });

  await prisma.actividad.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Taller de Cerámica y Pintura',
      description:
        'Nuestros usuarios disfrutaron de una jornada creativa moldeando arcilla y expresando sus emociones a través de la pintura.',
      date: new Date('2025-10-15'),
      categoryId: categoria.id,
      contentJson: [
        {
          type: 'text',
          content:
            'El taller comenzó a las 10 de la mañana con una introducción a las técnicas básicas de modelado en arcilla. Los participantes pudieron elegir entre diferentes formas y diseños, guiados por nuestra monitora especializada.',
        },
        {
          type: 'text',
          content:
            'Durante la tarde, la sesión de pintura permitió a cada persona expresar su creatividad libremente. Se utilizaron acuarelas, acrílicos y técnicas mixtas sobre lienzo.',
        },
        {
          type: 'text',
          content:
            'El resultado fue una exposición improvisada al final del día que emocionó tanto a participantes como a sus familias. Una jornada memorable que repetiremos el próximo trimestre.',
        },
      ],
    },
  });

  console.log('✅ Actividad de ejemplo insertada.');
}

module.exports = { seedActividades };
