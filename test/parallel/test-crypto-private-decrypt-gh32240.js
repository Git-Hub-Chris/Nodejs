'use strict';

// Verify that privateDecrypt() does not leave an error on the
// openssl error stack that is visible to subsequent operations.

const common = require('../common');
if (!common.hasCrypto)
  common.skip('missing crypto');

const assert = require('assert');
const {
  generateKeyPairSync,
  publicEncrypt,
  privateDecrypt,
} = require('crypto');

const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });

const expected = Buffer.from('shibboleth');
const encrypted = publicEncrypt(pair.publicKey, expected);

const pkey = pair.privateKey.export({ type: 'pkcs1', format: 'pem' });
const pkeyEncrypted =
  pair.privateKey.export({
    type: 'pkcs1',
    format: 'pem',
    cipher: 'aes-128-cbc',
    passphrase: 'secret',
  });

function decrypt(key) {
  const decrypted = privateDecrypt(key, encrypted);
  assert.deepStrictEqual(decrypted, expected);
}

decrypt(pkey);
assert.throws(() => decrypt(pkeyEncrypted), common.hasOpenSSL3 ?
  { message: 'error:07880109:common libcrypto routines::interrupted or ' +
             'cancelled' } :
  { code: 'ERR_MISSING_PASSPHRASE' });
decrypt(pkey);  // Should not throw.
