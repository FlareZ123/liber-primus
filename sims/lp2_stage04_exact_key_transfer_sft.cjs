"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const historical = require("./historical_text_guide_terminal_vigenere_sft.cjs");

const ROOT = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const reference = fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp1-plaintext-reference.txt"), "utf8");
const GP = corpus.translit;
const pages = corpus.pages;
const mod = x => ((x % 29) + 29) % 29;

function primes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}

function trigramScorer(source) {
  const bigrams = new Map(), trigrams = new Map();
  for (let i = 2; i < source.length; i++) {
    const b = source[i - 2] * 29 + source[i - 1];
    const t = b * 29 + source[i];
    bigrams.set(b, (bigrams.get(b) || 0) + 1);
    trigrams.set(t, (trigrams.get(t) || 0) + 1);
  }
  return text => {
    let log = 0;
    for (let i = 2; i < text.length; i++) {
      const b = text[i - 2] * 29 + text[i - 1];
      log += Math.log((1 + (trigrams.get(b * 29 + text[i]) || 0)) /
        (29 + (bigrams.get(b) || 0)));
    }
    return log / (text.length - 2);
  };
}

function ioc(text) {
  const freq = Array(29).fill(0);
  for (const x of text) freq[x]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) /
    (text.length * (text.length - 1));
}

function decodePages(chunks, key, sign, resetPages) {
  const out = [];
  let keyPosition = 0;
  for (let p = 0; p < chunks.length; p++) {
    if (resetPages.has(p)) keyPosition = 0;
    for (const c of chunks[p]) {
      out.push(mod(c + sign * key[keyPosition % key.length]));
      keyPosition++;
    }
  }
  return out;
}

function reversiblePagePlant(key, sign) {
  const plain = Array.from({ length: key.length * 3 + 7 }, (_, i) => (11 * i + 4) % 29);
  const cipher = plain.map((p, i) => mod(p - sign * key[i % key.length]));
  const recovered = cipher.map((c, i) => mod(c + sign * key[i % key.length]));
  assert.deepEqual(recovered, plain);
}

const key = historical.encodeGP("WELCOME PILGRIM TO THE GREAT");
assert.deepEqual(key, [
  7,18,20,5,3,19,18,13,10,20,6,4,10,19,16,3,2,18,6,4,28,16
]);
assert.equal(key.length, 22);

// Exact historical Stage04 positive control: same key and inverse recover the
// known onion address from the original runic source string.
const onion = "ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3 ᛠᛗᛇᚠᛡ";
const onionOut = historical.historicalOnionInverse(onion, key);
assert.equal(onionOut, "AUOWYFGL5LCSFJ3 NONIAN");
const normalizedDomain = onionOut.replace(" ", "").replace(/^AU/u, "AV")
  .replace("LCS", "LKZ").replace(/IAN$/u, "ION");
assert.equal(normalizedDomain.slice(0, 16) + "." + normalizedDomain.slice(16),
  "AVOWYFGL5LKZFJ3N.ONION");

const training = historical.encodeGP(reference.replace(/^#.*$/gm, ""));
const score = trigramScorer(training);
const chunks = pages.slice(0, 56).map(p => p.indices);
assert.equal(chunks.flat().length, 12956);

const clocks = {
  global: new Set([0]),
  page: new Set(Array.from({ length: 56 }, (_, i) => i)),
  chapter: new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]),
};
const wholeBook = [];
for (const [clock, reset] of Object.entries(clocks)) {
  for (const sign of [-1, 1]) {
    reversiblePagePlant(key, sign);
    const plain = decodePages(chunks, key, sign, reset);
    wholeBook.push({
      clock,
      operation: sign < 0 ? "C-K (source-exact)" : "C+K (opposite-sign control)",
      score: score(plain),
      ioc: ioc(plain),
      preview: plain.slice(0, 120).map(i => GP[i]).join(""),
      length: plain.length,
    });
  }
}

const p55 = pages.find(p => p.page === 55).indices;
const p56Cipher = pages.find(p => p.page === 56).indices;
const p56Plain = [];
const prime = primes(90);
let keyPosition = 0;
for (let i = 0; i < p56Cipher.length; i++) {
  if (i === 56) p56Plain.push(0);
  else p56Plain.push(mod(p56Cipher[i] - (prime[keyPosition++] - 1)));
}
const p57 = pages.find(p => p.page === 57).indices;
assert.equal(p55.length, 76);
assert.deepEqual(p55.flatMap((c, i) => c === 0 ? [i] : []), [15, 25, 41]);
assert.equal(p56Plain.length, 85);
assert.equal(p56Plain.map(i => GP[i]).join(""),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");
assert.equal(p57.length, 95);

const p55SkipCandidates = [];
for (let mask = 0; mask < 8; mask++) {
  const plain = historical.decodeP55(p55, key, mask);
  p55SkipCandidates.push({
    literalFSkipMask: mask,
    score: score(plain),
    preview: plain.map(i => GP[i]).join(""),
  });
}
p55SkipCandidates.sort((a, b) => b.score - a.score);

const controls = {
  p55Cipher: score(p55),
  p56KnownPlaintext: score(p56Plain),
  p57ClearPlaintext: score(p57),
  wholeBookCipher: score(chunks.flat()),
};
assert(Math.abs(controls.p55Cipher - (-3.4018113590540926)) < 1e-9);
assert(Math.abs(controls.p56KnownPlaintext - (-2.4361899127543354)) < 1e-9);
assert(Math.abs(controls.p57ClearPlaintext - (-2.485745912452336)) < 1e-9);
assert(Math.abs(controls.wholeBookCipher - (-3.417776421631333)) < 1e-9);
assert.equal(p55SkipCandidates.length, 8);
assert.equal(p55SkipCandidates[0].literalFSkipMask, 2);
assert(Math.abs(p55SkipCandidates[0].score - (-3.389009335433979)) < 1e-9);

console.log(JSON.stringify({
  keyPhrase: "WELCOME PILGRIM TO THE GREAT",
  keyValues: key,
  historicalPositiveControl: { onionOut, normalizedDomain },
  controls,
  wholeBookTransfer: wholeBook,
  p55WithLiteralFInterruptions: p55SkipCandidates,
  conclusion: "The exact Stage04 key works on its historical onion control but does not recover LP2 plaintext under global, page-reset, or chapter-reset reuse. Its p55 literal-F variants are also nonlinguistic.",
}, null, 2));
