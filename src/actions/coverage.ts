export type CoverageOptions = {
  exec: (options: Deno.RunOptions) => Promise<{ success: boolean }>;
  dir: string;
  ignore: string;
  tests: string;
};

export async function coverage(options: CoverageOptions): Promise<void> {
  // Test
  const ignore = options.ignore ? ["--ignore=" + options.ignore] : [];
  const testResult = await options.exec({
    cmd: [
      "deno",
      "test",
      "-A",
      "--doc",
      "--unstable",
      ...ignore,
      "--coverage=" + options.dir,
      ...(options.tests ? [options.tests] : []),
    ],
  });

  if (!testResult.success) {
    throw new Error(
      `Failed running unit tests and writing coverage profile to directory '${options.dir}'.`,
    );
  }

  // Coverage
  const coverageResult = await options.exec({
    cmd: ["deno", "coverage", "--unstable", options.dir],
  });

  if (!coverageResult.success) {
    throw new Error(
      `Failed generating test coverage report from coverage profile in directory '${options.dir}'.`,
    );
  }
}