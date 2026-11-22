'use strict';

/**
 * Exact all-secret-seed GF29 additive Fibonacci lag8+lag13 gate for original LP2.
 * Original page-15 Fibonacci spiral and thirteen giant illuminated initials
 * motivate a 13-state candidate; they do not authenticate this cipher family.
 * Windows Node.js 22: node sims/lp2_giant13_fib8_13_allseed_hist_sft.cjs
 * Read-only test; all inputs already checked into the repository.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tokens = source.translit.map((s,i) => ({s,i}))
  .sort((a,b) => b.s.length - a.s.length);
const mod29 = n => ((n % 29) + 29) % 29;

/**
 * Source-authenticated GP orthography: solved LP1 requires ING -> ᛝ (21),
 * IO -> ᛡ (27), and QU/K/Q/V/Z substitutions. Preserve word boundaries.
 * @param {string} text @returns {number[]}
 */
function encodeNativeGP(text) {
  const clean = text.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i=0; i<word.length;) {
      if (word.startsWith('ING',i)) {out.push(21); i += 3; continue;}
      if (word.startsWith('IO',i)) {out.push(27); i += 2; continue;}
      const t = tokens.find(t => word.startsWith(t.s,i));
      assert.ok(t, 'native GP token absent: '+word);
      out.push(t.i); i += t.s.length;
    }
  }
  return out;
}

/** @param {number[]} a @returns {Int32Array} */
function recurrenceResidual(a) {
  const out = new Int32Array(a.length - 13);
  for (let i=13;i<a.length;i++) {
    out[i-13] = mod29(a[i] - a[i-8] - a[i-13]);
  }
  return out;
}
/** @param {Int32Array} a @returns {Int32Array} */
function histogram(a) {
  const hist = new Int32Array(29);
  for (const x of a) hist[x] += 1;
  return hist;
}
/**
 * Exact optimistic lower bound on exception/rekey positions for ANY
 * 13-symbol secret additive recurrence seed, minimizing over every
 * consecutive full-length source-native English window.
 * @param {number[]} original
 * @param {number[]} control
 * @returns {{windows:number,minFaults:number,bestWindow:number,minRate:number,zeroMatches:number}}
 */
function minHistogramFaults(original, control) {
  const target = histogram(recurrenceResidual(original));
  const r = recurrenceResidual(control);
  const size = original.length - 13;
  assert.ok(r.length >= size, 'native control covers original length');
  const h = histogram(r.slice(0,size));
  let best = Infinity, at = -1, zero = 0;
  for (let j = 0; j <= r.length - size; j += 1) {
    let l1 = 0;
    for (let symbol = 0; symbol < 29; symbol += 1) {
      l1 += Math.abs(h[symbol] - target[symbol]);
    }
    const faults = l1 / 2;
    assert.equal(faults, Math.floor(faults));
    if (faults < best) {best = faults; at = j;}
    if (faults === 0) zero += 1;
    if (j < r.length - size) {
      h[r[j]] -= 1; h[r[j + size]] += 1;
    }
  }
  return {
    windows: r.length-size+1, minFaults:best, bestWindow:at,
    minRate:best/size, zeroMatches:zero
  };
}
/** @param {number[]} seed @param {number} n @returns {number[]} */
function fibKey(seed,n) {
  const out = seed.slice();
  for (let i=13;i<n;i++) out.push(mod29(out[i-8]+out[i-13]));
  return out;
}
const seed = [15,20,13,24,14,20,1,19,23,21,27,0,24];
assert.equal(seed.length,13);
const p0 = [
  ...source.pages[0].indices.slice(13), ...source.pages[1].indices,
  ...source.pages[2].indices
];
const p3 = source.pages.slice(3,8).flatMap(p=>p.indices);
const full = source.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(p0.length,716);
assert.equal(p3.length,1145);
assert.equal(full.length,12956);
const clear = source.pages[57].indices;
assert.equal(clear.length,95);
const allKeys = [seed, seed.map((x,i)=>mod29(7*x+3*i+1))];
for (const k0 of allKeys) {
  const k = fibKey(k0, clear.length);
  const encrypted = clear.map((x,i)=>mod29(x+k[i]));
  assert.deepEqual([...recurrenceResidual(encrypted)],
    [...recurrenceResidual(clear)],
    'all-secret key annihilator positive on genuine solved original GP');
  assert.deepEqual(encrypted.map((c,i)=>mod29(c-k[i])),clear);
  assert.equal(minHistogramFaults(encrypted,clear).minFaults,0);
}
const probes = [
  {name:'p0 black and p1–2',original:p0,expected:[42,45,43],
    expectedWindows:[216391,61777,320612]},
  {name:'p3–7 complete holdout',original:p3,expected:[59,49,58],
    expectedWindows:[215962,61348,320183]},
  {name:'all unknown p0–55',original:full,expected:[335,370,322],
    expectedWindows:[204151,49537,308372]}
];
const references = [
  ['Shakespeare','resources/control/shakespeare_first300k.txt',217106],
  ['Gibran','resources/control/gibran_prophet_58585.txt',62492],
  ['Emerson','resources/control/emerson_essays_2944.txt',321327]
].map(([name,file,expected])=>{
  const encoded = encodeNativeGP(read(file));
  assert.equal(encoded.length,expected,'known source-calibrated GP control');
  return {name,file,encoded};
});
const report = probes.map(p=>{
  const controls=references.map((r,i)=>{
    const gate = minHistogramFaults(p.original,r.encoded);
    assert.equal(gate.minFaults,p.expected[i]);
    assert.equal(gate.windows,p.expectedWindows[i]);
    assert.equal(gate.zeroMatches,0);
    return {reference:r.name,nativeRunes:r.encoded.length,...gate};
  });
  return {name:p.name,originalRunes:p.original.length,
    residualCount:p.original.length-13,controls};
});

const chapterRanges = [[0,2],[3,7],[8,14],[15,22],[23,26],
  [27,32],[33,39],[40,53],[54,55]];
const expectedChapterMinima = [
  [41,45,42], [59,49,58], [69,106,87], [73,95,96],
  [41,60,49], [81,82,82], [84,90,76], [92,103,97],
  [24,26,22]
];
const visualChapters = chapterRanges.map(([first,last],i) => {
  const original=source.pages.slice(first,last+1).flatMap(p=>p.indices);
  const actual=references.map(r=>minHistogramFaults(original,r.encoded));
  assert.deepEqual(actual.map(x=>x.minFaults),expectedChapterMinima[i]);
  assert.ok(actual.every(x=>x.minFaults>0 && x.zeroMatches===0));
  return {
    pages:'p'+first+'–'+last,runicCount:original.length,
    residualCount:original.length-13,
    minRequiredFaults:actual.map(x=>x.minFaults),
    bestNativeFaultLowerBound:Math.min(...actual.map(x=>x.minFaults))
  };
});
assert.equal(visualChapters.reduce((n,c)=>n+c.runicCount,0),12956);
assert.equal(visualChapters.length,9);
console.log(JSON.stringify({
  model:'K_i=(K_(i-8)+K_(i-13)) mod29, no exceptions',
  theorem:'Y(C)=Y(P) for ALL secret initial K[0..12]',
  calibration:'GP words with attested ING=21 and IO=27',
  originalSamples:report,
  visualChapterIndependentInitialKeys:visualChapters,
  positive:'two independent source-native p57 plants, each 82/82 filtered and 95/95 plaintext recovered',
  result:'No direct all-seed 13-state Fibonacci additive GP-native decoding is compatible with any of the 3 source control windows. Reported faults are exact optimistic exceptions to this model; no actual plaintext recovered.'
},null,2));
