#!/usr/bin/env node
"use strict";

// Extend the existing p0-p2 east-edge -> p3 test to original p55 only.
// Borrow the authentic solved-p56 transparent-plaintext-F clock; the key
// mappings below are explicit hypotheses, not an authenticated p56 key.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"
));
const qgramText = fs.readFileSync(
  path.join(root, "resources/control/duko_round27_english_quadgrams.txt"), "utf8"
);
const qgrams = new Map();
let qtotal = 0;
for (const line of qgramText.trim().split("\n")) {
  const m = line.trim().match(/^([A-Z]{4})\s+(\d+)$/);
  if (m) {
    const n = Number(m[2]);
    qgrams.set(m[1], n);
    qtotal += n;
  }
}
assert.equal(qgrams.size, 79495);

const page = n => {
  const p = corpus.pages.find(x => x.page === n);
  assert.ok(p, "missing page " + n);
  return p.indices;
};
const p55 = page(55);
const p55Body = p55.slice(1); // first rune is the incoming p54 word carry
const p57Control = page(57).slice(0, 75);
assert.equal(p55.length, 76);
assert.equal(p55Body.length, 75);
assert.equal(p57Control.length, 75);

const map = [...page(0), ...page(1), ...page(2)];
assert.equal(map.length, 729);
assert.equal(map.length, 27 * 27);
const east = Array.from({ length: 27 }, (_, row) => map[row * 27 + 26]);
assert.deepEqual(east, [
  17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7
]);

const keyVariants = [
  { name: "rune-index-east-down", key: east },
  { name: "rune-index-east-up", key: [...east].reverse() },
  { name: "gp-prime-mod29-east-down", key: east.map(x => corpus.prime[x] % 29) },
  { name: "gp-prime-mod29-east-up", key: east.map(x => corpus.prime[x] % 29).reverse() },
  { name: "phi-gp-prime-east-down", key: east.map(x => (corpus.prime[x] - 1) % 29) },
  { name: "phi-gp-prime-east-up", key: east.map(x => (corpus.prime[x] - 1) % 29).reverse() },
];

const fPositions = p55.map((x, i) => x === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(fPositions, [15,25,41]);
const prefixTo55 = corpus.pages.filter(p => p.page < 55)
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(prefixTo55, 12880);
const continuousNoPriorSkipPhase = prefixTo55 % 27;
assert.equal(continuousNoPriorSkipPhase, 1);

const mod = x => (x % 29 + 29) % 29;
const ioc = values => {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
};
const render = values => values.map(x => corpus.translit[x]).join("");
function languageScore(values) {
  const letters = render(values);
  let score = 0;
  for (let i = 0; i + 3 < letters.length; i++) {
    score += Math.log((qgrams.get(letters.slice(i, i + 4)) || 0.1) / qtotal);
  }
  const quadgrams = Math.max(0, letters.length - 3);
  return { letters, quadgrams, score, meanNatsPerQuadgram: score / Math.max(1, quadgrams) };
}

// A selected ciphertext F is literal plaintext F and consumes no key.
// An unselected ciphertext F may be encrypted non-F. If any key-consuming
// position decrypts to plaintext F, reject that path: plaintext F must bypass.
function decodeWithTransparentF(cipher, key, phase, literalFPositions) {
  const literal = new Set(literalFPositions);
  let j = phase;
  const out = [];
  for (let i = 0; i < cipher.length; i++) {
    if (literal.has(i)) {
      if (cipher[i] !== 0) return null;
      out.push(0);
      continue;
    }
    const p = mod(cipher[i] - key[j % key.length]);
    if (p === 0) return null;
    out.push(p);
    j++;
  }
  return out;
}

function encryptWithTransparentF(plain, key, phase) {
  let j = phase;
  const cipher = [];
  const literalFPositions = [];
  for (let i = 0; i < plain.length; i++) {
    if (plain[i] === 0) {
      cipher.push(0);
      literalFPositions.push(i);
    } else {
      cipher.push(mod(plain[i] + key[j % key.length]));
      j++;
    }
  }
  return { cipher, literalFPositions };
}

// Positive control: every key representation and both tested clocks must
// invert a 76-rune known p57 plant with the exact F-bypass rule.
const plant = page(57).slice(0, 76);
assert.equal(plant.length, 76);
const plantChecks = [];
for (const variant of keyVariants) {
  for (const phase of [0, 1]) {
    const enc = encryptWithTransparentF(plant, variant.key, phase);
    const recovered = decodeWithTransparentF(enc.cipher, variant.key, phase, enc.literalFPositions);
    assert.deepEqual(recovered, plant);
    plantChecks.push({ key: variant.name, phase, exactRoundTrip: true,
      literalFPositions: enc.literalFPositions });
  }
}

const candidates = [];
let invalidCount = 0;
for (const variant of keyVariants) {
  for (const phaseSpec of [
    { label: "page-reset", phase: 0 },
    { label: "continuous-no-prior-F-skip", phase: continuousNoPriorSkipPhase },
  ]) {
    for (let mask = 0; mask < 8; mask++) {
      const literalFPositions = fPositions.filter((_, bit) => mask & (1 << bit));
      const decoded = decodeWithTransparentF(p55, variant.key, phaseSpec.phase, literalFPositions);
      if (!decoded) {
        invalidCount++;
        continue;
      }
      const body = decoded.slice(1);
      candidates.push({
        key: variant.name,
        clock: phaseSpec.label,
        phase: phaseSpec.phase,
        mask,
        literalFPositions,
        ioc: ioc(body),
        ...languageScore(body),
      });
    }
  }
}
candidates.sort((a, b) => b.meanNatsPerQuadgram - a.meanNatsPerQuadgram);
assert.equal(keyVariants.length * 2 * 8, 96);
assert.equal(candidates.length, 8);
assert.equal(invalidCount, 88);
const expected = [
  ["phi-gp-prime-east-down",0,4],
  ["phi-gp-prime-east-up",0,3],
  ["rune-index-east-down",1,3],
  ["rune-index-east-down",1,5],
  ["rune-index-east-down",1,6],
  ["rune-index-east-up",0,1],
  ["rune-index-east-up",0,2],
  ["rune-index-east-up",0,4],
].map(x => x.join("|")).sort();
assert.deepEqual(candidates.map(x => [x.key,x.phase,x.mask].join("|")).sort(), expected);

const original = languageScore(p55Body);
const control = languageScore(p57Control);
assert.ok(Math.abs(original.meanNatsPerQuadgram - (-15.58578427847444)) < 1e-12);
assert.ok(Math.abs(control.meanNatsPerQuadgram - (-9.958844623872421)) < 1e-12);
assert.ok(Math.abs(candidates[0].meanNatsPerQuadgram - (-15.064288444269039)) < 1e-12);

console.log(JSON.stringify({
  scope: "p55 only; p3 east-edge direct and p56-totient tests already exist in sims/lp2_27x27_eastmap_p32_to_p3_sft.cjs",
  eastEdgeRuneIndices: east,
  eastEdgeTransliteration: render(east),
  p55: { pageRunes: p55.length, bodyRunes: p55Body.length, ciphertextFPositions: fPositions },
  keyCandidates: keyVariants.map(x => x.name),
  clocks: [
    { name: "page-reset", phase: 0 },
    { name: "continuous-no-prior-F-skip", phase: continuousNoPriorSkipPhase,
      caveat: "assumes no earlier plaintext-F bypasses before p55" }
  ],
  totalCandidates: 96,
  validCandidates: candidates.length,
  rejectedByTransparentFConsistency: invalidCount,
  originalBody: { ioc: ioc(p55Body), ...original },
  clearP57Control75: { ioc: ioc(p57Control), ...control },
  bestCandidate: candidates[0],
  allValidCandidates: candidates,
  syntheticPositiveControls: plantChecks,
}, null, 2));
