import { cli } from "./cli.ts";

if (import.meta.main) {
  const options = {
    webRoot: "docs",
    bundles: [{
      tsconfig: "docs/tsconfig.json",
      source: "docs/example_script.ts",
      target: "example_script.js",
    }],
  };
  await cli({
    build: {
      ...options,
      ignore: "build",
    },
    serve: {
      ...options,
      reload: true,
    },
  });
}
