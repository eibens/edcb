import { CheckHandlers, CheckOptions } from "../commands/check.ts";
import { parseFlags } from "../utils/flags.ts";

export async function createCheckOptions({
  args = Deno.args,
  env = Deno.env,
  handlers = {},
}: Partial<{
  args: string[];
  env: {
    get: (key: string) => string | undefined;
  };
  handlers: Partial<CheckHandlers>;
}> = {}): Promise<CheckOptions> {
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
