# [edcb]

> [edcb] (for _Eibens-Deno Continuous Build_) is an opinionated workflow for
> building a [Deno] project locally and in a CI environment. It is implemented
> as a bash script and can be used in a local shell and with [GitHub Actions].

[![License][license-shield]](LICENSE) [![Deno doc][deno-doc-shield]][deno-doc]
[![Deno module][deno-land-shield]][deno-land]
[![Github tag][github-shield]][github] [![Build][build-shield]][build]
[![Code coverage][coverage-shield]][coverage]

# Motivation

In order to make a [Deno] project production ready, the code should be
formatted, linted, and tested. This workflow is usually very similar across
projects. [edcb] is an attempt of generalizing these tasks across projects and
across local systems and CI environments.

# Example

The [edcb] project is itself built with [edcb]. Currently, no actual TypeScript
API is exported by this project. The [answer.ts] module serves as a placeholder
for testing.

# Usage

The latest version of the [edcb.sh] file can be installed in a shell:

```sh
# Downloads edcb.sh and makes it executable.
curl -sL https://deno.land/x/edcb/edcb.sh > ~/bin/edcb && chmod +x ~/bin/edcb
```

The [edcb] version can be specified in the URL:

```sh
# Replace {ref} with the desired Git tag or branch.
curl -sL https://deno.land/x/edcb@{ref}/edcb.sh > ~/bin/edcb && chmod +x ~/bin/edcb
```

Once installed, the `upgrade` command can be used to install the latest version:

```sh
# Let edcb upgrade itself.
edcb upgrade
```

Building a project is now as simple as running [edcb] in the project root:

```sh
# Formats, lints, and runs tests in the current directory.
edcb
```

Setting the `CI` environment variable to `true` (which is done automatically by
[GitHub Actions]) changes the behavior as follows:

1. Runs the [Deno] formatter with the `--check` flag.
2. Generates a test coverage file.
3. Uploads the test coverage file to [codecov.io]. This step likely fails on
   local systems, which is the intended behavior.

```sh
export CI=true
edcb
```

The [ci.yml](.github/workflows/ci.yml) workflow file demonstrates how [edcb] can
be used with [GitHub Actions]. The `init` command generates the workflow file
automatically:

```sh
# Generates the workflow file for GitHub Actions.
edcb init
```

[edcb]: #
[Deno]: https://deno.land
[GitHub Actions]: https://github.com/features/actions
[codecov.io]: https://codecov.io
[edcb.sh]: edcb.sh
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
