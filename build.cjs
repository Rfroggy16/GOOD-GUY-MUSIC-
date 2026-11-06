const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const templatePath=path.join(root,'site.template.html');
if(!fs.existsSync(templatePath))fs.copyFileSync(path.join(root,'index.html'),templatePath);
let html = fs.readFileSync(templatePath, 'utf8');
const ownerSection=html.match(/<section id="owner"[\s\S]*?<\/section>/)[0];
const source=fs.readFileSync(path.join(root,'app.js'),'utf8');
const split=source.indexOf('const ownerForm=');
const publicScript=source.slice(0,split)+`
const catalog=JSON.parse(document.querySelector('#published-catalog').textContent);
beats=catalog;renderTracks();
document.querySelector('#collection-label').textContent='BEAT COLLECTION';
document.querySelector('#collection-note').textContent='Purchasing coming soon. PayPal checkout will be added later.';
if(!catalog.length){document.querySelector('#empty').hidden=false;document.querySelector('#empty').textContent='New beats are on the way. Check back for the first drop.';}`;
const studioScript=`const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let beats=[],demoBeats=[],filter='All',query='';function renderTracks(){}function stopAudio(){}\n`+source.slice(split);
html=html.replace(ownerSection,'').replace(/<button id="owner-open"[\s\S]*?<\/button>/,'');
html=html.replace(/<script id="published-catalog"[\s\S]*?<\/script>/,'');
html=html.replace('</head>','<script type="application/json" id="published-catalog">[]</script></head>');
html = html.replace(/(?:src|href)="assets\/(icon|logo)\.png"/g, match => {
  const name = match.includes('icon.png') ? 'icon' : 'logo';
  const attribute = match.startsWith('src') ? 'src' : 'href';
  return `${attribute}="data:image/png;base64,${fs.readFileSync(path.join(root, 'assets', `${name}.png`)).toString('base64')}"`;
});
html = html.replace(/<link rel="stylesheet" href="style.css">|<style id="site-css">[\s\S]*?<\/style>/, () => `<style id="site-css">${fs.readFileSync(path.join(root, 'style.css'), 'utf8')}</style>`);
html = html.replace(/<script src="app.js"><\/script>|<script id="site-js">[\s\S]*?<\/script>/, () => `<script id="site-js">${publicScript.replace(/<\/script/gi, '<\\/script')}</script>`);
fs.writeFileSync(path.join(root, 'index.html'), html);
const icon='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/icon.png')).toString('base64');
const section=ownerSection.replace('class="section owner" hidden','class="section owner"').replace('<button id="owner-close" class="track-action">Close studio ×</button>','<button class="button gold" id="preview-site">PREVIEW MY WEBSITE ↗</button>')
.replace(/<div class="owner-notice">[\s\S]*?<\/div>/,'<div class="owner-notice"><strong>Your personal workspace. No server database needed.</strong><p>Save tagged previews and license prices in this browser. Export the customer website to publish your changes. Keep this studio on your own device — it is not a password-protected online admin area. Never publish studio files with your customer website.</p></div>')
.replace(/<label>Hosted checkout link[\s\S]*?<\/label>/,'<input type="hidden" name="checkout" value=""><div class="payment-pending"><strong>PayPal · Not connected yet</strong><p>Purchasing stays disabled. Create your PayPal account later; verify payments and deliver beats manually once checkout is connected.</p></div>')
.replace('Your own beats replace the sample collection. Edit pricing and checkout links here.','Manage prices and license details here. Preview and export your saved catalog when ready.')
.replace('<div class="backup-actions">','<div class="publish-panel"><h3>Ready to update your website?</h3><p>Export one complete customer page with your saved beats, previews, and prices. Upload only that page to your static host. No database, login, or owner controls go with it.</p><button class="button gold" id="export-site">EXPORT CUSTOMER WEBSITE ↓</button><p id="publish-status" role="status"></p></div><div class="backup-actions">');
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
const studio=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Good Guy Music — Owner Studio</title><link rel="icon" href="${icon}"><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body class="studio-page"><a class="skip" href="#owner">Skip to studio</a><header class="header"><a class="brand" href="./"><img src="${icon}" alt="Good Guy"><span>GOOD GUY<span class="brand-sub">OWNER STUDIO</span></span></a><span class="studio-mode">LOCAL WORKSPACE · LOGIN NOT CONNECTED</span></header><main>${section}<section class="section launch-checklist"><p class="eyebrow">THE NEXT CHAPTER</p><h2>READY FOR <span class="outline">THE REAL STORE.</span></h2><p class="small-note">Both interfaces are separate. These steps remain before launch.</p><div class="launch-grid"><article><span class="coming-badge">NEXT</span><h3>Secure owner sign-in</h3><p>Real login, server-side permissions, and protected admin routes. A separate page alone is not security.</p></article><article><span class="coming-badge">NEXT</span><h3>Shared music catalog</h3><p>Cloud storage and a database so every customer sees your uploaded beats and updated prices.</p></article><article><span class="coming-badge">NEXT</span><h3>Payments & delivery</h3><p>Connect your payment account, verify purchases, and release private downloads with license receipts.</p></article></div></section></main><footer><span>Good Guy Music / Owner workspace</span><a href="../" target="_blank" rel="noopener">PREVIEW PUBLIC WEBSITE ↗</a></footer><script>${studioScript.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
fs.mkdirSync(path.join(root,'studio'),{recursive:true});fs.writeFileSync(path.join(root,'studio','index.html'),studio);
const studioPath=path.join(root,'studio','index.html');
let studioPage=fs.readFileSync(studioPath,'utf8');
studioPage=studioPage.replace('LOCAL WORKSPACE · LOGIN NOT CONNECTED','PERSONAL WORKSPACE · NO DATABASE');
studioPage=studioPage.replace(/<section class="section launch-checklist">[\s\S]*?<\/section>/,'<section class="section launch-checklist"><p class="eyebrow">YOUR SIMPLE RELEASE WORKFLOW</p><h2>MAKE IT. <span class="outline">SHARE IT.</span></h2><div class="launch-grid"><article><span class="coming-badge">SAVE</span><h3>Add your beats</h3><p>Add tagged public previews, prices, and license terms. Keep masters and stems off the website.</p></article><article><span class="coming-badge">EXPORT</span><h3>Publish your page</h3><p>Preview your catalog, export the customer page, and replace your hosted page. Back up the studio separately.</p></article><article><span class="coming-badge">LATER</span><h3>Connect PayPal</h3><p>Purchasing is coming soon. After PayPal setup, check payments and send the beat and license manually.</p></article></div></section>');
studioPage=studioPage.replace('</head>',`<script type="application/json" id="customer-template">${JSON.stringify(html).replace(/</g,'\\u003c')}</script></head>`);
fs.writeFileSync(studioPath,studioPage);
console.log('Built separate public website and Owner Studio.');
