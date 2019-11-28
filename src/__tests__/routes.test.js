import request from 'supertest';
import express from 'express';

import { Nodule, getContainer } from '@globality/nodule-config';

import createApp from './app';

describe('routes', () => {
    beforeEach(async () => {
        await Nodule.testing().load();
    });

    it('resolves requests', async () => {
        const app = createApp();

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
        const response = await request(app).post(
            '/graphql',
        ).send({
            query,
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            data: {
                user: {
                    items: [{
                        companyId: 'GSW',
                        companyName: 'Golden State Warriors',
                        firstName: 'Steph',
                        id: '30',
                        lastName: 'Curry',
                    }],
                },
            },
        });
    });

    it('handles not found errors', async () => {
        const app = createApp();
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
        const response = await request(app).post(
            '/graphql',
        ).send({
            query,
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual({
            user: null,
        });
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].extensions).toEqual(expect.objectContaining({
            code: 'HTTP-404',
        }));
        expect(response.body.errors[0].locations).toBeDefined();
        expect(response.body.errors[0].message).toEqual('No such user');
        expect(response.body.errors[0].path).toEqual([
            'user',
        ]);
    });

    it('handles forbidden errors', async () => {
        const app = createApp();

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
        const response = await request(app).post(
            '/graphql',
        ).send({
            query,
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual({
            user: null,
        });
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].extensions).toEqual(expect.objectContaining({
            code: 'HTTP-403',
        }));
        expect(response.body.errors[0].locations).toBeDefined();
        expect(response.body.errors[0].message).toEqual('Not Authorized');
        expect(response.body.errors[0].path).toEqual([
            'user',
        ]);
    });

    it('handles custom errors with x-request-id and x-trace-id headers', async () => {
        const app = createApp();

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
        const response = await request(app).post(
            '/graphql',
        ).send({
            query,
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual({
            user: null,
        });
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].extensions).toEqual(expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            requestId: '1234',
            traceId: '5432',
        }));
        expect(response.body.errors[0].locations).toBeDefined();
        expect(response.body.errors[0].message).toEqual('Custom error');
        expect(response.body.errors[0].path).toEqual([
            'user',
        ]);
    });

    describe('graphql route factory', () => {

        it('will create a working graphql route', async () => {
            const factories = getContainer('factories');
            const createGraphQlRoute = factories.routes.graphql;

            expect(createGraphQlRoute).toEqual(expect.any(Function));

            const graphql = createGraphQlRoute();

            expect(graphql).toEqual(expect.any(Function));

            const app = express();
            app.post('/graphql', graphql);

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
              }
            `;

            const response = await request(app).post(
                '/graphql',
            ).send({
                query,
            });

            expect(response.statusCode).toBe(200);
        });

    });
});
