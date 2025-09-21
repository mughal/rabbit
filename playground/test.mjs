import { createPublisher } from "../libs/publisher/dist/index.js";

const publisher = createPublisher({
  amqpUrl: "amqp://uploader:Str0ngPass!@localhost:5672/events",
  exchange: "events",
  appId: "playground"
});

console.log("t0 health:", publisher.health());
setTimeout(() => {
  console.log("t1 health:", publisher.health());
  process.exit(0);
}, 1000);
