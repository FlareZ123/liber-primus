"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
function refine(gp,prior){
 const mod=(x,q)=>(x%q+q)%q;
 const q=13,A=29;
 function counts(C,mask){let k=0,phase=0;const h=new Int32Array(q*A);for(const x of C){if(x===0&&((mask>>k++)&1))continue;h[phase*A+x]++;phase=(phase+1)%q}return {h,phase}}
 function score(h){let n=0;for(let r=0;r<q;r++){let best=0;for(let c=0;c<A;c++)best=Math.max(best,h[r*A+c]);n+=best}return n}
 function exhaustive(C){
  let z=C.filter(x=>x===0).length;if(z>20)throw Error("large mask count");let cap=0,bestMask=0;
  for(let mask=0;mask<2**z;mask++){const s=score(counts(C,mask).h);if(s>cap){cap=s;bestMask=mask}}
  return {cap,bestMask,masks:2**z};
 }
 // For a fixed pair of relative suffix phases and ciphertext symbols,
 // maximize the suffix reward under every remaining visible-zero hold mask.
 function suffixMax(C,r,c,t,d){
  const dp=new Int32Array(q).fill(-1000000);dp[0]=0;
  for(let i=0;i<C.length;i++){
   const x=C[i],p=i%q;
   if(x===0){const s1=c===0?mod(p-r,q):-1,s2=d===0?mod(p-t,q):-1;let prev=dp[q-1];for(let s=0;s<q;s++){const old=dp[s];dp[s]=Math.max(old+(s===s1||s===s2?1:0),prev);prev=old}}
   else{if(x===c)dp[mod(p-r,q)]++;if(x===d)dp[mod(p-t,q)]++}
  }
  return Math.max(...dp);
 }
 // Fix a prefix hold history exactly. For each possible phase shift at the
 // cut, bound the suffix by the same fixed disjoint phase-pair partition,
 // retaining its chosen ciphertext labels in the prefix and suffix.
 function conditional(C,partition,k){
  const z=C.flatMap((x,i)=>x===0?[i]:[]);const cut=z[k-1]+1,pre=C.slice(0,cut),suf=C.slice(cut);
  const cache=new Map();
  function matrix(r,t){
   const key=r+":"+t;if(cache.has(key))return cache.get(key);
   const m=new Int16Array(A*(t<0?1:A));
   for(let c=0;c<A;c++)for(let d=0;d<(t<0?1:A);d++)m[c*(t<0?1:A)+d]=suffixMax(suf,r,c,t,t<0?-1:d);
   cache.set(key,m);return m;
  }
  let cap=0,bestMask=0;const hist={};
  for(let mask=0;mask<2**k;mask++){
   const {h,phase}=counts(pre,mask);
   let upper=0;for(const [r,t] of partition){
    const rr=mod(r-phase,q),tt=t===undefined?-1:mod(t-phase,q),m=matrix(rr,tt);let v=0;
    for(let c=0;c<A;c++)if(t===undefined)v=Math.max(v,h[r*A+c]+m[c]);else for(let d=0;d<A;d++)v=Math.max(v,h[r*A+c]+h[t*A+d]+m[c*A+d]);
    upper+=v;
   }
   hist[upper]=(hist[upper]||0)+1;if(upper>cap){cap=upper;bestMask=mask}
  }
  return {k,cut,suffixLength:suf.length,cap,bestMask,masks:2**k,cache:cache.size,hist};
 }
 let seed=0x332913;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 let toy=0;for(let j=0;j<12;j++){const C=Array.from({length:16},()=>rng()%3);const n=C.filter(x=>x===0).length;if(n<2)continue;const p=[[0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[12]],a=conditional(C,p,Math.min(3,n)),b=exhaustive(C);if(a.cap<b.cap)throw Error("invalid prefix upper bound");toy++}
 const results=[];
 for(const row of prior.originals.filter(x=>!x.excluded)){
  const C=gp.pages.filter(x=>x.page>=row.a&&x.page<=row.b).flatMap(x=>x.indices);
  if(row.a===54){const exact=exhaustive(C);results.push({a:row.a,b:row.b,min:row.min,prior:row.cap,exact,excluded:exact.cap<row.min})}
  else{
   const trials=[];for(const k of [8,12,16]){const b=conditional(C,row.matching.pairs,k);trials.push(b);if(b.cap<row.min)break;}
   const cap=Math.min(row.cap,...trials.map(x=>x.cap));results.push({a:row.a,b:row.b,min:row.min,prior:row.cap,cap,trials,excluded:cap<row.min});
  }
 }
 return {toy,q,results}
}
console.log(JSON.stringify(refine(read("resources/liber-primus/lp2-corpus.json"),read("im-results/lp2-explicit-space-phasepair-holdcap.json")),null,2));
