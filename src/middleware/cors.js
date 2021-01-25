import cors from 'cors';

import { merge } from 'lodash';
import { bind, getConfig, setDefaults } from '@globality/nodule-config';

/* Set the max-age head on OPTIONS responses; helps avoid redundant
 * pre-flight checks for GraphQL queries (which are POSTs).
 */
setDefaults(
    'routes.cors',
    {
        maxAge: 86400,
        maxExecutionTimeMs: 30000,
    },
);

bind('middleware.cors', () => {
    const config = merge(getConfig('cors'), { maxAge: 86400 });
    return cors(config);
});
