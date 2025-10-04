## Send test messages

Once you have cloned the respository, then you can publish messages to rabbitmq after installing modules

```bash
macbook@Macbooks-MacBook-Pro rabbit % cd playground 
macbook@Macbooks-MacBook-Pro playground % node publish.mjs auth.user.deleted
[pub] connecting amqp://***@localhost:5672/events
[pub] publish -> exchange='events' rk='auth.user.deleted' ok=true
macbook@Macbooks-MacBook-Pro playground % node publish.mjs auth.user.created
[pub] connecting amqp://***@localhost:5672/events
[pub] publish -> exchange='events' rk='auth.user.created' ok=true
macbook@Macbooks-MacBook-Pro playground % 
```