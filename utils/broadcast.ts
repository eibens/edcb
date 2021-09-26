export type Broadcast = {
  send: (message?: string) => void;
  add: (socket: WebSocket) => void;
};

export function createBroadcast(): Broadcast {
  const sockets = new Set<WebSocket>();
  return {
    send: (message = "") => {
      sockets.forEach((socket) => socket.send(message));
    },
    add: (socket: WebSocket) => {
      socket.onopen = () => {
        sockets.add(socket);
        socket.onclose = () => {
          sockets.delete(socket);
        };
      };
    },
  };
}
