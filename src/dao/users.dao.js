import { UserModel } from '../models/User.model.js';

export class UsersDao {
    /**
     * Crea un nuevo usuario en la base de datos.
     * @param {Object} userData - Datos del usuario a crear.
     * @returns {Object} El documento del usuario creado.
     */
    static async create(userData) {
        const user = new UserModel(userData);
        return await user.save();
    }

    /**
     * Busca un usuario por su email.
     * @param {string} email - Email a buscar.
     * @returns {Object|null} El documento del usuario o null.
     */
    static async findByEmail(email) {
        return await UserModel.findOne({ email });
    }
}
