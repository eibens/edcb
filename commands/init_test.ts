import { init, InitDependencies, InitHandlers } from "./init.ts";
import { toTaskNameHandler } from "../utils/task.ts";

Deno.test("init runs with mock dependencies", async () => {
  await init({
    ...mockDeps(),
    cwd: ".",
    force: false,
    version: "1.2.3",
    handlers: toTaskNameHandler(() => {}) as InitHandlers,
  });
});

function mockDeps(): InitDependencies {
  return {
    lstat: () => Promise.resolve({} as unknown as Deno.FileInfo),
    mkdir: () => Promise.resolve(),
    writeFile: () => Promise.resolve(),
  };
}
