'use strict';
/**
 * Test whether the LP2 word-internal lag-five S echo could be an ordinary
 * English S passthrough under any memoryless, position-independent channel
 * that preserves the manuscript's exact observed output S frequency.
 *
 * Crucial distinction: the positive control protects source S-S *pairs*,
 * so a pair-aware encoder is distinguishable from independent passthrough.
 *
 * Node.js 22: node sims/lag5_S_passthrough_channel.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { parseUnsolved, random32 } = require('./lag6_conditioned_echo.cjs');
const { encode } = require('./relative_key_english_probe.cjs');

const root = path.resolve(__dirname, '..');
const transcript = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const shakespeare = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const words = parseUnsolved(transcript);
const S = 15;
const SHIFT = 5;
const SEED = 0x51ca5e55;
const DRAWS = 12000;
const targetLengths = words.map((word) => word.length);
const R = words.reduce((a, x) => a + x.length, 0);
const observedS = words.reduce((a, x) => a + x.filter((symbol) => symbol === S).length, 0);
const observedPairs = words.reduce((a, x) => {
  let count = 0;
  for (let i = SHIFT; i < x.length; i++) count += Number(x[i] === S && x[i - SHIFT] === S);
  return a + count;
}, 0);
assert.equal(words.length, 2896);
assert.equal(R, 12956);
assert.equal(observedS, 434);
assert.equal(observedPairs, 11);

const english = (shakespeare.match(/[A-Za-z]+/gu) || []).map(encode).filter((word) => word.length);
const bins = new Map();
for (const word of english) {
  if (!bins.has(word.length)) bins.set(word.length, []);
  bins.get(word.length).push(word);
}
for (const length of targetLengths) {
  assert.ok(bins.has(length), 'missing English word length ' + length);
}

/**
 * @param {number[]} source Rune indexes
 * @returns {[number,number,number,number]}
 */
function features(source) {
  const s = source.filter((rune) => rune === S).length;
  let a = 0, b = 0, d = 0;
  for (let i = SHIFT; i < source.length; i++) {
    const x = Number(source[i] === S) + Number(source[i-SHIFT] === S);
    if (x === 2) a++;
    if (x === 1) b++;
    if (x === 0) d++;
  }
  return [s, a, b, d];
}

// Exact conditional-on-word-length empirical English reference moments.
// Every target word length has its own *fixed* Shakespeare bin.
const lengths = new Map();
for (const length of targetLengths) lengths.set(length, (lengths.get(length) || 0) + 1);
const expected = new Float64Array(4);
for (const [length, count] of lengths) {
  const examples = bins.get(length);
  for (const source of examples) {
    const x = features(source);
    for (let k = 0; k < 4; k++) expected[k] += count * x[k] / examples.length;
  }
}
const sourceSRate = expected[0] / R;
const targetSRate = observedS / R;
const maxRetention = targetSRate / sourceSRate;
assert.ok(maxRetention > 0 && maxRetention < 1);
const expectation = (retention) => {
  const falseS = (targetSRate - sourceSRate*retention) / (1-sourceSRate);
  return expected[1] * retention**2 + expected[2] * retention * falseS + expected[3] * falseS**2;
};
// The expected-pair count is quadratic over 0..maxRetention, so endpoints
// plus one interior stationary point suffice for an exact finite maximizer.
const candidates = [{r:0, mean:expectation(0)}, {r:maxRetention, mean:expectation(maxRetention)}];
const h = maxRetention / 3;
const v0 = expectation(0), vh=expectation(h), v2h=expectation(2*h);
const qa = (v2h - 2*vh + v0) / (2*h*h);
const qb = (vh - v0 - qa*h*h) / h;
if (qa < 0) {
  const vertex = -qb/(2*qa);
  if (vertex > 0 && vertex < maxRetention) candidates.push({r:vertex,mean:expectation(vertex)});
}
candidates.sort((x,y) => y.mean-x.mean);
const best = candidates[0];

// Exact-S-count conditional Monte Carlo under the favorable endpoint
// r = observedS / expectedEnglishS and f = 0. This is an analytically
// motivated maximum, not an unconstrained fitted candidate.
const rand = random32(SEED);
const counts = new Int32Array(1 + R);
const histogram = new Map();
let exceed = 0, sum = 0, sum2 = 0, max = 0;
const takeRandom = (arr, count) => {
  for (let i=0;i<count;i++) {
    const j = i + rand()%(arr.length-i);
    const temp = arr[j]; arr[j]=arr[i]; arr[i]=temp;
  }
};
// Plant a pair-aware positive channel by protecting BOTH S endpoints
// of English S-at-lag5 pairs before completing the 434-site S budget.
let plantedCount = null, plantedProtected = null;
for (let trial = 0; trial < DRAWS + 1; trial++) {
  const sourceS = [];
  const sourcePairs = [];
  let offset = 0;
  for (const len of targetLengths) {
    const arr = bins.get(len), picked = arr[rand() % arr.length];
    for (let j=0;j<len;j++) if (picked[j]===S) sourceS.push(offset+j);
    for (let j=SHIFT;j<len;j++)
      if (picked[j]===S && picked[j-SHIFT]===S)
        sourcePairs.push([offset+j-SHIFT,offset+j]);
    offset += len;
  }
  assert.equal(offset,R);
  assert.ok(sourceS.length >= observedS);
  const selected = new Uint8Array(R);
  if (trial < DRAWS) {
    takeRandom(sourceS, observedS);
    for(let j=0;j<observedS;j++)selected[sourceS[j]]=1;
    let hits=0;
    for(const [a,b] of sourcePairs) hits+=selected[a]&selected[b];
    sum+=hits;sum2+=hits*hits;max=Math.max(max,hits);
    histogram.set(hits,(histogram.get(hits)||0)+1);
    if(hits>=observedPairs)exceed++;
  } else {
    for(const [a,b] of sourcePairs)selected[a]=selected[b]=1;
    const protectedCount=selected.reduce((a,b)=>a+b,0);
    assert.ok(protectedCount < observedS);
    const available = sourceS.filter(site=>!selected[site]);
    takeRandom(available, observedS-protectedCount);
    for(let j=0;j<observedS-protectedCount;j++)selected[available[j]]=1;
    let hits=0;
    for(const [a,b] of sourcePairs) hits+=selected[a]&selected[b];
    plantedCount=hits;
    plantedProtected=protectedCount;
    assert.equal(selected.reduce((a,b)=>a+b,0), observedS);
    assert.equal(hits,sourcePairs.length);
  }
}
console.log(JSON.stringify({
  hypothesis:'memoryless selective S passthrough on GP-English words at the exact observed 434/12956 S output rate',
  source:{name:'Shakespeare first300k, GP digraph encoder',sha256:crypto.createHash('sha256').update(shakespeare).digest('hex'),
    words:english.length,matchedLengths:[...lengths].sort((a,b)=>a[0]-b[0]).map(([length,count])=>({length,count,sourceBin:bins.get(length).length}))},
  observed:{words:words.length,runes:R,S:observedS,SRate:targetSRate,withinWordLag5SPairs:observedPairs},
  expectedSourceMoments:{S:expected[0],SRate:sourceSRate,bothS:expected[1],exactlyOneS:expected[2],neitherS:expected[3]},
  channelModel:{retentionRange:[0,maxRetention],maxExpectedLag5Pairs:best.mean,
    maximizingSRetention:best.r,maxEndpointMean:expectation(maxRetention),zeroRetentionMean:expectation(0)},
  conditionalSCountSimulation:{draws:DRAWS,seed:'0x'+SEED.toString(16),method:'length-matched English words, exactly 434 source-S positions independently retained',
    mean:sum/DRAWS,sd:Math.sqrt(sum2/DRAWS-(sum/DRAWS)**2),max,
    exceedAtLeast11:exceed,empiricalUpperTail:(exceed+1)/(DRAWS+1),
    histogram:Object.fromEntries([...histogram].sort((a,b)=>a[0]-b[0]))},
  pairAwarePlant:{protectedSourceSPositions:plantedProtected,SCount:observedS,lag5SPairs:plantedCount,
    interpretation:'A pair-protecting channel can deliberately reproduce such events without changing the S budget.'},
  caveat:'Bound pertains to memoryless S-specific passthrough with matched Shakespeare GP words; a pair-aware channel or a different language distribution can exceed it. No plaintext or key recovered.'
},null,2));
