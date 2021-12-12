import { dirname } from "../../deps/path.ts";

export type WriteOptions = {
  mkdir: typeof Deno.mkdir;
  writeFile: typeof Deno.writeFile;
  lstat: typeof Deno.lstat;
  file: string;
  data: string | Uint8Array;
  force: boolean;
};

export async function write(options: WriteOptions): Promise<boolean> {
  // Unless force flag is used, check whether file exists.
  if (!options.force) {
    try {
      await options.lstat(options.file);
      // File exists.
      return false;
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  }

  // Convert data to buffer.
  let data = options.data as Uint8Array;
  if (typeof options.data === "string") {
    data = new TextEncoder().encode(options.data);
  }

  // Create directory if it does not exist.
  const dir = dirname(options.file);
  try {
    await options.lstat(dir);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await options.mkdir(dir);
    }
  }

  // Write file.
  await options.writeFile(options.file, data);
  return true;
}
