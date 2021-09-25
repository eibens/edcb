type Async<T> = T | Promise<T>;

export type ListenOptions = {
  port: number;
  hostname?: string;
  onRequest: (request: Request) => Async<Response>;
  onSocket?: (ws: WebSocket) => Async<void>;
};

export async function listen(options: ListenOptions) {
  const hostname = options.hostname || "localhost";
  const listener = Deno.listen({
    port: options.port,
    hostname,
  });
  for await (const conn of listener) {
    const httpConn = Deno.serveHttp(conn);
    (async () => {
      for await (const event of httpConn) {
        const request = event.request;
        const upgrade = request.headers.get("upgrade") === "websocket";
        if (upgrade && options.onSocket) {
          // @ts-ignore unstable API
          const { socket, response } = Deno.upgradeWebSocket(request);
          options.onSocket(socket);
          event.respondWith(response);
        } else {
          const response = await options.onRequest(request);
          event.respondWith(response);
        }
      }
    })();
  }
}
