import { ExecOptions } from "./exec.ts";

export type FmtDeps = {
  exec: (options: ExecOptions) => Promise<unknown>;
};

export type FmtOptions = {
  ignore: string;
  check: boolean;
};

export function fmt({ exec }: FmtDeps) {
  return async function (options: FmtOptions) {
    const ignore = options.ignore ? ["--ignore=" + options.ignore] : [];
    const check = options.check ? ["--check"] : [];
    await exec({
      cmd: ["deno", "fmt", ...ignore, ...check],
    });
  };
}
