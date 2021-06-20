#!/bin/bash

# Exit if one command fails.
set -e

# Use temporary files to avoid cleanup logic.
COV_DIR=$(mktemp -d)
COV_FILE=$(mktemp)
CI_FILE=.github/workflows/ci.yml
CI_YAML=$(cat <<'END_HEREDOC'
name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: denoland/setup-deno@v1
      # NOTE: 'master' should be replaced with a specific version.
      - uses: eibens/edcb@master
        with:
          version: master
END_HEREDOC
)

# Initialization with 'init' command.
if [ "$1" = "init" ]; then
  # Prevent overwriting existing files.
  set -o noclobber

  # Create GitHub Actions workflow file.
  mkdir -p $(dirname "$CI_FILE")
  echo "$CI_YAML" > "$CI_FILE"

  # Do not continue after init.
  exit 0
fi

# Lint and check formatting.
deno lint
deno fmt --check

# Run tests and generate coverage profile.
deno test -A --unstable --coverage="$COV_DIR"

# Print coverage info to stdout.
deno coverage --unstable "$COV_DIR"

# Only run this from GitHub Actions.
if [ "$CI" = true ]; then

  # Generate coverage file.
  deno coverage --lcov "$COV_DIR" > "$COV_FILE"

  # Upload coverage file.
  bash <(curl -s https://codecov.io/bash) -f "$COV_FILE"
fi
