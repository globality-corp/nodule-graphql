import logCacheUsage from '../logging';

jest.mock('@globality/nodule-config', () => ({
    bind: () => null,
    getContainer: () => ({
        config: {
            logger: {
                cache: {
                    enabled: true,
                },
            },
        },
        logger: {
            info: jest.fn(),
        },
    }),
    setDefaults: () => null,
}));

describe('logCacheUsage', () => {
    const testArguments = [
        {
            cacheTTL: 'spec.cacheTTL',
            resourceName: 'spec.resourceName',
            requireArgs: { },
        }, // spec
        'req',
        'key',
        { value: 'result.value' }, // result
        [0, 0], // executeStartTime
    ];

    it('exists', () => {
        expect(logCacheUsage).toBeDefined();
        expect(typeof logCacheUsage).toBe('function');
    });

    it('runs without error', () => {
        logCacheUsage(...testArguments);
        // test passes if no errors
    });
});
