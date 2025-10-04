// socket.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import { Server as IOServer } from "socket.io";
import { startConsumer } from "@/lib/rabbit";

type ResWithIO = NextApiResponse & {
  socket: any & { server: HTTPServer & { io?: IOServer } };
};

let booting = false;

export default async function handler(_req: NextApiRequest, res: ResWithIO) {
  const httpServer = res.socket.server;

  if (!httpServer.io && !booting) {
    booting = true;

    console.log(`[socket] Initializing Socket.IO at ${new Date().toISOString()}`);

    const io = new IOServer(httpServer, {
      path: "/api/socket",
      serveClient: false,
      cors: { origin: "*" },
    });

    (httpServer as any).io = io;

    io.on("connection", (socket) => {
      console.log(`[socket] client connected: ${socket.id}`);
      socket.emit("hello", { ok: true, ts: new Date().toISOString() });
      socket.on("disconnect", (reason) =>
        console.log(`[socket] client disconnected: ${socket.id} (${reason})`)
      );
    });

    await startConsumer(({ routingKey, payload, fields, properties }) => {
      const preview =
        typeof payload === "string" ? payload : JSON.stringify(payload).slice(0, 200);
      console.log(
        `[socket] emit -> event rk=${routingKey} mid=${properties?.messageId ?? "-"} ts=${
          properties?.timestamp ?? "-"
        } payload=${preview}`
      );
      io.emit("event", { routingKey, payload, fields, properties, ts: new Date().toISOString() });
    });

    console.log("[socket] Socket.IO ready and Rabbit consumer attached");
    booting = false;
  }

  res.status(200).json({ ok: true, hasIO: !!httpServer.io });
}

export const config = { api: { bodyParser: false } };
