const http = require("http");
const next = require("next");
const httpProxy = require("http-proxy");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const backendOrigin = (
  process.env.BACKEND_ORIGIN ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const proxiedPrefixes = ["/state", "/event", "/health", "/auip"];

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const handleUpgrade = app.getUpgradeHandler();

const proxy = httpProxy.createProxyServer({
  target: backendOrigin,
  changeOrigin: true,
});

proxy.on("error", (error, req, res) => {
  console.error(`Proxy error for ${req.url}:`, error);

  if (res && !res.headersSent) {
    res.writeHead(502, { "Content-Type": "application/json" });
  }

  if (res && !res.writableEnded) {
    res.end(JSON.stringify({ detail: "Backend proxy unavailable." }));
  }
});

const shouldProxy = (url = "") =>
  proxiedPrefixes.some((prefix) => url === prefix || url.startsWith(`${prefix}/`));

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    if (shouldProxy(req.url)) {
      proxy.web(req, res, { target: backendOrigin });
      return;
    }

    handle(req, res);
  });
  server.on("upgrade", (req, socket, head) => {
    handleUpgrade(req, socket, head);
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Proxying realtime API to ${backendOrigin}`);
  });
});
