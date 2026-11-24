'use strict';
/** #2503: exact word-fed autokey reachability, with transparent plaintext F and both inverse zero branches. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const solved=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const index=new Map(corpus.runes.map((r,i)=>[r,i]));
const words=[];let w=[];
for(const c of read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0,55).join('%')){
 if(index.has(c))w.push(index.get(c));
 else if(!'%/'.includes(c)&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}
}
if(w.length)words.push(w);
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
const offsets=[];let off=0;for(const word of words){offsets.push(off);off+=word.length;}
assert.equal(off,12956);
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gp(s){
 s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
 const p=[];
 while(s.length){const m=tokens.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length);}
 return p;
}
const code=p=>String.fromCharCode(...p), decode=s=>Array.from(s,c=>c.charCodeAt(0));
const vocab=new Set();
for(const l of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)){
 const m=/^([a-z]+) (\d+)$/.exec(l);
 if(m){const p=gp(m[1]);if(p)vocab.add(code(p));}
}
assert.equal(vocab.size,29060);
const mod=x=>(x+29)%29;
/** @param {number[]} p @param {number[]} k */
function emit(p,k){let t=0;return p.map(v=>v===0?0:mod(v+k[t++%k.length]));}
/** All possible plaintext words for this ciphertext word and known preceding plaintext key. */
function next(c,k){
 const out=new Set();
 function dfs(i,t,p){
  if(i===c.length){out.add(p);return;}
  const key=k.charCodeAt(t%k.length),v=mod(c[i]-key);
  if(c[i]===0)dfs(i+1,t,p+'\0');
  if(v!==0)dfs(i+1,t+1,p+String.fromCharCode(v));
 }
 dfs(0,0,'');
 // Each branch has the exact required ciphertext; no language filtering or arbitrary F decisions.
 for(const p of out)assert.deepEqual(emit(decode(p),decode(k)),c);
 return out;
}
function step(c,states){
 const dest=new Set();
 for(const k of states)for(const p of next(c,k))dest.add(p);
 return dest;
}
function trace(ws,start,seeds){
 let states=new Set(seeds),counts=[[start,states.size]],n=ws[start].length,witness=[];
 for(let j=start+1;j<ws.length;j++){
  const prev=states;
  states=step(ws[j],states);n+=ws[j].length;counts.push([j,states.size]);
  if(prev.size<=4)witness.push({j,offset:offsets[j],c:ws[j],before:[...prev].map(decode),after:[...states].map(decode)});
  if(!states.size)return {death:j,runes:n,counts,witness};
 }
 return {death:null,runes:n,counts,states:states.size,witness};
}
function metrics(ws){
 const flat=ws.flat();let adjacent=0,inside=0,pairs=0;
 for(let i=1;i<flat.length;i++)adjacent+=flat[i]===flat[i-1];
 for(const w of ws){
  for(let i=1;i<w.length;i++)inside+=w[i]===w[i-1];
  const f=Array(29).fill(0);w.forEach(x=>f[x]++);
  pairs+=f.reduce((s,n)=>s+n*(n-1)/2,0);
 }
 return {words:ws.length,runes:flat.length,adjacent,inside,pairs,singletons:ws.filter(w=>w.length===1).map(w=>w[0])};
}
function plant(p){
 const c=[p[0],...p.slice(1).map((w,i)=>emit(w,p[i]))];
 let states=new Set([code(p[0])]),max=1;
 for(let j=1;j<p.length;j++){
  states=step(c[j],states);
  assert(states.has(code(p[j])),'true plant branch lost');
  max=Math.max(max,states.size);
 }
 return {words:p.length,finalStates:states.size,maxStates:max,plaintext:metrics(p.slice(1)),ciphertext:metrics(c.slice(1))};
}
const donors=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>index.get(c))));
assert(donors.flat().every(Number.isInteger));
const plants=[donors.slice(0,150),donors.slice(150,300),donors.slice(300,450)].map(plant);
const chapter=words.slice(0,words.findIndex((_,i)=>offsets[i]>=729));
assert.equal(chapter.flat().length,729);
const seeds=[...vocab].filter(s=>s.length===chapter[0].length);
assert.equal(seeds.length,4325);
const lexical=trace(chapter,0,seeds);
assert.equal(lexical.death,57);assert.equal(lexical.runes,261);
const singleton=chapter.findIndex(w=>w.length===1);
assert.equal(singleton,39);assert.equal(offsets[singleton],176);
const universal=trace(chapter,singleton,Array.from({length:29},(_,i)=>String.fromCharCode(i)));
assert.equal(universal.death,61);assert.equal(universal.runes,111);
const last=universal.witness.at(-1);
assert.deepEqual(last.c,[5,4,2,27]);
assert.deepEqual(last.before,[[10,4,16,25,19,24,25,20],[11,4,16,26,20,24,26,20]]);
assert.equal(last.offset,283);
assert.equal(last.after.length,0);
assert.equal(offsets[58],261);
console.log(JSON.stringify({lexicon:vocab.size,seeds:seeds.length,lexical,universal,sourceWitness:metrics(chapter.slice(40,62)),plants},null,2));
console.log('PASS: exact first-chapter contradiction even with every possible singleton plaintext seed; no full inverse for this recurrence.');
