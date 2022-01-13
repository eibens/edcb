import { dirname } from "../../deps/path.ts";

export type BundleOptions = {
  mkdir: typeof Deno.mkdir;
  lstat: typeof Deno.lstat;
  exec: (options: Deno.RunOptions) => Promise<{ success: boolean }>;
  source: string;
  target: string;
  noCheck: boolean;
  config?: string;
  importMap?: string;
};

export async function bundle(options: BundleOptions): Promise<void> {
  // Create directory if it does not exist.
  const dir = dirname(options.target);
  try {
    await options.lstat(dir);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      await options.mkdir(dir);
    }
  }

  const noCheck = options.noCheck ? ["--no-check"] : [];
  const config = options.config ? ["--config=" + options.config] : [];
  const importMap = options.importMap
    ? ["--import-map=" + options.importMap]
    : [];

  const { success } = await options.exec({
    cmd: [
      "deno",
      "bundle",
      ...noCheck,
      ...config,
      ...importMap,
      options.source,
      options.target,
    ],
  });
  if (!success) {
    throw new Error(
      `Failed bundling TypeScript file ${options.source} into JavaScript file ${options.target}.`,
    );
  }
}
