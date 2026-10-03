export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name   = this.constructor.name;
        this.statusCode = statusCode;
    }
}

export class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(id, resource = 'Recurso') {
        super(`${resource} con id ${id} no encontrado.`, 404);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 403);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflicto') {
        super(message, 409);
    }
}
