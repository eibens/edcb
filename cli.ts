import {
  blue,
  bold,
  gray,
  green,
  italic,
  magenta,
  red,
  underline,
} from "https://deno.land/x/std@0.103.0/fmt/colors.ts";
import * as init from "./init.ts";
import * as build from "./build.ts";
import { getTag } from "./version.ts";
import { parse } from "https://deno.land/std@0.103.0/flags/mod.ts";

if (import.meta.main) {
  logProp("command", bold(Deno.args[0] === "init" ? "init" : "build"));
  logProp("version", getTag() || bold("implicit"));
  if (Deno.args[0] === "init") {
    const [_, ...args] = Deno.args;
    const flags: Record<string, unknown> = parse(args, {
      string: "version",
    });
    logProp("file", underline(blue(init.WORKFLOW_FILE)));
    const created = await init.main(flags);
    logProp("created", bold(String(created)));
    if (!created) log(italic("File was not created, since it already exists."));
  } else {
    const flags: Record<string, unknown> = parse(Deno.args, {
      boolean: "ci",
      string: "ignore",
    });
    logDivider();
    let status = green("success");
    try {
      await build.main(flags);
    } catch (error) {
      logProp("error", red(String(error)));
      status = red("failure");
    }
    logDivider();
    logProp("status", status);
  }
}

function log(message: string) {
  const tag = gray("[" + magenta(bold("edcb")) + "]");
  console.log(`${tag} ${message}`);
}

function logProp(prop: string, value: string) {
  log(`${prop}: ${value}`);
}

function logDivider() {
  console.log(gray("-".repeat(60)));
}
