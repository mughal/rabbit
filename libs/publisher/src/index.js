// libs/publisher/src/index.js
import amqplib from "amqplib";

function normalizeConfig(config = {}) {
  return {
    amqpUrl: config.amqpUrl || "",
    exchange: config.exchange || "events",
    appId: config.appId || "publisher",
    persistent: config.persistent ?? true
  };
}

/**
 * Best-effort publisher:
 * - tries to connect once on create
 * - if not connected, publish() returns false
 * - no confirms, no reconnect yet (we’ll add later if you want)
 */
export function createPublisher(config = {}) {
  const cfg = normalizeConfig(config);

  let conn = null;
  let ch = null;
  let connected = false;
  let lastError = null;

  (async () => {
    if (!cfg.amqpUrl) return;
    try {
      conn = await amqplib.connect(cfg.amqpUrl, { heartbeat: 15 });
      ch = await conn.createChannel();
      await ch.assertExchange(cfg.exchange, "topic", { durable: true });
      connected = true;

      conn.on("close", () => { connected = false; ch = null; conn = null; });
      conn.on("error", (e) => { lastError = e; });
    } catch (e) {
      lastError = e;
      connected = false;
    }
  })();

  return {
    publish(routingKey, payload) {
      if (!connected || !ch) return false;
      if (!routingKey || typeof routingKey !== "string") return false;
      try {
        const body = Buffer.from(JSON.stringify(payload ?? {}));
        return ch.publish(
          cfg.exchange,
          routingKey,
          body,
          {
            contentType: "application/json",
            appId: cfg.appId,
            persistent: cfg.persistent
          }
        );
      } catch (e) {
        lastError = e;
        return false;
      }
    },
    health() {
      return {
        status: connected ? "connected" : "disconnected",
        details: {
          exchange: cfg.exchange,
          amqpConfigured: Boolean(cfg.amqpUrl),
          lastError: lastError ? String(lastError) : null
        }
      };
    },
    async close() {
      try { await ch?.close(); } catch {}
      try { await conn?.close(); } catch {}
      connected = false;
      ch = null; conn = null;
    }
  };
}
