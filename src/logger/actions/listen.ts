import { withRunner } from "../middleware/with_runner.ts";
import * as fmt from "../fmt.ts";

type ListenAction = (options: {
  hostname: string;
  port: number;
  onSocket: (socket: WebSocket) => void;
  onRequest: (request: Request) => Promise<Response>;
}) => Promise<void>;

export function withListenLogger<F extends ListenAction>(
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
