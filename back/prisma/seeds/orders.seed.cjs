
async function seedOrders(prisma, users) {
    console.log('📦 Seedeando encargos (orders) y configuración de página...');

    const userId = Array.isArray(users) && users.length > 0 ? users[0].id : (await prisma.user.findFirst())?.id;

    if (!userId) {
        throw new Error('No hay usuarios disponibles para asignar a los encargos.')
    }


    const ordersData = [
        {
            title: "Taza personalizada",
            text: "Diseño y estampación de taza personalizada con motivos al gusto.",
            imageAfter: "imgs/taza.jpg",
            price: 9.90,
            active: true,
            timeInitial: new Date(),
            timeFinal: new Date(new Date().setDate(new Date().getDate() + 5)),
            userId
        },
        {
            title: "Reparación de silla de madera",
            text: "Restauración completa, lijado, tratamiento de la madera y barnizado.",
            imageAfter: "imgs/silla.jpg",
            price: 35.00,
            active: true,
            timeInitial: new Date(),
            timeFinal: new Date(new Date().setDate(new Date().getDate() + 10)),
            userId
        },
        {
            title: "Plato decorativo artesanal",
            text: "Creación y pintado a mano de plato de cerámica tradicional.",
            imageAfter: "imgs/decorado.jpg",
            price: 18.00,
            active: true,
            timeInitial: new Date(),
            timeFinal: new Date(new Date().setDate(new Date().getDate() + 7)),
            userId
        },
        {
            title: "Bolsa de tela bordada",
            text: "Bolsa de algodón 100% ecológico con bordado a mano personalizado.",
            imageAfter: "imgs/bordada.jpg",
            price: 22.00,
            active: true,
            timeInitial: new Date(),
            timeFinal: new Date(new Date().setDate(new Date().getDate() + 12)),
            userId
        }
    ];

    const carruselData = [
        {
            title: "Tazas personalizadas",
            text: "Tazas personalizadas con el logo de tu empresa o evento especial.",
            imageAfter: "/imgs/tazas-personalizadas.jpg",
            price: 10.00,
            active: true,
            userId
        },
        {
            title: "Reparacion de muebles de madera",
            text: "Le damos una segunda vida a tus muebles antiguos con acabados profesionales.",
            imageAfter: "/imgs/reparacion.jpg",
            price: 50.00,
            active: true,
            userId
        },
        {
            title: "Bordado y textiles",
            text: "Trabajos de bordado artesanal en distintas prendas y textiles.",
            imageAfter: "imgs/bordados.jpg",
            price: 15.00,
            active: true,
            userId
        },
        {
            title: "Detalles artesanales",
            text: "Pequeños detalles artesanales, perfectos para regalar como recuerdo.",
            imageAfter: "imgs/detalles.jpg",
            price: 12.00,
            active: true,
            userId
        }
    ];


    async function insertAndGetIds(dataArray) {
        const created = [];
        for (const data of dataArray) {
            try {
                let existing = await prisma.order.findFirst({ where: { title: data.title } });
                if (!existing) {
                    existing = await prisma.order.create({ data });
                } else {
                    existing = await prisma.order.update({ where: { id: existing.id }, data });
                }
                if (existing) created.push(existing);
            } catch (error) {
                console.error(`❌ Error guardando '${data.title}':`, error.message);
            }
        }
        return created;
    }

    const createdPopulares = await insertAndGetIds(ordersData);
    const jsonPopulares = createdPopulares.map(order => ({ id: order.id }));

    if (jsonPopulares.length > 0) {
        const existingPagePop = await prisma.page.findFirst({ where: { stage: 'orders_popular' } });
        if (existingPagePop) {
            await prisma.page.update({ where: { id: existingPagePop.id }, data: { contentJson: jsonPopulares } });
        } else {
            await prisma.page.create({ data: { stage: 'orders_popular', contentJson: jsonPopulares } });
        }
    }

    const createdCarrusel = await insertAndGetIds(carruselData);
    const jsonCarrusel = createdCarrusel.map(order => ({ id: order.id }));

    if (jsonCarrusel.length > 0) {
        const existingPageCar = await prisma.page.findFirst({ where: { stage: 'orders_carousel' } });
        if (existingPageCar) {
            await prisma.page.update({ where: { id: existingPageCar.id }, data: { contentJson: jsonCarrusel } });
        } else {
            await prisma.page.create({ data: { stage: 'orders_carousel', contentJson: jsonCarrusel } });
        }
    }


    console.log(`✅ Configurados en Page: ${createdPopulares.length} populares y ${createdCarrusel.length} para carrusel.`);
    return { createdPopulares, createdCarrusel };
}

module.exports = { seedOrders };