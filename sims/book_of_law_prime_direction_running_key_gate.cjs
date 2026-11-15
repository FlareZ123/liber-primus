#!/usr/bin/env node
"use strict";

// Source-constrained test of the 2013 Cicada Book of the Law as a cyclic
// GP29 running key whose pointer direction is selected by word prime sums.
// GP_prev is causal; GP_now is a literal decoder-side reading of the clue.

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const ROOT = path.join(__dirname, "..");
const Q = 29;
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-transcription.txt"), "utf8");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const unknown = corpus.pages.slice(0, 56).flatMap(p => p.indices || []);
assert.strictEqual(unknown.length, 12956);

// The source transcription includes p56/p57 after the unknown book. Stop
// exactly at the 12,956th rune, retaining word boundaries from -, . and &.
// Slash/percent/newline layout marks are not treated as word endings.
const words = [];
let current = [];
let seenRunes = 0;
for (const ch of Array.from(transcription)) {
  if (runeIndex.has(ch)) {
    if (seenRunes < unknown.length) current.push(runeIndex.get(ch));
    seenRunes++;
    if (seenRunes === unknown.length) break;
  } else if (ch === "-" || ch === "." || ch === "&") {
    if (current.length) { words.push(current); current = []; }
  }
}
if (current.length) words.push(current);
const flattened = words.flat();
assert.deepStrictEqual(flattened, unknown);
assert.strictEqual(words.length, 2896);

const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
const tokenIndex = new Map(corpus.translit.map((t, i) => [t, i]));
function encodeLatin(text) {
  const normalized = text.toUpperCase()
    .replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized[i] < "A" || normalized[i] > "Z") { i++; continue; }
    let matched = false;
    for (const token of tokens) {
      if (normalized.startsWith(token, i)) {
        out.push(tokenIndex.get(token));
        i += token.length;
        matched = true;
        break;
      }
    }
    if (!matched) throw new Error("Unencodable source at " + i);
  }
  return out;
}
const bookText = ["I", "II", "III"].map(part => fs.readFileSync(
  path.join(ROOT, `resources/external/2013-book-of-law-${part}.txt`), "utf8"
)).join("\n");
const key = encodeLatin(bookText);
assert.strictEqual(key.length, 21630);

function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}
function mod(n) { return ((n % Q) + Q) % Q; }
function wordPrimeSum(word) {
  return word.reduce((sum, symbol) => sum + corpus.prime[symbol], 0);
}
function ioc(values) {
  const counts = Array(Q).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
function decodePreviousWord(source, sign, primeMeansForward) {
  let pointer = 0, direction = 1, at = 0, wraps = 0;
  const output = [], directions = { forward: 0, backward: 0 };
  for (let wi = 0; wi < words.length; wi++) {
    if (wi > 0) {
      const previous = source.slice(at - words[wi - 1].length, at);
      direction = (isPrime(wordPrimeSum(previous)) === primeMeansForward) ? 1 : -1;
    }
    directions[direction > 0 ? "forward" : "backward"]++;
    for (let k = 0; k < words[wi].length; k++) {
      output.push(mod(source[at] - sign * key[pointer]));
      const next = pointer + direction;
      if (next < 0 || next >= key.length) wraps++;
      pointer = ((next % key.length) + key.length) % key.length;
      at++;
    }
  }
  return { output, wraps, directions, finalPointer: pointer };
}
function decodeCurrentWord(source, sign, primeMeansForward) {
  let pointer = 0, at = 0, wraps = 0;
  const output = [], directions = { forward: 0, backward: 0 };
  for (const word of words) {
    const direction = (isPrime(wordPrimeSum(source.slice(at, at + word.length))) === primeMeansForward) ? 1 : -1;
    directions[direction > 0 ? "forward" : "backward"]++;
    for (let k = 0; k < word.length; k++) {
      output.push(mod(source[at] - sign * key[pointer]));
      const next = pointer + direction;
      if (next < 0 || next >= key.length) wraps++;
      pointer = ((next % key.length) + key.length) % key.length;
      at++;
    }
  }
  return { output, wraps, directions, finalPointer: pointer };
}
function encryptPreviousPlant(plain, sign, primeMeansForward) {
  let pointer = 0, direction = 1, at = 0;
  const output = [];
  for (let wi = 0; wi < words.length; wi++) {
    const encryptedWord = [];
    for (let k = 0; k < words[wi].length; k++) {
      encryptedWord.push(mod(plain[at] + sign * key[pointer]));
      pointer = ((pointer + direction) % key.length + key.length) % key.length;
      at++;
    }
    output.push(...encryptedWord);
    if (wi + 1 < words.length) {
      direction = (isPrime(wordPrimeSum(encryptedWord)) === primeMeansForward) ? 1 : -1;
    }
  }
  return output;
}

const shakespeare = fs.readFileSync(path.join(ROOT,
  "resources/control/shakespeare_first300k.txt"), "utf8");
const referenceTrain = encodeLatin(shakespeare.slice(0, 240000));
const referenceHeldout = encodeLatin(shakespeare.slice(240000));
const frequency = Array(Q).fill(1);
for (const symbol of referenceTrain) frequency[symbol]++;
const total = frequency.reduce((a, b) => a + b, 0);
const logp = frequency.map(x => Math.log(x / total));
const meanLog = values => values.reduce((sum, x) => sum + logp[x], 0) / values.length;
const trainBoundary = 6761;
const variants = [];
const expected = [
  0.0344383609208926, 0.034489586760354705,
  0.034462216266462065, 0.034468972500696776,
  0.034469020163724884, 0.0344838195339533,
  0.03448955101308362, 0.03448716786167808
];
let expectedIndex = 0;
for (const rule of ["GP_prev", "GP_now"]) {
  for (const primeMeansForward of [true, false]) {
    for (const sign of [1, -1]) {
      const decoded = rule === "GP_prev"
        ? decodePreviousWord(unknown, sign, primeMeansForward)
        : decodeCurrentWord(unknown, sign, primeMeansForward);
      const row = {
        rule,
        primeMeansForward,
        cipherOperation: sign === 1 ? "C=P+K; decode C-K" : "C=P-K; decode C+K",
        outputRunes: decoded.output.length,
        ioc: ioc(decoded.output),
        trainLogLikelihood: meanLog(decoded.output.slice(0, trainBoundary)),
        holdoutLogLikelihood: meanLog(decoded.output.slice(trainBoundary)),
        fullLogLikelihood: meanLog(decoded.output),
        keyPointerWraps: decoded.wraps,
        directionCounts: decoded.directions
      };
      assert.strictEqual(row.outputRunes, 12956);
      assert(Math.abs(row.ioc - expected[expectedIndex++]) < 1e-12);
      variants.push(row);
    }
  }
}

// Exact round-trip positive controls for the causal GP_prev construction,
// using the original 2,896 word lengths and a deterministic 12,956-rune plant.
const plant = Array.from({ length: unknown.length }, (_, i) => (i * 17 + 11) % Q);
const positiveControls = [];
for (const primeMeansForward of [true, false]) {
  for (const sign of [1, -1]) {
    const plantedCipher = encryptPreviousPlant(plant, sign, primeMeansForward);
    const recovered = decodePreviousWord(plantedCipher, sign, primeMeansForward).output;
    const exact = recovered.every((x, i) => x === plant[i]);
    assert(exact);
    positiveControls.push({ rule: "GP_prev", primeMeansForward, sign, recovered: recovered.length + "/" + plant.length, exact });
  }
}

console.log(JSON.stringify({
  test: "2013 Book of the Law cyclic key with GP-prime-sum word direction",
  keySource: "resources/external/2013-book-of-law-I/II/III.txt",
  keyRunes: key.length,
  unknownRunes: unknown.length,
  wordCount: words.length,
  primeSumWords: words.filter(w => isPrime(wordPrimeSum(w))).length,
  sourceIoc: ioc(unknown),
  reference: {
    trainSymbols: referenceTrain.length,
    heldoutSymbols: referenceHeldout.length,
    trainMeanLogLikelihood: meanLog(referenceTrain),
    heldoutMeanLogLikelihood: meanLog(referenceHeldout),
    uniformMeanLogLikelihood: -Math.log(Q)
  },
  variants,
  positiveControls
}, null, 2));
