# Services

`nodule-graphql` allows you to wrap your OpenAPI client implementations to add modifications to all
defined endpoints.

## OpenAPI Clients Container Name

All of OpenAPI clients that are to be converted into wrapped services need to be bound to a container.
The default name of `clients` can be used for the container or can be overridden by binding to `clientsName`:

    Object.keys(specs).forEach((name) => {
        bind(`fooClients.${name}`, () => createOpenAPIClient(name, specs[name]));
    });
    bind('clientsName', 'fooClients');

## Import `bindServices`

In the application defintion import 'bindServices' from `nodule-graphql` and call it once all of the 
clients and config bindings have been bound.

    import { bindServices } from '@globality/nodule-graphql';

    import fooClients;
    import barServiceConfig;

    bindServices();

## Using services

The wrapped services will be bound to the `services` field. In order to use the wrapped clients, 
simply replace the client getContainer call with a `services` get container call:

    const { foo, bar } = getContainer('services');

The original `clients` are still bound so if for a specific endpoint, the services are not desired, 
the client version of the call is still accessiable:

    const { foo, bar } = getContainer('services');
    const { baz } = getContainer('services');

## Specifying Configs

There are 2 base wrappers included in `nodule-graphql`: batching and deduplication.
In order to utilize these wrappers, configuration variables need to be bound.

The paths specified in the configurations should be retrievable from:

    getContainer(`{clientsName}.{path}`)

### dedup

    const dedupConfig = {
        'path.to.foo.endpoint': {},
        'path.to.bar.endpoint': {},
    }
    bind('serviceConfig.dedup', dedupConfig);

### batch

For a given path the `accumulateBy` and `accumulateInto` should include a field that can be grouped
into a different parameter to be passed into the same endpoint. In addition the returned response
must include the `accumulateBy` field as one of the properties. If it doesnt, specify a `splitResponseBy`
field to split the returned response by. If the batched endpoint is different than the original
request, this can be specified with `batchSearchRequest` field. Finally if specific parameters need
to be included during batched requests, the `assignArgs` parameter can be used.

    const batchConfig = {
        'path.to.foo.endpoint': {
            accumulateBy: 'foo',
            accumulateInto: 'foos',
        },
        'path.to.bar.endpoint': {
            accumulateBy: 'bar',
            accumulateInto: 'bars',
            splitResponseBy: 'baz',
            assignArgs: [
                {
                    additionParameter: 'parameter',
                },
            ],
            batchSearchRequest: named('path.to.bars.endpoint'),
        },
    }
    bind('serviceConfig.batch', batchConfig);

### Cache

First, we need to set up a cache client - usually memcached, adding `memcached-promisify` as a dependency to package.json. a function creating the cache client needs to be bound to the graph:

    import Cache from 'memcached-promisify';
    import { bind } from '@globality/nodule-config';

    function createCacheClient(cacheHost, memcachedConfig) {
        const client = new Cache(
            { cacheHost },
            memcachedConfig,
        );
        client.add = (key, data, lifetime) => cachePromise(
            client,
            'add',
            `${client.config.keyPrefix}${key}`,
            data,
            lifetime,
        );
        return client;
    }
    bind('createCacheClient', () => createCacheClient);

app.js:

    import { bindServices, setCache } from '@globality/nodule-graphql';
    // under bindServices();
    setCache();

Second, define the cache config:

    import { PAGINATION } from '../../constants';
    import {
        ANY_NOT_NULL,
        ANY_PARAMETER,
        ANY_UUID,
        CachingSpec,
    } from '@globality/nodule-graphql';

    const CachedObjectType = new Enum([
        'resourceName',
    ]);

    const cacheConfig = {
        'path.to.foo.endpoint': new CachingSpec({
            resourceName: CachedObjectType.resourceName.key,
            requireArgs: {
                fooId: ANY_UUID,
            },
        }),
    }
    bind('serviceConfig.cache', cacheConfig);

## Additional wrappers

`nodule-graphql` also supports including additional wrappers. All wrappers should be written in a way 
to expect (req, args) parameters, and only operate on endpoints specified in an associated config.

These wrappers can be included by binding to the `serviceWrappers` container:
    const serviceWrappers = [
        [fooWrapperConfig, fooWrapper],
        [barWrapperConfig, barWrapper],
    ];
    bind('serviceConfig.additionalWrappers', serviceWrappers);

## Override createKey

`nodule-graphql` generates a unique key to be used for batching/deduplication. The library allows
the ability to override this function. The function should be able to generate a unique key given
a list of arguments.

    function createKey(args) {
        ... calculate key based on args ...
        return key;
    }

    bind('createKey', () => createKey);
