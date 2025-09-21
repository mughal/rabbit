import { createPublisher } from "../libs/publisher/dist/index.js";

const publisher = createPublisher({
  amqpUrl: "amqp://uploader:Str0ngPass!@localhost:5672/events",
  exchange: "events",
  appId: "playground"
});

// give the connection a moment (best-effort simple wait)
setTimeout(() => {
  const ok = publisher.publish("auth.user.created", { hello: "world", ts: new Date().toISOString() });
  console.log("publish returned:", ok);
  setTimeout(() => publisher.close().then(()=>process.exit(0)), 300);
}, 500);
