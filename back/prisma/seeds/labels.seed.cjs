async function seedLabels(prisma) {
  console.log('🏷️ Seedeando etiquetas...');

  const data = [
    { name: 'Hecho a mano', color: 'success' },
    { name: 'Personalizable', color: 'info' },
    { name: 'Ideal regalo', color: 'danger' },
    { name: 'Madera natural', color: 'warning' },
    { name: 'Decoracion', color: 'primary' },
    { name: 'Solidario', color: 'success' },
    { name: 'Reciclado', color: 'secondary' },
    { name: 'Vintage', color: 'dark' },
  ];

  for (const label of data) {
    await prisma.label.upsert({
      where: { name: label.name },
      update: {
        color: label.color,
      },
      create: label,
    });
  }

  const labels = await prisma.label.findMany();

  console.log(`✅ Etiquetas insertadas: ${labels.length}`);
  return labels;
}

module.exports = {
  seedLabels,
};