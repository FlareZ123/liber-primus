'use strict';
/**
 * LP2 GF(29) multiplicative-difference feedback model, original-source gate.
 * Run: node sims/lp2_gf29_delta_multiplicative_original_sft.cjs
 * Node 22, built-ins only. This does not recover an original plaintext/key.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const trans = read('resources/liber-primus/lp2-transcription.txt');
const textblob = read('resources/control/english_wordfreq_textblob.txt');
const index = new Map(db.runes.map((r, i) => [r, i]));
const tokens = db.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {number} n @returns {number} */
function mod(n) { return (n % 29 + 29) % 29; }
/** @param {number} a @returns {number} */
function inverse(a) {
  assert.notEqual(mod(a), 0, 'GF29 multiplier must be a unit');
  for (let k = 1; k < 29; k++) if (mod(k * a) === 1) return k;
  throw Error('missing multiplicative inverse');
}
/** @param {string} word @returns {number[] | null} */
function encode(word) {
  const w = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const out = [];
  for (let p = 0; p < w.length;) {
    const hit = tokens.find(t => w.startsWith(t.token, p));
    if (!hit) return null;
    out.push(hit.i);
    p += hit.token.length;
  }
  return out;
}
/** @param {number[]} v @returns {string} */
const shape = v => {
  const ids = new Map();
  return v.map(x => {
    if (!ids.has(x)) ids.set(x, ids.size);
    return ids.get(x);
  }).join(',');
};
/** @param {number[]} v @returns {string} */
function affineShape(v) {
  const first = v[0];
  const j = v.findIndex(x => x !== first);
  if (j < 0) return 'constant';
  const multInv = inverse(mod(v[j] - first));
  return v.map(x => mod((x - first) * multInv)).join(',');
}
const lexByLen = Array.from({length: 40}, () => []);
const weightedByLen = Array.from({length: 40}, () => []);
const lexExact = new Set();
for (const match of textblob.matchAll(/^([a-z]+) (\d+)$/gm)) {
  const values = encode(match[1]);
  if (values && values.length < 40) {
    lexByLen[values.length].push(values);
    weightedByLen[values.length].push({values, weight: Number(match[2])});
    lexExact.add(values.join(','));
  }
}
assert.equal(lexExact.size, 29058, 'source-native lexicon drift');
const affineSets = lexByLen.map(words => new Set(words.map(affineShape)));
const patternSets = lexByLen.map(words => new Set(words.map(shape)));
const words = [];
const runes = [];
let word = [], page = 0;
/** Finish printed word without splitting visual line wraps. */
function endWord() { if (word.length) { words.push(word); word = []; } }
for (const char of trans) {
  if (index.has(char)) {
    const item = {c: index.get(char), page: page >= 50 ? page + 1 : page,
      wordId: words.length};
    runes.push(item);
    word.push(item);
  } else if ('-.$&§'.includes(char)) {
    endWord();
  } else if (char === '%') {
    page++;
  }
}
endWord();
const original = db.pages.filter(x => x.page < 56 && x.indices.length);
assert.equal(original.length, 55);
for (const p of original) {
  assert.deepEqual(runes.filter(x => x.page === p.page).map(x => x.c),
    p.indices, 'source physical page mismatch: ' + p.page);
}
const unknown = words.filter(w => w[0].page <= 55);
assert.equal(unknown.length, 2896);
assert.equal(original.reduce((a, p) => a + p.indices.length, 0), 12956);
let previous = null, repeats = 0, eligible = 0, sourceTotal = 0;
let expectedEa = 0, expectedEaInitial = 0, observedBoundaryRepeats = 0;
const eaUnattainable = [];
const eligibleGroups = new Map();
const byLength = new Map();
const repeatMasks = [];
let missingLong = 0;
for (const wordItems of unknown) {
  const values = [], mask = [];
  let complete = true;
  for (const item of wordItems) {
    if (!previous || previous.page !== item.page) {
      mask.push(-1);
      complete = false;
    } else {
      const delta = mod(item.c - previous.c);
      values.push(delta);
      const z = delta === 0 ? 1 : 0;
      mask.push(z);
      repeats += z;
    }
    previous = item;
  }
  if (mask.includes(1)) repeatMasks.push({page: wordItems[0].page, len: mask.length, mask});
  const eligibleMask = mask.map(x => +(x >= 0)).join('');
  const groupKey = mask.length + ':' + eligibleMask;
  eligibleGroups.set(groupKey, (eligibleGroups.get(groupKey) || 0) + 1);
  if (mask[0] === 1) observedBoundaryRepeats++;
  const options = weightedByLen[mask.length] || [];
  let totalWeight = 0, eaWeight = 0, eaStartWeight = 0, compatible = false;
  for (const item of options) {
    totalWeight += item.weight;
    let count = 0, allowed = true;
    for (let j = 0; j < item.values.length; j++) {
      if (mask[j] < 0) continue;
      const z = +(item.values[j] === 28);
      count += z;
      if (mask[j] !== z) allowed = false;
    }
    eaWeight += item.weight * count;
    if (mask[0] >= 0 && item.values[0] === 28) eaStartWeight += item.weight;
    compatible ||= allowed;
  }
  if (totalWeight) {
    expectedEa += eaWeight / totalWeight;
    expectedEaInitial += eaStartWeight / totalWeight;
  }
  if (mask.includes(1) && !compatible) {
    eaUnattainable.push({page:wordItems[0].page, len:mask.length, mask:mask.join('')});
  }
  if (!complete) continue;
  assert.equal(values.length, wordItems.length);
  eligible++;
  sourceTotal += values.length;
  const L = values.length;
  const rec = byLength.get(L) || {words: 0, affine: 0, arbitrary: 0, fixedMult: 0};
  rec.words++;
  if (affineSets[L]?.has(affineShape(values))) rec.affine++;
  if (patternSets[L]?.has(shape(values))) rec.arbitrary++;
  // P_i = D_i / K - 1, any one 1..28 key shared by this printed word.
  if (Array.from({length:28}, (_, i) => i+1).some(k => {
    const inv = inverse(k);
    return lexExact.has(values.map(d => mod(d * inv - 1)).join(','));
  })) rec.fixedMult++;
  byLength.set(L, rec);
}
assert.equal(repeats, 86);
assert.equal(eligible, 2841);
assert.equal(repeatMasks.length, 85);
assert.equal(observedBoundaryRepeats, 23);
assert.equal(eaUnattainable.length, 5);
const allLong = [...byLength.entries()].filter(([len]) => len >= 6);
assert.equal(allLong.reduce((a, [len, rec]) => a + rec.words, 0), 791);
assert.equal(allLong.reduce((a, [len, rec]) => a + rec.affine, 0), 0);
assert.equal(allLong.reduce((a, [len, rec]) => a + rec.fixedMult, 0), 0);
// Fully specified wordlength-matched native-English sentinel distribution.
const singletonStats = [];
for (let sentinel = 0; sentinel < 29; sentinel++) {
  let expectedAll = 0, expectedInitial = 0;
  let varAll = 0, varInitial = 0, cov = 0;
  for (const [key, multiplicity] of eligibleGroups) {
    const [lenText, maskText] = key.split(':');
    const options = weightedByLen[Number(lenText)] || [];
    const eligible = [...maskText].map(x => x === '1');
    let n = 0, mx = 0, my = 0, xx = 0, yy = 0, xy = 0;
    for (const option of options) {
      const x = option.values.reduce((a, c, i) =>
        a + +(eligible[i] && c === sentinel), 0);
      const y = +(eligible[0] && option.values[0] === sentinel);
      const w = option.weight;
      n += w;
      mx += w*x;
      my += w*y;
      xx += w*x*x;
      yy += w*y*y;
      xy += w*x*y;
    }
    if (!n) continue;
    const u = mx/n, v = my/n;
    expectedAll += multiplicity*u;
    expectedInitial += multiplicity*v;
    varAll += multiplicity*(xx/n-u*u);
    varInitial += multiplicity*(yy/n-v*v);
    cov += multiplicity*(xy/n-u*v);
  }
  const diffAll = repeats-expectedAll;
  const diffInitial = observedBoundaryRepeats-expectedInitial;
  const determinant = varAll*varInitial-cov*cov;
  const squaredDistance = (varInitial*diffAll**2 -
    2*cov*diffAll*diffInitial + varAll*diffInitial**2)/determinant;
  assert(determinant > 0);
  singletonStats.push({rune:db.translit[sentinel],
    expectedAll:+expectedAll.toFixed(3),
    expectedInitial:+expectedInitial.toFixed(3),
    sdAll:+Math.sqrt(varAll).toFixed(3),
    sdInitial:+Math.sqrt(varInitial).toFixed(3),
    jointDistance:+Math.sqrt(squaredDistance).toFixed(3)});
}
singletonStats.sort((a, b) => a.jointDistance-b.jointDistance);
assert.equal(singletonStats[0].rune, 'G');
assert.equal(singletonStats[1].rune, 'EA');
const originalDelta = original.flatMap(p => p.indices.slice(1)
  .map((c, i) => mod(c - p.indices[i])));
const nonzero = Array.from({length:29}, (_, i) =>
  originalDelta.filter(x => x === i).length);
assert.equal(originalDelta.length, 12901);
assert.equal(nonzero[0], 86);
const chiMean = (12901 - 86) / 28;
const chi = nonzero.slice(1).reduce((s, c) => s + (c-chiMean)**2 / chiMean, 0);
// Complete known-original GP29 positive plant, no bypass or output-mutation.
const knownP57 = db.pages.find(p => p.page === 57).indices;
assert.equal(knownP57.length, 95);
// Insert a real EA-initial English word as an independent synthetic sentinel.
const eaWord = encode('each');
assert.deepEqual(eaWord, [28, 5, 8]);
const originalSolved = knownP57.concat(eaWord);
const key = originalSolved.map((_, i) => 1 + ((i * 17 + 5) % 28));
const cipher = []; let prev = 13;
for (let i = 0; i < originalSolved.length; i++) {
  const c = mod(prev + key[i] * (originalSolved[i] + 1));
  cipher.push(c); prev = c;
}
prev = 13;
const decoded = cipher.map((c, i) => {
  const plain = mod(mod(c - prev) * inverse(key[i]) - 1);
  prev = c;
  return plain;
});
assert.deepEqual(decoded, originalSolved, 'independent native LP2 plaintext plant');
assert.equal(cipher.filter((c, i) => c === (i ? cipher[i-1] : 13)).length,
  originalSolved.filter(v => v === 28).length,
  'the zero-step escape is exactly the rune EA');
const report = {
  original: {pages:55, runeCount:12956, words:unknown.length,
    withinPageAdjacent:12901, equalAdjacent:86, zeroBearingWords:85, observedBoundaryRepeats,
    expectedEaFromLengthAndWordFrequency:+expectedEa.toFixed(3),
    expectedEaWordInitial:+expectedEaInitial.toFixed(3),
    eaWordMaskMissing:eaUnattainable,
    all29SingletonNativeEnglishBest:singletonStats.slice(0,8),
    nonzeroDifferenceChiSquare27df:chi, differenceFrequencies:nonzero},
  hypothesis: 'C_i=C_(i-1)+K_i*(P_i+1) mod29, K_i in 1..28',
  keyIndependent: {eligibleWords:eligible, eligibleDeltaRunes:sourceTotal,
    wordsLen6OrMore:791, matchingAnyPerWordAffineNativeEnglish:0,
    matchingAnyPerWordConstantMultiplierNativeEnglish:0,
    lengths: Object.fromEntries([...byLength.entries()].sort((a,b)=>a[0]-b[0]))},
  syntheticPlant: {solvedOriginalGpRunes:knownP57.length,
    appendedNativeEnglishEaRunes:eaWord.length,
    exactRecovered:decoded.length, observedRepeatCount:cipher.filter((c,i) =>
      c === (i ? cipher[i-1] : 13)).length},
  limitations: 'Not a recovered original key or original plaintext. Native-English controls are finite, and a rune-varying multiplier is unconstrained by these exclusions.'
};
console.log(JSON.stringify(report, null, 2));
