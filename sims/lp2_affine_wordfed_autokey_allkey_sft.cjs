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
