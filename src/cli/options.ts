import { parse } from "../../deps/flags.ts";

const COMMANDS = [
  "build",
  "serve",
];

export type Command =
  | "build"
  | "serve";

export type Options = {
  command: Command;
  config?: string;
  help: boolean;
  version: boolean;
  check: boolean;
  debug: boolean;
  ignore: string;
  importMap?: string;
  temp: string;
  tests: string;
  codecov?: string;
  webRoot: string;
  port: number;
  hostname: string;
  root: string;
  reload: boolean;
  unstable: boolean;
  bundles: {
    source: string;
    target: string;
    tsconfig?: string;
  }[];
};

export function parseOptions(
  args: string[],
  options: Partial<Options> = {},
): Options {
  const unknown: string[] = [];
  const flags = parse(args, {
    boolean: [
      "check",
      "debug",
      "help",
      "version",
      "reload",
      "unstable",
    ],
    string: [
      "ignore",
      "temp",
      "tests",
      "codecov",
      "web-root",
      "port",
      "hostname",
      "root",
      "import-map",
      "config",
    ],
    alias: {
      help: "h",
      version: "v",
    },
    unknown: (arg) => {
      if (!COMMANDS.includes(arg)) {
        unknown.push(arg);
      }
    },
  });

  if (unknown.length) {
    throw new Error(`Unknown arguments: ${unknown.join(", ")}`);
  }

  const help = Boolean(flags.help || options.help);
  const version = Boolean(flags.version || options.version);

  const commandString = flags._[0] || options.command;
  if (!commandString && !help && !version) {
    throw new Error("Missing argument: <command>");
  }
  const command = commandString as Command;

  const portString = flags.port || options.port || "8080";
  const port = parseInt(portString);
  if (isNaN(port)) {
    throw new Error(
      `Invalid option: --port=${portString} (not a valid port number)`,
    );
  }

  return {
    // generic options
    help,
    version,
    command,
    debug: Boolean(flags.debug || options.debug),

    // build options
    check: Boolean(flags.check || options.check),
    ignore: flags.ignore || options.ignore || "",
    temp: flags.temp || options.temp || "",
    tests: flags.tests || options.tests || "",
    codecov: flags.codecov !== undefined ? flags.codecov : options.codecov,
    importMap: flags.importMap !== undefined
      ? flags.importMap
      : options.importMap,
    config: flags.config !== undefined ? flags.config : options.config,
    bundles: options.bundles || [],

    // server options
    port,
    webRoot: flags["web-root"] || options.webRoot || ".",
    hostname: flags.hostname || options.hostname || "localhost",
    reload: Boolean(flags.reload || options.reload),
    unstable: Boolean(flags.unstable || options.unstable),
    root: flags.root || options.root || ".",
  };
}
