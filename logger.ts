import {
  cyan,
  gray,
  green,
  magenta,
  red,
  yellow,
} from "https://deno.land/std@0.101.0/fmt/colors.ts";

export type Tag =
  | "log"
  | "info"
  | "success"
  | "warn"
  | "error"
  | "start"
  | "debug"
  | "divider";

export type LoggerOptions = {
  name: string;
  handler: Handler;
};

export type Handler = (msg: string) => void;

export type Logger = Record<Tag, Handler>;

export function createLogger(options: Partial<LoggerOptions> = {}): Logger {
  const { handler = console.log, name = "edcb" } = options;

  const log = (
    format: (x: string) => string = (x) => x,
  ) => {
    return (msg: string) => {
      const tagged = msg ? `[${name}] ${msg}` : msg;
      handler(format(tagged));
    };
  };

  return {
    log: log(),
    info: log(cyan),
    success: log(green),
    error: log(red),
    warn: log(yellow),
    start: log(magenta),
    debug: log(gray),
    divider: log(() => gray("-".repeat(60))),
  };
}
