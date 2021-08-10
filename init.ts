import { exists } from "https://deno.land/std@0.103.0/fs/exists.ts";
import { dirname } from "https://deno.land/std@0.103.0/path/mod.ts";
import { createLogger, Logger } from "./logger.ts";
import { version } from "./version.ts";

/**
 * Defines options for edcb initialization.
 */
export type InitOptions = {
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

  logger: Logger;
};

const WORKFLOW_FILE = ".github/workflows/ci.yml";
const DEV_FILE = "dev.ts";

/**
 * Initializes edcb support in a directory.
 *
 * For now, this simply generates a GitHub Actions workflow file.
 *
 * See `getPermissions` for necessary permissions.
 *
 * @returns a promise that resolves to `true` if a new file was created,
 * or `false` if the file already existed and nothing was written.
 */
export async function init(options: Partial<InitOptions> = {}) {
  const opts: InitOptions = {
    force: false,
    version: version.tag,
    logger: createLogger({ name: "edcb init" }),
    ...options,
  };
  await writeFile(WORKFLOW_FILE, generateWorkflow(), opts);
  await writeFile(DEV_FILE, generateDev(opts.version), opts);
}

/**
 * Documents a necessary permission.
 */
export type InitPermission = Deno.PermissionDescriptor & {
  reason: string;
};

/**
 * Get known permissions required for running the `init` function.
 */
export function getInitPermissions(): InitPermission[] {
  return [{
    name: "read",
    path: WORKFLOW_FILE,
    reason: "Checking the existence of the GitHub Actions workflow file.",
  }, {
    name: "write",
    path: WORKFLOW_FILE,
    reason: "Creating a new GitHub Actions workflow file.",
  }];
}

async function writeFile(file: string, text: string, options: InitOptions) {
  const { logger } = options;
  // NOTE: Don't overwrite existing workflow file.
  if (await exists(file)) {
    if (!options.force) {
      logger.info(`skipped existing file: ${file}`);
      return;
    }
  }
  logger.start(`writing ${text.length} bytes to file: ${file}`);
  await Deno.mkdir(dirname(file), { recursive: true });
  await Deno.writeTextFile(file, text);
  return true;
}

function generateDev(version?: string) {
  const tag = version ? `@${version}` : "";
  const edcbUrl = `https://deno.land/x/edcb${tag}/cli.ts`;
  return `import { build } from "${edcbUrl}";

await build();\n`;
}

function generateWorkflow() {
  return `name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: denoland/setup-deno@v1
      - shell: bash
        run: deno run -A dev.ts\n`;
}
