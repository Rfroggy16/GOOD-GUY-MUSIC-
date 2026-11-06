const beats = [
  {title:'Golden Hour',mood:'Warm keys / Late-night drive',genre:'Hip-hop',bpm:92,key:'D minor',cover:1},
  {title:'Good Company',mood:'Smooth chords / Soulful bounce',genre:'R&B',bpm:78,key:'A minor',cover:2},
  {title:'No Bad Energy',mood:'Heavy drums / Confident energy',genre:'Trap',bpm:142,key:'F minor',cover:3},
  {title:'Sunday Sessions',mood:'Dusty textures / Head-nod pocket',genre:'Hip-hop',bpm:86,key:'C minor',cover:4}
];
let filter = 'All', query = '', active = -1, audio, sources = [], timer, started = 0;
const tracks = document.querySelector('#tracks');
function renderTracks(){
  const visible = beats.map((beat,index)=>({...beat,index})).filter(b=> (filter==='All'||b.genre===filter) && `${b.title} ${b.mood} ${b.genre}`.toLowerCase().includes(query));
  tracks.innerHTML = visible.map(b=>`<article class="track ${active===b.index?'playing':''}"><div class="track-main"><div class="cover c${b.cover}"><img src="assets/icon.png" alt=""><button class="play-btn" data-play="${b.index}" aria-label="${active===b.index?'Stop':'Play'} ${b.title} demo preview">${active===b.index?'Ⅱ':'▶'}</button></div><div><h3>${b.title}</h3><div class="track-mood">${b.mood}</div></div></div><span class="genre">${b.genre}</span><span class="track-meta">${b.bpm} BPM <span>/</span> ${b.key}</span><button class="track-action" data-beat="${b.index}">DETAILS ↗</button></article>`).join('');
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
  sources.forEach(node=>{try{node.stop();}catch{}});
  sources=[];active=-1;document.querySelector('#player').hidden=true;renderTracks();
}
async function playBeat(index){
  if(active===index){stopAudio();return;}
  stopAudio();
  try{
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
tracks.addEventListener('click',event=>{const play=event.target.closest('[data-play]'), detail=event.target.closest('[data-beat]');if(play)playBeat(Number(play.dataset.play));if(detail){const b=beats[Number(detail.dataset.beat)];openDetail('DEMO BEAT COLLECTION',b.title,`${b.genre} · ${b.bpm} BPM · ${b.key}. ${b.mood}. This is an illustrative track with a generated audio preview, not a purchasable music license. Ask about the sound you’re looking for and we’ll capture it in your project brief.`,'Beat licensing',`I’m interested in a beat with the ${b.title} vibe. `);}});
document.querySelector('#player-close').addEventListener('click',stopAudio);
document.querySelector('#player-toggle').addEventListener('click',stopAudio);
const dialog=document.querySelector('#detail-dialog');
function openDetail(category,title,description,service,project=''){
  document.querySelector('#dialog-category').textContent=category;document.querySelector('#dialog-title').textContent=title;document.querySelector('#dialog-description').textContent=description;document.querySelector('#dialog-inquiry').dataset.service=service;document.querySelector('#dialog-inquiry').dataset.project=project;dialog.showModal();
}
document.querySelectorAll('[data-merch]').forEach(button=>button.addEventListener('click',()=>openDetail('CONCEPT COLLECTION / COMING SOON',button.dataset.merch,'A first look at the Good Guy collection. This is a visual mockup, not a product currently for sale. Final materials, sizes, pricing, and availability are still to be confirmed. Save a merch inquiry to include your interest in a project brief.','Merch inquiry',`I’m interested in ${button.dataset.merch}. `)));
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
