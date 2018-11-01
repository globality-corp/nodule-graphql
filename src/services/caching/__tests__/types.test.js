/* Test caching config.
 */
import Enum from 'enum';
import { CachingSpec, ANY_UUID } from '../types';

const CachedObjectType = new Enum([
    'grumbo',
]);

const CachingConfig = {
    'fleeb.grumbo.search': new CachingSpec({
        resourceName: CachedObjectType.grumbo.key,
        requireArgs: {
            blamfId: ANY_UUID,
            plumbusTypes: [
                'BlamfInvited',
                'BlamfActivated',
                'BlamfDeactivated',
            ],
        },
    }),
};


describe('CachingSpec', () => {
    const spec = CachingConfig['fleeb.grumbo.search'];

    it('creates keys', () => {
        expect(
            spec.createKey(),
        ).toEqual(
            '35da012c-2f2d-53cb-9ed1-5d9f5d128071',
        );

        expect(
            spec.createKey({
                blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
            }),
        ).toEqual(
            'a703adf2-7f65-592c-8c5c-2549baf7e71b',
        );
    });

    it('validates args', () => {
        expect(
            spec.validateArgs(),
        ).toEqual(
            false,
        );

        expect(
            spec.validateArgs({
                chumbleId: null,
            }),
        ).toEqual(
            false,
        );

        expect(
            spec.validateArgs({
                blamfId: null,
            }),
        ).toEqual(
            false,
        );

        expect(
            spec.validateArgs({
                blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
            }),
        ).toEqual(
            false,
        );

        expect(
            spec.validateArgs({
                blamfId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
                plumbusTypes: [
                    'BlamfInvited',
                    'BlamfActivated',
                    'BlamfDeactivated',
                ],
            }),
        ).toEqual(
            true,
        );

    });

});
