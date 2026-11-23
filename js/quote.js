// Teklif sihirbazı: back end yok. Form, hazır mesaj olarak WhatsApp / e-posta ile gönderilir.
const D = JSON.parse(document.getElementById('quote-data').textContent);
const Q = D.q; const form = document.getElementById('wiz');
const $ = (s, c = form) => c.querySelector(s); const $$ = (s, c = form) => [...c.querySelectorAll(s)];
let step = 0; let product = '';
const panels = $$('.panel'); const steps = $$('#wizSteps li', document);
const next = $('#next'), back = $('#back');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function show(i) {
  step = i; panels.forEach((p, k) => p.classList.toggle('on', k === i));
  steps.forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('done', k < i); });
  back.hidden = i === 0; next.hidden = i === 2;
  if (i === 2) buildSummary();
  scrollTo({ top: form.getBoundingClientRect().top + scrollY - 110, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

function renderFields(p) {
  const dyn = $('#dyn'); dyn.innerHTML = '';
  (D.fields[p] || []).forEach((f) => {
    if (f.t === 'check') {
      dyn.insertAdjacentHTML('beforeend', `<div class="checks"><span>${esc(f.l)}</span><div>${f.o.map((o) => `<label><input type="checkbox" name="${f.k}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div></div>`);
    } else if (f.t === 'select') {
      dyn.insertAdjacentHTML('beforeend', `<label class="f"><span>${esc(f.l)}</span><select name="${f.k}">${f.o.map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>`);
    } else {
      dyn.insertAdjacentHTML('beforeend', `<label class="f"><span>${esc(f.l)}${f.req ? ' *' : ''}</span><input name="${f.k}" type="${f.t}"${f.t === 'number' ? ' inputmode="numeric" min="0"' : ''}${f.req ? ' required' : ''}><em class="err" data-err="${f.k}" hidden>${esc(Q.errReq)}</em></label>`);
    }
  });
}

function pickProduct(p) { product = p; const r = $(`input[name=urun][value="${p}"]`); if (r) r.checked = true; renderFields(p); }
const preset = new URLSearchParams(location.search).get('urun');
if (preset && D.products[preset]) { pickProduct(preset); show(1); } else { scrollTo(0, 0); }
$$('input[name=urun]').forEach((r) => r.addEventListener('change', () => { pickProduct(r.value); $('[data-err=urun]').hidden = true; }));
$$('input[name=cmode]').forEach((r) => r.addEventListener('change', () => { $('#co').hidden = r.value !== 'pick' || !r.checked; }));

const setErr = (name, on) => { const e = $(`[data-err="${name}"]`); if (e) e.hidden = !on; const i = $(`[name="${name}"]`); if (i) i.setAttribute('aria-invalid', on ? 'true' : 'false'); };
const phoneOk = (v) => v.replace(/\D/g, '').length >= 10;

function validate(i) {
  let ok = true;
  if (i === 0) { if (!product) { $('[data-err=urun]').hidden = false; ok = false; } }
  if (i === 1) {
    (D.fields[product] || []).filter((f) => f.req).forEach((f) => { const v = form.elements[f.k]?.value.trim(); setErr(f.k, !v); if (!v) ok = false; });
    const ad = form.elements.ad.value.trim(); setErr('ad', !ad); if (!ad) ok = false;
    const tel = form.elements.tel.value.trim(); const pe = $('[data-err=tel]'); const bad = !phoneOk(tel); pe.hidden = !bad; form.elements.tel.setAttribute('aria-invalid', bad); if (bad) ok = false;
    const kv = form.elements.kvkk.checked; $('[data-err=kvkk]').hidden = kv; if (!kv) ok = false;
    if (!ok) $('[aria-invalid=true], :invalid')?.focus?.();
  }
  return ok;
}

function message() {
  const fd = new FormData(form); const lines = [Q.msgHead, ''];
  lines.push(`${Q.msgProduct}: ${D.products[product].name}`);
  (D.fields[product] || []).forEach((f) => {
    const v = f.t === 'check' ? fd.getAll(f.k).join(', ') : (fd.get(f.k) || '').toString().trim();
    if (v) lines.push(`${f.l}: ${v}`);
  });
  const co = fd.get('cmode') === 'pick' ? fd.getAll('co').join(', ') || Q.msgAll : Q.msgAll;
  lines.push(`${Q.msgCompanies}: ${co}`, '');
  lines.push(`${Q.msgName}: ${fd.get('ad')}`, `${Q.msgPhone}: ${fd.get('tel')}`);
  if (fd.get('mail')) lines.push(`${Q.msgMail}: ${fd.get('mail')}`);
  lines.push(`${Q.msgMode}: ${fd.get('mode') === 'wa' ? Q.modeWa : Q.modeCall}`);
  if ((fd.get('not') || '').toString().trim()) lines.push(`${Q.msgNote}: ${fd.get('not')}`);
  return lines.join('\n');
}

function buildSummary() {
  const m = message(); $('#summary').textContent = m;
  $('#sendWa').href = `https://wa.me/${D.wa}?text=${encodeURIComponent(m)}`;
  if (!D.email) $('#sendMail').hidden = true;
  $('#sendMail').href = `mailto:${D.email}?subject=${encodeURIComponent(`${D.brand} - ${D.products[product].name}`)}&body=${encodeURIComponent(m)}`;
}
$('#copy').addEventListener('click', async (e) => { try { await navigator.clipboard.writeText(message()); const b = e.currentTarget; const t = b.textContent; b.textContent = Q.copied; setTimeout(() => (b.textContent = t), 1600); } catch { /* sessiz */ } });
next.addEventListener('click', () => { if (validate(step)) show(step + 1); });
back.addEventListener('click', () => show(step - 1));
form.addEventListener('submit', (e) => e.preventDefault());
