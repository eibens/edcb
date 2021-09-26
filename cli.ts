import { check, CheckOptions, ServeOptions } from "./mod.ts";
import { serve } from "./mod.ts";

if (import.meta.main) {
  const devScript = "dev.ts";
  if (fileExists(devScript)) {
    // When a dev.ts script exists, run it.
    // This prevents version edcb version mismatch.
    await runScript(devScript, Deno.args);
  } else {
    await cli();
  }
}

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

async function runScript(file: string, args: string[]) {
  const p = Deno.run({
    cmd: ["deno", "run", "-A", "--unstable", file, ...args],
  });
  const status = await p.status();
  p.close();
  Deno.exit(status.code);
}

async function fileExists(file: string) {
  try {
    await Deno.lstat(file);
    return true;
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      throw error;
    }
  }
  return false;
}
