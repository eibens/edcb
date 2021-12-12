import { withRunner } from "../middleware/with_runner.ts";
import * as fmt from "../fmt.ts";

type ReadFileAction = typeof Deno.readFile;

export function withReadFileLogger(log: (x: string) => void) {
  return withRunner<ReadFileAction>({
    input: (file) => {
      log(
        fmt.level("info")`reading file ${fmt.url(file)}`,
      );
    },
    value: (data, file) => {
      log(
        fmt.level("success")`read ${fmt.bytes(data.length)} from file ${
          fmt.url(file)
        }`,
      );
    },
  });
}
