// Bağımlılıksız yerel sunucu: temiz adresler (klasör → index.html), doğru MIME türleri, 404 sayfası.
// Kullanım: node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2]) || 3000;
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
async function resolveFile(urlPath) {
  let p = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  let f = join(ROOT, p);
  if (!f.startsWith(ROOT)) return null;
  try { const s = await stat(f); if (s.isDirectory()) { if (!urlPath.endsWith('/')) return { redirect: urlPath + '/' }; f = join(f, 'index.html'); await stat(f); } return { file: f }; } catch { return null; }
}
createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const r = await resolveFile(u.pathname);
  if (r?.redirect) { res.writeHead(301, { Location: r.redirect + u.search }); return res.end(); }
  const file = r?.file || join(ROOT, '404.html');
  try {
    const data = await readFile(file);
    res.writeHead(r?.file ? 200 : 404, { 'Content-Type': T[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch { res.writeHead(404); res.end('404'); }
}).listen(port, () => {
  const url = `http://localhost:${port}/`;
  console.log(`\n  SadeceSigorta çalışıyor: ${url}\n  Kapatmak için bu pencerede Ctrl+C\n`);
  if (!process.argv.includes('--no-open')) exec(process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`);
}).on('error', (e) => { console.log(e.code === 'EADDRINUSE' ? `Port ${port} dolu. Başka port deneyin: node scripts/serve.mjs ${port + 1}` : e); });
