#!/usr/bin/env node
"use strict";

// Test only original p55. The p0-p2 and p32 east-edge -> p3 cases already
// exist in sims/lp2_27x27_eastmap_p32_to_p3_sft.cjs. This script adds p55
// with the authentic transparent-plaintext-F clock and fixed source phases.
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
const p57Plant = page(57).slice(0, 76);
const p57Control = p57Plant.slice(0, 75);
assert.equal(p55.length, 76);
assert.equal(p55Body.length, 75);
assert.equal(p57Plant.length, 76);

const map0to2 = [...page(0), ...page(1), ...page(2)];
assert.equal(map0to2.length, 729);
assert.equal(map0to2.length, 27 * 27);
const east0to2 = Array.from({ length: 27 }, (_, row) => map0to2[row * 27 + 26]);
assert.deepEqual(east0to2, [
  17,17,21,25,7,11,25,28,1,4,16,6,9,24,28,5,1,8,6,19,8,16,18,20,7,21,7
]);

const p32 = page(32);
assert.equal(p32.length, 121);
assert.equal(p32.length, 11 * 11);
const east32 = Array.from({ length: 11 }, (_, row) => p32[row * 11 + 10]);
assert.deepEqual(east32, [21,7,2,23,14,17,7,2,11,24,12]);

const prefixTo55 = corpus.pages.filter(p => p.page < 55)
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(prefixTo55, 12880);
const afterP32To55 = corpus.pages.filter(p => p.page > 32 && p.page < 55)
  .reduce((sum, p) => sum + p.indices.length, 0);
assert.equal(afterP32To55, 4920);

const sourceMaps = [
  {
    name: "p0-p2-27x27",
    east: east0to2,
    phases: [
      { label: "page-reset", phase: 0 },
      { label: "continuous-no-prior-F-skip", phase: prefixTo55 % 27 },
    ],
  },
  {
    name: "p32-11x11",
    east: east32,
    phases: [
      { label: "page-reset", phase: 0 },
      { label: "continuous-from-p32-no-prior-F-skip", phase: afterP32To55 % 11 },
      { label: "continuous-from-p0-no-prior-F-skip", phase: prefixTo55 % 11 },
    ],
  },
];
assert.deepEqual(sourceMaps.map(x => x.phases.map(p => p.phase)), [[0,1],[0,3,10]]);

const fPositions = p55.map((x, i) => x === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(fPositions, [15,25,41]);
const fBit = new Map(fPositions.map((p, bit) => [p, bit]));

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
// An unselected ciphertext F may decrypt to a non-F rune. If any key-consuming
// position decrypts to plaintext F, reject that path under the known p56 rule.
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

const allCandidates = [];
const perSource = [];
const plantChecks = [];
for (const source of sourceMaps) {
  const keyVariants = [
    { name: "rune-index-east-down", key: source.east },
    { name: "rune-index-east-up", key: [...source.east].reverse() },
    { name: "gp-prime-mod29-east-down", key: source.east.map(x => corpus.prime[x] % 29) },
    { name: "gp-prime-mod29-east-up", key: source.east.map(x => corpus.prime[x] % 29).reverse() },
    { name: "phi-gp-prime-east-down", key: source.east.map(x => (corpus.prime[x] - 1) % 29) },
    { name: "phi-gp-prime-east-up", key: source.east.map(x => (corpus.prime[x] - 1) % 29).reverse() },
  ];

  // Positive control: every key representation and every tested phase must
  // invert a 76-rune p57 plant, including its actual transparent-F positions.
  for (const variant of keyVariants) {
    for (const phaseSpec of source.phases) {
      const enc = encryptWithTransparentF(p57Plant, variant.key, phaseSpec.phase);
      const recovered = decodeWithTransparentF(enc.cipher, variant.key, phaseSpec.phase, enc.literalFPositions);
      assert.deepEqual(recovered, p57Plant);
      plantChecks.push({
        source: source.name, key: variant.name, clock: phaseSpec.label,
        phase: phaseSpec.phase, exactRoundTrip: true,
        literalFPositions: enc.literalFPositions,
      });
    }
  }

  const sourceCandidates = [];
  let invalidCount = 0;
  for (const variant of keyVariants) {
    for (const phaseSpec of source.phases) {
      for (let mask = 0; mask < 8; mask++) {
        const literalFPositions = fPositions.filter((_, bit) => mask & (1 << bit));
        const decoded = decodeWithTransparentF(p55, variant.key, phaseSpec.phase, literalFPositions);
        if (!decoded) {
          invalidCount++;
          continue;
        }
        const body = decoded.slice(1);
        const candidate = {
          source: source.name,
          key: variant.name,
          clock: phaseSpec.label,
          phase: phaseSpec.phase,
          mask,
          literalFPositions,
          ioc: ioc(body),
          ...languageScore(body),
        };
        sourceCandidates.push(candidate);
        allCandidates.push(candidate);
      }
    }
  }
  sourceCandidates.sort((a, b) => b.meanNatsPerQuadgram - a.meanNatsPerQuadgram);
  perSource.push({
    source: source.name,
    keyLength: source.east.length,
    phases: source.phases,
    totalCandidates: keyVariants.length * source.phases.length * 8,
    validCandidates: sourceCandidates.length,
    rejectedByTransparentFConsistency: invalidCount,
    best: sourceCandidates[0],
    allValid: sourceCandidates,
  });
}

allCandidates.sort((a, b) => b.meanNatsPerQuadgram - a.meanNatsPerQuadgram);
assert.deepEqual(perSource.map(x => [x.source,x.totalCandidates,x.validCandidates,x.rejectedByTransparentFConsistency]), [
  ["p0-p2-27x27",96,8,88],
  ["p32-11x11",144,5,139],
]);
assert.equal(allCandidates.length, 13);
assert.equal(plantChecks.length, 30);

const original = languageScore(p55Body);
const control = languageScore(p57Control);
assert.ok(Math.abs(original.meanNatsPerQuadgram - (-15.58578427847444)) < 1e-12);
assert.ok(Math.abs(control.meanNatsPerQuadgram - (-9.958844623872421)) < 1e-12);
assert.ok(Math.abs(perSource[0].best.meanNatsPerQuadgram - (-15.064288444269039)) < 1e-12);
assert.ok(Math.abs(perSource[1].best.meanNatsPerQuadgram - (-15.767651993467785)) < 1e-12);

console.log(JSON.stringify({
  scope: "p55 only; p3 direct east-edge tests already exist in sims/lp2_27x27_eastmap_p32_to_p3_sft.cjs",
  maps: sourceMaps.map(s => ({
    name: s.name, keyLength: s.east.length, eastEdgeRuneIndices: s.east,
    phases: s.phases,
  })),
  p55: { pageRunes: p55.length, bodyRunes: p55Body.length, ciphertextFPositions: fPositions },
  totalCandidates: 240,
  validCandidates: allCandidates.length,
  rejectedByTransparentFConsistency: 227,
  originalBody: { ioc: ioc(p55Body), ...original },
  clearP57Control75: { ioc: ioc(p57Control), ...control },
  perSource,
  syntheticPositiveControls: plantChecks,
}, null, 2));
