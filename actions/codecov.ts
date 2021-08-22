import { ExecOptions } from "./exec.ts";
import { WriteOptions } from "./write.ts";

export type CodecovDeps = {
  write: (options: WriteOptions) => Promise<boolean>;
  exec: (options: ExecOptions) => Promise<Uint8Array>;
  fetch: (url: string) => Promise<Response>;
};

export type CodecovOptions = {
  lcovFile: string;
  scriptUrl: string;
  scriptFile: string;
};

export function codecov({ write, exec, fetch }: CodecovDeps) {
  return async function (options: CodecovOptions) {
    // Download codecov script.
    const scriptBash = await (await fetch(options.scriptUrl))
      .arrayBuffer();
    await write({
      force: true,
      file: options.scriptFile,
      data: new Uint8Array(scriptBash),
    });

    // Make executable.
    await exec({
      cmd: ["chmod", "+x", options.scriptFile],
    });

    // Upload coverage file.
    await exec({
      cmd: [options.scriptFile, "-f", options.lcovFile],
    });
  };
}
