import * as edcb from "./mod.ts";
import { parse } from "https://deno.land/std@0.103.0/flags/mod.ts";
import { createLogger } from "./logger.ts";
import { version } from "./version.ts";
import { BuildOptions, InitOptions } from "./mod.ts";

if (import.meta.main) {
  const logger = createLogger();
  logger.start("started");
  logger.info("version: " + (version.tag || "<unknown>"));
  try {
    if (Deno.args[0] === "init") {
      await init();
    } else {
      await build();
    }
    logger.success("success");
  } catch (error) {
    console.log(error);
    logger.error("failure");
    Deno.exit(1);
  }
}

export async function init(options: Partial<InitOptions> = {}) {
  const flags: Record<string, unknown> = parse(Deno.args, {
    boolean: ["ci"],
    string: "ignore",
  });
  await edcb.init({ ...flags, ...options });
}

export async function build(options: Partial<BuildOptions> = {}) {
  const flags: Record<string, unknown> = parse(Deno.args, {
    boolean: ["ci"],
    string: "ignore",
  });
  await edcb.build({ ...flags, ...options });
}
