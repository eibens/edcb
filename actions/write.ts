import { dirname } from "../deps/path.ts";

export type WriteDeps = {
  mkdir: typeof Deno.mkdir;
  writeFile: typeof Deno.writeFile;
  lstat: typeof Deno.lstat;
};

export type WriteOptions = {
  file: string;
  data: string | Uint8Array;
  force: boolean;
};

export function write({ lstat, mkdir, writeFile }: WriteDeps) {
  return async function (options: WriteOptions): Promise<boolean> {
    // Unless force flag is used, check whether file exists.
    if (!options.force) {
      try {
        await lstat(options.file);
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

    // Write file.
    await mkdir(dirname(options.file), { recursive: true });
    await writeFile(options.file, data);
    return true;
  };
}
