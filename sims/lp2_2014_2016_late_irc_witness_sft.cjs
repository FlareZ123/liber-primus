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
 const hits=[];
 for(let i=0;i<entries.length;i++){
  const e=entries[i],same=pages.test(e.body)&&op.test(e.body);
  const near=pages.test(e.body)&&entries.slice(Math.max(0,i-2),i+3).some(x=>
    x.date.slice(0,11)===e.date.slice(0,11)&&op.test(x.body));
  if(!same&&!near)continue;
  hits.push({e,i,score:10*Number(same)+Number(stronger.test(e.body))});
 }
 console.log(name+'-CANDIDATE-COUNTS '+JSON.stringify({sameOrNearby:hits.length,exact:hits.filter(x=>x.score>=10).length}));
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
