import * as fmt from "../deps/colors.ts";
import { version } from "../version.ts";
import { withGetter } from "./middleware/with_getter.ts";

export type LoggerOptions = {
  ignoredTasks?: string[];
};

export type Logger = {
  header: () => void;
  footer: (error?: Error) => void;
  onStart: (key: string) => void;
  onFinish: (key: string, duration: number) => void;
  onError: (error: Error) => void;
  onMakeTempDirValue: (dir: string) => void;
  onMkdirValue: (value: void, dir: string | URL) => void;
  onFetchInput: (url: string | URL, init?: RequestInit) => void;
  onFetchValue: (response: Response, url: string | URL) => void;
  onWriteValue: () => void;
  onExecInput: (options: Deno.RunOptions) => void;
  onExecValue: (result: {
    success: boolean;
    stdout: Uint8Array;
    stderr: Uint8Array;
  }, options: Deno.RunOptions) => void;
};

export function createLogger(
  log: (x: string) => void,
  options: LoggerOptions = {},
): Logger {
  const tree = createTreeFormatter();
  const level = createLevelFormatters();
  const {
    ignoredTasks = [],
  } = options;

  return {
    header: () => {
      const logo = randomColors(
        ASCII_LOGO,
        () => randomInt(128, 256),
        () => randomInt(64, 128),
        () => randomInt(128, 256),
      );

      const fallback = (x: unknown, fallback: string) =>
        x ? String(x) : fmt.italic(fallback);

      const item = (...args: TemplateArgs) => tree.item(level.debug(...args));

      const lines = [
        `\n\n${logo}`,
        tree.open("debug", level.debug`${"edcb"}`),
        tree.line(""),
        item`description: ${"A build tool and task runner for Deno."}`,
        item`version:     ${fallback(version.tag, "unknown")}`,
        item`website:     ${fmtUrl("https://github.com/eibens/edcb")}`,
        item
          `author:      ${"Lukas Eibensteiner"} <${"l.eibensteiner@gmail.com"}>`,
        item`license:     ${"MIT"}`,
        item`timestamp:   ${new Date().toISOString()}`,
        item`arguments:   ${fallback(Deno.args.join(""), "none")}`,
        tree.line(""),
        tree.close(level.debug`happy coding!`),
      ];
      lines.map((line) => log(line));
    },
    footer: (error) => {
      log("");
      if (error) {
        log(randomColors(
          ASCII_FAIL,
          () => randomInt(128, 256),
          () => randomInt(64, 128),
          () => randomInt(64, 128),
        ));
      } else {
        log(randomColors(
          ASCII_DONE,
          () => randomInt(64, 128),
          () => randomInt(128, 256),
          () => randomInt(64, 128),
        ));
      }
      log("");
    },
    onStart: (key) => {
      if (ignoredTasks.includes(key)) return;
      log(tree.open("meta", level.meta`${fmtName(key)}`));
    },
    onFinish: (key, duration) => {
      if (ignoredTasks.includes(key)) return;
      log(
        tree.close(
          level.meta`${fmtName(key)} finished in ${fmtTime(duration)}`,
        ),
      );
    },
    onError: (error: Error) => {
      const text = String(error);
      const lines = String(error).trim().split("\n");
      log(tree.open(
        "error",
        level.error`${error.name}`,
      ));
      lines.forEach((line) => log(tree.line(line)));
      log(tree.close(
        level.error`Message size: ${fmtBytes(text.length)}`,
      ));
    },
    onExecInput: (options) => {
      log(tree.item(
        level.info`$ ${options.cmd.join(" ")}`,
      ));
    },
    onExecValue: (result) => {
      print(result.stderr, "stderr");
      print(result.stdout, "stdout");
      function print(b: Uint8Array, name: string) {
        const l = result.success ? "debug" : "error";
        const fmtMsg = level[l];
        const text = new TextDecoder().decode(b).trim();
        const lines = text.split("\n");
        if (text) {
          log(tree.open(l, fmtMsg`${name}`));
          lines.forEach((line) => log(tree.line(line)));
          log(tree.close(fmtMsg`${name} received ${fmtBytes(b.length)}`));
        }
      }
    },
    onFetchInput: (url, init) => {
      log(tree.item(
        level.io`Sending ${init?.method || "GET"} request to ${fmtUrl(url)}.`,
      ));
    },
    onFetchValue: (response, url) => {
      log(tree.item(
        level.success
          `HTTP ${response.status} "${response.statusText}" received from ${
            fmtUrl(url)
          }.`,
      ));
    },
    onMakeTempDirValue: (path) => {
      log(tree.item(
        level.info`Created temporary directory ${fmtUrl(path)}.`,
      ));
    },
    onMkdirValue: (_, path) => {
      log(tree.item(
        level.info`Created temporary directory ${fmtUrl(path)}.`,
      ));
    },
    onWriteValue: () => {
    },
  };
}

// internal types

type TemplateArgs = [TemplateStringsArray, ...unknown[]];

type Fmt = (x: string) => string;

type FmtTag = (...args: TemplateArgs) => string;

type Level =
  | "info"
  | "success"
  | "error"
  | "io"
  | "warn"
  | "meta"
  | "data"
  | "debug";

type Indent =
  | "open"
  | "close"
  | "item"
  | "line";

// formatter factories

type TreeFormatter = {
  open: (level: Level, message: string) => string;
  close: (message: string) => string;
  line: (message: string) => string;
  item: (message: string) => string;
};

function createTreeFormatter(): TreeFormatter {
  const path: Level[] = [];
  return {
    open(level, message) {
      const blank = this.line("");
      path.push(level);
      const line = fmtIndent(path, "open") + message;
      return blank + "\n" + line;
    },
    close(message) {
      const line = fmtIndent(path, "close") + message;
      path.pop();
      const blank = this.line("");
      return line + "\n" + blank;
    },
    item(message) {
      return fmtIndent(path, "item") + message;
    },
    line(message) {
      return fmtIndent(path, "line") + message;
    },
  };
}

function createMessageFormatter(textFormat: Fmt, valueFormat: Fmt) {
  return (parts: TemplateStringsArray, ...slots: unknown[]) => {
    const str = [...parts].flatMap((part, i) => {
      const slot = fmt.bold(valueFormat(String(slots[i] || "")));
      return part + slot;
    }).join("");
    return textFormat(str);
  };
}

function createLevelFormatters(): Record<Level, FmtTag> {
  return withGetter<Record<Level, FmtTag>>((key) => {
    const [textColor, valueColor] = LEVEL_COLORS[key] || LEVEL_COLORS.debug;
    return () => createMessageFormatter(textColor, valueColor);
  })({} as Record<Level, FmtTag>);
}

// simple formatters

function fmtName(str: string) {
  return fmt.bold(str);
}

function fmtTime(ms: number) {
  const time = ms / 1_000;
  if (time < 1) return unit(Math.round(time * 1000), "ms");
  return unit(time, "s", 3);
}

function fmtBytes(bytes: number) {
  if (bytes > 1000) return unit((bytes / 1000), "kB", 3);
  return unit(bytes, "B");
}

function fmtUrl(url: string | URL) {
  return `[${String(url)}]`;
}

function fmtIndent(path: Level[], indent: Indent): string {
  const levels = [...path];
  const lastLevel = levels.pop();
  if (!lastLevel) return "";
  const lastBrace = LEVEL_COLORS[lastLevel][0](INDENT[indent]);
  const restBraces = levels.map((level) => LEVEL_COLORS[level][0](INDENT.line));
  return [...restBraces, lastBrace].join("");
}

// utilities

function unit(n: number, u: string, fixed?: number) {
  // Add space between number and unit, but not for seconds.
  // see: https://tex.stackexchange.com/a/20964/208194
  const space = u === "s" ? "" : " ";
  const num = fixed ? n.toFixed(fixed) : n;
  return `${num}${space}${u}`;
}

function randomColors(
  str: string,
  fr: () => number,
  fg: () => number,
  fb: () => number,
) {
  return str.split("")
    .map((char) => {
      const [r, g, b] = [fr(), fg(), fb()];
      return fmt.rgb24(char, { r, g, b });
    })
    .join("");
}

function randomInt(lower: number, upper: number): number {
  return Math.floor(lower + Math.random() * (upper - lower));
}

// constant data

const LEVEL_COLORS: Record<Level, [Fmt, Fmt]> = {
  info: [fmt.white, fmt.brightWhite],
  success: [fmt.green, fmt.brightGreen],
  error: [fmt.red, fmt.brightRed],
  io: [fmt.magenta, fmt.brightMagenta],
  warn: [fmt.yellow, fmt.brightYellow],
  meta: [fmt.blue, fmt.brightBlue],
  data: [fmt.cyan, fmt.brightCyan],
  debug: [fmt.gray, fmt.bold],
};

const INDENT = {
  open: /* */ "╭─",
  item: /* */ "├─",
  line: /* */ "│ ",
  close: /**/ "╰─",
};

// ASCII art generated here: https://www.messletters.com/en/big-text/
// Use "colossal" style from the dropdown.

const ASCII_LOGO = `
              888          888      
              888          888      
              888          888      
 .d88b.   .d88888  .d8888b 88888b.  
d8P  Y8b d88" 888 d88P"    888 "88b 
88888888 888  888 888      888  888 
Y8b.     Y88b 888 Y88b.    888 d88P 
 "Y8888   "Y88888  "Y8888P 88888P" 
`.substr(1);

const ASCII_DONE = `
     888                            
     888                            
     888                            
 .d88888  .d88b.  88888b.   .d88b.  
d88" 888 d88""88b 888 "88b d8P  Y8b 
888  888 888  888 888  888 88888888 
Y88b 888 Y88..88P 888  888 Y8b.      
 "Y88888  "Y88P"  888  888  "Y8888 
`.substr(1);

const ASCII_FAIL = `
         888                        
         888                        
         888                        
 .d88b.  88888b.  88888b.   .d88b.  
d88""88b 888 "88b 888 "88b d88""88b 
888  888 888  888 888  888 888  888 
Y88..88P 888  888 888  888 Y88..88P 
 "Y88P"  888  888 888  888  "Y88P"  
`.substr(1);
