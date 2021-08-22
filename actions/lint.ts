import { ExecOptions } from "./exec.ts";

export type LintDeps = {
  exec: (options: ExecOptions) => Promise<Uint8Array>;
};

export type LintOptions = {
  ignore: string;
};

export function lint(deps: LintDeps) {
  return async function (options: LintOptions) {
    const ignore = options.ignore ? ["--ignore=" + options.ignore] : [];
    await deps.exec({
      cmd: ["deno", "lint", ...ignore],
    });
  };
}
