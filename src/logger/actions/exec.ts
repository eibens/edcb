import { withRunner } from "../middleware/with_runner.ts";
import { TreeLogger } from "../tree_logger.ts";
import * as fmt from "../fmt.ts";

type ExecAction = (options: Deno.RunOptions) => Promise<{
  success: boolean;
  stdout: Uint8Array;
  stderr: Uint8Array;
}>;

export function withExecLogger(log: TreeLogger, debug: boolean) {
  return withRunner<ExecAction>({
    input: (options) => {
      log.item(
        fmt.level("info")`$ ${options.cmd.join(" ")}`,
      );
    },
    value: (result) => {
      print(result.stderr, "stderr");
      print(result.stdout, "stdout");
      function print(b: Uint8Array, name: string) {
        const l = result.success ? "debug" : "error";
        const fmtMsg = fmt.level(l);
        const text = new TextDecoder().decode(b).trimEnd();
        const lines = text.split("\n");
        if (text) {
          log.open(l, fmtMsg`${name}`);
          if (debug || !result.success) {
            lines.forEach((line) => log.line(line));
          } else {
            const noun = lines.length === 1 ? "line" : "lines";
            log.item(
              fmt.level("info")`${lines.length} ${noun} hidden` +
                fmt.level("debug")
                  ` (use ${"--debug"} flag for complete output)`,
            );
          }
          log.close(fmtMsg`${name} received ${fmt.bytes(b.length)}`);
        }
      }
    },
  });
}
