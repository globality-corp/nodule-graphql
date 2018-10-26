import JSONStringify from '../JSONStringify';

describe('JSONStringify', () => {
    it('adds newline at the end of the string', () => {
        expect(
            JSONStringify('Hello World!'),
        ).toEqual(`"Hello World!"
`);
    });

    it('adds two spaces before list items', () => {
        expect(
            JSONStringify([1]),
        ).toEqual(`[
  1
]
`);
    });

    it('adds comma and a space for non-last items', () => {
        expect(
            JSONStringify([1, 2, 3, 4]),
        ).toEqual(`[
  1, 
  2, 
  3, 
  4
]
`);
    });

    it('adds space after every colon', () => {
        expect(
            JSONStringify({ a: 1, b: 2 }),
        ).toEqual(`{
  "a": 1, 
  "b": 2
}
`);
    });

    it('adds 2*n spaces to sub objects', () => {
        const obj = {
            count: 2,
            items: [
                {
                    _links: {
                        'child:prompt': {
                            href: 'http://dodona.dev.globality.io/api/v1/prompt_context?prompt_context_id=442160e0-74bb-482d-b229-c65a139a2092',
                        },
                        self: {
                            href: 'http://dodona.dev.globality.io/api/v1/prompt_context/442160e0-74bb-482d-b229-c65a139a2092',
                        },
                    },
                    clientId: null,
                    id: '442160e0-74bb-482d-b229-c65a139a2092',
                },
                {
                    _links: {
                        'child:prompt': {
                            href: 'http://dodona.dev.globality.io/api/v1/prompt_context?prompt_context_id=40eee033-51d4-4950-bfcc-4eb2f1bd5638',
                        },
                        self: {
                            href: 'http://dodona.dev.globality.io/api/v1/prompt_context/40eee033-51d4-4950-bfcc-4eb2f1bd5638',
                        },
                    },
                    clientId: 'http://graph.globality.io/platform/ClientID#Microsoft',
                    id: '40eee033-51d4-4950-bfcc-4eb2f1bd5638',
                },
            ],
        };
        expect(
            JSONStringify(obj),
        ).toEqual(`{
  "count": 2, 
  "items": [
    {
      "_links": {
        "child:prompt": {
          "href": "http://dodona.dev.globality.io/api/v1/prompt_context?prompt_context_id=442160e0-74bb-482d-b229-c65a139a2092"
        }, 
        "self": {
          "href": "http://dodona.dev.globality.io/api/v1/prompt_context/442160e0-74bb-482d-b229-c65a139a2092"
        }
      }, 
      "clientId": null, 
      "id": "442160e0-74bb-482d-b229-c65a139a2092"
    }, 
    {
      "_links": {
        "child:prompt": {
          "href": "http://dodona.dev.globality.io/api/v1/prompt_context?prompt_context_id=40eee033-51d4-4950-bfcc-4eb2f1bd5638"
        }, 
        "self": {
          "href": "http://dodona.dev.globality.io/api/v1/prompt_context/40eee033-51d4-4950-bfcc-4eb2f1bd5638"
        }
      }, 
      "clientId": "http://graph.globality.io/platform/ClientID#Microsoft", 
      "id": "40eee033-51d4-4950-bfcc-4eb2f1bd5638"
    }
  ]
}
`);
    });

});
