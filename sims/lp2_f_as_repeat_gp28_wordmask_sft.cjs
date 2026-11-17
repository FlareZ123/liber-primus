"use strict";

/**
 * LP2 original-cipher all-key gate for the reversible F-as-cipher-repeat family.
 *
 * Hypothesis: inside each original printed word, plaintext GP rune F (index 0)
 * emits the preceding ciphertext rune; every other plaintext rune emits one
 * of the remaining 28 runes by a keyed bijection. The first rune is emitted
 * literally, solely to make a complete, reproducible encoder. The forced-F
 * implication inside words holds for ANY first-rune rule or secret bijection:
 *
 *   P[j] = F => C[j] = C[j-1]  (j > 0).
 *
 * This is a conditional original-word-length model, NOT Cicada's documented
 * plaintext-F-transparent prime-totient cipher for solved LP2 p56.
 *
 * SFT (Windows Node 22): node sims/lp2_f_as_repeat_gp28_wordmask_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), "utf8")
  .replace(/\r\n/g, "\n");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const alphabet = new Map(gp.runes.map((r, i) => [r, i]));
const parts = read("resources/liber-primus/lp2-transcription.txt").split("%");
const stops = new Set(["-", ".", "&", "$", "§"]);

/** Preserve authentic printed words across 32 physical-page continuations.
 * @param {string} text
 * @returns {number[][]}
 */
function sourceWords(text) {
  const out = [];
  let pending = [];
  for (const rune of text) {
    if (alphabet.has(rune)) pending.push(alphabet.get(rune));
    else if (stops.has(rune) && pending.length) {
      out.push(pending);
      pending = [];
    }
  }
  if (pending.length) out.push(pending);
  return out;
}

/** A source-calibrated Latin->GP spelling from independently solved LP1.
 * @param {string} original
 * @returns {number[]}
 */
function spellGP(original) {
  const word = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const tokens = gp.translit.map((s, i) => ({s, i}))
    .sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {out.push(21); i += 3;}
    else if (word.startsWith("IO", i)) {out.push(27); i += 2;}
    else {
      const token = tokens.find(t => word.startsWith(t.s, i));
      assert(token, "unmapped source-native GP spelling");
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}

/** @param {number} wordIndex @param {number} runeIndex
 * @param {number} variant @returns {number}
 */
function keyAt(wordIndex, runeIndex, variant) {
  return variant === 0 ? 0 : (7 * wordIndex + 11 * runeIndex) % 28;
}

/** Fully reversible source-length F-as-repeat toy emitter.
 * @param {number[]} plain @param {number} wordIndex @param {number} variant
 * @returns {number[]}
 */
function encode(plain, wordIndex, variant = 1) {
  if (!plain.length) return [];
  const c = [plain[0]];
  for (let i = 1; i < plain.length; i++) {
    const prev = c[i - 1];
    if (plain[i] === 0) c.push(prev);
    else {
      const rank = (plain[i] - 1 + keyAt(wordIndex, i, variant)) % 28;
      c.push(rank + Number(rank >= prev));
    }
  }
  return c;
}

/** Invert the complete toy emitter.
 * @param {number[]} cipher @param {number} wordIndex @param {number} variant
 * @returns {number[]}
 */
function decode(cipher, wordIndex, variant = 1) {
  if (!cipher.length) return [];
  const p = [cipher[0]];
  for (let i = 1; i < cipher.length; i++) {
    const prev = cipher[i - 1];
    if (cipher[i] === prev) p.push(0);
    else {
      const rank = cipher[i] - Number(cipher[i] > prev);
      p.push(1 + (rank - keyAt(wordIndex, i, variant) + 28) % 28);
    }
  }
  return p;
}

/** @param {number[][]} words
 * @returns {{insideF:number,twoWords:number,twoEndingF:number}}
 */
function forcedStats(words) {
  let insideF = 0, twoWords = 0, twoEndingF = 0;
  for (const word of words) {
    for (let i = 1; i < word.length; i++)
      insideF += Number(word[i] === word[i - 1]);
    if (word.length === 2) {
      twoWords++;
      twoEndingF += Number(word[1] === word[0]);
    }
  }
  return {insideF, twoWords, twoEndingF};
}

/** @param {number[]} flags @param {number} length
 * @returns {{windows:number,min:number,max:number}}
 */
function contiguousWindowRange(flags, length) {
  assert(flags.length >= length);
  let sum = 0, min = Number.POSITIVE_INFINITY, max = 0;
  for (let i = 0; i < flags.length; i++) {
    sum += flags[i];
    if (i >= length) sum -= flags[i - length];
    if (i >= length - 1) {
      min = Math.min(min, sum);
      max = Math.max(max, sum);
    }
  }
  return {windows:flags.length - length + 1, min, max};
}

const unknown = sourceWords(parts.slice(0, 55).join("%"));
assert.equal(unknown.length, 2896);
assert.equal(unknown.flat().length, 12956);
const original = forcedStats(unknown);
assert.deepEqual(original, {insideF:63, twoWords:448, twoEndingF:1});

// The forced-F mask is independent of *every* secret rank28 key value.
for (let i = 0; i < unknown.length; i++) {
  const word = unknown[i];
  const zero = decode(word, i, 0), keyed = decode(word, i, 1);
  assert.deepEqual(encode(zero, i, 0), word);
  assert.deepEqual(encode(keyed, i, 1), word);
  for (let j = 1; j < word.length; j++) {
    assert.equal(zero[j] === 0, word[j] === word[j - 1]);
    assert.equal(keyed[j] === 0, word[j] === word[j - 1]);
  }
}

// First-party source-native controls, including a held-out LP2 clear page.
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const start = lp1.indexOf("ᚦᛖ-ᛚᚩᛋᛋ");
const end = lp1.indexOf("\n$\n%\n", start);
assert(start >= 0 && end > start);
const clearText = lp1.slice(start, end).replace(/\/\n%\n/g, "")
  .replace(/\/\n/g, "").replace(/\n/g, "");
const pattern = new RegExp("[" + gp.runes.join("") + "]+", "gu");
const clearLP1 = (clearText.match(pattern) || [])
  .map(word => [...word].map(ch => alphabet.get(ch)));
assert.equal(clearLP1.length, 181);
const lp1Two = clearLP1.filter(word => word.length === 2);
assert.equal(lp1Two.length, 53);
assert.equal(lp1Two.filter(word => word[1] === 0).length, 4);
const clearP57 = sourceWords(parts[56]);
assert.equal(clearP57.length, 20);
assert.deepEqual(clearP57.flat(), gp.pages[57].indices);
for (const control of [clearLP1, clearP57]) {
  control.forEach((word, index) => {
    const cipher = encode(word, index);
    assert.deepEqual(decode(cipher, index), word);
    assert.deepEqual(encode(decode(cipher, index), index), cipher);
  });
}

const corpora = [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
const nativeWindows = corpora.map(source => {
  const words = (read(source).match(/[a-z]+/gi) || []).map(spellGP);
  const twoRune = words.filter(w => w.length === 2);
  const flags = twoRune.map(w => Number(w[1] === 0));
  const range = contiguousWindowRange(flags, original.twoWords);
  assert(range.min > original.twoEndingF);
  return {
    source,
    twoRuneWordCount:twoRune.length,
    totalEndingF: flags.reduce((n, k) => n + k, 0),
    ...range
  };
});
assert.equal(nativeWindows.reduce((n, x) => n + x.windows, 0), 35156);
assert.deepEqual(nativeWindows.map(x => x.min), [50, 30, 51]);

if (require.main === module) console.log(JSON.stringify({
  status: "original GP29 all-key conditional exclusion; no plaintext/key recovered",
  model: "word-length-preserving GP28 with plaintext F => repeated ciphertext rune",
  originalRunes:12956,
  originalWords:unknown.length,
  original,
  firstPartyLP1:{
    words:clearLP1.length, twoRuneWords:lp1Two.length,
    twoRuneEndingF:lp1Two.filter(w => w[1] === 0).length
  },
  firstPartyP57: {words:clearP57.length, runes:clearP57.flat().length},
  nativeWindows,
  sourceNativePositiveAndAllOriginalRoundtrips:true
}, null, 2));
