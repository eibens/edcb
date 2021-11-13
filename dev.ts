import { cli } from "./cli.ts";

if (import.meta.main) {
  const bundles = [{
    source: "docs/example_script.ts",
    target: "example_script.js",
  }];
  await cli({
    build: {
      ignore: "build",
      bundles,
    },
    serve: {
      reload: true,
      bundles,
    },
  });
}
