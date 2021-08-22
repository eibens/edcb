import { EdcbOptions } from "./actions/mod.ts";
import { factory, Hooks } from "./factory.ts";
import { loggers } from "./loggers.ts";

if (import.meta.main) {
  await cli();
}

export type CliOptions = Partial<
  EdcbOptions & {
    hooks: Partial<Hooks>;
  }
>;

export async function cli(options: CliOptions = {}) {
  const actions = factory(options.hooks || loggers);
  await actions.edcb({
    args: options.args || Deno.args,
    check: options.check || {},
    init: options.init || {},
  });
}
