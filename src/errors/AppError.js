export class AppError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.details = details;
    }
}

export class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, details);
    }
}

export class NotFoundError extends AppError {
    constructor(id, resource = 'Recurso') {
        super(`${resource} con id ${id} no encontrado.`, 404);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'No autenticado', statusCode = 401) {
        super(message, statusCode);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'No tienes permisos para realizar esta acción') {
        super(message, 403);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflicto') {
        super(message, 409);
    }
}
