import { join } from "https://deno.land/std@0.103.0/path/mod.ts";
import {
  fromTaskNameHandler,
  runTask,
  TaskHandler,
  TaskNameHandler,
  toTask,
} from "../utils/task.ts";
import { run as runImpl } from "../utils/run.ts";

/**
 * Defines event hooks for monitoring the check process.
 */
export type CheckHandlers = {
  run: TaskHandler<[Deno.RunOptions], Uint8Array>;
  writeFile: TaskHandler<[string, Uint8Array]>;
  mkdir: TaskHandler<[string]>;
  fetch: TaskHandler<[Request], Response>;
  format: TaskHandler<[boolean]>;
  lint: TaskHandler;
  test: TaskHandler;
  coverage: TaskHandler;
  lcov: TaskHandler;
  codecov: TaskHandler;
};

/**
 * Defines injectable dependencies for the check function.
 */
export type CheckDependencies = {
  writeFile: (typeof Deno)["writeFile"];
  mkdir: (typeof Deno)["mkdir"];
  run: (typeof Deno)["run"];
  fetch: typeof fetch;
};

/**
 * Defines configuration for the check workflow.
 */
export type CheckOptions = CheckDependencies & {
  /**
   * Root directory of the project.
   */
  cwd: string;

  /**
   * Files and directories that should not be formatted or linted.
   *
   * Corresponds to the format used for the `--ignore` flag for `deno fmt`
   * or `deno lint`.
   */
  ignore: string;

  /**
   * Flag indicating that the checks should be run as if in a CI environment.
   */
  ci: boolean;

  /**
   * Path where temporary files will be stored.
   */
  tempDir: string;

  /**
   * Object that holds check event handlers.
   */
  handlers: CheckHandlers;
};

/**
 * Runs the check workflow.
 *
 * @param options is the configuration for the check workflow.
 * @throws if a step in the workflow fails.
 */
export async function check(options: CheckOptions) {
  const handler = fromTaskNameHandler(
    options.handlers as TaskNameHandler,
  );

  // Wrap dependencies.

  const fetch = toTask(
    "fetch",
    handler,
    options.fetch,
  );

  const mkdir = toTask(
    "mkdir",
    handler,
    options.mkdir,
  );

  const writeFile = toTask(
    "writeFile",
    handler,
    options.writeFile,
  );

  const run = toTask(
    "run",
    handler,
    async (command: Deno.RunOptions) => {
      return await runImpl({
        cwd: options.cwd,
        ...command,
      }, options.run);
    },
  );

  // Run tasks

  const ignore = ["--ignore=" + options.tempDir, options.ignore].join(",");
  await runTask("format", handler, [options.ci], async (check) => {
    if (check) {
      // Check but don't modify code in CI.
      await run({
        cmd: ["deno", "fmt", ignore, "--check"],
      });
    } else {
      await run({
        cmd: ["deno", "fmt", ignore],
      });
    }
  });

  // Run linter after formatting, since it is more high-level.
  await runTask("lint", handler, [], async () => {
    await run({
      cmd: ["deno", "lint", ignore],
    });
  });

  // Paths for storing generated data outside project root.
  await mkdir(options.tempDir, { recursive: true });
  const covDir = join(options.tempDir, "coverage");
  const covFile = join(covDir, "coverage.lcov");
  const scriptFile = join(options.tempDir, "codecov.bash");

  // Run tests and generate coverage profile.
  await runTask("test", handler, [], async () => {
    await run({
      cmd: ["deno", "test", "-A", "--unstable", "--coverage=" + covDir],
    });
  });

  // Print coverage info to stdout.
  await runTask("coverage", handler, [], async () => {
    await run({
      cmd: ["deno", "coverage", "--unstable", covDir],
    });
  });

  // Upload code coverage (only works from CI, at least for now).
  if (options.ci) {
    // Generate coverage file.
    await runTask("lcov", handler, [], async () => {
      const lcov = await run({
        cmd: ["deno", "coverage", "--lcov", covDir],
        stdout: "piped",
      });

      // Store coverage report outside project root.
      await writeFile(covFile, lcov);
    });

    await runTask("codecov", handler, [], async () => {
      // Download codecov upload script.
      const scriptUrl = "https://codecov.io/bash";
      const scriptBash = await (await fetch(scriptUrl))
        .arrayBuffer();
      await writeFile(scriptFile, new Uint8Array(scriptBash));

      // Make executable.
      await run({
        cmd: ["chmod", "+x", scriptFile],
      });

      // Upload coverage file.
      await run({
        cmd: [scriptFile, "-f", covFile],
      });
    });
  }
}
