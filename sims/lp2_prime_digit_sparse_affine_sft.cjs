'use strict';
const fs=require('node:fs');
function experiment(corpus){
 const N=20,S=corpus.prime,pages=corpus.pages.slice(0,56).filter(x=>x.indices.length>=N),gcd=(a,b)=>b?gcd(b,a%b):a;
 function search(C,base,domain,depth,limit=100000){
  const B=BigInt(base),legal=Array(base).fill(false);for(const x of domain)legal[x]=true;
  const X=C.map(a=>a.reduceRight((s,d)=>s*B+BigInt(d),0n));let states=[[0n,0n]],q=1n,trace=[];
  for(let j=0;j<depth;j++){
   const next=[],m=q*B,low=X.map(x=>Number(x%B));
   for(const [A,K] of states){
    const carry=X.map(x=>Number(((A*x+K)%m)/q));
    for(let a=0;a<base;a++){if(j===0&&gcd(a,base)!==1)continue;
     const partial=carry.map((x,i)=>(x+a*low[i])%base);
     for(let b=0;b<base;b++){
      let i=0;for(;i<X.length;i++)if(!legal[(partial[i]+b)%base])break;
      if(i===X.length){next.push([A+BigInt(a)*q,K+BigInt(b)*q]);if(next.length>limit)return {states:null,trace,capAt:j+1};}
     }
    }
   }
   q=m;states=next;trace.push({depth:j+1,count:states.length,examples:states.slice(0,5).map(a=>a.map(String))});
  }return {states,trace};
 }
 function brute(C,b,D,n){let m=b**n,ok=new Set(D),X=C.map(a=>a.reduceRight((s,d)=>s*b+d,0)),z=[];for(let a=0;a<m;a++)if(gcd(a,b)===1)for(let k=0;k<m;k++){let valid=true;for(const x of X){let y=(a*x+k)%m;for(let j=0;j<n;j++){if(!ok.has(y%b)){valid=false;break}y=Math.floor(y/b)}if(!valid)break}if(valid)z.push([a,k].join(","))}return z.sort()}
 const controls=[];
 for(const b of [6,8,9]){const D=[1,2,3,5].filter(x=>x<b);for(const C of [[[1,2],[3,1]],[[2,2],[1,5],[5,3]],[[1,1],[2,2],[3,3],[5,5]]]){const a=search(C,b,D,2).states.map(x=>x.map(String).join(",")).sort(),z=brute(C,b,D,2);if(JSON.stringify(a)!==JSON.stringify(z))throw Error("brute mismatch");controls.push({base:b,C,keys:a.length})}}
 const plant=[[3,11],[5,29],[11,59],[17,83],[29,41],[41,43],[59,67],[71,3],[101,107],[107,5]];
 const P=plant.map(a=>[a[0]+2,a[1]]);if(P.some(a=>a.some(x=>!S.includes(x))))throw Error("plant domain");
 const planted=search(plant,110,S,2).states;if(!planted?.some(([a,k])=>a===1n&&k===2n))throw Error("plant lost");
 const out={N,controls,plant:{C:plant,P,keys:planted.length,trueRetained:true},original:[]};
 for(const base of [110,128])for(const reverse of [false,true]){
  const C=pages.map(s=>(reverse?[...s.indices].reverse():s.indices).slice(0,N).map(x=>S[x]));
  const z=search(C,base,S,N),nonidentity=z.states?.filter(([a,k])=>a!==1n||k!==0n);
  out.original.push({base,reverse,trace:z.trace,capAt:z.capAt??null,keys:z.states?.length??null,nonidentity:nonidentity?.length??null,states:z.states?.slice(0,20).map(a=>a.map(String))??null});
 }
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json'))),null,2));
