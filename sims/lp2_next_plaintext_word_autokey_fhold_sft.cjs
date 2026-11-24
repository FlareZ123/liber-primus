'use strict';
/** Reverse complete-word autokey: next plaintext word as key, printed within-word order.
 * Test exact F-hold reachability from the authentic terminal AN and every singleton.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
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
const offsets=[];let offset=0;for(const w of words){offsets.push(offset);offset+=w.length;}
assert.equal(offset,12956);
const code=p=>String.fromCharCode(...p),decode=s=>Array.from(s,c=>c.charCodeAt(0)),mod=x=>(x+29)%29;
/** @param {number[]} p @param {number[]} k */
function emit(p,k){let t=0;return p.map(v=>v===0?0:mod(v+k[t++%k.length]));}
/** @param {number[]} c @param {string} k @returns {Set<string>} */
function next(c,k){
 const out=new Set();
 function dfs(i,t,p){
  if(i===c.length){out.add(p);return;}
  const v=mod(c[i]-k.charCodeAt(t%k.length));
  if(c[i]===0)dfs(i+1,t,p+'\0');
  if(v!==0)dfs(i+1,t+1,p+String.fromCharCode(v));
 }
 dfs(0,0,'');
 for(const p of out)assert.deepEqual(emit(decode(p),decode(k)),c);
 return out;
}
function step(c,states){const dest=new Set();for(const k of states)for(const p of next(c,k))dest.add(p);return dest;}
function trace(start,seeds,end=0){
 let states=new Set(seeds),counts=[],n=0;
 for(let j=start;j>=end;j--){
  const prev=states;states=step(words[j],states);n+=words[j].length;counts.push([j,states.size]);
  if(!states.size)return {death:j,offset:offsets[j],runes:n,counts,last:{c:words[j],prev:[...prev].map(decode)}};
 }
 return {death:null,runes:n,counts,states:states.size};
}
const an=solved.sections[7].source_text.match(/[\u16a0-\u16ff]+/gu)[0];
const key=[...an].map(c=>index.get(c));assert.deepEqual(key,[24,9]);
const direct=trace(words.length-1,[code(key)]);
assert.equal(direct.death,2890);assert.equal(direct.runes,28);
assert.deepEqual(direct.last.c,[28,18,10,6,14,6,15]);
assert.deepEqual(direct.last.prev,[[20,19,14,6,4,22,17]]);
const singles=words.map((w,i)=>w.length===1?i:-1).filter(i=>i>=0);
const all=Array.from({length:29},(_,i)=>code([i]));
const traces=singles.map(i=>({start:i,offset:offsets[i],...trace(i-1,all)}));
const dead=traces.filter(t=>t.death!==null);
assert.equal(traces.length,83);assert.equal(dead.length,83);
const shortest=dead.reduce((a,b)=>a.runes<b.runes?a:b);
assert.equal(shortest.start,2451);assert.equal(shortest.death,2439);assert.equal(shortest.runes,53);
assert.deepEqual(shortest.last.c,[6,3,24,1]);
assert.deepEqual(shortest.last.prev,[[20,3,21,23,22,6,15,21,6],[20,3,21,23,11,6,15,21,6]]);
const terminal=traces.at(-1);assert.equal(terminal.start,2856);assert.equal(terminal.death,2823);assert.equal(terminal.runes,147);
const starts=[];let base=0;
for(const p of corpus.pages.filter(p=>p.page<=55)){starts.push({page:p.page,start:base});base+=p.indices.length;}
const pageOf=i=>starts.filter(p=>p.start<=i).at(-1).page;
assert.deepEqual([pageOf(shortest.offset),pageOf(offsets[shortest.start])],[44,45]);
const donors=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>index.get(c))));
const plants=[0,150,300].map(i=>{
 const p=donors.slice(i,i+150);let states=new Set([code(p.at(-1))]),max=states.size,n=0;
 for(let j=p.length-2;j>=0;j--){
  const c=emit(p[j],p[j+1]);n+=c.length;states=step(c,states);
  assert(states.has(code(p[j])),'true plant branch lost');max=Math.max(max,states.size);
 }
 return {words:p.length,runes:n,max,final:states.size};
});
assert.deepEqual(plants.map(p=>p.runes),[612,597,611]);
console.log(JSON.stringify({key,anchor:direct,shortest,terminal,dead:dead.length,total:traces.length,shortestPages:[pageOf(shortest.offset),pageOf(offsets[shortest.start])],plants,allResults:traces.map(t=>[t.start,t.death,t.runes])},null,2));
console.log('PASS: all 83 singleton-state supersets contradict the fixed backward word-fed F-hold cipher.');
