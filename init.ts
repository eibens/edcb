import { exists } from "https://deno.land/std@0.103.0/fs/mod.ts";
import { dirname } from "https://deno.land/std@0.103.0/path/mod.ts";
import { getTag, getUrl } from "./version.ts";

/**
 * Defines options for edcb initialization.
 */
export type Options = {
  /**
   * Version of edcb that should be used.
   *
   * If not specified, the current edcb version will be used.
   */
  version?: string;
};

/**
 * Path of the generated GitHub Actions file.
 */
export const WORKFLOW_FILE = ".github/workflows/ci.yml";

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
export async function main(options: Options): Promise<boolean> {
  const file = WORKFLOW_FILE;

  // NOTE: Don't overwrite existing workflow file.
  if (await exists(file)) return false;

  const version = options.version || getTag();
  const yaml = `name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: denoland/setup-deno@v1
      - shell: bash
        run: deno run -A ${getUrl(version)}/cli.ts\n`;

  await Deno.mkdir(dirname(file), { recursive: true });
  await Deno.writeTextFile(file, yaml);
  return true;
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
export function getPermissions(): Permission[] {
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
