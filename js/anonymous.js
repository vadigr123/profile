// POYO anonymous inbox — browser only handles public settings and files.
// Telegram bot token, chat ID and Turnstile secret live ONLY in Cloudflare Workers Secrets.
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const form = $('anon-form');
  if (!form) return;
  const config = window.SITE_CONFIG || {};
  const endpoint = String(config.anonymousWorkerUrl || '').trim().replace(/\/+$/, '');
  const sitekey = String(config.turnstileSiteKey || '').trim();
  const validEndpoint = /^https:\/\/[^\s/]+\/?$/.test(endpoint) || /^http:\/\/localhost:\d+$/.test(endpoint);
  const configured = !!(validEndpoint && sitekey);
  const status = $('anon-status');
  const send = $('anon-submit');
  const setup = $('anon-configuration');
  const message = $('anon-message');
  const ttsText = $('anon-tts-text');
  const voice = $('anon-voice');
  const audio = $('anon-tts-audio');
  const canvas = $('anon-drawing');
  const ctx = canvas.getContext('2d');
  const drawColor = getComputedStyle(document.documentElement).getPropertyValue('--yellow').trim() || '#ffe400';
  const tabs = Array.from(document.querySelectorAll('[data-anon-mode]'));
  const kinds = ['text', 'drawing', 'tts'];
  const tokenField = $('anon-turnstile');
  let mode = 'text';
  let turnstileWidget = null;
  let currentToken = '';
  let sending = false;
  let strokes = false;
  let drawing = false;
  let audioUrl = '';
  let audioCacheKey = '';
  let audioBlob = null;

  function report(text, kind='') {
    status.textContent = text;
    status.dataset.kind = kind;
  }
  function resetWidget() {
    currentToken = '';
    if (window.turnstile && turnstileWidget !== null) {
      try { window.turnstile.reset(turnstileWidget); } catch (error) { console.warn('Turnstile reset', error); }
    }
  }
  function syncReady() { send.disabled = !configured || sending || !currentToken; }

  function showMode(next) {
    if (!kinds.includes(next)) return;
    mode = next;
    tabs.forEach(tab => {
      const active = tab.dataset.anonMode === mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    kinds.forEach(kind => { $(`anon-panel-${kind}`).hidden = kind !== next; });
    report('');
  }
  tabs.forEach(tab => tab.addEventListener('click', () => showMode(tab.dataset.anonMode)));
  tabs.forEach((tab, index) => tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    showMode(next.dataset.anonMode);
    next.focus();
  }));
  message.addEventListener('input', () => { $('anon-count').textContent = `${message.value.length} / 1200`; });

  // Drawing: preserve pixel-perfect brush across CSS pixel sizes / high-DPI screens.
  function resizeDrawing() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const previous = document.createElement('canvas');
    previous.width = canvas.width;
    previous.height = canvas.height;
    previous.getContext('2d').drawImage(canvas, 0, 0);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (strokes) ctx.drawImage(previous, 0, 0, previous.width, previous.height, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 6;
    ctx.strokeStyle = drawColor;
  }
  const point = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {x:e.clientX-rect.left,y:e.clientY-rect.top};
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const p = point(e);
    drawing = true; strokes = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + .05, p.y + .05);
    ctx.stroke();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p=point(e); ctx.lineTo(p.x,p.y);ctx.stroke();
  });
  const stop = () => { if(drawing){ drawing=false;ctx.closePath(); }};
  canvas.addEventListener('pointerup',stop);
  canvas.addEventListener('pointercancel',stop);
  canvas.addEventListener('lostpointercapture',stop);
  $('anon-clear').addEventListener('click', () => { ctx.clearRect(0,0,canvas.width,canvas.height);strokes=false;report('Малюнок очищено.'); });
  if(window.ResizeObserver) new ResizeObserver(resizeDrawing).observe(canvas);
  else window.addEventListener('resize',resizeDrawing);
  resizeDrawing();
  async function getDrawingFile() {
    const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;
    const cx=out.getContext('2d');cx.fillStyle='#111111';cx.fillRect(0,0,out.width,out.height);cx.drawImage(canvas,0,0);
    const blob=await new Promise(resolve=>out.toBlob(resolve,'image/png'));
    if(!blob)throw new Error('Не вдалося створити PNG.');
    if(blob.size>3*1024*1024) throw new Error('Малюнок завеликий (максимум 3 МБ).');
    return new File([blob],'poyo-drawing.png',{type:'image/png'});
  }

  // Same SAM.js engine as the user's Silly Voice Lab.
  const presets={
    sam:{speed:72,pitch:64,throat:128,mouth:128},
    elf:{speed:72,pitch:64,throat:110,mouth:160},
    robot:{speed:92,pitch:60,throat:190,mouth:190},
    alien:{speed:80,pitch:69,throat:38,mouth:226}
  };
  const uaMap={а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ye',ж:'zh',з:'z',и:'y',і:'i',ї:'yi',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'oo',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'yu',я:'ya','’':'',"'":''};
  const ruMap={а:'a',б:'b',в:'v',г:'g',д:'d',е:'ye',ё:'yo',ж:'zh',з:'z',и:'ee',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'oo',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'ih',ь:'',э:'eh',ю:'yu',я:'ya'};
  function spoken(text){
    const map=/[іїєґ]/i.test(text)?uaMap:/[а-яё]/i.test(text)?ruMap:uaMap;
    return [...text].map(ch => {
      const l=ch.toLowerCase();const t=Object.prototype.hasOwnProperty.call(map,l)?map[l]:ch;
      return ch===ch.toUpperCase()?t.toUpperCase():t;
    }).join('').replace(/[^a-zA-Z0-9 .,!?;:'\-]/g,' ').replace(/\s+/g,' ').trim();
  }
  function releaseAudio(){
    if(audioUrl)URL.revokeObjectURL(audioUrl);
    audioUrl='';audioCacheKey='';audioBlob=null;
    audio.removeAttribute('src');audio.hidden=true;
  }
  ttsText.addEventListener('input',releaseAudio);
  voice.addEventListener('change',releaseAudio);
  function synthesize(){
    const txt=ttsText.value.trim();
    if(!txt || txt.length>160)throw new Error('Для TTS введи до 160 символів.');
    const key=voice.value+'\n'+txt;
    if(audioCacheKey===key && audioBlob)return audioBlob;
    if(typeof window.SamJs!=='function')throw new Error('Модуль SAM.js не завантажився.');
    const input=spoken(txt);
    if(!input)throw new Error('Текст не містить символів для озвучування.');
    const wav=new window.SamJs(presets[voice.value]||presets.sam).wav(input);
    if(!wav || wav.length<44)throw new Error('SAM не зміг згенерувати аудіо. Спробуй коротший текст англійською.');
    const blob=new Blob([wav],{type:'audio/wav'});
    if(blob.size>5*1024*1024) throw new Error('WAV перевищив 5 МБ. Скороти текст.');
    releaseAudio();audioBlob=blob;audioCacheKey=key;audioUrl=URL.createObjectURL(blob);
    audio.src=audioUrl;audio.hidden=false;
    return blob;
  }
  $('anon-preview-tts').addEventListener('click', async()=>{
    try{report('Генерую голос...');synthesize();await audio.play();report('Готово! Можеш прослухати й надіслати.');}
    catch(e){report(e?.message||'Не вдалося згенерувати голос.','error');}
  });

  function startTurnstile(){
    if(!configured)return;
    const tag=document.createElement('script');
    tag.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    tag.async=true;tag.defer=true;
    tag.onload=()=>{
      try{
        turnstileWidget=window.turnstile.render(tokenField,{
          sitekey,
          theme:'light',
          callback:(token)=>{currentToken=token;syncReady();report('');},
          'expired-callback':()=>{currentToken='';syncReady();report('Перевірка закінчилась — повтори її.','error');},
          'error-callback':()=>{currentToken='';syncReady();report('Не вдалося завантажити перевірку Turnstile.','error');}
        });
      }catch(err){report('Неправильний Site Key або домен не дозволений у Turnstile.','error');}
    };
    tag.onerror=()=>report('Не вдалося завантажити Turnstile. Перевір інтернет і блокувальники.','error');
    document.head.appendChild(tag);
  }
  if (configured) { setup.hidden=true;startTurnstile(); }
  else {setup.hidden=false;report('Локально можна намалювати й прослухати TTS. Для доставки потрібні Cloudflare Worker і Turnstile.');}
  syncReady();

  form.addEventListener('submit',async (event)=>{
    event.preventDefault();
    if(!configured){report('Спочатку налаштуй Worker і Turnstile.','error');return;}
    if(!currentToken){report('Пройди перевірку Turnstile.','error');return;}
    if(sending)return;
    const payload=new FormData();
    payload.set('kind',mode);
    try {
      if(mode==='text'){
        const text=message.value.trim();
        if(!text||text.length>1200)throw new Error('Введи повідомлення (до 1200 символів).');
        payload.set('message',text);
      }else if(mode==='drawing'){
        if(!strokes)throw new Error('Спочатку намалюй щось!');
        payload.set('file',await getDrawingFile());
      }else{
        const blob=synthesize();
        payload.set('message',ttsText.value.trim());
        payload.set('voice',voice.value);
        payload.set('file',new File([blob],'poyo-tts.wav',{type:'audio/wav'}));
      }
    }catch(error){report(error.message,'error');return;}
    sending=true;syncReady();report('Надсилаю в Telegram...');
    payload.set('cf-turnstile-response',currentToken);
    try{
      const response=await fetch(`${endpoint}/api/send`,{method:'POST',body:payload,mode:'cors'});
      let data;try{data=await response.json();}catch{data={};}
      if(!response.ok||!data.ok)throw new Error(data.message||`Помилка надсилання (${response.status}).`);
      report('Надіслано! Дякую за повідомлення 💛','ok');
      if(mode==='text')message.value='';
      if(mode==='drawing'){$('anon-clear').click();report('Надіслано! Дякую за малюнок 💛','ok');}
      if(mode==='tts'){ttsText.value='';releaseAudio();}
      $('anon-count').textContent=`${message.value.length} / 1200`;
    }catch(err){report(err?.message||'Не вдалося зв’язатися з сервером. Спробуй пізніше.','error');}
    finally{sending=false;resetWidget();syncReady();}
  });
  window.addEventListener('pagehide',releaseAudio,{once:true});
})();
