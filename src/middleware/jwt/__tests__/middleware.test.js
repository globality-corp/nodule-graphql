import { clearBinding, Nodule } from '@globality/nodule-config';

import { signSymmetric } from 'index';
import createValidateJWTMiddleware from '../middleware';

describe('JWT middleware', () => {
    let res;

    beforeEach(() => {
        clearBinding('config');

        res = {};
        res.status = jest.fn((code) => {
            res.code = code;
            return res;
        });
        res.json = jest.fn(() => res);
        res.set = jest.fn(() => res);
        res.end = jest.fn(() => null);
    });

    describe('JWT source: default (header)', () => {

        it('requires an audience', () => {
            const req = {
                headers: {
                    authorization: 'Bearer token',
                },
            };

            expect(() => createValidateJWTMiddleware()(req)).toThrow(
                'JWT middleware requires `middleware.jwt.audience` to be configured',
            );
        });

        it('validates a token', async (done) => {
            const email = 'first.last@example.com';
            const secret = 'secret';
            const audience = 'audience';

            await Nodule.testing().fromObject({
                middleware: {
                    jwt: {
                        audience,
                        secret,
                    },
                },
            }).load();

            const token = signSymmetric({ email }, secret, audience);
            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };

            createValidateJWTMiddleware()(req, res, (error) => {
                expect(error).not.toBeDefined();
                expect(req.locals.jwt.aud).toEqual(audience);
                expect(req.locals.jwt.email).toEqual(email);
                done();
            });
        });

        it('validates a token with multiple audiences', async (done) => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const audiences = [audience, 'other-audience'];
            const secret = 'test-secret';
            await Nodule.testing().fromObject({
                middleware: {
                    jwt: {
                        audience: audiences,
                        secret,
                    },
                },
            }).load();

            const token = signSymmetric({ email }, secret, audience);
            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };

            createValidateJWTMiddleware()(req, res, (error) => {
                expect(error).not.toBeDefined();
                expect(req.locals.jwt.aud).toEqual(audience);
                expect(req.locals.jwt.email).toEqual(email);
                done();
            });
        });

        it('validates a token with multiple audiences as string', async (done) => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const audiences = `${audience},purple-audience`;
            const secret = 'test-secret';
            await Nodule.testing().fromObject({
                middleware: {
                    jwt: {
                        audience: audiences,
                        secret,
                    },
                },
            }).load();

            const token = signSymmetric({ email }, secret, 'test-audience');
            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };

            createValidateJWTMiddleware()(req, res, (error) => {
                expect(error).not.toBeDefined();
                expect(req.locals.jwt.aud).toEqual('test-audience');
                expect(req.locals.jwt.email).toEqual(email);
                done();
            });
        });

        it('returns an error on an invalid signature', async (done) => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const secret = 'test-secret';
            await Nodule.testing().fromObject({
                middleware: {
                    jwt: {
                        audience,
                        secret,
                    },
                },
            }).load();

            const token = signSymmetric({ email }, 'wrong', 'audience');
            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };

            res.end = () => {
                expect(res.status).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledTimes(1);
                expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });

                return done();
            };

            createValidateJWTMiddleware()(req, res);
        });

    });

    describe('JWT source: header', () => {

        it('validates a token', async (done) => {
            const email = 'first.last@example.com';
            const secret = 'secret';
            const audience = 'audience';

            await Nodule.testing().fromObject({
                middleware: {
                    jwt: {
                        audience,
                        secret,
                    },
                },
            }).load();

            const token = signSymmetric({ email }, secret, audience);
            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };

            createValidateJWTMiddleware({ jwtSource: 'header' })(req, res, (error) => {
                expect(error).not.toBeDefined();
                expect(req.locals.jwt.aud).toEqual(audience);
                expect(req.locals.jwt.email).toEqual(email);
                done();
            });
        });

        it('returns an error on an invalid signature', async (done) => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const secret = 'test-secret';
            await Nodule.testing().fromObject({
                middleware: {
                    jwt: {
                        audience,
                        secret,
                    },
                },
            }).load();

            const token = signSymmetric({ email }, 'wrong', 'audience');
            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };

            res.end = () => {
                expect(res.status).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledTimes(1);
                expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });

                return done();
            };

            createValidateJWTMiddleware({ jwtSource: 'header' })(req, res);
        });

    });

    describe('JWT source: body', () => {

        it('validates a token', async (done) => {
            const email = 'first.last@example.com';
            const secret = 'secret';
            const audience = 'audience';

            await Nodule.testing().fromObject({
                middleware: {
                    jwt: {
                        audience,
                        secret,
                        getToken: (req) => req.body.idToken,
                    },
                },
            }).load();

            const token = signSymmetric({ email }, secret, audience);
            const req = {
                body: {
                    idToken: token,
                },
            };

            createValidateJWTMiddleware({ jwtSource: 'body' })(req, res, (error) => {
                expect(error).not.toBeDefined();
                expect(req.locals.jwt.aud).toEqual(audience);
                expect(req.locals.jwt.email).toEqual(email);
                done();
            });
        });

        it('returns an error on an invalid signature', async (done) => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const secret = 'test-secret';
            await Nodule.testing().fromObject({
                middleware: {
                    jwt: {
                        audience,
                        secret,
                        getToken: (req) => req.body.idToken,
                    },
                },
            }).load();

            const token = signSymmetric({ email }, 'wrong', 'audience');
            const req = {
                body: {
                    idToken: token,
                },
            };

            res.end = () => {
                expect(res.status).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledTimes(0);

                return done();
            };

            createValidateJWTMiddleware({ jwtSource: 'body' })(req, res);
        });

    });

    describe('JWT source: cookie', () => {

        it('validates a token', async (done) => {
            const email = 'first.last@example.com';
            const secret = 'secret';
            const audience = 'audience';

            await Nodule.testing().fromObject({
                middleware: {
                    jwt: {
                        audience,
                        secret,
                        getToken: (req) => req.cookies.idToken,
                    },
                },
            }).load();

            const token = signSymmetric({ email }, secret, audience);
            const req = {
                cookies: {
                    idToken: token,
                },
            };

            createValidateJWTMiddleware({ jwtSource: 'cookie' })(req, res, (error) => {
                expect(error).not.toBeDefined();
                expect(req.locals.jwt.aud).toEqual(audience);
                expect(req.locals.jwt.email).toEqual(email);
                done();
            });
        });

        it('returns an error on an invalid signature', async (done) => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const secret = 'test-secret';
            await Nodule.testing().fromObject({
                middleware: {
                    jwt: {
                        audience,
                        secret,
                        getToken: (req) => req.cookies.idToken,
                    },
                },
            }).load();

            const token = signSymmetric({ email }, 'wrong', 'audience');
            const req = {
                cookies: {
                    idToken: token,
                },
            };

            res.end = () => {
                expect(res.status).toHaveBeenCalledTimes(1);
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledTimes(0);

                return done();
            };

            createValidateJWTMiddleware({ jwtSource: 'cookie' })(req, res);
        });

    });

});
