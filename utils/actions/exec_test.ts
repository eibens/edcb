import { exec, ExecOptions } from "./exec.ts";

Deno.test("exec runs with mock options", async () => {
  await exec(mockExecOptions());
});

function mockExecOptions(): ExecOptions {
  return {
    cmd: ["mock"],
    run: () => {
      return Promise.resolve({
        output: () => Promise.resolve(new Uint8Array()),
        stderrOutput: () => Promise.resolve(new Uint8Array()),
        close: () => {},
        status: () => {
          return Promise.resolve({
            success: true,
          });
        },
      } as unknown as Deno.Process);
    },
  };
}
