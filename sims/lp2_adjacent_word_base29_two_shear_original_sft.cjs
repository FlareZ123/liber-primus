"use strict";
/**
 * One fixed and fully reversible 2013-BASE29 / 2016-word-number
 * two-printed-word mixed-radix Feistel shear, tested on all untouched LP2.
 *
 * SOURCE selector: first printed original complete word of p0 is followed by
 * a second red-heading complete word, giving a natural first pair; source
 * preserves 2,896 full GP29 printed words and 32 page-carrying words.
 * HYPOTHETICAL opcode: two elementary additions modulo each word's own
 * 29^length. No first-party source authenticates this Feistel operation.
 *
 * Node.js 22 / CommonJS / Windows 11 SFT; writes no files.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const physical = read("resources/liber-primus/lp2-transcription.txt").split("%");
const known = new Set(source.runes);
const runeID = new Map(source.runes.map((r, i) => [r, i]));
/** @param {string} input @returns {{start:number,codes:number[]}[]} */
function readWords(input) {
  const plain = input.replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
  const words = [];
  let word = [];
  let offset = 0;
  for (const ch of plain) {
    if (known.has(ch)) {
      word.push(runeID.get(ch));
    } else if (word.length) {
      words.push({start: offset, codes: word});
      offset += word.length;
      word = [];
    }
  }
  if (word.length) words.push({start: offset, codes: word});
  return words;
}
const original = readWords(physical.slice(0, 55).join(""));
const tape = source.pages.slice(0, 56).flatMap(page => page.indices);
assert.equal(original.length, 2896);
assert.equal(tape.length, 12956);
assert.deepEqual(original.flatMap(w => w.codes), tape);
const num = Array.from({length:16}, (_, i) => 29n ** BigInt(i));
/** @param {number[]} runes @returns {bigint} */
function integer(runes) {
  return runes.reduce((v, d) => v * 29n + BigInt(d), 0n);
}
/** @param {bigint} value @param {number} width @returns {number[]} */
function word(value, width) {
  const result = Array(width);
  for (let i = width - 1; i >= 0; i--) {
    result[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return result;
}
/** @param {bigint} n @param {bigint} m @returns {bigint} */
function modulo(n, m) {
  return (n % m + m) % m;
}
/**
 * Both inverse directions are exact, even when n1 != n2.
 * Forward: c1 = a+b (mod 29^n1); c2 = b+c1 (mod 29^n2).
 * Reverse: b = c2-c1 (mod 29^n2); a = c1-b (mod 29^n1).
 * @param {number[][]} words
 * @param {boolean} encode
 * @returns {number[][]}
 */
function transform(words, encode) {
  const out = [];
  for (let i = 0; i < words.length; i += 2) {
    const left = words[i];
    const right = words[i + 1];
    if (!right) {
      out.push([...left]); // explicit natural odd final printed word
      break;
    }
    const m1 = num[left.length], m2 = num[right.length];
    assert(m1 && m2);
    const x = integer(left), y = integer(right);
    if (encode) {
      const c1 = modulo(x + y, m1);
      const c2 = modulo(y + c1, m2);
      out.push(word(c1, left.length), word(c2, right.length));
    } else {
      const b = modulo(y - x, m2);
      const a = modulo(x - b, m1);
      out.push(word(a, left.length), word(b, right.length));
    }
  }
  return out;
}
/** @param {number[]} a */
function ioc(a) {
  const bins = Array(29).fill(0);
  for (const v of a) bins[v]++;
  return bins.reduce((acc, n) => acc + n * (n - 1), 0) / (a.length * (a.length - 1));
}
const ciphertextWords = original.map(w => w.codes);
const candidateWords = transform(ciphertextWords, false);
assert.deepEqual(transform(candidateWords, true), ciphertextWords);
const candidate = candidateWords.flat();
assert.equal(candidate.length, tape.length);
const pageStart = [];
let n = 0;
for (const p of source.pages) {
  pageStart.push(n);
  n += p.indices.length;
}
function excerpt(page, width) {
  const offset = pageStart[page];
  const decoded = candidate.slice(offset, offset + width);
  const raw = tape.slice(offset, offset + width);
  assert.equal(decoded.length, width);
  return {
    page, width,
    originalIoc: ioc(raw),
    decodedIoc: ioc(decoded),
    decodedPrefix: decoded.slice(0, 75).map(v => source.translit[v]).join(".")
  };
}
const originalOutputs = [excerpt(16, 300), excerpt(40, 200), excerpt(0, 300)];
/* Genuine Cicada LP2 p57 authentic solved GP native positive. */
const parable = readWords(physical[56]).map(w => w.codes);
assert.equal(parable.length, 20);
assert.deepEqual(parable.flat(), source.pages[57].indices);
assert.deepEqual(transform(transform(parable, true), false), parable);
assert.deepEqual(transform(transform(parable.slice(0, 19), true), false), parable.slice(0, 19));
/* Independently source-authored literature, GP native exact length-matched
   for every original complete printed word, using frozen published spelling. */
const token = source.translit.map((str, value) => ({str, value}))
  .sort((a, b) => b.str.length - a.str.length);
/** @param {string} spelling @returns {number[]} */
function native(spelling) {
  const input = spelling.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < input.length;) {
    if (input.startsWith("ING", i)) {
      result.push(21);
      i += 3;
    } else if (input.startsWith("IO", i)) {
      result.push(27);
      i += 2;
    } else {
      const match = token.find(t => input.startsWith(t.str, i));
      assert(match, "every source letter must have a GP rune");
      result.push(match.value);
      i += match.str.length;
    }
  }
  return result;
}
const pools = new Map();
for (const w of read("resources/control/shakespeare_first300k.txt").match(/[a-z]+/gi) || []) {
  const codes = native(w);
  const p = pools.get(codes.length) || [];
  p.push(codes);
  pools.set(codes.length, p);
}
let seed = 0x33012247;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const plant = ciphertextWords.map(w => {
  const pool = pools.get(w.length);
  assert(pool && pool.length);
  return pool[random() % pool.length];
});
assert.equal(plant.length, 2896);
assert.deepEqual(transform(transform(plant, true), false), plant);
assert.deepEqual(plant.map(w => w.length), ciphertextWords.map(w => w.length));
const p57cipher = transform(parable, true);
console.log(JSON.stringify({
  scope: "Exact 2,896 printed p0-p55 GP29 words, 12,956 original runes including 32 page-carried words",
  premise: "2013 signed BASE29 word integers and 2016 signed word-numbers/direction",
  unselected_operation: "first-two-original-heading words anchor successive full-word pairs; two reversible mixed-modulus integer additions; no secret keys",
  all_original_exact_forward_replay: true,
  original: originalOutputs,
  solved_p57_95_rune_exact_roundtrip: parable.flat().length,
  solved_p57_odd_final_word_exact_roundtrip: true,
  original_word_lengths_native_ShaKespeare_12956_runes_positive: plant.flat().length,
  synthetic_encoded_p57_prefix: p57cipher.flat().slice(0, 20),
  decision: "Only credible if original p16/p40 yields sustained legible GP-native prose; synthetic replay alone is not evidence of intended cipher."
}, null, 2));
