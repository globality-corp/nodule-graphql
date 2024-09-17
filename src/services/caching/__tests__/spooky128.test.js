import spooky128 from '../spooky128.js';

describe('spooky', () => {
    it('creates microcosm compatible cache', () => {
        // microcosm has the same test
        // https://github.com/globality-corp/microcosm-flask/blob/develop/microcosm_flask/tests/formatting/test_text_formatter.py
        expect(spooky128('Hello World!')).toEqual('79aa5e0a1f595e330d662c97a7763cdc');
    });
});
