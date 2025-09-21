# Live Dashboards with RabbitMQ + WebSockets

Ever wonder how certain dashboards keep **updating in real time**—graphs moving, counters ticking? One clean way is to put a **message bus (RabbitMQ)** between your apps and the UI. Your **producers** (apps that know when something happened—e.g., *user created*, *password changed*, *image deleted*) **publish events to RabbitMQ**. A **dashboard service** then **consumes** those events, aggregates numbers/time-series, and **pushes live updates to browsers via WebSockets**.

**Flow:** Apps → RabbitMQ → Dashboard Service → WebSockets → Browser

---

## Why a message bus (in one minute)

* **Decouple** producers from the dashboard
* **Fan-out** the same event to multiple consumers (metrics, audit, alerts)
* **Buffer** spikes and outages (dashboard can be slow or temporarily down)
* **Filter** by topic/routing key without changing producers
* **Replay** or add new consumers later

---

## Architecture at a glance

* **Producers (your apps):** publish JSON events to a RabbitMQ **topic exchange** (e.g., `events`) with routing keys like `auth.user.created`, `storage.image.deleted`.
* **RabbitMQ (message bus):** durable exchange + durable queue(s) bound with patterns (e.g., `#` for all events).
* **Dashboard service (Node/Next.js backend):** consumes from a queue, keeps running totals/series, broadcasts **WebSocket** snapshots.
* **Browser (Next.js frontend):** subscribes over WebSockets and renders charts/counters that update instantly.

---

## How to accomplish this feat

### 1) Set up RabbitMQ

* Choose a **vhost** (e.g., `events`) and an **app user** with permissions limited to that vhost.
* Create a **topic exchange** (e.g., `events`, durable).
* Create a **durable queue** (e.g., `events.metrics`) and **bind** it to the exchange with a pattern (start with `#` to receive everything).

### 2) Define a routing-key schema

Use a simple, consistent pattern to describe events:

* **`<domain>.<entity>.<action>`**

  * Examples: `auth.user.created`, `auth.password.changed`, `storage.image.deleted`, `storage.object.uploaded`.
* This enables easy filtering later (`auth.#`, `*.image.*`, `*.*.deleted`).

### 3) Producer (vanilla Node script)

* Connects to the `events` vhost and **publishes events** to the `events` topic exchange.
* Sends small JSON payloads (IDs/metadata, not binaries).
* For the first iteration, **best-effort** is fine; add durability features later if needed.

### 4) Dashboard service (Next.js backend responsibilities)

* **Consumes** messages from `events.metrics`.
* Maintains in-memory (or Redis-backed) **counters and per-minute series** (e.g., *total*, *today*, per routing key).
* **Broadcasts snapshots** to clients via WebSockets (no polling).
* Exposes a simple health/status endpoint.

### 5) Browser UI (Next.js frontend responsibilities)

* Connects to the WebSocket endpoint.
* Renders **live counters and charts** (e.g., uploads per minute, password changes today).
* Updates instantly when a new snapshot arrives.

---

## What we’ll measure first (examples)

* **Auth:** `auth.user.created`, `auth.password.changed`
* **Storage:** `storage.object.uploaded`, `storage.image.deleted`
* Start with \~50 variables (keys) you care about; the dashboard aggregates **all-time** and **today** for each (timezone: Asia/Karachi).

---

## Operational notes (read before prod)

* **Durability:** make exchange/queue *durable*; publish *persistent* messages if you need them to survive broker restarts.
* **Best-effort vs reliable:** begin best-effort to keep apps simple; later add **publisher confirms**, **prefetch/acks**, and a **DLQ** if you need guarantees.
* **Security:** per-vhost users, strong passwords, restrict UI access, consider TLS if exposed beyond trusted networks.

---

## Roadmap

1. Bring RabbitMQ up (done).
2. Declare vhost/user/exchange/queue and bindings.
3. Add a minimal **producer script** (vanilla Node) to emit test events.
4. Add a **Next.js dashboard** (consumer + WebSockets + UI).
5. Optional: persistence (Redis), alerts (Prometheus/Grafana), and long-term storage (Timescale/InfluxDB).

---

---

## Dive in Rabbitmq

We create a dedicated **vhost** (`events`) to isolate our messaging setup, add an **app user** (`uploader`) with permissions only in that vhost, and declare a **topic exchange** (`events`) that routes events by routing key (e.g., `auth.user.created`, `storage.image.deleted`). We then create a **durable queue** (`events.metrics`) and **bind** it to the exchange with the pattern `#`, which means the dashboard consumer receives **all events**. This gives us a simple, reliable path: **Producers → `events` exchange → `events.metrics` queue → Dashboard → WebSockets → Browser**.

## Declare RabbitMQ Topology (vhost, exchange, queue, binding)

We keep everything isolated in a vhost called `events`, and declare a **topic** exchange plus one queue for the dashboard.

> Run these **inside the RabbitMQ container** (or replace `localhost:15672` with your host/IP).  
> Ensure the `events` vhost exists and the user has permissions (`rabbitmqctl add_vhost events` and `rabbitmqctl set_permissions -p events <user> ".*" ".*" ".*"`).



```bash
podman exec rabbitmq rabbitmqctl add_vhost events
podman exec rabbitmq rabbitmqctl add_user uploader 'Str0ngPass!'
podman exec rabbitmq rabbitmqctl set_permissions -p events uploader ".*" ".*" ".*"

podman exec rabbitmq rabbitmqadmin -H localhost -P 15672 -V events -u admin -p 'S3cret!' \
  declare exchange name=events type=topic durable=true
podman exec rabbitmq rabbitmqadmin -H localhost -P 15672 -V events -u admin -p 'S3cret!' \
  declare queue name=events.metrics durable=true

podman exec rabbitmq rabbitmqadmin -H localhost -P 15672 -V events -u admin -p 'S3cret!' \
  declare queue name=events.metrics durable=true

podman exec rabbitmq rabbitmqadmin -H localhost -P 15672 -V events -u admin -p 'S3cret!' \
  declare binding source=events destination=events.metrics routing_key="#"

```




* `rabbitmqctl add_vhost events`
  Creates a **vhost** named `events` — a namespace to keep exchanges/queues isolated.

* `rabbitmqctl add_user uploader 'Str0ngPass!'`
  Creates an **app user** `uploader` with the given password.

* `rabbitmqctl set_permissions -p events uploader ".*" ".*" ".*"`
  Grants `uploader` full rights **within the `events` vhost**:
  `configure` / `write` / `read` (the three regexes).

* `rabbitmqadmin -u admin -p S3cret! -V events declare exchange name=events type=topic durable=true`
  Declares a **topic exchange** called `events` in the `events` vhost; **durable** so it survives restarts.

* `rabbitmqadmin -u admin -p S3cret! -V events declare queue name=events.metrics durable=true`
  Creates a **durable queue** `events.metrics` to hold messages for the dashboard consumer.

* `rabbitmqadmin -u admin -p S3cret! -V events declare binding source=events destination=events.metrics routing_key="#"`
  **Binds** the queue to the exchange with pattern `#` (match **all** routing keys), so every event published to `events` gets routed into `events.metrics`.

---

## RabbitMQ Smoke Test (exchange → queue)

Run these **inside the RabbitMQ container**. Replace creds/host if needed.

```bash
# 1) Publish a test message to the topic exchange `events`
rabbitmqadmin -H localhost -P 15672 -V events -u admin -p 'S3cret!' \
  publish exchange=events routing_key=auth.user.created \
  payload='{"hello":"world"}' properties='{"content_type":"application/json"}'

# 2) Check queue depth for `events.metrics`
rabbitmqadmin -H localhost -P 15672 -V events -u admin -p 'S3cret!' \
  list queues name messages

# 3) Fetch messages (REMOVE them from the queue)
rabbitmqadmin -H localhost -P 15672 -V events -u admin -p 'S3cret!' \
  get queue=events.metrics ackmode=ack_requeue_false count=10

# 4) Fetch messages (REQUEUE = peek without removing)
rabbitmqadmin -H localhost -P 15672 -V events -u admin -p 'S3cret!' \
  get queue=events.metrics ackmode=ack_requeue_true count=10

# 5) Re-check queue depth (optional)
rabbitmqadmin -H localhost -P 15672 -V events -u admin -p 'S3cret!' \
  list queues name messages

---

## Dive In to Publishing (Node.js Publisher Library – Design)

This section describes how to design a small **Node.js publisher library** that any service can import to publish events to RabbitMQ. We’ll keep it **backend-only** (no UI), with a clean API, safe defaults, and room to grow.

### Goals
- **Simple to use** for app developers: one function call to publish.
- **Consistent routing** via a clear key schema (e.g., `<domain>.<entity>.<action>`).
- **Configurable reliability**: start **best-effort**; optionally enable confirms/outbox later.
- **Safe payloads**: small JSON only (IDs/metadata), no large binaries.

---

### Recommended API (no code yet)
- `createPublisher(config)` → returns a publisher instance.
- `publisher.publish(routingKey, payload, options?)`
- `publisher.health()` → lightweight status (connected or not).
- `publisher.close()` → tidy shutdown.

**Config fields (examples):**
- `amqpUrl` (e.g., `amqp://uploader:***@host:5672/events`)
- `exchange` (default: `events`)
- `appId` (identifies the publisher service)
- `reliability` (`"best-effort"` | `"confirm"`)
- `messageDefaults` (headers like `contentType`, `deliveryMode`)
- `retry` (min backoff, max backoff) — used only for connect loops
- `serialize`/`validate` hooks (optional)

**Publish options (per call):**
- `messageId` (string; encourage callers to pass for idempotency)
- `timestamp` (Date/ISO; else library sets `now()`)
- `headers` (object; small only)
- `expiration` (ms) if the event can expire
- `persistent` (boolean; default true)

---

### Routing Key & Payload Conventions
- **Routing key**: `<domain>.<entity>.<action>`  
  Examples: `auth.user.created`, `auth.password.changed`, `storage.image.deleted`
- **Payload JSON** (small, flat, metadata only):  
  Must include a **timestamp**; recommend `messageId` for idempotency.
- **Size limits**: keep payloads `< 128 KB`; store big data in object storage and include a reference.

---

### Reliability Levels (choose per environment)
1. **Best-effort (default)**
   - Fire-and-forget; if broker is down, **drop** the event.
   - Good for dev/test and initial rollout.
2. **Confirm mode (upgrade later)**
   - Enable publisher confirms; treat **ACK = persisted**.
   - Quick retry on publish failure; log failures.
3. **Outbox (advanced)**
   - Write event to a local DB table (transactionally with business op), then a background flusher publishes to MQ.
   - Guarantees **no loss** at the cost of more plumbing.

> Start with **best-effort**. Move to **confirm** when ops are ready. Adopt **outbox** if you need strict guarantees.

---

### Connection & Channel Management
- Create one **shared connection** per process; one **confirm channel** (or regular channel for best-effort).
- **Auto-reconnect** with backoff (e.g., 1s → 5s → 10s), but **do not block** the app if disconnected.
- Expose `publisher.health()` so upstream services can surface readiness.

---

### Validation & Serialization
- Validate routing key against a regex like: `^[a-z]+(\.[a-z]+){2,3}$` (light guard, not rigid).
- Validate payload is JSON-serializable and **contains `ts`** (timestamp).
- Set `contentType: application/json`; reject large payloads.

---

### Error Handling Contract
- `publish()` returns:
  - **best-effort**: boolean (queued yes/no); log on failure.
  - **confirm**: resolve on broker ACK; reject on NACK/timeout.
- Never throw on **broker unavailable** if in best-effort; just return `false` and log.
- Make logs **structured**: include routingKey, messageId, reason.

---

### Observability
- Emit counters (optional later):  
  `events_published_total{routing_key=...}`, `events_publish_failed_total{reason=...}`
- Include a lightweight `health()` for readiness checks.
- Add trace context to headers if you use distributed tracing.

---

### Security & Isolation
- Use a **dedicated vhost** (e.g., `events`) and **least-privilege** user (publish-only).
- Keep credentials in env vars or secret manager.
- Consider TLS if publishing across untrusted networks.

---

### Versioning & Schema Evolution
- Prefer **backward-compatible** payload changes (add fields).
- If you must break, either:
  - add a **4th segment** to the routing key (e.g., `auth.user.created.v2`), or
  - include `schemaVersion` in headers/payload and let consumers branch.

---

### Testing & Local Dev
- Unit: stub the channel and assert that `publish()` was called with expected routingKey/payload/headers.
- Integration: run RabbitMQ locally (Podman/Compose), publish a test event, verify it appears in the queue.
- Contract: keep short examples of valid routing keys and payloads in the repo.

---

### Example Usage (pseudocode only)
1) **Initialize** once at service start:
   - `const publisher = await createPublisher(config)`
2) **In your business logic** (after successful action):
   - `await publisher.publish("auth.user.created", { ts, userId, actor })`
3) **Shutdown**:
   - `await publisher.close()`

---

## Magic of Publishing

We created a small **publisher library** (`libs/publisher`) that apps can use to send events to RabbitMQ. There’s also a **playground** to quickly try it.

### What’s included
- **Library:** `createPublisher({ amqpUrl, exchange, appId })` → `{ publish(), health(), close() }`
- **Playground:** two scripts under `playground/`
  - `test.mjs` — prints publisher health
  - `publish.mjs` — sends one sample event

### How to run (local)
Use the RabbitMQ reachable from your Mac (e.g., `localhost:5672`).

```bash
# 1) Build the library once
cd libs/publisher && npm run build

# 2) Check connection status (should become "connected")
cd ../../playground
node test.mjs

# 3) Publish a sample event
node publish.mjs

---
### Rollout Checklist
- [ ] vhost/user/permissions in RabbitMQ
- [ ] topic exchange declared (`events`, durable)
- [ ] library env vars set in each service
- [ ] routing-key docs shared with teams
- [ ] logs/metrics dashboard for publish success/fail
- [ ] (later) switch to confirm mode in staging/production

> With this library in place, any service can publish one line per event, and your dashboard (consumer) will have a consistent, real-time stream to drive live charts and counters.

---
## Glossary (quick)

* **Vhost:** a namespace/isolation boundary in RabbitMQ; exchanges/queues live inside it.
* **Exchange (topic):** routes messages to queues based on the routing key pattern.
* **Queue:** stores messages until a consumer receives them.
* **Routing key:** dot-separated label used for topic routing (e.g., `storage.image.deleted`).
* **Binding:** pattern that links an exchange to a queue (e.g., `#` to match all).
* **Payload:** the message body (usually JSON) your consumers read.

```bash

# 1) Check Git is installed
git --version

# 2) Set your global identity (applies to all repos)
git config --global user.name "Yasir Mirza"
git config --global user.email "mughal@gmail.com"

# 3) Verify
git config --global --list


# store HTTPS creds in macOS Keychain
git config --global credential.helper osxkeychain

# set default branch name for new repos
git config --global init.defaultBranch main

# 1) Create the bridge network (name must match your compose file)
sudo podman network create \
  --driver bridge \
  --subnet 192.168.150.0/24 \
  --gateway 192.168.150.1 \
  curioz-netqa

# (Optional) verify
sudo podman network inspect curioz-netqa
```

# Bring up container

```bash
podman compose -f rabbit.yml up -d


# 2) Health + basic diagnostics
podman exec rabbitmq rabbitmq-diagnostics ping
podman exec rabbitmq rabbitmqctl status | head -n 30
podman exec rabbitmq rabbitmqctl list_vhosts
podman exec rabbitmq rabbitmqctl list_users

# 3) Listeners (ports) check
podman exec rabbitmq rabbitmqctl status | grep -A2 listeners
nc -vz localhost 5672
curl -u admin:S3cret! http://localhost:15672/api/overview

```
