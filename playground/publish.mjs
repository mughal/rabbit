// publish.mjs - Updated for Payment Dashboard
import amqplib from "amqplib";
import { randomUUID } from "crypto";

const AMQP_URL = process.env.AMQP_URL || "amqp://uploader:Str0ngPass!@localhost:5672/events";
const EXCHANGE = process.env.AMQP_EXCHANGE || "events";

// Payment channels for the utility company
const PAYMENT_CHANNELS = [
  "payment.mobile",
  "payment.web", 
  "payment.agent",
  "payment.bank",
  "payment.pos"
];

// Customer IDs for simulation
const CUSTOMER_IDS = [
  "CUST-001", "CUST-002", "CUST-003", "CUST-004", "CUST-005",
  "CUST-006", "CUST-007", "CUST-008", "CUST-009", "CUST-010"
];

// Payment methods
const PAYMENT_METHODS = ["credit_card", "debit_card", "bank_transfer", "digital_wallet", "cash"];

function generatePaymentEvent(routingKey) {
  const amount = Math.floor(Math.random() * 500) + 10; // $10 to $510
  const customerId = CUSTOMER_IDS[Math.floor(Math.random() * CUSTOMER_IDS.length)];
  const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
  
  return {
    routingKey: routingKey,
    payload: {
      channel: routingKey,
      amount: amount,
      timestamp: new Date().toISOString(),
      customerId: customerId,
      paymentMethod: paymentMethod,
      status: "success",
      utilityType: ["electricity", "water", "gas"][Math.floor(Math.random() * 3)],
      invoiceId: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    },
    ts: new Date().toISOString()
  };
}

(async () => {
  // Use provided routing key or random payment channel
  const RK = process.argv[2] || PAYMENT_CHANNELS[Math.floor(Math.random() * PAYMENT_CHANNELS.length)];
  
  // Generate a realistic payment event
  const msg = generatePaymentEvent(RK);

  console.log(`[pub] connecting ${AMQP_URL.replace(/\/\/.*@/, "//***@")}`);
  const conn = await amqplib.connect(AMQP_URL);
  const ch = await conn.createChannel();
  await ch.assertExchange(EXCHANGE, "topic", { durable: true });

  const ok = ch.publish(EXCHANGE, RK, Buffer.from(JSON.stringify(msg)), {
    appId: "payment-dashboard",
    contentType: "application/json",
    messageId: randomUUID(),
    timestamp: Date.now(),
    persistent: true,
    headers: { 
      eventType: "payment",
      source: "publish.mjs"
    },
  });

  console.log(`[pub] payment event -> exchange='${EXCHANGE}' rk='${RK}' amount=$${msg.payload.amount} customer=${msg.payload.customerId} ok=${ok}`);
  await ch.close();
  await conn.close();
  process.exit(0);
})().catch((e) => {
  console.error("[pub] error:", e);
  process.exit(1);
});