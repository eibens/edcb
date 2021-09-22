import { withContext } from "./with_context.ts";
import { withGetter } from "./with_getter.ts";

// deno-lint-ignore ban-types
export function withBinding<T extends object>(
  middleware: (x: T) => T,
): (x: T) => T {
  return (x: T) => {
    // NOTE: "cyclic" dependency between the result and the wrapped result.
    // This is necessary for correctly injecting the bindings.
    const Lookup = withGetter<T>((key) => () => wrapped[key]);
    const result = Lookup(x);
    const Context = withContext(result);
    const bound = Context(x);
    const wrapped = middleware(bound);
    return result;
  };
}
