'use strict';
/** Source-pinned four-snapshot historical Titanpad semantic audit. Node22 SFT.
 * Never treat participant opinions as author-authenticated plaintext.
 */
const crypto=require('node:crypto');
const timestamps=['20160412033034','20160412061415','20160412063658','20160702002913'];
const original='https://titanpad.com/vFCy7T5p0O';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const solve=/\b(?:decrypt|encrypt|decoded|translate|translation|cipher|plain\s*text|key|password|vigen[eè]re|atbash|totient|prime|shift|method|algorithm|solution|solved|found|hash|onion|outguess|mod\s*29|base\s*29|pattern|rule|crib|stego)\b/i;
const page=/\b(?:p(?:age)?\s*(?:[0-9]|[1-4][0-9]|5[0-5])\b|[0-5][0-9]\.jpg|beginning)\b/i;
const print=obj=>console.log(JSON.stringify(obj));
function padText(body){
 const m=body.match(/"initialAttributedText"\s*:\s*\{\s*"text"\s*:\s*("(?:\\.|[^"\\])*")/s);
 if(!m)throw Error('Missing period original initialAttributedText');
 return JSON.parse(m[1]).replace(/\r\n?/g,'\n');
}
function chats(body){
 return [...body.matchAll(/\{"time":\d{13},"userId":"[^"]+","lineText":"(?:\\.|[^"\\])*"\}/g)]
 .map(x=>JSON.parse(x[0])).sort((a,b)=>a.time-b.time);
}
async function acquire(ts){
 const url='https://web.archive.org/web/'+ts+'id_/'+original;
 let last;
 for(let i=0;i<3;i++)try{
  const r=await fetch(url,{signal:AbortSignal.timeout(28000),
   headers:{'user-agent':'Cicada-source-dated-pad-semantics/1.0'}});
  if(r.status!==200)throw Error('HTTP '+r.status);
  const body=await r.text();const text=padText(body);
  return {ts,url,bodyBytes:Buffer.byteLength(body),bodySha256:sha(body),
   text,textSha256:sha(text),chat:chats(body)};
 }catch(e){last=e}
 throw Error(ts+': '+last);
}
function changeWindow(a,b){
 let head=0,tail=0;
 while(head<Math.min(a.length,b.length)&&a[head]===b[head])head++;
 while(tail<Math.min(a.length,b.length)-head&&a[a.length-tail-1]===b[b.length-tail-1])tail++;
 return {firstDifferentCodepoint:head,commonSuffixCodepoints:tail,
  oldChangedLength:a.length-head-tail,newChangedLength:b.length-head-tail,
  oldChangedExcerpt:a.slice(Math.max(0,head-150),Math.min(a.length,a.length-tail+150)).slice(0,3500),
  newChangedExcerpt:b.slice(Math.max(0,head-150),Math.min(b.length,b.length-tail+150)).slice(0,3500)};
}
function relevantLines(text){
 return text.split('\n').flatMap((line,i)=>{
  const cleaned=line.trim();if(cleaned.length>1200)return [];
  if(solve.test(cleaned)&&(page.test(cleaned)||/^(?:\/\/|#|\*|note|question|hint|possible|anyone|could|believe)/i.test(cleaned)))
   return [{line:i+1,text:cleaned.slice(0,550)}];
  return [];
 }).slice(0,140);
}
(async()=>{
 const a=[];
 for(const ts of timestamps){
  const v=await acquire(ts);a.push(v);
  print({kind:'snapshot',timestamp:ts,archiveUrl:v.url,bodyBytes:v.bodyBytes,
   bodySha256:v.bodySha256,padTextCharacters:v.text.length,padTextSha256:v.textSha256,
   padLineCount:v.text.split('\n').length,chatCount:v.chat.length,
   chatFirst:v.chat.length?new Date(v.chat[0].time).toISOString():null,
   chatLast:v.chat.length?new Date(v.chat[v.chat.length-1].time).toISOString():null});
 }
 const april=a[0],july=a[3];
 for(const v of a.slice(1))print({kind:'comparison',from:april.ts,to:v.ts,
  sameText:april.text===v.text,sameChat:JSON.stringify(april.chat)===JSON.stringify(v.chat),
  ...changeWindow(april.text,v.text)});
 const oldlines=new Set(april.text.split('\n').map(x=>x.trim()));
 const newlines=new Set(july.text.split('\n').map(x=>x.trim()));
 const added=july.text.split('\n').flatMap((line,i)=>!oldlines.has(line.trim())&&line.trim()?[{line:i+1,text:line.slice(0,850)}]:[]);
 const removed=april.text.split('\n').flatMap((line,i)=>!newlines.has(line.trim())&&line.trim()?[{line:i+1,text:line.slice(0,850)}]:[]);
 print({kind:'pad-changed-lines',addedCount:added.length,removedCount:removed.length,added:added.slice(0,160),removed:removed.slice(0,160)});
 for(const v of [april,july]){
  print({kind:'pad-cryptanalytic-lines',ts:v.ts,lines:relevantLines(v.text)});
  print({kind:'chat-entries',ts:v.ts,entries:v.chat.map(x=>({timestamp:new Date(x.time).toISOString(),message:x.lineText.slice(0,2000)}))});
 }
 print({kind:'audit-conclusion',aprilSameAcrossThree:a.slice(1,3).every(x=>x.textSha256===april.textSha256),
  uniquePadTextDigests:[...new Set(a.map(x=>x.textSha256))].length});
})().catch(e=>{console.error(String(e.stack??e));process.exitCode=1});
