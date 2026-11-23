# Windows PowerShell: .\kurulum.ps1  (proje klasöründe çalıştırın)  — Claude Code araçlarını kurar
$ErrorActionPreference = 'Continue'
New-Item -ItemType Directory -Force tools\repos, .claude\skills | Out-Null
$repos = 'emilkowalski/skills','pbakaus/impeccable','leonxlnx/taste-skill','microsoft/playwright','cheaper-inference/OmniRoute','headroomlabs-ai/headroom','nextlevelbuilder/ui-ux-pro-max-skill','thedotmack/claude-mem'
foreach ($r in $repos) { $n = $r.Split('/')[1]; if (!(Test-Path "tools\repos\$n")) { git clone --depth 1 "https://github.com/$r" "tools\repos\$n" } }
# Skill'leri projeye kopyala (SKILL.md içeren klasörler)
$srcs = 'tools\repos\skills\skills\*','tools\repos\taste-skill\skills\*','tools\repos\ui-ux-pro-max-skill\.claude\skills\*','tools\repos\impeccable\plugin\skills\*'
foreach ($s in $srcs) { Get-ChildItem $s -Directory -ErrorAction SilentlyContinue | Where-Object { Test-Path "$($_.FullName)\SKILL.md" } | ForEach-Object { Copy-Item $_.FullName ".claude\skills\$($_.Name)" -Recurse -Force } }
# Playwright
npm i -D playwright; npx playwright install chromium
# Figma MCP
claude mcp add --transport http figma https://mcp.figma.com/mcp
# claude-mem (kalıcı hafıza) — etkileşimli kurulum, soruları yanıtlayın
npx claude-mem install
Write-Host "Bitti. Claude Code'u bu klasorde acin. Figma icin ilk kullanimda /mcp ile oturum acin."
Write-Host "Tasarim denetimi icin: npx impeccable detect ."
