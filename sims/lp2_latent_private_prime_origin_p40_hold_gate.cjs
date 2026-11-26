'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const sftPath=path.join(__dirname,'lp2_latent_private_prime_origin_sft.cjs');
const source=read('sims/lp2_latent_private_prime_origin_sft.cjs');
// Lock the hold semantics: F is inactive/required ciphertext zero, while
// every non-F position remains active and may itself produce ciphertext zero.
assert.ok(source.includes('filter(i=>!hold||p[i]!==0)'));
assert.ok(source.includes('zeros=hold?p.map((_,i)=>i).filter(i=>p[i]===0):[]'));
assert.ok(source.includes('w.zeros.some(i=>c[start+i]!==0)'));
assert.ok(source.includes('hold&&w.p[i]===0?0:mod(s*w.p[i]+b+r.k[j++])'));

function run(which,hold){
 const args=[sftPath,String(which)];
 if(hold)args.push('hold');
 const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:100*1024*1024});
 if(r.error)throw r.error;
 if(r.status!==0)throw new Error('SFT failed ('+which+', hold='+hold+'): '+r.stderr);
 return JSON.parse(r.stdout);
}
function summary(x){
 return {
  which:x.which,hold:x.hold,n:x.n,comparisons:x.comparisons,compatible:x.compatible,
  uniqueIntervals:x.uniqueIntervals,anchorByLength:x.anchorByLength,counts:x.counts,
  bounds:x.bounds,originCount:x.originCount,routes:x.routes,indexSize:x.indexSize,
  covered:x.covered,longTruth:x.longTruth,longExact:x.longExact
 };
}

// Reuse, do not rerun, the frozen ordinary original and held-out F-hold donor.
const ordinary=JSON.parse(read('im-results/lp2-latent-private-prime-origin-p40-ordinary.json'));
const heldDonor=JSON.parse(read('im-results/lp2-latent-private-prime-origin-1-hold.json'));
assert.equal(ordinary.hold,false);
assert.equal(ordinary.n,3008);
assert.equal(ordinary.counts[2],1);
assert.equal(ordinary.bounds[2].gap,5);
assert.equal(heldDonor.hold,true);
assert.equal(heldDonor.which,'1');
assert.equal(heldDonor.longTruth,7);
assert.equal(heldDonor.longExact,7);

// Fresh boundary-independent native-vocabulary plant, then original p40–p53.
const freshPlant=run(0,true);
assert.equal(freshPlant.hold,true);
assert.equal(freshPlant.n,716);
assert.ok(freshPlant.longTruth>0);
assert.equal(freshPlant.longExact,freshPlant.longTruth);
const original=run('p40',true);
assert.equal(original.hold,true);
assert.equal(original.which,'p40');
assert.equal(original.n,3008);
assert.equal(original.bounds.length,5);
const nine=original.bounds.find(x=>x.threshold===9);
const nativeMinimum=Math.min(...nine.refs.map(x=>x.min));
const gap=nativeMinimum-nine.max;

const output={
 equationAudit:{
  ordinaryRunReused:{n:ordinary.n,maxDisjointAt9:ordinary.counts[2],nativeMinimumAt9:Math.min(...ordinary.bounds[2].refs.map(x=>x.min)),gapAt9:ordinary.bounds[2].gap},
  literalFHoldSemantics:'F positions are required C=0 and do not consume; all non-F positions consume even when their observed C is zero.',
  fixedDomain:'first 3301 primes; both directions; both prime signs; both plaintext signs; independent per-word additive offset; donor vocabulary and lengths unchanged'
 },
 existingHeldDonor:summary(heldDonor),
 freshBoundaryIndependentPlant:summary(freshPlant),
 originalLiteralFHold:summary(original),
 decisionAtNineActive:{
  originalMaximum:nine.max,
  matchedNativeMinimum:nativeMinimum,
  gap,
  result:gap>0?'original below all matched native lower bounds':'capacity survives this gate; continue only on the issue-defined short independent scope'
 }
};
const out=JSON.stringify(output,null,2);
const temp=process.env.RUNNER_TEMP||require('node:os').tmpdir();
fs.writeFileSync(path.join(temp,'source-test-output.json'),out);
console.log(out);
