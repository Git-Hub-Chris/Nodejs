// Flags: --use-system-ca

import assert from 'node:assert/strict';

import https from "node:https";
import fixtures from "../common/fixtures.js";
import * as common from "../common/index.mjs";

const handleRequest = (req, res) => {
  const path = req.url;
  switch (path) {
    case '/hello-world':
      res.writeHead(200);
      res.end('hello world\n');
      break;
    default:
      assert(false, `Unexpected path: ${path}`);
  }
};

const httpsServer = https.createServer({
  key: fixtures.readKey('agent1-key.pem'),
  cert: fixtures.readKey('agent1-cert.pem')
}, handleRequest);
httpsServer.listen(0, common.mustCall(async () => {
  // requires trusting the CA certificate first (which needs an interactive GUI approval, e.g. TouchID):
  // security add-trusted-cert -k /Users/$USER/Library/Keychains/login.keychain-db test/fixtures/keys/ca1-cert.pem
  // To remove:
  // security delete-certificate -c ca1 -t
  await fetch(`https://localhost:${httpsServer.address().port}/hello-world`)
  console.log('Success')
  httpsServer.close();
}));


