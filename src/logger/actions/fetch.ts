import { withRunner } from "../middleware/with_runner.ts";
import * as fmt from "../fmt.ts";

type FetchAction = (url: string | URL, init?: RequestInit) => Promise<Response>;

export function withFetchLogger(log: (x: string) => void) {
  return withRunner<FetchAction>({
    input: (url, init) => {
      log(
        fmt.level("info")`${init?.method || "GET"} request to ${fmt.url(url)}`,
      );
    },
    value: (response, url) => {
      log(
        fmt.level("success")
          `${response.status} "${response.statusText}" received from ${
            fmt.url(url)
          }`,
      );
    },
  });
}
