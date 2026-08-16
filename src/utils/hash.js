import bcrypt from 'bcrypt';

/**
 * Hashea una contraseña usando bcrypt con 10 rondas de salt.
 * @param {string} password - La contraseña en texto plano.
 * @returns {string} La contraseña hasheada.
 */
export const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

/**
 * Compara una contraseña en texto plano con su hash.
 * @param {string} password - La contraseña en texto plano.
 * @param {string} hash - El hash de la contraseña guardado en la base de datos.
 * @returns {boolean} True si coinciden, False en caso contrario.
 */
export const isValidPassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};
