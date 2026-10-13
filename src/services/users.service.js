import { UsersRepository } from '../repositories/users.repository.js';
import { NotFoundError } from '../errors/AppError.js';

class UsersService {
    async getAllUsers() {
        return await UsersRepository.findAll();
    }

    async getUserById(id) {
        const user = await UsersRepository.findById(id);
        if (!user) {
            throw new NotFoundError(id, 'Usuario');
        }
        return user;
    }

    async getUserByEmail(email) {
        return await UsersRepository.findByEmail(email);
    }
}

export const usersService = new UsersService();
