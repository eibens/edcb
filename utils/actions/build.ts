import { parseFlags } from "../flags.ts";

type CheckOptions = {
  ci: boolean;
  ignore: string;
  temp: string;
};

export type BuildOptions = Partial<CheckOptions> & {
  makeTempDir: () => Promise<string>;
  check: (options: CheckOptions) => Promise<void>;
  args: string[];
};

export async function build(options: BuildOptions): Promise<void> {
  const temp = options.temp || await options.makeTempDir();
  const ignore = options.ignore || "";
  return options.check(parseFlags(Deno.args, {
    boolean: ["ci", "debug"],
    string: ["ignore", "temp"],
    default: {
      debug: false,
      ci: Boolean(options.ci),
      ignore,
      temp,
    },
  }));
}
