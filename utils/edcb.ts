import { build } from "./actions/build.ts";
import { bundle } from "./actions/bundle.ts";
import { check } from "./actions/check.ts";
import { codecov } from "./actions/codecov.ts";
import { coverage } from "./actions/coverage.ts";
import { exec } from "./actions/exec.ts";
import { fmt } from "./actions/fmt.ts";
import { lcov } from "./actions/lcov.ts";
import { lint } from "./actions/lint.ts";
import { write } from "./actions/write.ts";

export class Edcb {
  build(options: {
    ignore?: string;
    ci?: boolean;
    temp?: string;
  } = {}) {
    return build({
      ...options,
      args: Deno.args,
      makeTempDir: this.makeTempDir.bind(this),
      check: (options) =>
        check({
          ...options,
          codecov: this.codecov.bind(this),
          coverage: this.coverage.bind(this),
          fmt: this.fmt.bind(this),
          lcov: this.lcov.bind(this),
          lint: this.lint.bind(this),
        }),
    });
  }

  exec(options: Deno.RunOptions) {
    return exec({
      ...options,
      run: (options) => Promise.resolve(Deno.run(options)),
    });
  }

  write(options: {
    file: string;
    data: Uint8Array | string;
    force: boolean;
  }) {
    return write({
      ...options,
      writeFile: this.writeFile.bind(this),
      lstat: this.lstat.bind(this),
      mkdir: this.mkdir.bind(this),
    });
  }

  codecov(options: {
    lcovFile: string;
    scriptFile: string;
    scriptUrl: string;
  }) {
    return codecov({
      ...options,
      fetch: this.fetch.bind(this),
      exec: this.exec.bind(this),
      write: this.write.bind(this),
    });
  }

  coverage(options: {
    dir: string;
  }) {
    return coverage({
      ...options,
      exec: this.exec.bind(this),
    });
  }

  lint(options: {
    ignore: string;
  }) {
    return lint({
      ...options,
      exec: this.exec.bind(this),
    });
  }

  fmt(options: {
    check: boolean;
    ignore: string;
  }) {
    return fmt({
      ...options,
      exec: this.exec.bind(this),
    });
  }

  lcov(options: {
    dir: string;
    file: string;
  }) {
    return lcov({
      ...options,
      exec: this.exec.bind(this),
      write: this.write.bind(this),
    });
  }

  bundle(options: {
    src: string;
    out: string;
    tsconfig: string;
  }) {
    return bundle({
      ...options,
      mkdir: this.mkdir.bind(this),
      exec: this.exec.bind(this),
    });
  }

  fetch(input: string | URL, init?: RequestInit) {
    return globalThis.fetch(input, init);
  }

  writeFile(path: string | URL, data: Uint8Array) {
    return Deno.writeFile(path, data);
  }

  lstat(path: string | URL) {
    return Deno.lstat(path);
  }

  mkdir(path: string | URL, options?: Deno.MkdirOptions) {
    return Deno.mkdir(path, options);
  }

  makeTempDir() {
    return Deno.makeTempDir();
  }
}
