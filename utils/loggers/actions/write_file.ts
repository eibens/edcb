import { withRunner } from "../../middleware/with_runner.ts";
import * as fmt from "../../fmt.ts";

type WriteFileAction = typeof Deno.writeFile;

export function withWriteFileLogger(log: (x: string) => void) {
  return withRunner<WriteFileAction>({
    value: (_, file, data) => {
      log(
        fmt.level("success")`wrote ${fmt.bytes(data.length)} to file ${
          fmt.url(file)
        }`,
      );
    },
  });
}
