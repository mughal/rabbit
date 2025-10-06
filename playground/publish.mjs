// publish.mjs - Updated for Dynamic Dashboard Testing
import amqplib from "amqplib";
import { randomUUID } from "crypto";

const AMQP_URL = process.env.AMQP_URL || "amqp://uploader:Str0ngPass!@localhost:5672/events";
const EXCHANGE = process.env.AMQP_EXCHANGE || "events";

// Sample domains, entities, and actions for testing
const DOMAINS = ['auth', 'user', 'payment', 'order', 'inventory', 'notification', 'system', 'api'];
const ENTITIES = ['user', 'invoice', 'order', 'stock', 'email', 'log', 'request', 'session'];
const ACTIONS = ['created', 'updated', 'deleted', 'processed', 'sent', 'received', 'failed', 'completed'];

function generateRandomEvent(routingKey) {
  const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  const entity = ENTITIES[Math.floor(Math.random() * ENTITIES.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  
  const finalRoutingKey = routingKey || `${domain}.${entity}.${action}`;
  
  return {
    routingKey: finalRoutingKey,
    payload: {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      data: {
        sample: "This is sample event data",
        randomValue: Math.random() * 1000,
        source: "dynamic-dashboard-test"
      }
    },
    ts: new Date().toISOString()
  };
}

(async () => {
  // Use provided routing key or generate random one
  const RK = process.argv[2] || null;
  
  const msg = generateRandomEvent(RK);

  console.log(`[pub] connecting ${AMQP_URL.replace(/\/\/.*@/, "//***@")}`);
  const conn = await amqplib.connect(AMQP_URL);
  const ch = await conn.createChannel();
  await ch.assertExchange(EXCHANGE, "topic", { durable: true });

  const ok = ch.publish(EXCHANGE, msg.routingKey, Buffer.from(JSON.stringify(msg)), {
    appId: "dynamic-dashboard",
    contentType: "application/json",
    messageId: randomUUID(),
    timestamp: Date.now(),
    persistent: true,
    headers: { 
      eventType: "dynamic",
      source: "publish.mjs"
    },
  });

  console.log(`[pub] dynamic event -> exchange='${EXCHANGE}' rk='${msg.routingKey}' ok=${ok}`);
  await ch.close();
  await conn.close();
  process.exit(0);
})().catch((e) => {
  console.error("[pub] error:", e);
  process.exit(1);
});