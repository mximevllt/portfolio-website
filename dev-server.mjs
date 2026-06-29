import { createReadStream, existsSync, statSync, watch } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 5173);
const clients = new Set();
let reloadTimer;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

const liveReloadScript = `
<script>
  new EventSource('/__live').addEventListener('reload', () => location.reload());
</script>`;

function resolvePath(url) {
  const cleanUrl = decodeURIComponent(url.split("?")[0]);
  const requested = cleanUrl === "/" ? "/index.html" : cleanUrl;
  const filePath = normalize(join(root, requested));
  return filePath.startsWith(root) ? filePath : join(root, "index.html");
}

const server = createServer((request, response) => {
  if (request.url === "/__live") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    });
    response.write("\n");
    clients.add(response);
    request.on("close", () => clients.delete(response));
    return;
  }

  const filePath = resolvePath(request.url || "/");
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const extension = extname(filePath);
  response.setHeader("Content-Type", types[extension] || "application/octet-stream");

  if (extension === ".html") {
    let html = "";
    createReadStream(filePath)
      .on("data", (chunk) => {
        html += chunk;
      })
      .on("end", () => {
        response.end(html.replace("</body>", `${liveReloadScript}</body>`));
      });
    return;
  }

  createReadStream(filePath).pipe(response);
});

function shouldReload(filename) {
  if (!filename) return false;
  if (filename.includes("dist") || filename.includes("node_modules") || filename.includes(".DS_Store")) return false;
  return filename.endsWith(".html") || filename.startsWith("src/");
}

watch(root, { recursive: true }, (_event, filename) => {
  if (!shouldReload(filename)) return;
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
  for (const client of clients) {
    client.write("event: reload\ndata: now\n\n");
  }
  }, 120);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Preview ready on http://localhost:${port}`);
});
