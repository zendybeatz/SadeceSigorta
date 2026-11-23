# SadeceSigorta web sitesi (statik, back end yok)

- Yerelde açmak: `npm start` (modül dosyaları için sunucu gerekir; çift tıklayıp açmayın)
- Bilgileri değiştirmek: `site.config.json` (telefon, WhatsApp, e-posta, adres, alan adı, doğrulama kodları) → `npm run build`
- Metinler/diller: `scripts/content.mjs` (yeni dil için `tr` bloğunu kopyalayıp çevirin, `langs` listesine ekleyin)
- Logolar: `npm run logos` (ikonları indirir) ya da resmi SVG'leri `assets/logos/<ad>.svg` olarak koyun
- Araç kurulumu (skill'ler, Playwright, Figma MCP): `.\kurulum.ps1`
- Yayın: tüm klasörü Netlify / Cloudflare Pages / herhangi bir statik hosta yükleyin (`_headers` hazır)
