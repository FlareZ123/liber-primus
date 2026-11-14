'use strict';
/**
 * All-key GP29 five-phase within-word reset equality gate.
 * One unknown permutation per phase, shared across book, visual chapter, or page.
 * Node 22 CJS, no dependencies or writes; all source inputs checked in.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw=read('resources/liber-primus/lp2-transcription.txt');
const index=new Map(gp.runes.map((r,i)=>[r,i]));
/** Page/line wraps do not end original words. @param {string} s */
function parse(s) {
 const out=[];let w=[];
 for(const c of s) {
  if(index.has(c)) w.push(index.get(c));
  else if(c==='%'||c==='/'||/\s/u.test(c)) {}
  else if(w.length){out.push(w);w=[];}
 }
 if(w.length)out.push(w);
 return out;
}
const words=parse(raw.split('%').slice(0,55).join('%'));
const original=words.flat();
const pages=gp.pages.filter(p=>p.page<=55&&p.indices.length);
assert.equal(words.length,2896);
assert.equal(original.length,12956);
assert.equal(pages.length,55);
assert.deepEqual(original,pages.flatMap(p=>p.indices));
const sections=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const phases=words.flatMap(w=>w.map((_,i)=>i%5));
const pg=[],ch=[];
for(const p of pages){
 const c=sections.findIndex(([a,b])=>p.page>=a&&p.page<=b);
 assert(c>=0);
 for(let i=0;i<p.indices.length;i++){pg.push(p.page);ch.push(c);}
}
const scopes=['book','chapter','page'];
/** @param {number[]} symbols @param {string} scope */
function metric(symbols,scope) {
 const size=scope==='book'?1:scope==='chapter'?9:56;
 const rows=Array.from({length:size*5},()=>new Uint32Array(29));
 for(let i=0;i<symbols.length;i++){
  const s=scope==='book'?0:scope==='chapter'?ch[i]:pg[i];
  rows[5*s+phases[i]][symbols[i]]++;
 }
 let same=0,possible=0;
 for(const row of rows){
  const n=row.reduce((s,v)=>s+v,0);
  possible+=n*(n-1)/2;
  for(const v of row)same+=v*(v-1)/2;
 }
 return {same,possible,rate:same/possible};
}
const observed=Object.fromEntries(scopes.map(s=>[s,metric(original,s)]));
assert.deepEqual(scopes.map(s=>[observed[s].same,observed[s].possible]),
 [[653650,19001504],[91451,2658441],[12399,358333]]);
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** Source-native historical GP encoder, including ING and IO. @param {string} text */
function native(text){
 const out=[];
 for(let term of text.toUpperCase().match(/[A-Z]+/g)||[]){
  term=term.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C')
   .replace(/Z/g,'S').replace(/ING/g,'NG');
  const w=[];
  for(let i=0;i<term.length;){
   const t=tokens.find(v=>term.startsWith(v.s,i));
   assert(t,'Unknown GP token: '+term);
   w.push(t.i);i+=t.s.length;
  }
  out.push(w);
 }
 return out;
}
let seed=0x13057a19;
/** @returns {number} */
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
/** @param {number[][]} pool */
function lengthPool(pool){
 const map=new Map();
 for(const w of pool){if(!map.has(w.length))map.set(w.length,[]);map.get(w.length).push(w);}
 return map;
}
/** @param {Map<number,number[][]>} pool */
function sample(pool){
 return words.flatMap(w=>{
  const list=pool.get(w.length);
  assert(list&&list.length,'Missing source word length '+w.length);
  return list[random()%list.length];
 });
}
/** @param {number[]} rates */
function summary(rates){
 const v=rates.slice().sort((a,b)=>a-b);
 return {samples:v.length,min:v[0],median:v[Math.floor(v.length/2)],max:v.at(-1)};
}
const controls={};
let plantPlain=null;
/** @param {string} label @param {number[][]} pool @param {number} trials */
function compare(label,pool,trials){
 const src=lengthPool(pool),out={};
 const values=Object.fromEntries(scopes.map(s=>[s,[]]));
 for(let i=0;i<trials;i++){
  const candidate=sample(src);
  if(!plantPlain)plantPlain=candidate;
  for(const s of scopes)values[s].push(metric(candidate,s).rate);
 }
 for(const s of scopes){
  out[s]=summary(values[s]);
  assert(out[s].min>observed[s].rate,label+':'+s);
 }
 controls[label]={poolWords:pool.length,scope:out};
}
for(const [label,file] of [
 ['Shakespeare','resources/control/shakespeare_first300k.txt'],
 ['Gibran','resources/control/gibran_prophet_58585.txt'],
 ['Emerson','resources/control/emerson_essays_2944.txt']
])compare(label,native(read(file)),150);
const lp1=read('resources/liber-primus/lp1-plaintext-reference.txt');
const parts=lp1.split(/^###\s+(\d+)/m),included=new Set([1,3,5,6,9,10,11,12,13,14,15,16]);
const author=[];
for(let i=1;i+1<parts.length;i+=2){
 if(!included.has(Number(parts[i])))continue;
 author.push(...native(parts[i+1].split('\n').filter(x=>!x.trim().startsWith('[')&&!x.trim().startsWith('#')).join(' ')));
}
author.push(...parse(raw.split('%').at(-1)));
assert.equal(author.length,715);
compare('Solved LP1 + p57',author,500);
/** @returns {number[]} */
function permutation(){
 const arr=Array.from({length:29},(_,i)=>i);
 for(let i=28;i>0;i--){const j=random()%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}
 return arr;
}
/** Full 29! secret-box positive controls, one per scope/phase. @param {string} scope */
function plant(scope){
 const groups=scope==='book'?1:scope==='chapter'?9:56;
 const boxes=Array.from({length:groups*5},permutation);
 const inverse=boxes.map(box=>{
  const out=Array(29).fill(-1);
  box.forEach((v,i)=>{out[v]=i;});
  return out;
 });
 const state=i=>5*(scope==='book'?0:scope==='chapter'?ch[i]:pg[i])+phases[i];
 const encrypted=plantPlain.map((v,i)=>boxes[state(i)][v]);
 const decrypted=encrypted.map((v,i)=>inverse[state(i)][v]);
 assert.deepEqual(decrypted,plantPlain);
 assert.deepEqual(metric(encrypted,scope),metric(plantPlain,scope));
 return {scope,allocatedSecretBoxes:boxes.length,recovered:12956,equalityInvariant:true};
}
const positive=scopes.map(plant);
console.log(JSON.stringify({classification:'fixed 5-phase word-reset substitution conditional exclusion',
 originalRunes:12956,originalWords:2896,observed,controls,positive,
 authenticPlaintextRecovered:0,
 limits:'Does not test changing per-word state, new boundaries, changed plaintext register, or a probabilistic transport'},null,2));
