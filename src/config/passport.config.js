import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { UsersRepository } from '../repositories/users.repository.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import { config } from './env.config.js';

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies.currentUser;
    }
    return token;
};

export const initializePassport = () => {
    // ── ESTRATEGIA DE REGISTRO ──────────────────────────────────────────────────
    passport.use(
        'register',
        new LocalStrategy(
            { passReqToCallback: true, usernameField: 'email' },
            async (req, username, password, done) => {
                try {
                    const userData = req.body;
                    const normalizedEmail = username.trim().toLowerCase();

                    // Verificar unicidad
                    const existingUser = await UsersRepository.findByEmail(normalizedEmail);
                    if (existingUser) {
                        return done(null, false, { message: 'El email ya está registrado' });
                    }

                    // Hashear password y forzar rol 'user'
                    const newUserData = {
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        email: normalizedEmail,
                        password: createHash(password),
                        role: 'user' // Forzar rol independientemente de lo enviado
                    };

                    const createdUser = await UsersRepository.create(newUserData);

                    // Devolver el payload limpio (req.user)
                    const payload = {
                        id: createdUser._id,
                        first_name: createdUser.first_name,
                        last_name: createdUser.last_name,
                        email: createdUser.email,
                        role: createdUser.role
                    };

                    return done(null, payload);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    // ── ESTRATEGIA DE LOGIN ─────────────────────────────────────────────────────
    passport.use(
        'login',
        new LocalStrategy(
            { usernameField: 'email' },
            async (username, password, done) => {
                try {
                    const normalizedEmail = username.trim().toLowerCase();

                    const user = await UsersRepository.findByEmail(normalizedEmail);
                    if (!user) {
                        return done(null, false, { message: 'Credenciales inválidas' });
                    }

                    const isMatch = isValidPassword(password, user.password);
                    if (!isMatch) {
                        return done(null, false, { message: 'Credenciales inválidas' });
                    }

                    const payload = {
                        id: user._id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        role: user.role
                    };

                    return done(null, payload);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    // ── ESTRATEGIA CURRENT (JWT) ────────────────────────────────────────────────
    passport.use(
        'current',
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
                secretOrKey: config.jwtSecret
            },
            async (jwtPayload, done) => {
                try {
                    // Dejamos pasar el payload decodificado como req.user
                    return done(null, jwtPayload);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );
};
