# [edcb]

[edcb] is a build tool and task runner for Deno. It has support for formatting,
linting, testing, code coverage, bundling, and more, and it can be used via
command line or TypeScript import.

[![License][license-shield]](LICENSE)
[![Deno module][deno-land-shield]][deno-land]
[![Github
tag][github-shield]][github] [![Build][build-shield]][build]
[![Code
coverage][coverage-shield]][coverage]

![edcb in action](docs/video.gif)

# Configuration

[edcb] can be be invoked via TypeScript. The [cli.ts](cli.ts) module exports the
[edcb CLI](#cli). The specified options will serve as defaults. For example, one
can specify the `ignore` option for the `check` command, which will then be used
if the `--ignore` flag was not provided on the command-line.

[edcb] will look for the [dev.ts](dev.ts) module in the working directory and
run it if it exists. This allows one to lock a particular [edcb] version to a
project. The `edcb` CLI then essentially becomes an alias for
`deno run -A --unstable dev.ts [args]`.

```ts
// file: dev.ts
import { cli } from "./cli.ts";

await cli({
  check: {
    ignore: "deps",
  },
  serve: {
    port: 1234,
    bundles: [{
      source: "index.ts",
      target: "index.js",
    }],
  },
});
```

Commands can be used individually by importing them from [mod.ts](mod.ts).

```ts
import { check } from "./mod.ts";

await check({
  ignore: "deps",
});
```

# CLI

The [edcb] CLI can be installed with [Deno].

```sh
deno install -f -A --unstable https://deno.land/x/edcb/cli.ts
```

After installation, one may run commands in the project directory.

```sh
edcb <command>
```

Supported commands:

- [check](#check)
- [serve](#serve)

## Common Flags

These are flags that are available for all commands.

### `--debug`

Displays sub-process output. Per default, the output is only logged if the
process failed. For example, a developer may use the flag to see the full code
coverage report in order to write tests for the missing lines.

```sh
edcb <command> --debug
```

## `check`

Formats, lints, and tests the project. Code coverage will be displayed and can
optionally be uploaded to [codecov.io].

```sh
edcb check
```

### `--ci`

Changes the behavior as follows:

1. Runs the [Deno] formatter with the `--check` flag.
2. Generates a test coverage file.
3. Uploads the test coverage file to [codecov.io]. This step likely fails on
   local systems.

```sh
edcb check --ci
```

### `--ignore`

Ignores files and directories during formatting and linting. It has the same
format as the `--ignore` option of `deno fmt` and `deno lint`.

```sh
edcb check --ignore=deps,docs
```

### `--temp`

Provides the directory that is used to store temporary files. If none is
specified, a directory will be created in the standard location for temporary
files (e.g. `/tmp`).

```sh
edcb check --temp=some/path
```

### `--tests`

Selects test files in a sub-directory. This option is limited to a single file
pattern.

```sh
edcb check --tests=src/test/*
```

## `serve`

Starts an HTTP server with an optional WebSocket server that broadcasts file
system changes. Note that the `serve` command would usually be used in
conjunction with a [edcb configuration file](#configuration). The reason is that
the `bundles` option cannot be specified via CLI.

```sh
edcb serve
```

### `--hostname`

Specify the hostname used for the HTTP listener.

```sh
edcb serve --port=8080
```

### `--port`

Specify the port number used for the HTTP listener.

```sh
edcb serve --hostname=localhost
```

### `--reload`

Enable file change broadcasts via WebSocket.

```sh
edcb serve --reload
```

### `--root`

Specify the root path for the file watcher.

```sh
edcb serve --root=.
```

### `--web-root`

Specify the public directory from which static files are served.

```sh
edcb serve --web-root=docs
```

[edcb]: #
[Deno]: https://deno.land
[GitHub Actions]: https://github.com/features/actions
[codecov.io]: https://codecov.io

<!-- badges -->

[github]: https://github.com/eibens/edcb
[github-shield]: https://img.shields.io/github/v/tag/eibens/edcb?label&logo=github
[coverage-shield]: https://img.shields.io/codecov/c/github/eibens/edcb?logo=codecov&label
[license-shield]: https://img.shields.io/github/license/eibens/edcb?color=informational
[coverage]: https://codecov.io/gh/eibens/edcb
[build]: https://github.com/eibens/edcb/actions/workflows/ci.yml
[build-shield]: https://img.shields.io/github/workflow/status/eibens/edcb/ci?logo=github&label
[deno-land]: https://deno.land/x/edcb
[deno-land-shield]: https://img.shields.io/badge/x/edcb-informational?logo=deno&label
