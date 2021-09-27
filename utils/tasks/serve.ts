import { parseFlags } from "../flags.ts";
import { withMap } from "../middleware/with_map.ts";
import { createBundler } from "../bundler.ts";
import { createBroadcast } from "../broadcast.ts";
// actions
import { bundle } from "../actions/bundle.ts";
import { exec } from "../actions/exec.ts";
import { listen } from "../actions/listen.ts";
import { serveFile } from "../actions/serve_file.ts";
import { watch } from "../actions/watch.ts";
// loggers
import { createTreeLogger } from "../tree_logger.ts";
import { withLogger } from "../loggers/logger.ts";
import { withExecLogger } from "../loggers/actions/exec.ts";
import { withMkdirLogger } from "../loggers/actions/mkdir.ts";
import { withServeLogger } from "../loggers/actions/serve.ts";
import { withReadFileLogger } from "../loggers/actions/read_file.ts";
import { withRequestLogger } from "../loggers/actions/request.ts";

export type ServeOptions = {
  debug: boolean;
  port: number;
  hostname: string;
  root: string;
  webRoot: string;
  reload: boolean;
  bundles: {
    source: string;
    target: string;
    tsconfig?: string;
  }[];
};

function parseOptions(
  options: Partial<ServeOptions & { args: string[] }>,
): ServeOptions {
  const flags = parseFlags(options.args || Deno.args, {
    boolean: ["reload", "debug"],
    string: ["port", "hostname", "root", "web-root"],
    default: {
      debug: Boolean(options.debug),
      reload: Boolean(options.reload),
      port: options.port ? String(options.port) : "8080",
      hostname: options.hostname || "localhost",
      root: options.root || ".",
      "web-root": options.webRoot || "docs",
    },
  });
  const port = parseInt(flags.port);
  if (isNaN(port)) {
    throw new Error(`Value "${options.port}" is not a valid port number.`);
  }
  return {
    port,
    debug: flags.debug,
    hostname: flags.hostname,
    reload: flags.reload,
    root: flags.root,
    webRoot: flags["web-root"],
    bundles: options.bundles || [],
  };
}

export function serve(
  options: Partial<ServeOptions & { args: string[] }> = {},
) {
  const opts = parseOptions(options);
  const tree = createTreeLogger(console.log);
  const task = new ServeTask();
  const Logger = withLogger<ServeTask>(
    tree,
    withMap<ServeTask>({
      exec: withExecLogger(tree, Boolean(opts.debug)),
      mkdir: withMkdirLogger(tree.item),
      serve: withServeLogger(tree.item),
      readFile: withReadFileLogger(tree.item),
      onRequest: withRequestLogger(tree.item),
    }),
  );
  return Logger(task).serve(opts);
}

class ServeTask {
  async serve(options: ServeOptions) {
    const bundler = createBundler({
      webRoot: options.webRoot,
      bundle: this.bundle.bind(this),
      bundles: options.bundles,
    });

    const broadcast = createBroadcast();

    const watcher = watch({
      path: options.root,
      onEvent: (event) => {
        event.paths.map(bundler.markDirty);
        broadcast.send();
      },
    });

    const listener = listen({
      port: options.port,
      hostname: options.hostname,
      onSocket: broadcast.add,
      onRequest: (request) => {
        return this.onRequest({
          request,
          updateBundle: bundler.updateBundle,
          webRoot: options.webRoot,
        });
      },
    });

    await Promise.all([watcher, listener]);
  }

  exec(options: Deno.RunOptions) {
    return exec({
      ...options,
      run: (options) => Promise.resolve(Deno.run(options)),
    });
  }

  bundle(options: {
    source: string;
    target: string;
    tsconfig?: string;
  }) {
    return bundle({
      ...options,
      lstat: Deno.lstat,
      mkdir: this.mkdir.bind(this),
      exec: this.exec.bind(this),
    });
  }

  async onRequest(options: {
    request: Request;
    webRoot: string;
    updateBundle: (url: string) => Promise<void>;
  }): Promise<Response> {
    await options.updateBundle(options.request.url);
    return await serveFile({
      ...options,
      readFile: this.readFile.bind(this),
    });
  }

  readFile(path: string | URL, options?: Deno.ReadFileOptions) {
    return Deno.readFile(path, options);
  }

  mkdir(path: string | URL, options?: Deno.MkdirOptions) {
    return Deno.mkdir(path, options);
  }
}