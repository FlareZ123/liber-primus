"use strict";

// Original-cipher source-gated M7 pole-sidecar/word-seed totient test.
// Execute from repository root with Node 22:
// node sims/p50_m7_pole_word_seed_phi_sft.cjs
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {parseSharedCorpus}=require("./lp2_word_pages.cjs");
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const ink=read("resources/liber-primus/lp2-ink-annotations.json");
const grid=read("resources/liber-primus/lp2-grid-256.json");
const control=fs.readFileSync("resources/control/gibran_prophet_58585.txt","utf8");
const all=corpus.pages.flatMap(p=>p.indices);
const byRune=new Map(corpus.runes.map((r,i)=>[r,i]));
const wordArrays=parseSharedCorpus().words.map(w=>[...w.runes].map(r=>byRune.get(r)));
assert.equal(wordArrays.length,2896);
assert.equal(wordArrays.flat().length,12956);

let start=0;
const pageStarts=new Map();
for(const p of corpus.pages){pageStarts.set(p.page,start);start+=p.indices.length;}
assert.equal(start,13136);
const marks=[];
for(const p of ink.pages) for(const mark of p.large_punctuation||[]){
  if(mark[1]===13)marks.push(pageStarts.get(p.page)+mark[0]);
}
marks.sort((a,b)=>a-b);
assert.equal(marks.length,31);
const bounds=[0,...marks,all.length];
const fragments=bounds.slice(0,-1).map((start,i)=>({
  id:i+1,start,end:bounds[i+1],seq:all.slice(start,bounds[i+1])
}));
assert.deepEqual(fragments.filter(f=>f.seq.length===0).map(f=>f.id),[9,12]);

const ranked=fragments.filter(f=>f.seq.length>0).map(f=>({
  ...f,byte:grid.bytes[(f.id-1)*8+1]
})).sort((a,b)=>a.byte-b.byte);
assert.equal(new Set(ranked.map(f=>f.byte)).size,30);
const mod=n=>((n%29)+29)%29;
const inverse=n=>{for(let i=1;i<29;i++)if(mod(n*i)===1)return i;throw Error("no inverse");};
const m7=x=>x===29?mod(14*inverse(25)):(mod(25*x+28)===0
  ?29:mod((14*x+25)*inverse(mod(25*x+28))));
let rank=7;const poleRanks=[];
for(let i=0;i<7;i++){poleRanks.push(rank);rank=m7(rank);}
assert.deepEqual(poleRanks,[7,29,11,16,10,8,2]);
const pole=poleRanks.map(r=>ranked[r]);
assert.deepEqual(pole.map(f=>f.id),[6,2,23,24,18,5,29]);
const sidecarPositions=new Set();
for(const f of pole)for(let p=f.start;p<f.end;p++)sidecarPositions.add(p);
assert.equal(sidecarPositions.size,2896);
const sidecarOriginalCount=Array.from(sidecarPositions).filter(p=>p<12956).length;
assert.equal(sidecarOriginalCount,2891);
const orders=[
  ["M7 pole traversal",pole],
  ["Chronological fragment order",pole.slice().sort((a,b)=>a.id-b.id)],
].map(([name,frags])=>({name,keys:frags.flatMap(f=>f.seq)}));
assert(orders.every(x=>x.keys.length===2896));

const prime=[];
for(let n=2;prime.length<80;n++){
  let isPrime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){isPrime=false;break;}
  if(isPrime)prime.push(n);
}
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const native=[];
for(let word of control.toUpperCase().match(/[A-Z]+/g)||[]){
  word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C")
    .replace(/Z/g,"S").replace(/ING/g,"NG");
  for(let j=0;j<word.length;){
    const t=tokens.find(x=>word.startsWith(x.s,j));
    assert(t, "unsupported reference source letter");
    native.push(t.i);
    j+=t.s.length;
  }
}
assert(native.length>=40000);
const counts=new Map();
for(let i=2;i<40000;i++){
  const k=native[i-2]*841+native[i-1]*29+native[i];
  counts.set(k,(counts.get(k)||0)+1);
}
const denominator=39998+0.1*29**3;
/** @param {number[]} a @returns {number} */
function trigram(a){
  let sum=0;
  for(let i=2;i<a.length;i++){
    const k=a[i-2]*841+a[i-1]*29+a[i];
    sum+=Math.log(((counts.get(k)||0)+0.1)/denominator);
  }
  return sum/(a.length-2);
}
/** @param {number} seed @param {number} j @param {string} mode @returns {number} */
function shift(seed,j,mode){
  return mode==="prime-index" ? prime[seed+j]-1 : prime[j]-1+seed;
}
/**
 * Decode original unknown-page payload with a transparent 2,896-rune sidecar.
 * Sidecar positions remain unchanged, making this a fully reversible mapping
 * with a reproducible forward encryption given the same sidecar.
 * @param {number[][]} sourceWords @param {number[]} keys @param {string} mode
 * @param {boolean} encrypt @returns {number[]}
 */
function transform(sourceWords,keys,mode,encrypt){
  const payload=[];
  let global=0;
  for(let i=0;i<sourceWords.length;i++){
    for(let j=0;j<sourceWords[i].length;j++){
      if(!sidecarPositions.has(global)){
        payload.push(mod(sourceWords[i][j]+(encrypt?1:-1)*shift(keys[i],j,mode)));
      }
      global++;
    }
  }
  assert.equal(global,12956);
  return payload;
}
const rawPayload=all.slice(0,12956).filter((_,i)=>!sidecarPositions.has(i));
assert.equal(rawPayload.length,10065);
const results=[];
for(const {name,keys} of orders){
  for(const mode of ["prime-index","phi-plus-seed"]){
    const decoded=transform(wordArrays,keys,mode,false);
    results.push({name,mode,trigram:trigram(decoded),
      prefix:decoded.slice(0,60).map(x=>corpus.translit[x]).join("")});
  }
}
const expected=[-12.296048056208727,-12.291434828012461,
  -12.281303069927464,-12.301416679929186];
results.forEach((r,i)=>assert(Math.abs(r.trigram-expected[i])<1e-8));
const rawScore=trigram(rawPayload);
assert(Math.abs(rawScore+12.265435696825822)<1e-8);

// Forward plant: the original runic sidecar is genuinely unchanged. Encode
// 10,065 source-native GP runes into the complementary original positions;
// re-derive sidecar from the planted full ciphertext and recover all payload.
const heldoutNative=native.slice(-rawPayload.length);
assert.equal(heldoutNative.length,rawPayload.length);
const {keys:plantKeys}=orders[0];
const mode="prime-index";
const plantFull=all.slice(0,12956);
let offset=0, payloadPos=0;
for(let i=0;i<wordArrays.length;i++)for(let j=0;j<wordArrays[i].length;j++){
  if(!sidecarPositions.has(offset)){
    plantFull[offset]=mod(heldoutNative[payloadPos]+shift(plantKeys[i],j,mode));
    payloadPos++;
  }
  offset++;
}
assert.equal(payloadPos,rawPayload.length);
for(const position of sidecarPositions){
  if(position<12956)assert.equal(plantFull[position],all[position]);
}
const positiveWords=[];offset=0;
for(const word of wordArrays){
  positiveWords.push(plantFull.slice(offset,offset+word.length));
  offset+=word.length;
}
const recovered=transform(positiveWords,plantKeys,mode,false);
assert.deepEqual(recovered,heldoutNative);
const positiveScore=trigram(recovered);
assert(positiveScore>rawScore+2);

console.log(JSON.stringify({
  sourceLink:"P32 M7 -> P50 unique column -> 7-fragment pole orbit -> 2896-word sidecar",
  poleRanks,poleFragmentIds:pole.map(f=>f.id),
  sidecarTotal:2896,sidecarUnknown:sidecarOriginalCount,
  payloadUnknown:rawPayload.length,originalPayloadTrigram:rawScore,
  results,plantedPayloadRunes:recovered.length,
  plantedExactRecovery:true,plantedNativeTrigram:positiveScore,
  conclusion:"Four source-anchored reversible sidecar/word-totient candidates fail to recover source-native prose"
},null,2));
