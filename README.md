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
# show help text and options
edcb
edcb build -h
edcb serve -h

# run formatter, linter, tests, and bundler
edcb build

# start development server
edcb serve
```

## Config

Before it does anything else, [edcb] will look for the [dev.ts](dev.ts) module
in the working directory and run it if it exists. The `edcb` CLI then
essentially becomes an alias for `deno run -A --unstable dev.ts [args]`. This
allows one to lock a particular [edcb] version to a project, provide default
values for options, and add complex configuration such as the `bundles` option.

The [cli.ts](cli.ts) module exports the `cli` function, which can be used to
start the CLI manually using TypeScript. The specified options will serve as
defaults. For example, one can specify the `ignore` option for the `build`
command, which will then be used if the `--ignore` option was not provided on
the command-line. This is an example of a `dev.ts` file:

```ts
// lock edcb to a particular version ('xyz' in this case)
import { cli } from "https://deno.land/x/edcb@xyz/cli.ts";

const common = {
  bundles: [{
    source: "index.ts",
    target: "index.js",
  }],
};

await cli({
  build: {
    ...common,
    ignore: "index.js",
  },
  serve: {
    ...common,
    reload: true,
  },
});
```

Use individual commands by importing them from [mod.ts](mod.ts):

```ts
import { build } from "./mod.ts";

await build({
  ignore: "index.js",
});
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
