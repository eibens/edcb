/**
 * Start a file watcher in the background.
 *
 * @param path is the path that should be watched.
 * @param func receives the file system events.
 * @returns a structure for closing the watcher.
 */
export function watch(
  path: string,
  func: (event: Deno.FsEvent) => void | Promise<void>,
) {
  const watcher = Deno.watchFs(path, {
    recursive: true,
  });
  (async () => {
    for await (const event of watcher) {
      await func(event);
    }
  })();
  return {
    close: () => {
      watcher.close();
      return Promise.resolve();
    },
  };
}
