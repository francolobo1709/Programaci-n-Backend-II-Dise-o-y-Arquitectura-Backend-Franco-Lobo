import { z } from 'zod';

export const registerSchema = z.object({
    first_name: z.string({
        required_error: 'first_name es obligatorio',
        invalid_type_error: 'first_name debe ser un texto',
    }).min(2, 'first_name debe tener al menos 2 caracteres'),

    last_name: z.string({
        required_error: 'last_name es obligatorio',
        invalid_type_error: 'last_name debe ser un texto',
    }).min(2, 'last_name debe tener al menos 2 caracteres'),

    email: z.string({
        required_error: 'email es obligatorio',
        invalid_type_error: 'email debe ser un texto',
    }).email('Formato de email inválido'),

    password: z.string({
        required_error: 'password es obligatorio',
        invalid_type_error: 'password debe ser un texto',
    }).min(6, 'password debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
    email: z.string({
        required_error: 'email es obligatorio',
        invalid_type_error: 'email debe ser un texto',
    }).email('Formato de email inválido'),

    password: z.string({
        required_error: 'password es obligatorio',
        invalid_type_error: 'password debe ser un texto',
    }),
});
