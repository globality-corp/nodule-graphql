import { bind, clearBinding, Nodule } from '@globality/nodule-config';

import { getResolverPipeline } from '../pipeline';
import { createResolver } from '../types';
import { createResolverMiddleware, setupResolverMiddlewares } from '../middleware';


describe('Resolver pipeline', () => {

    beforeEach(async () => {
        await Nodule.testing().load();
        bind('graphql.masks.foo', () => (obj, args, context, info) => [obj, obj.foo, context, info]);
        bind('graphql.masks.bar', () => (obj, args, context, info) => [obj, obj.bar, context, info]);
        bind('graphql.masks.baz', () => (obj, args, context, info) => [obj, 2 * args, context, info]);

        bind('graphql.transforms.foo', () => value => value / 2);
        bind('graphql.transforms.plusOne', () => value => value + 1);

        bind('graphql.resolvers.identity', () => createResolver({
            aggregate: (obj, args) => args,
        }));
    });

    afterEach(() => {
        clearBinding('graphql.resolverMiddlewares');
    });

    it('supports simple resolvers', async () => {
        const pipeline = getResolverPipeline('null');

        expect(await pipeline()).toBeNull();
    });

    it('requires at least one resolver', async () => {
        const pipeline = getResolverPipeline('foo');

        await expect(pipeline()).rejects.toThrow(
            'No resolver could be found for: foo',
        );
    });

    it('allows only one resolver', async () => {
        const pipeline = getResolverPipeline('null', 'identity');

        await expect(pipeline()).rejects.toThrow(
            'Multiple resolvers were found for: null, identity',
        );
    });

    it('supports custom mask functions', async () => {
        const obj = { foo: 2, bar: 1 };

        // different values for different masks
        expect(
            await getResolverPipeline('foo', 'identity')(obj),
        ).toEqual(2);

        expect(
            await getResolverPipeline('bar', 'identity')(obj),
        ).toEqual(1);

        // multiple mask functions are allowed and these compose
        expect(
            await getResolverPipeline('bar', 'baz', 'identity')(obj),
        ).toEqual(2);

        expect(
            await getResolverPipeline('foo', 'baz', 'identity')(obj),
        ).toEqual(4);

        // mask functions may repeat
        expect(
            await getResolverPipeline('foo', 'baz', 'baz', 'identity')(obj),
        ).toEqual(8);
    });

    it('supports custom transform functions', async () => {
        const obj = { foo: 2 };

        // transform function may be named the same as a mask
        expect(
            await getResolverPipeline('foo', 'identity', 'foo')(obj),
        ).toEqual(1);

        // multiple transform functions compose and may repeat
        expect(
            await getResolverPipeline('foo', 'baz', 'identity', 'foo', 'foo')(obj),
        ).toEqual(1);
    });

    it('supports generating functions', async () => {
        const obj = { foo: 2 };

        // we can have a function generate a list of pipeline terms
        expect(
            await getResolverPipeline(() => ['foo', 'identity', 'foo'])(obj),
        ).toEqual(1);

        // we can have multiple such functions
        expect(
            await getResolverPipeline(() => ['foo', 'identity'], () => ['foo'])(obj),
        ).toEqual(1);

        // we can mix and match functions with strings and generate empty lists
        expect(
            await getResolverPipeline('foo', () => ['identity', 'foo'], () => [])(obj),
        ).toEqual(1);
    });

    it('runs middlewares before resolvers', async() => {
        const input = { foo: 2 };

        const tripleFooMiddleware = createResolverMiddleware({
            execute: (obj, args, context, info) => ([{ foo: 3 * obj.foo }, args, context, info]),
        });
        setupResolverMiddlewares([tripleFooMiddleware]);

        // The middleware multiplies the value by 3 before everything else
        expect(
            await getResolverPipeline('foo', 'identity', 'plusOne')(input),
        ).toEqual(7);
    });

    it('does not run middlewares for ignored resolvers', async() => {
        const input = { foo: 2 };

        const tripleFooMiddleware = createResolverMiddleware({
            execute: (obj, args, context, info) => ([{ foo: 3 * obj.foo }, args, context, info]),
            excludedResolvers: ['identity'],
        });
        setupResolverMiddlewares([tripleFooMiddleware]);

        // The middleware is ignored, because 'identity' is an excluded resolver
        expect(
            await getResolverPipeline('foo', 'identity', 'plusOne')(input),
        ).toEqual(3);
    });

    it('run middlewares sequentially in order', async() => {
        const input = { foo: 2 };

        const tripleFooMiddleware = createResolverMiddleware({
            execute: (obj, args, context, info) => ([{ foo: 3 * obj.foo }, args, context, info]),
        });
        const plusTwoFooMiddleware = createResolverMiddleware({
            execute: (obj, args, context, info) => ([{ foo: 2 + obj.foo }, args, context, info]),
        });
        setupResolverMiddlewares([plusTwoFooMiddleware, tripleFooMiddleware]);

        expect(
            await getResolverPipeline('foo', 'identity', 'plusOne')(input),
        ).toEqual(13);
    });
});
