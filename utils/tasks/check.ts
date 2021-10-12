import { parseFlags } from "../flags.ts";
import { withMap } from "../middleware/with_map.ts";
// actions
import { check as _check } from "../actions/check.ts";
import { codecov } from "../actions/codecov.ts";
import { coverage } from "../actions/coverage.ts";
import { exec } from "../actions/exec.ts";
import { fmt } from "../actions/fmt.ts";
import { lcov } from "../actions/lcov.ts";
import { lint } from "../actions/lint.ts";
import { write } from "../actions/write.ts";
// loggers
import { withLogger } from "../loggers/logger.ts";
import { withExecLogger } from "../loggers/actions/exec.ts";
import { withFetchLogger } from "../loggers/actions/fetch.ts";
import { withMakeTempDirLogger } from "../loggers/actions/make_temp_dir.ts";
import { withMkdirLogger } from "../loggers/actions/mkdir.ts";
import { withWriteLogger } from "../loggers/actions/write.ts";
import { withWriteFileLogger } from "../loggers/actions/write_file.ts";
import { createTreeLogger } from "../tree_logger.ts";

export type CheckOptions = {
  ci: boolean;
  debug: boolean;
  ignore: string;
  temp: string;
  tests: string;
};

export function check(
  options: Partial<CheckOptions & { args: string[] }> = {},
) {
  const flags = parseFlags(options.args || Deno.args, {
    boolean: ["ci", "debug"],
    string: ["ignore", "temp", "tests"],
    default: {
      debug: Boolean(options.debug),
      ci: Boolean(options.ci),
      ignore: options.ignore || "",
      temp: options.temp || "",
      tests: options.tests || "",
    },
  });

  const tree = createTreeLogger(console.log);
  const task = new CheckTask();
  const Logger = withLogger<CheckTask>(
    tree,
    withMap<CheckTask>({
      exec: withExecLogger(tree, Boolean(flags.debug)),
      fetch: withFetchLogger(tree.item),
      makeTempDir: withMakeTempDirLogger(tree.item),
      mkdir: withMkdirLogger(tree.item),
      write: withWriteLogger(tree.item),
      writeFile: withWriteFileLogger(tree.item),
    }),
  );
  return Logger(task).check(flags);
}

class CheckTask {
  async check(options: CheckOptions) {
    return _check({
      ...options,
      temp: options.temp || await this.makeTempDir(),
      codecov: this.codecov.bind(this),
      coverage: this.coverage.bind(this),
      fmt: this.fmt.bind(this),
      lcov: this.lcov.bind(this),
      lint: this.lint.bind(this),
    });
  }

  exec(options: Deno.RunOptions) {
    return exec({
      ...options,
      run: (options) => Promise.resolve(Deno.run(options)),
    });
  }

  write(options: {
    file: string;
    data: Uint8Array | string;
    force: boolean;
  }) {
    return write({
      ...options,
      writeFile: this.writeFile.bind(this),
      lstat: Deno.lstat,
      mkdir: this.mkdir.bind(this),
    });
  }

  codecov(options: {
    lcovFile: string;
    scriptFile: string;
    scriptUrl: string;
  }) {
    return codecov({
      ...options,
      fetch: this.fetch.bind(this),
      exec: this.exec.bind(this),
      write: this.write.bind(this),
    });
  }

  coverage(options: {
    dir: string;
    tests: string;
  }) {
    return coverage({
      ...options,
      tests: options.tests,
      exec: this.exec.bind(this),
    });
  }

  lint(options: {
    ignore: string;
  }) {
    return lint({
      ...options,
      exec: this.exec.bind(this),
    });
  }

  fmt(options: {
    check: boolean;
    ignore: string;
  }) {
    return fmt({
      ...options,
      exec: this.exec.bind(this),
    });
  }

  lcov(options: {
    dir: string;
    file: string;
  }) {
    return lcov({
      ...options,
      exec: this.exec.bind(this),
      write: this.write.bind(this),
    });
  }

  fetch(input: string | URL, init?: RequestInit) {
    return globalThis.fetch(input, init);
  }

  writeFile(path: string | URL, data: Uint8Array) {
    return Deno.writeFile(path, data);
  }

  mkdir(path: string | URL, options?: Deno.MkdirOptions) {
    return Deno.mkdir(path, options);
  }

  makeTempDir() {
    return Deno.makeTempDir();
  }
}
