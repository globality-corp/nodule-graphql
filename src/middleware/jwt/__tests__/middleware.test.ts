import { clearBinding, Nodule } from '@globality/nodule-config';

// @ts-expect-error TS(2307) FIXME: Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { signSymmetric } from 'index';

import createValidateJWTMiddleware from '../middleware';

describe('JWT middleware', () => {
    let res: any;

    beforeEach(() => {
        clearBinding('config');

        res = {};
        res.status = jest.fn((code: any) => {
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

            // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 1.
            expect(() => createValidateJWTMiddleware()(req)).toThrow('JWT middleware requires `middleware.jwt.audience` to be configured');
        });

        it('validates a token', async () => {
            const email = 'first.last@example.com';
            const secret = 'secret';
            const audience = 'audience';

            await Nodule.testing()
                .fromObject({
                    middleware: {
                        jwt: {
                            audience,
                            secret,
                        },
                    },
                })
                .load();

            const token = signSymmetric({ email }, secret, audience);
            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };

            createValidateJWTMiddleware()(req, res, (error: any) => {
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ header... Remove this comment to see the full error message
                expect(req.locals.jwt.aud).toEqual(audience);
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ header... Remove this comment to see the full error message
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        it('validates a token with multiple audiences', async () => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const audiences = [audience, 'other-audience'];
            const secret = 'test-secret';
            await Nodule.testing()
                .fromObject({
                    middleware: {
                        jwt: {
                            audience: audiences,
                            secret,
                        },
                    },
                })
                .load();

            const token = signSymmetric({ email }, secret, audience);
            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };

            createValidateJWTMiddleware()(req, res, (error: any) => {
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ header... Remove this comment to see the full error message
                expect(req.locals.jwt.aud).toEqual(audience);
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ header... Remove this comment to see the full error message
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        it('validates a token with multiple audiences as string', async () => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const audiences = `${audience},purple-audience`;
            const secret = 'test-secret';
            await Nodule.testing()
                .fromObject({
                    middleware: {
                        jwt: {
                            audience: audiences,
                            secret,
                        },
                    },
                })
                .load();

            const token = signSymmetric({ email }, secret, 'test-audience');
            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };

            createValidateJWTMiddleware()(req, res, (error: any) => {
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ header... Remove this comment to see the full error message
                expect(req.locals.jwt.aud).toEqual('test-audience');
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ header... Remove this comment to see the full error message
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        it('returns an error on an invalid signature', async () => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const secret = 'test-secret';
            await Nodule.testing()
                .fromObject({
                    middleware: {
                        jwt: {
                            audience,
                            secret,
                        },
                    },
                })
                .load();

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
            };

            // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 2.
            createValidateJWTMiddleware()(req, res);
        });
    });

    describe('JWT source: header', () => {
        it('validates a token', async () => {
            const email = 'first.last@example.com';
            const secret = 'secret';
            const audience = 'audience';

            await Nodule.testing()
                .fromObject({
                    middleware: {
                        jwt: {
                            audience,
                            secret,
                        },
                    },
                })
                .load();

            const token = signSymmetric({ email }, secret, audience);
            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
            };

            createValidateJWTMiddleware({ jwtSource: 'header' })(req, res, (error: any) => {
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ header... Remove this comment to see the full error message
                expect(req.locals.jwt.aud).toEqual(audience);
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ header... Remove this comment to see the full error message
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        it('returns an error on an invalid signature', async () => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const secret = 'test-secret';
            await Nodule.testing()
                .fromObject({
                    middleware: {
                        jwt: {
                            audience,
                            secret,
                        },
                    },
                })
                .load();

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
            };

            // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 2.
            createValidateJWTMiddleware({ jwtSource: 'header' })(req, res);
        });
    });

    describe('JWT source: body', () => {
        it('validates a token', async () => {
            const email = 'first.last@example.com';
            const secret = 'secret';
            const audience = 'audience';

            await Nodule.testing()
                .fromObject({
                    middleware: {
                        jwt: {
                            audience,
                            secret,
                            getToken: (req: any) => req.body.idToken,
                        },
                    },
                })
                .load();

            const token = signSymmetric({ email }, secret, audience);
            const req = {
                body: {
                    idToken: token,
                },
            };

            createValidateJWTMiddleware({ jwtSource: 'body' })(req, res, (error: any) => {
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ body: ... Remove this comment to see the full error message
                expect(req.locals.jwt.aud).toEqual(audience);
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ body: ... Remove this comment to see the full error message
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        it('returns an error on an invalid signature', async () => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const secret = 'test-secret';
            await Nodule.testing()
                .fromObject({
                    middleware: {
                        jwt: {
                            audience,
                            secret,
                            getToken: (req: any) => req.body.idToken,
                        },
                    },
                })
                .load();

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
            };

            // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 2.
            createValidateJWTMiddleware({ jwtSource: 'body' })(req, res);
        });
    });

    describe('JWT source: cookie', () => {
        it('validates a token', async () => {
            const email = 'first.last@example.com';
            const secret = 'secret';
            const audience = 'audience';

            await Nodule.testing()
                .fromObject({
                    middleware: {
                        jwt: {
                            audience,
                            secret,
                            getToken: (req: any) => req.cookies.idToken,
                        },
                    },
                })
                .load();

            const token = signSymmetric({ email }, secret, audience);
            const req = {
                cookies: {
                    idToken: token,
                },
            };

            createValidateJWTMiddleware({ jwtSource: 'cookie' })(req, res, (error: any) => {
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ cookie... Remove this comment to see the full error message
                expect(req.locals.jwt.aud).toEqual(audience);
                // @ts-expect-error TS(2339) FIXME: Property 'locals' does not exist on type '{ cookie... Remove this comment to see the full error message
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        it('returns an error on an invalid signature', async () => {
            const email = 'first.last@example.com';
            const audience = 'test-audience';
            const secret = 'test-secret';
            await Nodule.testing()
                .fromObject({
                    middleware: {
                        jwt: {
                            audience,
                            secret,
                            getToken: (req: any) => req.cookies.idToken,
                        },
                    },
                })
                .load();

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
            };

            // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 2.
            createValidateJWTMiddleware({ jwtSource: 'cookie' })(req, res);
        });
    });
});
