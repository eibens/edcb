# [edcb]

[edcb] is a tool for building a [Deno] project locally and in a CI environment.
It has support for formatting, linting, testing, code coverage, bundling, and
more, and it can be used via command line or TypeScript import.

[![License][license-shield]](LICENSE)
[![Deno module][deno-land-shield]][deno-land]
[![Github
tag][github-shield]][github] [![Build][build-shield]][build]
[![Code
coverage][coverage-shield]][coverage]

# CLI

The [edcb] CLI can be installed with [Deno].

```sh
deno install -f -A https://deno.land/x/edcb/cli.ts
```

After installation, building a project is as simple as running [edcb] in the
project root.

```sh
# Formats, lints, and runs tests in the current directory.
edcb
```

The `--ignore` option can be used to ignore files and directories. It has the
same format as the `--ignore` option of `deno fmt` and `deno lint`.

```sh
# Prevent formatting or linting of files in the `docs` directory.
edcb --ignore=docs
```

The `--ci` flag changes the behavior as follows:

1. Runs the [Deno] formatter with the `--check` flag.
2. Generates a test coverage file.
3. Uploads the test coverage file to [codecov.io]. This step likely fails on
   local systems.

```sh
edcb --ci
```

Alternatively, one can set the `CI` environment variable to `true` (which is
done automatically by [GitHub Actions]).

```sh
export CI=true
edcb
```

The `init` command generates boilerplate files.

- [dev.ts](dev.ts) builds the repository. Run it with `deno run -A dev.ts`.
- [.github/workflows/ci.yml](.github/workflows/ci.yml) defines a CI workflow for
  GitHub Actions.

```sh
# Generates missing files.
edcb init

# Generates and overwrites files.
edcb init --force

# Use a specific version of edcb in the dev.ts file.
edcb init --version=1.2.3
```

# Configuration

[edcb] can be configured by creating a TypeScript module named `dev.ts`. It
should import [edcb] and call the `cli` function defined in [cli.ts](cli.ts)
with custom options. For example, one can specify the `check.ignore` option,
which will then be used if the `--ignore` option was not provided:

```ts
// NOTE: Change this URL to a specific version of edcb.
import { cli } from "https://deno.land/x/edcb/cli.ts";

await cli({
  check: {
    ignore: "docs",
  },
});
```

When `edcb` is run in a folder with a `dev.ts` file, it will pass the arguments
to `deno run -A dev.ts` instead. This prevents a developer from accidentally
building a project with a local [edcb] version that differs from the version
defined in `dev.ts`. The GitHub Actions workflow file also runs `dev.ts` to
avoid this problem.

# Actions

Actions implement the particular tasks that can be performed by [edcb]. Each
action is defined through a _builder_ function, which takes a set of
dependencies and returns an async action function. This separation of
dependencies and options allows for loose coupling, testing with mocks, and the
use of hooks to monitor or change action behavior. There are native actions
without dependencies, such as `Deno.writeFile`, and
[composed actions](actions/mod.ts) that depend on other actions, such as
`check`, which uses `fmt`, `lint`, `codecov`, and others. Extending [edcb] with
custom actions is currently not possible.

# Hooks

Hooks are a way of overriding [edcb]'s behavior. A hook is a function that
receives a function and returns a function of the same type. For example, one
could build a hook for the `write` action that prints the file size to the
console like this:

```ts
import { cli } from "https://deno.land/x/edcb/mod.ts";

await cli({
  hooks: {
    write: (write) => {
      return (file, data) => {
        console.log(`Writing ${data.length} bytes.`);
        return await write(file, data);
      };
    },
  },
});
```

Per default, [edcb] uses the hooks defined in [loggers.ts](loggers.ts). When the
`hooks` options is provided, the default hooks will be overridden. The `chain`
function can be used to combine multiple hooks. In this example, the `write`
action will throw if the file would be bigger than one megabyte. The error will
then be handled by `loggers`:

```ts
import { cli, Hooks, loggers } from "https://deno.land/x/edcb/mod.ts";

const customHooks: Hooks = {
  write: (write) => {
    return (file, data) => {
      if (data.length > 1_000_000) {
        throw new Error("file is too big");
      }
      return await write(file, data);
    };
  },
};

await cli({
  hooks: chain(customHooks, loggers),
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
