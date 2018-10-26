/* Test caching config.
 */
import Enum from 'enum';
import { CachingSpec, ANY_UUID } from '../types';

const CachedObjectType = new Enum([
    // lethe events (modulo snake case)
    'userEvent',
]);

const CachingConfig = {
    'ariza.userEvent.search': new CachingSpec({
        resourceName: CachedObjectType.userEvent.key,
        requireArgs: {
            userId: ANY_UUID,
            eventTypes: [
                'UserInvited',
                'UserActivated',
                'UserDeactivated',
            ],
        },
    }),
};


describe('CachingSpec', () => {
    const spec = CachingConfig['ariza.userEvent.search'];

    it('creates keys', () => {
        expect(
            spec.createKey(),
        ).toEqual(
            '8a471b3a-6ae1-5e32-9693-cd641e9a8f09',
        );

        expect(
            spec.createKey({
                userId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
            }),
        ).toEqual(
            'e00e7066-814d-5877-a6ca-99a21a4425de',
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
                companyId: null,
            }),
        ).toEqual(
            false,
        );

        expect(
            spec.validateArgs({
                userId: null,
            }),
        ).toEqual(
            false,
        );

        expect(
            spec.validateArgs({
                userId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
            }),
        ).toEqual(
            false,
        );

        expect(
            spec.validateArgs({
                userId: '857b3f0a-a777-11e5-bf7f-feff819cdc9f',
                eventTypes: [
                    'UserInvited',
                    'UserActivated',
                    'UserDeactivated',
                ],
            }),
        ).toEqual(
            true,
        );

    });

});
