import { Nodule } from '@globality/nodule-config';
import request from 'supertest';

import createApp from './app.js';

describe('hide errors', () => {
    beforeEach(async () => {
        await Nodule.testing()
            .fromObject({
                routes: {
                    graphql: {
                        hideErrors: true,
                    },
                },
            })
            .load();
    });

    it('hides errors', async () => {
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

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual({
            user: null,
        });
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].extensions).toEqual(
            expect.objectContaining({
                code: 'HTTP-404',
            })
        );
        expect(response.body.errors[0].locations).toBeDefined();
        expect(response.body.errors[0].message).toEqual('Gateway Error');
        expect(response.body.errors[0].path).toEqual(['user']);
    });

    it('doesnt hide persisted query errors', async () => {
        const app = await createApp();
        const query = `
          query example {
            user(id: "888") {
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

        expect(response.statusCode).toBe(200);
        expect(response.body.data).toEqual({
            user: null,
        });
        expect(response.body.errors).toHaveLength(1);
        expect(response.body.errors[0].extensions).toEqual(
            expect.objectContaining({
                code: 'HTTP-404',
            })
        );
        expect(response.body.errors[0].locations).toBeDefined();
        expect(response.body.errors[0].message).toEqual('PersistedQueryNotFound');
        expect(response.body.errors[0].path).toEqual(['user']);
    });
});
