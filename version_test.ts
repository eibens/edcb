import { assertEquals } from "https://deno.land/std@0.103.0/testing/asserts.ts";
import { getTag, getUrl } from "./version.ts";

Deno.test("getTag returns undefined for file URL", () => {
  assertEquals(getTag("file://some/file.ts"), undefined);
});

Deno.test("getTag returns undefined non official URL", () => {
  assertEquals(getTag("https://my.land/x/edcb@v1.2.3/cli.ts"), undefined);
});

Deno.test("getTag returns tag for official URL", () => {
  assertEquals(getTag("https://deno.land/x/edcb@v1.2.3/cli.ts"), "v1.2.3");
});

Deno.test("getUrl returns URL with tag", () => {
  assertEquals(getUrl("v1.2.3"), "https://deno.land/x/edcb@v1.2.3");
});

Deno.test("getUrl returns URL without tag", () => {
  assertEquals(getUrl(), "https://deno.land/x/edcb");
});
