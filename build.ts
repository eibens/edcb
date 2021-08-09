/**
 * Defines configuration for the build workflow.
 */
export type Options = {
  /**
   * Directory that contains the source files.
   */
  cwd?: string;

  /**
   * Flag indicating that the build should be run as if in a CI environment.
   */
  ci?: boolean;

  /**
   * Files and directories that should not be formatted or linted.
   *
   * Corresponds to the format used for the `--ignore` flag for `deno fmt`
   * or `deno lint`.
   */
  ignore?: string;
};

/**
 * Runs the edcb build workflow.
 *
 * See `getPermissions` for necessary permissions.
 *
 * @param options is the configuration for the build workflow.
 * @throws if a step in the workflow fails.
 */
export async function main(options: Options = {}) {
  const ignore = "--ignore=" + options.ignore;

  const ci = options.ci || Deno.env.get("CI") !== undefined;

  // Format code (check but don't modify code in CI).
  if (ci) {
    await run({
      cmd: ["deno", "fmt", ignore, "--check"],
    });
  } else {
    await run({
      cmd: ["deno", "fmt", ignore],
    });
  }

  // Run linter after formatting, since it is more high-level.
  await run({
    cmd: ["deno", "lint", ignore],
  });

  // Store coverage outside project root.
  const covDir = await Deno.makeTempDir();

  // Run tests and generate coverage profile.
  await run({
    cmd: ["deno", "test", "-A", "--unstable", "--coverage=" + covDir],
  });

  // Print coverage info to stdout.
  await run({
    cmd: ["deno", "coverage", "--unstable", covDir],
  });

  // Upload code coverage (only works from CI, at least for now).
  if (ci) {
    // Generate coverage file.
    const lcov = await run({
      cmd: ["deno", "coverage", "--lcov", covDir],
      stdout: "piped",
    });

    // Store coverage report outside project root.
    const covFile = await Deno.makeTempFile();
    Deno.writeFile(covFile, lcov);

    // Download codecov upload script.
    const scriptUrl = "https://codecov.io/bash";
    const scriptBash = await (await fetch(scriptUrl)).text();
    const scriptFile = await Deno.makeTempFile();
    await Deno.writeTextFile(scriptFile, scriptBash);

    // Make executable.
    await run({
      cmd: ["chmod", "+x", scriptFile],
    });

    // Upload coverage file.
    await run({
      cmd: [scriptFile, "-f", covFile],
    });
  }

  // Define run helper.
  async function run(options: Deno.RunOptions): Promise<Uint8Array> {
    const p = Deno.run({ cwd: options.cwd, ...options });
    try {
      const status = await p.status();
      if (!status.success) {
        throw new Error(`step failed: ${options.cmd.join(" ")}`);
      }
      if (options.stdout === "piped") {
        return await p.output();
      } else {
        return new Uint8Array(0);
      }
    } finally {
      if (options.stdout !== "piped") p.stdout?.close();
      p.stderr?.close();
      p.stdin?.close;
      p.close();
    }
  }
}

/**
 * Documents a necessary permission.
 */
export type Permission = Deno.PermissionDescriptor & {
  reason: string;
};

/**
 * Get known permissions required for running the `main` function.
 */
export function getPermissions(options: Options): Permission[] {
  const all: Permission[] = [{
    name: "run",
    command: "deno",
    reason: "Used for formatting, linting, testing, and coverage reporting.",
  }, {
    name: "write",
    path: "tmp",
    reason: "Used for storing the coverage data in a temporary directory.",
  }, {
    name: "env",
    variable: "CI",
    reason: "Automatically detect CI environment.",
  }];

  const ci: Permission[] = [{
    name: "net",
    host: "codecov.io",
    reason: "Used for downloading the codecov upload script.",
  }, {
    name: "run",
    reason: "Used for running the codecov upload script.",
  }];

  return [...all, ...(options.ci ? ci : [])];
}
