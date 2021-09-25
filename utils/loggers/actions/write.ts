import { withRunner } from "../../middleware/with_runner.ts";
import * as fmt from "../../fmt.ts";

type WriteAction = (options: {
  file: string;
  force: boolean;
  data: string | Uint8Array;
}) => Promise<boolean>;

export function withWriteLogger(log: (x: string) => void) {
  return withRunner<WriteAction>({
    value: (success, options) => {
      if (!success) {
        log(
          fmt.level("warn")`skipped writing existing file ${
            fmt.url(options.file)
          }`,
        );
      }
    },
  });
}
