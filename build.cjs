const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/(?:src|href)="assets\/(icon|logo)\.png"/g, match => {
  const name = match.includes('icon.png') ? 'icon' : 'logo';
  const attribute = match.startsWith('src') ? 'src' : 'href';
  return `${attribute}="data:image/png;base64,${fs.readFileSync(path.join(root, 'assets', `${name}.png`)).toString('base64')}"`;
});
html = html.replace(/<link rel="stylesheet" href="style.css">|<style id="site-css">[\s\S]*?<\/style>/, () => `<style id="site-css">${fs.readFileSync(path.join(root, 'style.css'), 'utf8')}</style>`);
html = html.replace(/<script src="app.js"><\/script>|<script id="site-js">[\s\S]*?<\/script>/, () => `<script id="site-js">${fs.readFileSync(path.join(root, 'app.js'), 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`);
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('Built standalone website with embedded brand images, CSS, and JavaScript.');
