// Exact positive source-mapped red8 phase gate; no alphabet fitting.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const g=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-page-groups-54-55-derived.json'),'utf8'));
const S='0123456789abcdefghijklmnopqrs',K=g.red8_key.gp29_indices;
const L54=new Set([10,31,48,71,93,115,136,159,180,202]),L55=new Set([24,46,68]);
/** @param {string[]} groups */
function bounds(groups){let n=0;return new Set(groups.slice(0,-1).map(x=>n+=x.length));}
/** @param {string} c @param {Set<number>} W @param {Set<number>} L @param {number} initial @param {number} d @param {number} a @param {number} b */
function paths(c,W,L,initial,d,a,b){
 let p=[{j:initial,h:[]}];
 for(let i=0;i<c.length;i++){
  const q=[],x=S.indexOf(c[i]);assert(x>=0);
  for(const z of p){
   const j=(z.j+(W.has(i)?a:0)+(L.has(i)?b:0))%8;
   if(x===0)q.push({j,h:[...z.h,i]});
   if(x!==K[j])q.push({j:(j+d)%8,h:z.h});
  }
  p=q;if(!p.length)return {p,fail:i};
 }
 return {p,fail:null};
}
const W54=bounds(g.p54.body_groups),W55=bounds(g.p55.groups),c54=g.p54.body_groups.join(''),c55=g.p55.groups.join('');
assert.equal(c54.length,223);assert.equal(c55.length,76);
assert.equal(g.p54.body_groups.at(-1)+g.p55.groups[0],'63g2eis46ql');
const controls=[];
for(const seed of [3301,1033,2014,2016]){
 let x=seed;const rand=n=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x%n;};
 const pi=Array.from({length:29},(_,i)=>i);
 for(let i=28;i>1;i--){const j=1+rand(i);[pi[i],pi[j]]=[pi[j],pi[i]];}
 const inv=pi.map((_,i)=>pi.indexOf(i));
 let j=rand(8);const initial=j,d=1+2*rand(4),a=rand(8),b=rand(8);let enc='';const holds=[];
 for(let i=0;i<c54.length;i++){
  j=(j+(W54.has(i)?a:0)+(L54.has(i)?b:0))%8;
  const p=rand(29);
  if(p===0){enc+='0';holds.push(i);}else{enc+=S[inv[(pi[p]+pi[K[j]])%29]];j=(j+d)%8;}
 }
 const p=paths(enc,W54,L54,initial,d,a,b).p;
 assert(p.some(z=>z.j===j&&JSON.stringify(z.h)===JSON.stringify(holds)));
 controls.push({seed,clock:[initial,d,a,b],paths:p.length,true:true});
}
const survivors=[];
for(let d=0;d<8;d++)for(let a=0;a<8;a++)for(let b=0;b<8;b++)for(let initial=0;initial<8;initial++){
 const {p}=paths(c54,W54,L54,initial,d,a,b);
 if(p.length)survivors.push({initial,d,a,b,paths:p});
}
assert.deepEqual(survivors,[{initial:0,d:5,a:0,b:6,paths:[{j:2,h:[32]},{j:2,h:[56]}]}]);
const frozen=survivors[0];
const continuation=paths(c55,W55,L55,2,frozen.d,frozen.a,frozen.b);
assert.equal(continuation.fail,7);
const pageReset=Array.from({length:8},(_,j)=>({initial:j,...paths(c55,W55,L55,j,frozen.d,frozen.a,frozen.b)}));
assert.deepEqual(pageReset.filter(x=>x.p.length),[{initial:4,p:[{j:5,h:[15]},{j:5,h:[25]},{j:5,h:[41]}],fail:null}]);
const result={controls,clocks:4096,survivors,continuation,pageReset};
console.log(JSON.stringify(result,null,2));if(process.env.SFT_OUTPUT)fs.writeFileSync(process.env.SFT_OUTPUT,JSON.stringify(result,null,2)+'\n');
