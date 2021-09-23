import { withChain } from "./with_chain.ts";
import { Edcb } from "../edcb.ts";
import { Logger } from "../logger.ts";
import { withRunner } from "./with_runner.ts";
import { withContainer } from "./with_container.ts";
import { withMap } from "./with_map.ts";
import { withGetter } from "./with_getter.ts";
import { withBinding } from "./with_binding.ts";

export function withLogger(log: Logger): (edcb: Edcb) => Edcb {
  const ResultLogger = withMap<Edcb>({
    exec: withRunner({
      input: log.onExecInput,
      value: log.onExecValue,
    }),
    fetch: withRunner({
      input: log.onFetchInput,
      value: log.onFetchValue,
    }),
    makeTempDir: withRunner({
      value: log.onMakeTempDirValue,
    }),
    mkdir: withRunner({
      value: log.onMkdirValue,
    }),
    write: withRunner({
      value: log.onWriteValue,
    }),
  });

  const TaskLogger = withGetter<Edcb>((key) => {
    let time = 0;
    return withContainer({
      open: () => {
        time = Date.now();
        log.onStart(key);
      },
      close: () => {
        const duration = Date.now() - time;
        log.onFinish(key, duration);
      },
    });
  });

  const ErrorLogger = withGetter<Edcb>((key) =>
    withRunner({
      error: (error, ..._): Promise<void> => {
        log.onError(error);
        throw error;
      },
    })
  );

  const LayoutLogger = withGetter<Edcb>(() => {
    return withRunner({
      input: () => {
        log.header();
      },
      value: () => {
        log.footer();
      },
      error: (error, ..._) => {
        log.footer(error);
      },
    });
  });

  const Logger = withChain(
    ResultLogger,
    ErrorLogger,
    TaskLogger,
  );

  return withChain(
    withBinding(Logger),
    LayoutLogger,
  );
}
