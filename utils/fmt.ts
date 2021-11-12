export * from "../deps/colors.ts";
import * as fmt from "../deps/colors.ts";

export type Level =
  | "info"
  | "success"
  | "error"
  | "io"
  | "warn"
  | "meta"
  | "data"
  | "debug";

export type Indent =
  | "open"
  | "close"
  | "item"
  | "line";

export function time(ms: number) {
  const time = ms / 1_000;
  if (time < 1) return unit(Math.round(time * 1000), "ms");
  return unit(time, "s", 3);
}

export function bytes(bytes: number) {
  if (bytes > 1000) return unit(bytes / 1000, "kB", 3);
  return unit(bytes, "B");
}

export function url(url: string | URL) {
  return `[${String(url)}]`;
}

export function indent(
  path: Level[],
  indent: Indent,
  msg = "",
): string {
  const levels = [...path];
  const lastLevel = levels.pop();
  if (!lastLevel) return msg;
  const lastBrace = LEVEL_COLORS[lastLevel][0](INDENT[indent]);
  const restBraces = levels.map((level) => LEVEL_COLORS[level][0](INDENT.line));
  return [...restBraces, lastBrace].join("") + msg;
}

export function effectRed(str: string) {
  return randomColorsFromBox(str, [
    [0.50, 1.0],
    [0.25, 0.5],
    [0.25, 0.5],
  ]);
}

export function effectGreen(str: string) {
  return randomColorsFromBox(str, [
    [0.25, 0.5],
    [0.50, 1.0],
    [0.25, 0.5],
  ]);
}

export function effectBlue(str: string) {
  return randomColorsFromBox(str, [
    [0.25, 0.5],
    [0.25, 0.5],
    [0.50, 1.0],
  ]);
}

export function level(level: Level): FmtTag {
  const [textColor, valueColor] = LEVEL_COLORS[level] || LEVEL_COLORS.debug;
  return createMessageFormatter(textColor, valueColor);
}

// utilities

type FmtTag = (...args: TemplateArgs) => string;

type Vec3<T> = [T, T, T];

type Color = Vec3<number>;

type ColorBox = Vec3<[number, number]>;

type TemplateArgs = [TemplateStringsArray, ...unknown[]];

type Fmt = (x: string) => string;

function randomColorsFromBox(str: string, box: ColorBox): string {
  return randomColors(str, () => sampleColorBox(box));
}

function sampleColorBox(box: ColorBox): Color {
  return box.map(([min, max]) => min + Math.random() * (max - min)) as Color;
}

function randomColors(
  str: string,
  sample: () => Color,
) {
  return str.split("")
    .map((char) => {
      const [r, g, b] = sample().map((x) =>
        Math.floor(Math.max(0, Math.min(1, x)) * 256)
      );
      return fmt.rgb24(char, { r, g, b });
    })
    .join("");
}

function unit(n: number, u: string, fixed?: number) {
  // Add space between number and unit, but not for seconds.
  // see: https://tex.stackexchange.com/a/20964/208194
  const space = u === "s" ? "" : " ";
  const num = fixed ? n.toFixed(fixed) : n;
  return `${num}${space}${u}`;
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
