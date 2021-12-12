export type LcovOptions = {
  write: (options: {
    file: string;
    data: Uint8Array;
    force: boolean;
  }) => Promise<boolean>;
  exec: (options: Deno.RunOptions) => Promise<{
    success: boolean;
    stdout: Uint8Array;
  }>;
  dir: string;
  file: string;
};

export async function lcov(options: LcovOptions): Promise<void> {
  const { success, stdout } = await options.exec({
    cmd: ["deno", "coverage", "--lcov", options.dir],
    stdout: "piped",
  });

  if (!success) {
    throw new Error(
      `Failed generating coverage file '${options.file}' from coverage profile in directory '${options.dir}.`,
    );
  }

  await options.write({
    file: options.file,
    data: stdout,
    force: true,
  });
}
