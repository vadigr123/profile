/**
 * POYO Anonymous Inbox: Cloudflare Worker -> Telegram Bot API.
 * No credentials are ever delivered to the browser or committed to GitHub.
 */
const VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_REQUEST = 6 * 1024 * 1024;
const MAX_PNG = 3 * 1024 * 1024;
const MAX_WAV = 5 * 1024 * 1024;

function json(data, status=200, extra={}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}
  });
}
function allowedOrigins(env) {
  return new Set(String(env.ALLOWED_ORIGINS || '').split(',').map(o=>o.trim()).filter(Boolean));
}
function cors(origin) {
  return { 'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin' };
}
function problem(message,status,headers){return json({ok:false,message},status,headers);}
function isFile(value) {return value instanceof Blob;}
async function hasPngSignature(file) {
  const bytes = new Uint8Array(await file.slice(0,8).arrayBuffer());
  return bytes.length===8 && [137,80,78,71,13,10,26,10].every((value,i)=>value===bytes[i]);
}
async function hasWavSignature(file) {
  const bytes = new Uint8Array(await file.slice(0,12).arrayBuffer());
  const ascii = (offset)=>String.fromCharCode(...bytes.slice(offset,offset+4));
  return bytes.length===12 && ascii(0)==='RIFF' && ascii(8)==='WAVE';
}
async function verifyTurnstile(token, origin, req, env) {
  const remoteip = req.headers.get('CF-Connecting-IP') || '';
  const body = new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token});
  if(remoteip) body.set('remoteip',remoteip);
  let result;
  try {
    const res=await fetch(VERIFY_ENDPOINT,{method:'POST',body,signal:AbortSignal.timeout(10000)});
    if(!res.ok)return false;
    result=await res.json();
  }catch{return false;}
  // A token minted for another hostname must not be reusable for this site.
  const host = new URL(origin).hostname.toLowerCase();
  return result.success===true && String(result.hostname||'').toLowerCase()===host;
}
async function telegram(method, env, fields, binaryField, file, filename) {
  const data=new FormData();
  data.set('chat_id',env.TELEGRAM_CHAT_ID);
  for(const [key,val] of Object.entries(fields))data.set(key,val);
  if(binaryField)data.set(binaryField,file,filename);
  const url=`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`;
  let response, parsed;
  try {
    response=await fetch(url,{method:'POST',body:data,signal:AbortSignal.timeout(15000)});
    parsed=await response.json();
  } catch {return false;}
  return response.ok && parsed.ok===true;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const permitted = allowedOrigins(env);
    const originOk = permitted.has(origin);
    const headers = originOk ? cors(origin) : {};
    const url=new URL(request.url);
    if(request.method==='GET' && url.pathname==='/health')return json({ok:true,service:'POYO inbox'});
    if(request.method==='OPTIONS') {
      return originOk ? new Response(null,{status:204,headers}) : problem('Origin не дозволений.',403);
    }
    if(url.pathname!=='/api/send')return problem('Не знайдено.',404,headers);
    if(request.method!=='POST')return problem('Метод не підтримується.',405,headers);
    if(!originOk)return problem('Цей сайт не дозволений для надсилання.',403);
    if(!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_CHAT_ID||!env.TURNSTILE_SECRET)
      return problem('Власник сайту ще не налаштував сервер.',503,headers);
    const cl=Number(request.headers.get('Content-Length'));
    if(Number.isFinite(cl)&&cl>MAX_REQUEST)return problem('Завеликий запит.',413,headers);
    if(!String(request.headers.get('Content-Type')||'').startsWith('multipart/form-data'))
      return problem('Потрібні дані форми.',415,headers);
    let form;
    try{form=await request.formData();}catch{return problem('Некоректні дані.',400,headers);}
    const kind=String(form.get('kind')||'');
    if(!['text','drawing','tts'].includes(kind))return problem('Невідомий тип.',400,headers);
    const token=String(form.get('cf-turnstile-response')||'');
    if(!token||token.length>2048)return problem('Потрібна перевірка від спаму.',403,headers);
    let msg=String(form.get('message')||'').trim();
    if(msg.length>1200)return problem('Повідомлення завелике.',400,headers);
    const file=form.get('file');
    let method,fields,binaryField='',filename='';
    if(kind==='text') {
      if(!msg)return problem('Повідомлення порожнє.',400,headers);
      method='sendMessage';fields={text:`✉ Анонімне повідомлення POYO:\n\n${msg}`};
    } else if(kind==='drawing') {
      if(!isFile(file)||file.size===0||file.size>MAX_PNG||file.type!=='image/png'||!await hasPngSignature(file))
        return problem('Потрібен коректний PNG до 3 МБ.',400,headers);
      method='sendPhoto';fields={caption:'🎨 Анонімний малюнок з POYO Website'};
      binaryField='photo';filename='poyo-drawing.png';
    } else {
      if(!msg||msg.length>160)return problem('Текст TTS має містити 1–160 символів.',400,headers);
      const voice=String(form.get('voice')||'');
      if(!['sam','elf','robot','alien'].includes(voice))return problem('Невідомий TTS-голос.',400,headers);
      if(!isFile(file)||file.size===0||file.size>MAX_WAV||!['audio/wav','audio/wave','audio/x-wav'].includes(file.type)||!await hasWavSignature(file))
        return problem('Потрібен коректний WAV до 5 МБ.',400,headers);
      method='sendDocument';fields={caption:`🔊 Анонімний TTS (${voice})\n${msg}`};
      binaryField='document';filename='poyo-tts.wav';
    }
    const checked=await verifyTurnstile(token,origin,request,env);
    if(!checked)return problem('Перевірка Turnstile не пройдена або закінчилась. Спробуй ще раз.',403,headers);
    const delivered=await telegram(method,env,fields,binaryField,file,filename);
    if(!delivered)return problem('Telegram тимчасово не прийняв повідомлення. Спробуй пізніше.',502,headers);
    return json({ok:true,message:'Надіслано'},200,headers);
  }
};
