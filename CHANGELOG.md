# Changelog

### v1.1.0

- Added `routes.graphql.apolloEngine` config. Used to configure Apollo engine used by the Apollo Server instances that drives the graphql route.
- `tracing` and `cacheControl` graphql route config options are now deprecatd. They are only intended for the now deprecated Apollo engine proxy. Config options will eventually
be removed.

### v1.0.0

- Major revision from v0.32.0 to v1.0.0. Addresses v0.32.0's semantic breaking change (upgraded to graphal@14.x)

### v0.32.0

[See complete versioning details.](https://github.com/globality-corp/nodule-graphql/commit/e8d251f39d0263e495cae8c99e86179808584019)

- Upgrade `apollo-server` depedency. Now using v2.
- Upgrade `graphql` depencency. Now using v14.
- `routes.graphiql` now uses [graphql playground](https://github.com/prisma-labs/graphql-playground) 
