import loadPublicKey from '../publicKey';

describe('loadPublicKey', () => {
    it('loads a public key', () => {
        const domain = 'example';
        const kid = 'kid';
        loadPublicKey(domain, kid, __dirname);
    });

    it('raises and error on an unknown kid', () => {
        const domain = 'example';
        const kid = 'unknown';

        expect(() => loadPublicKey(domain, kid, __dirname)).toThrow('No key matches: unknown');
    });
});
