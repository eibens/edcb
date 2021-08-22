import { ExecOptions } from "./exec.ts";
import { WriteOptions } from "./write.ts";

export type LcovDeps = {
  write: (options: WriteOptions) => Promise<boolean>;
  exec: (options: ExecOptions) => Promise<Uint8Array>;
};

export type LcovOptions = {
  dir: string;
  file: string;
};

export function lcov(deps: LcovDeps) {
  return async function (options: LcovOptions) {
    const lcov = await deps.exec({
      cmd: ["deno", "coverage", "--lcov", options.dir],
      stdout: "piped",
    });

    await deps.write({
      file: options.file,
      data: lcov,
      force: true,
    });
  };
}
