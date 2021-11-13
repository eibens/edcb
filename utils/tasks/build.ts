import { parse } from "../../deps/flags.ts";
import { join } from "../../deps/path.ts";
import { build as help } from "../help.ts";
import { withMap } from "../middleware/with_map.ts";
// actions
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
  help: boolean;
  check: boolean;
  debug: boolean;
  ignore: string;
  temp: string;
  tests: string;
  codecov?: string;
};

function parseOptions(
  options: Partial<CheckOptions & { args: string[] }> = {},
): CheckOptions {
  const flags = parse(options.args || Deno.args, {
    boolean: ["check", "debug", "help"],
    string: ["ignore", "temp", "tests", "codecov"],
    alias: { help: "h" },
  });
  return {
    help: flags.help || options.help,
    debug: flags.debug || options.debug,
    check: flags.check || options.check,
    ignore: flags.ignore || options.ignore || "",
    temp: flags.temp || options.temp || "",
    tests: flags.tests || options.tests || "",
    codecov: flags.codecov !== undefined ? flags.codecov : options.codecov,
  };
}

export async function build(
  options: Partial<CheckOptions & { args: string[] }> = {},
) {
  const opts = parseOptions(options);

  if (opts.help) {
    console.log(help);
    return;
  }

  const tree = createTreeLogger(console.log);
  const task = new CheckTask();
  const Logger = withLogger<CheckTask>(
    tree,
    withMap<CheckTask>({
      exec: withExecLogger(tree, Boolean(opts.debug)),
      fetch: withFetchLogger(tree.item),
      makeTempDir: withMakeTempDirLogger(tree.item),
      mkdir: withMkdirLogger(tree.item),
      write: withWriteLogger(tree.item),
      writeFile: withWriteFileLogger(tree.item),
    }),
  );
  await Logger(task).build(opts);
}

class CheckTask {
  async build(options: CheckOptions) {
    await this.fmt({
      ignore: options.ignore,
      check: options.check,
    });

    await this.lint({
      ignore: options.ignore,
    });

    const temp = options.temp || await this.makeTempDir();
    const covDir = join(temp, "coverage");

    await this.coverage({
      dir: covDir,
      ignore: options.ignore,
      tests: options.tests,
    });

    if (options.codecov !== undefined) {
      const covFile = join(covDir, "coverage.lcov");
      const scriptFile = join(temp, "codecov.bash");
      const codecovUrl = "https://codecov.io/bash";

      await this.lcov({
        dir: covDir,
        file: covFile,
      });

      await this.codecov({
        token: options.codecov,
        lcovFile: covFile,
        scriptFile: scriptFile,
        scriptUrl: codecovUrl,
      });
    }
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
    token?: string;
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
    ignore: string;
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
