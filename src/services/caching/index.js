/* Configure caching.
 */
import { get } from 'lodash';
import { bind, getContainer, getMetadata } from '@globality/nodule-config';

export default function setCache() {
    const { config, terminal, createCacheClient } = getContainer();
    // fix-up caching configuration
    const cacheHosts = get(config, 'cache.hosts', '').split(',');

    if (!get(config, 'cache.enabled')) {
        if (!getMetadata().testing) {
            terminal.disabled('caching');
        }
    } else {
        if (!getMetadata().testing) {
            terminal.enabled('caching');
        }
        bind('cache', () => createCacheClient(cacheHosts, get(config, 'cache.memcached')));
    }
}
