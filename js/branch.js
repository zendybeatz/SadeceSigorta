// Şubelik başvurusu: hazır WhatsApp mesajı (+ Netlify varsa form kaydı)
const f = document.getElementById('branchForm'); const D = JSON.parse(document.getElementById('branch-data').textContent);
const err = (n, on) => { const e = f.querySelector(`[data-err="${n}"]`); if (e) e.hidden = !on; const i = f.elements[n]; if (i?.setAttribute) i.setAttribute('aria-invalid', on); };
f.addEventListener('submit', (e) => {
  e.preventDefault(); const fd = new FormData(f);
  const bad = { ad: !String(fd.get('ad')).trim(), tel: String(fd.get('tel')).replace(/\D/g, '').length < 10, il: !String(fd.get('il')).trim() };
  Object.entries(bad).forEach(([k, v]) => err(k, v)); const kv = f.elements.kvkk.checked; err('kvkk', !kv);
  const first = Object.keys(bad).find((k) => bad[k]); if (first) { f.elements[first].focus(); return; } if (!kv) return;
  const m = D.b.m; const L = [D.b.msg, '', `${m.ad}: ${fd.get('ad')}`, `${m.tel}: ${fd.get('tel')}`, `${m.il}: ${fd.get('il')}`, `${m.durum}: ${fd.get('durum')}`, `${m.ofis}: ${fd.get('ofis')}`];
  if (String(fd.get('mail')).trim()) L.push(`${m.mail}: ${fd.get('mail')}`); if (String(fd.get('not')).trim()) L.push(`${m.not}: ${fd.get('not')}`);
  const url = `https://wa.me/${D.wa}?text=${encodeURIComponent(L.join('\n'))}`;
  const w = window.open(url, '_blank'); if (w) w.opener = null; else location.href = url;
  try { fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fd).toString(), keepalive: true }).catch(() => {}); } catch (_) { /* sessiz */ }
  const h = f.querySelector('.hint'); if (h) h.textContent = D.b.ok;
});
