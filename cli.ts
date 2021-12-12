import { Actions } from "./utils/actions.ts";
import { help } from "./utils/help.ts";
import { withLogger } from "./utils/loggers/logger.ts";
import { Options, parseOptions } from "./utils/options.ts";
import { version } from "./version.ts";

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

export async function cli(defaults: Partial<Options> = {}): Promise<void> {
  try {
    const options = parseOptions(Deno.args, defaults);

    if (options.help) {
      console.log(help);
      return;
    }

    if (options.version) {
      const versionString = version.tag || "<unknown version>";
      console.log("edcb " + versionString);
      return;
    }

    const actions = withLogger({
      debug: options.debug,
      log: console.log,
    })(new Actions());

    switch (options.command) {
      case "build":
        return await actions.build(options);
      case "serve":
        return await actions.serve(options);
    }
  } catch (error) {
    // ignore errors that were already handled
    if ("logged" in error) return;
    console.error(error.message);
    console.log("");
    console.log("For usage run: edcb --help");
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
