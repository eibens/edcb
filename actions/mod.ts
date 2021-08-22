export * from "./bundle.ts";
export * from "./check.ts";
export * from "./codecov.ts";
export * from "./coverage.ts";
export * from "./edcb.ts";
export * from "./exec.ts";
export * from "./fmt.ts";
export * from "./init.ts";
export * from "./lcov.ts";
export * from "./lint.ts";
export * from "./write.ts";

// NOTE: These are builders for native actions (without dependencies).
// NOTE: For a unified interface, make sync actions async.
export const fetch = () => globalThis.fetch;
export const mkdir = () => Deno.mkdir;
export const lstat = () => Deno.lstat;
export const writeFile = () => Deno.writeFile;
export const makeTempDir = () => Deno.makeTempDir;
export const env = () => (name: string) => Promise.resolve(Deno.env.get(name));
export const run = () =>
  (options: Deno.RunOptions) => Promise.resolve(Deno.run(options));
