import { dirname } from "../../deps/path.ts";

export type BundleOptions = {
  mkdir: (typeof Deno)["mkdir"];
  exec: (options: Deno.RunOptions) => Promise<{ success: boolean }>;
  source: string;
  target: string;
  tsconfig?: string;
};

export async function bundle(options: BundleOptions): Promise<void> {
  await options.mkdir(dirname(options.source), { recursive: true });
  const { success } = await options.exec({
    cmd: [
      "deno",
      "bundle",
      "--no-check", // DOM use causes type errors
      ...(options.tsconfig ? ["--config=" + options.tsconfig] : []),
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
