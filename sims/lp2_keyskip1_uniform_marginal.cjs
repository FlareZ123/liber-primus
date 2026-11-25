"use strict";
// Agent 2, issue #2665. Language-independent uniform-iid-plaintext
// marginalized keyskip1 (at most one redraw) likelihood, continuous offset 0.
function marginal(C,K,cap=800,s=0.81288){
 const D=new Float64Array(cap+1); D[0]=1;
 const lists=Array.from({length:29},()=>[]);
 for(let j=1;j<K.length;j++)lists[(K[j]-K[j-1]+29)%29].push(j);
 const cursors=new Int32Array(29);
 let scale=0,baseline=0;
 for(let i=1;i<C.length;i++){
   const delta=(C[i]-C[i-1]+29)%29;
   const ratio=s/(delta===0?1-s:1);
   const list=lists[delta];let hi=cursors[delta];
   while(hi<list.length&&list[hi]<=i+cap)hi++;
   cursors[delta]=hi;
   for(let t=hi-1;t>=0&&list[t]>i;t--){
     const d=list[t]-i;D[d]+=ratio*D[d-1];
   }
   baseline+=Math.log1p(ratio/29);
   if((i&255)===0){
      let total=0;for(let d=0;d<=cap;d++)total+=D[d];
      for(let d=0;d<=cap;d++)D[d]/=total;
      scale+=Math.log(total);
   }
 }
 let total=0,mean=0,edge=0;
 for(let d=0;d<=cap;d++){total+=D[d];mean+=d*D[d];if(d>=cap-50)edge+=D[d]}
 return {llr:scale+Math.log(total)-baseline,meanSkips:mean/total,edgeMass:edge/total};
}
function rng(seed){let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
function plant(P,K,seed,s=0.81288){const rnd=rng(seed);let j=0,prev=-1,skips=0;const C=[];for(const p of P){let c=(p+K[j++])%29;if(c===prev&&rnd()<s){c=(p+K[j++])%29;skips++}C.push(c);prev=c}return {C,skips}}
function stats(a){const mean=a.reduce((x,y)=>x+y,0)/a.length;return {n:a.length,min:Math.min(...a),max:Math.max(...a),mean,sd:Math.sqrt(a.reduce((x,y)=>x+(y-mean)**2,0)/a.length)}}
module.exports={marginal,rng,plant,stats};
