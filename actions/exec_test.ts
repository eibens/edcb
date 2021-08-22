import { exec, ExecDeps, ExecOptions } from "./exec.ts";

Deno.test("exec runs with mock options", async () => {
  await exec(mockExecDeps())(mockExecOptions());
});

function mockExecDeps(): ExecDeps {
  return {
    run: () => {
      return Promise.resolve({
        close: () => void (0),
        output: () => Promise.resolve(new Uint8Array()),
        status: () => {
          return Promise.resolve({
            success: true,
          });
        },
      } as unknown as Deno.Process);
    },
  };
}

function mockExecOptions(): ExecOptions {
  return {
    cmd: ["mock"],
  };
}
