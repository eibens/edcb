import { join } from "../../deps/path.ts";

export type BundleOptions = {
  source: string;
  target: string;
  config?: string;
  importMap?: string;
};

export type BuildOptions = {
  check: boolean;
  debug: boolean;
  ignore: string;
  temp: string;
  tests: string;
  codecov?: string;
  webRoot: string;
  bundles: BundleOptions[];
  unstable: boolean;
  config?: string;
  importMap?: string;
  bundle: (options: BundleOptions) => Promise<void>;
  fmt: (options: {
    ignore: string;
    check: boolean;
    config?: string;
  }) => Promise<void>;
  lint: (options: {
    ignore: string;
    config?: string;
  }) => Promise<void>;
  makeTempDir: () => Promise<string>;
  coverage: (options: {
    dir: string;
    ignore: string;
    tests: string;
    unstable: boolean;
    config?: string;
    importMap?: string;
  }) => Promise<void>;
  lcov: (options: {
    dir: string;
    file: string;
  }) => Promise<void>;
  uploadCodecov: (options: {
    token: string;
    lcovFile: string;
    scriptFile: string;
    scriptUrl: string;
  }) => Promise<void>;
};

export async function build(options: BuildOptions) {
  await options.fmt({
    ignore: options.ignore,
    check: options.check,
    config: options.config,
  });

  await options.lint({
    ignore: options.ignore,
    config: options.config,
  });

  const temp = options.temp || await options.makeTempDir();
  const covDir = join(temp, "coverage");

  await options.coverage({
    dir: covDir,
    ignore: options.ignore,
    tests: options.tests,
    unstable: options.unstable,
    config: options.config,
    importMap: options.importMap,
  });

  if (!options.check) {
    for await (const bundle of options.bundles) {
      await options.bundle({
        source: bundle.source,
        target: join(options.webRoot, bundle.target),
        config: options.config,
        importMap: options.importMap,
      });
    }
  }

  if (options.codecov !== undefined) {
    const covFile = join(covDir, "coverage.lcov");
    const scriptFile = join(temp, "codecov.bash");
    const codecovUrl = "https://codecov.io/bash";

    await options.lcov({
      dir: covDir,
      file: covFile,
    });

    await options.uploadCodecov({
      token: options.codecov,
      lcovFile: covFile,
      scriptFile: scriptFile,
      scriptUrl: codecovUrl,
    });
  }
}
