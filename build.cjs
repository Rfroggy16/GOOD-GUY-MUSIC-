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
async function loadCatalog(){try{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('good-guy-owner-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('beats',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const rows=await new Promise((resolve,reject)=>{const r=db.transaction('beats').objectStore('beats').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});db.close();beats=rows.length?rows.sort((a,b)=>b.updated-a.updated):[...demoBeats];renderTracks();document.querySelector('#collection-label').textContent=rows.length?'BEAT COLLECTION':'DEMO COLLECTION';document.querySelector('#collection-note').textContent=rows.length?'Browser-local catalog preview. Live store integration pending.':'Sample collection for the website preview. Real releases coming next.';}catch{}}
window.addEventListener('focus',loadCatalog);loadCatalog();`;
const studioScript=`const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let beats=[],demoBeats=[],filter='All',query='';function renderTracks(){}function stopAudio(){}\n`+source.slice(split);
html=html.replace(ownerSection,'').replace(/<button id="owner-open"[\s\S]*?<\/button>/,'');
html = html.replace(/(?:src|href)="assets\/(icon|logo)\.png"/g, match => {
  const name = match.includes('icon.png') ? 'icon' : 'logo';
  const attribute = match.startsWith('src') ? 'src' : 'href';
  return `${attribute}="data:image/png;base64,${fs.readFileSync(path.join(root, 'assets', `${name}.png`)).toString('base64')}"`;
});
html = html.replace(/<link rel="stylesheet" href="style.css">|<style id="site-css">[\s\S]*?<\/style>/, () => `<style id="site-css">${fs.readFileSync(path.join(root, 'style.css'), 'utf8')}</style>`);
html = html.replace(/<script src="app.js"><\/script>|<script id="site-js">[\s\S]*?<\/script>/, () => `<script id="site-js">${publicScript.replace(/<\/script/gi, '<\\/script')}</script>`);
fs.writeFileSync(path.join(root, 'index.html'), html);
const icon='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/icon.png')).toString('base64');
const section=ownerSection.replace('class="section owner" hidden','class="section owner"').replace('<button id="owner-close" class="track-action">Close studio ×</button>','<a class="button gold" href="../" target="_blank" rel="noopener">PREVIEW WEBSITE ↗</a>');
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
const studio=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Good Guy Music — Owner Studio</title><link rel="icon" href="${icon}"><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${css}</style></head><body class="studio-page"><a class="skip" href="#owner">Skip to studio</a><header class="header"><a class="brand" href="./"><img src="${icon}" alt="Good Guy"><span>GOOD GUY<span class="brand-sub">OWNER STUDIO</span></span></a><span class="studio-mode">LOCAL WORKSPACE · LOGIN NOT CONNECTED</span></header><main>${section}<section class="section launch-checklist"><p class="eyebrow">THE NEXT CHAPTER</p><h2>READY FOR <span class="outline">THE REAL STORE.</span></h2><p class="small-note">Both interfaces are separate. These steps remain before launch.</p><div class="launch-grid"><article><span class="coming-badge">NEXT</span><h3>Secure owner sign-in</h3><p>Real login, server-side permissions, and protected admin routes. A separate page alone is not security.</p></article><article><span class="coming-badge">NEXT</span><h3>Shared music catalog</h3><p>Cloud storage and a database so every customer sees your uploaded beats and updated prices.</p></article><article><span class="coming-badge">NEXT</span><h3>Payments & delivery</h3><p>Connect your payment account, verify purchases, and release private downloads with license receipts.</p></article></div></section></main><footer><span>Good Guy Music / Owner workspace</span><a href="../" target="_blank" rel="noopener">PREVIEW PUBLIC WEBSITE ↗</a></footer><script>${studioScript.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
fs.mkdirSync(path.join(root,'studio'),{recursive:true});fs.writeFileSync(path.join(root,'studio','index.html'),studio);
console.log('Built separate public website and Owner Studio.');
