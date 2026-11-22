"use strict";
const assert = require("node:assert/strict");
const {logLikelihood,encrypt,invert,decodePosterior} = require("./keyskip_transducer.cjs");

function rng(seed) {
  let state = seed | 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
function sample(q, random) {
  let x = random();
  for (let i = 0; i < q.length; i++) {
    x -= q[i];
    if (x <= 0) return i;
  }
  return q.length - 1;
}
const q3 = [0.5, 0.3, 0.2];
const K3 = [0, 1, 2, 1, 0, 2, 0, 1, 2, 0, 1, 2, 1, 0];
const sigma3 = [2, 0, 1], inverseSigma3 = invert(sigma3);
for (let size = 1; size <= 4; size++) {
  let total = 0;
  for (let number = 0; number < 3 ** size; number++) {
    const data = [];
    let n = number;
    for (let t = 0; t < size; t++) {
      data.push(n % 3); n = Math.floor(n / 3);
    }
    total += Math.exp(logLikelihood(data, {
      key:K3,q:q3,inverseSigma:inverseSigma3,
      rejectRepeat:0.83,maxTotalSkips:30,maxSkippedPerOutput:15
    }));
  }
  assert.ok(Math.abs(total - 1) < 1e-8,
    "Exact HMM normalization failed at length " + size + ": " + total);
  process.stdout.write(JSON.stringify({size,totalProbability:total}) + "\n");
}
// Statistical plant: correct key beats an unrelated random key under
// the exact soft repeat-rejection transition model.
const q29 = [0.08,0.07,0.05,0.09,0.04,0.08,0.04,0.04,0.02,0.08,
  0.05,0.01,0.01,0.02,0.02,0.04,0.03,0.01,0.08,0.03,0.03,
  0.02,0.01,0.07,0.04,0.02,0.01,0.01,0.01];
const qsum = q29.reduce((a,b)=>a+b,0), q = q29.map(x=>x/qsum);
const draw = rng(0x714d3301);
const key = Array.from({length:256},()=>Math.floor(draw()*29));
const wrongKey = Array.from({length:256},()=>Math.floor(draw()*29));
const sigma = Array.from({length:29},(_,i)=>i);
for(let i=28;i>0;i--){const j=Math.floor(draw()*(i+1));[sigma[i],sigma[j]]=[sigma[j],sigma[i]];}
let correct=0,incorrect=0,skips=0,n=0,recovered=0,naive=0;
for(let page=0;page<16;page++){
  const plain=Array.from({length:125},()=>sample(q,draw));
  const sampleCipher=encrypt(plain,key,sigma,draw,{rejectRepeat:0.83});
  skips+=sampleCipher.skips;
  n+=sampleCipher.cipher.length;
  const base={q,inverseSigma:invert(sigma),rejectRepeat:0.83,maxTotalSkips:40,maxSkippedPerOutput:4};
  correct+=logLikelihood(sampleCipher.cipher,{...base,key});
  const posterior=decodePosterior(sampleCipher.cipher,{...base,key});
  assert.ok(Math.abs(posterior.logProbability -
    logLikelihood(sampleCipher.cipher,{...base,key}))<1e-8,
    "Forward-backward likelihood disagrees with the scalar forward model");
  for(let t=0;t<plain.length;t++){
    recovered+=Number(posterior.mapPlaintext[t]===plain[t]);
    naive+=Number((sampleCipher.cipher[t]-key[t%256]+29)%29===plain[t]);
    const normalization=posterior.posterior[t].reduce((a,b)=>a+b,0);
    assert.ok(Math.abs(normalization-1)<1e-10,
      "Posterior probabilities do not sum to one");
  }
  incorrect+=logLikelihood(sampleCipher.cipher,{...base,key:wrongKey});
}
assert.ok(recovered / n > 0.80, "MAP recovery from the true key is too low");
assert.ok(correct > incorrect + 100,
  "True key did not outscore wrong random key");
process.stdout.write(JSON.stringify({
  test:"planted 29-alphabet skip transducer",
  observedCipherRunes:n,discardedKeys:skips,
  correctLogLikelihood:correct,wrongKeyLogLikelihood:incorrect,
  logBayesFactor:correct-incorrect,
  posteriorMapAccuracy:recovered/n,naiveUnalignedAccuracy:naive/n,pass:true
})+"\n");
