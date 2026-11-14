"use strict";
/** Source-exact LP2 line-endpoint instruction test. Run: node sims/lp2_source_endpoint_acrostic_gate_sft.cjs */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const chunks=read("resources/lp2-transcription.txt").split("%");
assert.equal(chunks.length,57);
const runeMap=new Map(corpus.runes.map((x,i)=>[x,i]));
const pages=chunks.map((chunk,i)=>({
  page:i<50?i:i+1,
  lines:chunk.split("/").map(line=>[...line]
    .filter(x=>runeMap.has(x)).map(x=>runeMap.get(x))).filter(x=>x.length)
}));
const unknown=pages.filter(p=>p.page<56);
assert.equal(unknown.length,55);
assert.equal(unknown.reduce((s,p)=>s+p.lines.length,0),594);
assert.equal(unknown.reduce((s,p)=>s+p.lines.flat().length,0),12956);
const LET={A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,
  L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
const DI={TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
/** @param {string} w */
function enc(w){let a=[];for(let i=0;i<w.length;i++){
  if(DI[w.slice(i,i+2)]!==undefined){a.push(DI[w.slice(i,i+2)]);i++;}
  else a.push(LET[w[i]]);
}return a;}
const words=read("resources/control/shakespeare_first300k.txt").toUpperCase().match(/[A-Z]+/g);
assert.equal(words.length,55407);
const train=words.slice(0,38000).flatMap(enc);
const held=words.slice(40000).flatMap(enc);
const N=29,alpha=.25,m=Array.from({length:N},()=>Array(N).fill(alpha));
const row=Array(N).fill(N*alpha),margin=Array(N).fill(N*alpha);
for(let i=1;i<train.length;i++){
  const a=train[i-1],b=train[i];m[a][b]++;row[a]++;margin[b]++;
}
const total=margin.reduce((s,v)=>s+v,0);
const w=m.map((r,i)=>r.map((x,j)=>Math.log(x/row[i])-Math.log(margin[j]/total)));
/** @param {number[]} a */
function score(a){let x=0;for(let i=1;i<a.length;i++)x+=w[a[i-1]][a[i]];return x/(a.length-1);}
let state=0x3301f11e;
/** @param {number[]} a */
function shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  const j=(state>>>0)%(i+1);[b[i],b[j]]=[b[j],b[i]];
}return b;}
/** @param {number[]} a */
function summary(a){const mean=a.reduce((s,v)=>s+v,0)/a.length;
  return {mean,sd:Math.sqrt(a.reduce((s,v)=>s+(v-mean)**2,0)/a.length)};}
/** @param {number[]} a */
const spell=a=>a.map(x=>corpus.translit[x]).join("");
const dictionary=new Set(words.filter(s=>enc(s).length>=8).map(s=>enc(s).join(",")));
/** @param {number[]} a */
function matches(a){let hits=0;for(let n=8;n<=14;n++)for(let i=0;i+n<=a.length;i++)
  if(dictionary.has(a.slice(i,i+n).join(",")))hits++;
return hits;}
/** @param {Array<{page:number,lines:number[][]}>} selection */
function run(selection){
  const output={pages:selection.map(x=>x.page),lineCounts:selection.map(x=>x.lines.length),variants:{}};
  for(const side of ["head","tail"]){
    const groups=selection.map(p=>p.lines.map(line=>line[side==="head"?0:line.length-1]));
    for(const reverse of [false,true]){
      const seq=groups.flatMap(a=>reverse?[...a].reverse():a);
      const value=score(seq);
      const nulls=Array.from({length:5000},()=>score(groups.flatMap(a=>
        reverse?shuffle(a).reverse():shuffle(a))));
      const stats=summary(nulls);
      output.variants[side+(reverse?"_reverseWithinPage":"_forward")]={
        runeCount:seq.length,transliteration:spell(seq),literalWordMatches8Plus:matches(seq),
        logLikelihood:value,z:(value-stats.mean)/stats.sd,
        upperP:(1+nulls.filter(v=>v>=value).length)/5001
      };
    }
  }
  return output;
}
const results={
  firstChapter:run(pages.filter(p=>[0,1,2].includes(p.page))),
  terminalChapter:run(pages.filter(p=>[54,55].includes(p.page))),
  solvedTypography:run(pages.filter(p=>[56,57].includes(p.page))),
  wholeUnknown:run(unknown)
};
const positive={};for(const n of [15,33,594]){
  const a=held.slice(0,n),value=score(a);
  const nulls=Array.from({length:5000},()=>score(shuffle(a)));
  const x=summary(nulls);
  positive[n]={z:(value-x.mean)/x.sd,upperP:(1+nulls.filter(v=>v>=value).length)/5001};
  assert.ok(positive[n].z>3);
}
const selected=[...Object.values(results.firstChapter.variants),
  ...Object.values(results.terminalChapter.variants)];
assert.ok(selected.every(x=>x.literalWordMatches8Plus===0));
assert.ok(selected.every(x=>x.upperP>0.02));
console.log(JSON.stringify({
  hypothesis:"literal source line-first/last original rune, forward or reversed inside page",
  scorer:"source-native English GP bigram vs independent unigram; Shakespeare trained first 38000 words",
  permutationsPerVariant:5000,results,positive,
  conclusion:"no original literal English acrostic or newly decoded plaintext"
},null,2));
