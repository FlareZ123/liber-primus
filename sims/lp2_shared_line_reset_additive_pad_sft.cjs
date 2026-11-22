'use strict';

/**
 * Director #1522: one shared additive GP29 pad restarted at every physical printed line.
 * Read-only, dependency-free Node 22 CommonJS SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const refText = fs.readFileSync(path.join(root, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const rawLines = transcript.split(/\r?\n/u).map((line) =>
  Array.from(line).filter((rune) => runeIndex.has(rune)).map((rune) => runeIndex.get(rune))
).filter((line) => line.length);

const sourcePages = corpus.pages.filter((page) => page.page < 56 && page.indices.length);
const ciphertext = sourcePages.flatMap((page) => page.indices);
const originalLines = [];
let used = 0;
let rawLineIndex = 0;
while (used < ciphertext.length) {
  const line = rawLines[rawLineIndex++];
  originalLines.push(line);
  used += line.length;
}
assert.equal(used, 12956);
assert.equal(sourcePages.length, 55);
assert.equal(originalLines.length, 594);
assert.deepEqual(originalLines.flat(), ciphertext);

const pages = [];
let lineIndex = 0;
for (const page of sourcePages) {
  const lines = [];
  let count = 0;
  while (count < page.indices.length) {
    const line = originalLines[lineIndex++];
    assert.ok(count + line.length <= page.indices.length);
    lines.push(line);
    count += line.length;
  }
  assert.equal(count, page.indices.length);
  assert.deepEqual(lines.flat(), page.indices);
  pages.push({ page: page.page, lines });
}
assert.equal(lineIndex, originalLines.length);
const maxLineLength = Math.max(...originalLines.map((line) => line.length));
assert.equal(maxLineLength, 26);

const alphabet = new Map(corpus.translit.map((token, index) => [token, index]));
const tokens = [...alphabet.keys()].sort((a, b) => b.length - a.length);

/** @param {string} text */
function encodeReference(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replaceAll('ING', 'NG');
    const seq = [];
    for (let at = 0; at < word.length;) {
      const token = tokens.find((candidate) => word.startsWith(candidate, at));
      if (!token) {
        seq.length = 0;
        break;
      }
      seq.push(alphabet.get(token));
      at += token.length;
    }
    out.push(...seq);
  }
  return out;
}

const ref = encodeReference(refText);
assert.equal(ref.length, 3568);
const unigram = new Float64Array(29).fill(0.5);
const bigram = Array.from({ length: 29 }, () => new Float64Array(29).fill(0.25));
for (const x of ref) unigram[x]++;
for (let i = 1; i < ref.length; i++) bigram[ref[i - 1]][ref[i]]++;
const unigramTotal = unigram.reduce((a, b) => a + b, 0);
const logU = Array.from(unigram, (x) => Math.log(x / unigramTotal));
const logT = Array.from({ length: 29 }, (_, a) => {
  const total = bigram[a].reduce((x, y) => x + y, 0);
  return Array.from(bigram[a], (x) => Math.log(x / total));
});

const trainA = pages.filter((page) => page.page <= 39 && page.page % 2 === 0);
const trainB = pages.filter((page) => page.page <= 39 && page.page % 2 === 1);
const heldout = pages.filter((page) => page.page >= 40);
assert.equal(trainA.length, 20);
assert.equal(trainB.length, 20);
assert.equal(heldout.length, 15);
assert.equal(trainA.flatMap((page) => page.lines).length, 216);
assert.equal(trainB.flatMap((page) => page.lines).length, 228);
assert.equal(heldout.flatMap((page) => page.lines).length, 150);
assert.equal(heldout.flatMap((page) => page.lines.flat()).length, 3316);

/**
 * Exact Viterbi maximum-likelihood shared line-reset key under the fixed
 * LP1-trained first-order model. Cross-line transitions are intentionally
 * omitted while fitting, so no plaintext continuity assumption chooses a line boundary.
 * @param {{page:number,lines:number[][]}[]} selectedPages
 * @returns {number[]}
 */
function fitKey(selectedPages) {
  const lines = selectedPages.flatMap((page) => page.lines);
  let previous = new Float64Array(29);
  /** @type {Int8Array[]} */
  const back = [];

  for (let key = 0; key < 29; key++) {
    let score = 0;
    for (const line of lines) score += logU[(line[0] - key + 29) % 29];
    previous[key] = score;
  }

  for (let j = 1; j < maxLineLength; j++) {
    const current = new Float64Array(29);
    const bp = new Int8Array(29);
    for (let keyNow = 0; keyNow < 29; keyNow++) {
      let best = -Infinity;
      let bestPrev = 0;
      for (let keyPrev = 0; keyPrev < 29; keyPrev++) {
        let score = previous[keyPrev];
        for (const line of lines) {
          if (line.length <= j) continue;
          const a = (line[j - 1] - keyPrev + 29) % 29;
          const b = (line[j] - keyNow + 29) % 29;
          score += logT[a][b];
        }
        if (score > best) {
          best = score;
          bestPrev = keyPrev;
        }
      }
      current[keyNow] = best;
      bp[keyNow] = bestPrev;
    }
    back.push(bp);
    previous = current;
  }

  let key = 0;
  let best = -Infinity;
  for (let value = 0; value < 29; value++) {
    if (previous[value] > best) {
      best = previous[value];
      key = value;
    }
  }
  const out = new Int8Array(maxLineLength);
  out[maxLineLength - 1] = key;
  for (let j = maxLineLength - 1; j >= 1; j--) {
    key = back[j - 1][key];
    out[j - 1] = key;
  }
  return Array.from(out);
}

/** @param {number[]} seq */
function scoreSequence(seq) {
  let score = logU[seq[0]];
  for (let i = 1; i < seq.length; i++) score += logT[seq[i - 1]][seq[i]];
  return { n: seq.length, score, perRune: score / seq.length, perplexity: Math.exp(-score / seq.length) };
}

/**
 * Decode line by line, then score every held-out physical page in source order,
 * including transitions across printed line breaks.
 * @param {{page:number,lines:number[][]}[]} selectedPages
 * @param {number[]} key
 */
function scorePages(selectedPages, key) {
  let score = 0;
  let n = 0;
  for (const page of selectedPages) {
    const plain = page.lines.flatMap((line) =>
      line.map((cipher, j) => (cipher - key[j] + 29) % 29)
    );
    const result = scoreSequence(plain);
    score += result.score;
    n += result.n;
  }
  return { n, score, perRune: score / n, perplexity: Math.exp(-score / n) };
}

/** @param {number} seed */
function prng(seed) {
  let state = seed >>> 0;
  return {
    next() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    },
    /** @param {number} n */
    int(n) {
      return Math.floor(this.next() * n);
    }
  };
}

/** @param {number[]} logs @param {{next:()=>number}} rng */
function sampleLog(logs, rng) {
  const probabilities = logs.map(Math.exp);
  const total = probabilities.reduce((a, b) => a + b, 0);
  let target = rng.next() * total;
  for (let i = 0; i < probabilities.length; i++) {
    target -= probabilities[i];
    if (target < 0) return i;
  }
  return probabilities.length - 1;
}

/** @param {number[]} a @param {number[]} b @param {number} n */
function matches(a, b, n) {
  let count = 0;
  for (let i = 0; i < n; i++) if (a[i] === b[i]) count++;
  return count;
}

const rng = prng(152238);
const trueKey = Array.from({ length: maxLineLength }, () => rng.int(29));
const planted = pages.map((page) => {
  let previousPlain = null;
  const plainLines = page.lines.map((line) => {
    const plain = [];
    for (let j = 0; j < line.length; j++) {
      const value = previousPlain === null ? sampleLog(logU, rng) : sampleLog(logT[previousPlain], rng);
      plain.push(value);
      previousPlain = value;
    }
    return plain;
  });
  return {
    page: page.page,
    lines: plainLines.map((line) => line.map((value, j) => (value + trueKey[j]) % 29)),
    plainLines
  };
});

const plantA = planted.filter((page) => page.page <= 39 && page.page % 2 === 0);
const plantB = planted.filter((page) => page.page <= 39 && page.page % 2 === 1);
const plantHeldout = planted.filter((page) => page.page >= 40);
const keyPlantA = fitKey(plantA);
const keyPlantB = fitKey(plantB);
const keyPlantAB = fitKey(plantA.concat(plantB));
const keyA = fitKey(trainA);
const keyB = fitKey(trainB);
const keyAB = fitKey(trainA.concat(trainB));

assert.equal(matches(keyPlantA, trueKey, 24), 24);
assert.equal(matches(keyPlantB, trueKey, 24), 24);
assert.equal(matches(keyPlantAB, trueKey, 24), 24);
assert.equal(matches(keyPlantA, keyPlantB, 24), 24);

let plantNativeScore = 0;
let plantNativeN = 0;
for (const page of plantHeldout) {
  const result = scoreSequence(page.plainLines.flat());
  plantNativeScore += result.score;
  plantNativeN += result.n;
}
const plantNative = {
  n: plantNativeN,
  score: plantNativeScore,
  perRune: plantNativeScore / plantNativeN,
  perplexity: Math.exp(-plantNativeScore / plantNativeN)
};
const plantDecoded = scorePages(plantHeldout, keyPlantAB);
assert.ok(Math.abs(plantDecoded.perRune - plantNative.perRune) < 0.01);

const originalA = scorePages(heldout, keyA);
const originalB = scorePages(heldout, keyB);
const originalAB = scorePages(heldout, keyAB);
const p57Native = scoreSequence(corpus.pages[57].indices);

// A solved p56 control is a real, independently known different cipher.
// Under this proposed line-reset family, its implied additive shift must be
// constant within every local line column. The known solution decisively violates that.
const p56Lines = [];
let p56Count = 0;
while (p56Count < 85) {
  const line = rawLines[rawLineIndex++];
  p56Lines.push(line);
  p56Count += line.length;
}
assert.equal(p56Count, 85);
assert.deepEqual(p56Lines.flat(), corpus.pages[56].indices);
assert.deepEqual(p56Lines.map((line) => line.length), [20, 19, 6, 22, 18]);
const authenticP56Plain = encodeReference(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
);
assert.equal(authenticP56Plain.length, 85);
let p56Offset = 0;
const p56Shifts = p56Lines.map((line) => {
  const shifts = line.map((cipher, j) => (cipher - authenticP56Plain[p56Offset + j] + 29) % 29);
  p56Offset += line.length;
  return shifts;
});
let p56ComparableColumns = 0;
let p56ConsistentColumns = 0;
for (let j = 0; j < Math.max(...p56Lines.map((line) => line.length)); j++) {
  const values = p56Shifts.filter((line) => line.length > j).map((line) => line[j]);
  if (values.length < 2) continue;
  p56ComparableColumns++;
  if (new Set(values).size === 1) p56ConsistentColumns++;
}
assert.equal(p56ComparableColumns, 20);
assert.equal(p56ConsistentColumns, 0);

const wrong = [];
for (let trial = 0; trial < 100; trial++) {
  const key = Array.from({ length: maxLineLength }, () => rng.int(29));
  wrong.push(scorePages(heldout, key).perRune);
}
wrong.sort((a, b) => a - b);

console.log('Input/model:', JSON.stringify({
  unknownPages: pages.length,
  unknownRunes: ciphertext.length,
  physicalLines: originalLines.length,
  maxLineRunes: maxLineLength,
  lp1TrainingRunes: ref.length,
  lineColumnSupport: Array.from({ length: maxLineLength }, (_, j) => ({
    j,
    trainA: trainA.flatMap((page) => page.lines).filter((line) => line.length > j).length,
    trainB: trainB.flatMap((page) => page.lines).filter((line) => line.length > j).length,
    heldout: heldout.flatMap((page) => page.lines).filter((line) => line.length > j).length
  }))
}));

console.log('Planted line-reset pad:', JSON.stringify({
  recoveryFirst24: {
    trainA: matches(keyPlantA, trueKey, 24),
    trainB: matches(keyPlantB, trueKey, 24),
    union: matches(keyPlantAB, trueKey, 24)
  },
  disjointTrainingAgreementFirst24: matches(keyPlantA, keyPlantB, 24),
  full26: {
    trainARecovery: matches(keyPlantA, trueKey, 26),
    trainBRecovery: matches(keyPlantB, trueKey, 26),
    unionRecovery: matches(keyPlantAB, trueKey, 26),
    trainingAgreement: matches(keyPlantA, keyPlantB, 26)
  },
  heldoutNative: plantNative,
  heldoutDecoded: plantDecoded
}));

console.log('Original LP2:', JSON.stringify({
  disjointTrainingAgreementFirst20: matches(keyA, keyB, 20),
  disjointTrainingAgreementFull26: matches(keyA, keyB, 26),
  heldoutDecodedByTrainA: originalA,
  heldoutDecodedByTrainB: originalB,
  heldoutDecodedByUnion: originalAB,
  wrongKeyHeldout: {
    min: wrong[0],
    q05: wrong[5],
    median: wrong[50],
    q95: wrong[95],
    max: wrong[99]
  },
  genuineSolvedP57: p57Native
}));

console.log('Solved p56 independent different-cipher control:', JSON.stringify({
  physicalLineLengths: p56Lines.map((line) => line.length),
  knownPlaintextRunes: authenticP56Plain.length,
  comparableSharedKeyColumns: p56ComparableColumns,
  columnsConsistentWithOneLineResetAdditivePad: p56ConsistentColumns
}));

const p40 = heldout.find((page) => page.page === 40);
const p40Plain = p40.lines.flatMap((line) =>
  line.map((cipher, j) => (cipher - keyAB[j] + 29) % 29)
);
console.log('Original p40 first150 translit:', p40Plain.slice(0, 150).map((x) => corpus.translit[x]).join('-'));

assert.equal(matches(keyA, keyB, 20), 0);
assert.equal(matches(keyA, keyB, 26), 0);
assert.ok(originalA.perRune < -4.0);
assert.ok(originalB.perRune < -4.0);
assert.ok(originalAB.perRune < -4.0);
assert.ok(plantDecoded.perRune > -2.8);
assert.ok(p57Native.perRune > -3.0);
console.log('PASS: exact planted line-reset pad is recovered; original disjoint fits do not agree or transfer to held-out pages.');
