import { UsersDao } from '../dao/users.dao.js';
import { AppError } from '../errors/AppError.js';

export class UsersRepository {
    static async create(userData) {
        try {
            return await UsersDao.create(userData);
        } catch (error) {
            throw new AppError('Error al crear usuario en la base de datos', 500, error.message);
        }
    }

    static async findByEmail(email) {
        try {
            return await UsersDao.findByEmail(email);
        } catch (error) {
            throw new AppError('Error al buscar usuario en la base de datos', 500, error.message);
        }
    }
}
