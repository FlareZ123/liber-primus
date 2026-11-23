"use strict";
/**
 * Director #2329: one predeclared rank-level p50 integer-addition inverse.
 *
 * Hypothesis only. Original red ⁜ endings (29 distinct) define exactly 29
 * mixed-radix word-class ranks. Each source rank is shifted modulo its exact
 * class cardinality by big-endian p50 bytes repeated in printed row-major order.
 * The key cursor is continuous across the 29 groups and consumes precisely
 * ceil(bit_length(M)/8) bytes for each. No phase/key/schedule/language fitting.
 *
 * Direct source: lp2-corpus.json, lp2-transcription.txt,
 * lp2-punctuation-identity.json, lp2-grid-256.json, 2013 Book of the Law.
 * Node.js 22, read-only SFT: node sims/lp2_rubric_p50_integer_rank_add_original_sft.cjs
 * A keyed rank inverse is an executable hypothesis, not an authenticated Cicada key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const marks = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const table = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const gpMap = new Map(book.runes.map((r, i) => [r, i]));
const original = book.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const words = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\n\r%&$\s]/g, "").split(/[-.]/)
  .filter(w => /[\u16A0-\u16FF]/u.test(w)).slice(0, 2896)
  .map(w => Array.from(w, rune => {
    const n = gpMap.get(rune);
    assert.notEqual(n, undefined);
    return n;
  }));
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
assert.equal(table.bytes.length, 256);
assert.ok(table.bytes.every(b => Number.isInteger(b) && b >= 0 && b < 256));
assert.deepEqual(table.pages.flatMap(p => p.bytes), table.bytes);

/** @param {number} n @param {number} k */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= k; i++) value = value * BigInt(n - i + 1) / BigInt(i);
  return value;
}
/** @param {number} n @param {number} e */
function continuation(n, e) {
  if (e < 0 || e > n) return 0n;
  return choose(n, e) * 28n ** BigInt(n - e);
}
/** @param {number[]} w */
function repetitions(w) {
  let repeats = 0;
  for (let i = 1; i < w.length; i++) repeats += Number(w[i] === w[i - 1]);
  return repeats;
}
/** @param {number[]} w */
function rankWord(w) {
  const n = w.length, e = repetitions(w);
  let remaining = e;
  let rank = BigInt(w[0]) * continuation(n - 1, e);
  for (let i = 1; i < n; i++) {
    for (let c = 0; c < w[i]; c++) {
      rank += continuation(n - i - 1, remaining - Number(c === w[i - 1]));
    }
    remaining -= Number(w[i] === w[i - 1]);
  }
  assert.equal(remaining, 0);
  const radix = 29n * continuation(n - 1, e);
  assert.ok(rank >= 0n && rank < radix);
  return { n, e, rank, radix };
}
/** @param {number} n @param {number} e @param {bigint} rank */
function unrankWord(n, e, rank) {
  const choices = continuation(n - 1, e);
  assert.ok(rank >= 0n && rank < 29n * choices);
  const out = [Number(rank / choices)];
  rank %= choices;
  let remaining = e;
  for (let i = 1; i < n; i++) {
    let found = false;
    for (let c = 0; c < 29; c++) {
      const isRepeat = Number(c === out[i - 1]);
      const count = continuation(n - i - 1, remaining - isRepeat);
      if (rank >= count) rank -= count;
      else {
        out.push(c);
        remaining -= isRepeat;
        found = true;
        break;
      }
    }
    assert.ok(found);
  }
  assert.equal(rank, 0n);
  assert.equal(remaining, 0);
  return out;
}
const specs = words.map(rankWord);
assert.equal(specs.reduce((s, v) => s + v.e, 0), 63);
for (let i = 0; i < words.length; i++) {
  assert.deepEqual(unrankWord(specs[i].n, specs[i].e, specs[i].rank), words[i]);
}
const ends = [];
let count = 0;
for (const w of words) {
  count += w.length;
  ends.push(count);
}
const endToWord = new Map(ends.map((n, i) => [n, i]));
const physical = marks.events.filter(e => e.original_ink_event !== false && e.index !== 125);
assert.equal(physical.length, 175);
const redEnds = [...new Set(physical.filter(e => e.symbol === "⁜")
  .map(e => e.rune_offset))].sort((a, b) => a - b);
assert.equal(redEnds.length, 29);
assert.equal(redEnds[28], original.length);
const groups = [];
let begin = 0;
for (const end of redEnds) {
  const stop = endToWord.get(end) + 1;
  assert.ok(stop > begin);
  let R = 0n, M = 1n, n = 0;
  for (let i = begin; i < stop; i++) {
    R = R * specs[i].radix + specs[i].rank;
    M *= specs[i].radix;
    n += specs[i].n;
  }
  assert.ok(M >= 26n ** BigInt(n));
  groups.push({ startWord: begin, endWord: stop, n, R, M });
  begin = stop;
}
assert.equal(begin, words.length);
assert.deepEqual(groups.map(g => g.n), [
  13, 716, 16, 103, 3, 690, 11, 308, 14, 1729, 9, 11,
  1883, 16, 1005, 19, 1414, 10, 81, 8, 746, 553, 161,
  3, 118, 2474, 534, 9, 299
]);

/** @param {bigint} x @param {bigint} y */
const ceilDiv = (x, y) => (x + y - 1n) / y;
/** @param {number[]} a */
function pack26(a) {
  let x = 0n;
  for (const value of a) {
    assert.ok(Number.isInteger(value) && value >= 0 && value < 26);
    x = 26n * x + BigInt(value);
  }
  return x;
}
/** @param {bigint} x @param {number} n */
function unpack26(x, n) {
  const out = Array(n);
  for (let i = n - 1; i >= 0; i--) {
    out[i] = Number(x % 26n);
    x /= 26n;
  }
  assert.equal(x, 0n);
  return out;
}
/** @param {{M:bigint; n:number}} g @param {bigint} R */
function decodeRank(g, R) {
  const Q = 26n ** BigInt(g.n);
  const P = R * Q / g.M;
  const left = ceilDiv(P * g.M, Q);
  const right = ceilDiv((P + 1n) * g.M, Q);
  const residual = R - left;
  assert.ok(residual >= 0n && residual < right - left);
  return { digits: unpack26(P, g.n), residual };
}
/** @param {{M:bigint;n:number}} g @param {number[]} digits @param {bigint} residual */
function encodeRank(g, digits, residual = 0n) {
  assert.equal(digits.length, g.n);
  const P = pack26(digits), Q = 26n ** BigInt(g.n);
  const left = ceilDiv(P * g.M, Q);
  const right = ceilDiv((P + 1n) * g.M, Q);
  assert.ok(residual >= 0n && residual < right - left);
  return left + residual;
}
/** @param {{startWord:number;endWord:number;M:bigint}} g @param {bigint} R */
function rankToWords(g, R) {
  const result = Array(g.endWord - g.startWord);
  for (let i = g.endWord - 1; i >= g.startWord; i--) {
    const s = specs[i];
    const wordRank = R % s.radix;
    R /= s.radix;
    result[i - g.startWord] = unrankWord(s.n, s.e, wordRank);
  }
  assert.equal(R, 0n);
  return result;
}
/**
 * Each group consumes a whole number of printed bytes from one global
 * cyclic byte stream, with enough bytes to cover M in big-endian notation.
 * @param {number[]} stream
 */
function groupKeys(stream) {
  assert.equal(stream.length, 256);
  let cursor = 0;
  const keys = groups.map(g => {
    const width = Math.ceil(g.M.toString(2).length / 8);
    let key = 0n;
    for (let i = 0; i < width; i++) {
      key = 256n * key + BigInt(stream[(cursor + i) % 256]);
    }
    cursor += width;
    return key % g.M;
  });
  return { keys, consumed: cursor };
}
/** @param {number[]} a */
function ioc(a) {
  const counts = Array(26).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}
/** @param {number[]} a @param {number} n */
function txt(a, n) {
  return a.slice(0, n).map(x => String.fromCharCode(x + 65)).join("");
}
/** @param {number[]} stream */
function originalInverse(stream) {
  const keyData = groupKeys(stream);
  const plaintext = [], replay = [];
  let canonical = 0;
  groups.forEach((g, i) => {
    const key = keyData.keys[i];
    const Rplain = (g.R - key + g.M) % g.M;
    const decoded = decodeRank(g, Rplain);
    plaintext.push(...decoded.digits);
    canonical += Number(decoded.residual === 0n);
    assert.equal(encodeRank(g, decoded.digits, decoded.residual), Rplain);
    const restoredCipherRank = (encodeRank(g, decoded.digits, decoded.residual) + key) % g.M;
    assert.equal(restoredCipherRank, g.R);
    replay.push(...rankToWords(g, restoredCipherRank).flat());
  });
  assert.deepEqual(replay, original);
  assert.equal(plaintext.length, original.length);
  return { plaintext, canonical, consumed: keyData.consumed };
}
const bytes = table.bytes;
const primary = originalInverse(bytes);
const reversed = originalInverse([...bytes].reverse());
const rotated = originalInverse(bytes.slice(1).concat(bytes[0]));
assert.equal(primary.consumed, reversed.consumed);
assert.equal(primary.consumed, rotated.consumed);
assert.equal(groups.length, 29);

const known = read("resources/external/2013-book-of-law-I.txt")
  .toUpperCase().replace(/[^A-Z]/g, "")
  .split("").map(c => c.charCodeAt(0) - 65);
assert.ok(known.length >= 7000);
const source = Array.from({length: original.length}, (_, i) => known[i % known.length]);
const keys = groupKeys(bytes).keys;
const planted = [], wrongKey = [], plantedCipher = [];
let offset = 0;
groups.forEach((g, i) => {
  const sample = source.slice(offset, offset + g.n);
  const rawRank = encodeRank(g, sample);
  const CipherR = (rawRank + keys[i]) % g.M;
  plantedCipher.push(...rankToWords(g, CipherR).flat());
  const decoded = decodeRank(g, (CipherR - keys[i] + g.M) % g.M);
  planted.push(...decoded.digits);
  assert.equal(decoded.residual, 0n);
  wrongKey.push(...decodeRank(g, (CipherR - groupKeys([...bytes].reverse()).keys[i] + g.M) % g.M).digits);
  offset += g.n;
});
assert.deepEqual(planted, source);
assert.equal(plantedCipher.length, original.length);
let at = 0;
for (const s of specs) {
  const sub = plantedCipher.slice(at, at + s.n);
  assert.equal(repetitions(sub), s.e);
  at += s.n;
}
assert.equal(at, original.length);
const pageRanges = new Map();
let runeOffset = 0;
for (const page of book.pages.filter(p => p.page <= 55)) {
  pageRanges.set(page.page, { start: runeOffset, end: runeOffset + page.indices.length });
  runeOffset += page.indices.length;
}
assert.equal(runeOffset, original.length);
/** @param {number} first @param {number} last */
function pageSlice(first, last) {
  return [pageRanges.get(first).start, pageRanges.get(last).end];
}
const cases = [
  { label: "p16-p21", range: pageSlice(16, 21) },
  { label: "p40-p53", range: pageSlice(40, 53) }
];
for (const scope of cases) {
  const [start, end] = scope.range;
  const actual = primary.plaintext.slice(start, end);
  const wrong1 = reversed.plaintext.slice(start, end);
  const wrong2 = rotated.plaintext.slice(start, end);
  const control = planted.slice(start, end);
  const wrongPlant = wrongKey.slice(start, end);
  assert.ok(actual.length >= 200);
  console.log("HOLDOUT", scope.label, "start", start, "runes", actual.length,
    "original_ioc", ioc(actual).toFixed(9),
    "reverse_table_ioc", ioc(wrong1).toFixed(9),
    "rotate_table_ioc", ioc(wrong2).toFixed(9),
    "native_2013_positive_ioc", ioc(control).toFixed(9),
    "wrong_key_plant_ioc", ioc(wrongPlant).toFixed(9));
  console.log("HOLDOUT_TEXT", scope.label, txt(actual, 240));
}
console.log("WHOLE_BOOK 12956 exact original glyphs reproduced; 29 source ⁜ groups",
  "key_stream_bytes_consumed", primary.consumed,
  "original_ioc", ioc(primary.plaintext).toFixed(9),
  "wrong_reverse_ioc", ioc(reversed.plaintext).toFixed(9),
  "wrong_rotate_ioc", ioc(rotated.plaintext).toFixed(9),
  "positive_ioc", ioc(planted).toFixed(9),
  "original_zero_residual_groups", primary.canonical,
  "positive_12956_recovered", planted.length);
console.log("FIRST_240", txt(primary.plaintext, 240));
console.log("PASS: predeclared p50-rank modular integer shift original-cipher inverse and native positive");
