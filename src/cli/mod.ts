import { Actions } from "../runner/actions.ts";
import { help } from "./help.ts";
import { withLogger } from "../logger/logger.ts";
import { Options, parseOptions } from "./options.ts";
import { version } from "../../version.ts";

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
