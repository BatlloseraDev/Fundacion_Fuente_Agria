async function seedInicio(prisma) {
    console.log('📦 Seedeando Áreas de Acción de la página de Inicio...');

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

    console.log('✅ Áreas de Acción configuradas en Page.');
}

module.exports = { seedInicio };