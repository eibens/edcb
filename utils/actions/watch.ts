export type WatchOptions = {
  path: string | string[];
  onEvent: (event: Deno.FsEvent) => void | Promise<void>;
};

export async function watch(options: WatchOptions) {
  const watcher = Deno.watchFs(options.path, {
    recursive: true,
  });

  for await (const event of watcher) {
    await options.onEvent(event);
  }
}
