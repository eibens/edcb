import * as fmt from "./fmt.ts";
import { TreeLogger } from "./tree_logger.ts";
import { withGetter } from "./middleware/with_getter.ts";
import { withContainer } from "./middleware/with_container.ts";

export function withActionLogger<
  T extends Record<string, (...args: unknown[]) => Promise<never>>,
>(log: TreeLogger) {
  return withGetter<T>((key) => {
    let time = 0;
    return withContainer({
      open: () => {
        time = Date.now();
        log.open("meta", fmt.level("meta")`${key}`);
      },
      close: () => {
        const duration = Date.now() - time;
        log.close(fmt.level("meta")`${key} finished in ${fmt.time(duration)}`);
      },
    });
  });
}
