import { Edcb } from "./utils/edcb.ts";
import { withLogger } from "./utils/middleware/with_logger.ts";
import { createLogger } from "./utils/logger.ts";

export function createEdcb(): Edcb {
  const log = createLogger(console.log, {
    ignoredTasks: ["check", "run"],
  });
  const Logger = withLogger(log);
  return Logger(new Edcb());
}
