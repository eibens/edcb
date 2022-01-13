export type FmtOptions = {
  exec: (options: Deno.RunOptions) => Promise<{ success: boolean }>;
  ignore: string;
  check: boolean;
  config?: string;
};

export async function fmt(options: FmtOptions): Promise<void> {
  const ignore = options.ignore ? ["--ignore=" + options.ignore] : [];
  const config = options.config ? ["--config=" + options.config] : [];
  const check = options.check ? ["--check"] : [];
  const { success } = await options.exec({
    cmd: ["deno", "fmt", ...ignore, ...check, ...config],
  });

  if (!success) {
    throw new Error(
      `Formatter failed${options.check ? " in check mode" : ""}.`,
    );
  }
}
