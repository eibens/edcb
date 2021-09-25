import { withGetter } from "../middleware/with_getter.ts";
import { withRunner } from "../middleware/with_runner.ts";
import { TreeLogger } from "../tree_logger.ts";
import * as fmt from "../fmt.ts";

type FuncMap = Record<string, (...args: unknown[]) => Promise<never>>;

export function withErrorLogger<T extends FuncMap>(log: TreeLogger) {
  const errors = new Set<Error>();
  return withGetter<T>(() =>
    withRunner({
      error: (error, ..._): Promise<void> => {
        // Each error is only logged once when it is first thrown.
        if (errors.has(error)) throw error;
        errors.add(error);

        const text = String(error);
        const lines = String(error).trim().split("\n");
        log.open(
          "error",
          fmt.level("error")`${error.name}`,
        );
        lines.forEach((line) => log.line(line));
        log.close(
          fmt.level("error")`Message size: ${fmt.bytes(text.length)}`,
        );
        throw error;
      },
    })
  );
}
