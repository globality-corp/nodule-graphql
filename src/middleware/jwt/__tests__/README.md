# RSA Keys for Testing

We need a valid public and private key for testing JWT with `RS256` signatures.

The example files in this directory were created with the following steps:

 1. Generate a new RSA key pair for testing:

        ssh-keygen -t rsa -b 4096 -f example.key -N '' -C 'example key for testing'

 2. Convert the public key to PEM format:

        openssl rsa -in example.key -pubout -outform PEM -out example.key.pub

 3. Convert the public key PEM file into JWK using [pem-jwk](https://www.npmjs.com/package/pem-jwk):

        yarn add --dev pem-jwk

        node
        > var fs = require('fs')
        > var pem2jwk = require('pem-jwk').pem2jwk
        > var str = fs.readFileSync('example.key.pub', 'ascii');
        > var jwk = pem2jwk(str);
        > fs.writeFileSync('example.jwk', JSON.stringify(jwk), 'ascii');

        yarm remove pem-jwk

 4. Convert the JWK file to a JWKS file:

        cat example.jwk | jq '{ keys: [ {alg: "RS256", kty, n, e, kid: "kid"} ] }' > example.jwks
