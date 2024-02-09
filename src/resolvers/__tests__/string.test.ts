// @ts-expect-error TS(2307) FIXME: Cannot find module 'index' or its corresponding ty... Remove this comment to see the full error message
import { createStrictResolver } from 'index';

describe('a strict resolver', () => {
    it('requires an aggregate function', async () => {
        expect(() =>
            createStrictResolver({
                authorize: () => true,
                transform: (value: any) => value,
            })
        ).toThrow('Strict resolver must define an `aggregate` option');
    });

    it('requires an authorize function', async () => {
        expect(() =>
            createStrictResolver({
                aggregate: async () => null,
                transform: (value: any) => value,
            })
        ).toThrow('Strict resolver must define an `authorize` option');
    });
});
