'use strict';
/**
 * LP2 11-step recurrence and complete directed-edge-preserving null.
 * SFT: node sims/lp2_lag11_edge_preserving_sft.cjs
 * Node.js 22, built-ins only, no files written.
 *
 * This is a candidate-architecture gate, not a decipherment.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const original = pages.map(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(original.reduce((s, p) => s + p.length, 0), 12956);

/** @param {number} seed */
function makeRandom(seed) {
  let state = seed >>> 0;
  /** @returns {number} */
  function uint32() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  /** @param {number} n @returns {number} */
  return function index(n) {
    assert(n >= 1 && Number.isInteger(n));
    const limit = Math.floor(4294967296 / n) * n;
    let value;
    do { value = uint32(); } while (value >= limit);
    return value % n;
  };
}

/**
 * A uniformly shuffled outgoing-edge Euler trail. This retains every
 * *directed* rune-pair multiplicity exactly, as well as source start/end
 * runes, page length and per-page single-rune inventory.
 * @param {number[]} page
 * @param {(n:number)=>number} randomIndex
 * @returns {number[]}
 */
function randomizedTrail(page, randomIndex) {
  const outgoing = Array.from({length:29}, () => []);
  for (let i = 1; i < page.length; i++) outgoing[page[i - 1]].push(page[i]);
  for (const a of outgoing) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  const stack = [page[0]], trail = [];
  while (stack.length) {
    const v = stack[stack.length - 1];
    if (outgoing[v].length) stack.push(outgoing[v].pop());
    else trail.push(stack.pop());
  }
  trail.reverse();
  assert.equal(trail.length, page.length);
  assert.equal(trail[0], page[0]);
  assert.equal(trail.at(-1), page.at(-1));
  return trail;
}

/** @param {number[]} a @returns {number[]} */
function edgeCounts(a) {
  const histogram = Array(841).fill(0);
  for (let i = 1; i < a.length; i++) histogram[29 * a[i-1] + a[i]]++;
  return histogram;
}

/** @param {number[][]} source @returns {Int32Array} */
function lagCounts(source) {
  const h = new Int32Array(31);
  for (const page of source) {
    for (let i = 2; i < page.length; i++) {
      for (let lag = 2; lag <= 30 && lag <= i; lag++) {
        if (page[i] === page[i-lag]) h[lag]++;
      }
    }
  }
  return h;
}
const observed = lagCounts(original);
assert.equal(observed[11], 363);
assert.equal(observed[21], 369);
assert.equal(pages.find(p=>p.page === 29).indices.length, 277);
const preliminary = makeRandom(0x11221122);
for (const page of original) {
  const candidate = randomizedTrail(page, preliminary);
  assert.deepEqual(edgeCounts(candidate), edgeCounts(page));
}

const N = 2000;
const randomIndex = makeRandom(0x20261113);
const acc = Array.from({length:31}, () => ({sum:0, sq:0, atMost:0}));
const simulated = [];
for (let r = 0; r < N; r++) {
  const counts = lagCounts(original.map(page=>randomizedTrail(page,randomIndex)));
  simulated.push(counts);
  for (let lag = 2; lag <= 30; lag++) {
    const x=counts[lag], a=acc[lag];
    a.sum+=x;
    a.sq+=x*x;
    if (x<=observed[lag]) a.atMost++;
  }
}
const mean=acc.map(a=>a.sum/N);
const sd=acc.map((a,i)=>Math.sqrt(a.sq/N-mean[i]**2));
const z=acc.map((_,i)=>(observed[i]-mean[i])/sd[i]);
const minZ=Math.min(...z.slice(2));
const lowestLag=z.indexOf(minZ);
let familyExtreme=0;
for (const sample of simulated) {
  let score=Infinity;
  for (let lag=2;lag<=30;lag++) score=Math.min(score,(sample[lag]-mean[lag])/sd[lag]);
  if (score<=minZ) familyExtreme++;
}
assert.equal(lowestLag,11);
assert.equal(familyExtreme,132);
assert.equal(acc[11].atMost,6);
assert.equal(acc[21].atMost,71);

// Page p29 is a postselected local outlier: count it without
// misrepresenting its uncorrected 11-lag tail as global evidence.
const p29=pages.find(p=>p.page===29).indices;
const localRandom=makeRandom(0x0a11cd11), localN=20000;
let localZeros=0,localTotal=0;
for (let trial=0;trial<localN;trial++) {
  const candidate=randomizedTrail(p29,localRandom);
  let hits=0;
  for (let i=11;i<candidate.length;i++) if (candidate[i]===candidate[i-11]) hits++;
  localTotal+=hits;
  if (!hits) localZeros++;
}
assert.equal(localZeros,2);
assert.equal(localTotal,179004);

// A motivated but unsuccessful direct consumer: p32 source 11x11
// ordinal and GP-prime axis sums, repeated as an eleven-rune Vigenere
// key over the preceding visual chapter p27--31, without fitted phase.
const square=pages.find(p=>p.page===32).indices;
assert.equal(square.length,121);
const keys={};
for(const weight of ['ordinal','prime']) {
  const value=r=>weight==='prime'?corpus.prime[r]:r;
  keys[weight+'_row']=Array.from({length:11},(_,i)=>square.slice(i*11,i*11+11)
    .reduce((s,r)=>s+value(r),0)%29);
  keys[weight+'_col']=Array.from({length:11},(_,i)=>Array.from({length:11},
    (_,j)=>value(square[11*j+i])).reduce((s,r)=>s+r,0)%29);
}
const source=pages.filter(p=>p.page>=27&&p.page<=31);
const known=corpus.pages.find(p=>p.page===57).indices;
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const h=Array(29).fill(0);
  for (const x of data) h[x]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(data.length*(data.length-1));
}
const candidateScores=[];
for(const [name,key] of Object.entries(keys)) for(const sign of [-1,1]) {
  const decoded=source.flatMap(p=>p.indices.map((x,i)=>(x+sign*key[i%11]+58)%29));
  candidateScores.push({name,sign,ioc:ioc(decoded)});
  const planted=known.map((x,i)=>(x-sign*key[i%11]+58)%29);
  assert.deepEqual(planted.map((x,i)=>(x+sign*key[i%11]+58)%29),known);
}
candidateScores.sort((a,b)=>b.ioc-a.ioc);
assert.equal(candidateScores[0].name,'prime_row');
assert.equal(candidateScores[0].sign,1);

console.log(JSON.stringify({
  input:{pages:55,runes:12956,sourceSquare:121},
  observed:{lag11:observed[11],lag21:observed[21],p29Lag11:0},
  null:{n:N,seed:'0x20261113',source:'exact per-page directed 29x29 edge counts',
    lag11:{mean:mean[11],sd:sd[11],p:(acc[11].atMost+1)/(N+1)},
    lag21:{mean:mean[21],p:(acc[21].atMost+1)/(N+1)},
    corrected:{scan:'lags 2--30',lowestLag,z:minZ,
      extremes:familyExtreme,p:(familyExtreme+1)/(N+1)}},
  page29:{n:localN,zeroCount:localZeros,mean:localTotal/localN,
    pUncorrected:(localZeros+1)/(localN+1)},
  directInverse:{best:candidateScores[0],all:candidateScores}
},null,2));
