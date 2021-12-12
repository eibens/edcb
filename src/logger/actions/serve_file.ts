import { withRunner } from "../middleware/with_runner.ts";
import * as fmt from "../fmt.ts";

type ServeFileAction = (options: {
  request: Request;
  webRoot: string;
}) => Promise<Response>;

export function withServeFileLogger(log: (x: string) => void) {
  return withRunner<ServeFileAction>({
    input: (options) => {
      const { pathname } = new URL(options.request.url);
      log(
        fmt.level("info")`${options.request.method} ${pathname}`,
      );
    },
    value: (response) => {
      const status = String(response.status)[0];
      const levels: Record<string, fmt.Level> = {
        1: "meta",
        2: "success",
        3: "io",
        4: "warn",
        5: "error",
      };
      const level: fmt.Level = levels[status] || "info";
      log(
        fmt.level(level)`response status: ${response.status}`,
      );
    },
  });
}
