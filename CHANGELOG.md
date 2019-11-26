# Changelog

### v1.0.1

- Added a `factories.routes.grapql` binding. Gives more direct control over how the graphql route is created. This is optional use. Standard `routes.graphql` binding
continues to work as normal. 

### v1.0.0

- Major revision from v0.32.0 to v1.0.0. Addresses v0.32.0's semantic breaking change (upgraded to graphal@14.x)

### v0.32.0

[See complete versioning details.](https://github.com/globality-corp/nodule-graphql/commit/e8d251f39d0263e495cae8c99e86179808584019)

- Upgrade `apollo-server` depedency. Now using v2.
- Upgrade `graphql` depencency. Now using v14.
- `routes.graphiql` now uses [graphql playground](https://github.com/prisma-labs/graphql-playground) 
