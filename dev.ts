import { createEdcb } from "./mod.ts";

if (import.meta.main) {
  const edcb = createEdcb();
  await edcb.build({
    // These directories should not be linted or formatted.
    ignore: "deps,docs",
  });
}
