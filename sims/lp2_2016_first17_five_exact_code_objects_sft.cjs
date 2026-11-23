'use strict';
/** Issue #2416 frozen 2016 original-IRC adjacent named code-only acquisition.
 * 2016-Jan16–21 source-linked participants, not signed Cicada files.
 * This performs only static byte acquisition, no evaluation of remote programs.
 */
const assert=require('node:assert/strict'),crypto=require('node:crypto');
const items=[
{line:267830,date:'2016 Jan 16',who:'Komodo',label:'solved-page DIVINITY interrupt helper',url:'http://sprunge.us/EiNJ'},
{line:269273,date:'2016 Jan 17',who:'aaaa',label:'second-pattern Vigenere candidate',url:'http://pastebin.com/m5pqeHwW'},
{line:277539,date:'2016 Jan 21',who:'aaaa_',label:'revised rune-count gematria script',url:'http://pastebin.com/PCu9CtRk'},
{line:277563,date:'2016 Jan 21',who:'aaaa_',label:'welcome/koan plaintext and rune mapping',url:'http://pastebin.com/4DRnLuEr'},
{line:277569,date:'2016 Jan 21',who:'aaaa_',label:'direct gematria alternative',url:'http://pastebin.com/uq5nB9Jb'}];
assert.equal(new Set(items.map(x=>x.url)).size,items.length);
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
async function get(url){
 try{
  const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(18000),headers:{'user-agent':'Mozilla/5.0 (static historical source study)'}});
  const b=Buffer.from(await r.arrayBuffer());
  return {status:r.status,final:r.url,type:r.headers.get('content-type'),length:b.length,sha256:digest(b),head:b.toString('utf8').slice(0,4800).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,'?'),tail:b.length>4800?b.toString('utf8').slice(-500):''};
 }catch(e){return {error:String(e)};}
}
async function run(item){
 const endpoint=item.url.startsWith('http://pastebin.com/')?
   'https://pastebin.com/raw/'+item.url.split('/').pop():
   'https://sprunge.us/EiNJ';
 const result=await get(endpoint);
 const data={...item,endpoint,...result};
 console.log('SOURCE '+JSON.stringify(data));
 if(result.error||result.status!==200||/html/i.test(result.type||'')&&/pastebin/i.test(endpoint)){
  const arc='https://archive.org/wayback/available?url='+encodeURIComponent(item.url)+'&timestamp=201601'+(item.date.endsWith('16')?'16':item.date.endsWith('17')?'17':'21');
  const lookup=await get(arc);
  console.log('ARCHIVE '+JSON.stringify({label:item.label,url:arc,
    ...lookup,head:(lookup.head||'').slice(0,800)}));
 }
}
(async()=>{await Promise.all(items.map(run));})().catch(e=>{console.error(e.stack||String(e));process.exitCode=1;});