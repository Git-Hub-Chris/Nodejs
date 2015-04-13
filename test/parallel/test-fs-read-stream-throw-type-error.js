const common = require('../common');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const example = path.join(common.fixturesDir, 'x.txt');
assert.throws(function() { fs.createReadStream(example, 123); }, TypeError);
assert.throws(function() { fs.createReadStream(example, true); }, TypeError);
