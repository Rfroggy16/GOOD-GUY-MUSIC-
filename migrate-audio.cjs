const fs=require('node:fs'),path=require('node:path');
const root=__dirname,html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const match=html.match(/<script[^>]*id="published-catalog"[^>]*>([\s\S]*?)<\/script>/);
const rows=match?JSON.parse(match[1]):[];
if(!rows.length){console.log('No embedded tracks. Existing catalog.json is unchanged.');process.exit(0);}
fs.mkdirSync(path.join(root,'audio'),{recursive:true});
const catalog=rows.map(beat=>{
  const {checkout,...clean}=beat;
  if(!String(beat.preview).startsWith('data:audio/'))return clean;
  const data=beat.preview.match(/^data:audio\/([^;]+);base64,([A-Za-z0-9+/=]+)$/);
  const ext={mpeg:'mp3',wav:'wav','x-wav':'wav',ogg:'ogg',mp4:'m4a','x-m4a':'m4a','vnd.wave':'wav'}[data?.[1]];
  if(!ext||!/^[a-f0-9-]{36}$/.test(beat.id))throw new Error('Invalid beat audio or ID.');
  const target=`audio/${beat.id}.${ext}`;fs.writeFileSync(path.join(root,target),Buffer.from(data[2],'base64'));
  return {...clean,preview:target};
});
fs.writeFileSync(path.join(root,'catalog.json'),JSON.stringify(catalog,null,2));
console.log(`Extracted ${catalog.length} tracks. Build the customer page next.`);
