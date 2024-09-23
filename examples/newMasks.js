/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-check

import { createResolver } from 'resolvers/ResolverV2';

/** @typedef {(parent: unknown, args: { id: string }, context: { userId: string }, info: unknown) => string} FakeAggregate */

/**
 * A mask that will add on to the exiting arguments object.
 * @template R, P, A
 * @param {(args: A & { prop: string }) => R} closure
 */
function moreArgs(closure) {
    /**
     * @param {P} _parent
     * @param {A} args
     */
    return (_parent, args) => {
        const newArgs = {
            ...args,
            prop: 'property',
        };

        return closure(newArgs);
    };
}

/**
 * A mask that only gives the context as a parameter.
 * @template R, P, C, A
 * @param {(context: C) => R} closure
 */
function withContextOnly(closure) {
    /**
     * @param {P} _parent
     * @param {A} _args
     * @param {C} context
     */
    return (_parent, _args, context) => closure(context);
}

// NOTE: With this JSDoc annotation you can make sure the aggregate is type-safe.
// but in TypeScript we can just pass the generic to the function directly.
createResolver({
    /** @type {FakeAggregate} */
    aggregate: moreArgs((args) => args.prop),
});

createResolver({
    /** @type {FakeAggregate} */
    aggregate: withContextOnly((context) => context.userId),
});
