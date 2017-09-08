'use strict';

const common = require('../common');
const assert = require('assert');
const EventEmitter = require('events');

const ee = new EventEmitter();

{
  ee.when('foo')
    .then(common.mustCall((context) => {
      assert.strictEqual(context.emitter, ee);
      assert.deepStrictEqual(context.args, [1, 2, 3]);
    }))
    .catch(common.mustNotCall());
  assert.strictEqual(ee.listenerCount('foo'), 1);
  ee.emit('foo', 1, 2, 3);
  assert.strictEqual(ee.listenerCount('foo'), 0);
}

{
  ee.when('foo')
    .then(common.mustCall(() => {
      throw new Error('foo');
    }))
    .catch(common.mustCall((err) => {
      assert.strictEqual(err.message, 'foo');
    }));
  assert.strictEqual(ee.listenerCount('foo'), 1);
  ee.emit('foo');
  assert.strictEqual(ee.listenerCount('foo'), 0);
}

{
  ee.removeAllListeners();
  ee.when('foo')
    .then(common.mustNotCall())
    .catch(common.expectsError({
      code: 'ERR_EVENTS_WHEN_CANCELED',
      type: Error,
      message: 'The when \'foo\' promise was canceled'
    }));
  ee.removeAllListeners();
}

{
  ee.removeAllListeners();
  assert.strictEqual(ee.listenerCount(0), 0);
  const promise = ee.when('foo');
  promise.then(common.mustNotCall())
          .catch(common.expectsError({
            code: 'ERR_EVENTS_WHEN_CANCELED',
            type: Error,
            message: 'The when \'foo\' promise was canceled'
          }));
  const fn = ee.listeners('foo')[0];
  assert.strictEqual(fn.name, 'promise for \'foo\'');
  assert.strictEqual(fn.promise, promise);
  ee.removeListener('foo', fn);
}

process.on('unhandledRejection', common.mustNotCall());
