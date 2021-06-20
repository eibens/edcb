#!/bin/bash

# Exit if one command fails.
set -e

# Use temporary files to avoid cleanup logic.
COV_DIR=$(mktemp -d)
COV_FILE=$(mktemp)

# Lint and check formatting.
deno lint
deno fmt --check

# Run tests and generate coverage profile.
deno test -A --unstable --coverage=$COV_DIR

# Print coverage info to stdout.
deno coverage --unstable $COV_DIR

# Only run this from GitHub Actions.
if [ "$CI" = true ]; then

  # Generate coverage file.
  deno coverage --lcov $COV_DIR > $COV_FILE

  # Upload coverage file.
  bash <(curl -s https://codecov.io/bash) -f $COV_FILE
fi
