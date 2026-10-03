import { z } from 'zod';

export const createEventSchema = z.object({
    title:       z.string({ required_error: 'El campo title es obligatorio.' }).min(1, 'El título no puede estar vacío.'),
    description: z.string({ required_error: 'El campo description es obligatorio.' }).min(1, 'La descripción no puede estar vacía.'),
    category:    z.string({ required_error: 'El campo category es obligatorio.' }).min(1, 'La categoría no puede estar vacía.'),
    date:        z.string({ required_error: 'El campo date es obligatorio.' }).datetime({ message: 'Debe ser una fecha ISO válida.' }),
    location:    z.string({ required_error: 'El campo location es obligatorio.' }).min(1, 'La ubicación no puede estar vacía.'),
    capacity:    z.number({ required_error: 'El campo capacity es obligatorio.', invalid_type_error: 'capacity debe ser un número.' }).int('capacity debe ser un entero.').positive('capacity debe ser mayor a 0.'),
    price:       z.number({ required_error: 'El campo price es obligatorio.', invalid_type_error: 'price debe ser un número.' }).min(0, 'price no puede ser negativo.'),
});

export const updateEventSchema = z
    .object({
        title:       z.string().min(1, 'El título no puede estar vacío.').optional(),
        description: z.string().min(1, 'La descripción no puede estar vacía.').optional(),
        category:    z.string().min(1, 'La categoría no puede estar vacía.').optional(),
        date:        z.string().datetime({ message: 'Debe ser una fecha ISO válida.' }).optional(),
        location:    z.string().min(1, 'La ubicación no puede estar vacía.').optional(),
        capacity:    z.number({ invalid_type_error: 'capacity debe ser un número.' }).int().positive('capacity debe ser mayor a 0.').optional(),
        price:       z.number({ invalid_type_error: 'price debe ser un número.' }).min(0, 'price no puede ser negativo.').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'Debés enviar al menos un campo para actualizar.',
    });

export const updateEventStatusSchema = z.object({
    status: z.enum(['draft', 'published', 'cancelled', 'finished'], {
        required_error: 'El status es obligatorio',
        invalid_type_error: 'Status inválido'
    })
});
