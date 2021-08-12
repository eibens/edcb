export async function run(
  options: Deno.RunOptions,
  impl = Deno.run,
): Promise<Uint8Array> {
  const p = impl(options);
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
}
