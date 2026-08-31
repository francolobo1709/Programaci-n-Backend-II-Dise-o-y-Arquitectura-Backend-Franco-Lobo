import { UsersRepository } from '../repositories/users.repository.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { AppError } from '../errors/AppError.js';

export class SessionsService {
    static async registerUser(userData) {
        // 1. Normalizar email
        const normalizedEmail = userData.email.trim().toLowerCase();

        // 2. Verificar si el email ya existe
        const existingUser = await UsersRepository.findByEmail(normalizedEmail);
        if (existingUser) {
            throw new AppError('El email ya está registrado', 409);
        }

        // 3. Hashear password
        const hashedPassword = createHash(userData.password);

        // 4. Asegurar que no pasen el rol por body, forzamos a user
        const newUserData = {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: normalizedEmail,
            password: hashedPassword,
            role: 'user' // Ignoramos lo que venga en el body
        };

        // 5. Crear el usuario
        const createdUser = await UsersRepository.create(newUserData);

        // 6. Formatear la respuesta sin el password
        return {
            id: createdUser._id,
            first_name: createdUser.first_name,
            last_name: createdUser.last_name,
            email: createdUser.email,
            role: createdUser.role
        };
    }

    static async loginUser(email, password) {
        const normalizedEmail = email.trim().toLowerCase();

        // Buscar al usuario
        const user = await UsersRepository.findByEmail(normalizedEmail);
        if (!user) {
            throw new AppError('Credenciales inválidas', 401);
        }

        // Validar contraseña
        const isMatch = isValidPassword(password, user.password);
        if (!isMatch) {
            throw new AppError('Credenciales inválidas', 401);
        }

        // Devolver payload limpio
        return {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role
        };
    }
}
