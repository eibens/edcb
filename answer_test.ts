import { double, halfAnswer } from "./answer.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.99.0/testing/asserts.ts";

Deno.test("halfAnswer is less than forty", () => {
  assert(halfAnswer < 40);
});

Deno.test("double calculates a correct answer", () => {
  assertEquals(double(halfAnswer), 42);
});
