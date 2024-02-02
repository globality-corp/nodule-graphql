import JSONStringify from '../JSONStringify';

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('JSONStringify', () => {
    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('adds newline at the end of the string', () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(JSONStringify('Hello World!')).toEqual(`"Hello World!"
`);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('adds two spaces before list items', () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(JSONStringify([1])).toEqual(`[
  1
]
`);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('adds comma and a space for non-last items', () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(JSONStringify([1, 2, 3, 4])).toEqual(`[
  1, 
  2, 
  3, 
  4
]
`);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('adds space after every colon', () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(JSONStringify({ a: 1, b: 2 })).toEqual(`{
  "a": 1, 
  "b": 2
}
`);
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('adds 2*n spaces to sub objects', () => {
        const obj = {
            count: 2,
            items: [
                {
                    _links: {
                        'child:button': {
                            href: 'http://fleeb.plumbus.io/api/v1/button?meeseeks_id=442160e0-74bb-482d-b229-c65a139a2092',
                        },
                        self: {
                            href: 'http://fleeb.plumbus.io/api/v1/meeseeks/442160e0-74bb-482d-b229-c65a139a2092',
                        },
                    },
                    clientId: null,
                    id: '442160e0-74bb-482d-b229-c65a139a2092',
                },
                {
                    _links: {
                        'child:button': {
                            href: 'http://fleeb.plumbus.io/api/v1/button?meeseeks_id=40eee033-51d4-4950-bfcc-4eb2f1bd5638',
                        },
                        self: {
                            href: 'http://fleeb.plumbus.io/api/v1/meeseeks/40eee033-51d4-4950-bfcc-4eb2f1bd5638',
                        },
                    },
                    clientId: 'http://graph.plumbus.io/platform/ClientID#Alphabetrium',
                    id: '40eee033-51d4-4950-bfcc-4eb2f1bd5638',
                },
            ],
        };
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(JSONStringify(obj)).toEqual(`{
  "count": 2, 
  "items": [
    {
      "_links": {
        "child:button": {
          "href": "http://fleeb.plumbus.io/api/v1/button?meeseeks_id=442160e0-74bb-482d-b229-c65a139a2092"
        }, 
        "self": {
          "href": "http://fleeb.plumbus.io/api/v1/meeseeks/442160e0-74bb-482d-b229-c65a139a2092"
        }
      }, 
      "clientId": null, 
      "id": "442160e0-74bb-482d-b229-c65a139a2092"
    }, 
    {
      "_links": {
        "child:button": {
          "href": "http://fleeb.plumbus.io/api/v1/button?meeseeks_id=40eee033-51d4-4950-bfcc-4eb2f1bd5638"
        }, 
        "self": {
          "href": "http://fleeb.plumbus.io/api/v1/meeseeks/40eee033-51d4-4950-bfcc-4eb2f1bd5638"
        }
      }, 
      "clientId": "http://graph.plumbus.io/platform/ClientID#Alphabetrium", 
      "id": "40eee033-51d4-4950-bfcc-4eb2f1bd5638"
    }
  ]
}
`);
    });
});
