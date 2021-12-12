import { cli } from "./src/cli/mod.ts";

if (import.meta.main) {
  const devScript = "dev.ts";
  if (await fileExists(devScript)) {
    // When a dev.ts script exists, run it.
    // This prevents version edcb version mismatch.
    await runScript(devScript, Deno.args);
  } else {
    await cli();
  }
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
