import { check, CheckOptions, ServeOptions } from "./mod.ts";
import { serve } from "./mod.ts";

export type CliOptions = {
  serve: Partial<ServeOptions>;
  check: Partial<CheckOptions>;
};

export async function cli(options: Partial<CliOptions> = {}) {
  const [key, ...args] = Deno.args;
  const commands: Record<
    string,
    (options: { args: string[] }) => Promise<void>
  > = {
    serve: () => serve(options.serve),
    check: () => check(options.check),
  };
  const command = commands[key] || commands.check;
  return await command({ args });
}

if (import.meta.main) {
  await cli();
}
