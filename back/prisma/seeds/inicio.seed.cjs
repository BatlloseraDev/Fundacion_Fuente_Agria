async function seedInicio(prisma) {
    console.log('📦 Seedeando Datos de la página de Inicio...');

    const actionAreasData = [
      { 
        id: 'grid-1', 
        title: 'Tienda', 
        description: 'Productos creados a mano hechos con pasión y cariño por nuestros integrantes.', 
        icon: 'bi-house-heart', 
        themeColor: 'primary', 
        linkText: 'Ver catálogo' 
      },
      { 
        id: 'grid-2', 
        title: 'Encargos', 
        description: 'Realizamos trabajos personalizados para eventos, empresas o regalos especiales.', 
        icon: 'bi-briefcase', 
        themeColor: 'warning', 
        linkText: 'Saber más' 
      },
      { 
        id: 'grid-3', 
        title: 'Actividades', 
        description: 'Talleres y eventos grupales enfocados en la integración y el desarrollo personal.', 
        icon: 'bi-people', 
        themeColor: 'success', 
        linkText: 'Saber más' 
      }
    ];

    const existing = await prisma.page.findFirst({ 
        where: { stage: 'action_areas' } 
    });

    if (existing) {
        await prisma.page.update({ 
            where: { id: existing.id }, 
            data: { contentJson: actionAreasData } 
        });
    } else {
        await prisma.page.create({ 
            data: { stage: 'action_areas', contentJson: actionAreasData } 
        });
    }

    const comentariosData = [
      {
        id: 'comentario-1',
        texto: '"Encargamos regalos personalizados y fueron un éxito. Trato cercano y muy cuidado."',
        etiqueta: 'Artesanías',
        autor: 'Marta G.'
      },
      {
        id: 'comentario-2',
        texto: '"Mi aparador de madera volvió a brillar. Se nota el mimo en cada paso."',
        etiqueta: 'Restauración',
        autor: 'Carlos R.'
      },
      {
        id: 'comentario-3',
        texto: '"Gran iniciativa social. El proceso de encargo es claro y la comunicación, rápida."',
        etiqueta: 'Proyecto social',
        autor: 'Elena P.'
      }
    ];

    const existingComentarios = await prisma.page.findFirst({ 
        where: { stage: 'inicio_comentarios' } 
    });

    if (existingComentarios) {
        await prisma.page.update({ 
            where: { id: existingComentarios.id }, 
            data: { contentJson: comentariosData } 
        });
    } else {
        await prisma.page.create({ 
            data: { stage: 'inicio_comentarios', contentJson: comentariosData } 
        });
    }

    console.log('✅ Datos configurados en Page.');
}

module.exports = { seedInicio };