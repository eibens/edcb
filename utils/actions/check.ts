import { join } from "../../deps/path.ts";

export type CheckOptions = {
  fmt: (options: {
    ignore: string;
    check: boolean;
  }) => Promise<void>;
  lint: (options: {
    ignore: string;
  }) => Promise<void>;
  coverage: (options: {
    dir: string;
  }) => Promise<void>;
  lcov: (options: {
    dir: string;
    file: string;
  }) => Promise<void>;
  codecov: (options: {
    lcovFile: string;
    scriptFile: string;
    scriptUrl: string;
  }) => Promise<void>;
  ignore: string;
  ci: boolean;
  temp: string;
};

export async function check(options: CheckOptions): Promise<void> {
  const covDir = join(options.temp, "coverage");
  const covFile = join(covDir, "coverage.lcov");
  const scriptFile = join(options.temp, "codecov.bash");
  const codecovUrl = "https://codecov.io/bash";

  await options.fmt({
    ignore: options.ignore,
    check: options.ci,
  });

  await options.lint({
    ignore: options.ignore,
  });

  await options.coverage({
    dir: covDir,
  });

  if (options.ci) {
    await options.lcov({
      dir: covDir,
      file: covFile,
    });

    await options.codecov({
      lcovFile: covFile,
      scriptFile: scriptFile,
      scriptUrl: codecovUrl,
    });
  }
}
