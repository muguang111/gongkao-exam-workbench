#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { request as httpsRequest } from "node:https";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HOST = "127.0.0.1";
const START_PORT = 43110;
const MAX_PORT_ATTEMPTS = 10;
const HEALTH_PATH = "/__gongkao_workbench_health__";
const APP_ID = "gongkao-exam-workbench";
const REMOTE_API = "https://api.yueqianzhisuan.cn";
const EMBEDDED_API = "https://api.yueqianzhisuan.cn/api";
const UPSTREAM_CHECK_PATH = "/api/app/shenlun/filter-tree";
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.resolve(scriptDirectory, "../assets/index.html");

function parsePort() {
  const index = process.argv.indexOf("--port");
  const value = index >= 0 ? Number(process.argv[index + 1]) : START_PORT;
  return Number.isInteger(value) && value > 0 && value < 65536 ? value : START_PORT;
}

function healthUrl(port) {
  return `http://${HOST}:${port}${HEALTH_PATH}`;
}

function appUrl(port) {
  return `http://${HOST}:${port}/`;
}

async function isOurServer(port) {
  try {
    const response = await fetch(healthUrl(port), { signal: AbortSignal.timeout(600) });
    const data = await response.json();
    return data.app === APP_ID;
  } catch {
    return false;
  }
}

async function isPortFree(port) {
  return await new Promise((resolve) => {
    const probe = createServer();
    probe.once("error", () => resolve(false));
    probe.listen(port, HOST, () => probe.close(() => resolve(true)));
  });
}

async function choosePort() {
  for (let offset = 0; offset < MAX_PORT_ATTEMPTS; offset += 1) {
    const port = START_PORT + offset;
    if (await isOurServer(port)) return { port, running: true };
    if (await isPortFree(port)) return { port, running: false };
  }
  throw new Error(`端口 ${START_PORT}-${START_PORT + MAX_PORT_ATTEMPTS - 1} 均不可用`);
}

function serve(port) {
  const html = readFileSync(indexPath, "utf8").replace(EMBEDDED_API, "/api");
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", `http://${HOST}:${port}`);
    if (url.pathname === HEALTH_PATH) {
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify({ app: APP_ID }));
      return;
    }
    if (url.pathname === "/api/actuator/health") {
      const upstream = httpsRequest(new URL(UPSTREAM_CHECK_PATH, REMOTE_API), { method: "GET", headers: { accept: "application/json" } }, (upstreamResponse) => {
        let body = "";
        upstreamResponse.setEncoding("utf8");
        upstreamResponse.on("data", (chunk) => { body += chunk; });
        upstreamResponse.on("end", () => {
          let healthy = false;
          try { healthy = upstreamResponse.statusCode === 200 && JSON.parse(body).code === 200; } catch {}
          response.writeHead(healthy ? 200 : 502, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
          response.end(JSON.stringify(healthy
            ? { code: 200, message: "SUCCESS", data: { status: "UP" } }
            : { code: 502, message: "工作台接口暂时不可用", data: null }));
        });
      });
      upstream.on("error", () => {
        response.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ code: 502, message: "工作台接口暂时不可用", data: null }));
      });
      upstream.end();
      return;
    }
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      const upstreamUrl = new URL(`${url.pathname}${url.search}`, REMOTE_API);
      const headers = {};
      for (const name of ["accept", "authorization", "content-type"]) {
        const value = request.headers[name];
        if (value) headers[name] = value;
      }
      const upstream = httpsRequest(upstreamUrl, { method: request.method, headers }, (upstreamResponse) => {
        const responseHeaders = {};
        for (const name of ["content-type", "content-length", "cache-control"]) {
          const value = upstreamResponse.headers[name];
          if (value) responseHeaders[name] = value;
        }
        response.writeHead(upstreamResponse.statusCode ?? 502, responseHeaders);
        upstreamResponse.pipe(response);
      });
      upstream.on("error", () => {
        if (!response.headersSent) response.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ code: 502, message: "工作台接口暂时不可用" }));
      });
      request.pipe(upstream);
      return;
    }
    if (url.pathname === "/" || url.pathname === "/index.html") {
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      response.end(html);
      return;
    }
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  });
  server.listen(port, HOST);
}

function openBrowser(url) {
  const launchers = {
    darwin: ["open", [url]],
    win32: ["cmd", ["/c", "start", "", url]],
  };
  const [command, args] = launchers[process.platform] ?? ["xdg-open", [url]];
  const child = spawn(command, args, { detached: true, stdio: "ignore" });
  child.on("error", (error) => {
    console.error(`无法打开默认浏览器：${error.message}`);
    process.exitCode = 1;
  });
  child.unref();
}

async function waitForServer(port) {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    if (await isOurServer(port)) return;
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error("本地工作台服务启动超时");
}

if (!existsSync(indexPath)) {
  console.error(`找不到工作台入口文件：${indexPath}`);
  process.exit(1);
}

if (process.argv.includes("--dry-run")) {
  console.log(`工作台入口有效：${indexPath}`);
  process.exit(0);
}

if (process.argv.includes("--serve")) {
  serve(parsePort());
} else {
  const { port, running } = await choosePort();
  if (!running) {
    const child = spawn(process.execPath, [fileURLToPath(import.meta.url), "--serve", "--port", String(port)], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();
    await waitForServer(port);
  }
  const url = appUrl(port);
  openBrowser(url);
  console.log(`已打开公考备考工作台：${url}`);
}
