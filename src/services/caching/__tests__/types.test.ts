/* Test caching config.
 */
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'enum... Remove this comment to see the full error message
import Enum from 'enum';

import { CachingSpec, ANY_UUID } from '../types';

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

describe('CachingSpec', () => {
    const spec = CachingConfig['fleeb.grumbo.search'];
    const doubleSpec = CachingConfig['fleeb.grumbo.retrieve'];

    it('sets endpointName', () => {
        expect(spec.endpointName).toEqual('fleeb.grumbo.search');
        expect(doubleSpec.endpointName).toBeUndefined();

        doubleSpec.setEndpointName('fleeb.grumbo.retrieve');
        expect(doubleSpec.endpointName).toEqual('fleeb.grumbo.retrieve');
    });

    it('creates keys', () => {
        expect(spec.createKey()).toEqual('35da012c-2f2d-53cb-9ed1-5d9f5d128071');

        expect(
            spec.createKey({
                blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
            })
        ).toEqual('a703adf2-7f65-592c-8c5c-2549baf7e71b');
    });

    it('validates args', () => {
        expect(spec.validateArgs()).toEqual(false);

        expect(
            spec.validateArgs({
                chumbleId: null,
            })
        ).toEqual(false);

        expect(
            spec.validateArgs({
                blamfId: null,
            })
        ).toEqual(false);

        expect(
            spec.validateArgs({
                blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
            })
        ).toEqual(false);

        expect(
            spec.validateArgs({
                blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
                plumbusTypes: ['BlamfInvited', 'BlamfActivated', 'BlamfDeactivated'],
            })
        ).toEqual(true);
    });

    it('allows for multiple arg versions', () => {
        expect(
            doubleSpec.shouldSkipCache(
                {},
                {
                    blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
                    plumbusTypes: ['BlamfInvited', 'BlamfActivated', 'BlamfDeactivated'],
                }
            )
        ).toEqual(false);

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
