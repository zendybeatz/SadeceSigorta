import Lenis from './vendor/lenis.js';

const root = document.documentElement; root.dataset.ready = '1';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
if (reduced || !hasGsap) root.classList.add('no-anim');

/* logolar: dosya yüklenemezse şirket adı görünsün */
$$('img[data-logo]').forEach((img) => {
  const fail = () => img.parentElement.classList.add('no-img');
  img.addEventListener('error', fail, { once: true });
  if (img.complete && !img.naturalWidth) fail();
});

/* sayfa geçişi: View Transitions destekleniyorsa tarayıcı yapar; yoksa perde ile yumuşat */
const curtain = $('.curtain');
const nativeVT = CSS.supports?.('selector(::view-transition)') && 'onpageswap' in window;
if (nativeVT) root.classList.add('vt-ready');
else if (curtain && !reduced) {
  curtain.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => curtain.classList.remove('on')));
  addEventListener('pageshow', (e) => { if (e.persisted) curtain.classList.remove('on'); });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href); if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash) || u.protocol.startsWith('tel')) return;
    e.preventDefault(); curtain.classList.add('on'); setTimeout(() => (location.href = u.href), 260);
  });
}
/* bağlantı üzerine gelince sayfayı önceden yükle */
const pf = new Set();
document.addEventListener('pointerover', (e) => { const a = e.target.closest?.('a[href]'); if (!a) return; const u = new URL(a.href, location.href); if (u.origin !== location.origin || pf.has(u.pathname) || u.pathname === location.pathname) return; pf.add(u.pathname); const l = document.createElement('link'); l.rel = 'prefetch'; l.href = u.pathname; document.head.append(l); }, { passive: true });

/* menü açılırı (klavye/dokunmatik) */
$$('.dd').forEach((dd) => { const b = $('.dd__b', dd); b.addEventListener('click', () => { const o = dd.classList.toggle('open'); b.setAttribute('aria-expanded', o); }); addEventListener('click', (e) => { if (!dd.contains(e.target)) { dd.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } }); });

/* hızlı teklif formu: hazır WhatsApp mesajı + (Netlify varsa) form kaydı */
const qf = $('#quick');
if (qf) {
  const Dq = JSON.parse($('#quick-data').textContent); const H = Dq.h;
  const err = (n, on) => { const e = $(`[data-err="${n}"]`, qf); if (e) e.hidden = !on; };
  qf.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(qf); const tel = String(fd.get('tel') || ''); const okTel = tel.replace(/\D/g, '').length >= 10; const okK = qf.elements.kvkk.checked;
    err('tel', !okTel); err('kvkk', !okK); if (!okTel) { qf.elements.tel.focus(); return; } if (!okK) return;
    const lines = [H.msg, '', `${H.mType}: ${Dq.names[fd.get('tur')]}`]; const pl = String(fd.get('plaka') || '').trim();
    if (pl) lines.push(`${H.mPlate}: ${pl.toUpperCase()}`); lines.push(`${H.mPhone}: ${tel}`, `${H.mPref}: ${fd.get('tercih')}`);
    const url = `https://wa.me/${Dq.wa}?text=${encodeURIComponent(lines.join('\n'))}`;
    const w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url;
    try { fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fd).toString(), keepalive: true }).catch(() => {}); } catch (_) { /* sessiz */ }
    const n = $('.quick__n', qf); if (n) n.textContent = H.ok;
  });
}

/* üst menü */
const header = $('.site-header'); const burger = $('.burger'); const nav = $('#nav');
burger?.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
nav?.addEventListener('click', (e) => { if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
addEventListener('keydown', (e) => { if (e.key === 'Escape') { nav?.classList.remove('open'); burger?.setAttribute('aria-expanded', 'false'); } });
let lastY = 0;
const onScroll = () => {
  const y = scrollY; header.classList.toggle('is-solid', y > 40);
  header.classList.toggle('is-hidden', y > 500 && y > lastY + 4 && !nav.classList.contains('open'));
  if (y < lastY - 4 || y < 500) header.classList.remove('is-hidden'); lastY = y;
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* 3B sahne (hero bittikten sonra, boşta yükle) */
let scene = null;
const canvas = $('#gl');
function bootScene() {
  if (!canvas) return;
  import('./scene.js').then((m) => { scene = m.initScene(canvas); if (scene) canvas.classList.add('is-on'); }).catch(() => {});
}
('requestIdleCallback' in window ? requestIdleCallback : (f) => setTimeout(f, 200))(bootScene, { timeout: 1200 });

if (hasGsap && !reduced) {
  const { gsap, ScrollTrigger } = window; gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const t = $(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -70 }); } }));

  const ease = 'expo.out';
  /* tek orkestre edilmiş açılış: başlık kelimeleri + destek öğeleri */
  const tl = gsap.timeline({ defaults: { ease } });
  tl.to('.display .w > span', { y: 0, duration: 1.1, stagger: 0.07 }, 0.1)
    .to('[data-hero]', { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.35);

  /* ilerleme çubuğu */
  gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

  /* hero kayarken sahne ve metin */
  const host = $('[data-scene-host]');
  if (host) {
    ScrollTrigger.create({ trigger: host, start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => scene?.setProgress(s.progress) });
    gsap.to('.hero__in', { yPercent: -12, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: host, start: 'top top', end: 'bottom 20%', scrub: true } });
  }

  /* sigorta türleri: satırlar sıra ile içeri girer (tek seferlik) */
  gsap.from('.row', { y: 40, opacity: 0, duration: 0.9, ease, stagger: 0.1, scrollTrigger: { trigger: '.rows', start: 'top 80%', once: true } });
  gsap.from('.why article, .cover', { y: 30, opacity: 0, duration: 0.8, ease, stagger: 0.08, scrollTrigger: { trigger: '.why, .covers', start: 'top 82%', once: true } });

  /* markalı pinli adım anlatımı */
  const steps = $('.steps');
  if (steps) {
    const items = $$('.steps__list li'); const panes = [$('.pane--1'), $('.pane--2'), $('.pane--3')];
    const minis = $$('.mini'); const dots = $$('.scan i'); const num = $('.scan__n b'); const bar = $('.steps__bar i');
    const setStep = (i) => items.forEach((li, k) => li.classList.toggle('on', k === i));
    gsap.set(panes[0], { opacity: 1, y: 0, scale: 1 });
    const mm = gsap.matchMedia();
    mm.add('(min-width:1021px)', () => {
      const st = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: steps, start: 'top top', end: '+=260%', pin: '.steps__pin', scrub: 0.6, onUpdate: (s) => setStep(Math.min(2, Math.floor(s.progress * 3 * 0.999))) } });
      const cnt = { v: 0 };
      st.to(bar, { scaleX: 1, duration: 3 }, 0)
        .call(() => minis.forEach((m, i) => m.classList.toggle('on', i === 1)), null, 0.4)
        .to(panes[0], { opacity: 0, y: -24, scale: 0.97, duration: 0.3 }, 0.95)
        .to(panes[1], { opacity: 1, y: 0, scale: 1, duration: 0.3 }, 1.0)
        .to(cnt, { v: 24, duration: 0.9, onUpdate: () => { const n = Math.round(cnt.v); num.textContent = n; dots.forEach((d, i) => d.classList.toggle('on', i < n)); } }, 1.1)
        .to(panes[1], { opacity: 0, y: -24, scale: 0.97, duration: 0.3 }, 1.95)
        .to(panes[2], { opacity: 1, y: 0, scale: 1, duration: 0.3 }, 2.0);
      return () => { setStep(0); };
    });
    mm.add('(max-width:1020px)', () => {
      items.forEach((li) => li.classList.add('on'));
      const cnt = { v: 0 }; let k = 0;
      const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true, defaults: { ease } });
      loop.set(panes, { opacity: 0 }).set(panes[0], { opacity: 1, y: 0, scale: 1 })
        .call(() => minis.forEach((m, i) => m.classList.toggle('on', i === (k++ % 4))), null, 0.5)
        .to(panes[0], { opacity: 0, duration: 0.3 }, 1.8).to(panes[1], { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 1.9)
        .fromTo(cnt, { v: 0 }, { v: 24, duration: 1.4, ease: 'none', onUpdate: () => { const n = Math.round(cnt.v); num.textContent = n; dots.forEach((d, i) => d.classList.toggle('on', i < n)); } }, 2)
        .to(panes[1], { opacity: 0, duration: 0.3 }, 3.7).to(panes[2], { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 3.8).to({}, { duration: 1.8 });
      ScrollTrigger.create({ trigger: '.phone', start: 'top 85%', end: 'bottom 10%', onToggle: (s) => (s.isActive ? loop.play() : loop.pause()) });
      return () => loop.kill();
    });
  }

  /* masaüstü: butonlara hafif manyetik çekim (yalnızca ana CTA'lar) */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('[data-magnet]').forEach((el) => {
      const qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }), qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * 0.18); qy((e.clientY - r.top - r.height / 2) * 0.25); });
      el.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }
} else {
  /* animasyonsuz: içerik doğrudan görünür */
  $$('.steps__list li').forEach((li) => li.classList.add('on'));
}
