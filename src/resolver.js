import { getContainer } from '@globality/nodule-config';


/* Default mask function: just passes args.
 */
function defaultMask(obj, args) {
    return [args];
}


export class Resolver {
    constructor(
        {
            aggregate,
            authorize,
            transform,
            mask,
        },
    ) {
        this.aggregate = aggregate;
        this.authorize = authorize;
        this.transform = transform;
        this.mask = mask || defaultMask;
    }

    // NB: async class methods were added to node in v8.x
    async resolve(obj, args, context, info) {
        const masked = this.mask(obj, args, context, info);

        if (this.authorize) {
            await this.authorize(...masked);
        }

        // aggregate asynchronous requests over services.
        const aggregated = await this.aggregate(...masked);

        if (!this.transform) {
            return aggregated;
        }

        // transform aggregated service data into a resource
        return this.transform(aggregated, ...masked);
    }
}


export function createResolver(options) {
    return new Resolver(options);
}


export function getResolver(name) {
    return (obj, args, context, info) => {
        const resolver = getContainer(`graphql.resolvers.${name}`);
        return resolver.resolve(obj, args, context, info);
    };
}
