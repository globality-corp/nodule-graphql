import { ResolverMiddleware } from '../middleware';

describe('resolver middlewares', () => {
    it('is a no-op for excluded middlewares', () => {
        const middleware = new ResolverMiddleware({
            execute: (obj, args) => args,
            excludedResolvers: ['exclude'],
        });

        expect(middleware.shouldIgnore(['foo', 'exclude'])).toBe(true);
    });
});
