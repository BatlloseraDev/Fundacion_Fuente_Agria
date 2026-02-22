import type { Actividad } from '../types/actividad.interface';

export const actividadesMock: Actividad[] = [
    {
        id: '1',
        title: 'Taller de Cerámica y Pintura',
        description: 'Nuestros usuarios disfrutaron de una jornada creativa moldeando arcilla y expresando sus emociones a través de la pintura. Una actividad diseñada para mejorar la motricidad fina y fomentar la imaginación en un ambiente relajado y colaborativo.',
        date: '15 Oct, 2025',
        category: 'Taller Creativo',
        imageUrl: '/imgs/img-stock-2.jpg',
        colorClass: 'primary'
    },
    {
        id: '2',
        title: 'Senderismo en el Valle de Alcudia',
        description: 'Aprovechando el buen tiempo, organizamos una ruta de senderismo adaptado. Fue un día fantástico de convivencia con la naturaleza, donde aprendimos sobre la flora local y compartimos un almuerzo saludable al aire libre todos juntos.',
        date: '22 Sep, 2025',
        category: 'Excursión',
        imageUrl: '/imgs/img-stock-1.jpg',
        colorClass: 'success'
    },
    {
        id: '3',
        title: 'Mercadillo Solidario Anual',
        description: 'Gracias a todos los vecinos que se acercaron a nuestro puesto en la plaza. Logramos vender gran parte de las artesanías fabricadas en nuestros talleres ocupacionales. La recaudación irá destinada a la compra de nuevo material deportivo.',
        date: '10 Sep, 2025',
        category: 'Evento',
        imageUrl: '/imgs/img-stock-3.jpg',
        colorClass: 'warning'
    },
        {
        id: '4',
        title: 'Mercadillo A Anual',
        description: 'Gracias a todos los vecinos que se acercaron a nuestro puesto en la plaza. Logramos vender gran parte de las artesanías fabricadas en nuestros talleres ocupacionales. La recaudación irá destinada a la compra de nuevo material deportivo.',
        date: '10 Sep, 2025',
        category: 'Evento',
        imageUrl: '/imgs/img-stock-2.jpg',
        colorClass: 'warning'
    }
];