import { join } from "../deps/path.ts";
import { CodecovOptions } from "./codecov.ts";
import { CoverageOptions } from "./coverage.ts";
import { FmtOptions } from "./fmt.ts";
import { LcovOptions } from "./lcov.ts";
import { LintOptions } from "./lint.ts";

export type CheckDeps = {
  fmt: (options: FmtOptions) => Promise<void>;
  lint: (options: LintOptions) => Promise<void>;
  coverage: (options: CoverageOptions) => Promise<void>;
  lcov: (options: LcovOptions) => Promise<void>;
  codecov: (options: CodecovOptions) => Promise<void>;
};

export type CheckOptions = {
  ignore: string;
  ci: boolean;
  temp: string;
};

export function check({ fmt, lint, coverage, lcov, codecov }: CheckDeps) {
  return async function (options: CheckOptions) {
    const covDir = join(options.temp, "coverage");
    const covFile = join(covDir, "coverage.lcov");
    const scriptFile = join(options.temp, "codecov.bash");
    const codecovUrl = "https://codecov.io/bash";

    await fmt({
      ignore: options.ignore,
      check: options.ci,
    });

    await lint({
      ignore: options.ignore,
    });

    await coverage({
      dir: covDir,
    });

    if (options.ci) {
      await lcov({
        dir: covDir,
        file: covFile,
      });

      await codecov({
        lcovFile: covFile,
        scriptFile: scriptFile,
        scriptUrl: codecovUrl,
      });
    }
  };
}
