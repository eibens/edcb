# [edcb]

[edcb] is a build tool and task runner for Deno. It has support for formatting,
linting, testing, code coverage, bundling, and more, and it can be used via
command line or TypeScript import.

<!-- badges -->

[![License](https://img.shields.io/github/license/eibens/edcb?color=informational)](LICENSE)
[![deno.land/x](https://img.shields.io/badge/x/edcb-informational?logo=deno&label)](https://deno.land/x/edcb)
[![Repository](https://img.shields.io/github/v/tag/eibens/edcb?label&logo=github)](https://github.com/eibens/edcb)
[![ci](https://github.com/eibens/edcb/actions/workflows/ci.yml/badge.svg)](https://github.com/eibens/edcb/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/eibens/edcb/branch/master/graph/badge.svg?token=OV98O91EJ1)](https://codecov.io/gh/eibens/edcb)

<!-- /badges -->

![edcb in action](docs/video.gif)

# Features

- Formatting, linting, and testing of TypeScript code.
- Configurable HTTP server for developing web apps.
- File watcher with automatic reload via WebSockets.
- Dynamic generation of JavaScript bundles from TypeScript modules.
- Optional coverage file generation and upload to [codecov.io].
- CLI with rich diagnostic output (sub-processes, call-tree, performance).
- TypeScript API for [configuration and version locking](#config).
- Easy CI integration (see [ci.yml](.github/workflows/ci.yml)).

# Usage

Install the [edcb] CLI with [Deno]:

```sh
deno install -f -A --unstable https://deno.land/x/edcb/cli.ts
```

These are basic commands:

```sh
# show help text
edcb --help

# run formatter, linter, tests, and bundler
edcb build

# start development server
edcb serve
```

## Config

Before it does anything else, [edcb] will look for the [dev.ts](dev.ts) module
in the working directory and run it if it exists. This allows one to lock a
particular [edcb] version to a project, provide default values for options, and
add complex configuration such as the `bundles` option. The `edcb` CLI then
essentially becomes an alias for this:

```sh
deno run -A --unstable dev.ts [...args]
```

The [mod.ts](mod.ts) module exports the `cli` function, which can be used to run
the CLI using TypeScript. The specified options are used as defaults. For
example, one can specify the `ignore` option, which will then be used if the
`--ignore` option was not provided on the command-line. This is an example of a
`dev.ts` file that uses [edcb]'s TypeScript API:

```ts
/**
 * Always import a specific version of edcb.
 * Otherwise, your builds might break when edcb updates.
 *
 * @example
 *   import { cli } from "https://deno.land/x/edcb@v1.0.0/mod.ts";
 */
import { cli } from "./mod.ts";

await cli({
  ignore: "index.js",
  reload: true,
  bundles: [{
    source: "index.ts",
    target: "index.js",
  }],
});
```

[edcb]: #
[Deno]: https://deno.land
[codecov.io]: https://codecov.io
