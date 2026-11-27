'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(raw){
 const g=JSON.parse(raw),tokens=g.pages.flatMap(p=>p.tokens),assert=(v,m)=>{if(!v)throw Error(m)};
 assert(tokens.length===256&&new Set(tokens).size===161,'grid');
 function read(radix){const a=radix===60?g.alphabet:g.alphabet.replace('f','');return tokens.map(t=>radix*a.indexOf(t[0])+a.indexOf(t[1]));}
 function exact(T){
  const A=Array.from({length:256},()=>new Uint8Array(256).fill(1)),sizes=Array(256).fill(256);
  for(let d=1;d<256;d++)for(let x=0;x<256;x++){const y=T[x]^T[x^d];if(A[d][y]){A[d][y]=0;sizes[d]--;}}
  // Pick a basis using only derivative-domain sizes, minimizing each new
  // coset's total allowed count. Choice does not discard any linear map.
  let span=[0],basis=[],cosets=[];
  for(let k=0;k<8;k++){let best=-1,score=Infinity;for(let e=1;e<256;e++)if(!span.includes(e)){const s=span.reduce((n,x)=>n+sizes[e^x],0);if(s<score){score=s;best=e;}}basis.push(best);const v=span.map(x=>x^best);cosets.push(v);span=span.concat(v);}
  const masks=new Uint32Array(256*256*8);
  for(let d=1;d<256;d++)for(let s=0;s<256;s++){const p=(d*256+s)*8;for(let y=0;y<256;y++)if(A[d][y^s])masks[p+(y>>>5)]|=1<<(y&31);}
  const values=new Uint8Array(256),cols=new Uint8Array(8),vis=Array(9).fill(0),solutions=[];
  const scratch=Array.from({length:8},()=>new Uint32Array(8));
  function dfs(k){
   vis[k]++;
   if(k===8){const M=Array(256);for(let j=0;j<256;j++)M[span[j]]=values[j];assert(new Set(T.map((v,i)=>v^M[i])).size===256,'not permutation');solutions.push({basisOutputs:[...cols],standardColumns:Array.from({length:8},(_,j)=>M[1<<j]),S:T.map((v,i)=>v^M[i])});return;}
   const n=1<<k,z=scratch[k],v=cosets[k];
   for(let b=0;b<8;b++)z[b]=masks[v[0]*2048+b];
   for(let j=1;j<n;j++){const p=(v[j]*256+values[j])*8;let any=0;for(let b=0;b<8;b++){z[b]&=masks[p+b];any|=z[b];}if(!any)return;}
   for(let b=0;b<8;b++){let bits=z[b];while(bits){const bit=bits&-bits,y=b*32+(31-Math.clz32(bit));bits=(bits^bit)>>>0;cols[k]=y;for(let j=0;j<n;j++)values[n+j]=values[j]^y;dfs(k+1);}}
  }
  dfs(0);
  return {basis,allowedRange:[Math.min(...sizes.slice(1)),Math.max(...sizes.slice(1))],visitedByDimension:vis,solutionCount:solutions.length,solutions};
 }
 let seed=0x3301033;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 const perm=Array.from({length:256},(_,i)=>i);for(let i=255;i>0;i--){const j=rand()%(i+1);[perm[i],perm[j]]=[perm[j],perm[i]];}
 const key=Array.from({length:8},()=>rand()>>>24),bias=rand()>>>24;const mask=i=>key.reduce((n,x,j)=>n^((i>>j&1)?x:0),bias);
 const plant=perm.map((v,i)=>v^mask(i)),control=exact(plant);
 assert(control.solutions.some(s=>s.standardColumns.join()===key.join()),'plant key lost');
 assert(control.solutions.filter(s=>s.standardColumns.join()===key.join()).every(s=>s.S.every((v,i)=>v===(perm[i]^bias))),'plant replay');
 const original=[59,60].map(radix=>({radix,...exact(read(radix))}));
 return {control:{key,bias,rawDistinct:new Set(plant).size,...control},original};
}
console.log(JSON.stringify(experiment(fs.readFileSync(path.join(__dirname,'..',"resources/liber-primus/lp2-grid-256.json"),'utf8')),null,2));
