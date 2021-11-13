import { cli } from "./cli.ts";

if (import.meta.main) {
  await cli({
    build: {
      ignore: "build",
    },
    serve: {
      reload: true,
      bundles: [{
        source: "docs/example_script.ts",
        target: "example_script.js",
      }],
    },
  });
}
