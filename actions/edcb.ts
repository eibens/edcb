import { CheckOptions } from "../actions/check.ts";
import { parseFlags } from "../utils/flags.ts";
import { version } from "../version.ts";
import { InitOptions } from "../actions/init.ts";

export type EdcbDeps = {
  env: (key: "CI") => Promise<string | undefined>;
  makeTempDir: typeof Deno.makeTempDir;
  check: (options: CheckOptions) => Promise<void>;
  init: (options: InitOptions) => Promise<void>;
};

export type EdcbOptions = {
  args: string[];
  check: Partial<CheckOptions>;
  init: Partial<InitOptions>;
};

export function edcb({ check, env, init, makeTempDir }: EdcbDeps) {
  return async function (options: EdcbOptions) {
    const [arg0, ...args] = options.args;
    switch (arg0) {
      case "init": {
        return await init(parseFlags(args, {
          boolean: ["force", "workflowFile", "devFile"],
          string: ["version"],
          default: {
            force: false,
            version: version.tag,
            workflowFile: true,
            devFile: true,
            ...options.init,
          },
        }));
      }
      default: {
        return await check(parseFlags(args, {
          boolean: ["ci"],
          string: ["ignore", "temp"],
          default: {
            ci: Boolean(await env("CI")),
            ignore: "",
            temp: await makeTempDir(),
            ...options.check,
          },
        }));
      }
    }
  };
}
