'use strict';

const common = require('../common.js');
const modPath = require.resolve('../fixtures/simple-error-stack.js');
const nodeModulePath = require.resolve('../fixtures/node_modules/error-stack/simple-error-stack.js');

const bench = common.createBenchmark(main, {
  method: ['without-sourcemap', 'sourcemap', 'node-module-sourcemap', 'node-module'],
  n: [1e5],
});

function runN(n, modPath) {
  delete require.cache[modPath];
  const mod = require(modPath);
  bench.start();
  for (let i = 0; i < n; i++) {
    mod.simpleErrorStack();
  }
  bench.end(n);
}

function main({ n, method }) {
  switch (method) {
    case 'without-sourcemap':
      process.setSourceMapsEnabled(false);
      runN(n, modPath);
      break;
    case 'sourcemap':
      process.setSourceMapsEnabled(true);
      runN(n, modPath);
      break;
    case 'sourcemap-with-node-modules':
      process.setSourceMapsEnabled(true);
      runN(n, nodeModulePath);
      break;
    default:
      throw new Error(`Unexpected method "${method}"`);
  }
}
