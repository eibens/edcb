import { BuildHandlers, BuildOptions } from "./build.ts";
import { InitHandlers, InitOptions } from "./init.ts";
import { parseFlags } from "./utils/flags.ts";
import { version } from "./version.ts";

export async function parseBuildFlags({
  args = Deno.args,
  env = Deno.env,
  handlers = {},
}: Partial<{
  args: string[];
  env: {
    get: (key: string) => string | undefined;
  };
  handlers: Partial<BuildHandlers>;
}> = {}): Promise<BuildOptions> {
  const flags = parseFlags(args, {
    boolean: ["ci"],
    string: ["cwd", "ignore"],
  });
  return {
    fetch,
    writeFile: Deno.writeFile,
    mkdir: Deno.mkdir,
    ci: flags.ci || !!env.get("CI"),
    tempDir: await Deno.makeTempDir(),
    cwd: flags.cwd || ".",
    ignore: flags.ignore || "",
    run: Deno.run,
    handlers: {
      run: () => {},
      writeFile: () => {},
      mkdir: () => {},
      fetch: () => {},
      format: () => {},
      lint: () => {},
      test: () => {},
      coverage: () => {},
      lcov: () => {},
      codecov: () => {},
      ...handlers,
    },
  };
}

export function parseInitFlags({
  args = Deno.args,
  handlers = {},
}: Partial<{
  args?: string[];
  handlers?: Partial<InitHandlers>;
}> = {}): Promise<InitOptions> {
  const flags = parseFlags(args, {
    boolean: ["force"],
    string: ["version", "cwd"],
  });
  return Promise.resolve({
    cwd: flags.cwd || ".",
    version: flags.version || version.tag,
    force: !!flags.force,
    lstat: Deno.lstat,
    mkdir: Deno.mkdir,
    writeFile: Deno.writeFile,
    handlers: {
      writeFile: () => {},
      mkdir: () => {},
      lstat: () => {},
      ...handlers,
    },
  });
}
