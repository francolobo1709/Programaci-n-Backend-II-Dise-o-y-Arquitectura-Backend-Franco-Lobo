export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        // req.user debe estar poblado por el middleware de autenticación previo
        if (!req.user || !req.user.role) {
            return res.status(401).json({ status: 'error', message: 'No autenticado' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ status: 'error', message: 'No tenés permisos para realizar esta acción' });
        }

        next();
    };
};
