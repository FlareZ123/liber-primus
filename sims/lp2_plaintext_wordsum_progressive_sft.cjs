"use strict";

/**
 * Original-input gate: GP29 progressive shift whose word key is the
 * plaintext word's own ordinal / Gematria-prime / prime-totient sum.
 *
 * Native original-text invariants, not an English-likeness screening.
 * Run: node sims/lp2_plaintext_wordsum_progressive_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const native = parseSharedCorpus();
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (v) => (v % 29 + 29) % 29;

/** @param {string} runes @returns {number[]} */
function ordinals(runes) {
  return [...runes].map((r) => {
    assert.ok(index.has(r), "unknown GP rune");
    return index.get(r);
  });
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * C[j] = P[j] - sign * (j+origin) * K (mod 29).
 * K = sum(f(P[j])) (mod 29). Exhaust all 29 possible word keys.
 *
 * @param {number[]} cipher
 * @param {(x:number)=>number} f
 * @param {number} origin
 * @param {number} sign
 * @returns {Array<{key:number, plain:number[]}>}
 */
function inverses(cipher, f, origin, sign) {
  const output = [];
  for (let key = 0; key < 29; key++) {
    const plain = cipher.map((c, j) => mod(c + sign * (j + origin) * key));
    if (mod(plain.reduce((s, n) => s + f(n), 0)) === key)
      output.push({key, plain});
  }
  return output;
}

/**
 * @param {number[]} plain
 * @param {(x:number)=>number} f
 * @param {number} origin
 * @param {number} sign
 * @returns {{key:number,cipher:number[]}}
 */
function encrypt(plain, f, origin, sign) {
  const key = mod(plain.reduce((s, n) => s + f(n), 0));
  return {key, cipher: plain.map((p, j) =>
    mod(p - sign * (j + origin) * key))};
}

/** Native words from the signed 2016 Cicada plaintext, re-encoded in GP29. */
function nativePlant() {
  const tokens = [...corpus.translit].map((t, i) => ({t, i}))
    .sort((a, b) => b.t.length - a.t.length);
  return "LIBER PRIMUS IS THE WAY ITS WORDS ARE THE MAP SEEK AND YOU WILL BE FOUND"
    .split(" ").map((word) => {
      word = word.replace(/V/g, "U").replace(/[KQ]/g, "C")
        .replace(/Z/g, "S");
      const arr = [];
      for (let p = 0; p < word.length;) {
        const token = tokens.find((x) => word.startsWith(x.t, p));
        assert.ok(token, "source English word cannot be GP encoded");
        arr.push(token.i);
        p += token.t.length;
      }
      return arr;
    });
}

const words = native.words.map((w) => ordinals(w.runes));
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);
const controls = nativePlant();
assert.ok(controls.length > 10);
const families = [
  ["ordinal", (x) => x],
  ["prime", (x) => corpus.prime[x]],
  ["totient", (x) => corpus.prime[x] - 1],
];
const output = [];
for (const [name, f] of families) {
  for (const origin of [0, 1]) {
    for (const sign of [-1, +1]) {
      let noInverse = 0;
      let single = 0;
      let ambiguous = 0;
      let noInverseMultirune = 0;
      const firstFailures = [];
      for (let w = 0; w < words.length; w++) {
        const found = inverses(words[w], f, origin, sign);
        if (!found.length) {
          noInverse++;
          if (words[w].length > 1) noInverseMultirune++;
          if (firstFailures.length < 4) firstFailures.push({
            word: w, startPage: native.words[w].startPage,
            length: words[w].length,
          });
        } else if (found.length === 1) single++;
        else ambiguous++;
      }
      for (const plain of controls) {
        const generated = encrypt(plain, f, origin, sign);
        const recovered = inverses(generated.cipher, f, origin, sign);
        assert.ok(recovered.some((candidate) =>
          candidate.key === generated.key &&
          candidate.plain.every((v, j) => v === plain[j])),
        "original known-key/native-language positive plant missing");
        assert.ok(generated.cipher.every((v, j) => v ===
          encrypt(plain, f, origin, sign).cipher[j]),
        "forward cipher must reproduce its source-native plant");
      }
      output.push({
        family:name, origin, sign, noInverse,
        noInverseMultirune, single, ambiguous,
        firstFailures, nativePlantWordsPassed: controls.length,
      });
    }
  }
}
assert.deepEqual(output.map((r) => r.noInverse),
  [152, 433, 211, 82, 999, 964, 1046, 972, 917, 968, 1015, 1020]);
assert.deepEqual(output.map((r) => r.noInverseMultirune),
  [152, 433, 211, 0, 999, 964, 1022, 942, 917, 968, 990, 1000]);
const original = corpus.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(original.length, 12956);
console.log(JSON.stringify({
  hypothesis: "plaintext-sum keyed progressive native GP29 word shift",
  originalRunes: original.length, originalWords: words.length,
  nativeReferenceIoC: ioc(controls.flat()), models: output,
  verdict: "All 12 frozen self-key variants impossible on unmodified original words",
}, null, 2));
