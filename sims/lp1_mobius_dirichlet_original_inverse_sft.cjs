"use strict";
/**
 * Direct arithmetic Mobius inversion of Liber Primus (29-symbol alphabet).
 * Source cue: LP1 p05 explicitly prints MOBIUS. This tests the ordinary
 * number-theoretic divisor-sum interpretation, with no fitted keys.
 * Run: node sims/lp1_mobius_dirichlet_original_inverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const source = fs.readFileSync(
  path.join(root, "resources", "lp2-transcription.txt"), "utf8");
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const originalPages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
const book = originalPages.flatMap((p) => p.indices);
assert.equal(book.length, 12956);

/** @param {string} raw @returns {number[]} */
function runeIndices(raw) {
  return [...raw].filter((ch) => runeMap.has(ch)).map((ch) => runeMap.get(ch));
}

/** @param {string} raw @returns {number[][]} */
function completeWords(raw) {
  const out = [];
  let current = [];
  for (const ch of raw) {
    if (runeMap.has(ch)) current.push(runeMap.get(ch));
    else if (ch === "%" || ch === "/" || /\s/u.test(ch)) continue;
    else if (current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}
const unsolvedSource = source.split("%").slice(0, 55).join("%");
const words = completeWords(unsolvedSource);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), book);
const sectionParts = unsolvedSource.split("$")
  .map((part) => runeIndices(part)).filter((a) => a.length);
assert.deepEqual(sectionParts.flat(), book);
const inputs = {
  book: [book],
  page: originalPages.map((p) => p.indices),
  section: sectionParts,
  word: words,
};
/** @param {number} n @returns {Int8Array} */
function mobius(n) {
  const mu = new Int8Array(n + 1);
  const low = new Int32Array(n + 1);
  const primes = [];
  mu[1] = 1;
  for (let i = 2; i <= n; i++) {
    if (!low[i]) {
      low[i] = i;
      primes.push(i);
      mu[i] = -1;
    }
    for (const p of primes) {
      if (p > low[i] || p * i > n) break;
      low[p * i] = p;
      if (i % p === 0) {
        mu[p * i] = 0;
        break;
      }
      mu[p * i] = -mu[i];
    }
  }
  return mu;
}
const mu = mobius(book.length);
/** @param {number[]} plain @returns {number[]} */
function encrypt(plain) {
  const cipher = new Uint8Array(plain.length);
  for (let d = 1; d <= plain.length; d++) {
    for (let j = d; j <= plain.length; j += d)
      cipher[j - 1] = (cipher[j - 1] + plain[d - 1]) % 29;
  }
  return Array.from(cipher);
}
/** @param {number[]} cipher @returns {number[]} */
function decrypt(cipher) {
  const plain = new Uint8Array(cipher.length);
  for (let d = 1; d <= cipher.length; d++) {
    const multiplier = mu[d];
    if (!multiplier) continue;
    for (let j = d; j <= cipher.length; j += d) {
      const n = plain[j - 1] + multiplier * cipher[j / d - 1];
      plain[j - 1] = (n % 29 + 29) % 29;
    }
  }
  return Array.from(plain);
}
/** @param {number[]} symbols */
function summarize(symbols) {
  const counts = Array(29).fill(0);
  let equalPairs = 0;
  for (let i = 0; i < symbols.length; i++) {
    counts[symbols[i]]++;
    if (i && symbols[i] === symbols[i - 1]) equalPairs++;
  }
  return {
    length: symbols.length,
    ioc: counts.reduce((s, n) => s + n * (n - 1), 0)
      / (symbols.length * (symbols.length - 1)),
    adjacentEquals: equalPairs,
    preview: symbols.slice(0, 45).map((v) => corpus.translit[v]).join(""),
  };
}
const output = {original: summarize(book), variants: {}};
for (const [name, parts] of Object.entries(inputs)) {
  const decrypted = parts.flatMap(decrypt);
  assert.deepEqual(parts.map(decrypt).flatMap(encrypt), book);
  output.variants[name] = {
    blocks: parts.length,
    ...summarize(decrypted),
  };
}
const solved57 = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(solved57.length, 95);
const plant = encrypt(solved57);
assert.deepEqual(decrypt(plant), solved57);
output.solved57Plant = {
  source: summarize(solved57),
  encrypted: summarize(plant),
  exactRecovered: true,
};
const firstCounts = Array(29).fill(0);
for (const w of words) firstCounts[w[0]]++;
output.wordFirstRuneIoC = firstCounts.reduce((s, n) => s + n * (n - 1), 0)
  / (words.length * (words.length - 1));
console.log(JSON.stringify(output, null, 2));
