'use strict';

/**
 * Source-original LP2 navigation gate:
 * 85 inter-doublet gaps versus solved p56, and 2015 prime-difference repeats
 * against p50's visibly printed leading-zero numeric cells.
 *
 * The first question tests the complete stationary secret lookup family,
 * not a fitted ad hoc decryption. The second compares two distinct proposed
 * original-content event registers at the physically natural 256-cell clock.
 *
 * Run: node sims/lp2_doublet_gap85_p56_2015_mask_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {any} */
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const numeric = read('resources/liber-primus/lp2-grid-256.json');
const sourceTokens = read('resources/liber-primus/base60-grid.json').rows.flat();
const text = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const bytes = numeric.bytes;
const sha = crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
assert.equal(sha, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(text.length, 12956);
assert.equal(sourceTokens.length, 256);
assert.equal(bytes.length, 256);
const alphabet = read('resources/liber-primus/base60-grid.json').alphabet;
assert.equal(alphabet.length, 60);
for (let i = 0; i < 256; i++) {
  assert.equal(bytes[i], 60 * alphabet.indexOf(sourceTokens[i][0]) + alphabet.indexOf(sourceTokens[i][1]));
}
const zeroMask = sourceTokens.map((token) => token[0] === '0');
assert.equal(zeroMask.filter(Boolean).length, 60);
/** @param {number} value @returns {number} */
const mod29 = (value) => (value % 29 + 29) % 29;

/** @param {number} n @returns {number[]} */
function firstPrimes(n) {
  /** @type {number[]} */
  const out = [];
  for (let candidate = 2; out.length < n; candidate++) {
    let prime = true;
    for (let factor = 2; factor * factor <= candidate; factor++) {
      if (candidate % factor === 0) { prime = false; break; }
    }
    if (prime) out.push(candidate);
  }
  return out;
}
const primes = firstPrimes(3010);
const p56cipher = corpus.pages.find((page) => page.page === 56).indices;
assert.equal(p56cipher.length, 85);
assert.deepEqual(p56cipher.flatMap((rune, i) => rune === 0 ? [i] : []), [35, 47, 51, 56, 74]);
let primeClock = 0;
const p56plain = p56cipher.map((rune, i) =>
  i === 56 ? 0 : mod29(rune - (primes[primeClock++] - 1))
);
assert.equal(primeClock, 84);
const knownWords = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
/** @param {string} textWords @param {string[]} gp @returns {number[]} */
function gpEncode(textWords, gp) {
  const entries = gp.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of textWords.split(' ')) {
    for (let i = 0; i < word.length;) {
      const found = entries.find(({ token }) => word.startsWith(token, i));
      assert.ok(found, 'Missing rune orthography: ' + word.slice(i));
      out.push(found.index);
      i += found.token.length;
    }
  }
  return out;
}
assert.deepEqual(p56plain, gpEncode(knownWords, corpus.translit));

/** @type {number[]} */
const repeatSites = [];
for (let i = 1; i < text.length; i++) {
  if (text[i] === text[i - 1]) repeatSites.push(i);
}
assert.equal(repeatSites.length, 86);
const gaps = repeatSites.slice(1).map((site, i) => site - repeatSites[i]);
assert.equal(gaps.length, 85);
assert.deepEqual(gaps.slice(0, 8), [85, 249, 197, 129, 127, 23, 47, 59]);
const gapMod = gaps.map(mod29);
assert.equal(new Set(gapMod).size, 26);

/**
 * The all-secret optimum is a mathematical upper bound:
 * each repeated input residue must map to one fixed output rune.
 * @param {number[]} inputs @param {number[]} targets
 * @returns {{strict:number,affine:number,lookup:number,classes:number,conflicted:number}}
 */
function stationaryCapacity(inputs, targets) {
  assert.equal(inputs.length, targets.length);
  let strict = 0;
  let affine = 0;
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i] === targets[i]) strict++;
  }
  for (let a = 1; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      let hits = 0;
      for (let i = 0; i < inputs.length; i++) {
        if (mod29(a * inputs[i] + b) === targets[i]) hits++;
      }
      affine = Math.max(affine, hits);
    }
  }
  /** @type {Map<number, Map<number,number>>} */
  const classes = new Map();
  for (let i = 0; i < inputs.length; i++) {
    if (!classes.has(inputs[i])) classes.set(inputs[i], new Map());
    const map = classes.get(inputs[i]);
    map.set(targets[i], (map.get(targets[i]) || 0) + 1);
  }
  let lookup = 0;
  let conflicted = 0;
  for (const map of classes.values()) {
    lookup += Math.max(...map.values());
    if (map.size > 1) conflicted++;
  }
  return { strict, affine, lookup, classes: classes.size, conflicted };
}
const p56shift = p56cipher.map((c, i) => mod29(c - p56plain[i]));
const sourceResults = {
  forward: {
    plaintext: stationaryCapacity(gapMod, p56plain),
    ciphertext: stationaryCapacity(gapMod, p56cipher),
    phiShift: stationaryCapacity(gapMod, p56shift)
  },
  reverse: {
    plaintext: stationaryCapacity([...gapMod].reverse(), p56plain),
    ciphertext: stationaryCapacity([...gapMod].reverse(), p56cipher)
  }
};
assert.deepEqual(sourceResults.forward.plaintext, { strict: 3, affine: 9, lookup: 34, classes: 26, conflicted: 23 });
assert.deepEqual(sourceResults.forward.ciphertext, { strict: 3, affine: 10, lookup: 33, classes: 26, conflicted: 23 });
assert.deepEqual(sourceResults.forward.phiShift, { strict: 4, affine: 9, lookup: 30, classes: 26, conflicted: 22 });
assert.equal(sourceResults.reverse.plaintext.lookup, 31);
assert.equal(sourceResults.reverse.ciphertext.lookup, 28);
const positive = gapMod.map((g) => mod29(7 * g + 13));
assert.equal(stationaryCapacity(gapMod, positive).lookup, 85);
assert.equal(stationaryCapacity(gapMod, positive).affine, 85);

const chapterLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(chapterLengths.reduce((a, b) => a + b, 0), 12956);
const chapterEvents = [];
let start = 0;
/** @type {number[]} */
const derivedPairStarts = [];
for (const length of chapterLengths) {
  let previousS = 27; // Imaginary F with prime 2 in the exact 2015 witness
  let previousD = null;
  let events = 0;
  let leadingZeroEvents = 0;
  for (let local = 0; local < length; local++) {
    const sourcePos = start + local;
    const shifted = mod29(text[sourcePos] - primes[local + 1]);
    const d = mod29(shifted - previousS);
    if (previousD !== null && d === previousD) {
      const first = sourcePos - 1;
      derivedPairStarts.push(first);
      events++;
      if (zeroMask[first % 256]) leadingZeroEvents++;
    }
    previousD = d;
    previousS = shifted;
  }
  chapterEvents.push({ events, leadingZeroEvents });
  start += length;
}
assert.deepEqual(chapterEvents.map((x) => x.events), [40, 39, 64, 78, 37, 48, 60, 99, 11]);
assert.deepEqual(chapterEvents.map((x) => x.leadingZeroEvents), [8, 9, 15, 14, 6, 12, 15, 24, 1]);
const repeatStarts = repeatSites.map((i) => i - 1);
const rawZero = repeatStarts.filter((i) => zeroMask[i % 256]).length;
const derivedZero = derivedPairStarts.filter((i) => zeroMask[i % 256]).length;
assert.equal(rawZero, 33);
assert.equal(derivedPairStarts.length, 476);
assert.equal(derivedZero, 104);
const allShifts = Array.from({ length: 256 }, (_, shift) =>
  derivedPairStarts.filter((i) => zeroMask[(i + shift) % 256]).length
);
const ranksAtLeast = allShifts.filter((n) => n >= derivedZero).length;
assert.equal(ranksAtLeast, 207);
const chapterPositive = chapterEvents.filter((rec) =>
  rec.leadingZeroEvents > rec.events * 60 / 256
).length;
assert.equal(chapterPositive, 3);
console.log(JSON.stringify({
  status: 'PASS',
  inputSha256: sha,
  unknownCipherRunes: text.length,
  rawAdjacentRepeats: repeatSites.length,
  gaps: gaps.length,
  gapToAuthenticP56: sourceResults,
  affinePositiveRecovered: stationaryCapacity(gapMod, positive).affine,
  printedLeadingZeroCells: 60,
  rawDoubletsOnZeroCells: rawZero,
  historicalPrimeDifferenceRepeats: derivedPairStarts.length,
  historicalRepeatsOnZeroCells: derivedZero,
  historicalRepeatsMaskExpectation: derivedPairStarts.length * 60 / 256,
  naturalPhaseRankAmong256: ranksAtLeast,
  chaptersWithPositiveExcess: chapterPositive,
  chapterEvents
}, null, 2));
