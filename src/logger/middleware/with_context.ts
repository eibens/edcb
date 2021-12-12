import { withGetter } from "./with_getter.ts";

// deno-lint-ignore ban-types
export function withContext<T extends object>(context: T): (x: T) => T {
  return withGetter<T>(() =>
    (value) => {
      if (typeof value !== "function") return value;
      return value.bind(context);
    }
  );
}
