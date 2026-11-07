#!/usr/bin/env python3
"""sn8w VPS deploy agent.

Tiny HTTP service the sn8w portal calls to start / stop / uninstall the Docker
Compose projects on this VPS. It can ONLY act on projects listed in
projects.json (a whitelist) and ONLY with three fixed actions -- it never
executes anything taken from the request. Requests are HMAC-signed with a
shared secret and expire after 60 s. Stdlib only (Debian 12 ships python3).
"""
import hashlib
import hmac
import json
import os
import re
import shutil
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

CONFIG_DIR = os.environ.get("SN8W_AGENT_CONFIG", "/etc/sn8w-agent")
PORT = int(os.environ.get("SN8W_AGENT_PORT", "8787"))
BIND = os.environ.get("SN8W_AGENT_BIND", "0.0.0.0")
MAX_SKEW = 60

with open(os.path.join(CONFIG_DIR, "secret"), "r", encoding="utf-8") as f:
    SECRET = f.read().strip().encode()
HOME = os.environ.get("SN8W_AGENT_HOME", "/home/debian")
NEVER = {"proxy"}  # the Caddy reverse proxy must never be controllable from the portal


def load_projects():
    """Auto-discover every ~/<dir> holding a compose file, then apply the
    optional overrides in projects.json ({"key": {"name", "compose", "hidden"}}).
    New projects therefore show up in the portal with no config edit."""
    found = {}
    for entry in sorted(os.listdir(HOME)):
        path = os.path.join(HOME, entry)
        if entry in NEVER or entry.startswith(".") or not os.path.isdir(path):
            continue
        for compose in ("docker-compose.prod.yml", "docker-compose.yml", "compose.yaml"):
            if os.path.isfile(os.path.join(path, compose)):
                found[entry] = {"name": entry, "dir": path, "compose": compose}
                break
    try:
        with open(os.path.join(CONFIG_DIR, "projects.json"), "r", encoding="utf-8") as f:
            overrides = json.load(f)
    except FileNotFoundError:
        overrides = {}
    for key, o in overrides.items():
        if key in NEVER:
            continue
        if o.get("hidden"):
            found.pop(key, None)
        elif key in found:
            found[key].update({k: v for k, v in o.items() if k in ("name", "compose", "env_file", "manual", "skip_build", "build", "min_mem_mb")})
    return found


class _Projects:
    """Re-scanned on every access so a project added later needs no restart."""
    def _d(self): return load_projects()
    def __getitem__(self, k): return self._d()[k]
    def __contains__(self, k): return k in self._d()
    def items(self): return self._d().items()


PROJECTS = _Projects()

jobs = {}  # key -> {"op", "state": running|done|error, "log", "at"}
jobs_lock = threading.Lock()


STATE_DIR = os.environ.get("SN8W_AGENT_STATE", os.path.join(HOME, ".sn8w-agent"))
LOG_MAX_SIZE = "10m"
LOG_MAX_FILE = "3"


def override_path(key):
    return os.path.join(STATE_DIR, f"{key}.logging.yml")


def compose_base(key, with_override=True):
    p = PROJECTS[key]
    # No -p: compose derives the project name from the directory, exactly as
    # when the stack was first created, so we address the existing containers.
    cmd = ["docker", "compose", "-f", p.get("compose", "docker-compose.prod.yml")]
    # Generated log-rotation override (kept outside the project's git tree, so it
    # never makes the working copy "dirty"): every service gets capped json logs.
    if with_override and os.path.isfile(override_path(key)):
        cmd += ["-f", override_path(key)]
    if p.get("env_file"):
        cmd += ["--env-file", p["env_file"]]
    return cmd


def ensure_log_override(key):
    """Write (or refresh) the log-rotation override for every service of a project."""
    r = subprocess.run(compose_base(key, with_override=False) + ["config", "--services"],
                       cwd=PROJECTS[key]["dir"], capture_output=True, text=True, timeout=60)
    # stdout only (warnings go to stderr) and only valid service names.
    services = [x for x in r.stdout.split() if re.fullmatch(r"[A-Za-z0-9_.-]+", x)] if r.returncode == 0 else []
    if not services:
        return None
    lines = ["services:"]
    for name in services:
        lines += [f"  {name}:", "    logging:", "      driver: json-file", "      options:",
                  f'        max-size: "{LOG_MAX_SIZE}"', f'        max-file: "{LOG_MAX_FILE}"']
    text = "\n".join(lines) + "\n"
    os.makedirs(STATE_DIR, exist_ok=True)
    path = override_path(key)
    try:
        with open(path, "r", encoding="utf-8") as f:
            if f.read() == text:
                return path
    except OSError:
        pass
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    return path


def run(key, *args):
    r = subprocess.run(compose_base(key) + list(args), cwd=PROJECTS[key]["dir"],
                       capture_output=True, text=True, timeout=1800)
    return r.returncode, (r.stdout + r.stderr)[-4000:]


def project_status(key):
    try:
        code, out = run(key, "ps", "-a", "--format", "json")
        rows = []
        text = out.strip()
        if text.startswith("["):
            rows = json.loads(text)
        else:
            rows = [json.loads(l) for l in text.splitlines() if l.startswith("{")]
        running = sum(1 for r in rows if r.get("State") == "running")
        if code != 0:
            state = "unknown"
        elif not rows:
            state = "uninstalled"
        elif running == len(rows):
            state = "running"
        elif running:
            state = "partial"
        else:
            state = "stopped"
        return {"state": state, "containers": len(rows)}
    except Exception as e:  # never crash the status call
        return {"state": "unknown", "containers": 0, "error": str(e)[:200]}



def sh(cmd, cwd, timeout=1800, limit=2000):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout)
    return r.returncode, (r.stdout + r.stderr).strip()[-limit:]


def git_info(key):
    """Cached result of the last background `git fetch` (see refresher)."""
    return git_cache.get(key)


def refresh_git(key):
    p = PROJECTS[key]
    d = p["dir"]
    if not os.path.isdir(os.path.join(d, ".git")):
        return {"repo": False}
    sh(["git", "fetch", "--quiet"], d, timeout=60)
    c1, branch = sh(["git", "rev-parse", "--abbrev-ref", "HEAD"], d)
    c2, behind = sh(["git", "rev-list", "--count", "HEAD..@{u}"], d)
    c3, dirty = sh(["git", "status", "--porcelain"], d)
    return {"repo": True, "branch": branch, "behind": int(behind) if c2 == 0 and behind.isdigit() else None,
            "dirty": bool(dirty) if c3 == 0 else None}


def git_refresher():
    while True:
        for key in list(dict(PROJECTS.items())):
            try:
                git_cache[key] = refresh_git(key)
            except Exception as e:
                git_cache[key] = {"repo": False, "error": str(e)[:100]}
        time.sleep(600)


def build_steps(key):
    """Frontend build steps (run in a throwaway node container, like the runbook)."""
    p = PROJECTS[key]
    if p.get("skip_build"):
        return []
    if p.get("build"):
        return p["build"]  # [{"dir": ".", "cmd": "npm ci && npm run build"}]
    steps = []
    for sub in (".", "frontend"):
        base = os.path.join(p["dir"], sub)
        if not os.path.isfile(os.path.join(base, "package.json")):
            continue
        if os.path.isfile(os.path.join(base, "angular.json")):
            steps.append({"dir": sub, "cmd": "npm ci && npx ng build --configuration production"})
        elif any(os.path.isfile(os.path.join(base, f)) for f in ("vite.config.ts", "vite.config.js")):
            steps.append({"dir": sub, "cmd": "npm ci && npm run build"})
        if steps:
            break
    return steps


def update_blocker(key):
    """Why an update must not start (None = OK)."""
    p = PROJECTS[key]
    if p.get("manual"):
        return p.get("manual") if isinstance(p.get("manual"), str) else "This project has its own release process"
    g = git_cache.get(key) or refresh_git(key)
    if not g.get("repo"):
        return "Not a git clone on the VPS"
    if g.get("dirty"):
        return "Uncommitted changes on the VPS - commit or discard them first"
    if build_steps(key):
        avail = (host_info().get("memAvailable") or 0) // (1024 * 1024)
        need = int(p.get("min_mem_mb", 800))
        if avail < need:
            return f"Only {avail} MB RAM free, a frontend build needs ~{need} MB - stop another project first"
    return None


def do_update(key):
    p = PROJECTS[key]
    d = p["dir"]
    log = []
    why = update_blocker(key)
    if why:
        return 1, why
    c, out = sh(["git", "pull", "--ff-only"], d, timeout=300)
    log.append("$ git pull --ff-only\n" + out)
    if c != 0:
        return 1, "\n".join(log)
    for step in build_steps(key):
        work = os.path.join(d, step["dir"])
        c, out = sh(["docker", "run", "--rm", "-v", f"{work}:/app", "-w", "/app", "node:24-alpine",
                     "sh", "-c", step["cmd"]], d, timeout=1800)
        log.append(f"$ build {step['dir']}\n" + out)
        if c != 0:
            return 1, "\n".join(log)
    c, out = run(key, "up", "-d", "--build")
    log.append("$ compose up -d --build\n" + out)
    return c, "\n".join(log)[-4000:]


git_cache = {}


disk_cache = {}  # refreshed in the background: where the disk goes, per project


def dir_size(path):
    try:
        r = subprocess.run(["nice", "-n", "19", "du", "-sb", path], capture_output=True, text=True, timeout=300)
        return int(r.stdout.split()[0]) if r.returncode == 0 and r.stdout.strip() else 0
    except Exception:
        return 0


def image_bytes(key):
    """Unique image bytes used by this project's containers (asked to Docker directly,
    so compose variable interpolation / .env files are not needed)."""
    code, out = sh(["docker", "ps", "-a", "--filter", f"label=com.docker.compose.project={key}",
                    "--format", "{{.Image}}"], "/", timeout=60)
    seen = {}
    if code == 0:
        for image in set(out.split()):
            c, info = sh(["docker", "image", "inspect", image, "--format", "{{.Id}} {{.Size}}"], "/", timeout=60)
            parts = info.split()
            if c == 0 and len(parts) == 2 and parts[1].isdigit():
                seen[parts[0]] = int(parts[1])
    return sum(seen.values())


def node_modules_paths(key):
    d = PROJECTS[key]["dir"]
    return [p for p in (os.path.join(d, "node_modules"), os.path.join(d, "frontend", "node_modules")) if os.path.isdir(p)]


def disk_refresher():
    while True:
        report = {}
        for key, p in list(dict(PROJECTS.items()).items()):
            try:
                d = p["dir"]
                report[key] = {
                    "source": dir_size(d),
                    "nodeModules": sum(dir_size(x) for x in node_modules_paths(key)),
                    "git": dir_size(os.path.join(d, ".git")) if os.path.isdir(os.path.join(d, ".git")) else 0,
                    "images": image_bytes(key),
                }
            except Exception:
                continue
        disk_cache.update({"projects": report, "at": int(time.time())})
        time.sleep(900)


def do_clean(key):
    """Remove regenerable files: node_modules (rebuilt by Update) and git garbage."""
    d = PROJECTS[key]["dir"]
    log = []
    for path in node_modules_paths(key):
        rel = os.path.relpath(path, d).replace(os.sep, "/")
        # root-owned files (created by the build container) -> remove through a container
        c, out = sh(["docker", "run", "--rm", "-v", f"{d}:/w", "node:24-alpine", "sh", "-c", f"rm -rf /w/{rel}"], d, timeout=600)
        log.append(f"removed {rel}" if c == 0 else f"failed {rel}: {out}")
    if os.path.isdir(os.path.join(d, ".git")):
        sh(["git", "reflog", "expire", "--expire=now", "--all"], d)
        c, out = sh(["git", "gc", "--prune=now", "--quiet"], d, timeout=600)
        log.append("git gc ok" if c == 0 else "git gc failed: " + out)
    return 0, "\n".join(log) or "nothing to clean"


def do_prune_cache():
    c, out = sh(["docker", "builder", "prune", "-af"], "/", timeout=900)
    return c, out


def do_action(key, action):
    try:
        if action in ("start", "update"):
            ensure_log_override(key)
        if action == "start":
            code, out = run(key, "up", "-d", "--build")
        elif action == "stop":  # frees RAM/CPU, keeps images + data
            code, out = run(key, "stop")
        elif action == "update":  # git pull + frontend build + compose up --build
            code, out = do_update(key)
        elif action == "clean":
            code, out = do_clean(key)
        elif action == "prune-cache":  # host-wide, key is "_host"
            code, out = do_prune_cache()
        elif action == "uninstall":  # frees RAM + disk: containers + images; KEEPS data volumes
            code, out = run(key, "down", "--rmi", "all", "--remove-orphans")
        else:
            code, out = 1, "unknown action"
        state = "done" if code == 0 else "error"
    except Exception as e:
        state, out = "error", str(e)[:1000]
    with jobs_lock:
        jobs[key] = {"op": action, "state": state, "log": out, "at": int(time.time())}


def host_info():
    d = shutil.disk_usage("/")
    mem = {}
    try:
        with open("/proc/meminfo") as f:
            for line in f:
                k, v = line.split(":")
                mem[k] = int(v.split()[0]) * 1024
    except Exception:
        pass
    uptime = None
    try:
        with open("/proc/uptime") as f:
            uptime = int(float(f.read().split()[0]))
    except Exception:
        pass
    try:
        load = list(os.getloadavg())
    except Exception:
        load = None
    return {"diskTotal": d.total, "diskFree": d.free,
            "memTotal": mem.get("MemTotal"), "memAvailable": mem.get("MemAvailable"),
            "swapTotal": mem.get("SwapTotal"), "swapFree": mem.get("SwapFree"),
            "cpus": os.cpu_count(), "load": load, "uptime": uptime,
            "docker": docker_stats.get("df"), "statsAt": docker_stats.get("at")}


UNITS = {"b": 1, "kb": 1000, "mb": 1000 ** 2, "gb": 1000 ** 3, "kib": 1024,
         "mib": 1024 ** 2, "gib": 1024 ** 3}
docker_stats = {}  # refreshed in the background: per-container usage + `docker system df`


def parse_size(text):
    t = text.strip().lower()
    num = ""
    for ch in t:
        if ch.isdigit() or ch == ".":
            num += ch
        else:
            break
    unit = t[len(num):].strip()
    try:
        return int(float(num) * UNITS.get(unit, 1))
    except ValueError:
        return 0


def refresh_docker_stats():
    containers = {}
    code, out = sh(["docker", "ps", "--format", "{{.Names}}|{{.Label \"com.docker.compose.project\"}}"], "/", timeout=30, limit=200000)
    owner = {}
    if code == 0:
        for line in out.splitlines():
            name, _, project = line.partition("|")
            owner[name] = project
    code, out = sh(["docker", "stats", "--no-stream", "--format", "{{json .}}"], "/", timeout=60, limit=200000)
    if code == 0:
        for line in out.splitlines():
            try:
                r = json.loads(line)
            except ValueError:
                continue
            used = parse_size(r.get("MemUsage", "0B").split("/")[0])
            cpu = float(r.get("CPUPerc", "0%").strip("%") or 0)
            containers[r["Name"]] = {"name": r["Name"], "project": owner.get(r["Name"]), "mem": used, "cpu": cpu}
    df = []
    code, out = sh(["docker", "system", "df", "--format", "{{json .}}"], "/", timeout=60, limit=200000)
    if code == 0:
        for line in out.splitlines():
            try:
                r = json.loads(line)
                df.append({"type": r.get("Type"), "size": parse_size(r.get("Size", "0B")),
                           "reclaimable": parse_size(r.get("Reclaimable", "0B").split("(")[0])})
            except ValueError:
                continue
    docker_stats.update({"containers": containers, "df": df, "at": int(time.time())})


def stats_refresher():
    while True:
        try:
            refresh_docker_stats()
        except Exception:
            pass
        time.sleep(30)


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def reply(self, status, obj):
        data = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def authed(self, body):
        try:
            ts = self.headers.get("X-Timestamp", "")
            sig = self.headers.get("X-Signature", "")
            if abs(time.time() - int(ts)) > MAX_SKEW:
                return False
            msg = f"{ts}.{self.command}.{self.path}.".encode() + body
            expected = hmac.new(SECRET, msg, hashlib.sha256).hexdigest()
            return hmac.compare_digest(expected, sig)
        except Exception:
            return False

    def handle_any(self):
        n = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(n) if n else b""
        if not self.authed(body):
            return self.reply(401, {"error": "unauthorized"})
        parts = self.path.strip("/").split("/")
        if self.command == "GET" and parts == ["status"]:
            with jobs_lock:
                snap = dict(jobs)
            usage = {}
            for c in (docker_stats.get("containers") or {}).values():
                u = usage.setdefault(c["project"], {"mem": 0, "cpu": 0.0})
                u["mem"] += c["mem"]
                u["cpu"] += c["cpu"]
            out = {k: {"name": p.get("name", k), **project_status(k), "job": snap.get(k),
                      "git": git_info(k), "manual": p.get("manual") or None,
                      "builds": bool(build_steps(k)), "usage": usage.get(k)}
                   for k, p in PROJECTS.items()}
            top = sorted((docker_stats.get("containers") or {}).values(), key=lambda c: -c["mem"])[:8]
            return self.reply(200, {"host": host_info(), "projects": out, "topContainers": top,
                                    "disk": disk_cache.get("projects"), "hostJob": snap.get("_host")})
        if self.command == "POST" and len(parts) == 3 and parts[0] == "projects":
            key, action = parts[1], parts[2]
            if key == "_host" and action == "prune-cache":
                with jobs_lock:
                    if jobs.get(key, {}).get("state") == "running":
                        return self.reply(409, {"error": "operation already running"})
                    jobs[key] = {"op": action, "state": "running", "log": "", "at": int(time.time())}
                threading.Thread(target=do_action, args=(key, action), daemon=True).start()
                return self.reply(202, {"accepted": True})
            if key not in PROJECTS or action not in ("start", "stop", "uninstall", "update", "clean"):
                return self.reply(404, {"error": "unknown project or action"})
            with jobs_lock:
                if jobs.get(key, {}).get("state") == "running":
                    return self.reply(409, {"error": "operation already running"})
                jobs[key] = {"op": action, "state": "running", "log": "", "at": int(time.time())}
            threading.Thread(target=do_action, args=(key, action), daemon=True).start()
            return self.reply(202, {"accepted": True})
        self.reply(404, {"error": "not found"})

    do_GET = do_POST = handle_any


if __name__ == "__main__":
    threading.Thread(target=git_refresher, daemon=True).start()
    threading.Thread(target=stats_refresher, daemon=True).start()
    threading.Thread(target=disk_refresher, daemon=True).start()
    ThreadingHTTPServer((BIND, PORT), Handler).serve_forever()
