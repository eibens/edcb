export type CoverageOptions = {
  exec: (options: Deno.RunOptions) => Promise<{ success: boolean }>;
  dir: string;
};

export async function coverage(options: CoverageOptions): Promise<void> {
  // Test
  const testResult = await options.exec({
    cmd: ["deno", "test", "-A", "--unstable", "--coverage=" + options.dir],
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
