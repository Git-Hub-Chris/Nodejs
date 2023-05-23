import * as common from '../common/index.mjs';
import * as fixtures from '../common/fixtures.mjs';
import * as snapshot from '../common/assertSnapshot.js';
import * as os from 'node:os';
import { describe, it } from 'node:test';

const skipForceColors =
  process.config.variables.icu_gyp_path !== 'tools/icu/icu-generic.gyp' ||
  process.config.variables.node_shared_openssl ||
  (common.isWindows && (Number(os.release().split('.')[0]) !== 10 || Number(os.release().split('.')[2]) < 14393)); // See https://github.com/nodejs/node/pull/33132


function replaceNodeVersion(str) {
  return str.replaceAll(process.version, '*');
}

function replaceStackTrace(str) {
  return snapshot.replaceStackTrace(str, '$1at *$7\n');
}

describe('errors output', { concurrency: true }, () => {
  function normalize(str) {
    return str.replaceAll(snapshot.replaceWindowsPaths(process.cwd()), '').replaceAll('//', '*').replaceAll(/\/(\w)/g, '*$1').replaceAll('*test*', '*').replaceAll('*fixtures*errors*', '*').replaceAll('file:**', 'file:*/');
  }
  function normalizeNoNumbers(str) {
    return normalize(str).replaceAll(/\d+:\d+/g, '*:*').replaceAll(/:\d+/g, ':*').replaceAll('*fixtures*message*', '*');
  }
  function normalizeCustom(str) {
    return normalizeNoNumbers(str).replaceAll(/\d+/g, '*').replaceAll('[*m', '');
  }
  const common = snapshot
    .transform(snapshot.replaceWindowsLineEndings, snapshot.replaceWindowsPaths);
  const defaultTransform = snapshot.transform(common, normalize, replaceNodeVersion);
  const errTransform = snapshot.transform(common, normalizeNoNumbers, replaceNodeVersion);
  const promiseTransform = snapshot.transform(common, replaceStackTrace, normalizeNoNumbers, replaceNodeVersion);
  const customTransform = snapshot.transform(common, replaceStackTrace, normalizeCustom);

  const tests = [
    { name: 'errors/async_error_eval_cjs.js' },
    { name: 'errors/async_error_eval_esm.js' },
    { name: 'errors/async_error_microtask_main.js' },
    { name: 'errors/async_error_nexttick_main.js' },
    { name: 'errors/async_error_sync_main.js' },
    { name: 'errors/async_error_sync_esm.mjs' },
    { name: 'errors/error_aggregateTwoErrors.js', transform: errTransform },
    { name: 'errors/error_exit.js', transform: errTransform },
    { name: 'errors/error_with_nul.js', transform: errTransform },
    { name: 'errors/events_unhandled_error_common_trace.js', transform: errTransform },
    { name: 'errors/events_unhandled_error_nexttick.js', transform: errTransform },
    { name: 'errors/events_unhandled_error_sameline.js', transform: errTransform },
    { name: 'errors/events_unhandled_error_subclass.js', transform: errTransform },
    { name: 'errors/throw_custom_error.js', transform: errTransform },
    { name: 'errors/throw_in_line_with_tabs.js', transform: errTransform },
    { name: 'errors/throw_non_error.js', transform: errTransform },
    { name: 'errors/promise_always_throw_unhandled.js', transform: promiseTransform },
    { name: 'errors/if-error-has-good-stack.js', transform: errTransform, tty: false },
    { name: 'errors/test-no-extra-info-on-fatal-exception.js', transform: errTransform, tty: false },
    { name: 'errors/throw_error_with_getter_throw.js', transform: errTransform, tty: true },
    { name: 'errors/throw_null.js', transform: errTransform, tty: true },
    { name: 'errors/throw_undefined.js', transform: errTransform, tty: true },
    { name: 'errors/timeout_throw.js', transform: errTransform, tty: false },
    { name: 'errors/undefined_reference_in_new_context.js', transform: errTransform, tty: false },
    { name: 'errors/util_inspect_error.js', transform: customTransform, tty: true },
    { name: 'errors/util-inspect-error-cause.js', transform: customTransform, tty: true },
    { name: 'errors/v8_warning.js', transform: errTransform, tty: true },
    !skipForceColors ? { name: 'errors/force_colors.js', env: { FORCE_COLOR: 1 } } : null,
  ].filter(Boolean);
  for (const { name, transform, tty = false, env } of tests) {
    it(name, async () => {
      await snapshot.spawnAndAssert(fixtures.path(name), transform ?? defaultTransform, { tty: tty }, { env });
    });
  }
});
