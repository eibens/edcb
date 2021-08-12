import { build, BuildDependencies, BuildHandlers } from "./build.ts";
import { toTaskNameHandler } from "./utils/task.ts";

Deno.test("build runs with mocked dependencies`", async () => {
  await build({
    ...mockDeps(),
    ci: false,
    tempDir: "temp",
    cwd: ".",
    ignore: "foo",
    handlers: toTaskNameHandler(() => {}) as BuildHandlers,
  });
});

Deno.test("build runs with mocked dependencies in CI`", async () => {
  await build({
    ...mockDeps(),
    ci: true,
    tempDir: "temp",
    cwd: ".",
    ignore: "foo",
    handlers: toTaskNameHandler(() => {}) as BuildHandlers,
  });
});

function mockDeps(options: Partial<BuildDependencies> = {}): BuildDependencies {
  return {
    fetch: mockFetch(),
    run: mockRun(),
    mkdir: () => Promise.resolve(),
    writeFile: () => Promise.resolve(),
    ...options,
  };
}

function mockFetch(
  handler?: (url: string) => void,
): BuildDependencies["fetch"] {
  return (url) => {
    if (typeof url !== "string") throw new Error("not implemented");
    if (handler) handler(url);
    return Promise.resolve({
      arrayBuffer: () => Promise.resolve(new Uint8Array(0)),
    } as unknown as Response);
  };
}

function mockRun(
  handler?: (options: Deno.RunOptions) => void,
): BuildDependencies["run"] {
  return (options: Deno.RunOptions) => {
    if (handler) handler(options);
    return {
      close: () => void (0),
      output: () => Promise.resolve(new Uint8Array()),
      status: () => {
        return Promise.resolve({
          success: true,
        });
      },
    } as unknown as Deno.Process;
  };
}
