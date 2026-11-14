'use strict';
/** Source-authenticated alternate/later Freenode witness finder; Node22 CJS. */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const pins={
 '#ARG.freenode.log':{n:30137139,sha:'578930b61bf8f0ac9df5b4ba7fcb82edc16e7876'},
 '#cicadasolvers.freenode.2.log':{n:27234234,sha:'72634a9d071d32af767edbffc0493d810e88cd0d'}
};
/** @param {Buffer} b */
function gitsha(b){return crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');}
/** @param {string} filename */
function load(filename){
 const name=path.basename(filename),pin=pins[name];assert(pin,'unexpected archive');
 const bytes=fs.readFileSync(filename);
 assert.equal(bytes.length,pin.n,name+' length');
 assert.equal(gitsha(bytes),pin.sha,name+' SHA1');
 const lines=bytes.toString('latin1').split(/\r?\n/),messages=[];
 const years={},months={};
 for(let i=0;i<lines.length;i++){
  const s=lines[i],m=s.match(/^(201[456]) ([A-Z][a-z]{2}) \d\d \d\d:\d\d (.*)$/);
  if(!m)continue;
  const key=m[1]+'-'+m[2];years[m[1]]=(years[m[1]]||0)+1;months[key]=(months[key]||0)+1;
  const msg=m[3].match(/^<([^>]+)> ?(.*)$/);
  if(msg)messages.push({line:i+1,date:s.slice(0,17),nick:msg[1],body:msg[2]});
 }
 console.log('PIN '+JSON.stringify({name,sha:pin.sha,bytes:pin.n,rawLines:lines.length,msgs:messages.length,years,months}));
 return messages;
}
const pages=/\b(?:liber\s*primus|lp2|page\s*#?\s*(?:0?[0-9]|[1-4]\d|5[0-5])\b|p\s*(?:0?[0-9]|[1-4]\d|5[0-5])\b|runes?|runic|manuscript|onion\s*(?:pages?|book))\b/i;
const op=/\b(?:decryp(?:t|ted|tion|ting)|decipher(?:ed)?|plaintext|solv(?:ed|e)|key(?:word)?|cipher|cryptanalysis|inverse|vigenere|totient|prime|read|translate(?:d)?)\b/i;
const stronger=/\b(?:i|we|my|our|found|decoded|solved|solv|translated|worked|plaintext|solution)\b/i;
/** @param {any[]} entries @param {string} name */
function scan(entries,name){
 
// Direct original-page breakthrough language, independent of chosen topics.
 const decisive=entries.filter(e=>e.date.startsWith('2016 ')&&
  /(?:(?:i|we|my code|someone)\s+(?:just\s+|have\s+|already\s+|finally\s+|managed to\s+)?(?:solved|decoded|decrypted|deciphered|translated|found the key for|figured out the cipher for)|(?:plaintext|cleartext)\s+(?:is|reads|says)|(?:page\s*[0-9]{1,2}|LP2).{0,60}(?:reads|says|is decoded))/i.test(e.body) &&
  /\b(?:page|p\s*[0-9]|runes?|liber|manuscript|cipher|key)\b/i.test(e.body));
 const bins=new Map();
 for(const e of decisive){
  const key=e.date.slice(0,8);
  const v=bins.get(key)||[];v.push(e);bins.set(key,v);
 }
 console.log(name+'-DIRECT-CLAIMS '+JSON.stringify([...bins].map(([month,a])=>({month,n:a.length}))));
 for(const [month,a] of bins){
  for(const e of a.slice(0,30))console.log(name+'-DIRECT-2016 '+JSON.stringify(e));
 }

 const hits=[];
 for(let i=0;i<entries.length;i++){
  const e=entries[i],same=pages.test(e.body)&&op.test(e.body);
  const near=pages.test(e.body)&&entries.slice(Math.max(0,i-2),i+3).some(x=>
    x.date.slice(0,11)===e.date.slice(0,11)&&op.test(x.body));
  if(!same&&!near)continue;
  hits.push({e,i,score:10*Number(same)+Number(stronger.test(e.body))});
 }
 console.log(name+'-CANDIDATE-COUNTS '+JSON.stringify({sameOrNearby:hits.length,exact:hits.filter(x=>x.score>=10).length}));

// Fixed source-line windows from first-pass original 2016 dated signal screen.
 const frozenOriginalLines=[267324,269444,270854,270865,273768,248923,209988];
 for(const sourceLine of frozenOriginalLines){
  const i=entries.findIndex(e=>e.line===sourceLine);
  if(i<0)continue;
  const chosen=entries.slice(Math.max(0,i-23),i+27);
  console.log(name+'-FROZEN-2016-CONTEXT '+JSON.stringify({sourceLine,entries:chosen}));
 }

 const dedup=[],daily=new Map();
 for(const x of hits.sort((a,b)=>b.score-a.score||a.e.line-b.e.line)){
  const day=x.e.date.slice(0,11);
  if((daily.get(day)||0)>=3)continue;
  if(dedup.some(y=>Math.abs(y.e.line-x.e.line)<=6))continue;
  dedup.push(x);daily.set(day,(daily.get(day)||0)+1);
  if(dedup.length>=80)break;
 }
 for(const x of dedup)console.log(name+'-CANDIDATE '+JSON.stringify({
  sourceLine:x.e.line,seed:x.e,context:entries.slice(Math.max(0,x.i-3),x.i+4)
 }));
 // Separate 2016 original evidence from abundant early 2014 hypotheses.
 const late=hits.filter(x=>x.e.date.startsWith('2016 ')).sort((a,b)=>b.score-a.score||a.e.line-b.e.line);
 const mid=hits.filter(x=>x.e.date.startsWith('2015 ')).sort((a,b)=>b.score-a.score||a.e.line-b.e.line);
 for(const [bucket,arr,cap] of [['2015',mid,32],['2016',late,90]]){
  const chosen=[],used=new Map();
  for(const x of arr){
   const day=x.e.date.slice(0,11);
   if((used.get(day)||0)>=4)continue;
   if(chosen.some(y=>Math.abs(x.e.line-y.e.line)<=5))continue;
   chosen.push(x);used.set(day,(used.get(day)||0)+1);
   if(chosen.length>=cap)break;
  }
  console.log(name+'-YEAR-COUNTS '+JSON.stringify({year:bucket,total:arr.length,printed:chosen.length}));
  for(const x of chosen)console.log(name+'-'+bucket+'-WITNESS '+JSON.stringify({
   sourceLine:x.e.line,seed:x.e,
   context:entries.slice(Math.max(0,x.i-2),x.i+3)
  }));
 }

}
function main(){
 assert.equal(gitsha(Buffer.from('test')),'30d74d258442c7c65512eafab474568dd706c430');
 if(process.argv[2]==='--selftest'){
  assert(pages.test('page 44'));assert(!pages.test('page 56'));assert(op.test('decrypted'));
  console.log('PASS planted witness parser');return;
 }
 assert.equal(process.argv.length,4);
 for(let i=0;i<2;i++){const messages=load(process.argv[i+2]);scan(messages,Object.keys(pins)[i]);}
}
main();
