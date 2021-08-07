import { assertEquals } from "https://deno.land/std@0.103.0/testing/asserts.ts";
import { main } from "./init.ts";

Deno.test("dummy test", () => {
  // TODO: actual tests
  assertEquals(typeof main, "function");
});
