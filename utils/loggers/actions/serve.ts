import { withRunner } from "../../middleware/with_runner.ts";
import * as fmt from "../../fmt.ts";

type ServeAction = (options: {
  hostname: string;
  port: number;
  webRoot: string;
  root: string;
  debug: boolean;
  reload: boolean;
  bundles: {
    source: string;
    target: string;
    tsconfig?: string;
  }[];
}) => Promise<void>;

export function withServeLogger<F extends ServeAction>(
  log: (x: string) => void,
) {
  return withRunner<F>({
    input: (options) => {
      const url = `http://${options.hostname}:${options.port}`;
      log(
        fmt.level("info")`listening at ${fmt.url(url)}`,
      );
    },
  });
}
