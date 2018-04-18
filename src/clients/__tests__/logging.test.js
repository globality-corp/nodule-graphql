import { logFailure, logSuccess } from '../logging';


describe('OpenAPIClient logging', () => {
    it('logs failures', async () => {
        const error = {
            data: 'err data',
            status: 500,
        };
        logFailure({}, { method: 'GET', url: '/test' }, error, {});
    });

    it('logs successes', async () => {
        logSuccess(
            {},
            { method: 'GET', url: '/test' },
            {},
            {},
            process.hrtime(),
        );
    });
});
