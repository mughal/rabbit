// publish.mjs
import amqplib from "amqplib";
import { randomUUID } from "crypto";

const AMQP_URL = process.env.AMQP_URL || "amqp://uploader:Str0ngPass!@localhost:5672/events";
const EXCHANGE = process.env.AMQP_EXCHANGE || "events";
const RK = process.argv[2] || "auth.user.created";

(async () => {
  const msg = {
    hello: "world",
    ts: new Date().toISOString(),
    source: "publish.mjs",
    note: "If you see me in server logs AND on the page, the full path works.",
  };

  console.log(`[pub] connecting ${AMQP_URL.replace(/\/\/.*@/, "//***@")}`);
  const conn = await amqplib.connect(AMQP_URL);
  const ch = await conn.createChannel();
  await ch.assertExchange(EXCHANGE, "topic", { durable: true });

  const ok = ch.publish(EXCHANGE, RK, Buffer.from(JSON.stringify(msg)), {
    appId: "playground",
    contentType: "application/json",
    messageId: randomUUID(),
    timestamp: Date.now(),
    persistent: true,
    headers: { demo: "yes" },
  });

  console.log(`[pub] publish -> exchange='${EXCHANGE}' rk='${RK}' ok=${ok}`);
  await ch.close();
  await conn.close();
  process.exit(0);
})().catch((e) => {
  console.error("[pub] error:", e);
  process.exit(1);
});
