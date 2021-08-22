import { ExecOptions } from "./exec.ts";

export type CoverageDeps = {
  exec: (options: ExecOptions) => Promise<Uint8Array>;
};

export type CoverageOptions = {
  dir: string;
};

export function coverage({ exec }: CoverageDeps) {
  return async function (options: CoverageOptions) {
    // Test
    await exec({
      cmd: ["deno", "test", "-A", "--unstable", "--coverage=" + options.dir],
    });

    // Coverage
    await exec({
      cmd: ["deno", "coverage", "--unstable", options.dir],
    });
  };
}
