import { InitHandlers, InitOptions } from "../commands/init.ts";
import { parseFlags } from "../utils/flags.ts";
import { version } from "../version.ts";

export function createInitOptions({
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
