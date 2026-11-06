const demoBeats = [
  {title:'Golden Hour',mood:'Warm keys / Late-night drive',genre:'Hip-hop',bpm:92,key:'D minor',cover:1},
  {title:'Good Company',mood:'Smooth chords / Soulful bounce',genre:'R&B',bpm:78,key:'A minor',cover:2},
  {title:'No Bad Energy',mood:'Heavy drums / Confident energy',genre:'Trap',bpm:142,key:'F minor',cover:3},
  {title:'Sunday Sessions',mood:'Dusty textures / Head-nod pocket',genre:'Hip-hop',bpm:86,key:'C minor',cover:4}
];
let beats = [...demoBeats];
const iconSource = document.querySelector('.brand img').src;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let filter = 'All', query = '', active = -1, audio, sources = [], timer, started = 0, uploadedAudio;
const tracks = document.querySelector('#tracks');
function renderTracks(){
  const visible = beats.map((beat,index)=>({...beat,index})).filter(b=> (filter==='All'||b.genre===filter) && `${b.title} ${b.mood} ${b.genre}`.toLowerCase().includes(query));
  tracks.innerHTML = visible.map(b=>`<article class="track ${active===b.index?'playing':''}"><div class="track-main"><div class="cover c${b.cover||3}"><img src="${iconSource}" alt=""><button class="play-btn" data-play="${b.index}" aria-label="${active===b.index?'Stop':'Play'} ${escapeHTML(b.title)} preview">${active===b.index?'■':'▶'}</button></div><div><h3>${escapeHTML(b.title)}</h3><div class="track-mood">${escapeHTML(b.mood)}</div></div></div><span class="genre">${escapeHTML(b.genre)}</span><span class="track-meta">${b.bpm} BPM <span>/</span> ${escapeHTML(b.key)}</span><button class="track-action" data-beat="${b.index}">${b.id?`$${Number(b.price).toFixed(2)} · LICENSE ↗`:'DEMO DETAILS ↗'}</button></article>`).join('');
  document.querySelector('#empty').hidden = !!visible.length;
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  filter=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  renderTracks();
}));
document.querySelector('#search').addEventListener('input',event=>{query=event.target.value.toLowerCase().trim();renderTracks();});
function stopAudio(){
  clearInterval(timer);
  if(uploadedAudio){uploadedAudio.pause();uploadedAudio.src='';uploadedAudio=null;}
  sources.forEach(node=>{try{node.stop();}catch{}});
  sources=[];active=-1;document.querySelector('#player').hidden=true;renderTracks();
}
async function playBeat(index){
  if(active===index){stopAudio();return;}
  stopAudio();
  try{
    if(beats[index].preview){
      const beat=beats[index];uploadedAudio=new Audio(beat.preview);await uploadedAudio.play();active=index;renderTracks();document.querySelector('#playing-title').textContent=beat.title;document.querySelector('#player div>span').textContent='TAGGED AUDIO PREVIEW';document.querySelector('#player').hidden=false;uploadedAudio.addEventListener('ended',stopAudio);timer=setInterval(()=>{if(!uploadedAudio)return;const current=uploadedAudio.currentTime,duration=uploadedAudio.duration;if(Number.isFinite(duration)){document.querySelector('#progress-bar').style.width=`${current/duration*100}%`;document.querySelector('#player-time').textContent=`${formatTime(current)} / ${formatTime(duration)}`;}},100);return;
    }
    document.querySelector('#player div>span').textContent='GENERATED DEMO PREVIEW';
    audio ||= new (window.AudioContext||window.webkitAudioContext)();
    await audio.resume();
    const beat=beats[index], now=audio.currentTime+.05, step=60/beat.bpm/2, duration=12;
    const master=audio.createGain();master.gain.value=.19;master.connect(audio.destination);
    const bassNotes=[[73.42,87.31,65.41,58.27],[55,65.41,73.42,49],[43.65,51.91,58.27,38.89],[65.41,77.78,58.27,51.91]][index];
    for(let s=0;s*step<duration;s++){
      const t=now+s*step;
      if(s%4===0){
        const kick=audio.createOscillator(), gain=audio.createGain();kick.frequency.setValueAtTime(130,t);kick.frequency.exponentialRampToValueAtTime(42,t+.12);gain.gain.setValueAtTime(.95,t);gain.gain.exponentialRampToValueAtTime(.001,t+.28);kick.connect(gain);gain.connect(master);kick.start(t);kick.stop(t+.3);sources.push(kick);
        const bass=audio.createOscillator(), bg=audio.createGain();bass.type='triangle';bass.frequency.value=bassNotes[Math.floor(s/8)%4];bg.gain.setValueAtTime(.001,t);bg.gain.linearRampToValueAtTime(.35,t+.02);bg.gain.exponentialRampToValueAtTime(.001,t+step*3.5);bass.connect(bg);bg.connect(master);bass.start(t);bass.stop(t+step*3.7);sources.push(bass);
      }
      const buffer=audio.createBuffer(1,audio.sampleRate*.09,audio.sampleRate), data=buffer.getChannelData(0);for(let n=0;n<data.length;n++) data[n]=Math.random()*2-1;
      const noise=audio.createBufferSource(), ng=audio.createGain(), high=audio.createBiquadFilter();noise.buffer=buffer;high.type='highpass';high.frequency.value=s%4===2?1800:7500;ng.gain.setValueAtTime(s%4===2?.3:.1,t);ng.gain.exponentialRampToValueAtTime(.001,t+.08);noise.connect(high);high.connect(ng);ng.connect(master);noise.start(t);sources.push(noise);
      if(s%2===0){const tone=audio.createOscillator(), tg=audio.createGain();tone.type='sine';tone.frequency.value=bassNotes[Math.floor(s/8)%4]*[4,6,5,8][(s/2)%4];tg.gain.setValueAtTime(.001,t);tg.gain.linearRampToValueAtTime(.13,t+.015);tg.gain.exponentialRampToValueAtTime(.001,t+step*1.8);tone.connect(tg);tg.connect(master);tone.start(t);tone.stop(t+step*2);sources.push(tone);}
    }
    active=index;started=audio.currentTime;renderTracks();document.querySelector('#playing-title').textContent=beat.title;document.querySelector('#player').hidden=false;document.querySelector('#progress-bar').style.width='0%';document.querySelector('#player-time').textContent='0:00 / 0:12';
    timer=setInterval(()=>{const elapsed=audio.currentTime-started;document.querySelector('#progress-bar').style.width=`${Math.min(100,elapsed/12*100)}%`;document.querySelector('#player-time').textContent=`0:${String(Math.min(12,Math.floor(elapsed))).padStart(2,'0')} / 0:12`;if(elapsed>=12)stopAudio();},100);
  }catch{stopAudio();openDetail('AUDIO PREVIEW','Preview unavailable','Your browser could not start the audio preview. Try a browser that supports Web Audio, or explore the track details instead.','Beat licensing');}
}
tracks.addEventListener('click',event=>{const play=event.target.closest('[data-play]'), detail=event.target.closest('[data-beat]');if(play)playBeat(Number(play.dataset.play));if(detail){const b=beats[Number(detail.dataset.beat)];openDetail(`${b.license||'Preview'} / $${Number(b.price||0).toFixed(2)} USD`,b.title,`${b.genre} · ${b.bpm} BPM · ${b.key}\n\n${b.terms||b.mood}\n\nPurchasing coming soon. PayPal checkout is not connected yet. No payment can be taken on this website.`,'Beat licensing');document.querySelector('#dialog-inquiry').hidden=true;}});
document.querySelector('#player-close').addEventListener('click',stopAudio);
document.querySelector('#player-toggle').addEventListener('click',stopAudio);
const dialog=document.querySelector('#detail-dialog');
function openDetail(category,title,description,service,project=''){
  const link=document.querySelector('#dialog-inquiry');link.hidden=false;link.href='#contact';link.removeAttribute('target');link.removeAttribute('rel');link.textContent='START AN INQUIRY ↗';
  document.querySelector('#dialog-category').textContent=category;document.querySelector('#dialog-title').textContent=title;document.querySelector('#dialog-description').textContent=description;document.querySelector('#dialog-inquiry').dataset.service=service;document.querySelector('#dialog-inquiry').dataset.project=project;dialog.showModal();
}
document.querySelectorAll('[data-merch]').forEach(button=>button.addEventListener('click',()=>{openDetail('COMING SOON',button.dataset.merch,'Just a sneak peek. We don’t have merch for sale yet. These are concept designs — final products, sizes, pricing, and launch dates will be announced later.','Merch inquiry');document.querySelector('#dialog-inquiry').hidden=true;}));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
document.addEventListener('click',event=>{const link=event.target.closest('[data-service]');if(link){document.querySelector('#service').value=link.dataset.service;if(link.dataset.project)document.querySelector('textarea[name="project"]').value=link.dataset.project;if(dialog.open)dialog.close();}});
const toggle=document.querySelector('.menu-toggle'), nav=document.querySelector('#navigation');
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation');}));
document.querySelector('#contact-form').addEventListener('submit',event=>{
  event.preventDefault();const data=new FormData(event.target);const brief=`GOOD GUY MUSIC — PROJECT BRIEF\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nService: ${data.get('service')}\n\nProject details:\n${data.get('project')}\n\nSaved locally from the website preview. This inquiry has not been sent.\n`;
  const url=URL.createObjectURL(new Blob([brief],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Good-Guy-Music-Project-Brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#form-status').textContent='Your project brief is downloaded. Keep it handy — no inquiry has been sent.';
});
document.querySelector('#year').textContent=new Date().getFullYear();renderTracks();
function formatTime(value){return `${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`;}
const ownerForm=document.querySelector('#beat-form');
let savedBeats=[], database;
const databaseReady=new Promise((resolve,reject)=>{
  if(!window.indexedDB){reject(new Error('Your browser does not support local storage for audio.'));return;}
  const request=indexedDB.open('good-guy-owner-v1',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('beats',{keyPath:'id'});
  request.onsuccess=()=>{database=request.result;resolve(database);};request.onerror=()=>reject(request.error);
});
async function transact(mode,operation){await databaseReady;return new Promise((resolve,reject)=>{const transaction=database.transaction('beats',mode);const request=operation(transaction.objectStore('beats'));transaction.oncomplete=()=>resolve(request?.result);transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error||new Error('The browser could not save this change.'));});}
async function refreshLibrary(){
  savedBeats=await transact('readonly',store=>store.getAll());
  savedBeats.sort((a,b)=>b.updated-a.updated);beats=savedBeats.length?savedBeats:[...demoBeats];renderTracks();
  if(document.querySelector('#collection-label'))document.querySelector('#collection-label').textContent=savedBeats.length?'YOUR BEAT COLLECTION':'DEMO COLLECTION';
  if(document.querySelector('#collection-note'))document.querySelector('#collection-note').textContent=savedBeats.length?'Local preview of your catalog. Hosted checkout opens only when you add a payment link.':'Sample beats for the design preview. Add your own from Owner studio.';
  document.querySelector('#owner-beats').innerHTML=savedBeats.length?savedBeats.map(b=>`<article class="owner-beat"><div><strong>${escapeHTML(b.title)}</strong><span>$${Number(b.price).toFixed(2)} USD · ${escapeHTML(b.license)}</span><small>Purchasing coming soon · PayPal pending</small></div><div class="owner-beat-actions"><button class="track-action" data-edit="${b.id}">Edit</button><button class="track-action" data-delete="${b.id}">Delete</button></div></article>`).join(''):'<p class="library-empty">Your library is empty. Add your first beat and set your price.</p>';
}
function validateCheckout(value){
  if(!value)return '';
  const url=new URL(value);
  const hosts=['buy.stripe.com','paypal.com','www.paypal.com','paypal.me','www.paypal.me','square.link'];
  if(url.protocol!=='https:'||!hosts.includes(url.hostname)||url.username||url.password||url.port||url.pathname==='/')throw new Error('Use a complete HTTPS hosted checkout link from Stripe, PayPal, or Square.');
  return url.href;
}
function validateBeat(b){
  if(typeof b.id!=='string'||!/^[a-f0-9-]{36}$/.test(b.id))throw new Error('A beat ID is invalid.');
  for(const [field,limit] of [['title',80],['mood',140],['key',30],['license',80],['terms',3000]])if(typeof b[field]!=='string'||!b[field].trim()||b[field].length>limit)throw new Error(`Check the ${field} field.`);
  if(!['Hip-hop','R&B','Trap'].includes(b.genre))throw new Error('Choose a supported genre.');
  if(!Number.isFinite(b.bpm)||b.bpm<30||b.bpm>300||!Number.isFinite(b.price)||b.price<1||b.price>10000)throw new Error('Check the BPM and price.');
  if(typeof b.preview!=='string'||!/^data:audio\/(?:mpeg|wav|x-wav|ogg|mp4|x-m4a|vnd.wave);base64,[A-Za-z0-9+/=]+$/.test(b.preview)||b.preview.length>28*1024*1024)throw new Error('Upload an audio preview of 20 MB or less.');
  return {id:b.id,title:b.title.trim(),mood:b.mood.trim(),genre:b.genre,bpm:b.bpm,key:b.key.trim(),price:Math.round(b.price*100)/100,license:b.license.trim(),terms:b.terms.trim(),preview:b.preview,checkout:validateCheckout(b.checkout||''),updated:Date.now(),cover:3};
}
function readPreview(file){return new Promise((resolve,reject)=>{
  const supported={'mp3':'audio/mpeg','wav':'audio/wav','ogg':'audio/ogg','m4a':'audio/mp4'};const extension=file.name.split('.').pop().toLowerCase();
  if(!supported[extension]||file.size>20*1024*1024||!file.size){reject(new Error('Choose an MP3, WAV, OGG, or M4A preview under 20 MB.'));return;}
  const reader=new FileReader();reader.onload=()=>resolve(`data:${supported[extension]};base64,${String(reader.result).split(',')[1]}`);reader.onerror=()=>reject(new Error('Could not read that audio file. Try selecting it again.'));reader.readAsDataURL(file);
});}
function resetBeatForm(){ownerForm.reset();ownerForm.elements.id.value='';document.querySelector('#beat-form-title').textContent='Add a beat';document.querySelector('#beat-cancel').hidden=true;document.querySelector('#beat-save').textContent='SAVE BEAT IN THIS BROWSER ↗';}
document.querySelector('#owner-open')?.addEventListener('click',()=>{document.querySelector('#owner').hidden=false;document.querySelector('#owner').scrollIntoView({behavior:'smooth'});});
document.querySelector('#owner-close')?.addEventListener('click',()=>{document.querySelector('#owner').hidden=true;document.querySelector('#owner-open').focus();});
document.querySelector('#beat-cancel').addEventListener('click',resetBeatForm);
ownerForm.addEventListener('submit',async event=>{
  event.preventDefault();const button=document.querySelector('#beat-save'),status=document.querySelector('#beat-status');button.disabled=true;status.textContent='Saving your beat…';
  try{
    const data=new FormData(ownerForm), existing=savedBeats.find(b=>b.id===data.get('id')), file=data.get('preview');
    const preview=file?.size?await readPreview(file):existing?.preview;
    const beat=validateBeat({id:existing?.id||crypto.randomUUID(),title:data.get('title'),mood:data.get('mood'),genre:data.get('genre'),bpm:Number(data.get('bpm')),key:data.get('key'),price:Number(data.get('price')),license:data.get('license'),terms:data.get('terms'),preview,checkout:data.get('checkout').trim()});
    await transact('readwrite',store=>store.put(beat));stopAudio();filter='All';query='';if(document.querySelector('#search'))document.querySelector('#search').value='';document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter==='All');b.setAttribute('aria-pressed',String(b.dataset.filter==='All'));});await refreshLibrary();resetBeatForm();status.textContent='Saved in this browser. Preview your website, then export the customer page to publish this update. Export a backup to protect your library.';
  }catch(error){status.textContent=error.message||'Could not save the beat. Your browser storage may be full.';}finally{button.disabled=false;}
});
document.querySelector('#owner-beats').addEventListener('click',async event=>{
  const edit=event.target.closest('[data-edit]'),remove=event.target.closest('[data-delete]');
  if(edit){const beat=savedBeats.find(b=>b.id===edit.dataset.edit);for(const field of ['id','title','mood','genre','bpm','key','price','license','terms','checkout'])ownerForm.elements[field].value=beat[field];ownerForm.elements.preview.value='';document.querySelector('#beat-form-title').textContent=`Edit ${beat.title}`;document.querySelector('#beat-cancel').hidden=false;document.querySelector('#beat-save').textContent='SAVE CHANGES IN THIS BROWSER ↗';ownerForm.scrollIntoView({behavior:'smooth'});}
  if(remove){const beat=savedBeats.find(b=>b.id===remove.dataset.delete);if(!confirm(`Delete “${beat.title}” from this browser? Export a backup first if you want to keep it.`))return;try{await transact('readwrite',store=>store.delete(beat.id));stopAudio();if(ownerForm.elements.id.value===beat.id)resetBeatForm();await refreshLibrary();document.querySelector('#beat-status').textContent='Beat deleted from this browser.';}catch{document.querySelector('#beat-status').textContent='Could not delete the beat. Please try again.';}}
});
document.querySelector('#export-catalog').addEventListener('click',()=>{
  const status=document.querySelector('#backup-status');if(!savedBeats.length){status.textContent='Add a beat before exporting a backup.';return;}
  const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,brand:'Good Guy Music',beats:savedBeats})],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='Good-Guy-Music-Beat-Backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Backup downloaded. Store it somewhere safe.';
});
document.querySelector('#import-catalog').addEventListener('change',async event=>{
  const status=document.querySelector('#backup-status'),file=event.target.files[0];if(!file)return;
  try{if(file.size>120*1024*1024)throw new Error('That backup is too large. The limit is 120 MB.');const backup=JSON.parse(await file.text());if(backup.version!==1||backup.brand!=='Good Guy Music'||!Array.isArray(backup.beats)||backup.beats.length>100)throw new Error('Choose a valid Good Guy Music catalog backup.');const validated=backup.beats.map(validateBeat);if(new Set(validated.map(b=>b.id)).size!==validated.length)throw new Error('The backup contains duplicate beat IDs.');await databaseReady;await new Promise((resolve,reject)=>{const tx=database.transaction('beats','readwrite');for(const beat of validated)tx.objectStore('beats').put(beat);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});stopAudio();await refreshLibrary();status.textContent=`Restored ${validated.length} beat${validated.length===1?'':'s'} in this browser.`;}catch(error){status.textContent=error.message||'Could not restore that backup.';}finally{event.target.value='';}
});
refreshLibrary().catch(()=>{document.querySelector('#beat-status').textContent='Browser storage is unavailable. Enable site storage in your browser to save beats.';document.querySelector('#beat-save').disabled=true;});
function createCustomerPage(){
  const template=JSON.parse(document.querySelector('#customer-template').textContent);
  const catalog=savedBeats.map(({id,title,mood,genre,bpm,key,price,license,terms,preview,cover})=>({id,title,mood,genre,bpm,key,price,license,terms,preview,cover}));
  const data=JSON.stringify(catalog).replace(/</g,'\\u003c');
  return template.replace(/(<script type="application\/json" id="published-catalog">)[\s\S]*?(<\/script>)/,()=>`<script type="application/json" id="published-catalog">${data}</script>`);
}
document.querySelector('#export-site')?.addEventListener('click',()=>{
  try{const html=createCustomerPage();const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='index.html';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#publish-status').textContent='Customer website downloaded. Publish this index.html only — keep Owner Studio and library backups private. Your hosted site changes only after you upload this export.';}catch{document.querySelector('#publish-status').textContent='Could not export your website. Please reload the studio and try again.';}
});
document.querySelector('#preview-site')?.addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([createCustomerPage()],{type:'text/html;charset=utf-8'}));window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000);
});
