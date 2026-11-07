# sn8w VPS deploy agent

**Projects are auto-discovered:** every folder in `/home/debian` containing a
`docker-compose.prod.yml` (or `docker-compose.yml`) appears in the panel, so adding
a project = deploying it on the VPS as usual. `/etc/sn8w-agent/projects.json` is
optional, only to rename (`name`), pick another `compose` file, or `hidden: true`
a folder. The `proxy` (Caddy) folder is never exposed.

Lets the portal admin panel (`/admin` → "VPS deployment") start, stop or
uninstall the Docker Compose projects on the VPS. Whitelist + three fixed
actions only; HMAC-signed requests (60 s window) over HTTPS via Caddy.

| Action | Effect | Frees |
|---|---|---|
| Start | `docker compose up -d --build` | – |
| Stop | `docker compose stop` | RAM / CPU |
| Uninstall | `docker compose down --rmi all` | RAM + disk (images). **Data volumes are kept.** |

## One-time setup on the VPS (as `debian`)

Copy this folder to the VPS (`scp -r vps-agent debian@51.178.45.76:~/`), then:

```bash
sudo mkdir -p /opt/sn8w-agent /etc/sn8w-agent
sudo cp ~/vps-agent/agent.py /opt/sn8w-agent/
sudo cp ~/vps-agent/sn8w-agent.service /etc/systemd/system/
sudo cp ~/vps-agent/projects.example.json /etc/sn8w-agent/projects.json   # then edit paths
openssl rand -hex 32 | sudo tee /etc/sn8w-agent/secret                    # copy this value for the portal
sudo chown root:docker /etc/sn8w-agent/secret && sudo chmod 640 /etc/sn8w-agent/secret
sudo systemctl daemon-reload && sudo systemctl enable --now sn8w-agent
sudo ufw allow from 172.18.0.0/16 to any port 8787 proto tcp   # web network -> agent only
```

The agent binds to the `web` Docker network gateway (`172.18.0.1`), so it is not
reachable from the internet. Add DNS `A deploy.sn8w.com -> 51.178.45.76` (see
`VPS-OPERATIONS.md`), then append to `~/proxy/Caddyfile` (back it up, write in place
because the container bind-mounts the single file), validate and reload:

```
deploy.sn8w.com {
    reverse_proxy 172.18.0.1:8787
}
```

`docker exec caddy caddy validate --config /etc/caddy/Caddyfile` then
`docker exec caddy caddy reload --config /etc/caddy/Caddyfile`.

## Portal side

Add GitHub secrets `VPS_AGENT_URL` (`https://deploy.sn8w.com`) and
`VPS_AGENT_SECRET` (the value generated above); the deploy workflow writes them
into `api/lib/config.local.php`. Locally, define `SN8W_VPS_AGENT_URL` /
`SN8W_VPS_AGENT_SECRET` in your own `config.local.php`.

Run `api/migrations/011_vps_links.sql` in phpMyAdmin **before** deploying.
