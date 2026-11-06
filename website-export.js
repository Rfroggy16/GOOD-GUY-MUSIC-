function audioAsset(beat){
  const match=String(beat.preview||'').match(/^data:audio\/([^;]+);base64,([A-Za-z0-9+/=]+)$/);
  if(!match)throw new Error('Restore your library backup with embedded audio before exporting.');
  const extensions={mpeg:'mp3',wav:'wav','x-wav':'wav',ogg:'ogg',mp4:'m4a','x-m4a':'m4a','vnd.wave':'wav'};
  const extension=extensions[match[1]];
  if(!extension||!/^[a-f0-9-]{36}$/.test(beat.id))throw new Error('Invalid audio preview or beat ID.');
  const raw=atob(match[2]);
  const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
  if(bytes.length>20*1024*1024)throw new Error('Keep each preview below 20 MB.');
  return {path:`audio/${beat.id}.${extension}`,bytes};
}
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function zipFiles(files){
  const encode=new TextEncoder(),parts=[],central=[];let offset=0;
  for(const file of files){
    const name=encode.encode(file.path),bytes=typeof file.bytes==='string'?encode.encode(file.bytes):file.bytes,crc=crc32(bytes);
    const header=new Uint8Array(30+name.length),view=new DataView(header.buffer);
    view.setUint32(0,0x04034b50,true);view.setUint16(4,20,true);view.setUint16(6,0x800,true);view.setUint16(12,33,true);view.setUint32(14,crc,true);view.setUint32(18,bytes.length,true);view.setUint32(22,bytes.length,true);view.setUint16(26,name.length,true);header.set(name,30);
    const entry=new Uint8Array(46+name.length),ev=new DataView(entry.buffer);
    ev.setUint32(0,0x02014b50,true);ev.setUint16(4,20,true);ev.setUint16(6,20,true);ev.setUint16(8,0x800,true);ev.setUint16(14,33,true);ev.setUint32(16,crc,true);ev.setUint32(20,bytes.length,true);ev.setUint32(24,bytes.length,true);ev.setUint16(28,name.length,true);ev.setUint32(42,offset,true);entry.set(name,46);
    parts.push(header,bytes);central.push(entry);offset+=header.length+bytes.length;
  }
  const size=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);
  v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,size,true);v.setUint32(16,offset,true);
  return new Blob([...parts,...central,end],{type:'application/zip'});
}
function buildWebsiteFiles(){
  const template=JSON.parse(document.querySelector('#customer-template').textContent);
  const assets=[],catalog=savedBeats.map(beat=>{
    const asset=audioAsset(beat);assets.push(asset);
    const {id,title,mood,genre,bpm,key,price,license,terms,cover}=beat;
    return {id,title,mood,genre,bpm,key,price,license,terms,cover,preview:asset.path};
  });
  return [{path:'index.html',bytes:template},{path:'catalog.json',bytes:JSON.stringify(catalog,null,2)},...assets];
}
function exportWebsiteZip(){
  const button=document.querySelector('#export-site'),status=document.querySelector('#publish-status');button.disabled=true;
  try{
    const files=buildWebsiteFiles(),url=URL.createObjectURL(zipFiles(files));
    const a=document.createElement('a');a.href=url;a.download='Good-Guy-Music-Website.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
    status.textContent='Website ZIP downloaded. Extract it first. Upload index.html, catalog.json, and the audio folder to GitHub, preserving the folder structure. Never upload the ZIP or your private studio backup. Songs are now separate files; the HTML no longer grows with your audio.';
  }catch(error){status.textContent=error.message||'Could not export the website.';}finally{button.disabled=false;}
}
