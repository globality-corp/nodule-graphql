import { Nodule } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'supe... Remove this comment to see the full error message
import request from 'supertest';

import createApp from './app';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('hide errors', () => {
    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
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

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        expect(response.body.errors[0].message).toEqual('Gateway Error');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].path).toEqual(['user']);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        expect(response.body.errors[0].message).toEqual('PersistedQueryNotFound');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(response.body.errors[0].path).toEqual(['user']);
    });
});
