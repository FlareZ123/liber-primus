"use strict";
/**
 * Original LP2 one-back five-phase marker gate, Windows Node22/CommonJS SFT.
 * Run node sims/lp2_wordphase_predecessor_marker_heldout_sft.cjs
 * Native-English GP29 markers may depend on printed-word offset mod5.
 * Each marker copies the preceding ciphertext rune; all 28 other inputs
 * map bijectively to the other 28 outputs using independent secret keys.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const rmap = new Map(corpus.runes.map((x,i) => [x,i]));
const pages = corpus.pages.filter(p => p.page <= 55);
const original = pages.flatMap(p => p.indices);
const pageAt = pages.flatMap(p => Array(p.indices.length).fill(p.page));
const words = (read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0,55).join("%")
  .replace(/\/\r?\n/g,"").replace(/[\r\n%]/g,"")
  .match(new RegExp("["+corpus.runes.join("")+"]+","gu")) || [])
  .map(w => Array.from(w, c => rmap.get(c)));
const places = words.flatMap(w =>
  w.map((_,i) => ({len:w.length,pos:i,phase:i%5})));
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
assert.equal(original.length, 12956);
const tokens = corpus.translit.map((s,i) => ({s,i}))
  .concat([{s:"ING",i:21},{s:"IO",i:27}])
  .sort((a,b) => b.s.length-a.s.length);
/** @param {string} w @returns {number[]} */
function gp(w) {
  const x=w.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  const out=[];
  for(let i=0;i<x.length;) {
    const token=tokens.find(t => x.startsWith(t.s,i));
    assert(token, "missing GP rune");
    out.push(token.i); i+=token.s.length;
  }
  return out;
}
assert.deepEqual(gp("FOLLOWING"),[0,3,20,20,3,7,21]);
assert.deepEqual(gp("FUNCTION"),[0,1,9,5,16,27,9]);
const models=Array.from({length:15},(_,n) => ({
  count:0, frequency:Array.from({length:n},()=>new Uint32Array(29)),
  examples:[]
}));
for(const file of [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"
]) {
  for(const w of read(file).match(/[A-Za-z]+/g)||[]) {
    const v=gp(w);
    if(!v.length||v.length>=models.length)continue;
    const m=models[v.length];
    m.count++;m.examples.push(v);
    v.forEach((x,j) => m.frequency[j][x]++);
  }
}
assert.deepEqual(models.map(x=>x.count),
  [0,6012,36497,33891,24665,15052,11513,8235,5725,3760,2055,953,465,168,57]);
/** @param {number} i @param {number} marker */
function prob(i,marker) {
  const p=places[i],m=models[p.len];
  return (m.frequency[p.pos][marker]+0.5)/(m.count+14.5);
}
const sites=[];
for(let i=1;i<original.length;i++) {
  if(pageAt[i]===pageAt[i-1])sites.push({
    i,page:pageAt[i],phase:places[i].phase,
    event:Number(original[i]===original[i-1])
  });
}
const count=x=>x.reduce((s,z)=>s+z.event,0);
const train=sites.filter(s=>s.page<40),held=sites.filter(s=>s.page>=40);
assert.deepEqual([sites.length,count(sites),train.length,count(train),
  held.length,count(held)],[12901,86,9600,65,3301,21]);
/** @param {typeof sites} x @param {number[]} markers */
function ll(x,markers) {
  return x.reduce((s,z)=>{
    const p=prob(z.i,markers[z.phase]);
    return s+(z.event?Math.log(p):Math.log1p(-p));
  },0);
}
const markers=[];
const phases=[];
for(let phase=0;phase<5;phase++){
  const sample=train.filter(s=>s.phase===phase);
  const fits=Array.from({length:29},(_,k)=>({
    k,score:ll(sample,Array(5).fill(k))
  })).sort((a,b)=>b.score-a.score);
  markers.push(fits[0].k);
  phases.push({phase,marker:corpus.translit[fits[0].k],
    sites:sample.length,events:count(sample),ll:fits[0].score});
}
const single=Array.from({length:29},(_,k)=>({
  k,score:ll(train,Array(5).fill(k))
})).sort((a,b)=>b.score-a.score)[0].k;
const rate=count(train)/train.length;
const baseline=x=>x.reduce((s,z)=>s+(z.event?Math.log(rate):Math.log1p(-rate)),0);
const score={fiveTrain:ll(train,markers),fiveHeld:ll(held,markers),
  oneTrain:ll(train,Array(5).fill(single)),
  oneHeld:ll(held,Array(5).fill(single)),
  stationaryTrain:baseline(train),stationaryHeld:baseline(held)};
assert.deepEqual(markers,[6,21,7,21,7]);
assert.equal(single,6);
for(const [k,v] of Object.entries({
  fiveTrain:-417.1120411114206,fiveHeld:-141.92704546471572,
  oneHeld:-156.7083600499182,stationaryHeld:-127.18161216098167
})) assert(Math.abs(score[k]-v)<1e-7,k);
/** @param {number[]} p @param {number[]} m */
function encrypt(p,m) {
  const c=[];
  for(let i=0;i<p.length;i++){
    if(!i||pageAt[i]!==pageAt[i-1]){c.push(p[i]);continue;}
    const prev=c[i-1],marker=m[places[i].phase];
    if(p[i]===marker){c.push(prev);continue;}
    const rank=p[i]-Number(p[i]>marker),key=(17*i+11*pageAt[i]+3)%28;
    const shifted=(rank+key)%28;
    c.push(shifted+Number(shifted>=prev));
  }
  return c;
}
/** @param {number[]} c @param {number[]} m */
function decrypt(c,m) {
  const p=[];
  for(let i=0;i<c.length;i++){
    if(!i||pageAt[i]!==pageAt[i-1]){p.push(c[i]);continue;}
    const prev=c[i-1],marker=m[places[i].phase];
    if(c[i]===prev){p.push(marker);continue;}
    const rank=c[i]-Number(c[i]>prev),key=(17*i+11*pageAt[i]+3)%28;
    const plainRank=(rank-key+28)%28;
    p.push(plainRank+Number(plainRank>=marker));
  }
  return p;
}
const plant=words.flatMap((w,i)=>{
  const options=models[w.length].examples;
  return options[(17*i+5)%options.length];
});
assert.equal(plant.length,original.length);
for(const m of [markers,[0,18,6,21,28]]) {
  const cipher=encrypt(plant,m);
  assert.deepEqual(decrypt(cipher,m),plant);
  for(const s of sites)assert.equal(
    Number(cipher[s.i]===cipher[s.i-1]),
    Number(plant[s.i]===m[s.phase]));
  assert.deepEqual(encrypt(decrypt(original,m),m),original);
}
const byPage=new Map();
for(const z of held){
  if(!byPage.has(z.page))byPage.set(z.page,[]);
  const p=prob(z.i,markers[z.phase]);
  byPage.get(z.page).push({
    event:z.event,odds:Math.log(p)-Math.log1p(-p)
  });
}
const empty=held.reduce((s,z)=>s+Math.log1p(-prob(z.i,markers[z.phase])),0);
let seed=0x53335013;
function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
let sum=0,sumSq=0,above=0;
const N=20000;
for(let trial=0;trial<N;trial++){
  let value=empty;
  for(const row of byPage.values()){
    const order=Array.from({length:row.length},(_,i)=>i);
    const events=count(row);
    for(let j=0;j<events;j++){
      const r=j+rand()%(order.length-j);
      [order[j],order[r]]=[order[r],order[j]];
      value+=row[order[j]].odds;
    }
  }
  sum+=value;sumSq+=value*value;
  if(value>=score.fiveHeld)above++;
}
assert.equal(above,2513);
const mean=sum/N,sd=Math.sqrt(sumSq/N-mean*mean);
assert(Math.abs(mean+149.25977187292295)<1e-7);
const predicted=held.reduce((s,z)=>s+prob(z.i,markers[z.phase]),0);
console.log(JSON.stringify({
  verdict:"five-phase marker not predictive of untouched original LP2",
  newUnknownPlaintextRunes:0,
  original:{runes:original.length,words:words.length,
    sites:sites.length,repeatEvents:count(sites)},
  training:{pages:"0-39",sites:train.length,events:count(train),phases,
    oneMarker:corpus.translit[single]},
  heldout:{pages:"40-55",sites:held.length,events:count(held),
    predictedEvents:predicted,logLikelihood:score},
  pageCountPreservingNull:{reps:N,seed:"0x53335013",
    mean,sd,atOrAbove:above,upperTail:(above+1)/(N+1)},
  proofOfInvertibility:{sourceNativeGpPlant:plant.length,
    markerVectors:2,wrongKeyOriginalReencrypt:original.length},
  limitation:"Only fixed GP29 word-phase sentinels and source-native English with original printed word boundaries."
},null,2));
