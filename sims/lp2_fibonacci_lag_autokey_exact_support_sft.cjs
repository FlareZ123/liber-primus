"use strict";
const fs=require("node:fs"),path=require("node:path");
// Exact support for the fixed #2698 receiver, independent of language.
// Distinct positive Fibonacci indices; no changes to lag or primer clock.
function solve(C,{q=29,k=8,maxNodes=5000000,stopAtFirst=false}={}){
 const F=[1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765,10946],mod=x=>((x%q)+q)%q;
 const lag=Array.from({length:C.length},(_,i)=>F.filter(f=>f<=i).at(-1)||0);
 const full=(1<<q)-1,D=Array(k).fill(full),roots=new Int8Array(C.length),sign=new Int8Array(C.length),offs=new Int8Array(C.length),active=new Uint8Array(C.length);
 let nodes=0,branches=0,leaves=0,dead=0,depth=0,capped=false,witness=null,paths=0n;
 const reach=Array(C.length+1).fill(0);
 function countbits(m){let n=0;while(m){m&=m-1;n++}return n}
 function dfs(i,j){
   if(nodes++>=maxNodes){capped=true;return}
   depth=Math.max(depth,i);reach[i]++;
   if(i===C.length){
     leaves++;let n=1n;for(const d of D)n*=BigInt(countbits(d));paths+=n;
     if(!witness){
       const key=D.map(m=>31-Math.clz32(m&-m)),P=[];let a=0;
       for(let t=0;t<C.length;t++)P.push(active[t]?mod(offs[a]+sign[a]*key[roots[a++]]):0);
       witness={key,P,domains:D.slice(),holdMask:Array.from(active,x=>!x)};
     }
     return;
   }
   if(C[i]===0){branches++;active[i]=0;dfs(i+1,j);if(capped||(stopAtFirst&&witness))return}
   const prev=j<k?-1:j-lag[j],r=prev<0?j:roots[prev],s=prev<0?-1:-sign[prev],o=mod(C[i]-(prev<0?0:offs[prev]));
   const old=D[r],v=mod(-o*s),next=old&~(1<<v);
   if(!next){dead++;return}
   roots[j]=r;sign[j]=s;offs[j]=o;D[r]=next;active[i]=1;dfs(i+1,j+1);D[r]=old;
 }
 dfs(0,0);
 const exact=!capped&&!(stopAtFirst&&witness);
 return {length:C.length,zeros:C.filter(x=>x===0).length,nodes,branches,leaves,dead,depth,capped,exact,paths:paths.toString(),witness,frontier:reach.map((n,i)=>[i,n]).filter(([i,n])=>n&&(i%50===0||i===depth))};
}
function encode(P,K,q=29){const F=[1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765,10946],A=[];return P.map(p=>{if(!p)return 0;const j=A.length,l=F.filter(x=>x<=j).at(-1)||0,k=j<K.length?K[j]:A[j-l];A.push(p);return(p+k)%q})}
function assert(b,m){if(!b)throw Error(m)}
function controls(){
 let x=20261125;const rng=n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)%n};
 const tiny=[];for(let t=0;t<32;t++){
   const q=5,k=3,C=Array.from({length:10},()=>rng(q));
   let brute=0n;
   for(let n=0;n<q**k;n++){let v=n,K=Array.from({length:k},()=>{const a=v%q;v=Math.floor(v/q);return a}),P=[],A=[];
     function rec(i){if(i===C.length){brute++;return}if(C[i]===0){P.push(0);rec(i+1);P.pop()}const j=A.length,F=[1,2,3,5,8,13],l=F.filter(z=>z<=j).at(-1)||0,p=(C[i]-(j<k?K[j]:A[j-l])+q)%q;if(p){A.push(p);P.push(p);rec(i+1);P.pop();A.pop()}}
     rec(0);
   }
   const got=solve(C,{q,k});assert(got.exact&&BigInt(got.paths)===brute,"tiny exhaustive count");if(got.witness)assert(encode(got.witness.P,got.witness.key,q).join()===C.join(),"tiny replay");tiny.push({C,count:got.paths});
 }
 const full=[];for(let t=0;t<6;t++){const key=Array.from({length:8},()=>rng(29)),P=Array.from({length:339},()=>rng(29)),C=encode(P,key),z=solve(C,{stopAtFirst:true,maxNodes:5000000});assert(z.witness&&encode(z.witness.P,z.witness.key).join()===C.join(),"full planted support");full.push({length:C.length,zeros:z.zeros,nodes:z.nodes,depth:z.depth})}
 return {tiny,full};
}
function original(gp,mode){const C=gp.pages.filter(x=>x.page>=15&&x.page<=22).flatMap(x=>x.page===15?x.indices.slice(20):x.indices);assert(C.length===1883,"source span");const n=Number(mode)||C.length;const z=solve(C.slice(0,n));if(z.witness)assert(encode(z.witness.P,z.witness.key).join()===C.slice(0,n).join(),"original witness replay");return z}
if(require.main===module){const gp=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources/liber-primus/lp2-corpus.json"),"utf8"));console.log(JSON.stringify(process.argv[2]==="--controls"?controls():original(gp,process.argv[2]),null,2))}
module.exports={solve,encode,controls,original};
