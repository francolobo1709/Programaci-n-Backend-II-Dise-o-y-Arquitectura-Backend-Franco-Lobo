import jwt from 'jsonwebtoken';
import { config } from '../config/env.config.js';

export const generateToken = (payload) => {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
};
