import { cli } from "./cli.ts";

if (import.meta.main) {
  const bundles = [{
    tsconfig: "docs/tsconfig.json",
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
