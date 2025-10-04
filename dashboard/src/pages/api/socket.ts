import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { startConsumer } from "@/lib/rabbit"; // ⬅️ add this

type ResWithServer = NextApiResponse & { socket: any & { server: HTTPServer & { io?: IOServer } } };

let booting = false;

export default async function handler(req: NextApiRequest, res: ResWithServer) {
  const httpServer = res.socket.server;

  if (!httpServer.io && !booting) {
    booting = true;

    const io = new IOServer(httpServer, { path: "/api/socket", cors: { origin: "*" } });
    httpServer.io = io;

    io.on("connection", (socket) => {
      console.log("[socket.io] connected", socket.id);
      socket.emit("hello", { msg: "socket up" });
    });

    // ⬇️ start RabbitMQ consumer and broadcast to all sockets
    await startConsumer(({ routingKey, payload, fields, properties }) => {
      io.emit("event", { routingKey, payload, fields, properties });
    });

    booting = false;
  }

  res.status(200).json({ ok: true, hasIO: !!httpServer.io });
}

export const config = { api: { bodyParser: false } };
