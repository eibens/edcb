import { createBroadcast } from "../utils/broadcast.ts";
import { createBundler } from "../utils/bundler.ts";

export type BundleOptions = {
  source: string;
  target: string;
  tsconfig?: string;
};

export type ServeOptions = {
  debug: boolean;
  port: number;
  hostname: string;
  root: string;
  reload: boolean;
  webRoot: string;
  bundles: BundleOptions[];
  bundle: (options: BundleOptions) => Promise<void>;
  watch: (options: {
    root: string;
    onChange: (file: string) => void;
  }) => Promise<void>;
  listen: (options: {
    port: number;
    hostname: string;
    onSocket: (socket: WebSocket) => void | Promise<void>;
    onRequest: (request: Request) => Promise<Response>;
  }) => Promise<void>;
  serveFile: (options: {
    webRoot: string;
    request: Request;
  }) => Promise<Response>;
};

export async function serve(options: ServeOptions): Promise<void> {
  const broadcast = createBroadcast();
  const bundler = createBundler(options);

  const watcher = options.watch({
    root: options.root,
    onChange: (path) => {
      bundler.markDirty(path);
      broadcast.send("reload");
    },
  });

  const listener = options.listen({
    port: options.port,
    hostname: options.hostname,
    onSocket: (socket) => {
      broadcast.add(socket);
    },
    onRequest: async (request) => {
      await bundler.updateBundle(request.url);
      return options.serveFile({
        webRoot: options.webRoot,
        request,
      });
    },
  });

  await Promise.all([watcher, listener]);
}
