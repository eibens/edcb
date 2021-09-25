import { check } from "./mod.ts";

if (import.meta.main) {
  await check({
    // These directories should not be linted or formatted.
    ignore: "deps,docs",
  });
}
