async function seedCategoryArticles(prisma) {
  console.log('📂 Seedeando categorias de articulos...');

  const data = [
    { name: 'Artesania', color: 'primary' },
    { name: 'Restauracion', color: 'warning' },
  ];

  for (const categoria of data) {
    await prisma.categoryArticle.upsert({
      where: { name: categoria.name },
      update: {
        color: categoria.color,
      },
      create: categoria,
    });
  }

  const categorias = await prisma.categoryArticle.findMany();

  console.log(`✅ Categorias de articulos insertadas: ${categorias.length}`);
  return categorias;
}

module.exports = {
  seedCategoryArticles,
};