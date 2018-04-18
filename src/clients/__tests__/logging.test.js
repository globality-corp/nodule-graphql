import { clearBinding, Nodule } from '@globality/nodule-config';

import spec from 'testing/petstore.json';
import { logFailure, logSuccess } from '../logging';


describe('OpenAPIClient logging', () => {
    it('logs failures', async () => {
        const error = {
            data: 'err data',
            status: 500,
        };
        logFailure({}, { method: 'GET', url: '/test'}, error, {});
    });

    it('logs successes', async () => {
        const error = {
            data: 'err data',
            status: 500,
        };
        logSuccess(
            {},
            { method: 'GET', url: '/test'},
            {},
            {},
            process.hrtime(),
        );
    });
});
