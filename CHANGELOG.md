# Changelog

### v1.6.1

- Added ability to set `routes.graphql.apolloPlugins` config. Used to configure Apollo plugins that allow to customize response to events regarding startup apollo server startup and phases of a GraphQL request ([read more about Apollo Server plugins](https://www.apollographql.com/docs/apollo-server/integrations/plugins)).

### v1.1.0

[See complete versioning details.](https://github.com/globality-corp/nodule-graphql/commit/349863d94834a12ab2b6df6c4b1a837560d6c00e)

- Added `routes.graphql.apolloEngine` config. Used to configure Apollo engine used by the Apollo Server instances that drives the graphql route.
- `tracing` and `cacheControl` graphql route config options are now deprecated. They are only intended for the now deprecated Apollo engine proxy. Config options will eventually
be removed.

### v1.0.0

- Major revision from v0.32.0 to v1.0.0. Addresses v0.32.0's semantic breaking change (upgraded to graphal@14.x)

### v0.32.0

[See complete versioning details.](https://github.com/globality-corp/nodule-graphql/commit/e8d251f39d0263e495cae8c99e86179808584019)

- Upgrade `apollo-server` dependency. Now using v2.
- Upgrade `graphql` dependency. Now using v14.
- `routes.graphiql` now uses [graphql playground](https://github.com/prisma-labs/graphql-playground) 
