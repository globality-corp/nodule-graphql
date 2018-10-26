import spooky128 from '../spooky128';

describe('spooky', () => {
    it('creates microcosm compatible cache', () => {
        // microcosm has the same test
        expect(
            spooky128('Hello World!'),
        ).toEqual(
            '79aa5e0a1f595e330d662c97a7763cdc',
        );
    });

});
