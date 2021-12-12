export type LintOptions = {
  exec: (options: Deno.RunOptions) => Promise<{
    success: boolean;
  }>;
  ignore: string;
};

export async function lint(options: LintOptions): Promise<void> {
  const ignore = options.ignore ? ["--ignore=" + options.ignore] : [];
  const { success } = await options.exec({
    cmd: ["deno", "lint", ...ignore],
  });
  if (!success) {
    throw new Error(`Linter discovered some issues.`);
  }
}
