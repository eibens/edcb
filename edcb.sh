#!/bin/bash

# Exit if one command fails.
set -e

# Use temporary files to avoid cleanup logic.
COV_DIR=$(mktemp -d)
COV_FILE=$(mktemp)
CI_FILE=.github/workflows/ci.yml
IGNORE="./docs"
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

# 'init' command
if [ "$1" = "init" ]; then
  # Prevent overwriting existing files.
  set -o noclobber

  # Create GitHub Actions workflow file.
  mkdir -p $(dirname "$CI_FILE")
  echo "$CI_YAML" > "$CI_FILE"
  echo "Wrote file: ${CI_FILE}"

  # Do not continue after init.
  exit 0
fi

# 'upgrade' command
if [ "$1" = "upgrade" ]; then

  # Install latest version.
  curl -sL https://deno.land/x/edcb/edcb.sh > ~/bin/edcb
  chmod +x ~/bin/edcb
  echo "Upgrade complete."
  
  # Do not continue after init.
  exit 0
fi

# Format files (just check in CI).
if [ "$CI" == true ]; then
  deno fmt --check
else
  deno fmt
fi

# Run linter after formatting, since it is more high-level.
deno lint --ignore="$IGNORE"

# Run tests and generate coverage profile.
deno test -A --unstable --coverage="$COV_DIR"

# Print coverage info to stdout.
deno coverage --unstable "$COV_DIR"

# Upload coverage in CI.
if [ "$CI" = true ]; then

  # Generate coverage file.
  deno coverage --lcov "$COV_DIR" > "$COV_FILE"

  # Upload coverage file.
  bash <(curl -s https://codecov.io/bash) -f "$COV_FILE"
fi
