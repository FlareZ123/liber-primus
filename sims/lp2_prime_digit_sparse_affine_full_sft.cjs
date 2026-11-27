'use strict';
const fs=require('node:fs');
function full(corpus){
 const S=corpus.prime,pages=corpus.pages.slice(0,56).filter(x=>x.indices.length),gcd=(a,b)=>b?gcd(b,a%b):a,out=[];
 const CAP=512, BUDGET=150000; // full candidate parents times depths, bound to avoid futile near-single-page explosion
 for(const base of [110,128])for(const reverse of [false,true]){
 const B=BigInt(base),legal=Array(base).fill(false);for(const x of S)legal[x]=true;
 const C=pages.map(p=>(reverse?[...p.indices].reverse():p.indices).map(x=>S[x])),X=C.map(a=>a.reduceRight((s,d)=>s*B+BigInt(d),0n)),low=C.map(a=>a[0]);
 const max=Math.max(...C.map(a=>a.length));let states=[[0n,0n]],q=1n,trace=[],stop=null,work=0;
 for(let j=0;j<max;j++){
 const active=C.map((a,i)=>a.length>j?i:-1).filter(i=>i>=0),m=q*B,next=[];
 if(work+states.length>BUDGET){stop={digit:j,reason:"parent budget"};break}
 work+=states.length;
 outer:for(const [A,K] of states){
 const carry=active.map(i=>Number(((A*X[i]+K)%m)/q));
 for(let a=0;a<base;a++){if(j===0&&gcd(a,base)!==1)continue;
 // Enumerate b by enforcing first active digit then testing all remaining.
 const partial=active.map((i,t)=>(carry[t]+a*low[i])%base);
 for(const target of S){const b=(target-partial[0]+base)%base;let k=1;for(;k<active.length;k++)if(!legal[(partial[k]+b)%base])break;
 if(k===active.length){next.push([A+BigInt(a)*q,K+BigInt(b)*q]);if(next.length>CAP){stop={digit:j,reason:"candidate cap",active:active.length};break outer}}
 }}
 }
 if(stop)break;
 if(!next.some(([A,K])=>A===1n&&K===0n))throw Error("identity lost");
 states=next;q=m;trace.push({depth:j+1,keys:states.length,active:active.length});
 }
 const depth=trace.length,moduli=Array.from({length:depth+1},(_,j)=>B**BigInt(j));
 let fixed=0,covered=0,changedByAny=0,maxChanges=0;const pageCounts=[];
 for(let i=0;i<C.length;i++){let L=Math.min(depth,C[i].length),m=moduli[L],vary=Array(L).fill(false);for(const [A,K] of states){let y=(A*X[i]+K)%m;for(let j=0;j<L;j++){let d=Number(y%B);y/=B;if(d!==C[i][j])vary[j]=true}}
 const v=vary.filter(Boolean).length;covered+=L;fixed+=L-v;changedByAny+=v;pageCounts.push({page:pages[i].page,covered:L,forcedUnchanged:L-v});}
 for(const [A,K] of states){let changes=0;for(let i=0;i<C.length;i++){let L=Math.min(depth,C[i].length),y=(A*X[i]+K)%moduli[L];for(let j=0;j<L;j++){if(Number(y%B)!==C[i][j])changes++;y/=B}}maxChanges=Math.max(maxChanges,changes)}
 out.push({base,reverse,depth,stop,states:states.length,covered,fixed,changedByAny,maxChanges,total:C.reduce((s,a)=>s+a.length,0),trace,pageCounts,work});
 }
 return out;
}
console.log(JSON.stringify(full(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json'))),null,2));
