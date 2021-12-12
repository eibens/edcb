import { cli } from "./mod.ts";

if (import.meta.main) {
  await cli({
    webRoot: "docs",
    ignore: "docs",
    reload: true,
    bundles: [{
      tsconfig: "docs/tsconfig.json",
      source: "docs/example_script.ts",
      target: "example_script.js",
    }],
  });
}
