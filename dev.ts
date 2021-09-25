import { cli } from "./cli.ts";

if (import.meta.main) {
  await cli({
    check: {
      // These directories should not be linted or formatted.
      ignore: "deps,docs",
    },
    serve: {
      reload: true,
      webRoot: "docs",
      bundles: [{
        source: "docs/example_script.ts",
        target: "docs/example_bundle.js",
      }],
    },
  });
}
