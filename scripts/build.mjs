// Statik sayfa üretici (sunucu/back end yok). Kullanım: node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { content, insurers, langs, extraKeys } from './content.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8'));
const E = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const J = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const slugify = (s) => s.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const PRODUCTS = ['dask', 'isyeri', 'arac', 'kasko'];
const ALL = [...PRODUCTS, ...extraKeys];
const written = [];
const out = (rel, data) => { const p = join(ROOT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, data); written.push(rel); };

const ICONS = {
  house: '<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/><path d="M2 12l10-8.5L22 12" />',
  store: '<path d="M4 9h16l-1.2-4.5H5.2z"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
  car: '<path d="M5 16V12l1.7-4.6A1.5 1.5 0 0 1 8.1 6.4h7.8a1.5 1.5 0 0 1 1.4 1L19 12v4"/><path d="M3 16h18v3h-3v-1.5H6V19H3z"/><circle cx="7.5" cy="13" r=".6"/><circle cx="16.5" cy="13" r=".6"/>',
  shieldcar: '<path d="M12 3 4.5 6v5.5c0 4.4 3 8 7.5 9.5 4.5-1.5 7.5-5.1 7.5-9.5V6z"/><path d="M8.5 13.5l.9-2.4a1 1 0 0 1 .9-.6h3.4a1 1 0 0 1 .9.6l.9 2.4M8 13.5h8v2H8z"/>',
  phone: '<path d="M5 4h3l1.5 4-2 1.3a11 11 0 0 0 5.2 5.2l1.3-2L19 14v3a2 2 0 0 1-2 2A13 13 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.600-7 10-7 10z"/><path d="M12 9.500v4M10 11.500h4"/>',
  plane: '<path d="M21 4 10.500 14.500M21 4l-6.500 16-4-5.500L5 10.500z"/>',
  tow: '<path d="M3 17h11V9H9L6 12H3z"/><circle cx="7" cy="18" r="1.600"/><circle cx="15" cy="18" r="1.600"/><path d="M14 9l4-4 3 3M18 5v6h3"/>',
  wa: '<path d="M4 20l1.2-4A8 8 0 1 1 8 18.8z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-.9.7a4 4 0 0 1-1.6-1.6l.7-.9-1-2z"/>',
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[n]}</svg>`;

const pagePath = (lang, key) => {
  const s = content[lang].slugs[key];
  const prefix = lang === 'tr' ? '' : `${lang}/`;
  return key === 'home' ? prefix : `${prefix}${s}/`;
};
const depthOf = (path) => (path === '' ? 0 : path.split('/').filter(Boolean).length);
const abs = (path) => `${cfg.siteUrl.replace(/\/$/, '')}/${path}`;

const logoFile = (name) => ['svg', 'webp', 'png', 'icon.png', 'icon.ico', 'icon.jpg'].map((e) => `assets/logos/${slugify(name)}.${e}`).find((p) => existsSync(join(ROOT, p))) || '';
function logoTile(name, domain, base) {
  const slug = slugify(name);
  const local = ['svg', 'webp', 'png'].map((e) => `assets/logos/${slug}.${e}`).find((p) => existsSync(join(ROOT, p)));
  const icon = ['png', 'ico', 'jpg'].map((e) => `assets/logos/${slug}.icon.${e}`).find((p) => existsSync(join(ROOT, p)));
  const src = local ? `${base}${local}` : icon ? `${base}${icon}` : '';
  if (!src) return `<li class="tile no-img"><span>${E(name)}</span></li>`;
  return `<li class="tile${local ? ' tile--wide' : ''}"><img src="${src}" alt="${E(name)}" width="${local ? 120 : 28}" height="${local ? 36 : 28}" loading="lazy" decoding="async" data-logo>${local ? '' : `<span>${E(name)}</span>`}</li>`;
}

function marqueeRows(base) {
  const all = insurers.map(([n, d]) => logoTile(n, d, base));
  const half = Math.ceil(all.length / 2);
  const row = (items, dir, dur) => { const li = items.join(''); return `<div class="marquee__row" data-dir="${dir}" style="--dur:${dur}s"><ul class="marquee__track">${li}</ul><ul class="marquee__track marquee__track--dup" aria-hidden="true">${li}</ul></div>`; };
  return row(all.slice(0, half), 1, 55) + row(all.slice(half), -1, 62);
}

function head({ lang, key, title, desc, path, ld, base, noindex, ogType = 'website' }) {
  const t = content[lang];
  const alts = langs.map((l) => `<link rel="alternate" hreflang="${l}" href="${abs(pagePath(l, key))}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${abs(pagePath('tr', key))}">`;
  const verify = [cfg.googleSiteVerification && `<meta name="google-site-verification" content="${E(cfg.googleSiteVerification)}">`, cfg.bingSiteVerification && `<meta name="msvalidate.01" content="${E(cfg.bingSiteVerification)}">`].filter(Boolean).join('\n');
  return `<!doctype html>
<html lang="${t.htmlLang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${E(title)}</title>
<meta name="description" content="${E(desc)}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<link rel="canonical" href="${abs(path)}">
${noindex ? '' : alts}
<meta name="theme-color" content="#1b1e3d">
<meta name="color-scheme" content="dark light">
<meta name="author" content="${E(cfg.brand)}">
${verify}
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${E(cfg.brand)}">
<meta property="og:title" content="${E(title)}">
<meta property="og:description" content="${E(desc)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:locale" content="${t.locale}">
${langs.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${content[l].locale}">`).join('\n')}
<meta property="og:image" content="${abs('assets/og-image.jpg')}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${E(cfg.brand)} · ${E(t.tagline)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${E(title)}">
<meta name="twitter:description" content="${E(desc)}">
<meta name="twitter:image" content="${abs('assets/og-image.jpg')}">
<link rel="icon" href="${base}favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="192x192" href="${base}assets/icon-192.png">
<link rel="apple-touch-icon" href="${base}assets/apple-touch-icon.png">
<link rel="manifest" href="${base}manifest.webmanifest">
<link rel="preload" href="${base}assets/fonts/outfit-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${base}assets/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${base}css/main.css">
<script type="speculationrules">{"prefetch":[{"where":{"href_matches":"/*"},"eagerness":"moderate"}]}</script>
<script>document.documentElement.classList.add('js');setTimeout(function(){if(!document.documentElement.dataset.ready)document.documentElement.classList.add('no-anim')},4000)</script>
${ld.map((o) => `<script type="application/ld+json">${J(o)}</script>`).join('\n')}
${cfg.ga4 ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${E(cfg.ga4)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${E(cfg.ga4)}',{anonymize_ip:true})</script>` : ''}
</head>`;
}

const agencyLd = (lang) => {
  const t = content[lang];
  const o = { '@type': ['InsuranceAgency', 'LocalBusiness'], '@id': abs('#organization'), name: cfg.brand, url: abs(''), logo: abs('assets/icon-512.png'), image: abs('assets/og-image.jpg'), slogan: content.tr.tagline, description: t.home.desc, areaServed: { '@type': 'Country', name: 'TR' }, priceRange: '₺₺', knowsAbout: ['DASK', 'İş yeri sigortası', 'Trafik sigortası', 'Kasko sigortası', 'Konut sigortası', 'İMM', 'Yabancı sağlık sigortası', 'Seyahat sağlık sigortası', 'Kısa süreli trafik sigortası', 'Yol yardım paketi'], makesOffer: ALL.map((p) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t.products[p].short, url: abs(pagePath(lang, p)) } })) };
  if (!cfg.phoneIsPlaceholder) { o.telephone = cfg.phoneTel; }
  if (cfg.email) o.email = cfg.email;
  if (cfg.address || cfg.city) o.address = { '@type': 'PostalAddress', streetAddress: cfg.address || undefined, addressLocality: cfg.district || cfg.city || undefined, addressRegion: cfg.city || undefined, addressCountry: 'TR' };
  if (cfg.openingHours) o.openingHours = cfg.openingHours;
  const same = [cfg.instagram, cfg.facebook, cfg.linkedin].filter(Boolean);
  if (same.length) o.sameAs = same;
  return o;
};
const siteLd = (lang) => ({ '@type': 'WebSite', '@id': abs('#website'), url: abs(''), name: cfg.brand, inLanguage: langs.map((l) => content[l].htmlLang), publisher: { '@id': abs('#organization') } });
const crumbs = (lang, items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })) });
const faqLd = (faq) => ({ '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const graph = (arr) => ({ '@context': 'https://schema.org', '@graph': arr });

function header(lang, key, base) {
  const t = content[lang];
  const link = (k, label) => `<a href="${base}${pagePath(lang, k)}"${k === key ? ' aria-current="page"' : ''}>${E(label)}</a>`;
  const other = langs.filter((l) => l !== lang).map((l) => `<a class="lang" href="${base}${pagePath(l, key)}" hreflang="${l}" lang="${l}" aria-label="${E(content[l].label)}">${icon('globe')}<span>${content[l].short}</span></a>`).join('');
  return `<a class="skip" href="#main">${E(t.nav.skip)}</a>
<div class="curtain" aria-hidden="true"></div>
<div class="progress" aria-hidden="true"><i></i></div>
<header class="site-header" id="top">
  <div class="wrap bar">
    <a class="brand" href="${base}${pagePath(lang, 'home')}" aria-label="${E(t.a11y.logo)}"><img src="${base}assets/logo-lockup.png" alt="${E(cfg.brand + t.a11y.logoAlt)}" width="140" height="62"></a>
    <nav class="nav" id="nav" aria-label="${E(cfg.brand)}">
      ${['dask', 'isyeri', 'arac', 'kasko'].map((k) => link(k, t.nav[k])).join('')}
      <div class="dd"><button class="dd__b" type="button" aria-expanded="false" aria-haspopup="true">${E(t.nav.more)}<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="m2 4 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button><div class="dd__m">${extraKeys.map((k) => link(k, t.products[k].short)).join('')}</div></div>
      ${link('sube', t.nav.sube)}
      <a class="nav__cta btn btn--sm" href="${base}${pagePath(lang, 'teklif')}">${E(t.nav.teklif)}</a>
    </nav>
    <div class="bar__end">${other}<button class="burger" aria-expanded="false" aria-controls="nav" aria-label="${E(t.nav.menu)}">${icon('menu')}</button></div>
  </div>
</header>`;
}

function footer(lang, base) {
  const t = content[lang];
  return `<footer class="site-footer">
  <div class="wrap foot">
    <div class="foot__brand"><img src="${base}assets/logo-lockup.png" alt="${E(cfg.brand)}" width="150" height="67" loading="lazy"><p>${E(t.footer.about)}</p></div>
    <div><h2>${E(t.footer.products)}</h2><ul>${ALL.map((p) => `<li><a href="${base}${pagePath(lang, p)}">${E(t.products[p].short)}</a></li>`).join('')}<li><a href="${base}${pagePath(lang, 'sube')}">${E(t.branch.cta)}</a></li><li><a href="${base}${pagePath(lang, 'teklif')}">${E(t.nav.teklif)}</a></li></ul></div>
    <div><h2>${E(t.footer.contact)}</h2><ul>
      <li><a href="tel:${cfg.phoneTel}">${E(cfg.phoneDisplay)}</a></li>
      <li><a href="https://wa.me/${cfg.whatsapp}" rel="noopener" target="_blank">WhatsApp: ${E(cfg.whatsappDisplay || '')}</a></li>
      ${cfg.email ? `<li><a href="mailto:${E(cfg.email)}">${E(cfg.email)}</a></li>` : ''}
      <li>${E(t.footer.hours)}</li>${cfg.address ? `<li>${E(cfg.address)}</li>` : ''}
      ${cfg.instagram ? `<li><a href="${E(cfg.instagram)}" rel="noopener me" target="_blank">Instagram</a></li>` : ''}
    </ul></div>
  </div>
  <div class="wrap foot__legal"><p>${E(t.footer.legal)}</p><p>© ${new Date().getFullYear()} ${E(cfg.brand)}. ${E(t.footer.rights)}${cfg.acenteLisans ? ` · ${E(t.footer.lisans)}: ${E(cfg.acenteLisans)}` : ''}</p></div>
</footer>
<a class="fab" href="https://wa.me/${cfg.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('wa')}</a>`;
}

const faqHtml = (title, faq) => `<section class="sec sec--paper" id="sss"><div class="wrap narrow"><h2 class="h2">${E(title)}</h2><div class="faq">${faq.map((f) => `<details><summary>${E(f.q)}<i aria-hidden="true"></i></summary><p>${E(f.a)}</p></details>`).join('')}</div></div></section>`;

const ctaBand = (lang, base, title, lead) => {
  const t = content[lang];
  return `<section class="cta-band"><div class="wrap cta-band__in"><div><h2 class="h2">${E(title)}</h2><p>${E(lead)}</p></div><div class="cta-band__btns"><a class="btn btn--lg" href="${base}${pagePath(lang, 'teklif')}" data-magnet>${E(t.cta.quote)}</a><a class="btn btn--ghost btn--lg" href="tel:${cfg.phoneTel}">${icon('phone')}${E(cfg.phoneDisplay)}</a></div></div></section>`;
};

function scripts(base, extra = '') {
  return `<script src="${base}js/vendor/gsap.min.js" defer></script>
<script src="${base}js/vendor/ScrollTrigger.min.js" defer></script>
<script type="module" src="${base}js/main.js"></script>${extra}
</body></html>`;
}

function quickForm(lang) {
  const t = content[lang]; const h = t.hero;
  const data = { wa: cfg.whatsapp, brand: cfg.brand, names: Object.fromEntries(ALL.map((p) => [p, t.products[p].short])), h };
  return `<aside class="quick" aria-labelledby="qt" data-hero>
  <form class="quick__f" id="quick" name="hizli-teklif" method="post" action="#" data-netlify="true" netlify-honeypot="bot-field" novalidate>
    <input type="hidden" name="form-name" value="hizli-teklif"><input type="hidden" name="dil" value="${lang}">
    <p class="hp" aria-hidden="true"><label>Bot <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
    <h2 id="qt" class="quick__t">${E(h.title)}</h2>
    <p class="quick__l">${E(h.lead)}</p>
    <div class="seg seg--q" role="radiogroup">${h.mode.map((m, i) => `<label><input type="radio" name="tercih" value="${E(m)}"${i === 0 ? ' checked' : ''}><span>${E(m)}</span></label>`).join('')}</div>
    <div class="quick__g">
      <label class="f"><span>${E(h.type)}</span><select name="tur">${ALL.map((p) => `<option value="${p}">${E(t.products[p].short)}</option>`).join('')}</select></label>
      <label class="f"><span>${E(h.plate)}</span><input name="plaka" autocomplete="off" autocapitalize="characters" placeholder="54 ABC 123"></label>
      <label class="f f--wide"><span>${E(h.phone)} *</span><input name="tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="05XX XXX XX XX" required><em class="err" data-err="tel" hidden>${E(h.errPhone)}</em></label>
    </div>
    <label class="kvkk"><input type="checkbox" name="kvkk" required><span>${E(h.kvkk)}</span></label><p class="err" data-err="kvkk" hidden>${E(h.errKvkk)}</p>
    <button class="btn btn--lg quick__b" type="submit">${icon('wa')}${E(h.btn)}</button>
    <p class="quick__n">${E(h.note)}</p>
    <script type="application/json" id="quick-data">${J(data)}</script>
  </form>
</aside>`;
}

function renderHome(lang) {
  const t = content[lang]; const h = t.home; const path = pagePath(lang, 'home'); const base = '../'.repeat(depthOf(path));
  const ld = [graph([agencyLd(lang), siteLd(lang), { '@type': 'WebPage', '@id': abs(path) + '#webpage', url: abs(path), name: h.title, description: h.desc, isPartOf: { '@id': abs('#website') }, about: { '@id': abs('#organization') }, inLanguage: t.htmlLang }, faqLd(h.faq)])];
  const words = (s) => s.split(' ').map((w) => `<span class="w"><span>${E(w)}</span></span>`).join(' ');
  return head({ lang, key: 'home', title: h.title, desc: h.desc, path, ld, base }) + `
<body class="page-home">
${header(lang, 'home', base)}
<main id="main">
<section class="hero" data-scene-host>
  <div class="hero__bg" aria-hidden="true"></div>
  <canvas class="gl" id="gl" data-scene="shield" data-logos='${E(JSON.stringify(insurers.map(([n]) => [n, logoFile(n) ? base + logoFile(n) : ''])))}' role="img" aria-label="${E(t.a11y.canvas)}"></canvas>
  <div class="wrap hero__in">
    <p class="eyebrow" data-hero><span class="dot"></span>${E(h.eyebrow)}</p>
    <h1 class="display" data-split>${words(h.h1)}</h1>
    <p class="lead" data-hero>${E(h.lead)}</p>
    <div class="hero__cta" data-hero><a class="btn btn--lg" href="${base}${pagePath(lang, 'teklif')}" data-magnet>${E(t.cta.quote)}</a><a class="btn btn--ghost btn--lg" href="tel:${cfg.phoneTel}">${icon('phone')}${E(t.cta.call)}</a></div>
    <ul class="chips" data-hero>${h.chips.map((c, i) => `<li><a href="${base}${pagePath(lang, PRODUCTS[i])}">${E(c)}</a></li>`).join('')}</ul>
  </div>
  ${quickForm(lang)}
  <a class="scroll-cue" href="#sirketler" aria-label="${E(h.scroll)}"><span>${E(h.scroll)}</span><i></i></a>
</section>

<section class="marquee" id="sirketler" aria-label="${E(h.marqueeTitle)}">
  <div class="wrap"><h2 class="marquee__t">${E(h.marqueeTitle)}</h2></div>
  ${marqueeRows(base)}
</section>

<section class="sec sec--paper" id="urunler">
  <div class="wrap">
    <div class="sec__head"><h2 class="h2">${E(h.productsTitle)}</h2><p class="sub">${E(h.productsLead)}</p></div>
    <div class="rows">
      ${PRODUCTS.map((p) => `<a class="row" href="${base}${pagePath(lang, p)}"><span class="row__ic">${icon(t.products[p].icon)}</span><h3>${E(t.products[p].short)}</h3><p>${E(t.products[p].cardLead)}</p><span class="row__go">${E(t.cta.more)}</span></a>`).join('')}
    </div>
    <div class="more"><h3 class="h3">${E(t.more.title)}</h3><p>${E(t.more.lead)}</p><div class="other__list">${extraKeys.map((x) => `<a href="${base}${pagePath(lang, x)}">${icon(t.products[x].icon)}${E(t.products[x].short)}</a>`).join('')}</div></div>
  </div>
</section>

<section class="steps" id="nasil">
  <div class="steps__pin">
    <div class="wrap steps__in">
      <div class="steps__txt">
        <h2 class="h2">${E(h.stepsTitle)}</h2>
        <ol class="steps__list">${h.steps.map((s, i) => `<li data-step="${i}"><b>${i + 1}</b><div><h3>${E(s.t)}</h3><p>${E(s.d)}</p></div></li>`).join('')}</ol>
        <div class="steps__bar" aria-hidden="true"><i></i></div>
      </div>
      <div class="phone" aria-hidden="true">
        <div class="phone__notch"></div>
        <div class="pane pane--1">${PRODUCTS.map((p) => `<div class="mini">${icon(t.products[p].icon)}<span>${E(t.products[p].name)}</span></div>`).join('')}</div>
        <div class="pane pane--2"><div class="scan">${insurers.map(() => '<i></i>').join('')}</div><p class="scan__n"><b>0</b>/24</p></div>
        <div class="pane pane--3"><div class="ring">${icon('phone')}</div><p>${E(cfg.brand)}</p><small>${E(t.tagline)}</small></div>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--navy" id="neden">
  <div class="wrap"><h2 class="h2">${E(h.whyTitle)}</h2>
    <div class="why">${h.why.map((w, i) => `<article><h3>${E(w.t)}</h3><p>${E(w.d)}</p></article>`).join('')}</div>
    
  </div>
</section>
${faqHtml(h.faqTitle, h.faq)}
${ctaBand(lang, base, h.ctaTitle, h.ctaLead)}
</main>
${footer(lang, base)}
` + scripts(base);
}

function renderProduct(lang, p) {
  const t = content[lang]; const d = t.products[p]; const path = pagePath(lang, p); const base = '../'.repeat(depthOf(path));
  const homeP = pagePath(lang, 'home');
  const ld = [graph([agencyLd(lang), siteLd(lang),
    { '@type': 'WebPage', '@id': abs(path) + '#webpage', url: abs(path), name: d.title, description: d.desc, isPartOf: { '@id': abs('#website') }, breadcrumb: { '@id': abs(path) + '#breadcrumb' }, inLanguage: t.htmlLang },
    { ...crumbs(lang, [[t.ld.breadcrumbHome, homeP], [d.short, path]]), '@id': abs(path) + '#breadcrumb' },
    { '@type': 'Service', '@id': abs(path) + '#service', name: d.short, serviceType: d.short, description: d.desc, provider: { '@id': abs('#organization') }, areaServed: { '@type': 'Country', name: 'TR' }, url: abs(path) },
    faqLd(d.faq)])];
  const words = (s) => s.split(' ').map((w) => `<span class="w"><span>${E(w)}</span></span>`).join(' ');
  return head({ lang, key: p, title: d.title, desc: d.desc, path, ld, base }) + `
<body class="page-product">
${header(lang, p, base)}
<main id="main">
<section class="hero hero--sm" data-scene-host>
  <div class="hero__bg" aria-hidden="true"></div>
  <canvas class="gl" id="gl" data-scene="${d.scene}"${d.scene === 'shield' ? ` data-logos='${E(JSON.stringify(insurers.map(([n]) => [n, logoFile(n) ? base + logoFile(n) : ''])))}'` : ''} role="img" aria-label="${E(d.short)}"></canvas>
  <div class="wrap hero__in">
    <nav class="crumbs" aria-label="breadcrumb" data-hero><a href="${base}${homeP}">${E(t.ld.breadcrumbHome)}</a><span>/</span><span aria-current="page">${E(d.short)}</span></nav>
    <p class="eyebrow" data-hero><span class="dot"></span>${E(d.eyebrow)}</p>
    <h1 class="display display--sm" data-split>${words(d.h1)}</h1>
    <p class="lead" data-hero>${E(d.lead)}</p>
    <div class="hero__cta" data-hero><a class="btn btn--lg" href="${base}${pagePath(lang, 'teklif')}?urun=${p}" data-magnet>${E(t.cta.quote)}</a><a class="btn btn--ghost btn--lg" href="tel:${cfg.phoneTel}">${icon('phone')}${E(t.cta.call)}</a></div>
  </div>
</section>

<section class="sec sec--paper">
  <div class="wrap"><h2 class="h2">${E(d.coversTitle)}</h2>
    <dl class="covers">${d.covers.map((c) => `<div class="cover"><dt>${E(c.t)}</dt><dd>${E(c.d)}</dd></div>`).join('')}</dl>
  </div>
</section>

<section class="sec sec--navy">
  <div class="wrap split"><div><h2 class="h2">${E(d.whoTitle)}</h2></div>
    <ul class="ticks">${d.who.map((w) => `<li>${icon('check')}<span>${E(w)}</span></li>`).join('')}</ul></div>
</section>

<section class="marquee marquee--light" aria-label="${E(t.home.marqueeTitle)}">
  <div class="wrap"><h2 class="marquee__t">${E(t.home.marqueeTitle)}</h2></div>
  ${marqueeRows(base)}
</section>

${faqHtml(t.home.faqTitle === t.home.faqTitle ? t.home.faqTitle : '', d.faq)}
<section class="sec sec--paper sec--tight"><div class="wrap other"><h2 class="h3">${E(t.cta.all)}</h2><div class="other__list">${ALL.filter((x) => x !== p).map((x) => `<a href="${base}${pagePath(lang, x)}">${icon(t.products[x].icon)}${E(t.products[x].short)}</a>`).join('')}</div></div></section>
${ctaBand(lang, base, t.home.ctaTitle, t.home.ctaLead)}
</main>
${footer(lang, base)}
` + scripts(base);
}

function renderQuote(lang) {
  const t = content[lang]; const q = t.quote; const path = pagePath(lang, 'teklif'); const base = '../'.repeat(depthOf(path));
  const homeP = pagePath(lang, 'home');
  const ld = [graph([agencyLd(lang), siteLd(lang), { '@type': 'WebPage', '@id': abs(path) + '#webpage', url: abs(path), name: q.title, description: q.desc, isPartOf: { '@id': abs('#website') }, breadcrumb: { '@id': abs(path) + '#breadcrumb' }, inLanguage: t.htmlLang }, { ...crumbs(lang, [[t.ld.breadcrumbHome, homeP], [t.nav.teklif, path]]), '@id': abs(path) + '#breadcrumb' }])];
  const data = { q: { ...q, fields: undefined }, fields: q.fields, products: Object.fromEntries(ALL.map((p) => [p, { name: t.products[p].short, icon: t.products[p].icon }])), insurers: insurers.map(([n]) => n), wa: cfg.whatsapp, email: cfg.email, tel: cfg.phoneTel, brand: cfg.brand, lang };
  return head({ lang, key: 'teklif', title: q.title, desc: q.desc, path, ld, base }) + `
<body class="page-quote">
${header(lang, 'teklif', base)}
<main id="main">
<section class="hero hero--quote">
  <div class="hero__bg" aria-hidden="true"></div>
  <div class="wrap hero__in">
    <nav class="crumbs" aria-label="breadcrumb"><a href="${base}${homeP}">${E(t.ld.breadcrumbHome)}</a><span>/</span><span aria-current="page">${E(t.nav.teklif)}</span></nav>
    <h1 class="display display--sm">${E(q.h1)}</h1>
    <p class="lead">${E(q.lead)}</p>
  </div>
</section>
<section class="sec sec--paper sec--form">
  <div class="wrap narrow">
    <ol class="wiz-steps" id="wizSteps">${q.steps.map((s, i) => `<li${i === 0 ? ' class="on"' : ''}><b>${i + 1}</b><span>${E(s)}</span></li>`).join('')}</ol>
    <form class="wiz" id="wiz" novalidate>
      <fieldset class="panel on" data-panel="0"><legend class="h3">${E(q.pick)}</legend>
        <div class="pick">${ALL.map((p) => `<label class="pick__i"><input type="radio" name="urun" value="${p}"><span>${icon(t.products[p].icon)}<b>${E(t.products[p].short)}</b></span></label>`).join('')}</div>
        <p class="err" data-err="urun" hidden>${E(q.errReq)}</p>
      </fieldset>
      <fieldset class="panel" data-panel="1"><legend class="h3">${E(q.details)}</legend>
        <div class="grid2" id="dyn"></div>
        <h3 class="h4">${E(q.companies)}</h3>
        <div class="seg"><label><input type="radio" name="cmode" value="all" checked><span>${E(q.allCompanies)}</span></label><label><input type="radio" name="cmode" value="pick"><span>${E(q.pickCompanies)}</span></label></div>
        <div class="co" id="co" hidden>${insurers.map(([n], i) => `<label><input type="checkbox" name="co" value="${E(n)}"><span>${E(n)}</span></label>`).join('')}</div>
        <h3 class="h4">${E(q.contact)}</h3>
        <div class="grid2">
          <label class="f"><span>${E(q.name)} *</span><input name="ad" autocomplete="name" required><em class="err" data-err="ad" hidden>${E(q.errReq)}</em></label>
          <label class="f"><span>${E(q.phone)} *</span><input name="tel" type="tel" inputmode="tel" autocomplete="tel" required><em class="err" data-err="tel" hidden>${E(q.errPhone)}</em></label>
          <label class="f"><span>${E(q.email)}</span><input name="mail" type="email" autocomplete="email"></label>
          <label class="f f--wide"><span>${E(q.note)}</span><textarea name="not" rows="3"></textarea></label>
        </div>
        <div class="seg"><span class="seg__l">${E(q.mode)}</span><label><input type="radio" name="mode" value="call" checked><span>${E(q.modeCall)}</span></label><label><input type="radio" name="mode" value="wa"><span>${E(q.modeWa)}</span></label></div>
        <label class="kvkk"><input type="checkbox" name="kvkk" required><span>${E(q.kvkk)}</span></label><p class="err" data-err="kvkk" hidden>${E(q.errKvkk)}</p>
        <p class="hint">${E(q.hint)}</p>
      </fieldset>
      <fieldset class="panel" data-panel="2"><legend class="h3">${E(q.summary)}</legend>
        <pre class="summary" id="summary"></pre>
        <div class="send"><a class="btn btn--lg" id="sendWa" href="#" target="_blank" rel="noopener">${icon('wa')}${E(q.sendWa)}</a><a class="btn btn--ghost btn--lg btn--dark" id="sendMail" href="#">${E(q.sendMail)}</a><button type="button" class="btn btn--ghost btn--lg btn--dark" id="copy">${E(q.copy)}</button></div>
      </fieldset>
      <div class="wiz__nav"><button type="button" class="btn btn--ghost btn--dark" id="back" hidden>${E(q.back)}</button><button type="button" class="btn" id="next">${E(q.next)}${icon('arrow')}</button></div>
    </form>
  </div>
</section>
</main>
${footer(lang, base)}
<script type="application/json" id="quote-data">${J(data)}</script>
` + scripts(base, `\n<script type="module" src="${base}js/quote.js"></script>`);
}

function renderBranch(lang) {
  const t = content[lang]; const b = t.branch; const path = pagePath(lang, 'sube'); const base = '../'.repeat(depthOf(path)); const homeP = pagePath(lang, 'home');
  const ld = [graph([agencyLd(lang), siteLd(lang), { '@type': 'WebPage', '@id': abs(path) + '#webpage', url: abs(path), name: b.title, description: b.desc, isPartOf: { '@id': abs('#website') }, breadcrumb: { '@id': abs(path) + '#breadcrumb' }, inLanguage: t.htmlLang }, { ...crumbs(lang, [[t.ld.breadcrumbHome, homeP], [b.nav, path]]), '@id': abs(path) + '#breadcrumb' }])];
  const data = { wa: cfg.whatsapp, b: { msg: b.msg, m: b.m, ok: b.ok } };
  const opts = (a) => a.map((o) => `<option>${E(o)}</option>`).join('');
  return head({ lang, key: 'sube', title: b.title, desc: b.desc, path, ld, base }) + `
<body class="page-quote page-branch">
${header(lang, 'sube', base)}
<main id="main">
<section class="hero hero--quote"><div class="hero__bg" aria-hidden="true"></div><div class="wrap hero__in">
  <nav class="crumbs" aria-label="breadcrumb"><a href="${base}${homeP}">${E(t.ld.breadcrumbHome)}</a><span>/</span><span aria-current="page">${E(b.nav)}</span></nav>
  <p class="eyebrow"><span class="dot"></span>${E(b.eyebrow)}</p>
  <h1 class="display display--sm">${E(b.h1)}</h1><p class="lead">${E(b.lead)}</p>
</div></section>
<section class="sec sec--navy"><div class="wrap"><h2 class="h2">${E(b.whyTitle)}</h2><div class="why">${b.why.map((w) => `<article><h3>${E(w.t)}</h3><p>${E(w.d)}</p></article>`).join('')}</div></div></section>
<section class="sec sec--paper sec--form"><div class="wrap narrow">
  <h2 class="h2">${E(b.stepsTitle)}</h2>
  <ol class="wiz-steps">${b.steps.map((s, i) => `<li class="on"><b>${i + 1}</b><span>${E(s)}</span></li>`).join('')}</ol>
  <form class="wiz" id="branchForm" name="subelik-basvurusu" method="post" action="#" data-netlify="true" netlify-honeypot="bot-field" novalidate>
    <input type="hidden" name="form-name" value="subelik-basvurusu"><input type="hidden" name="dil" value="${lang}">
    <p class="hp" aria-hidden="true"><label>Bot <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
    <fieldset class="panel on"><legend class="h3">${E(b.formTitle)}</legend>
      <div class="grid2">
        <label class="f"><span>${E(b.f.ad)} *</span><input name="ad" autocomplete="name" required><em class="err" data-err="ad" hidden>${E(b.errReq)}</em></label>
        <label class="f"><span>${E(b.f.tel)} *</span><input name="tel" type="tel" inputmode="tel" autocomplete="tel" required><em class="err" data-err="tel" hidden>${E(b.errPhone)}</em></label>
        <label class="f"><span>${E(b.f.il)} *</span><input name="il" required><em class="err" data-err="il" hidden>${E(b.errReq)}</em></label>
        <label class="f"><span>${E(b.f.mail)}</span><input name="mail" type="email" autocomplete="email"></label>
        <label class="f"><span>${E(b.f.durum)}</span><select name="durum">${opts(b.f.durumO)}</select></label>
        <label class="f"><span>${E(b.f.ofis)}</span><select name="ofis">${opts(b.f.ofisO)}</select></label>
        <label class="f f--wide"><span>${E(b.f.not)}</span><textarea name="not" rows="3"></textarea></label>
      </div>
      <label class="kvkk"><input type="checkbox" name="kvkk" required><span>${E(b.kvkk)}</span></label><p class="err" data-err="kvkk" hidden>${E(b.errKvkk)}</p>
      <p class="hint">${E(b.note)}</p>
      <div class="send"><button class="btn btn--lg" type="submit">${icon('wa')}${E(b.btn)}</button></div>
    </fieldset>
    <script type="application/json" id="branch-data">${J(data)}</script>
  </form>
</div></section>
</main>
${footer(lang, base)}
` + scripts(base, `\n<script type="module" src="${base}js/branch.js"></script>`);
}

// --- üret
for (const lang of langs) {
  out(`${pagePath(lang, 'home')}index.html`, renderHome(lang));
  for (const p of ALL) out(`${pagePath(lang, p)}index.html`, renderProduct(lang, p));
  out(`${pagePath(lang, 'teklif')}index.html`, renderQuote(lang));
  out(`${pagePath(lang, 'sube')}index.html`, renderBranch(lang));
}
// 404 (kök-mutlak yollar: her derinlikte çalışsın)
{
  const t = content.tr; const base = '/';
  out('404.html', head({ lang: 'tr', key: 'home', title: t.a11y.notFoundTitle, desc: t.home.desc, path: '404.html', ld: [], base, noindex: true }) + `
<body class="page-404">${header('tr', 'home', base)}<main id="main"><section class="hero hero--quote"><div class="hero__bg" aria-hidden="true"></div><div class="wrap hero__in"><p class="eyebrow">404</p><h1 class="display display--sm">${E(t.a11y.notFoundH)}</h1><p class="lead">${E(t.a11y.notFoundP)}</p><div class="hero__cta"><a class="btn btn--lg" href="/">${E(t.a11y.notFoundBtn)}</a></div></div></section></main>${footer('tr', base)}` + scripts(base));
}
// sitemap
const urls = [];
for (const key of ['home', ...ALL, 'teklif', 'sube']) for (const lang of langs) {
  urls.push(`<url><loc>${abs(pagePath(lang, key))}</loc><lastmod>${cfg.lastmod}</lastmod><changefreq>${key === 'home' ? 'weekly' : 'monthly'}</changefreq><priority>${key === 'home' ? '1.0' : key === 'teklif' ? '0.9' : '0.8'}</priority>${langs.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${abs(pagePath(l, key))}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${abs(pagePath('tr', key))}"/></url>`);
}
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
out('robots.txt', `User-agent: *\nAllow: /\nDisallow: /scripts/\n\nSitemap: ${abs('sitemap.xml')}\n`);
out('manifest.webmanifest', JSON.stringify({ name: cfg.brand, short_name: cfg.brand, description: content.tr.home.desc, lang: 'tr', start_url: '/', display: 'standalone', background_color: '#1b1e3d', theme_color: '#1b1e3d', icons: [{ src: 'assets/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }] }, null, 2));
out('_headers', `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/css/*\n  Cache-Control: public, max-age=604800\n/js/*\n  Cache-Control: public, max-age=604800\n`);
console.log(`${written.length} dosya üretildi:\n` + written.map((w) => ' - ' + w).join('\n'));
