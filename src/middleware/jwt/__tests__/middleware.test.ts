import { clearBinding, Nodule } from '@globality/nodule-config';

// @ts-expect-error TS(2307): Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { signSymmetric } from 'index';

import createValidateJWTMiddleware from '../middleware';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('JWT middleware', () => {
    let res: any;

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
        clearBinding('config');

        res = {};
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        res.status = jest.fn((code: any) => {
            res.code = code;
            return res;
        });
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        res.json = jest.fn(() => res);
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        res.set = jest.fn(() => res);
        // @ts-expect-error TS(2304): Cannot find name 'jest'.
        res.end = jest.fn(() => null);
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('JWT source: default (header)', () => {
        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
        it('requires an audience', () => {
            const req = {
                headers: {
                    authorization: 'Bearer token',
                },
            };

            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect(() => createValidateJWTMiddleware()(req)).toThrow('JWT middleware requires `middleware.jwt.audience` to be configured');
        });

        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.aud).toEqual(audience);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.aud).toEqual(audience);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.aud).toEqual('test-audience');
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.status).toHaveBeenCalledTimes(1);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.status).toHaveBeenCalledWith(401);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.json).toHaveBeenCalledTimes(1);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
            };

            // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
            createValidateJWTMiddleware()(req, res);
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('JWT source: header', () => {
        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.aud).toEqual(audience);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.status).toHaveBeenCalledTimes(1);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.status).toHaveBeenCalledWith(401);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.json).toHaveBeenCalledTimes(1);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
            };

            // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
            createValidateJWTMiddleware({ jwtSource: 'header' })(req, res);
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('JWT source: body', () => {
        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.aud).toEqual(audience);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.status).toHaveBeenCalledTimes(1);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.status).toHaveBeenCalledWith(401);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.json).toHaveBeenCalledTimes(0);
            };

            // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
            createValidateJWTMiddleware({ jwtSource: 'body' })(req, res);
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe('JWT source: cookie', () => {
        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(error).not.toBeDefined();
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.aud).toEqual(audience);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(req.locals.jwt.email).toEqual(email);
            });
        });

        // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.status).toHaveBeenCalledTimes(1);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.status).toHaveBeenCalledWith(401);
                // @ts-expect-error TS(2304): Cannot find name 'expect'.
                expect(res.json).toHaveBeenCalledTimes(0);
            };

            // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
            createValidateJWTMiddleware({ jwtSource: 'cookie' })(req, res);
        });
    });
});
