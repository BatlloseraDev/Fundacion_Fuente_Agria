function buscarPorNombre(items, name) {
  return items.find((item) => item.name === name);
}

async function seedArticles(prisma, users, categorias, etiquetas) {
  console.log('🛍️ Seedeando articulos...');

  const userId =
    Array.isArray(users) && users.length > 0
      ? users[0].id
      : (await prisma.user.findFirst())?.id;

  if (!userId) {
    throw new Error('No hay usuarios disponibles para asignar como creador de articulos');
  }

  const artesania = buscarPorNombre(categorias, 'Artesania');
  const restauracion = buscarPorNombre(categorias, 'Restauracion');

  if (!artesania || !restauracion) {
    throw new Error('No se encontraron las categorias necesarias');
  }

  const labelsMap = {
    hechoAMano: buscarPorNombre(etiquetas, 'Hecho a mano'),
    personalizable: buscarPorNombre(etiquetas, 'Personalizable'),
    idealRegalo: buscarPorNombre(etiquetas, 'Ideal regalo'),
    maderaNatural: buscarPorNombre(etiquetas, 'Madera natural'),
    decoracion: buscarPorNombre(etiquetas, 'Decoracion'),
    solidario: buscarPorNombre(etiquetas, 'Solidario'),
    reciclado: buscarPorNombre(etiquetas, 'Reciclado'),
    vintage: buscarPorNombre(etiquetas, 'Vintage'),
  };

  const articlesData = [
    {
      name: 'Roca Decorativa Artesanal',
      description: 'Piedra natural seleccionada a mano, decorada con motivos pintados a mano.',
      longDescription:
        'Cada roca es unica: seleccionamos a mano piedras de rio de tamano mediano y las decoramos con pintura acrilica resistente al agua. Los motivos incluyen flores, paisajes y patrones abstractos. Son perfectas como elemento decorativo en el hogar, jardin o como detalle original para regalar.',
      price: 8.0,
      stock: 8,
      available: true,
      image: '/imgs/img-stock-catalogo-1.jpg',
      categorias: [artesania.id],
      etiquetas: [
        labelsMap.hechoAMano?.id,
        labelsMap.personalizable?.id,
        labelsMap.idealRegalo?.id,
      ].filter(Boolean),
    },
    {
      name: 'Caja de Madera Personalizada',
      description: 'Caja de madera natural grabada con nombre o mensaje.',
      longDescription:
        'Fabricada en madera maciza y lijada a mano, esta caja puede personalizarse con nombres, fechas o frases especiales mediante grabado laser o pintura artesanal. Ideal para guardar recuerdos, joyas o pequenos objetos personales.',
      price: 18.0,
      stock: 5,
      available: true,
      image: '/imgs/img-stock-catalogo-2.jpg',
      categorias: [artesania.id],
      etiquetas: [
        labelsMap.personalizable?.id,
        labelsMap.maderaNatural?.id,
        labelsMap.hechoAMano?.id,
      ].filter(Boolean),
    },
    {
      name: 'Marco de Fotos Rustico',
      description: 'Marco artesanal en madera reciclada.',
      longDescription:
        'Elaborado con madera reciclada tratada y restaurada, este marco combina estilo rustico y sostenibilidad. Se puede colgar en pared o colocar sobre mesa. Cada unidad presenta vetas y tonalidades distintas que realzan su caracter unico.',
      price: 12.5,
      stock: 6,
      available: true,
      image: '/imgs/img-stock-catalogo-3.jpg',
      categorias: [artesania.id],
      etiquetas: [
        labelsMap.reciclado?.id,
        labelsMap.decoracion?.id,
        labelsMap.maderaNatural?.id,
      ].filter(Boolean),
    },
    {
      name: 'Pulsera Tejida Solidaria',
      description: 'Pulsera artesanal tejida con hilo de algodon.',
      longDescription:
        'Pulsera tejida a mano con hilo de algodon resistente y cierre ajustable. Disponible en varios colores. Cada compra contribuye directamente a los proyectos sociales de la fundacion.',
      price: 5.0,
      stock: 12,
      available: true,
      image: '/imgs/img-stock-catalogo-1.jpg',
      categorias: [artesania.id],
      etiquetas: [
        labelsMap.solidario?.id,
        labelsMap.hechoAMano?.id,
      ].filter(Boolean),
    },
    {
      name: 'Lampara de Mesa Restaurada',
      description: 'Lampara antigua restaurada y personalizada.',
      longDescription:
        'Lampara recuperada y restaurada cuidadosamente en nuestro taller. Se revisa la instalacion electrica y se renueva la pintura o acabado exterior. Cada pieza combina funcionalidad y diseno vintage.',
      price: 35.0,
      stock: 3,
      available: true,
      image: '/imgs/img-stock-catalogo-2.jpg',
      categorias: [restauracion.id],
      etiquetas: [
        labelsMap.vintage?.id,
        labelsMap.decoracion?.id,
        labelsMap.personalizable?.id,
      ].filter(Boolean),
    },
    {
      name: 'Silla Restaurada Vintage',
      description: 'Silla clasica restaurada y tapizada.',
      longDescription:
        'Silla de madera maciza restaurada y retapizada con tela resistente. Se refuerza la estructura y se renueva el acabado para garantizar durabilidad y estilo.',
      price: 45.0,
      stock: 0,
      available: false,
      image: '/imgs/img-stock-catalogo-3.jpg',
      categorias: [restauracion.id],
      etiquetas: [
        labelsMap.vintage?.id,
        labelsMap.decoracion?.id,
      ].filter(Boolean),
    },
  ];

  for (const articleData of articlesData) {
    const article = await prisma.article.upsert({
      where: { name: articleData.name },
      update: {
        description: articleData.description,
        longDescription: articleData.longDescription,
        price: articleData.price,
        stock: articleData.stock,
        available: articleData.available,
        image: articleData.image,
        userId,
      },
      create: {
        name: articleData.name,
        description: articleData.description,
        longDescription: articleData.longDescription,
        price: articleData.price,
        stock: articleData.stock,
        available: articleData.available,
        image: articleData.image,
        userId,
      },
    });

    for (const categoriaId of articleData.categorias) {
      await prisma.articleCat.upsert({
        where: {
          articleId_categoryArticleId: {
            articleId: article.id,
            categoryArticleId: categoriaId,
          },
        },
        update: {},
        create: {
          articleId: article.id,
          categoryArticleId: categoriaId,
        },
      });
    }

    for (const labelId of articleData.etiquetas) {
      await prisma.articleLabel.upsert({
        where: {
          articleId_labelId: {
            articleId: article.id,
            labelId,
          },
        },
        update: {},
        create: {
          articleId: article.id,
          labelId,
        },
      });
    }
  }

  const articulos = await prisma.article.findMany({
    include: {
      categories: true,
      labels: true,
    },
  });

  console.log(`✅ Articulos insertados: ${articulos.length}`);
  return articulos;
}

module.exports = {
  seedArticles,
};
