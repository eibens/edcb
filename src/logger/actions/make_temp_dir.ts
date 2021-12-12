import { withRunner } from "../middleware/with_runner.ts";
import * as fmt from "../fmt.ts";

type MakeTempDirAction = typeof Deno.makeTempDir;

export function withMakeTempDirLogger(log: (x: string) => void) {
  return withRunner<MakeTempDirAction>({
    value: (path) => {
      log(
        fmt.level("success")`created temporary directory ${fmt.url(path)}`,
      );
    },
  });
}
