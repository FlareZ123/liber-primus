'use strict';
// Exact preceding-plaintext-word prime-minus-one autokey with LP2 p56 F hold.
// Run from repo: node sims/lp2_prev_plainword_prime_minus_one_fhold_sft.cjs
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const co=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tx=read('resources/liber-primus/lp2-transcription.txt');
const native=JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const lex=read('resources/control/english_wordfreq_textblob.txt');
const lookup=new Map(co.runes.map((r,i)=>[r,i]));
let words=[],w=[];
for(const c of tx.split('%').slice(0,55).join('%')){
  if(lookup.has(c))w.push(lookup.get(c));
  else if(!'%/'.includes(c)&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}
}
if(w.length)words.push(w);
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),co.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
const code=p=>String.fromCharCode(...p),dec=s=>Array.from(s,c=>c.charCodeAt(0));
const mod=x=>(x%29+29)%29,K=x=>mod(co.prime[x]-1);
/** @param {number[]} p @param {number[]} k */
function enc(p,k){let t=0;return p.map(v=>v===0?0:mod(v+K(k[t++%k.length])))}
/** @param {number[]} c @param {string} k */
function next(c,k){
  const out=new Set();
  function dfs(i,t,p){
    if(i===c.length){out.add(p);return}
    const v=mod(c[i]-K(k.charCodeAt(t%k.length)));
    if(c[i]===0)dfs(i+1,t,p+'\0');
    if(v!==0)dfs(i+1,t+1,p+String.fromCharCode(v));
  }
  dfs(0,0,'');
  for(const p of out)assert.deepEqual(enc(dec(p),dec(k)),c);
  return out;
}
function step(c,states){
  const dst=new Set();
  for(const k of states)for(const p of next(c,k))dst.add(p);
  return dst;
}
const offsets=[];let offset=0;
for(const w of words){offsets.push(offset);offset+=w.length}
assert.equal(offset,12956);
const seeds=()=>Array.from({length:29},(_,i)=>code([i]));
const anchors=[];
for(let i=0;i<words.length;i++){
  if(words[i].length!==1)continue;
  let state=new Set(seeds()),j=i+1,peak=29;
  for(;j<words.length;j++){
    state=step(words[j],state);peak=Math.max(peak,state.size);
    if(!state.size)break;
  }
  anchors.push({i,offset:offsets[i],death:j===words.length?null:j,
    span:(j===words.length?offset:offsets[j]+words[j].length)-offsets[i],
    peak,remaining:state.size});
}
assert.equal(anchors.length,83);
assert.equal(anchors.filter(a=>a.death!==null).length,82);
const shortest=anchors.slice().sort((a,b)=>a.span-b.span)[0];
assert.deepEqual(shortest,{i:205,offset:967,death:218,span:46,peak:29,remaining:0});
const donors=native.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>lookup.get(c))));
assert(donors.flat().every(Number.isInteger));
const plants=[];
for(let b=0;b<3;b++){
  const p=donors.slice(b*150,b*150+150),c=p.map((w,i)=>i?enc(w,p[i-1]):w);
  let st=new Set([code(p[0])]),peak=1;
  for(let i=1;i<p.length;i++){st=step(c[i],st);assert(st.has(code(p[i])));peak=Math.max(peak,st.size)}
  plants.push({words:p.length,runes:p.flat().length,peak,final:st.size});
}
const toks=co.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function gp(s){
  s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
  const out=[];
  while(s){const t=toks.find(t=>s.startsWith(t.s));if(!t)return null;out.push(t.i);s=s.slice(t.s.length)}
  return code(out);
}
const vocab=new Map();
for(const l of lex.split(/\r?\n/)){
  const m=/^([a-z]+) (\d+)$/.exec(l);if(!m)continue;
  const s=gp(m[1]);if(s!==null)vocab.set(s,Math.max(vocab.get(s)||0,+m[2]));
}
assert.equal(vocab.size,29060);
const score=p=>vocab.has(p)?Math.log(vocab.get(p))+10:0;
const survivor=anchors.find(a=>a.death===null);
assert.equal(survivor.i,2856);
let st=new Map(seeds().map(s=>[s,{count:1n,score:0,path:[s]}]));
for(let j=survivor.i+1;j<words.length;j++){
  const dst=new Map();
  for(const [k,o] of st)for(const p of next(words[j],k)){
    const prev=dst.get(p),s=o.score+score(p),count=(prev?.count||0n)+o.count;
    if(!prev||s>prev.score)dst.set(p,{count,score:s,path:[...o.path,p]});
    else prev.count=count;
  }
  st=dst;
}
const best=[...st.values()].sort((a,b)=>b.score-a.score)[0];
assert.equal(st.size,1);assert.equal(best.count,16n);
const known=best.path.slice(1).filter(x=>vocab.has(x)).length;
assert.equal(known,6);
const decoded=best.path.map(s=>dec(s).map(v=>co.translit[v]).join('')).join(' ');
for(let i=1;i<best.path.length;i++)assert.deepEqual(enc(dec(best.path[i]),dec(best.path[i-1])),words[survivor.i+i]);
console.log(JSON.stringify({primeMap:co.prime.map(p=>mod(p-1)),anchors,shortest,plants,terminal:{paths:best.count.toString(),known,words:best.path.length,decoded}},null,2));
console.log('PASS: exact contradiction for this recurrence; surviving terminal interval is not connected plaintext.');
