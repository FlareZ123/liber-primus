"use strict";
/** Source-exact p56 SHA512 digest as direct p55 GP29 additive key.
 * Windows Node22 SFT: node sims/lp2_p56_digest_into_p55_source_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const trans=read("resources/lp2-transcription.txt");
const section=read("resources/liber-primus/lp1-plaintext-reference.txt").split("### 56")[1].split("### 57")[0];
const digest=(section.slice(section.indexOf("HASHES TO")+9).match(/^[a-f0-9\s]+/i)||[""])[0].replace(/\s/g,"");
assert.match(digest,/^[0-9a-f]{128}$/);
assert.equal(digest.slice(0,16),"36367763ab73783c");
assert.equal(digest.slice(-16),"9fb4f45132c2a8b4");
const bytes=Array.from({length:64},(_,i)=>parseInt(digest.slice(2*i,2*i+2),16));
const nibbles=[...digest].map(v=>parseInt(v,16));
let value=BigInt("0x"+digest);
const base=[];
while(value>0n){base.unshift(Number(value%29n));value/=29n;}
assert.equal(base.length,105);
const keys={bytes,nibbles,base29:base,base29Reverse:[...base].reverse()};
const nativeWords=(trans.split("%")[54].replace(/\/\r?\n/g,"").match(/[\u16A0-\u16FF]+/gu)||[])
  .map(w=>[...w].map(r=>corpus.runes.indexOf(r)));
assert.deepEqual(nativeWords.map(w=>w.length),
 [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
const cipher=nativeWords.flat();
assert.deepEqual(cipher,corpus.pages[55].indices);
const mod=x=>(x%29+29)%29;
const tokens=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function encodeEnglish(text){
  const str=text.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S");
  const result=[];
  for(let i=0;i<str.length;){
    const item=tokens.find(x=>str.startsWith(x.t,i));
    if(!item)return null;
    result.push(item.i);i+=item.t.length;
  }
  return result;
}
const dict=new Map(),byLength=new Map();
for(const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)){
  const item=line.match(/^([a-zA-Z]+) (\d+)$/);
  if(!item)continue;
  const gp=encodeEnglish(item[1]);
  if(gp===null)continue;
  const key=gp.join(","),freq=Number(item[2]);
  dict.set(key,(dict.get(key)||0)+freq);
  const best=byLength.get(gp.length);
  if(!best||freq>best.freq)byLength.set(gp.length,{gp,freq});
}
assert.equal(dict.size,29060);
function wordHits(plain){
  let offset=0;
  return nativeWords.map(w=>{
    const segment=plain.slice(offset,offset+w.length);
    offset+=w.length;
    return {length:w.length,found:dict.has(segment.join(","))};
  }).slice(1);
}
function ioc(seq){
  const hist=Array(29).fill(0);
  for(const x of seq)hist[x]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)/(seq.length*(seq.length-1));
}
const original=[];
for(const [register,key] of Object.entries(keys))for(const sign of [-1,1]){
  const plain=cipher.map((v,i)=>mod(v+sign*key[i%key.length]));
  const hits=wordHits(plain);
  const matches=hits.filter(x=>x.found).length;
  const long=hits.filter(x=>x.found&&x.length>=4).length;
  original.push({register,sign,wordHits:matches,longWordHits:long,ioc:ioc(plain)});
  assert.deepEqual(plain.map((v,i)=>mod(v-sign*key[i%key.length])),cipher);
}
assert.deepEqual(original.map(x=>x.wordHits),[1,1,2,0,2,2,1,0]);
assert.ok(original.every(x=>x.longWordHits===0));
assert.equal(Math.max(...original.map(x=>x.ioc)),0.045263157894736845);
const plainPlant=nativeWords.flatMap(w=>byLength.get(w.length).gp);
assert.equal(plainPlant.length,76);
assert.equal(wordHits(plainPlant).filter(w=>w.found).length,16);
let validated=0;
for(const key of Object.values(keys))for(const sign of [-1,1]){
  const c=plainPlant.map((p,i)=>mod(p-sign*key[i%key.length]));
  const recovered=c.map((v,i)=>mod(v+sign*key[i%key.length]));
  assert.deepEqual(recovered,plainPlant);
  assert.equal(wordHits(recovered).filter(w=>w.found).length,16);
  validated++;
}
assert.equal(validated,8);
console.log(JSON.stringify({
  originalSource:{runes:76,completeWords:16,hexDigits:128,
    keyRegisters:Object.keys(keys),base29Digits:base.length,gpForms:dict.size},
  original,positive:{models:8,recoveredRunes:76,recoveredEnglishWords:16},
  conclusion:"No original GP29 English plaintext under direct p56 digest key"
},null,2));
