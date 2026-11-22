"use strict";

/**
 * Original-cipher differential reserved-plaintext-rune test.
 *
 * For each authentic whole printed word, hypothesize
 *   C[j] = C[j-1] + k[j] * (P[j] - x) (mod 29), j >= 1,
 * with one fixed plaintext sentinel x and independently unknown
 * invertible k[j] in GF(29)*. Word-initial ciphertext has an
 * independent unknown offset.
 *
 * Exact key-independent discriminator:
 *   C[j] == C[j-1]  iff  P[j] == x.
 *
 * The model is a reversible hypothesis, not a recovered historical
 * cipher. Source-native English is conditional and must not be treated
 * as known plaintext.
 *
 * Windows 11 / Node.js 22 / CommonJS read-only SFT:
 * node sims/lp2_differential_reserved_rune_allsecret_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(__dirname, "..", relative), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const glyph = new Map(gp.runes.map((r, i) => [r, i]));
const source = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("")
  .replace(/\/\r?\n/g, "")
  .replace(/[\r\n%]/g, "");
const pattern = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const original = (source.match(pattern) || [])
  .map(w => Array.from(w, r => glyph.get(r)));
const originalCipher = gp.pages.filter(p => p.page <= 55 && p.indices.length)
  .flatMap(p => p.indices);
assert.equal(original.length, 2896);
assert.equal(originalCipher.length, 12956);
assert.deepEqual(original.flat(), originalCipher);
const runeTransitions = originalCipher.length - original.length;
assert.equal(runeTransitions, 10060);

const mod = n => (n % 29 + 29) % 29;
function inverse(x) {
  assert(x > 0 && x < 29);
  for (let k = 1; k < 29; k++)
    if (x * k % 29 === 1) return k;
  throw Error("nonzero GF29 element without inverse");
}

/** @param {number[]} w @returns {string} */
function doubletMask(w) {
  let mask = "";
  for (let j = 1; j < w.length; j++)
    mask += Number(w[j] === w[j - 1]);
  return mask;
}
/** @param {number[]} w @param {number} anchor @returns {string} */
function anchorMask(w, anchor) {
  let mask = "";
  for (let j = 1; j < w.length; j++)
    mask += Number(w[j] === anchor);
  return mask;
}
const observedMasks = original.map(doubletMask);
const eventCount = observedMasks.join("").split("1").length - 1;
const eventWords = observedMasks.filter(m => m.includes("1")).length;
assert.equal(eventCount, 63);
assert.equal(eventWords, 62);
let boundaryDoublets = 0;
for (let wi = 1; wi < original.length; wi++)
  boundaryDoublets += Number(original[wi][0] === original[wi - 1].at(-1));
assert.equal(boundaryDoublets, 23);
assert.equal(eventCount + boundaryDoublets, 86);

/**
 * Exact distribution-free word-reset diagnostic. If every next
 * word-initial cipher rune is independently uniformly masked by
 * a fresh GF29 IV, the indicator "equals previous ciphertext"
 * is iid Bernoulli(1/29), regardless of plaintext and the
 * within-word encoder. This directly tests the proposed
 * independently random 2,895 word resets on unchanged source.
 *
 * @param {number} n
 * @param {number} maxHits
 * @param {number} p
 */
function binomialLowerTail(n, maxHits, p) {
  let mass = Math.pow(1 - p, n);
  let total = mass;
  for (let h = 1; h <= maxHits; h++) {
    mass *= (n - h + 1) / h * p / (1 - p);
    total += mass;
  }
  return total;
}
const independentUniformWordIV = {
  events: boundaryDoublets,
  eligibleBoundaries: original.length - 1,
  modelCollisionProbability: 1 / 29,
  expectedEvents: (original.length - 1) / 29,
  lowerTailProbability: binomialLowerTail(
    original.length - 1, boundaryDoublets, 1 / 29),
  internalObservedRate: eventCount / runeTransitions,
  boundaryObservedRate: boundaryDoublets / (original.length - 1)
};
assert(independentUniformWordIV.lowerTailProbability > 0 &&
  independentUniformWordIV.lowerTailProbability < 1e-18);

// Source-only modular-hop diagnostic, partitioned by genuine printed words.
// Every possible GP29 step is counted, with no proposed plaintext or key.
// Conditional on a nonzero step, a uniform 28-ary output carrier predicts
// a uniform distribution on residues 1..28 on either side of delimiters.
const internalHops = new Uint32Array(29);
const boundaryHops = new Uint32Array(29);
original.forEach((w, wi) => {
  for (let j = 1; j < w.length; j++)
    internalHops[mod(w[j] - w[j - 1])]++;
  if (wi)
    boundaryHops[mod(w[0] - original[wi - 1].at(-1))]++;
});
assert.equal(internalHops.reduce((a, b) => a + b, 0), 10060);
assert.equal(boundaryHops.reduce((a, b) => a + b, 0), 2895);
assert.equal(internalHops[0], 63);
assert.equal(boundaryHops[0], 23);
/** @param {Uint32Array} row */
function chiSquareNonzeroUniform(row) {
  const positive = row.slice(1);
  const n = positive.reduce((a, b) => a + b, 0);
  const expected = n / 28;
  return positive.reduce((sum, count) =>
    sum + (count - expected) ** 2 / expected, 0);
}
/** Homogeneity statistic for two 28-bin observed count vectors. */
function chiSquareHopHomogeneity(a, b) {
  const nA = a.slice(1).reduce((x, y) => x + y, 0);
  const nB = b.slice(1).reduce((x, y) => x + y, 0);
  let chi = 0;
  for (let j = 1; j < 29; j++) {
    const total = a[j] + b[j];
    const expectedA = total * nA / (nA + nB);
    const expectedB = total * nB / (nA + nB);
    chi += (a[j] - expectedA) ** 2 / expectedA
      + (b[j] - expectedB) ** 2 / expectedB;
  }
  return chi;
}
const hopDiagnostic = {
  internal: Array.from(internalHops),
  boundary: Array.from(boundaryHops),
  nonzeroInternalUniformChiSq27df: chiSquareNonzeroUniform(internalHops),
  nonzeroBoundaryUniformChiSq27df: chiSquareNonzeroUniform(boundaryHops),
  internalVsBoundaryNonzeroChiSq27df:
    chiSquareHopHomogeneity(internalHops, boundaryHops)
};
const lengths = new Map();
for (const w of original)
  lengths.set(w.length, (lengths.get(w.length) || 0) + 1);

/** @param {string} relative @param {boolean} spellingDictionary */
function loadDonor(relative, spellingDictionary) {
  const raw = read(relative);
  const tokens = spellingDictionary
    ? raw.split(/\r?\n/).filter(line => /^[a-z]+\s+\d+$/.test(line))
        .map(line => line.split(/\s+/)[0])
    : raw.match(/[A-Za-z]+/g) || [];
  const byLength = new Map();
  for (const token of tokens) {
    const w = encodeSourceNativeGP(token);
    const pool = byLength.get(w.length) || [];
    pool.push({token, runes: w});
    byLength.set(w.length, pool);
  }
  return {name: path.basename(relative), tokenCount: tokens.length, byLength};
}
const sources = [
  loadDonor("resources/control/shakespeare_first300k.txt", false),
  loadDonor("resources/control/gibran_prophet_58585.txt", false),
  loadDonor("resources/control/emerson_essays_2944.txt", false)
];
const dictionary = loadDonor(
  "resources/control/english_wordfreq_textblob.txt", true);
assert.equal(dictionary.tokenCount, 29157);
for (const donor of [...sources, dictionary])
  for (const n of lengths.keys())
    assert(donor.byLength.has(n), donor.name + " missing length " + n);

/**
 * Exact native-word support for each observed whole-word event pattern.
 * This records lexical support, not the probability of the entire book.
 */
function maskCoverage(donor, anchor) {
  const index = new Set();
  for (const [len, pool] of donor.byLength) {
    for (const entry of pool)
      index.add(len + "|" + anchorMask(entry.runes, anchor));
  }
  const missing = [];
  for (let wi = 0; wi < original.length; wi++) {
    const key = original[wi].length + "|" + observedMasks[wi];
    if (!index.has(key)) missing.push(wi);
  }
  return {missingCount: missing.length, firstMissing: missing.slice(0, 12)};
}

/**
 * Expected number and SD of sentinel occurrences at positions >=1
 * from independent length-matched uniform donor-token draws.
 * Includes within-word position covariance by using a per-word
 * occurrence count distribution; it assumes independent word slots.
 */
function countMoments(donor, anchor) {
  let expected = 0, variance = 0;
  for (const [len, multiplicity] of lengths) {
    const pool = donor.byLength.get(len);
    let sum = 0, squares = 0;
    for (const {runes} of pool) {
      let hits = 0;
      for (let j = 1; j < runes.length; j++)
        hits += Number(runes[j] === anchor);
      sum += hits;
      squares += hits * hits;
    }
    const mean = sum / pool.length;
    expected += multiplicity * mean;
    variance += multiplicity * (squares / pool.length - mean * mean);
  }
  return {
    expected: Number(expected.toFixed(4)),
    sd: Number(Math.sqrt(variance).toFixed(4)),
    z: Number(((eventCount - expected) / Math.sqrt(variance)).toFixed(4))
  };
}

/**
 * Contrasting continuous stream that *does not* reset at printed
 * word boundaries. Its global stationary sentinel must account for
 * the 23 cross-word doublets as occurrences of that same plaintext x
 * in first position of each new word. Draw independently by the
 * EXACT original word-length slots, omitting only the first word.
 */
function boundaryMoments(donor, anchor) {
  const slotCounts = new Map();
  for (const w of original.slice(1))
    slotCounts.set(w.length, (slotCounts.get(w.length) || 0) + 1);
  let mean = 0, variance = 0;
  for (const [len, n] of slotCounts) {
    const pool = donor.byLength.get(len);
    const prob = pool.reduce((sum, {runes}) =>
      sum + Number(runes[0] === anchor), 0) / pool.length;
    mean += n * prob;
    variance += n * prob * (1 - prob);
  }
  return {
    expected: Number(mean.toFixed(4)),
    sd: Number(Math.sqrt(variance).toFixed(4)),
    z: Number(((boundaryDoublets - mean) /
      Math.sqrt(variance)).toFixed(4))
  };
}

/** @param {number[]} p @param {number} anchor @param {number} iv @param {number[]} keys */
function encrypt(p, anchor, iv, keys) {
  assert.equal(keys.length, p.length - 1);
  const c = [mod(p[0] + iv)];
  for (let j = 1; j < p.length; j++) {
    assert(keys[j - 1] >= 1 && keys[j - 1] <= 28);
    c.push(mod(c[j - 1] + keys[j - 1] * mod(p[j] - anchor)));
  }
  return c;
}
/** @param {number[]} c @param {number} anchor @param {number} iv @param {number[]} keys */
function decrypt(c, anchor, iv, keys) {
  assert.equal(keys.length, c.length - 1);
  const p = [mod(c[0] - iv)];
  for (let j = 1; j < c.length; j++)
    p.push(mod(anchor + mod(c[j] - c[j - 1]) *
      inverse(keys[j - 1])));
  return p;
}

/**
 * For any proposed known plaintext with the exact observed equality
 * mask, derive unrestricted per-rune keys that reproduce the original.
 * This demonstrates the key identifiability problem explicitly.
 */
function recoverFittedKeys(c, p, anchor) {
  assert.equal(c.length, p.length);
  const iv = mod(c[0] - p[0]);
  const keys = [];
  for (let j = 1; j < c.length; j++) {
    const delta = mod(c[j] - c[j - 1]);
    const distance = mod(p[j] - anchor);
    assert.equal(delta === 0, distance === 0);
    keys.push(delta === 0 ? 1 : mod(delta * inverse(distance)));
  }
  assert.deepEqual(encrypt(p, anchor, iv, keys), c);
  assert.deepEqual(decrypt(c, anchor, iv, keys), p);
  return {iv, keys};
}

// Genuine independently solved cleartext from the separate LP2 p57
// (a synthetic cipher-positive, never a claim it used this new cipher).
const refP57 = read("resources/liber-primus/lp1-plaintext-reference.txt")
  .replace(/\r\n/g, "\n").split("### 57\n")[1].trim();
const p57Words = (refP57.match(/[A-Z]+/g) || []).map(w => encodeSourceNativeGP(w));
assert.equal(p57Words.length, 20);
assert.deepEqual(p57Words.flat(), gp.pages[57].indices);
for (const anchor of [17, 18, 27]) {
  let hits = 0;
  for (const [wi, p] of p57Words.entries()) {
    const iv = (wi * 3 + 7) % 29;
    const keys = Array.from({length: p.length - 1},
      (_, j) => 1 + (wi * 7 + (j + 1) * 11) % 28);
    const c = encrypt(p, anchor, iv, keys);
    assert.deepEqual(decrypt(c, anchor, iv, keys), p);
    assert.equal(doubletMask(c), anchorMask(p, anchor));
    hits += p.length;
  }
  assert.equal(hits, 95);
}

// A second solved-p57 positive validates the truly continuous clock:
for (const anchor of [17, 18, 27]) {
  const p = p57Words.flat();
  const keys = Array.from({length: p.length - 1},
    (_, j) => 1 + (7 * j + 3) % 28);
  const c = encrypt(p, anchor, 11, keys);
  assert.deepEqual(decrypt(c, anchor, 11, keys), p);
  assert.equal(doubletMask(c), anchorMask(p, anchor));
  assert.equal(c.length, 95);
}

// Two distinct complete 12,956-rune source-native dictionary assignments
// under x=E, each fitted to the *same unchanged original ciphertext*.
// They are synthetic ambiguous explanations, not plaintext recoveries.
const ANCHOR_E = gp.translit.indexOf("E");
assert.equal(ANCHOR_E, 18);
const choices = new Map();
for (const [len, pool] of dictionary.byLength) {
  for (const entry of pool) {
    const key = len + "|" + anchorMask(entry.runes, ANCHOR_E);
    const found = choices.get(key);
    if (found) found.push(entry);
    else choices.set(key, [entry]);
  }
}
const alternatives = [[], []];
const example = [];
for (let wi = 0; wi < original.length; wi++) {
  const c = original[wi];
  const candidates = choices.get(c.length + "|" + observedMasks[wi]) || [];
  assert(candidates.length > 0, "missing E anchor witness for word " + wi);
  const first = candidates[0], last = candidates[candidates.length - 1];
  alternatives[0].push(first.runes);
  alternatives[1].push(last.runes);
  if (wi === 1476) {
    assert.equal(c.length, 12);
    assert.equal(observedMasks[wi], "00001000001");
    example.push({page: 27, wordIndex: wi, localStart: 79,
      first: first.token, last: last.token,
      candidates: candidates.length});
  }
}
for (const plain of alternatives)
  for (let wi = 0; wi < original.length; wi++)
    recoverFittedKeys(original[wi], plain[wi], ANCHOR_E);
const alternativesDifferAt = alternatives[0].filter((p, i) =>
  !p.every((v, j) => alternatives[1][i][j] === v)).length;
assert(alternativesDifferAt > 0);
assert.equal(alternatives[0].flat().length, 12956);
assert.equal(alternatives[1].flat().length, 12956);

const ranked = gp.translit.map((rune, anchor) => {
  const donors = Object.fromEntries(sources.map(s => [s.name, {
    ...countMoments(s, anchor),
    ...maskCoverage(s, anchor)
  }]));
  return {
    anchor, rune, dictionary: maskCoverage(dictionary, anchor), donors
  };
});
const strongestByShakespeare = ranked.slice()
  .sort((a, b) => Math.abs(a.donors[sources[0].name].z) -
    Math.abs(b.donors[sources[0].name].z))
  .slice(0, 8);
const anchors = ranked.filter(x => ["IA", "B", "F", "E"].includes(x.rune));
const continuous = sources.map(donor => ({
  donor: donor.name,
  closestAnchors: ranked.map(({anchor, rune}) => {
    const internal = countMoments(donor, anchor);
    const boundary = boundaryMoments(donor, anchor);
    return {rune,
      internal: {mean: internal.expected, sd: internal.sd, z: internal.z},
      boundary: {mean: boundary.expected, sd: boundary.sd, z: boundary.z},
      maxAbsZ: Number(Math.max(
        Math.abs(internal.z), Math.abs(boundary.z)).toFixed(4))};
  }).sort((a, b) => a.maxAbsZ - b.maxAbsZ).slice(0, 5)
}));


console.log(JSON.stringify({
  status: "reversible original-cipher exclusion/ambiguity; no new LP2 plaintext",
  source: {originalPages: 55, runes: originalCipher.length,
    words: original.length, internalTransitions: runeTransitions,
    equalInternalTransitions: eventCount, equalAcrossWordBoundaries: boundaryDoublets,
    equalGlobalTransitions: eventCount + boundaryDoublets,
    eventBearingWords: eventWords},
  donors: sources.map(x => ({name: x.name, tokens: x.tokenCount})),
  dictionaryWords: dictionary.tokenCount,
  focus: anchors,
  independentUniformWordIV,
  hopDiagnostic,
  stationaryContinuousNoReset: continuous,
  closestOriginalCountModels: strongestByShakespeare,
  dictionaryMaskImpossibleByAnchor: ranked.map(x => ({
    rune: x.rune, missingWords: x.dictionary.missingCount
  })).sort((a,b) => a.missingWords-b.missingWords),
  exactlyReencrypedOriginalFullBookAlternativeCount: 2,
  syntheticAlternativeDifferentWholeWords: alternativesDifferAt,
  p27OriginalDoubletPattern: example,
  solvedP57NativeControlRunes: 95
}, null, 2));
