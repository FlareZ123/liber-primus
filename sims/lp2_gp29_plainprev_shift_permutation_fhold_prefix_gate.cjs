'use strict';
const fs=require('node:fs'),path=require('node:path');
// Exact necessary all-key gate: stop at the first literal ciphertext F.
// No plaintext F can occur inside a strictly nonzero ciphertext prefix.
function experiment(gp,{nodeLimit=2000000}={}){
 const A=29,m=x=>(x+29)%29;
 const frames=gp.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>{const C=p.indices;let end=1;while(end<C.length&&C[end]!==0)end++;return {page:p.page,d:C.slice(1,end).map((c,j)=>m(c-C[j]))}});
 const D=frames.map(f=>f.d),N=D.length,total=D.reduce((s,d)=>s+d.length,0),K=new Int8Array(A).fill(-1);
 let nodes=0,pruned=0,limited=false,witness=null,maxDepth=0;
 function dfs(pos,q,mask,depth){
  if(++nodes>nodeLimit){limited=true;return false}
  maxDepth=Math.max(maxDepth,depth);
  const cnt=new Uint16Array(A),forbid=new Uint32Array(A);
  for(let i=0;i<N;i++)if(pos[i]<D[i].length){cnt[q[i]]++;forbid[q[i]]|=1<<m(-D[i][pos[i]])}
  let z=-1,min=A+1;
  for(let j=0;j<A;j++)if(cnt[j]){
   let n=0;for(let k=0;k<A;k++)if(!((mask|forbid[j])&(1<<k)))n++;
   if(!n){pruned++;return false}
   if(n<min||(n===min&&cnt[j]>cnt[z])){min=n;z=j}
  }
  if(z<0){witness=Array.from(K);return true}
  for(let k=0;k<A;k++)if(!((mask|forbid[z])&(1<<k))){
   K[z]=k;const pp=pos.slice(),qq=q.slice();let ok=true;
   for(let i=0;i<N&&ok;i++){
    while(pp[i]<D[i].length&&K[qq[i]]>=0){
     const x=m(D[i][pp[i]]+K[qq[i]]);
     if(!x){ok=false;pruned++;break}qq[i]=x;pp[i]++;
    }
   }
   if(ok&&dfs(pp,qq,mask|(1<<k),depth+1))return true;
   K[z]=-1;if(limited)return false;
  }
  return false;
 }
 const found=dfs(new Uint16Array(N),new Uint8Array(N),0,0);
 return {frames:N,totalPrefixTransitions:total,nodes,pruned,maxDepth,limited,found,witness,exhaustiveExclusion:!found&&!limited};
}
if(require.main===module)console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources/liber-primus/lp2-corpus.json'),'utf8'))),null,2));
module.exports={experiment};
