export type ExecDeps = {
  run: (options: Deno.RunOptions) => Promise<Deno.Process>;
};

export type ExecOptions = Deno.RunOptions;

export function exec({ run }: ExecDeps) {
  return async function (options: ExecOptions): Promise<Uint8Array> {
    const p = await run(options);
    try {
      const status = await p.status();
      if (!status.success) {
        throw new Error(`Failed to run command: ${options.cmd.join(" ")}`);
      }
      if (options.stdout === "piped") {
        return await p.output();
      } else {
        return new Uint8Array(0);
      }
    } finally {
      if (options.stdout !== "piped") p.stdout?.close();
      p.stderr?.close();
      p.stdin?.close();
      p.close();
    }
  };
}
