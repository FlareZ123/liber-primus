'use strict';
// #3106: direct realization of the July 2 2014 missing-19 / position DH suggestion.
// Source: signed 2013 DH p=23, g=5, B=19; historical F rule from LP2 p56.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const mod=(x,m)=>((x%m)+m)%m,page=n=>gp.pages.find(p=>p.page===n).indices;
const P=23,G=5,B=19;
function pow(a,n){let v=1;for(let i=0;i<n;i++)v=v*a%P;return v}
assert.equal(pow(G,15),B);assert.equal(pow(B,6),2);
const k=Array.from({length:22},(_,i)=>pow(B,i));
assert.equal(new Set(k).size,22);assert.equal(pow(B,22),1);
const key=i=>k[mod(i,22)];
function encode(pt,phase,s,clock){
 let j=phase;
 return pt.map(p=>{if(clock!=='ordinary'&&p===0){if(clock==='physical-F')j++;return 0}return mod(p+s*key(j++),29)});
}
function inverse(ct,phase,s,clock){
 let states=new Map([[mod(phase,22),[]]]);
 for(let i=0;i<ct.length;i++){
  const c=ct[i],next=new Map();
  for(const [j,pt] of states){
   const p=mod(c-s*key(j),29),adv=(j+1)%22;
   if(clock!=='ordinary'&&c===0)next.set(clock==='physical-F'?adv:j,pt.concat(0));
   if(clock==='ordinary'||p!==0)next.set(adv,pt.concat(p));
  }
  states=next;if(!states.size)return {possible:false,firstImpossible:i};
 }
 for(const pt of states.values())assert.deepEqual(encode(pt,phase,s,clock),ct);
 return {possible:true,finalStates:states.size,example:states.values().next().value};
}
const training=[];
for(const para of read('resources/liber-primus/lp1-plaintext-reference.txt').split(/\n\s*\n/)){
 const seq=[];for(const w of para.split('\n').filter(x=>!x.trim().startsWith('#')&&!x.trim().startsWith('[')).join(' ').match(/[A-Za-z]+/g)||[]){seq.push(...encodeSourceNativeGP(w));}if(seq.length>=3)training.push(seq);
}
const tri=new Map();let total=0;
for(const a of training)for(let i=2;i<a.length;i++){const id=a.slice(i-2,i+1).join(',');tri.set(id,(tri.get(id)||0)+1);total++}
const den=total+.1*29**3;
const score=a=>{let v=0;for(let i=2;i<a.length;i++)v+=Math.log(((tri.get(a.slice(i-2,i+1).join(','))||0)+.1)/den);return v/(a.length-2)};
const target=[14,19,23,24,25,26,27], clocks=['ordinary','physical-F','consuming-F'], rows=[];
for(const n of target){
 const ct=page(n),controls=training.flatMap(a=>Array.from({length:Math.max(0,a.length-ct.length+1)},(_,i)=>score(a.slice(i,i+ct.length))));
 assert.ok(controls.length);
 for(const clock of clocks){
  const frozen=[],all=[];
  for(const s of [1,-1])for(let phase=0;phase<22;phase++){
   const res=inverse(ct,phase,s,clock);
   const row={s,phase,possible:res.possible,firstImpossible:res.firstImpossible};
   if(res.possible){row.score=score(res.example);row.preview=res.example.slice(0,60).map(x=>gp.translit[x]).join('')}
   all.push(row);if(phase<=1)frozen.push(row);
  }
  const best=all.filter(x=>x.possible).sort((a,b)=>b.score-a.score)[0]||null;
  rows.push({page:n,length:ct.length,clock,nativeMinimum:Math.min(...controls),nativeWindows:controls.length,frozen,allPhaseFeasible:all.filter(x=>x.possible).length,allPhaseBestExample:best});
 }
}
const plant=Array.from({length:273},(_,i)=>page(57)[i%page(57).length]);
const positive=[];
for(const clock of clocks)for(const s of [1,-1])for(const phase of [0,1,17]){
 const ct=encode(plant,phase,s,clock),res=inverse(ct,phase,s,clock);
 assert.ok(res.possible);if(clock==='ordinary')assert.deepEqual(res.example,plant);
 positive.push({clock,s,phase,possible:true});
}
const result={p:P,g:G,B,key:k,targets:target,rows,positive};
fs.writeFileSync(path.join(process.env.RUNNER_TEMP||'.','source-test-output.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(rows.map(({page,clock,allPhaseFeasible,allPhaseBestExample,nativeMinimum})=>({page,clock,allPhaseFeasible,allPhaseBestExample,nativeMinimum})),null,2));
