

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
    async resolve(args, context) {
        if (this.authorize) {
            await this.authorize(args, context, this);
        }

        // aggregate asynchronous requests over services.
        const aggregated = await this.aggregate(args, context, this);

        if (!this.transform) {
            return aggregated;
        }

        // transform aggregated service data into a resource
        return this.transform(aggregated, args, context, this);
    }
}


export function createResolver(options) {
    const resolver = new Resolver(options);
    return (args, context) => resolver.resolve(args, context);
}
