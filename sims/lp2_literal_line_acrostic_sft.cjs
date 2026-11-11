"use strict";
/**
 * Original LP2 printed-line acrostic gate. Source order, GP29, nine
 * image-delimited units, first/last rune and complete first/last word.
 * SFT: node sims/lp2_literal_line_acrostic_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p */
const load=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const raw=load("resources/lp2-transcription.txt");
const pages=raw.split("%").slice(0,55);
const RE=/[\u16A0-\u16FF]/u;
const runeMap=new Map(gp.runes.map((c,i)=>[c,i]));
const limits=[0,729,1874,3612,5506,6527,7960,8051,9640,12956];
const lines=[], words=[];
let runePos=0;
/** @param {number[]} vals */
const translit=vals=>vals.map(x=>gp.translit[x]).join("");
for(let page=0;page<pages.length;page++)for(const part of pages[page].split("/")){
  const vals=[...part].filter(c=>RE.test(c)).map(c=>runeMap.get(c));
  if(!vals.length)continue;
  assert(vals.every(v=>Number.isInteger(v)));
  lines.push({page,start:runePos,end:runePos+vals.length,vals});
  runePos+=vals.length;
}
assert.equal(runePos,12956);
assert.equal(lines.length,594);
assert.deepEqual(lines.map(l=>l.vals).flat(),
  gp.pages.filter(p=>p.page<=55&&p.indices.length).flatMap(p=>p.indices));
{
  let current=[],start=0,seen=0,at=0;
  const finish=()=>{
    if(!current.length)return;
    words.push({start,end:at,vals:current});
    current=[];
  };
  for(const c of pages.join("%")){
    if(RE.test(c)){
      if(!current.length)start=at;
      current.push(runeMap.get(c));at++;
    }else if(c==="%"||c==="/"||/\s/u.test(c)){}
    else finish();
  }
  finish();
  assert.equal(at,12956);
}
assert.equal(words.length,2896);
const units=Array.from({length:9},(_,u)=>{
  const group=lines.filter(l=>l.start>=limits[u]&&l.end<=limits[u+1]);
  assert(group.length>0);
  return group;
});
assert.deepEqual(units.map(g=>g.length),[33,55,80,85,46,65,5,75,150]);
for(let u=0;u<9;u++)assert.equal(units[u].reduce((s,l)=>s+l.vals.length,0),
  limits[u+1]-limits[u]);

/** @param {typeof lines} group */
function readout(group){
  const first=group.map(l=>l.vals[0]);
  const last=group.map(l=>l.vals.at(-1));
  const firstWords=[],lastWords=[];
  for(const line of group){
    const full=words.filter(w=>w.start>=line.start&&w.end<=line.end);
    firstWords.push(full.length?translit(full[0].vals):"");
    lastWords.push(full.length?translit(full.at(-1).vals):"");
  }
  return {first,last,firstWords,lastWords};
}
const native=raw.split("%").slice(55,57).map((page,i)=>{
  const pieces=page.split("/").map(part=>
    [...part].filter(c=>RE.test(c)).map(c=>runeMap.get(c))).filter(x=>x.length);
  return {physicalPage:i+56,length:pieces.reduce((s,a)=>s+a.length,0),
    lines:pieces.length,
    first:translit(pieces.map(a=>a[0])),
    last:translit(pieces.map(a=>a.at(-1)))};
});
assert.deepEqual(native.map(p=>[p.length,p.lines]),[[85,5],[95,5]]);
assert.deepEqual(native.map(p=>[p.first,p.last]),
  [["AEOPCNG","XTAEUS"],["PUWIE","TECTHE"]]);

/** @param {string} text */
function encode(text){
  const dict=new Map(gp.translit.map((v,i)=>[v,i]));
  const clean=text.toUpperCase().replace(/[KVQZ]/gu,
    ch=>({K:"C",V:"U",Q:"C",Z:"S"})[ch]).replace(/[^A-Z]/gu,"");
  const out=[];
  for(let i=0;i<clean.length;i++){
    const digraph=clean.slice(i,i+2);
    if(dict.has(digraph)){out.push(dict.get(digraph));i++;}
    else out.push(dict.get(clean[i]));
  }
  assert(out.every(v=>Number.isInteger(v)));
  return out;
}
const control=encode(load("resources/control/shakespeare_first300k.txt"));
assert(control.length>180594);
const train=control.slice(0,180000),counts=new Map();
for(let i=2;i<train.length;i++){
  const k=train[i-2]*841+train[i-1]*29+train[i];
  counts.set(k,(counts.get(k)||0)+1);
}
const denominator=train.length-2+0.1*29**3;
/** @param {number[]} vals */
function languageScore(vals){
  if(vals.length<3)return -Infinity;
  let score=0;
  for(let i=2;i<vals.length;i++){
    const k=vals[i-2]*841+vals[i-1]*29+vals[i];
    score+=Math.log(((counts.get(k)||0)+0.1)/denominator);
  }
  return score/(vals.length-2);
}
const frozen=units.map(readout);
const global=readout(lines);
const slots=[
  {name:"all:first",vals:global.first},
  {name:"all:last",vals:global.last},
  ...frozen.flatMap((r,u)=>[
    {name:"unit"+u+":first",vals:r.first},
    {name:"unit"+u+":last",vals:r.last}
  ])
];
const observed=slots.map(s=>({...s,score:languageScore(s.vals)}));
/** @param {number} seed */
function rng(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
const next=rng(0x3362016);
/** @template T @param {T[]} xs @returns {T[]} */
function shuffle(xs){
  const a=xs.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(next()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
const nulls=Array.from({length:slots.length},()=>[]);
const reps=1024;
for(let rep=0;rep<reps;rep++){
  const randomized=units.map(shuffle);
  const all=readout(randomized.flat());
  const streams=[all.first,all.last,...randomized.flatMap(u=>{
    const r=readout(u);return [r.first,r.last];
  })];
  assert.equal(streams.length,slots.length);
  streams.forEach((v,i)=>nulls[i].push(languageScore(v)));
}
const scored=observed.map((s,i)=>{
  const above=nulls[i].filter(x=>x>=s.score).length;
  const p=(above+1)/(reps+1);
  return {name:s.name,n:s.vals.length,score:s.score,
    empiricalOneSidedP:p,bonferroni20:Math.min(1,20*p),
    output:translit(s.vals)};
});
const minAdjustedP=Math.min(...scored.map(x=>x.bonferroni20));
const nativePlant=languageScore(control.slice(180000,180594));
assert(nativePlant>-10);
const output={
  model:"Literal 594 printed LP2 lines, nine source-bounded units",
  originalRunes:runePos,sourceLines:lines.length,canonicalWords:words.length,
  unitRuneCounts:limits.slice(1).map((n,i)=>n-limits[i]),
  unitLineCounts:units.map(g=>g.length),
  nativeSolvedPageControls:native,
  heldoutNativeEnglish594Score:nativePlant,
  shuffle:{repetitions:reps,seed:"0x3362016",unitPreserving:true,
    comparedStreams:slots.length,minBonferroniP:minAdjustedP},
  runeReadouts:scored,
  wordReadouts:frozen.map((r,u)=>({unit:u,
    firstComplete:r.firstWords,lastComplete:r.lastWords,
    noWholeWordFirst:r.firstWords.filter(x=>!x).length,
    noWholeWordLast:r.lastWords.filter(x=>!x).length})),
  qualification:"Original line boundaries and GP transcriptions are current canonical choices; tied pixel line registrations are not resolved by text scoring; no extra shifts or selected skips."
};
console.log(JSON.stringify(output,null,2));
