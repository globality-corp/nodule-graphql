import loadPublicKey from '../publicKey';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('loadPublicKey', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('loads a public key', () => {
        const domain = 'example';
        const kid = 'kid';
        loadPublicKey(domain, kid, __dirname);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('raises and error on an unknown kid', () => {
        const domain = 'example';
        const kid = 'unknown';

        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(() => loadPublicKey(domain, kid, __dirname)).toThrow('No key matches: unknown');
    });
});
