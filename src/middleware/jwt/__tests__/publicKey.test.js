import loadPublicKey from '../publicKey.js';

describe('loadPublicKey', () => {
    it('loads a public key', () => {
        const domain = 'example';
        const kid = 'kid';
        loadPublicKey(domain, kid, `${process.platform === 'win32' ? '' : '/'}${/file:\/{2,3}(.+)\/[^/]/.exec(import.meta.url)![1]}`);
    });

    it('raises and error on an unknown kid', () => {
        const domain = 'example';
        const kid = 'unknown';

        expect(() => loadPublicKey(domain, kid, `${process.platform === 'win32' ? '' : '/'}${/file:\/{2,3}(.+)\/[^/]/.exec(import.meta.url)![1]}`)).toThrow('No key matches: unknown');
    });
});
