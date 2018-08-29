'use strict';
const common = require('../common');
const fixtures = require('../common/fixtures');

// This test ensures that fork should parse options
// correctly if args is undefined or null

const assert = require('assert');
const { fork } = require('child_process');

const expectedEnv = { foo: 'bar' };
const cp = fork(fixtures.path('child-process-echo-options.js'), undefined,
                { env: Object.assign({}, expectedEnv) });

cp.on('message', common.mustCall(({ env }) => {
  assert.strictEqual(env.foo, expectedEnv.foo);
}));
