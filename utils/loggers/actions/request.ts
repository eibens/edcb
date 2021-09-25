import { withRunner } from "../../middleware/with_runner.ts";
import * as fmt from "../../fmt.ts";

type RequestHandler = (options: {
  request: Request;
  webRoot: string;
  updateBundle: (url: string) => Promise<void>;
}) => Promise<Response>;

export function withRequestLogger(log: (x: string) => void) {
  return withRunner<RequestHandler>({
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
