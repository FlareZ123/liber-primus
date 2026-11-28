"use strict";
/**
 * Quantify how much of the frozen GP29 strict-repeat + 29/36 retention
 * source-crib sender family survives the exact <=2-retry exclusions.
 * Deterministic Monte Carlo over uniform cyclic keys and deletion draws.
 */
const assert=require("node:assert/strict");
const cribs=[
  [7,8,3,24,4,18,1,3,17,8,3,7,24,15,8,15,6,3,0,6,1,13,8,4,8,3,24,5,8,13,2,8,9,24,6,8,4],
  [9,3,6,7,8,3,13,1,24,4,8,7,8,3,24,4,18,1,3,17,8,3,7,24,15,8,15,6,3,0,6,1,13,8,4,8,3,24,5,8,13,2,8,9,24,6,8,4],
];
const encoded=[
"783o4iq317837af8ifg3fg1nq8i4iof5in2ijofgi4",
"93g783q31o4i783o4iq317837af8ifg3fg1nq8i4i",
"2ijofgi4783o4iq317837af8ifg3fg1nq8i4i",
"783o4iq317837af8ifg3fg1nq8i4i",
"7i7akk93ghifg43li93168",
"7i5o9hik3lo9nhi4a68g"
];
const A="0123456789abcdefghijklmnopqrstuvwxyz";
const P=encoded.map(s=>[...s].map(ch=>{const v=A.indexOf(ch);assert.ok(v>=0&&v<29);return v;}));
const mins=[32,31,28,22,17,15];
let state=0x3301c1ca>>>0;
function rng(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
function rand(n){return rng()%n;}
function trial(plain,q,m){
  const K=Array.from({length:q},()=>rand(29));
  let phase=0,last=-1,retries=0,retained=0,retriesAtM=null;
  for(const x of plain){
    let z;
    for(;;){
      z=(x+K[phase])%29; phase=(phase+1)%q;
      if(last>=0&&z===last){retries++;continue;}
      break;
    }
    last=z;
    if(rand(36)<29){
      retained++;
      if(retained===m){retriesAtM=retries;break;}
    }
  }
  return {eligible:retriesAtM!==null,retries:retriesAtM};
}
const N=500000,out={schema:1,seed:"0x3301c1ca",trialsPerCrib:N,retention:"29/36",results:[]};
for(const q of [8,13]){
  const maxCi=q===8?6:4;
  for(let ci=0;ci<maxCi;ci++){
    let eligible=0,le2=0,ge3=0;const hist=Array(10).fill(0);
    for(let n=0;n<N;n++){
      const z=trial(P[ci],q,mins[ci]);
      if(!z.eligible)continue;
      eligible++;
      if(z.retries<=2)le2++;else ge3++;
      hist[Math.min(z.retries,9)]++;
    }
    out.results.push({q,ci,L:P[ci].length,m:mins[ci],eligible,covered_le2:le2,survives_ge3:ge3,
      covered_fraction:le2/eligible,survival_fraction:ge3/eligible,retry_histogram_0_to_8_then_9plus:hist});
  }
}
console.log(JSON.stringify(out,null,2));
