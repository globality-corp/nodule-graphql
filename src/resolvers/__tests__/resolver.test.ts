// @ts-expect-error TS(7016): Could not find a declaration file for module '@glo... Remove this comment to see the full error message
import { Forbidden } from '@globality/nodule-express';

// @ts-expect-error TS(2307): Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { createResolver } from 'index';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('a resolver', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns an aggregated value', async () => {
        const resolver = createResolver({
            aggregate: async () => 42,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await resolver.resolve()).toEqual(42);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('transforms an aggregated value', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            transform: (result: any) => 2 * result,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await resolver.resolve()).toEqual(42);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('authorizes successfully', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async () => true,
            transform: (result: any) => 2 * result,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await resolver.resolve()).toEqual(42);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('authorizes unsuccessfully', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async () => {
                throw new Forbidden();
            },
            transform: (result: any) => 2 * result,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        await expect(resolver.resolve()).rejects.toThrow('Forbidden');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('authorizes successfully based on authorize data', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async (authorizeData: any) => {
                if (authorizeData) {
                    return true;
                }
                throw new Forbidden();
            },
            authorizeData: true,
            transform: (result: any) => 2 * result,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await resolver.resolve()).toEqual(42);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('authorizes unsuccessfully based on authorize data', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: async (authorizeData: any) => {
                if (authorizeData) {
                    return true;
                }
                throw new Forbidden();
            },
            authorizeData: false,
            transform: (result: any) => 2 * result,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        await expect(resolver.resolve()).rejects.toThrow('Forbidden');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('authorizes based on an authorizer name', async () => {
        const resolver = createResolver({
            aggregate: async () => 21,
            authorize: 'null',
            transform: (result: any) => 2 * result,
        });
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await resolver.resolve()).toEqual(42);
    });
});
