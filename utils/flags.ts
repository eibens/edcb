import { parse } from "https://deno.land/std@0.103.0/flags/mod.ts";

export type ParseFlagsOptions<B, S> = {
  string: S[];
  boolean: B[];
};

export type ParseFlagsResult<B extends string, S extends string> =
  & { _: string[] }
  & { [k in B]?: boolean }
  & { [k in S]?: string };

export function parseFlags<B extends string, S extends string>(
  args: string[],
  options: ParseFlagsOptions<B, S>,
): ParseFlagsResult<B, S> {
  const flags = parse(args, {
    ...options,
    unknown: (key) => {
      // Ignore positional arguments
      if (!key.startsWith("-")) return;
      throw new Error(`Unexpected or invalid argument: ${key}`);
    },
  });
  return flags as ParseFlagsResult<B, S>;
}
