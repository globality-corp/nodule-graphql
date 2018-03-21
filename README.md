# nodule-graphql

Node GraphQL Conventions

While GraphQL APIs can be extremely versatile and expressive, there are still good reasons to define
multiple such APIs, especially when API consumers have fundamentally different needs, authorization
strategies, or resource definitions.

`nodule-graphql` aims to define conventions for building GraphQL APIs in node so that each such API
can focus on its resources and resolvers instead of boilerplate and plumbing.


## Errors

Resolvers should throw errors when something fails. Within `nodule-graphql`, it is expected that:

 -  All errors define `code` that can be used by API consumers for error handling business logic
 -  Most errors will borrow from HTTP error codes (because they have well-known, useful semantics)
 -  Error codes should be visible to API consumers via `error.extensions`


## Resolvers

Part of the beauty of GraphQL is that resolvers are just functions. **However**, resolvers can
be more than just function and often should be:

 -  Resolvers ought to have context for tracing and debugging.

 -  Resolvers should be able to perform authorization of requests.

 -  Resolvers both aggregate (asynchronously) over sources of truth and translate (synchronously)
    these results into resources; these actions should be explicit.
