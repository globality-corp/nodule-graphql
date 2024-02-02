import spooky128 from '../spooky128';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('spooky', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('creates microcosm compatible cache', () => {
        // microcosm has the same test
        // https://github.com/globality-corp/microcosm-flask/blob/develop/microcosm_flask/tests/formatting/test_text_formatter.py
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(spooky128('Hello World!')).toEqual('79aa5e0a1f595e330d662c97a7763cdc');
    });
});
