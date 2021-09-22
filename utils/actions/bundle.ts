import { dirname } from "../../deps/path.ts";

export type BundleOptions = {
  mkdir: (typeof Deno)["mkdir"];
  exec: (options: Deno.RunOptions) => Promise<{ success: boolean }>;
  src: string;
  out: string;
  tsconfig: string;
};

export async function bundle(options: BundleOptions): Promise<void> {
  await options.mkdir(dirname(options.src), { recursive: true });
  const { success } = await options.exec({
    cmd: [
      "deno",
      "bundle",
      "--no-check", // DOM use causes type errors
      ...(options.tsconfig ? ["--config=" + options.tsconfig] : []),
      options.src,
      options.out,
    ],
  });
  if (!success) {
    throw new Error(
      `Failed bundling TypeScript file ${options.src} into JavaScript file ${options.out}.`,
    );
  }
}
