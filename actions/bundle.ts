import { dirname } from "../deps/path.ts";
import { ExecOptions } from "./exec.ts";

export type BundleDeps = {
  mkdir: (typeof Deno)["mkdir"];
  exec: (options: ExecOptions) => Promise<Uint8Array>;
};

export type BundleOptions = {
  src: string;
  out: string;
  tsconfig: string;
};

export function bundle(deps: BundleDeps) {
  return async function (options: BundleOptions) {
    await deps.mkdir(dirname(options.src), { recursive: true });
    await deps.exec({
      cmd: [
        "deno",
        "bundle",
        "--no-check", // DOM use causes type errors
        ...(options.tsconfig ? ["--config=" + options.tsconfig] : []),
        options.src,
        options.out,
      ],
    });
  };
}
