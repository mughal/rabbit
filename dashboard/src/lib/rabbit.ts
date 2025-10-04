import amqp, { Connection, Channel, ConsumeMessage } from "amqplib";

type OnMessage = (msg: {
  routingKey: string;
  payload: unknown;
  fields: amqp.MessageFields;
  properties: amqp.MessageProperties;
}) => void;

let started = false;
let conn: Connection | null = null;
let ch: Channel | null = null;

export async function startConsumer(onMessage: OnMessage) {
  if (started) return; // prevent double-start in dev
  started = true;

  const url = process.env.AMQP_URL!;
  const exchange = process.env.AMQP_EXCHANGE ?? "events";
  const queue = process.env.AMQP_QUEUE ?? "events.metrics";
  const binding = process.env.ROUTING_FILTER ?? "#";
  const prefetch = Number(process.env.AMQP_PREFETCH ?? "50");

  conn = await amqp.connect(url);
  conn.on("close", () => {
    started = false;
    conn = null;
    ch = null;
  });

  ch = await conn.createChannel();
  await ch.assertExchange(exchange, "topic", { durable: true });
  await ch.assertQueue(queue, { durable: true });
  await ch.bindQueue(queue, exchange, binding);
  await ch.prefetch(prefetch);

  await ch.consume(queue, (m: ConsumeMessage | null) => {
    if (!m) return;

    const routingKey = m.fields.routingKey;
    let payload: unknown;
    const content = m.content.toString();

    try {
      payload = JSON.parse(content);
    } catch {
      payload = content; // not JSON → send as string
    }

    onMessage({
      routingKey,
      payload,
      fields: m.fields,
      properties: m.properties,
    });

    ch!.ack(m); // best-effort dashboard
  });
}
