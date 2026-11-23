// Şirket logo/ikonlarını assets/logos/ içine indirir: node scripts/fetch-logos.mjs
// Önce şirketin kendi sitesindeki yüksek çözünürlüklü ikonu (apple-touch-icon), olmazsa Google ikon servisini dener.
// Dosyalar <ad>.icon.png olarak saklanır (ikon + şirket adı gösterilir).
// Resmi geniş logoyu kullanmak isterseniz assets/logos/<ad>.svg (veya .png) koyun; site onu tek başına gösterir.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { insurers } from './content.mjs';
const slug = (s) => s.toLowerCase().replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const dir = new URL('../assets/logos/', import.meta.url); mkdirSync(dir, { recursive: true });
const isImg = (b) => b.length > 200 && ((b[0] === 0x89 && b[1] === 0x50) || (b[0] === 0xff && b[1] === 0xd8) || (b[0] === 0 && b[1] === 0 && b[2] === 1));
async function get(url) { const c = new AbortController(); const t = setTimeout(() => c.abort(), 12000); try { const r = await fetch(url, { signal: c.signal, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0' } }); if (!r.ok) return null; const b = Buffer.from(await r.arrayBuffer()); return isImg(b) ? b : null; } catch { return null; } finally { clearTimeout(t); } }
let ok = 0;
for (const [name, domain] of insurers) {
  const file = new URL(`${slug(name)}.icon.png`, dir);
  if (existsSync(file)) { ok++; continue; }
  const tries = [`https://www.${domain}/apple-touch-icon.png`, `https://${domain}/apple-touch-icon.png`, `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, `https://icons.duckduckgo.com/ip3/${domain}.ico`];
  let buf = null; for (const u of tries) { buf = await get(u); if (buf) break; }
  if (buf) { writeFileSync(file, buf); ok++; console.log('ok   ', name); } else console.log('YOK  ', name, `(${domain}) → scripts/content.mjs içinde adresi kontrol edin`);
}
console.log(`${ok}/${insurers.length} logo hazır.`);
