'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {phoneRunes,ORIGINAL,GP}=require('./lp2_p55_phone_gapped_periodic_sft.cjs');
const mod=x=>(x+29)%29;
/** Fixed physical clock with arbitrary unknown gap plaintext, and a fixed visible-F hold mask. */
function physical(p,c,q,holdMask,fTransparent){
 const n=c.length,m=p.length,phase=new Int8Array(n),key=new Int8Array(q).fill(-1);
 let tick=0;for(let k=0;k<n;k++){phase[k]=tick%q;if(!holdMask[k])tick++;else assert.equal(c[k],0);}
 let nodes=0,completions=0;const keys=new Map();
 const match=(i,k)=>fTransparent&&p[i]===0 ? Boolean(holdMask[k]) : !holdMask[k]&&mod(p[i]+key[phase[k]])===c[k];
 function save(){completions++;const a=Array.from(key),id=a.join(',');if(!keys.has(id))keys.set(id,a);}
 function finish(i,k){for(;i<m;i++){const last=n-m+i;while(k<=last&&!match(i,k))k++;if(k>last)return;k++;}save();}
 function dfs(i,start,assigned){nodes++;if(i===m){save();return;}if(assigned===q){finish(i,start);return;}
  const f=fTransparent&&p[i]===0,last=n-m+i;
  for(let k=start;k<=last;k++){
   if(f){if(holdMask[k])dfs(i+1,k+1,assigned);continue;}
   if(holdMask[k])continue;
   const j=phase[k],v=mod(c[k]-p[i]);
   if(key[j]===v)dfs(i+1,k+1,assigned);
   else if(key[j]===-1){key[j]=v;dfs(i+1,k+1,assigned+1);key[j]=-1;}
  }
 }
 dfs(0,0,0);return {nodes,acceptingBranches:completions,distinctKeyPatterns:keys.size,keys:Array.from(keys.values())};
}
function makePlant(p,q,transparent){const key=Array.from({length:q},(_,j)=>(19+7*j+5*j*j)%29);let s=3301+q+Number(transparent);const rand=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s;};const full=p.map(x=>({x,crib:true}));while(full.length<76)full.splice(rand()%(full.length+1),0,{x:rand()%29,crib:false});let j=0;const hold=full.map(x=>transparent&&x.x===0);const c=full.map((x,i)=>hold[i]?0:mod(x.x+key[j++%q]));assert.deepEqual(full.filter(x=>x.crib).map(x=>x.x),p);return {key,hold,c};}
function runPhysical(p,c){for(const q of [8,13])for(const fTransparent of [false,true]){
 const plant=makePlant(p,q,fTransparent),positive=physical(p,plant.c,q,plant.hold,fTransparent);assert(positive.keys.some(a=>a.every((v,j)=>v===-1||v===plant.key[j])));
 const zero=c.flatMap((x,i)=>x===0?[i]:[]);const results=[];let totalNodes=0,totalPatterns=0;
 for(let mask=0;mask<(fTransparent?1<<zero.length:1);mask++){const hold=Array(c.length).fill(false);for(let j=0;j<zero.length;j++)if((mask>>j)&1)hold[zero[j]]=true;const r=physical(p,c,q,hold,fTransparent);totalNodes+=r.nodes;totalPatterns+=r.distinctKeyPatterns;results.push({mask,holdPositions:zero.filter((x,j)=>(mask>>j)&1),...r});}
 console.log(JSON.stringify({q,fTransparent,positive,plantedKey:plant.key,totalNodes,totalPatterns,results}));
}}
module.exports={physical,runPhysical};
if(require.main===module){
 const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
 assert.deepEqual(corpus.translit,GP);const c=corpus.pages.find(x=>x.page===55).indices;assert.deepEqual(c,ORIGINAL);
 runPhysical(phoneRunes(),c);
}
