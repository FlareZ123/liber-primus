'use strict';
/**
 * Two strict-no-repeat output channels have exactly the same visible law
 * when their keystream symbols are iid uniform.
 *
 * A: v output states, emit each except independently delete with d=h/(v+h).
 * B: v+h output states, hide states [v..v+h-1] and print the others.
 * The accepted emitted state is uniform among all states except the last.
 *
 * Run: node sims/lp2_round48_channel_observational_equivalence_sft.cjs
 * No source files, packages, network, tunable parameters, or secret keys needed.
 * This is an exact CONDITIONAL mathematical equivalence, not an LP2 solve.
 */
const assert=require('node:assert/strict');
const hiddenKernel=(v,h)=>({same:h/(v*(v+h-1)),other:(v+h)/(v*(v+h-1))});
const deletionKernel=(v,d)=>({same:d/(v-1+d),other:1/(v-1+d)});
const approx=(a,b)=>assert(Math.abs(a-b)<1e-12, a+' !== '+b);

/** Independently sum absorbed transition mass; no use of the formulas above. */
function independentHiddenFirstReturn(v,h) {
  const n=v+h,absorbed=Array(v).fill(0);
  let states=Array.from({length:n},(_,i)=>+(i===0));
  for(let step=0;step<120;step++){
    const next=Array(n).fill(0);
    for(let i=0;i<n;i++)if(states[i])
      for(let j=0;j<n;j++)if(j!==i)next[j]+=states[i]/(n-1);
    for(let j=0;j<v;j++){absorbed[j]+=next[j];next[j]=0;}
    states=next;
  }
  assert(states.reduce((s,x)=>s+x,0)<1e-12);
  return absorbed;
}
function independentDeletionFirstReturn(v,d) {
  const absorbed=Array(v).fill(0);
  let states=Array.from({length:v},(_,i)=>+(i===0));
  for(let step=0;step<120;step++){
    const next=Array(v).fill(0);
    for(let i=0;i<v;i++)if(states[i])
      for(let j=0;j<v;j++)if(j!==i)next[j]+=states[i]/(v-1);
    for(let j=0;j<v;j++){absorbed[j]+=(1-d)*next[j];next[j]*=d;}
    states=next;
  }
  assert(states.reduce((s,x)=>s+x,0)<1e-12);
  return absorbed;
}
for(const [v,h] of [[2,1],[3,2],[5,3],[29,7]]) {
  const d=h/(v+h),a=hiddenKernel(v,h),b=deletionKernel(v,d);
  approx(a.same,b.same);approx(a.other,b.other);
  approx(a.same+(v-1)*a.other,1);
  const exactA=independentHiddenFirstReturn(v,h);
  const exactB=independentDeletionFirstReturn(v,d);
  for(let j=0;j<v;j++){
    approx(exactA[j],j===0?a.same:a.other);
    approx(exactB[j],exactA[j]);
  }
  // A four-rune word's complete probability is the same product of kernels.
  // Exhaustive for v<=5; 10,000 fixed cases when v=29.
  for(let idx=0;idx<Math.min(10000,v**4);idx++) {
    let x=idx,word=[];
    for(let j=0;j<4;j++){word.push(x%v);x=Math.floor(x/v);}
    let pa=1/v,pb=1/v;
    for(let j=1;j<4;j++){
      pa*=word[j]===word[j-1]?a.same:a.other;
      pb*=word[j]===word[j-1]?b.same:b.other;
    }
    approx(pa,pb);
  }
}
// Exact rational specialization: v=29,h=7,d=7/36.
// T(same)=7/1015 and T(each distinct)=36/1015.
const v=29,h=7,N=v+h,edges=12955,observedPairs=86;
const q=hiddenKernel(v,h).same,obs=observedPairs/edges;
const calibrated=deletionKernel(v,0.187).same;
const mleDeletion=(v-1)*obs/(1-obs);
const likelihood=p=>observedPairs*Math.log(p)
  +(edges-observedPairs)*Math.log((1-p)/(v-1));
console.log(JSON.stringify({
  conditionalTheorem:'Full visible sequence law identical for iid-uniform-key hidden alphabet and strict-repeat independent thinning with d=h/(v+h)',
  domainsTested:[[2,1],[3,2],[5,3],[29,7]],
  exactCase:{v,h,N,matchedDeletionRate:h/N,
    conditionalSame:'7/1015',conditionalEachDifferent:'36/1015',
    same:q,eachDifferent:hiddenKernel(v,h).other},
  originalDiagnostic:{runes:edges+1,edges,equalPairs:observedPairs,
    observedSame:obs,expectedEqualPairs:edges*q,
    z:(observedPairs-edges*q)/Math.sqrt(edges*q*(1-q)),
    bestFitDeletionRate:mleDeletion,
    priorCalibratedDeletionRate:0.187,
    logLikelihoodRatioHiddenOverCalibrated:
      likelihood(q)-likelihood(calibrated)},
  independentNumericChecks:'PASS',
  caveat:'No statement about fixed/periodic/source-constrained keys, nonuniform schedules, page resets, adaptive deletion, authorship, or unknown-page plaintext'
},null,2));
