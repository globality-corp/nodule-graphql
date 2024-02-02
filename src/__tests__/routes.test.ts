import { Nodule } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'supe... Remove this comment to see the full error message
import request from 'supertest';

import createApp from './app';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('routes', () => {
    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(async () => {
        await Nodule.testing().load();
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('resolves requests', async () => {
        const app = await createApp();

        const query = `
          query example {
            user {
              items {
                companyId
                companyName
                firstName
                id
                lastName
              }
            }
          }`;
        const response = await request(app).post('/graphql').send({
            query,
        });

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.statusCode).toBe(200);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body).toEqual({
            data: {
                user: {
                    items: [
                        {
                            companyId: 'GSW',
                            companyName: 'Golden State Warriors',
                            firstName: 'Steph',
                            id: '30',
                            lastName: 'Curry',
                        },
                    ],
                },
            },
        });
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('handles not found errors', async () => {
        const app = await createApp();
        const query = `
          query example {
            user(id: "99") {
              items {
                companyId
                companyName
                firstName
                id
                lastName
              }
            }
          }`;
        const response = await request(app).post('/graphql').send({
            query,
        });

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.statusCode).toBe(200);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.data).toEqual({
            user: null,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors).toHaveLength(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].extensions).toEqual(
            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect.objectContaining({
                code: 'HTTP-404',
            })
        );
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].locations).toBeDefined();
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].message).toEqual('No such user');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].path).toEqual(['user']);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('handles forbidden errors', async () => {
        const app = await createApp();

        const query = `
          query example {
            user(id: "23") {
              items {
                companyId
                companyName
                firstName
                id
                lastName
              }
            }
          }`;
        const response = await request(app).post('/graphql').send({
            query,
        });

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.statusCode).toBe(200);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.data).toEqual({
            user: null,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors).toHaveLength(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].extensions).toEqual(
            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect.objectContaining({
                code: 'HTTP-403',
            })
        );
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].locations).toBeDefined();
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].message).toEqual('Not Authorized');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].path).toEqual(['user']);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('handles custom errors with x-request-id and x-trace-id headers', async () => {
        const app = await createApp();

        const query = `
        query example {
          user(id: "999") {
            items {
              companyId
              companyName
              firstName
              id
              lastName
            }
          }
        }`;
        const response = await request(app).post('/graphql').send({
            query,
        });

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.statusCode).toBe(200);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.data).toEqual({
            user: null,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors).toHaveLength(1);
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].extensions).toEqual(
            // @ts-expect-error TS(2304): Cannot find name 'expect'.
            expect.objectContaining({
                code: 'INTERNAL_SERVER_ERROR',
                requestId: '1234',
                traceId: '5432',
            })
        );
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].locations).toBeDefined();
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].message).toEqual('Custom error');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].path).toEqual(['user']);
    });
});
