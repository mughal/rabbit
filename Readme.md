# Notes

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
