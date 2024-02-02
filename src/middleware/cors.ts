import { bind, getConfig, setDefaults } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'cors... Remove this comment to see the full error message
import cors from 'cors';

// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import { merge } from 'lodash';

/* Set the max-age head on OPTIONS responses; helps avoid redundant
 * pre-flight checks for GraphQL queries (which are POSTs).
 */
setDefaults('routes.cors', {
    maxAge: 86400,
    maxExecutionTimeMs: 30000,
});

bind('middleware.cors', () => {
    const config = merge(getConfig('cors'), { maxAge: 86400 });
    return cors(config);
});
