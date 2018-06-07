# @globality/nodule-graphql

Node GraphQL Conventions

While GraphQL APIs can be extremely versatile and expressive, there are still good reasons to define
multiple such APIs, especially when API consumers have fundamentally different needs, authorization
strategies, or resource definitions.

`nodule-graphql` aims to define conventions for building GraphQL APIs in node so that each
such API can focus on its resources and resolvers instead of boilerplate and plumbing.

`nodule-graphql` achieves these conventions both by providing useful functions for common GraphQL
operations and by automatically wiring commmon components into a `bottlejs` container using the
`nodule-config` library.


## Bindings

By importing `nodule-graphql`, the following bindings are made available.

### Middleware

 -  `middleware.cors` injects a CORS middleware with sane caching configuration for OPTIONS headers
 -  `middleware.helmet` injects some sane security-oriented HTTP header defaults
 -  `middleware.requestId` injects a request id into every request

### Routes

 -  `routes.graphql` returns a configured GraphQL endpoint
 -  `routes.graphiql` returns a configured GraphiQL endpoint

### Utilities

 - `terminal` injects a colorized terminal writing utility to help with application startup

## Resources

`nodule-graphql` only makes **ONE** assumption about resource structure: the `graphql.schema` binding
defines a reference to your overall schema:

    const { GraphQLObjectType, GraphQLSchema, GraphQLString } = require('graphql');
    const { bind } = require('@globality/nodule-config');

    bind('graphql.schema', () => new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'HelloWorld',
            fields: {
                helloWorld: {
                    type: GraphQLString,
                    resolve: () => 'hello world',
                },
            },
        }),
    }));


## Routes

`nodule-graphql` provides default routes (as described above under "Bindings"), enabling very simple wiring
of a GraphQL API (assuming `graphql.schema` is bound):

    const bodyParser = require('body-parser');
    const { getContainer, Nodule } = require('@globality/nodule-config');
    require('@globality/nodule-graphql');

    new Nodule({ name: 'hello' }).load().then(() => {
        const { express, graphql } = getContainer('routes');

        express.use(
            '/graphql',
             bodyParser.json(),
             graphql,
        );

        express.listen(8080, '127.0.0.1');
    });


## Resolvers

Part of the beauty of GraphQL is that resolvers are just functions. **However**, resolvers can
be more than just function and often should be:

 -  Resolvers ought to have context for tracing and debugging.

 -  Resolvers should be able to perform authorization of requests.

 -  Resolvers both aggregate (asynchronously) over sources of truth and translate (synchronously)
    these results into resources; these actions should be explicit.


## Errors

Resolvers should throw errors when something fails. Within `nodule-graphql`, it is expected that:

 -  All errors define `code` that can be used by API consumers for error handling business logic
 -  Most errors will borrow from HTTP error codes (because they have well-known, useful semantics)
 -  Error codes should be visible to API consumers via `error.extensions`

## Services

`nodule-graphql` allows you to wrap your OpenAPI client implementations to add modifications to all
defined endpoints.

For usage see the README in the services folder.

## Local Development

Local development of `nodule-graphql` with other repos has a few common pitfalls related to the
usage of peer dependencies:

 -  `nodule-config` is a peer-dependency because various libraries act as plugins to it and it needs
    a single import of `bottlejs` to share plugin state

 -  `graphql` is a peer-dependency because it validates that all graphql definitions come from the
    same import and will fail otherwise

To work with `nodule-graphql` locally:

 0. Run `yarn build` within `nodule-graphql` to transpile the source.

 1. Change directories to your local repo that you want to test against `nodule-graphql`.

 2. Run `yarn add /path/to/nodule-graphql` to copy the transpiled source into your local repo.
    Do **NOT** use `yarn link`

 3. After running `yarn add`, remove (or move-of-the-way) the `nodule_modules` from **within**
    `nodule_modules/@globality/nodule-graphql/`
