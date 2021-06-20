# [edcb]

> [edcb] (for _Eibens-Deno Continuous Build_) is an opinionated process for
> building a [Deno] project locally and in a CI environment. It is implemented
> as a bash script and can be used in a local shell and [GitHub Actions].

[![License][license-shield]](LICENSE) [![Deno doc][deno-doc-shield]][deno-doc]
[![Deno module][deno-land-shield]][deno-land]
[![Github tag][github-shield]][github] [![Build][build-shield]][build]
[![Code coverage][coverage-shield]][coverage]

# Motivation

In order to make a [Deno] project production ready, the code should be
formatted, linted, and tested. This process is usually very similar across
projects. [edcb] is an attempt of generalizing these tasks across projects and
across local systems and CI environments.

# Documentation

The latest version of the [edcb.sh] file can be installed in a shell:

```sh
# Downloads edcb.sh and makes it executable.
curl -s https://deno.land/x/edcb/edcb.sh > /usr/bin/edcb && chmod +x /usr/bin/edcb
```

Building a project is now as simple as running this in the project root:

```sh
edcb
```

The [ci.yml](.github/workflows/ci.yml) workflow file demonstrates how [edcb] can
be used with [GitHub Actions]. If the `CI` environment variable is `true` (which
is automatically set by GitHub), code coverage will be uploaded to [codecov].

[edcb]: #
[Deno]: https://deno.land
[GitHub Actions]: https://github.com/features/actions
[codecov]: https://codecov.io
[edcb.sh]: edcb.sh

<!-- badges -->

[github]: https://github.com/eibens/edcb
[github-shield]: https://img.shields.io/github/v/tag/eibens/edcb?label&logo=github
[coverage-shield]: https://img.shields.io/codecov/c/github/eibens/edcb?logo=codecov&label
[license-shield]: https://img.shields.io/github/license/eibens/edcb?color=informational
[coverage]: https://codecov.io/gh/eibens/edcb
[build]: https://github.com/eibens/edcb/actions/workflows/ci.yml
[build-shield]: https://img.shields.io/github/workflow/status/eibens/edcb/ci?logo=github&label
[deno-doc]: https://doc.deno.land/https/deno.land/x/edcb/mod.ts
[deno-doc-shield]: https://img.shields.io/badge/doc-informational?logo=deno
[deno-land]: https://deno.land/x/edcb
[deno-land-shield]: https://img.shields.io/badge/x/edcb-informational?logo=deno&label
