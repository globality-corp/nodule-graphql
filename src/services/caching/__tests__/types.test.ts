/* Test caching config.
 */
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enum... Remove this comment to see the full error message
import Enum from 'enum';

import { CachingSpec, ANY_UUID } from '../types';

// @ts-expect-error TS(2304): Cannot find name 'jest'.
jest.mock('@globality/nodule-config', () => ({
    getContainer: () => ({
        config: {
            cache: {
                enabled: true,
            },
        },
    }),
}));

const CachedObjectType = new Enum(['grumbo']);

const CachingConfig = {
    'fleeb.grumbo.search': new CachingSpec({
        resourceName: CachedObjectType.grumbo.key,
        endpointName: 'fleeb.grumbo.search',
        requireArgs: {
            blamfId: ANY_UUID,
            plumbusTypes: ['BlamfInvited', 'BlamfActivated', 'BlamfDeactivated'],
        },
    }),
    'fleeb.grumbo.retrieve': new CachingSpec({
        resourceName: CachedObjectType.grumbo.key,
        requireArgs: [
            {
                blamfId: ANY_UUID,
                plumbusTypes: ['BlamfInvited', 'BlamfActivated', 'BlamfDeactivated'],
            },
            {
                blamfId: ANY_UUID,
                plumbusId: ANY_UUID,
            },
        ],
    }),
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CachingSpec', () => {
    const spec = CachingConfig['fleeb.grumbo.search'];
    const doubleSpec = CachingConfig['fleeb.grumbo.retrieve'];

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('sets endpointName', () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(spec.endpointName).toEqual('fleeb.grumbo.search');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(doubleSpec.endpointName).toBeUndefined();

        doubleSpec.setEndpointName('fleeb.grumbo.retrieve');
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(doubleSpec.endpointName).toEqual('fleeb.grumbo.retrieve');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates keys', () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(spec.createKey()).toEqual('35da012c-2f2d-53cb-9ed1-5d9f5d128071');

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
            spec.createKey({
                blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
            })
        ).toEqual('a703adf2-7f65-592c-8c5c-2549baf7e71b');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('validates args', () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(spec.validateArgs()).toEqual(false);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
            spec.validateArgs({
                chumbleId: null,
            })
        ).toEqual(false);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
            spec.validateArgs({
                blamfId: null,
            })
        ).toEqual(false);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
            spec.validateArgs({
                blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
            })
        ).toEqual(false);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
            spec.validateArgs({
                blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
                plumbusTypes: ['BlamfInvited', 'BlamfActivated', 'BlamfDeactivated'],
            })
        ).toEqual(true);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('allows for multiple arg versions', () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
            doubleSpec.shouldSkipCache(
                {},
                {
                    blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
                    plumbusTypes: ['BlamfInvited', 'BlamfActivated', 'BlamfDeactivated'],
                }
            )
        ).toEqual(false);

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(
            doubleSpec.shouldSkipCache(
                {},
                {
                    blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
                    plumbusId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
                }
            )
        ).toEqual(false);
    });
});
