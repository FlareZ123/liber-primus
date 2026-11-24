'use strict';
// Exhaustive GP29 previous-plaintext-word affine autokey, both historical F hold and ordinary emission.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const read = p => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const idx = new Map(corpus.runes.map((x,i)=>[x,i]));
const words = [];
let w = [];
for (const c of read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0,55).join('%')) {
  if (idx.has(c)) w.push(idx.get(c));
  else if (!'%/'.includes(c) && !/\s/u.test(c) && w.length) { words.push(w); w=[]; }
}
if (w.length) words.push(w);
assert.equal(words.length,2896);
assert.deepEqual(words.flat(),corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices));
assert.equal(words.flat().length,12956);
const donors = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')).sections.flatMap(s =>
  (s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c))));
assert(donors.flat().every(Number.isInteger));
const mod = x => ((x%29)+29)%29;
const code = p => String.fromCharCode(...p);
const seeds = Array.from({length:29},(_,i)=>String.fromCharCode(i));

/** @param {number[]} c @param {Set<string>} states @param {number} a @param {number} b */
function step(c,states,a,b) {
  const out = new Set();
  for (const k of states) {
    const key = Array.from(k,v=>mod(a*v.charCodeAt(0)+b));
    function dfs(i,t,p) {
      if (i===c.length) { out.add(p); return; }
      const v = mod(c[i]-key[t%key.length]);
      if (c[i]===0) dfs(i+1,t,p+'\0');
      if (v!==0) dfs(i+1,t+1,p+String.fromCharCode(v));
    }
    dfs(0,0,'');
  }
  return out;
}
function trace(ws,start,a,b) {
  let states=new Set(seeds), max=29;
  for(let j=start+1;j<ws.length;j++){
    states=step(ws[j],states,a,b);
    max=Math.max(max,states.size);
    if(!states.size) return {a,b,death:j,max};
  }
  return {a,b,death:null,remaining:states.size,max};
}
// Each deterministic ordinary-emitter rune is x*seed+y*b+z, for fixed multiplier a.
function ordinary(ws,start) {
  let best=30,minKeys=[],hist={};
  for(let a=0;a<29;a++){
    let prev=[[1,0,0]],single=[[1,0,0]];
    for(let j=start+1;j<ws.length;j++){
      const curr=ws[j].map((c,i)=>{
        const [x,y,z]=prev[i%prev.length];
        return [mod(-a*x),mod(-a*y-1),mod(c-a*z)];
      });
      if(curr.length===1)single.push(curr[0]);
      prev=curr;
    }
    for(let b=0;b<29;b++)for(let seed=0;seed<29;seed++){
      let mask=0;
      for(const [x,y,z] of single)mask|=1<<mod(x*seed+y*b+z);
      let n=0;while(mask){mask&=mask-1;n++;}
      hist[n]=(hist[n]||0)+1;
      if(n<best){best=n;minKeys=[];}
      if(n===best)minKeys.push({a,b,seed});
    }
  }
  return {best,minCount:minKeys.length,examples:minKeys.slice(0,10),hist};
}
function emit(p,k,a,b,hold){
  let t=0;return p.map(v=>hold&&v===0?0:mod(v+a*k[t++%k.length]+b));
}
function plant(p,aa,bb){
  const start=p.findIndex(w=>w.length===1);
  const c=[p[0],...p.slice(1).map((w,j)=>emit(w,p[j],aa,bb,true))];
  const live=[];
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)
    if(trace(c,start,a,b).death===null)live.push([a,b]);
  let states=new Set(seeds),max=29;
  for(let j=start+1;j<c.length;j++){
    states=step(c[j],states,aa,bb);
    assert(states.has(code(p[j])),'true planted branch lost');
    max=Math.max(max,states.size);
  }
  const co=[p[0],...p.slice(1).map((w,j)=>emit(w,p[j],aa,bb,false))];
  // Direct recovery with the true parameters checks the coefficient-based evaluator.
  let last=p[start];
  for(let j=start+1;j<co.length;j++){
    const recovered=co[j].map((c,i)=>mod(c-aa*last[i%last.length]-bb));
    assert.deepEqual(recovered,p[j]);last=recovered;
  }
  const o=ordinary(co,start);
  return {start,aa,bb,live,remaining:states.size,max,ordinary:o,
    nativeSingletonTypes:new Set(p.slice(start).filter(w=>w.length===1).map(w=>w[0])).size};
}
const first=words.findIndex(w=>w.length===1);
assert.equal(first,39);
assert.equal(words.slice(first).filter(w=>w.length===1).length,83);
const results=[];
for(let a=0;a<29;a++)for(let b=0;b<29;b++)results.push(trace(words,first,a,b));
const live=results.filter(x=>x.death===null);
const dead=results.filter(x=>x.death!==null).sort((x,y)=>y.death-x.death);
assert.deepEqual(live,[{a:0,b:0,death:null,remaining:1,max:29}]);
assert.equal(dead.length,840);
assert.equal(dead[0].death,166);
assert.equal(words.slice(0,166).reduce((s,w)=>s+w.length,0),774);
const o=ordinary(words,first);
assert.equal(o.best,24);
assert.equal(o.minCount,290);
const controls=[[0,3,7],[150,17,21],[300,28,12]].map(([i,a,b])=>plant(donors.slice(i,i+150),a,b));
assert.deepEqual(controls.map(c=>c.ordinary.best),[1,2,2]);
console.log(JSON.stringify({first,live,dead:dead.length,longest:dead.slice(0,12),
  maxStates:Math.max(...results.map(x=>x.max)),ordinary:o,controls},null,2));
console.log('PASS: every nonidentity affine F-hold law dies; ordinary family requires >=24 singleton types.');
// Independent chapter keys and free restart state at the first full singleton.
const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const offsets=[];let pos=0;for(const word of words){offsets.push(pos);pos+=word.length;}
const chapterResults=chapters.map(([p,q])=>{
  const lo=corpus.pages.filter(x=>x.page<p).reduce((s,x)=>s+x.indices.length,0);
  const hi=lo+corpus.pages.filter(x=>x.page>=p&&x.page<=q).reduce((s,x)=>s+x.indices.length,0);
  const start=words.findIndex((w,i)=>offsets[i]>=lo&&w.length===1);
  const end=words.findIndex((w,i)=>offsets[i]+w.length>hi);
  const stop=end<0?words.length:end;
  const ws=words.slice(start,stop);assert(ws.length&&offsets[start]<hi);
  const live=[];let last=0;
  for(let a=0;a<29;a++)for(let b=0;b<29;b++){
    const t=trace(ws,0,a,b);
    if(t.death===null)live.push([a,b]);else last=Math.max(last,t.death);
  }
  return {p,q,start,stop,singletons:ws.filter(w=>w.length===1).length,live,lastDeath:start+last};
});
assert.deepEqual(chapterResults.map(x=>x.live),[
  [[0,0],[27,26]],[[0,0]],[[0,0]],[[0,0]],[[0,0]],[[0,0]],[[0,0]],[[0,0]],[[0,0],[2,3],[8,14]]
]);
console.log(JSON.stringify({chapterResults},null,2));
// Decode the three nonnull chapter-local survivors with an exact path-count / lexical DP.
const tok=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encode(s){
  s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C')
    .replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
  const p=[];
  while(s.length){const m=tok.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length);}
  return p;
}
const lex=new Set(donors.map(code));
for(const l of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)){
  const m=/^([a-z]+) (\d+)$/.exec(l);
  if(m){const p=encode(m[1]);if(p)lex.add(code(p));}
}
assert.equal(lex.size,29081);
const dec=s=>Array.from(s,c=>c.charCodeAt(0));
const gp=s=>dec(s).map(x=>corpus.translit[x]).join('');
const bi=Array.from({length:30},()=>Array(29).fill(.5));
for(const w of donors){let last=29;for(const x of w){bi[last][x]++;last=x;}}
for(const row of bi){const s=row.reduce((x,y)=>x+y);for(let i=0;i<29;i++)row[i]=Math.log(row[i]/s);}
function score(p){let last=29,s=0;for(const x of dec(p)){s+=bi[last][x];last=x;}return s;}
function best(ws,a,b){
  let states=new Map(seeds.map(s=>[s,{path:[s],n:0,m:0,score:0,count:1n}]));
  for(let j=1;j<ws.length;j++){
    const dest=new Map();
    for(const [k,x] of states)for(const p of step(ws[j],new Set([k]),a,b)){
      const h=lex.has(p)&&p.length>=4,n=x.n+(h?p.length:0),m=x.m+(h?1:0),sc=x.score+score(p),prior=dest.get(p);
      const total=(prior?.count??0n)+x.count;
      if(!prior||n>prior.n||(n===prior.n&&sc>prior.score))
        dest.set(p,{path:[...x.path,p],n,m,score:sc,count:total});
      else prior.count=total;
    }
    states=dest;
  }
  const sorted=[...states.values()].sort((x,y)=>y.n-x.n||y.score-x.score);
  const best=sorted[0];assert(best);
  for(let i=1;i<best.path.length;i++)
    assert.deepEqual(emit(dec(best.path[i]),dec(best.path[i-1]),a,b,true),ws[i]);
  return {a,b,paths:[...states.values()].reduce((s,x)=>s+x.count,0n).toString(),
    groups:ws.length-1,runes:ws.slice(1).flat().length,
    eligible:ws.slice(1).filter(w=>w.length>=4).length,
    eligibleRunes:ws.slice(1).filter(w=>w.length>=4).flat().length,
    matchedRunes:best.n,matchedWords:best.m,avgNats:best.score/ws.slice(1).flat().length,
    output:best.path.slice(1).map(gp).join(' ')};
}
const survivorDecodes=[[39,158,27,26],[2830,2896,2,3],[2830,2896,8,14]].map(
  ([s,t,a,b])=>best(words.slice(s,t),a,b));
assert.deepEqual(survivorDecodes.map(x=>x.paths),['124928','8','4']);
assert.deepEqual(survivorDecodes.map(x=>x.matchedRunes),[0,0,0]);
console.log(JSON.stringify({survivorDecodes},null,2));

// Extend to every shared linear combination of GP0 and prime-minus-one coordinates.
function stepMap(c,states,f){
  const out=new Set();
  for(const k of states){
    const n=k.length;
    function dfs(i,t,p){
      if(i===c.length){out.add(p);return;}
      const v=(c[i]+29-f[k.charCodeAt(t%n)])%29;
      if(c[i]===0)dfs(i+1,t,p+'\0');
      if(v!==0)dfs(i+1,t+1,p+seeds[v]);
    }
    dfs(0,0,'');
  }
  return out;
}
const combined=[];
for(let b=1;b<29;b++)for(let a=0;a<29;a++)for(let c=0;c<29;c++){
  const f=corpus.prime.map((p,i)=>mod(a*i+b*(p-1)+c));
  let states=new Set(seeds),max=29,death=null;
  for(let j=first+1;j<words.length;j++){
    states=stepMap(words[j],states,f);
    max=Math.max(max,states.size);
    if(!states.size){death=j;break;}
  }
  combined.push({a,b,c,death,max});
}
assert.equal(combined.length,23548);
assert(combined.every(x=>x.death!==null));
combined.sort((x,y)=>y.death-x.death);
assert.equal(combined[0].death,171);
assert.equal(Math.max(...combined.map(x=>x.max)),210);
console.log(JSON.stringify({combinedKeys:combined.length,longest:combined.slice(0,10),
  maxStates:Math.max(...combined.map(x=>x.max))},null,2));
