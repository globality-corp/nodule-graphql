import {
    BadRequest,
    Forbidden,
    InternalServerError,
    NotFound,
    UnprocessableEntity,
} from '..';


describe('BadFound', () => {
    it('is an error', () => {
        const error = new BadRequest();
        expect(error).toBeInstanceOf(Error);
        expect(error.code).toBe(400);
    });
});


describe('Forbidden', () => {
    it('is an error', () => {
        const error = new Forbidden();
        expect(error).toBeInstanceOf(Error);
        expect(error.code).toBe(403);
    });
});


describe('InternalServerError', () => {
    it('is an error', () => {
        const error = new InternalServerError();
        expect(error).toBeInstanceOf(Error);
        expect(error.code).toBe(500);
    });
});


describe('NotFound', () => {
    it('is an error', () => {
        const error = new NotFound();
        expect(error).toBeInstanceOf(Error);
        expect(error.code).toBe(404);
    });
});


describe('UnprocessableEnttity', () => {
    it('is an error', () => {
        const error = new UnprocessableEntity();
        expect(error).toBeInstanceOf(Error);
        expect(error.code).toBe(422);
    });
});
