import { assert } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { withContainer } from "./with_container.ts";

Deno.test("withContainer runs before", async () => {
  let flag = false;
  await withContainer({
    open: () => void (flag = true),
  })(() => Promise.resolve())();
  assert(flag);
});

Deno.test("withContainer runs after", async () => {
  let flag = false;
  await withContainer({
    close: () => void (flag = true),
  })(() => Promise.resolve())();
  assert(flag);
});
