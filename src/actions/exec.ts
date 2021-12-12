export type ExecOptions = Deno.RunOptions & {
  run: (options: Deno.RunOptions) => Promise<Deno.Process>;
};

export type ExecResult = {
  success: boolean;
  stdout: Uint8Array;
  stderr: Uint8Array;
};

export async function exec(options: ExecOptions): Promise<ExecResult> {
  const p = await options.run({
    ...options,
    stdout: "piped",
    stderr: "piped",
  });
  const [{ success }, stdout, stderr] = await Promise.all([
    p.status(),
    p.output(),
    p.stderrOutput(),
  ]);
  p.close();
  return { success, stdout, stderr };
}
