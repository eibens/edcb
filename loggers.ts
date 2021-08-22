import { Actions, chain, Hooks } from "./factory.ts";
import { version } from "./version.ts";
import * as Task from "./utils/task.ts";
import * as fmt from "./deps/colors.ts";

const innerLoggers: Partial<Hooks> = {
  exec: (f) =>
    async (...args) => {
      console.log(fmt.gray("‾".repeat(60)));
      const result = await f(...args);
      console.log(fmt.gray("_".repeat(60)));
      return result;
    },
  write: (f) =>
    async (options) => {
      const result = await f(options);
      const file = fmt.blue(fmt.underline(options.file));
      if (!result) {
        console.log(fmt.yellow(`Skipped existing file ${file}.`));
      } else {
        const size = fmt.brightGreen(String(options.data.length));
        console.log(fmt.green(`Wrote ${size} bytes to file ${file}.`));
      }
      return result;
    },
};

const outerLoggers: Partial<Hooks> = {
  exec: task("exec")({
    logArgs: (options) => fmt.bgBlack(options.cmd.join(" ")),
  }),
  write: task("write")({
    logArgs: (options) => fmt.blue(fmt.underline(String(options.file))),
  }),
  edcb: task("edcb")({
    logArgs: () => {
      const tag = version.tag || "<unknown>";
      return `version ${tag}`;
    },
  }),
  mkdir: task("mkdir")({
    logArgs: (path) => fmt.blue(fmt.underline(String(path))),
  }),
  fetch: task("fetch")({
    logArgs: (url) => fmt.blue(fmt.underline(String(url))),
    logResult: (response) => `${response.status} - ${response.statusText}`,
  }),
  makeTempDir: task("makeTempDir")({
    logResult: (result) => result,
  }),
};

export const loggers = chain(innerLoggers, outerLoggers);

function task<K extends keyof Actions>(key: K) {
  type A = Actions[K];
  type X = Parameters<A>;
  type Y = ReturnType<A>;
  type R = Y extends Promise<infer y> ? y : never;

  return (options: Partial<{
    logArgs: (...args: X) => string;
    logResult: (result: R) => string;
  }> = {}) => {
    const label = fmt.bold(fmt.white(String(key)));
    return Task.create<X, Y>({
      pre: (state) => {
        logPre(
          label,
          options.logArgs ? options.logArgs(...state.input) : undefined,
        );
        return Promise.resolve();
      },
      error: (state) => {
        logError(label, state.error.message);
        return Promise.resolve();
      },
      result: (state) => {
        logResult(
          label,
          options.logResult ? options.logResult(state.result) : undefined,
        );
        return Promise.resolve();
      },
      post: (state) => {
        logPost(label, state.endTime - state.startTime);
        return Promise.resolve();
      },
    });
  };
}

function logPre(label: string, args?: string) {
  console.log(fmt.cyan(
    `Started ${label}${
      args ? ` with ${fmt.brightCyan(fmt.italic(args))}` : ""
    }.`,
  ));
  return Promise.resolve();
}

function logResult(label: string, result?: string) {
  if (result) {
    console.log(fmt.green(
      `Completed ${label} with ${fmt.brightGreen(fmt.italic(result))}.`,
    ));
  }
  return Promise.resolve();
}

function logError(label: string, message: string) {
  console.error(fmt.red(
    `Failed ${label} because ${fmt.brightRed(fmt.italic(message))}.`,
  ));
  return Promise.resolve();
}

function logPost(label: string, duration: number) {
  console.log(fmt.blue(
    `Finished ${label} in ${fmt.brightBlue(duration.toFixed(3))} seconds.`,
  ));
  return Promise.resolve();
}
