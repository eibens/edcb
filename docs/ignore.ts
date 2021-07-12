// The /docs dir should be ignored.
// If any of these lines fail, there is a bug in edcb.

// This line will fail when `deno lint` is run.
const unusedVariable = 42;

// This line will fail when `deno fmt --check` is run.
     const indentedVariable = 42;
