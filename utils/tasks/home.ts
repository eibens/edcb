import { parse } from "../../deps/flags.ts";
import { home as help } from "../help.ts";
import { version } from "../../version.ts";

export type HomeOptions = {
  help: boolean;
  version: boolean;
};

function parseOptions(
  options: Partial<HomeOptions & { args: string[] }>,
): HomeOptions {
  const flags = parse(options.args || Deno.args, {
    boolean: ["version", "help"],
    string: [],
    alias: {
      help: "h",
      version: "v",
    },
  });
  return {
    help: flags.help || false,
    version: flags.version || false,
  };
}

export function home(
  options: Partial<HomeOptions & { args: string[] }> = {},
): Promise<void> {
  const opts = parseOptions(options);
  if (opts.version) {
    const versionString = version.tag || "<unknown version>";
    console.log("edcb " + versionString);
    return Promise.resolve();
  }
  console.log(help);
  return Promise.resolve();
}
