export interface Actividad {
    id: string;
    title: string;
    description: string;
    date: string;
    category: string;
    imageUrl: string;
    colorClass: 'primary' | 'success' | 'warning' | string;
}