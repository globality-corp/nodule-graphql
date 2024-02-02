import { bind } from '@globality/nodule-config';

import { getResolverPipeline } from '../pipeline';
import { createResolver } from '../types';
import '../null';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Resolver pipeline', () => {
    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
        bind('graphql.masks.foo', () => (obj: any, args: any, context: any, info: any) => [obj, obj.foo, context, info]);
        bind('graphql.masks.bar', () => (obj: any, args: any, context: any, info: any) => [obj, obj.bar, context, info]);
        bind('graphql.masks.baz', () => (obj: any, args: any, context: any, info: any) => [obj, 2 * args, context, info]);

        bind('graphql.transforms.foo', () => (value: any) => value / 2);

        bind('graphql.resolvers.identity', () =>
            createResolver({
                aggregate: (obj: any, args: any) => args,
            })
        );
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('supports simple resolvers', async () => {
        const pipeline = getResolverPipeline('null');

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await pipeline()).toBeNull();
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('requires at least one resolver', async () => {
        const pipeline = getResolverPipeline('foo');

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        await expect(pipeline()).rejects.toThrow('No resolver could be found for: foo');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('allows only one resolver', async () => {
        const pipeline = getResolverPipeline('null', 'identity');

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        await expect(pipeline()).rejects.toThrow('Multiple resolvers were found for: null, identity');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('supports custom mask functions', async () => {
        const obj = { foo: 2, bar: 1 };

        // different values for different masks
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await getResolverPipeline('foo', 'identity')(obj)).toEqual(2);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await getResolverPipeline('bar', 'identity')(obj)).toEqual(1);

        // multiple mask functions are allowed and these compose
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await getResolverPipeline('bar', 'baz', 'identity')(obj)).toEqual(2);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await getResolverPipeline('foo', 'baz', 'identity')(obj)).toEqual(4);

        // mask functions may repeat
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await getResolverPipeline('foo', 'baz', 'baz', 'identity')(obj)).toEqual(8);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('supports custom transform functions', async () => {
        const obj = { foo: 2 };

        // transform function may be named the same as a mask
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await getResolverPipeline('foo', 'identity', 'foo')(obj)).toEqual(1);

        // multiple transform functions compose and may repeat
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await getResolverPipeline('foo', 'baz', 'identity', 'foo', 'foo')(obj)).toEqual(1);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('supports generating functions', async () => {
        const obj = { foo: 2 };

        // we can have a function generate a list of pipeline terms
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(await getResolverPipeline(() => ['foo', 'identity', 'foo'])(obj)).toEqual(1);

        // we can have multiple such functions
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
            await getResolverPipeline(
                () => ['foo', 'identity'],
                () => ['foo']
            )(obj)
        ).toEqual(1);

        // we can mix and match functions with strings and generate empty lists
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
            await getResolverPipeline(
                'foo',
                () => ['identity', 'foo'],
                () => []
            )(obj)
        ).toEqual(1);
    });
});
