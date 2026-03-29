import { Response } from "express";

const clients = new Set<Response>();

export function addSSEClient(res: Response) {
  clients.add(res);
  res.on("close", () => {
    clients.delete(res);
  });
}

export function broadcastSSEEvent(event: { type: string; data: unknown }) {
  const payload = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}

export function sendSSEHeartbeat() {
  const payload = `:heartbeat\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch {
      clients.delete(client);
    }
  }
}
