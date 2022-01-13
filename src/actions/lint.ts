export type LintOptions = {
  exec: (options: Deno.RunOptions) => Promise<{
    success: boolean;
  }>;
  ignore: string;
  config?: string;
};

export async function lint(options: LintOptions): Promise<void> {
  const ignore = options.ignore ? ["--ignore=" + options.ignore] : [];
  const config = options.config ? ["--config=" + options.config] : [];
  const { success } = await options.exec({
    cmd: ["deno", "lint", ...ignore, ...config],
  });
  if (!success) {
    throw new Error(`Linter discovered some issues.`);
  }
}
