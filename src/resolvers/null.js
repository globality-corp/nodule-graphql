import { bind } from '@globality/nodule-config';

import { createResolver } from './types';


/* Register a default 'null' resolver.
 */
bind('graphql.resolvers.null', () => createResolver({
    aggregate: async () => null,
    transform: () => null,
}));
