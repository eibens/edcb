import { withRunner } from "../middleware/with_runner.ts";
import * as fmt from "../fmt.ts";

type MkdirAction = typeof Deno.mkdir;

export function withMkdirLogger(log: (x: string) => void) {
  return withRunner<MkdirAction>({
    value: (_, path) => {
      log(
        fmt.level("success")`created directory ${fmt.url(path)}`,
      );
    },
  });
}
