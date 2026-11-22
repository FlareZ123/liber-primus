"use strict";

/**
 * Independent source-locus gate: the p15/p39 matrix's unknown GF29^4 state
 * on the 3,000 black original GP runes following physical p40's 8-rune heading.
 *
 * The preceding p39 red quadratic shares a factor with the signed p15
 * Fibonacci-prime matrix, making this a distinct, source-plausible target.
 * All 29^4 initial states are exhausted indirectly by the first four
 * independent A/I/O plaintext one-rune words, with nine held out.
 *
 * Read-only Windows Node.js 22 single runnable test.
 */

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const core=require("./lp2_p15_fourstate_unknown_iv_singletons_sft.cjs");
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,
  "../resources/liber-primus/lp2-corpus.json"),"utf8"));
const mod=n=>(n%29+29)%29;
const dot=(a,b)=>mod(a.reduce((s,v,i)=>s+v*b[i],0));
const first=gp.pages.filter(p=>p.page<40)
  .reduce((s,p)=>s+p.indices.length,0)+8;
const last=gp.pages.filter(p=>p.page<=53)
  .reduce((s,p)=>s+p.indices.length,0);
const ciphertext=gp.pages.filter(p=>p.page>=40&&p.page<=53)
  .flatMap(p=>p.indices).slice(8);
assert.deepEqual([first,last,ciphertext.length],[9648,12648,3000]);
const slots=core.printedWords().filter(w=>w.runeWord.length===1
  &&w.at>=first&&w.at<last).map(w=>({
    at:w.at-first,cipher:ciphertext[w.at-first]
  }));
assert.equal(slots.length,13);
assert.deepEqual(slots.map(s=>s.at),
  [128,298,1203,1324,1347,1438,1878,1999,2154,2303,2517,2585,2606]);

const printed=[
  [3258,3222,3152,3038],
  [3278,3299,3298,2838],
  [3288,3294,3296,2472],
  [4516,1206,708,1820]
].map(r=>r.map(mod));
const signed=printed.map(r=>r.slice());
signed[3][0]=mod(-4516); signed[3][1]=mod(-1206);
const transpose=A=>A[0].map((_,j)=>A.map(row=>row[j]));
const variants=[
  ["printed",printed],["signed",signed],
  ["printed-transpose",transpose(printed)],
  ["signed-transpose",transpose(signed)]
];

/** Seed-blind positive control with the exact source geometry. */
function positive() {
  const H=core.streamRows(signed,ciphertext.length);
  const trueKey=[9,2,15,20];
  const p57=gp.pages[57].indices;
  assert.equal(p57.length,95);
  const native=Array.from({length:ciphertext.length},(_,i)=>p57[i%p57.length]);
  slots.forEach((slot,i)=>{native[slot.at]=[24,10,3][i%3];});
  const encoded=native.map((v,i)=>mod(v+dot(H[i],trueKey)));
  const solved=core.search(encoded,H,slots);
  assert(solved.perfectKeys.some(key=>key.every((v,i)=>v===trueKey[i])));
  const recovered=encoded.map((v,i)=>mod(v-dot(H[i],trueKey)));
  assert.deepEqual(recovered,native);
  assert.deepEqual(recovered.map((v,i)=>mod(v+dot(H[i],trueKey))),encoded);
  return {
    plantedState:trueKey,sourceNativeRuneCount:recovered.length,
    trueStateRecoveredBlindly:true,exactForward:true,exactInverse:true,
    perfectlyCompatibleStates:solved.perfectKeys.length
  };
}

function run(){
  const reports=[];
  for(const [label,M] of variants)for(const [direction,A] of [
    ["forward",M],["inverse",core.inverse4(M)]
  ]){
    const H=core.streamRows(A,ciphertext.length);
    const found=core.search(ciphertext,H,slots);
    assert.equal(found.perfectKeys.length,0,
      "No original state may satisfy all 13 English one-rune words");
    reports.push({matrix:label,direction,
      fourIndependent:found.firstFourIndependent,
      testedStates:found.testedCompleteStates,
      minimumHeldoutContradictions:found.minimumContradictions,
      bestKeyCount:found.keysAtMinimum,
      perfectStates:found.perfectKeys.length});
  }
  assert.deepEqual(reports.map(x=>x.minimumHeldoutContradictions),
    [6,5,6,6,5,6,6,4]);
  return {
    source:"original p39 red quadratic; p40 eight-rune heading; p15 signed Fibonacci-prime square",
    originalBodyRunes:ciphertext.length,
    originalOneRuneWords:slots.length,
    independentCribs:4,untouchedHoldoutCribs:9,
    completeFourStateSpacePerModel:29**4,
    allInitialStatesRepresentedByAssignments:3**4,
    results:reports,positiveControl:positive(),
    conclusion:"No exact original GP-English key survives either matrix orientation or power direction under this 4D additive model. No unknown plaintext or key."
  };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
