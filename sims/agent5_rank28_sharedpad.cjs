"use strict";
/**
 * Original LP2 rank-28 same-key continuation test.
 *
 * A reversible sentinel scheme: P=EA(28) emits the previous cipher rune.
 * Other GP symbols 0..27 emit C[i] = C[i-1]+1+(P[i]+K[i])%28 (mod 29).
 * K advances at each source rune, including EA. If two sections reuse
 * aligned K, the difference of their nonzero cyclic predecessor ranks
 * cancels K. This is an independently testable, conditional mechanism,
 * not a claim that Cicada used it.
 *
 * Full-width 8-section comparison, 301 offsets per pair, and frozen
 * 300-rune training / 300-rune validation ranges. Original-source
 * nulls rotate entire section rank vectors and rescan every candidate.
 * Positive controls independently encrypt GP-rune Shakespeare held out
 * from the language model, with a shared stream between sections 2/5.
 *
 * Node 22; CommonJS; no external packages and no disk writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const token = new Map(corpus.translit.map((t, i) => [t, i]));
const original = read("resources/lp2-transcription.txt").split("$")
  .map(piece => [...piece].filter(c => alphabet.has(c)).map(c => alphabet.get(c)))
  .filter(piece => piece.length).slice(0, 8);
const EXPECTED = [729,1145,1738,1894,1021,1433,1680,3316];
assert.deepEqual(original.map(x => x.length), EXPECTED);
const M = 28, TRAIN = 300, HOLD = 300, MAX_SHIFT = 150, TOP = 20;
const prose = read("resources/control/shakespeare_first300k.txt");

/** Greedy digraph Gematria Primus encoder, with source-register spelling. */
function encodeGP(text) {
  const out = [];
  for (const word of text.match(/[A-Za-z]+/g) || []) {
    const s = word.toUpperCase().replace(/QU/g, "CW")
      .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < s.length;) {
      const digraph = token.get(s.slice(i, i+2));
      if (digraph !== undefined) { out.push(digraph); i += 2; }
      else {
        const value = token.get(s[i]);
        assert.notEqual(value, undefined, "Unknown GP source character");
        out.push(value); i++;
      }
    }
  }
  return out;
}
const gpTrain = encodeGP(prose.slice(0, 240000));
const gpHeldout = encodeGP(prose.slice(240000));
assert.ok(gpHeldout.length > EXPECTED.reduce((a,b) => Math.max(a,b), 0));
const counts = Array(M).fill(0.5);
for (const p of gpTrain) if (p < M) counts[p]++;
const total = counts.reduce((a,b) => a+b,0);
const q = counts.map(x => x/total);
const odds = Array.from({length:M}, (_,d) => {
  let density = 0;
  for(let x=0;x<M;x++) density += q[x]*q[(x-d+M)%M];
  return Math.log(M*density);
});

/** Return 0..27 for the unique admissible nonrepeat, or -1 for EA/IV. */
function rank28(cipher) {
  return cipher.map((c,i) => i === 0 || c === cipher[i-1]
    ? -1 : (c-cipher[i-1]+28) % 29);
}
const origSteps = original.map(rank28);

/** Exact invertible forward cipher given an initial transmitted C0. */
function encrypt(plain, key, iv) {
  const c = new Array(plain.length);
  c[0] = iv;
  for(let i=1;i<plain.length;i++) c[i] = plain[i] === 28
    ? c[i-1] : (c[i-1] + 1 + (plain[i] + key[i]) % M) % 29;
  return c;
}
function decrypt(cipher, key) {
  const step = rank28(cipher), p = new Array(cipher.length);
  p[0] = null; // The IV is transmitted and not an encoded source symbol.
  for(let i=1;i<cipher.length;i++)
    p[i] = step[i] < 0 ? 28 : (step[i]-key[i]+M)%M;
  return p;
}

/**
 * Exhaustive affine-offset scan under the same-key rank28 model.
 * B index = A index + shift; each candidate freezes a 300+300 position
 * range before looking at the result. Erasure sites contribute no score.
 */
function scan(sections) {
  const out=[];
  for(let a=0;a<8;a++) for(let b=a+1;b<8;b++) {
    const A=sections[a],B=sections[b];
    for(let shift=-MAX_SHIFT;shift<=MAX_SHIFT;shift++) {
      const begin=Math.max(1,1-shift);
      if(Math.min(A.length,B.length-shift)-begin < TRAIN+HOLD) continue;
      let train=0,heldout=0,trainN=0,heldoutN=0;
      for(let k=0;k<TRAIN+HOLD;k++) {
        const i=begin+k,x=A[i],y=B[i+shift];
        if(x<0||y<0)continue;
        const ll=odds[(x-y+M)%M];
        if(k<TRAIN){train+=ll;trainN++;}
        else{heldout+=ll;heldoutN++;}
      }
      out.push({a,b,shift,train,heldout,trainN,heldoutN});
    }
  }
  out.sort((x,y)=>y.train-x.train);
  return out;
}
function summarize(candidates) {
  const finalists=candidates.slice(0, TOP);
  return {
    tested:candidates.length,
    bestTrain:candidates[0],
    bestHeldoutAmongTop20:Math.max(...finalists.map(x=>x.heldout)),
    topFive:finalists.slice(0,5)
  };
}
function random(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
function draw(rng,n) { return (rng()>>>8)%n; }

/** Source-disjoint positive. Pair 2/5 shares a 28-pad at offset 73. */
function plant(seed) {
  const rng=random(seed), maxLen=Math.max(...EXPECTED), pair=[2,5], offset=73;
  const keys=original.map(()=>Array.from({length:maxLen},()=>draw(rng,M)));
  for(let i=1;i<EXPECTED[pair[0]];i++) {
    const j=i+offset;
    if(j>=1&&j<EXPECTED[pair[1]])keys[pair[1]][j]=keys[pair[0]][i];
  }
  const ciphertext=original.map((ref,index)=>{
    const at=draw(rng,gpHeldout.length-ref.length+1);
    const plain=gpHeldout.slice(at,at+ref.length);
    const cipher=encrypt(plain,keys[index],draw(rng,29));
    const recovered=decrypt(cipher,keys[index]);
    assert.deepEqual(recovered.slice(1),plain.slice(1));
    assert.deepEqual(encrypt(recovered,keys[index],cipher[0]),cipher);
    return cipher;
  });
  const candidates=scan(ciphertext.map(rank28));
  const position=candidates.findIndex(c=>c.a===pair[0]&&c.b===pair[1]&&c.shift===offset);
  assert.ok(position>=0);
  return {
    rank:position+1,
    inTop20:position<TOP,
    trueAlignment:candidates[position],
    selectedValidation:candidates[0].heldout,
    bestTop20Validation:Math.max(...candidates.slice(0,TOP).map(c=>c.heldout))
  };
}
/** A phase-randomized source null conserving each rank and EA inventory. */
function shuffledPhases(steps,rng) {
  return steps.map(s=>{
    const k=draw(rng,s.length);
    return s.slice(k).concat(s.slice(0,k));
  });
}
function run(options={}) {
  const nullTrials=options.nullTrials ?? 120,plantTrials=options.plantTrials ?? 24;
  const observed=scan(origSteps), summary=summarize(observed);
  const rng=random(0x5f18033);
  let exceed=0,stats=[];
  for(let k=0;k<nullTrials;k++) {
    const test=summarize(scan(shuffledPhases(origSteps,rng)));
    if(test.bestHeldoutAmongTop20>=summary.bestHeldoutAmongTop20)exceed++;
    stats.push(test.bestHeldoutAmongTop20);
  }
  const planted=[];
  for(let k=0;k<plantTrials;k++) planted.push(plant(0x57a1330+k*131));
  const markerCount=origSteps.reduce((n,row)=>n+row.slice(1).filter(x=>x<0).length,0);
  return {
    hypothesis:"EA sentinel + cyclic predecessor rank28; same modulo28 key across two source sections",
    originalRunes:EXPECTED.reduce((a,b)=>a+b,0),
    totalOriginalDoubletsWithinSections:markerCount,
    markerFractionTraining:gpTrain.filter(x=>x===28).length/gpTrain.length,
    scannedShiftRange:[-MAX_SHIFT,MAX_SHIFT],
    firstRunePerSection:"unscored IV",
    sourceGP:{train:gpTrain.length,holdout:gpHeldout.length},
    original:summary,
    matchedNull:{
      trials:nullTrials,seed:"0x05f18033",exceedances:exceed,
      pAddOne:(exceed+1)/(nullTrials+1),
      meanBestHeldoutAmongTop20:stats.reduce((a,b)=>a+b,0)/stats.length,
      maximumBestHeldoutAmongTop20:Math.max(...stats)
    },
    positive:{
      trials:plantTrials,sharePair:[2,5],shift:73,
      exactForwardAndInverseForEveryPlant:true,
      top1:planted.filter(x=>x.rank===1).length,
      top20:planted.filter(x=>x.inTop20).length,
      positiveHeldout:planted.filter(x=>x.trueAlignment.heldout>0).length,
      medianTrueHeldout:planted.map(x=>x.trueAlignment.heldout)
        .sort((a,b)=>a-b)[Math.floor(planted.length/2)],
      firstFive:planted.slice(0,5)
    }
  };
}
if(require.main===module) {
  const n=process.argv[2]===undefined?120:Number(process.argv[2]);
  const p=process.argv[3]===undefined?24:Number(process.argv[3]);
  assert.ok(Number.isInteger(n)&&n>=1&&n<=2000);
  assert.ok(Number.isInteger(p)&&p>=1&&p<=200);
  console.log(JSON.stringify(run({nullTrials:n,plantTrials:p}),null,2));
}
module.exports={encodeGP,rank28,encrypt,decrypt,scan,run};
