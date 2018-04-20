/* Resolver errors.
 */
import {
    BAD_REQUEST,
    FORBIDDEN,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    UNPROCESSABLE_ENTITY,
    GATEWAY_TIMEOUT,
} from 'http-status-codes';


export class ResolverError extends Error {
    constructor(message, code) {
        super(message);
        Error.captureStackTrace(this, this.constructor);

        this.code = code;
        this.extensions = {
            code: `HTTP-${this.code}`,
        };
    }
}

export class BadRequest extends ResolverError {
    constructor(message = 'Bad Request') {
        super(message, BAD_REQUEST);
    }
}

export class Forbidden extends ResolverError {
    constructor(message = 'Forbidden') {
        super(message, FORBIDDEN);
    }
}

export class InternalServerError extends ResolverError {
    constructor(message = 'Internal Server Error') {
        super(message, INTERNAL_SERVER_ERROR);
    }
}

export class NotFound extends ResolverError {
    constructor(message = 'Not Found') {
        super(message, NOT_FOUND);
    }
}

export class UnprocessableEntity extends ResolverError {
    constructor(message = 'Unprocessable Entity') {
        super(message, UNPROCESSABLE_ENTITY);
    }
}


export class TooManyResults extends ResolverError {
    constructor(message = 'Too Many Results') {
        super(message, INTERNAL_SERVER_ERROR);
    }
}


export class NoResults extends ResolverError {
    constructor(message = 'No Results') {
        super(message, NOT_FOUND);
    }
}


export class MaxLimitReached extends ResolverError {
    constructor(message = 'Max Limit Reached') {
        super(message, GATEWAY_TIMEOUT);
    }
}
