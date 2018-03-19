

export class Resolver {
    constructor(
        {
            aggregate,
            authorize,
            transform,
        },
    ) {
        this.aggregate = aggregate;
        this.authorize = authorize;
        this.transform = transform;
    }

    // NB: async class methods were added to node in v8.x
    async resolve(context, args) {
        if (this.authorize) {
            await this.authorize(context, args, this);
        }

        // aggregate asynchronous requests over services.
        const aggregated = await this.aggregate(context, args, this);

        if (!this.transform) {
            return aggregated;
        }

        // transform aggregated service data into a resource
        return this.transform(aggregated, context, args, this);
    }
}


export function createResolver(resolverArgs) {
    const resolver = new Resolver(resolverArgs);
    return (context, args) => resolver.resolve(context, args);
}
