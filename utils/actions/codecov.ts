type WriteOptions = {
  force: boolean;
  file: string;
  data: Uint8Array;
};

export type CodecovOptions = {
  write: (options: WriteOptions) => Promise<boolean>;
  exec: (options: Deno.RunOptions) => Promise<{ success: boolean }>;
  fetch: (url: string) => Promise<Response>;
  lcovFile: string;
  scriptUrl: string;
  scriptFile: string;
};

export async function codecov(options: CodecovOptions): Promise<void> {
  // Download codecov script.
  const scriptBash = await (await fetch(options.scriptUrl))
    .arrayBuffer();
  await options.write({
    force: true,
    file: options.scriptFile,
    data: new Uint8Array(scriptBash),
  });

  // Make executable.
  const chmodResult = await options.exec({
    cmd: ["chmod", "+x", options.scriptFile],
  });
  if (!chmodResult.success) {
    throw new Error(
      `Failed making codecov uploader script in file '${options.scriptFile}' executable.`,
    );
  }

  // Upload coverage file.
  const scriptResult = await options.exec({
    cmd: [options.scriptFile, "-f", options.lcovFile, "-Z"],
  });
  if (!scriptResult.success) {
    throw new Error(
      `Failed uploading coverage file '${options.lcovFile}' with codecov uploader script in file '${options.scriptFile}'.`,
    );
  }
}
