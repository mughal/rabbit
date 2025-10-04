// rabbit.ts
import amqplib, { Channel, Connection, ConsumeMessage } from "amqplib";

export type OnMessage = (msg: {
  routingKey: string;
  payload: unknown;
  fields: ConsumeMessage["fields"];
  properties: ConsumeMessage["properties"];
}) => void;

let conn: Connection | null = null;
let ch: Channel | null = null;
let started = false;

function env(name: string, fallback?: string) {
  const v = process.env[name];
  if (v && v.trim().length) return v.trim();
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required env: ${name}`);
}

function toInt(v: string | undefined, d: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : d;
}

export async function startConsumer(onMessage: OnMessage) {
  if (started) {
    console.log("[rabbit] consumer already started");
    return;
  }

  const AMQP_URL = env("AMQP_URL", "amqp://uploader:Str0ngPass!@localhost:5672/events");
  const EXCHANGE = env("AMQP_EXCHANGE", "events");
  const BINDING = env("AMQP_BINDING", "#");
  const PREFETCH = toInt(process.env.AMQP_PREFETCH, 50);
  const NAMED_QUEUE = process.env.AMQP_QUEUE; // optional

  console.log(`[rabbit] connecting url=${AMQP_URL.replace(/\/\/.*@/, "//***@")}`);
  conn = await amqplib.connect(AMQP_URL);

  conn.on("error", (e) => console.error("[rabbit] connection error:", e.message));
  conn.on("close", () => {
    console.warn("[rabbit] connection closed");
  });

  ch = await conn.createChannel();
  await ch.assertExchange(EXCHANGE, "topic", { durable: true });
  await ch.prefetch(PREFETCH);

  let qname: string;

  if (NAMED_QUEUE) {
    const q = await ch.assertQueue(NAMED_QUEUE, { durable: true });
    qname = q.queue;
  } else {
    const q = await ch.assertQueue("", { exclusive: true, durable: false, autoDelete: true });
    qname = q.queue;
  }

  await ch.bindQueue(qname, EXCHANGE, BINDING);

  console.log(
    `[rabbit] ready: exchange='${EXCHANGE}' queue='${qname}' binding='${BINDING}' prefetch=${PREFETCH}`
  );

  await ch.consume(
    qname,
    (m: ConsumeMessage | null) => {
      if (!m) return;

      const routingKey = m.fields.routingKey;
      const raw = m.content.toString("utf8");

      console.log(
        `[rabbit] consume <- rk=${routingKey} mid=${m.properties?.messageId ?? "-"} ts=${
          m.properties?.timestamp ?? "-"
        } payload=${raw.slice(0, 200)}`
      );

      let payload: unknown = raw;
      try {
        payload = JSON.parse(raw);
      } catch {
        /* keep string as-is */
      }

      onMessage({
        routingKey,
        payload,
        fields: m.fields,
        properties: m.properties,
      });

      ch!.ack(m);
    },
    { noAck: false }
  );

  console.log("[rabbit] consumer is live (awaiting messages)");
  started = true;
}

export async function closeRabbit() {
  try {
    if (ch) await ch.close();
  } catch {}
  try {
    if (conn) await conn.close();
  } catch {}
  ch = null;
  conn = null;
  started = false;
}
