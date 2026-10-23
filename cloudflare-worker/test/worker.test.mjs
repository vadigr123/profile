import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';

const origin='http://localhost:8000';
const env={
  ALLOWED_ORIGINS:'http://localhost:8000,https://vadigr123.github.io',
  TURNSTILE_SECRET:'test-secret',
  TELEGRAM_BOT_TOKEN:'test-bot-token',
  TELEGRAM_CHAT_ID:'1234567'
};
let telegramCalls=[];
const originalFetch=globalThis.fetch;
function mockNetwork(verify=true,deliver=true) {
  telegramCalls=[];
  globalThis.fetch=async (url, opts)=>{
    if(url.includes('/siteverify')){
      assert.equal(opts.body.get('secret'),'test-secret');
      return Response.json({success:verify,hostname:'localhost'});
    }
    if(url.includes('api.telegram.org')){
      telegramCalls.push({url,opts});
      assert.equal(opts.body.get('chat_id'),'1234567');
      return Response.json({ok:deliver}, {status:deliver?200:400});
    }
    throw new Error('Unexpected network request');
  };
}
function request(kind,{message='',voice='sam',file=null,originOverride=origin,token='test-captcha'}={}) {
  const f=new FormData();f.set('kind',kind);f.set('cf-turnstile-response',token);
  if(message)f.set('message',message);
  if(voice)f.set('voice',voice);
  if(file)f.set('file',file,'asset');
  return new Request('https://worker.example/api/send',{method:'POST',headers:{'Origin':originOverride},body:f});
}
const png=new Uint8Array([137,80,78,71,13,10,26,10,0,0]);
const wav=new TextEncoder().encode('RIFFABCDWAVEtest');

test('health status no secrets',async()=>{
  const resp=await worker.fetch(new Request('https://worker.example/health'),env);
  assert.equal(resp.status,200);
  assert.equal((await resp.text()).includes('test-bot-token'),false);
});
test('CORS preflight permitted only for configured origins',async()=>{
  const yes=await worker.fetch(new Request('https://worker.example/api/send',{method:'OPTIONS',headers:{Origin:origin}}),env);
  assert.equal(yes.status,204);
  assert.equal(yes.headers.get('access-control-allow-origin'),origin);
  const no=await worker.fetch(new Request('https://worker.example/api/send',{method:'OPTIONS',headers:{Origin:'https://evil.example'}}),env);
  assert.equal(no.status,403);
});
test('delivers anonymous text to Telegram',async()=>{
  mockNetwork();
  const res=await worker.fetch(request('text',{message:'Вітаю!'}),env);
  assert.equal(res.status,200,await res.clone().text());
  assert.equal(telegramCalls.length,1);
  assert.ok(telegramCalls[0].url.endsWith('/sendMessage'));
  assert.match(telegramCalls[0].opts.body.get('text'),/Вітаю/);
  assert.equal(telegramCalls[0].opts.body.get('username'),null);
});
test('delivers PNG as photo',async()=>{
  mockNetwork();
  const file=new File([png],'image.png',{type:'image/png'});
  const res=await worker.fetch(request('drawing',{file}),env);
  assert.equal(res.status,200,await res.clone().text());
  assert.ok(telegramCalls[0].url.endsWith('/sendPhoto'));
  assert.equal(telegramCalls[0].opts.body.get('photo').type,'image/png');
});
test('delivers WAV as document',async()=>{
  mockNetwork();
  const file=new File([wav],'speech.wav',{type:'audio/wav'});
  const res=await worker.fetch(request('tts',{file,message:'Hello',voice:'robot'}),env);
  assert.equal(res.status,200,await res.clone().text());
  assert.ok(telegramCalls[0].url.endsWith('/sendDocument'));
});
test('rejects missing token and cross-origin requests',async()=>{
  mockNetwork();
  const res=await worker.fetch(request('text',{message:'Hey!',originOverride:'https://evil.example'}),env);
  assert.equal(res.status,403);
  const res2=await worker.fetch(request('text',{message:'Hey!',token:''}),env);
  assert.equal(res2.status,403);
  assert.equal(telegramCalls.length,0);
});
test('rejects invalid attachment and invalid captcha',async()=>{
  mockNetwork();
  const invalid=new File([new Uint8Array([1,2,3])],'abc.png',{type:'image/png'});
  const res=await worker.fetch(request('drawing',{file:invalid}),env);
  assert.equal(res.status,400);
  mockNetwork(false);
  const res2=await worker.fetch(request('text',{message:'Hello'}),env);
  assert.equal(res2.status,403);
});
test('does not claim success on Telegram failure',async()=>{
  mockNetwork(true,false);
  const res=await worker.fetch(request('text',{message:'Hello'}),env);
  assert.equal(res.status,502);
});

test.after(()=>{globalThis.fetch=originalFetch;});
