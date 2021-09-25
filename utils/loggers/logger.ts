import { withChain } from "../middleware/with_chain.ts";
import { withBinding } from "../middleware/with_binding.ts";
import { withErrorLogger } from "./error.ts";
import { withActionLogger } from "./action.ts";
import { withLayoutLogger } from "./layout.ts";
import { TreeLogger } from "../tree_logger.ts";

type Async<T> = T | Promise<T>;

export type AsyncMap<T> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof T]: T[K] extends (...x: any[]) => Async<any> ? T[K] : never;
};

export function withLogger<T extends AsyncMap<T>>(
  log: TreeLogger,
  resultLogger: (x: T) => T,
): (target: T) => T {
  const Logger = withChain(
    resultLogger,
    withErrorLogger(log),
    withActionLogger(log),
  );
  return withChain(
    withBinding(Logger),
    withLayoutLogger(log),
  );
}
