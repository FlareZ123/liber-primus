'use strict';

/**
 * Source-conditioned p50 row10 entry to four nested table rings.
 * Uses only published original LP2 corpus, table bytes and solved-page control.
 * The page/word address map is hypothetical, and this is NOT a plaintext decoder.
 * Run from the repository with Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} filename */
function load(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', filename), 'utf8'));
}
const corpus = load('resources/liber-primus/lp2-corpus.json');
const gridSource = load('resources/liber-primus/base60-grid.json');
const grid = gridSource.byte_rows;
assert.deepEqual(grid.map(row => row.length), Array(32).fill(8));
assert.equal(grid[10][0], 142);
assert.equal(gridSource.rows[10][0], '2M');
// A completely secret printed-token codebook cannot evade the collision bound
// by changing base59/base60 alphabets: this byte mapping is a bijection of
// ORIGINAL two-character printed token identities on all 256 cells.
const printedTokens = gridSource.rows.flat();
const canonicalBytes = grid.flat();
const tokenByteMap = new Map();
const byteTokenMap = new Map();
for (let cell = 0; cell < 256; cell++) {
  const token = printedTokens[cell], byte = canonicalBytes[cell];
  if (tokenByteMap.has(token)) assert.equal(tokenByteMap.get(token), byte);
  if (byteTokenMap.has(byte)) assert.equal(byteTokenMap.get(byte), token);
  tokenByteMap.set(token, byte);
  byteTokenMap.set(byte, token);
}
assert.equal(tokenByteMap.size, 161);
assert.equal(byteTokenMap.size, 161);

/** @param {number} count @returns {number[]} */
function primes(count) {
  /** @type {number[]} */
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) result.push(n);
  }
  return result;
}
/** @param {string} words @returns {number[]} */
function gp(words) {
  const tokens = corpus.translit.map((token, rune) => ({ token, rune }))
    .sort((a, b) => b.token.length - a.token.length);
  /** @type {number[]} */
  const out = [];
  for (const word of words.split(' ')) {
    for (let at = 0; at < word.length;) {
      const next = tokens.find(item => word.startsWith(item.token, at));
      assert.ok(next, 'unencodable original spelling: ' + word.slice(at));
      out.push(next.rune);
      at += next.token.length;
    }
  }
  return out;
}
const cipher56 = corpus.pages[56].indices;
const solved57 = corpus.pages[57].indices;
assert.equal(cipher56.length, 85);
assert.equal(solved57.length, 95);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[50].indices.length, 0);
const shiftPrimes = primes(85);
let clock = 0;
const solved56 = cipher56.map((rune, index) => {
  if (index === 56) { assert.equal(rune, 0); return 0; }
  return ((rune - (shiftPrimes[clock++] - 1)) % 29 + 29) % 29;
});
assert.equal(clock, 84);
const expected = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
assert.deepEqual(solved56, gp(expected), 'native p56 phi(prime), literal-F solution');
const known = solved56.concat(solved57);
assert.equal(known.length, 180);

/**
 * Return one rectangular shell. The site (row10,column=depth) is on its
 * left boundary at every depth. Clockwise follows top/right/bottom/left;
 * counterclockwise reverses this order. Rotate to the same sourced site.
 * @param {number} depth
 * @param {boolean} reverse
 * @returns {[number,number][]}
 */
function ring(depth, reverse) {
  const top = depth, bottom = 31 - depth;
  const left = depth, right = 7 - depth;
  /** @type {[number,number][]} */
  const cells = [];
  for (let col = left; col <= right; col++) cells.push([top, col]);
  for (let row = top + 1; row <= bottom; row++) cells.push([row, right]);
  for (let col = right - 1; col >= left; col--) cells.push([bottom, col]);
  for (let row = bottom - 1; row > top; row--) cells.push([row, left]);
  if (reverse) cells.reverse();
  const start = cells.findIndex(([r, c]) => r === 10 && c === depth);
  assert.ok(start >= 0);
  return cells.slice(start).concat(cells.slice(0, start));
}

/**
 * Exact all-secret deterministic-codebook upper bound. Every input value
 * may have any GP29 output label, selected to maximize original agreement.
 * If the bound is less than len(output), no such function can explain input.
 * @param {number[]} inputs
 * @param {number[]} outputs
 */
function mapCapacity(inputs, outputs) {
  assert.equal(inputs.length, outputs.length);
  /** @type {Map<number, Map<number,number>>} */
  const classes = new Map();
  for (let index = 0; index < inputs.length; index++) {
    const k = inputs[index], y = outputs[index];
    const counts = classes.get(k) || new Map();
    counts.set(y, (counts.get(y) || 0) + 1);
    classes.set(k, counts);
  }
  let maxMatches = 0, conflictedClasses = 0;
  for (const counts of classes.values()) {
    maxMatches += Math.max(...counts.values());
    if (counts.size > 1) conflictedClasses++;
  }
  return {
    maxMatches,
    requiredChanges: outputs.length - maxMatches,
    conflictedClasses,
    distinctInputs: classes.size,
  };
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const original55 = corpus.pages[55].indices;
assert.equal(original55.length, 76);
// Exact source-native English lexical prior from the existing TextBlob fixture.
// Used only to diagnose the historically authenticated plaintext-F bypass.
const spellingData = fs.readFileSync(
  path.join(__dirname, '..', 'resources/control/english_wordfreq_textblob.txt'), 'utf8');
const originalTranscription = fs.readFileSync(
  path.join(__dirname, '..', 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const gpTokens = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
const runeMap = new Map(corpus.runes.map((symbol, index) => [symbol, index]));

/** @param {string} word @returns {number[]|null} */
function encodeNativeWord(word) {
  const w = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  /** @type {number[]} */
  const out = [];
  for (let at = 0; at < w.length;) {
    const next = gpTokens.find(entry => w.startsWith(entry.token, at));
    if (!next) return null;
    out.push(next.index);
    at += next.token.length;
  }
  return out;
}
const lexicon = new Map();
for (const entry of spellingData.match(/^[a-z]+\s+\d+$/gm) || []) {
  const [word, frequency] = entry.split(/\s+/u);
  const native = encodeNativeWord(word);
  if (!native) continue;
  const key = native.join(',');
  lexicon.set(key, (lexicon.get(key) || 0) + Number(frequency));
}
assert.equal(lexicon.size, 29058);

const pageTranscriptions = originalTranscription.split('%');
pageTranscriptions.splice(50, 0, '');
assert.equal(pageTranscriptions.length, 58);
const original55Words = (pageTranscriptions[55].replace(/\/\s*/gu, '')
  .match(/[\u16A0-\u16FF]+/gu) || [])
  .map(word => [...word].map(rune => runeMap.get(rune)));
assert.deepEqual(original55Words.flat(), original55);
assert.deepEqual(original55Words.map(word => word.length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const fLocations = original55.flatMap((rune, index) => rune === 0 ? [index] : []);
assert.deepEqual(fLocations, [15, 25, 41]);

/**
 * Exactly enumerate the two true possibilities at each of three ciphertext-F
 * positions, while enforcing the original p56 rule that an enciphered rune
 * must not be plaintext F. No arbitrary skip mask or key offset is fitted.
 * @param {number[]} tableKey
 * @param {-1|1} sign
 */
function sourceFVariants(tableKey, sign) {
  const variants = [];
  for (let mask = 0; mask < (1 << fLocations.length); mask++) {
    /** @type {number[]} */
    const candidate = [];
    let consumed = 0, valid = true;
    for (let at = 0; at < original55.length; at++) {
      const f = fLocations.indexOf(at);
      if (f !== -1 && (mask & (1 << f))) {
        candidate.push(0);
      } else {
        const value = ((original55[at] + sign * tableKey[consumed++]) % 29 + 29) % 29;
        if (value === 0) { valid = false; break; }
        candidate.push(value);
      }
    }
    if (!valid) continue;
    let index = 0, recognized = 0, score = 0;
    const words = original55Words.map(word => {
      const slice = candidate.slice(index, index + word.length);
      index += word.length;
      return slice;
    });
    for (const word of words.slice(1)) {
      const freq = lexicon.get(word.join(',')) || 0;
      if (freq) { recognized++; score += Math.log1p(freq); } else score -= 8;
    }
    variants.push({ mask, consumed, recognized, score,
      words: words.slice(1).map(word => word.map(n => corpus.translit[n]).join('')) });
  }
  variants.sort((a, b) => b.score - a.score);
  return variants;
}

const outcomes = [];
for (const reverse of [false, true]) {
  const shells = [0, 1, 2, 3].map(depth => ring(depth, reverse));
  assert.deepEqual(shells.map(shell => shell.length), [76, 68, 60, 52]);
  assert.deepEqual(shells.map(shell => shell[0]), [[10, 0], [10, 1], [10, 2], [10, 3]]);
  const cells = shells.flat();
  assert.equal(cells.length, 256);
  assert.equal(new Set(cells.map(([r, c]) => 8 * r + c)).size, 256);
  const bytes = cells.map(([r, c]) => grid[r][c]);
  const inside = bytes.slice(76), residues = inside.map(byte => byte % 29);
  assert.equal(bytes[0], 142);
  assert.deepEqual(cells[204], [10, 3]);
  const exact = residues.filter((value, i) => value === known[i]).length;
  const raw = mapCapacity(inside, known);
  const residue = mapCapacity(residues, known);
  // Source-visible change-of-state allowance: independent arbitrary 256-byte
  // secret codebook for EACH concentric ring, learned only by upper bound.
  // Even this architecture cannot exactly reproduce the known 180 runes.
  let knownOffset = 0;
  const shellLocalSecretCodebooks = shells.slice(1).map((shell, index) => {
    const innerBytes = shell.map(([row, col]) => grid[row][col]);
    const target = known.slice(knownOffset, knownOffset + innerBytes.length);
    knownOffset += innerBytes.length;
    const bound = mapCapacity(innerBytes, target);
    const mod29Bound = mapCapacity(innerBytes.map(b => b % 29), target);
    const expectedErrors = reverse ? [8, 6, 5] : [7, 7, 7];
    assert.equal(bound.requiredChanges, expectedErrors[index]);
    assert.ok(bound.requiredChanges > 0);
    return {
      depth: index + 1,
      knownNativeRunes: target.length,
      arbitrarySecretByteToGP: bound,
      arbitrarySecretResidueToGP: mod29Bound,
    };
  });
  assert.equal(knownOffset, 180);
  // Minimal exact original-token contradictions on the SAME original solved
  // terminal page, so independent per-ring and per-page substitutions fail.
  const counterexamples = reverse
    ? [
      { depth: 1, a: [17, 1], b: [29, 6],
        knownA: 7, knownB: 26, plainA: 'TH', plainB: 'S' },
      { depth: 3, a: [15, 3], b: [21, 3],
        knownA: 133, knownB: 139, plainA: 'U', plainB: 'I' },
    ] : [
      { depth: 1, a: [3, 1], b: [30, 6],
        knownA: 7, knownB: 43, plainA: 'TH', plainB: 'T' },
      { depth: 3, a: [6, 3], b: [27, 3],
        knownA: 132, knownB: 163, plainA: 'O', plainB: 'I' },
    ];
  for (const witness of counterexamples) {
    const tokenA = gridSource.rows[witness.a[0]][witness.a[1]];
    const tokenB = gridSource.rows[witness.b[0]][witness.b[1]];
    assert.equal(tokenA, tokenB, 'same source printed token');
    const innerStart = [0, 0, 68, 128][witness.depth];
    for (const [coords, knownIndex, plain] of [
      [witness.a, witness.knownA, witness.plainA],
      [witness.b, witness.knownB, witness.plainB],
    ]) {
      const cellIndex = shells[witness.depth].findIndex(
        ([row, col]) => row === coords[0] && col === coords[1]);
      assert.ok(cellIndex >= 0);
      assert.equal(innerStart + cellIndex, knownIndex);
      assert.equal(corpus.translit[known[knownIndex]], plain);
    }
    assert.notEqual(witness.plainA, witness.plainB);
  }
  assert.equal(shellLocalSecretCodebooks.reduce(
    (sum, item) => sum + item.arbitrarySecretByteToGP.requiredChanges, 0),
    reverse ? 19 : 21);
  const positive = mapCapacity(inside, residues);
  assert.equal(positive.maxMatches, 180);
  assert.equal(positive.requiredChanges, 0);
  const target = reverse
    ? { exact: 5, raw: 131, residue: 52, rawConflicts: 37 }
    : { exact: 9, raw: 133, residue: 53, rawConflicts: 36 };
  assert.equal(exact, target.exact);
  assert.equal(raw.maxMatches, target.raw);
  assert.equal(residue.maxMatches, target.residue);
  assert.equal(raw.conflictedClasses, target.rawConflicts);
  assert.equal(raw.distinctInputs, 127);
  assert.equal(residue.distinctInputs, 29);
  // Source-pointed exterior as a direct 76-byte GP29 additive pad.
  // p55 itself remains unknown and is not used to select any parameters.
  const exteriorKey = bytes.slice(0, 76).map(byte => byte % 29);
  const originalInverse = [];
  for (const sign of [-1, 1]) {
    const candidate = original55.map((r, i) =>
      ((r + sign * exteriorKey[i]) % 29 + 29) % 29);
    const sourceNativePlant = solved57.slice(0, 76);
    const encryptedPlant = sourceNativePlant.map((p, i) =>
      ((p - sign * exteriorKey[i]) % 29 + 29) % 29);
    const recoveredPlant = encryptedPlant.map((r, i) =>
      ((r + sign * exteriorKey[i]) % 29 + 29) % 29);
    assert.deepEqual(recoveredPlant, sourceNativePlant);
    const target = reverse
      ? (sign === -1 ? 0.034035087719298245 : 0.03368421052631579)
      : (sign === -1 ? 0.031578947368421054 : 0.03824561403508772);
    assert.ok(Math.abs(ioc(candidate) - target) < 1e-12);
    originalInverse.push({
      sign, candidateIoC: ioc(candidate),
      first40NativeRunes: candidate.slice(0, 40).map(n => corpus.translit[n]).join('-'),
      nativeSolvedPlantReencryption: 76,
    });
  }
  const fTransparent = [];
  for (const sign of [-1, 1]) {
    const variants = sourceFVariants(exteriorKey, sign);
    // The exact candidate count and maximum lexicon support are original-data
    // constraints; lexical support here comes only from two/short-rune words.
    const expected = reverse
      ? (sign === -1 ? [0, 0] : [1, 0])
      : (sign === -1 ? [3, 0] : [4, 4]);
    assert.deepEqual([variants.length,
      Math.max(0, ...variants.map(v => v.recognized))], expected);
    const plant = solved57.slice(0, 76);
    let k = 0;
    const plantCipher = plant.map(p => p === 0 ? 0
      : ((p - sign * exteriorKey[k++]) % 29 + 29) % 29);
    let k2 = 0;
    const plantRecovered = plantCipher.map((c, i) => plant[i] === 0
      ? 0 : ((c + sign * exteriorKey[k2++]) % 29 + 29) % 29);
    assert.deepEqual(plantRecovered, plant);
    fTransparent.push({
      sign, validMasks: variants.length, bestNativeLexiconWords:
        Math.max(0, ...variants.map(v => v.recognized)),
      strongestCandidate: variants[0] || null,
      solvedNativePlantRecovery: 76,
    });
  }
  // Distinct, nonperiodic source transfer: the authentic p15 index+1 prime
  // convention plus solved p56 phi(prime). Every printed base60 byte B
  // supplies key phi(prime_(B+1)) mod29 at the row10 sourced shell site.
  const indexedPrimes = primes(256);
  const primeTotientKey = bytes.slice(0, 76)
    .map(byte => (indexedPrimes[byte] - 1) % 29);
  const primeTotientDirect = [];
  const primeTotientF = [];
  for (const sign of [-1, 1]) {
    const output = original55.map((rune, i) =>
      ((rune + sign * primeTotientKey[i]) % 29 + 29) % 29);
    const expectedIoC = reverse
      ? (sign === -1 ? 0.027719298245614036 : 0.0343859649122807)
      : (sign === -1 ? 0.03368421052631579 : 0.03298245614035088);
    assert.ok(Math.abs(ioc(output) - expectedIoC) < 1e-12);
    primeTotientDirect.push({ sign, ioc: ioc(output) });
    const variants = sourceFVariants(primeTotientKey, sign);
    const expected = reverse
      ? [0, 0] : (sign === -1 ? [1, 2] : [0, 0]);
    assert.deepEqual([variants.length,
      Math.max(0, ...variants.map(v => v.recognized))], expected);
    const plant = solved57.slice(0, 76);
    let consumed = 0;
    const encrypted = plant.map(p => p === 0 ? 0 :
      ((p - sign * primeTotientKey[consumed++]) % 29 + 29) % 29);
    let consumed2 = 0;
    const recovered = encrypted.map((c, i) => plant[i] === 0 ? 0 :
      ((c + sign * primeTotientKey[consumed2++]) % 29 + 29) % 29);
    assert.deepEqual(recovered, plant);
    primeTotientF.push({
      sign, validMasks: variants.length,
      bestNativeLexiconWords: Math.max(0, ...variants.map(v => v.recognized)),
      strongestCandidate: variants[0] || null,
      solvedNativePlantRecovery: 76,
    });
  }
  assert.equal(primeTotientKey[0], 822 % 29);
  outcomes.push({
    direction: reverse ? 'counterclockwise' : 'clockwise',
    directOriginalP55Inverse: originalInverse,
    originalFTransparentOriginalWordBoundaryTest: fTransparent,
    nonperiodicPrimeIndexedTotientOuterKey: {
      direct: primeTotientDirect, fTransparent: primeTotientF,
    },
    ringStarts: shells.map(s => s[0]),
    ringLengths: shells.map(s => s.length),
    knownNativeGP: known.length,
    directByteModulo29Matches: exact,
    bestAnySecretRawByteToGP: raw,
    bestAnySecretResidue29ToGP: residue,
    independentSecretCodebookPerInteriorRing: shellLocalSecretCodebooks,
    directOriginalPrintedTokenContradictions: counterexamples,
    positiveSecretRawByteToGP: positive,
  });
}
console.log(JSON.stringify({
  model: '2014/2016 conditional address-to-p50:w0, radial inward ring starts',
  sourceRow10Col0: { token: '2M', base60Byte: 142, onOuterPerimeter: true },
  pageControls: { p55Unknown: 76, p56Solved: 85, p57Solved: 95 },
  outcomes,
  interpretation: 'conditional static-codebook exclusions only, not recovered plaintext',
}, null, 2));
