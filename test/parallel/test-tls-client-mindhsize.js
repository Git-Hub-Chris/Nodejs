'use strict';
const common = require('../common');
if (!common.hasCrypto)
  common.skip('missing crypto');

const assert = require('assert');
const tls = require('tls');
const fixtures = require('../common/fixtures');

const key = fixtures.readKey('agent2-key.pem');
const cert = fixtures.readKey('agent2-cert.pem');

let nsuccess = 0;
let nerror = 0;

function loadDHParam(n) {
  return fixtures.readKey(`dh${n}.pem`);
}

function test(size, err, next) {
  const options = {
    key: key,
    cert: cert,
    dhparam: loadDHParam(size),
    ciphers: 'DHE-RSA-AES128-GCM-SHA256'
  };

  const server = tls.createServer(options, function(conn) {
    conn.end();
  });

  server.on('close', function(isException) {
    assert(!isException);
    if (next) next();
  });

  server.listen(0, function() {
    // Client set minimum DH parameter size to 2048 or 3072 bits
    // so that it fails when it makes a connection to the tls
    // server where is too small
    const minDHSize = common.hasOpenSSL(3, 2) ? 3072 : 2048;
    const client = tls.connect({
      minDHSize: minDHSize,
      port: this.address().port,
      ca: cert, // Use the server's certificate to validate the connection
      maxVersion: 'TLSv1.2',
    }, function() {
      nsuccess++;
      server.close();
    });
    if (err) {
      client.on('error', function(e) {
        nerror++;
        assert.strictEqual(e.code, 'ERR_TLS_DH_PARAM_SIZE');
        server.close();
      });
    }
  });
}

// A client connection fails with an error when a client has an
// 2048 bits minDHSize option and a server has 1024 bits dhparam
function testDHE1024() {
  test(1024, true, testDHE2048(false, null));
}

// Test a client connection when a client has an
// 2048 bits minDHSize option
function testDHE2048(expect_to_fail, next) {
  test(2048, expect_to_fail, next);
}

// A client connection successes when a client has an
// 3072 bits minDHSize option and a server has 3072 bits dhparam
function testDHE3072() {
  test(3072, false, null);
}

if (common.hasOpenSSL(3, 2)) {
  // Minimum size for OpenSSL 3.2 is 2048 by default
  testDHE2048(true, testDHE3072);
} else {
  testDHE1024();
}

assert.throws(() => test(512, true, common.mustNotCall()),
              /DH parameter is less than 1024 bits/);

for (const minDHSize of [0, -1, -Infinity, NaN]) {
  assert.throws(() => {
    tls.connect({ minDHSize });
  }, {
    code: 'ERR_OUT_OF_RANGE',
    name: 'RangeError',
  });
}

for (const minDHSize of [true, false, null, undefined, {}, [], '', '1']) {
  assert.throws(() => {
    tls.connect({ minDHSize });
  }, {
    code: 'ERR_INVALID_ARG_TYPE',
    name: 'TypeError',
  });
}

process.on('exit', function() {
  assert.strictEqual(nsuccess, 1);
  assert.strictEqual(nerror, 1);
});
