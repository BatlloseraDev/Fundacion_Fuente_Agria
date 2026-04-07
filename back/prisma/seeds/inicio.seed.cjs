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

    const novedadesData = [
      {
        id: 'novedades-1', 
        imagenUrl: '/imgs/novedades-1.jpg', 
        etiqueta: "Eventos",
        fecha: "01/02/2026",
        titulo: "Taller abierto: iniciación a la cerámica",
        descripcion: "Sesión práctica para conocer técnicas básicas y apoyar la inclusión a través del aprendizaje.",
        enlace: "#"
      },
      {
        id: 'novedades-2',
        imagenUrl: '/imgs/novedades-2.jpg', 
        etiqueta: "Artesanías",
        fecha: "24/01/2026",
        titulo: "Nueva línea de productos en madera reciclada",
        descripcion: "Pequeñas piezas decorativas creadas con restos de madera recuperada y acabados naturales.",
        enlace: "#"
      },
      {
        id: 'novedades-3',
        imagenUrl: '/imgs/novedades-3.jpg', 
        etiqueta: "Restauración",
        fecha: "18/01/2026",
        titulo: "Restauración solidaria: antes y después (enero)",
        descripcion: "Hemos finalizado 6 restauraciones con barnices al agua y reparaciones estructurales.",
        enlace: "#"
      },
      {
        id: 'novedades-4',
        imagenUrl: '/imgs/novedades-4.jpg', 
        etiqueta: "Voluntariado",
        fecha: "10/01/2026",
        titulo: "Buscamos voluntariado para recogida y logística",
        descripcion: "Si puedes ayudar un par de horas a la semana, tu apoyo marca la diferencia.",
        enlace: "#"
      },
      {
        id: 'novedades-5',
        imagenUrl: '/imgs/novedades-5.jpg', 
        etiqueta: "Proyecto social",
        fecha: "20/12/2025",
        titulo: "Proyecto social: formación en oficios artesanos",
        descripcion: "Acompañamos a personas en itinerarios formativos que conectan habilidades con empleo.",
        enlace: "#"
      },
      {
        id: 'novedades-6',
        imagenUrl: '/imgs/novedades-6.jpg',
        etiqueta: "Artesanías",
        fecha: "05/12/2025",
        titulo: 'Campaña "Regala con impacto" (edición invierno)',
        descripcion: "Encargos personalizados para empresas y particulares con empaquetado sostenible.",
        enlace: "#"
      }
    ];

    const existingNovedades = await prisma.page.findFirst({ 
        where: { stage: 'inicio_novedades' } 
    });

    if (existingNovedades) {
        await prisma.page.update({ 
            where: { id: existingNovedades.id }, 
            data: { contentJson: novedadesData } 
        });
    } else {
        await prisma.page.create({ 
            data: { stage: 'inicio_novedades', contentJson: novedadesData } 
        });
    }

    const carouselData = [
      { 
        id: 'slide-1', 
        imagenUrl: '/imgs/img-stock-4.jpg', 
        titulo: 'Título de la Actividad 1', 
        descripcion: 'Descripción de la actividad' 
      },
      { 
        id: 'slide-2', 
        imagenUrl: '/imgs/img-stock-5.jpg', 
        titulo: 'Título de la Actividad 2' 
      },
      { 
        id: 'slide-3', 
        imagenUrl: '/imgs/img-stock-6.jpg' 
      }
    ];

    const existingCarousel = await prisma.page.findFirst({ 
        where: { stage: 'inicio_carousel' } 
    });

    if (existingCarousel) {
        await prisma.page.update({ 
            where: { id: existingCarousel.id }, 
            data: { contentJson: carouselData } 
        });
    } else {
        await prisma.page.create({ 
            data: { stage: 'inicio_carousel', contentJson: carouselData } 
        });
    }

    const heroData = {
      badge: 'BIENVENIDOS AL CATÁLOGO DE LA FUNDACIÓN',
      titulo: 'Construyendo un futuro lleno de posibilidades.',
      descripcion: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsam dolor cumque voluptatibus hic distinctio, obcaecati ab ratione vero repellendus. Explicabo quos adipisci eos dolores est.'
    };

    const existingHero = await prisma.page.findFirst({ 
      where: { stage: 'inicio_hero' } 
    });

    if (existingHero) {
        await prisma.page.update({ 
          where: { id: existingHero.id }, 
          data: { contentJson: heroData } });
    } else {
        await prisma.page.create({ 
          data: { stage: 'inicio_hero', contentJson: heroData } });
    }

    console.log('✅ Datos configurados en Page.');
}

module.exports = { seedInicio };