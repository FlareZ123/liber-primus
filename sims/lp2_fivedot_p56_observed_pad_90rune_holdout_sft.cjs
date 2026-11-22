"use strict";

/**
 * Test the source-registered 85-slot p56 observed additive key as a period-85
 * reset pad on the first 90 runes of p7/p23 in p56's canonical orientation.
 * The p56 literal-F bypass is an undefined key slot, never a zero-valued key.
 *
 * Node 22: node sims/lp2_fivedot_p56_observed_pad_90rune_holdout_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const base = path.join(ROOT, "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(base, "lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(ROOT, "resources", "lp2-transcription.txt"), "utf8"
).split("%");
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod29 = (x) => ((x % 29) + 29) % 29;
const latin = (values) => values.map((v) => v === null ? "?" : corpus.translit[v]).join("");

function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate++) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor++) {
      if (candidate % divisor === 0) { prime = false; break; }
    }
    if (prime) out.push(candidate);
  }
  return out;
}
function printedLines(page) {
  return transcription[page].split(/\/\s*|\n+/)
    .map((line) => [...line].filter((r) => runeToIndex.has(r)).map((r) => runeToIndex.get(r)))
    .filter((line) => line.length > 0);
}
function orient(lines, reverseLines, reverseSymbols) {
  const ordered = reverseLines ? lines.slice().reverse() : lines;
  return ordered.flatMap((line) => reverseSymbols ? line.slice().reverse() : line);
}
function ioc(values) {
  const known = values.filter((v) => v !== null);
  const counts = Array(29).fill(0);
  for (const v of known) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (known.length * (known.length - 1));
}
function decryptWindow(ciphertext, key) {
  return ciphertext.map((c, i) => {
    const k = key[i % key.length];
    return k === null ? null : mod29(c - k);
  });
}
function reencryptKnown(plaintext, key) {
  return plaintext.map((p, i) => {
    const k = key[i % key.length];
    return p === null || k === null ? null : mod29(p + k);
  });
}

// Reproduce the authentic p56 prime-totient plaintext as a positive control.
const p56Cipher = corpus.pages.find((p) => p.page === 56).indices;
assert.equal(p56Cipher.length, 85);
const p56Primes = firstPrimes(84);
let consumed = 0;
const p56Plain = p56Cipher.map((c, i) => {
  if (i === 56) return 0;
  return mod29(c - (p56Primes[consumed++] - 1));
});
assert.equal(consumed, 84);
assert.equal(
  latin(p56Plain),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE"
);
assert.equal(p56Cipher[56], 0);
assert.equal(p56Plain[56], 0);

// Actual observed key difference; do not convert the literal-F bypass into key 0.
const key = p56Cipher.map((c, i) => i === 56 ? null : mod29(c - p56Plain[i]));
assert.equal(key.length, 85);
assert.deepEqual(key.flatMap((v, i) => v === null ? [i] : []), [56]);
const p56Recovered = decryptWindow(p56Cipher, key);
assert.deepEqual(p56Recovered.map((v, i) => v === null ? p56Cipher[i] : v), p56Plain);
assert.deepEqual(
  reencryptKnown(p56Recovered, key).map((v, i) => v === null ? p56Cipher[i] : v),
  p56Cipher
);

// Planted 90-symbol control verifies period-85 wrap and the undefined slot.
const plantedPlain = Array.from({ length: 90 }, (_, i) => (7 * i + 3) % 29);
const plantedCipher = plantedPlain.map((p, i) =>
  key[i % 85] === null ? mod29(p + 1) : mod29(p + key[i % 85]));
const plantedRecovered = decryptWindow(plantedCipher, key);
assert.equal(plantedRecovered.filter((v) => v !== null).length, 89);
assert.deepEqual(
  plantedRecovered.filter((v) => v !== null),
  plantedPlain.filter((_, i) => i !== 56)
);
assert.equal(plantedRecovered[56], null);
assert.deepEqual(
  reencryptKnown(plantedRecovered, key).map((v, i) => v === null ? plantedCipher[i] : v),
  plantedCipher
);

// One shared, source-fixed reset: phase zero on both pages. The original
// five-dot registration fixes p7->p56 horizontal reflection and p23->p56 180°.
const outputs = [];
for (const page of [7, 23]) {
  const lines = printedLines(page);
  const original = corpus.pages.find((p) => p.page === page).indices;
  assert.deepEqual(orient(lines, false, false), original);
  const transformed = orient(lines, page === 23, true);
  assert.equal(transformed.length, page === 7 ? 208 : 213);
  const window = transformed.slice(0, 90);
  assert.equal(window.length, 90);
  const plaintext = decryptWindow(window, key);
  assert.equal(plaintext.filter((v) => v !== null).length, 89);
  const remasked = reencryptKnown(plaintext, key);
  assert.ok(window.every((v, i) =>
    remasked[i] === null ? i % 85 === 56 : remasked[i] === v
  ));
  const wrap = Array.from({ length: 5 }, (_, i) => ({
    targetOffset: 85 + i,
    keyOffset: i,
    keyValue: key[i],
    ciphertext: window[85 + i],
    predictedPlaintext: plaintext[85 + i],
    predictedRune: corpus.translit[plaintext[85 + i]],
  }));
  outputs.push({
    page,
    sourceOrientation: page === 7
      ? "horizontal reflection: reverse symbols within each printed line"
      : "180-degree rotation: reverse line order and symbols within each line",
    keyPeriod: 85,
    keyPhase: 0,
    windowLength: 90,
    undefinedKeyOffsets: [56],
    knownPredictions: 89,
    unknownTargetOffsets: plaintext.flatMap((v, i) => v === null ? [i] : []),
    plaintextRuneIndices: plaintext,
    plaintextTransliteration: latin(plaintext),
    knownPositionIoC: ioc(plaintext),
    exactReencryptionAtEveryKnownPosition: true,
    fiveSymbolWraparound: wrap,
  });
}

console.log(JSON.stringify({
  status: "fixed source-registered shared-pad holdout; no phase search",
  p56Control: {
    recoveredKnownPositions: 84,
    totalPositions: 85,
    literalFBypassOffset: 56,
    observedKey: key,
    plaintext: latin(p56Plain),
    exactReencryption: true,
  },
  plantedPositiveControl: {
    windowLength: 90,
    recoveredKnownPositions: 89,
    undefinedOffset: 56,
    period85WrapValidated: true,
    exactReencryptionAtEveryKnownPosition: true,
  },
  sharedAlignment: {
    sourceStart: "first rune in p56-canonical orientation",
    keyPhaseForBothTargets: 0,
    keyPeriod: 85,
    p7Transform: "horizontal reflection",
    p23Transform: "180-degree rotation",
    windowLength: 90,
    noOtherAlignmentTested: true,
  },
  outputs,
  decision: "Reject this period-85 reused observed additive pad: both independent 90-rune target windows are nonlinguistic despite 89/90 supported predictions and exact remasking."
}, null, 2));
