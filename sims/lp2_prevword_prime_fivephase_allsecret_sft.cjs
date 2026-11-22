"use strict";

/**
 * Original-source all-secret gate for a causal previous-word numerical rekey.
 * State K_w = sum(GP_prime[C_(w-1)]) modulo 29; K_0 = 0.
 * Phase j modulo 5 restarts at each original printed word.
 *
 * For each of 29*5 states, any secret 29-symbol permutation is permitted:
 * C[w,j] = sigma[K_w,j%5](P[w,j]).
 * A state-conditioned equality-pair sum is therefore key-independent.
 *
 * Windows Node.js 22: node sims/lp2_prevword_prime_fivephase_allsecret_sft.cjs
 * Dependency-free CommonJS, read-only, one runnable test file.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} pathname */
function read(pathname) {
  return fs.readFileSync(path.join(ROOT, pathname), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeMap = new Map(gp.runes.map((rune, i) => [rune, i]));
const source = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");

/** @type {number[][]} */
const words = [];
let current = [];
function finishWord() {
  if (current.length) {
    words.push(current);
    current = [];
  }
}
for (const ch of source) {
  if (runeMap.has(ch)) current.push(runeMap.get(ch));
  else if (ch === "/" || ch === "%" || /\s/u.test(ch)) {
    // An original printed carry or a line/page break leaves the word intact.
  } else finishWord();
}
finishWord();
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);
assert.deepEqual(words.flat(), gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices));

/** @param {number[]} word */
function numericalState(word) {
  return word.reduce((sum, rune) => sum + gp.prime[rune], 0) % 29;
}
/** @param {number[][]} ciphertext */
function previousWordStates(ciphertext) {
  return ciphertext.map((_, i) => i ? numericalState(ciphertext[i - 1]) : 0);
}

/**
 * All 145 possible state×five-phase alphabets remain arbitrary bijections.
 * This exact equality-pair metric is invariant under every one of them.
 * @param {number[][]} entries
 * @param {number[]} states
 */
function collisionPairs(entries, states) {
  assert.equal(entries.length, states.length);
  const counts = Array.from({length: 145}, () => new Uint32Array(29));
  const totals = new Uint32Array(145);
  for (let i = 0; i < entries.length; i++) {
    for (let j = 0; j < entries[i].length; j++) {
      const state = states[i] * 5 + (j % 5);
      counts[state][entries[i][j]]++;
      totals[state]++;
    }
  }
  let pairs = 0;
  let hits = 0;
  for (let k = 0; k < 145; k++) {
    const m = totals[k];
    pairs += m * (m - 1) / 2;
    for (const n of counts[k]) hits += n * (n - 1) / 2;
  }
  return {pairs, hits, rate: hits / pairs};
}
const originalStates = previousWordStates(words);
const original = collisionPairs(words, originalStates);
assert.deepEqual([original.pairs, original.hits], [657106, 22442]);

const tokens = gp.translit.map((value, index) => ({value, index}))
  .sort((a, b) => b.value.length - a.value.length);

/** Original LP1-authenticated GP spellings: ING and IO ligatures. */
function encodeNativeWord(raw) {
  const word = raw.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {
      out.push(21);
      i += 3;
    } else if (word.startsWith("IO", i)) {
      out.push(27);
      i += 2;
    } else {
      const token = tokens.find(t => word.startsWith(t.value, i));
      assert(token, "Unmapped original-source reference spelling");
      out.push(token.index);
      i += token.value.length;
    }
  }
  return out;
}

/** @param {string} file */
function wordPools(file) {
  const text = read(file);
  /** @type {Map<number,number[][]>} */
  const pools = new Map();
  const rawWords = text.match(/[A-Za-z]+/g) || [];
  for (const rawWord of rawWords) {
    const encoded = encodeNativeWord(rawWord);
    if (!pools.has(encoded.length)) pools.set(encoded.length, []);
    pools.get(encoded.length).push(encoded);
  }
  for (let n = 1; n <= 14; n++) assert(pools.get(n)?.length,
    "reference source must contain original exact word length " + n);
  return {pools, sourceTokens: rawWords.length};
}
const controls = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 15733],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 55407],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 77932]
];
const summary = [];
let plantedPlain = null;
for (const [name, filename, tokenCount] of controls) {
  const {pools, sourceTokens} = wordPools(filename);
  assert.equal(sourceTokens, tokenCount);
  let random = 0x3301a14d;
  const evaluations = [];
  for (let trial = 0; trial < 48; trial++) {
    const selected = words.map(w => {
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      const pool = pools.get(w.length);
      return pool[random % pool.length];
    });
    if (name === "Gibran" && trial === 0) plantedPlain = selected;
    evaluations.push(collisionPairs(selected, originalStates));
  }
  assert(evaluations.every(e => e.pairs === original.pairs));
  const rates = evaluations.map(e => e.rate);
  const minimum = Math.min(...rates), maximum = Math.max(...rates);
  const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
  assert(minimum > original.rate * 2, name + " native GP control");
  summary.push({name, nativeTextTokens: tokenCount,
    exactLengthMatchedTrials: rates.length, min: minimum,
    mean, max: maximum, atOrBelowOriginal: rates.filter(r => r <= original.rate).length});
}
assert(plantedPlain);
assert.deepEqual(summary.map(s => s.atOrBelowOriginal), [0, 0, 0]);

// Complete reversible plant. Each secret pair (state, phase) uses a separate
// nonzero scalar and offset, hence an independently keyed 29-symbol bijection.
// The encoder obtains state from the PREVIOUS CIPHERTEXT WORD, as the
// original hypothesized decoder must. Nothing reads future plaintext.
const alphabets = Array.from({length: 145}, (_, k) => {
  const a = (Math.imul(k + 1, 13) % 28) + 1;
  const b = (k * 11 + 7) % 29;
  const inverse = Array.from({length: 29}, (_, x) => {
    for (let v = 0; v < 29; v++) if ((a * v + b) % 29 === x) return v;
    throw new Error("No inverse for supposedly bijective alphabet");
  });
  return {a, b, inverse};
});
const encrypted = [];
const decrypted = [];
for (const plain of plantedPlain) {
  const state = encrypted.length ? numericalState(encrypted.at(-1)) : 0;
  const cipher = plain.map((x, j) => {
    const table = alphabets[state * 5 + (j % 5)];
    return (table.a * x + table.b) % 29;
  });
  const inverse = cipher.map((x, j) =>
    alphabets[state * 5 + (j % 5)].inverse[x]);
  assert.deepEqual(inverse, plain);
  encrypted.push(cipher);
  decrypted.push(inverse);
}
assert.equal(decrypted.flat().length, 12956);
const trueCipherStates = previousWordStates(encrypted);
const encryptedInvariant = collisionPairs(encrypted, trueCipherStates);
const plaintextInvariant = collisionPairs(plantedPlain, trueCipherStates);
assert.deepEqual(encryptedInvariant, plaintextInvariant);
assert.deepEqual([encryptedInvariant.pairs, encryptedInvariant.hits],
  [662236, 47972]);
console.log(JSON.stringify({
  hypothesis: "Previous ciphertext word GP-prime-sum mod29 selects five word-relative unknown alphabets",
  originalRunes: 12956,
  authenticPrintedWords: 2896,
  independentSecretPermutations: 145,
  keylessSourceCollisionPairs: original,
  exactSourceLengthMatchedControls: summary,
  inversePlant: {plaintextRunes: 12956, exactlyRecovered: 12956,
    unchangedAllSecretCollisionMetric: encryptedInvariant},
  historicalAuthentication: "An analogy from five-dot imagery and 2016 signed words/numbers; no authored substitution instruction",
  recoveredUnknownPlaintext: false,
  verdict: "Bounded GP-native prose exclusion for this precise word-numerical, stationary state-reuse cipher"
}, null, 2));
