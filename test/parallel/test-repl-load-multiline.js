'use strict';
const common = require('../common');
const ArrayStream = require('../common/arraystream');
const fixtures = require('../common/fixtures');
const assert = require('assert');
const repl = require('repl');

common.skipIfDumbTerminal();

const command = `.load ${fixtures.path('repl-load-multiline.js')}`;
const terminalCode = '\u001b[1G\u001b[0J \u001b[1G';
const terminalCodeRegex = new RegExp(terminalCode.replace(/\[/g, '\\['), 'g');

const expected = `${command}
const getLunch = () =>
  placeOrder('tacos')
    .then(eat);

const placeOrder = (order) => Promise.resolve(order);
const eat = (food) => '<nom nom nom>';

undefined
`;

let accum = '';

const inputStream = new ArrayStream();
const outputStream = new ArrayStream();

outputStream.write = (data) => accum += data.replace(/\r/g, '');

const r = repl.start({
  prompt: '',
  input: inputStream,
  output: outputStream,
  terminal: true,
  useColors: false
});

r.write(`${command}\n`);
assert.strictEqual(accum.replace(terminalCodeRegex, ''), expected);
r.close();
