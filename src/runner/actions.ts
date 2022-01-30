import { build } from "../actions/build.ts";
import { bundle } from "../actions/bundle.ts";
import { codecov } from "../actions/codecov.ts";
import { coverage } from "../actions/coverage.ts";
import { exec } from "../actions/exec.ts";
import { fmt } from "../actions/fmt.ts";
import { lcov } from "../actions/lcov.ts";
import { lint } from "../actions/lint.ts";
import { listen } from "../actions/listen.ts";
import { serveFile } from "../actions/serve_file.ts";
import { serve } from "../actions/serve.ts";
import { watch } from "../actions/watch.ts";
import { write } from "../actions/write.ts";

export class Actions {
  build(options: {
    check: boolean;
    debug: boolean;
    ignore: string;
    temp: string;
    tests: string;
    codecov?: string;
    webRoot: string;
    unstable: boolean;
    config?: string;
    importMap?: string;
    bundles: {
      source: string;
      target: string;
      tsconfig?: string;
    }[];
  }) {
    return build({
      ...options,
      bundle: this.bundle.bind(this),
      coverage: this.coverage.bind(this),
      fmt: this.fmt.bind(this),
      lcov: this.lcov.bind(this),
      lint: this.lint.bind(this),
      uploadCodecov: this.codecov.bind(this),
      makeTempDir: this.makeTempDir.bind(this),
    });
  }

  bundle(options: {
    source: string;
    target: string;
    noCheck?: boolean;
    config?: string;
    importMap?: string;
  }) {
    return bundle({
      noCheck: false,
      ...options,
      lstat: Deno.lstat,
      mkdir: this.mkdir.bind(this),
      exec: this.exec.bind(this),
    });
  }

  codecov(options: {
    lcovFile: string;
    scriptFile: string;
    scriptUrl: string;
    token?: string;
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
    tests: string;
    ignore: string;
    unstable: boolean;
    config?: string;
    importMap?: string;
  }) {
    return coverage({
      ...options,
      tests: options.tests,
      exec: this.exec.bind(this),
    });
  }

  exec(options: Deno.RunOptions) {
    return exec({
      ...options,
      run: (options) => Promise.resolve(Deno.run(options)),
    });
  }

  fetch(input: string, init?: RequestInit) {
    return globalThis.fetch(input, init);
  }

  fmt(options: {
    check: boolean;
    ignore: string;
    config?: string;
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

  lint(options: {
    ignore: string;
    config?: string;
  }) {
    return lint({
      ...options,
      exec: this.exec.bind(this),
    });
  }

  listen(options: {
    port: number;
    hostname: string;
    onSocket: (socket: WebSocket) => void;
    onRequest: (request: Request) => Promise<Response>;
  }) {
    return listen(options);
  }

  serveFile(options: {
    webRoot: string;
    request: Request;
  }): Promise<Response> {
    return serveFile({
      ...options,
      readFile: this.readFile.bind(this),
    });
  }

  serve(options: {
    debug: boolean;
    port: number;
    hostname: string;
    root: string;
    reload: boolean;
    webRoot: string;
    config?: string;
    importMap?: string;
    bundles: {
      source: string;
      target: string;
      config?: string;
      importMap?: string;
    }[];
  }) {
    return serve({
      ...options,
      serveFile: this.serveFile.bind(this),
      bundle: this.bundle.bind(this),
      listen: this.listen.bind(this),
      watch: this.watch.bind(this),
    });
  }

  makeTempDir() {
    return Deno.makeTempDir();
  }

  mkdir(path: string | URL, options?: Deno.MkdirOptions) {
    return Deno.mkdir(path, options);
  }

  readFile(path: string | URL, options?: Deno.ReadFileOptions) {
    return Deno.readFile(path, options);
  }

  watch(options: {
    root: string;
    onChange: (path: string) => void;
  }) {
    return watch({
      path: options.root,
      onEvent: (event) => {
        event.paths.map(options.onChange);
      },
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
      lstat: Deno.lstat,
      mkdir: this.mkdir.bind(this),
    });
  }

  writeFile(path: string | URL, data: Uint8Array) {
    return Deno.writeFile(path, data);
  }
}
