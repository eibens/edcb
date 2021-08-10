# [edcb]

[edcb] is a workflow for building a [Deno] project locally and in a CI
environment. Since [edcb] is itself implemented in TypeScript for [Deno], it is
used to build itself.

[![License][license-shield]](LICENSE) [![Deno doc][deno-doc-shield]][deno-doc]
[![Deno module][deno-land-shield]][deno-land]
[![Github
tag][github-shield]][github] [![Build][build-shield]][build]
[![Code
coverage][coverage-shield]][coverage]

# Motivation

In order to make a [Deno] project production ready, the code should be
formatted, linted, and tested. This workflow is usually very similar across
projects. [edcb] is an attempt of generalizing these tasks across projects and
across local systems and CI environments.

# Usage

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
   local systems, which is the intended behavior.

```sh
edcb --ci
```

Alternatively, one can set the `CI` environment variable to `true` (which is
done automatically by [GitHub Actions]).

```sh
export CI=true
edcb
```

The `init` command generates a set of boilerplate files.

- [dev.ts](dev.ts) script for building the repository. It can be run with
  `deno run -A dev.ts`.
- [.github/workflows/ci.yml](.github/workflows/ci.yml) runs `dev.ts` on GitHub
  Actions.

```sh
# Generates missing files.
edcb init

# Generates and overwrites files.
edcb init --force
```

[edcb]: #
[Deno]: https://deno.land
[GitHub Actions]: https://github.com/features/actions
[codecov.io]: https://codecov.io
[answer.ts]: answer.ts

<!-- badges -->

[github]: https://github.com/eibens/edcb
[github-shield]: https://img.shields.io/github/v/tag/eibens/edcb?label&logo=github
[coverage-shield]: https://img.shields.io/codecov/c/github/eibens/edcb?logo=codecov&label
[license-shield]: https://img.shields.io/github/license/eibens/edcb?color=informational
[coverage]: https://codecov.io/gh/eibens/edcb
[build]: https://github.com/eibens/edcb/actions/workflows/ci.yml
[build-shield]: https://img.shields.io/github/workflow/status/eibens/edcb/ci?logo=github&label
[deno-doc]: https://doc.deno.land/https/deno.land/x/edcb/example.ts
[deno-doc-shield]: https://img.shields.io/badge/doc-informational?logo=deno
[deno-land]: https://deno.land/x/edcb
[deno-land-shield]: https://img.shields.io/badge/x/edcb-informational?logo=deno&label
