"use strict";

/**
 * Source-motivated p57 DIVINITY/WITHIN/EMERGE -> p50 bracket center-out ->
 * p55 strict-interior additive affine gate.
 *
 * Frozen source route:
 *   DIUINITY GP0=105 -> exact center of p50 cells84..126.
 *   EMERGE -> serialize outward from the center.
 *   SHED OUR OWN CIRCUMFERENCES -> pair with p55's 43 strict word interiors.
 *
 * Only the two center-out tie orders are admitted. Each source byte is used
 * either directly mod29 or through Euler phi mod29. For each fixed source
 * register, exhaust every global affine additive key K_i=a*f(B_i)+b mod29.
 *
 * Run from repo root with Node.js 22:
 *   node sims/lp2_p57_divinity_emerge_centerout_p55_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const shakespeare = read("resources/control/shakespeare_first300k.txt");

const wordLengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const sourceWords = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/\r\n/g, "\n").split(/\n%\n/)[54]
  .replace(/\/\n/g, "").replace(/[\n&$%§\/]/g, "")
  .split(/[-.]/).filter(Boolean);
assert.deepEqual(sourceWords.map((w) => Array.from(w).length), wordLengths);

const page = gp.pages.find((p) => p.page === 55).indices;
assert.equal(page.length, 76);
let offset = 0;
const segments = [];
for (const word of sourceWords) {
  const indices = Array.from(word).map((ch) => gp.runes.indexOf(ch));
  assert.ok(indices.every((value) => value >= 0));
  assert.deepEqual(page.slice(offset, offset + indices.length), indices);
  segments.push(indices.slice(1, -1));
  offset += indices.length;
}
assert.equal(offset, 76);
const cipher = segments.flat();
assert.equal(cipher.length, 43);

const cells = grid.bytes;
assert.equal(cells.length, 256);
assert.equal(grid.pages[1].tokens[25], "13");
const left = 84;
const right = 126;
const center = 105;
assert.equal(right - left + 1, 43);
assert.equal((left + right) / 2, center);
assert.equal(grid.pages.flatMap((p) => p.tokens)[center], "13");
const bracket = cells.slice(left, right + 1);
assert.equal(bracket.length, 43);

function centerOut(values, rightFirst) {
  assert.equal(values.length % 2, 1);
  const middle = Math.floor(values.length / 2);
  const out = [values[middle]];
  for (let distance = 1; distance <= middle; distance += 1) {
    if (rightFirst) {
      out.push(values[middle + distance], values[middle - distance]);
    } else {
      out.push(values[middle - distance], values[middle + distance]);
    }
  }
  assert.equal(out.length, values.length);
  return out;
}

function phi(n) {
  if (n === 0) return 0;
  let rest = n;
  let result = n;
  for (let divisor = 2; divisor * divisor <= rest; divisor += 1) {
    if (rest % divisor !== 0) continue;
    result -= result / divisor;
    while (rest % divisor === 0) rest /= divisor;
  }
  if (rest > 1) result -= result / rest;
  return result;
}

const toks = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const vocab = new Map();
const triCounts = new Map();
const normalise = (s) => s.toUpperCase().replace(/QU/g, "CW")
  .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S")
  .replace(/Q/g, "C");

function encodeWord(word) {
  word = normalise(word);
  const out = [];
  for (let i = 0; i < word.length;) {
    const token = toks.find((t) => word.startsWith(t.s, i));
    assert.ok(token, "source GP English transliteration must remain defined");
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}

for (const word of shakespeare.toUpperCase().match(/[A-Z]+/g) || []) {
  const encoded = encodeWord(word);
  if (!vocab.has(encoded.length)) vocab.set(encoded.length, []);
  vocab.get(encoded.length).push(encoded);
  for (let i = 0; i + 3 <= encoded.length; i += 1) {
    const id = encoded[i] * 841 + encoded[i + 1] * 29 + encoded[i + 2];
    triCounts.set(id, (triCounts.get(id) || 0) + 1);
  }
}
const observedTotal = [...triCounts.values()].reduce((sum, n) => sum + n, 0);
assert.equal(observedTotal, 111151);
const alpha = 0.05;
const denominator = observedTotal + alpha * 29 ** 3;
const insideLengths = wordLengths.map((n) => Math.max(n - 2, 0));

function score(interiors) {
  assert.equal(interiors.length, 43);
  let cursor = 0;
  let sum = 0;
  let count = 0;
  for (const length of insideLengths) {
    for (let i = 0; i + 3 <= length; i += 1) {
      const id = interiors[cursor + i] * 841
        + interiors[cursor + i + 1] * 29
        + interiors[cursor + i + 2];
      sum += Math.log(((triCounts.get(id) || 0) + alpha) / denominator);
      count += 1;
    }
    cursor += length;
  }
  assert.equal(cursor, 43);
  assert.ok(count > 0);
  return sum / count;
}

const mod = (x) => ((x % 29) + 29) % 29;
const roman = (values) => values.map((value) => gp.translit[value]).join("");

let seed = 0x61e6e166;
function rand32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}

function sampleNative() {
  const out = [];
  for (const length of wordLengths) {
    const choices = vocab.get(length);
    assert.ok(choices && choices.length > 0);
    out.push(...choices[rand32() % choices.length].slice(1, -1));
  }
  assert.equal(out.length, 43);
  return out;
}

const nativeScores = [];
for (let i = 0; i < 2000; i += 1) nativeScores.push(score(sampleNative()));
nativeScores.sort((a, b) => a - b);

const candidates = [];
for (const rightFirst of [false, true]) {
  const ordered = centerOut(bracket, rightFirst);
  for (const mapping of ["byte", "totient"]) {
    const baseKey = ordered.map((value) =>
      mod(mapping === "byte" ? value : phi(value)));
    for (let a = 0; a < 29; a += 1) {
      for (let b = 0; b < 29; b += 1) {
        const plain = cipher.map((value, i) =>
          mod(value + a * baseKey[i] + b));
        candidates.push({
          rightFirst,
          mapping,
          a,
          b,
          score: score(plain),
          roman: roman(plain),
        });
      }
    }
  }
}
assert.equal(candidates.length, 3364);
candidates.sort((a, b) => b.score - a.score);
const best = candidates[0];

// Every candidate must be exactly reversible.
for (const candidate of candidates.slice(0, 20)) {
  const ordered = centerOut(bracket, candidate.rightFirst);
  const baseKey = ordered.map((value) =>
    mod(candidate.mapping === "byte" ? value : phi(value)));
  const plain = cipher.map((value, i) =>
    mod(value + candidate.a * baseKey[i] + candidate.b));
  const rebuilt = plain.map((value, i) =>
    mod(value - candidate.a * baseKey[i] - candidate.b));
  assert.deepEqual(rebuilt, cipher);
}

// Source-shaped positive: use one frozen source register and a nontrivial
// affine key to encrypt an independently sampled exact-word-shape native plant.
const plant = sampleNative();
const plantRightFirst = true;
const plantMapping = "totient";
const plantA = 17;
const plantB = 19;
const plantOrdered = centerOut(bracket, plantRightFirst);
const plantKey = plantOrdered.map((value) => mod(phi(value)));
const syntheticCipher = plant.map((value, i) =>
  mod(value - plantA * plantKey[i] - plantB));
const recovered = syntheticCipher.map((value, i) =>
  mod(value + plantA * plantKey[i] + plantB));
assert.deepEqual(recovered, plant);

console.log(JSON.stringify({
  source: {
    bracketCells: [left, right],
    center,
    centerPrintedToken: "13",
    p55StrictInteriors: cipher.length,
  },
  family: {
    centerOutOrders: 2,
    mappings: ["byte mod29", "phi(byte) mod29"],
    affinePairsPerRegister: 29 * 29,
    totalCandidates: candidates.length,
  },
  original: {
    unchangedScore: score(cipher),
    best,
    top10: candidates.slice(0, 10),
  },
  exactWordShapeNativeControls: {
    samples: nativeScores.length,
    min: nativeScores[0],
    median: nativeScores[Math.floor(nativeScores.length / 2)],
    p95: nativeScores[Math.floor(nativeScores.length * 0.95)],
    bestOriginalAboveNativeMin: best.score >= nativeScores[0],
  },
  positivePlant: {
    rightFirst: plantRightFirst,
    mapping: plantMapping,
    a: plantA,
    b: plantB,
    recoveredRunes: recovered.length,
    nativeScore: score(recovered),
  },
}, null, 2));
