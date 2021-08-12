import { dirname, join } from "https://deno.land/std@0.103.0/path/mod.ts";
import {
  fromTaskNameHandler,
  TaskHandler,
  TaskNameHandler,
  toTask,
} from "../utils/task.ts";

/**
 * Defines event hooks for monitoring the initialization process.
 */
export type InitHandlers = {
  writeFile: TaskHandler<[string, Uint8Array]>;
  mkdir: TaskHandler<[string]>;
  lstat: TaskHandler<[string], Deno.FileInfo>;
};

/**
 * Defines injectable dependencies for the build function.
 */
export type InitDependencies = {
  writeFile: (typeof Deno)["writeFile"];
  mkdir: (typeof Deno)["mkdir"];
  lstat: (typeof Deno)["lstat"];
};

/**
 * Defines options for edcb initialization.
 */
export type InitOptions = InitDependencies & {
  /**
   * Version of edcb that should be used.
   *
   * If not specified, the current edcb version will be used.
   */
  version: string;

  /**
   * Overwrite existing files.
   */
  force: boolean;

  /**
   * Root directory of the project.
   */
  cwd: string;

  /**
   * Object that holds initialization event handlers.
   */
  handlers: InitHandlers;
};

/**
 * Initializes boilerplate edcb related files in a directory.
 */
export async function init(options: InitOptions) {
  const handler = fromTaskNameHandler(
    options.handlers as TaskNameHandler,
  );

  // Wrap dependencies.

  const mkdir = toTask(
    "mkdir",
    handler,
    options.mkdir,
  );

  const lstat = toTask(
    "lstat",
    handler,
    options.lstat,
  );

  const writeFile = toTask(
    "writeFile",
    handler,
    options.writeFile,
  );

  // Run process

  const workflowFile = join(options.cwd, ".github/workflows/ci.yml");
  await writeTextFile(workflowFile, generateWorkflowFile());

  const devFile = join(options.cwd, "dev.ts");
  await writeTextFile(devFile, generateDevFile(options.version));

  // Define helpers.

  async function writeTextFile(file: string, text: string) {
    // NOTE: Don't overwrite existing workflow file.
    if (await exists(file)) {
      if (!options.force) return;
    }
    await mkdir(dirname(file), { recursive: true });
    const data = new TextEncoder().encode(text);
    await writeFile(file, data);
  }

  async function exists(file: string) {
    try {
      await lstat(file);
      return true;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return false;
      }
      throw error;
    }
  }
}

// File templates

function generateDevFile(version?: string) {
  const tag = version ? `@${version}` : "";
  const edcbUrl = `https://deno.land/x/edcb${tag}/cli.ts`;
  return `import { cli } from "${edcbUrl}";

await cli();\n`;
}

function generateWorkflowFile() {
  return `name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: denoland/setup-deno@v1
      - run: deno run -A dev.ts\n`;
}
