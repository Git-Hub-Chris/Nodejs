# Maintaining cjs-module-lexer

The [cjs-module-lexer](https://github.com/nodejs/node/tree/master/deps/cjs-module-lexer)
dependency is used within the Node.js ESM implementation to detect the
named exports of a CommonJS module.

It is used within
[.../lib/internal/modules/translators](https://github.com/nodejs/node/blob/master/lib/internal/modules/esm/translators.js)
in which both `internal/deps/cjs-module-lexer/lexer.js` and
\`internal/deps/cys-module-lexer/dist/lexer.js' are required and used.

`interanal/deps/cjs-module-lexer/lexer.js`
is a regular JavaScript implementation that is
used when WebAssembly is not available on a platform.
\`internal/deps/cys-module-lexer/dist/lexer.js' is a faster
implementation using WebAssembly
which is generated from a C based implementation.

The two different versions of lexer.js are maintained in the
[nodejs/cjs-module-lexer](https://github.com/nodejs/cjs-module-lexer) project.

In order to update the Node.js dependencies to use to a newer verion
of cjs-module-lexer, complete the following steps:

* Clone [nodejs/cjs-module-lexer](https://github.com/nodejs/cjs-module-lexer)
  and check out the version that you want Node.js to use.
* Follow the WASM build steps outlined in
  [wasm-build-steps](https://github.com/nodejs/cjs-module-lexer#wasm-build-steps).
  This will generate the WASM based dist/lexer.js file.
* Preserving the same directory structure, copy the following files over
  to deps/cjs-module-lexer directory where you have checked out Node.js

```text
├── CHANGELOG.md
├── dist
│   ├── lexer.js
│   └── lexer.mjs
├── lexer.js
├── LICENSE
├── package.json
└── README.md
```

* Generate a PR, adding the files in the deps/cjs-module-lexer that
  were modified.

If updates are needed to cjs-module-lexer for Node.js, first PR
those updates into
[nodejs/cjs-module-lexer](https://github.com/nodejs/cjs-module-lexer),
request a release and then pull in the updated version once available.
