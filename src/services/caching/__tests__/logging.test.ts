import logCacheUsage from '../logging';

// @ts-expect-error TS(2304): Cannot find name 'jest'.
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
            // @ts-expect-error TS(2304): Cannot find name 'jest'.
            info: jest.fn(),
        },
    }),
    setDefaults: () => null,
}));

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('logCacheUsage', () => {
    const testArguments = [
        {
            cacheTTL: 'spec.cacheTTL',
            resourceName: 'spec.resourceName',
            requireArgs: {},
        }, // spec
        'req',
        'key',
        { value: 'result.value' }, // result
        [0, 0], // executeStartTime
    ];

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('exists', () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(logCacheUsage).toBeDefined();
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(typeof logCacheUsage).toBe('function');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('runs without error', () => {
        // @ts-expect-error TS(2556): A spread argument must either have a tuple type or... Remove this comment to see the full error message
        logCacheUsage(...testArguments);
        // test passes if no errors
    });
});
