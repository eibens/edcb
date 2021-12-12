import { withChain } from "../middleware/with_chain.ts";
import { withBinding } from "../middleware/with_binding.ts";
import { withMap } from "../middleware/with_map.ts";
import { withErrorLogger } from "./error.ts";
import { withActionLogger } from "./action.ts";
import { withLayoutLogger } from "./layout.ts";
import { createTreeLogger } from "../tree_logger.ts";
import { withExecLogger } from "./actions/exec.ts";
import { withFetchLogger } from "./actions/fetch.ts";
import { withMakeTempDirLogger } from "./actions/make_temp_dir.ts";
import { withMkdirLogger } from "./actions/mkdir.ts";
import { withWriteLogger } from "./actions/write.ts";
import { withWriteFileLogger } from "./actions/write_file.ts";
import { withReadFileLogger } from "./actions/read_file.ts";
import { withListenLogger } from "./actions/listen.ts";
import { withServeFileLogger } from "./actions/serve_file.ts";
import { Actions } from "../actions.ts";

type Async<T> = T | Promise<T>;

type Middleware<T> = (x: T) => T;

export type AsyncMap<T> = {
  // deno-lint-ignore no-explicit-any
  [K in keyof T]: T[K] extends (...x: any[]) => Async<any> ? T[K] : never;
};

export type LoggerOptions = {
  log: (str: string) => void;
  debug: boolean;
};

export function withLogger(
  options: LoggerOptions,
): Middleware<Actions> {
  const tree = createTreeLogger(options.log);

  const resultLogger = withMap<Actions>({
    exec: withExecLogger(tree, Boolean(options.debug)),
    fetch: withFetchLogger(tree.item),
    makeTempDir: withMakeTempDirLogger(tree.item),
    mkdir: withMkdirLogger(tree.item),
    write: withWriteLogger(tree.item),
    writeFile: withWriteFileLogger(tree.item),
    listen: withListenLogger(tree.item),
    readFile: withReadFileLogger(tree.item),
    serveFile: withServeFileLogger(tree.item),
  });

  // FIXME: lots of casts are necessary here

  const Logger = withChain(
    resultLogger,
    withErrorLogger(tree) as unknown as Middleware<Actions>,
    withActionLogger(tree) as unknown as Middleware<Actions>,
  );

  return withChain(
    withBinding(Logger),
    withLayoutLogger(tree) as unknown as Middleware<Actions>,
  );
}
