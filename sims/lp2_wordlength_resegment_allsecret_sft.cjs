"use strict";

/**
 * Original GP29 LP2 word-space resegmentation and all-hidden-key capacity.
 * Read-only single-file test, Node.js 22 / Windows 11.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const letters = new Map(corpus.runes.map((glyph, index) => [glyph, index]));
const sourcePages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const source = sourcePages.flatMap(p => p.indices);
assert.equal(sourcePages.length, 55);
assert.equal(source.length, 12956);

const parsed = parseLP2Words(read("resources/lp2-transcription.txt"), 55);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.equal(parsed.runeCount, 12956);
const words = parsed.words.map(w => [...w.runes].map(glyph => {
  const index = letters.get(glyph);
  assert.notEqual(index, undefined, "unknown source rune");
  return index;
}));
assert.deepEqual(words.flat(), source, "printed words reproduce the original rune order");

const chapterRuneEnds = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const chapterWordLengths = [];
let cursor = 0;
let previousEnd = 0;
for (const end of chapterRuneEnds) {
  const lengths = [];
  let total = 0;
  while (total < end - previousEnd) {
    assert.ok(cursor < words.length);
    const length = words[cursor++].length;
    lengths.push(length);
    total += length;
  }
  assert.equal(total, end - previousEnd, "chapter ends at a real printed word break");
  chapterWordLengths.push(lengths);
  previousEnd = end;
}
assert.equal(cursor, words.length);
assert.deepEqual(chapterWordLengths.map(w => w.length),
  [158, 255, 383, 437, 224, 326, 378, 669, 66]);

const orientations = {
  literal: lengths => lengths,
  nextLength: lengths => [...lengths.slice(1), lengths[0]],
  previousLength: lengths => [lengths[lengths.length - 1], ...lengths.slice(0, -1)],
  reverseLengths: lengths => [...lengths].reverse()
};
/**
 * Build a lossless resegmentation whose word-length sidecar remains exactly
 * the original printed word-length vector. Original chapter rune totals stay
 * fixed, and all 32 real physical-page word carries remain in the rune stream.
 * @param {keyof typeof orientations} orientation
 * @returns {Array<{L:number,j:number,chapter:number}>}
 */
function frames(orientation) {
  const info = [];
  chapterWordLengths.forEach((lengths, chapter) => {
    for (const L of orientations[orientation](lengths)) {
      for (let j = 0; j < L; j++) info.push({L, j, chapter});
    }
  });
  assert.equal(info.length, source.length);
  return info;
}
/** @param {{L:number,j:number}} frame @returns {string} */
const stateId = frame => frame.L + ":" + frame.j;
/**
 * Sharp upper bounds on the possible k most frequent plaintext rune labels
 * for every arbitrary, independent, bijective 29-symbol state alphabet.
 * @param {number[]} ciphertext
 * @param {Array<{L:number,j:number,chapter:number}>} info
 * @param {number | null} chapterFilter
 * @returns {{total:number,states:number,bounds:number[]}}
 */
function capacity(ciphertext, info, chapterFilter = null) {
  const strata = new Map();
  let total = 0;
  for (let i = 0; i < ciphertext.length; i++) {
    if (chapterFilter !== null && info[i].chapter !== chapterFilter) continue;
    const key = stateId(info[i]);
    let count = strata.get(key);
    if (!count) {
      count = new Uint16Array(29);
      strata.set(key, count);
    }
    count[ciphertext[i]]++;
    total++;
  }
  const sorted = [...strata.values()].map(row => [...row].sort((a, b) => b - a));
  return {total, states: strata.size, bounds: [1, 2, 3, 4].map(k =>
    sorted.reduce((n, row) => n + row.slice(0, k).reduce((a, b) => a + b, 0), 0))};
}
/** @param {number[]} values @param {number} k */
function topK(values, k) {
  const f = new Uint16Array(29);
  for (const value of values) f[value]++;
  return [...f].sort((a, b) => b - a).slice(0, k).reduce((a, b) => a + b, 0);
}
/** @param {number[]} values */
function ioc(values) {
  const f = new Uint16Array(29);
  for (const v of values) f[v]++;
  return [...f].reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}
/** @param {number} x */
const mod29 = x => (x % 29 + 29) % 29;
/**
 * One completely specified example inverse in the much larger all-secret
 * family, keyed only by the printed word length and within-word index.
 * @param {number[]} cipher
 * @param {Array<{L:number,j:number}>} info
 */
function inverseLengthClock(cipher, info) {
  return cipher.map((value, i) => mod29(value - info[i].L - info[i].j));
}
/** @param {number[]} plain @param {Array<{L:number,j:number}>} info */
function forwardLengthClock(plain, info) {
  return plain.map((value, i) => mod29(value + info[i].L + info[i].j));
}

const tokenizer = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/**
 * Source-attested GP29 transliteration: ᛝ=NG/ING, ᛡ=IO,
 * QU->CW, V->U, K/Q->C, Z->S.
 * @param {string} original
 * @returns {number[]}
 */
function nativeGP(original) {
  const clean = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {out.push(21); i += 3;}
      else if (word.startsWith("IO", i)) {out.push(27); i += 2;}
      else {
        const entry = tokenizer.find(x => word.startsWith(x.token, i));
        assert.ok(entry, "source cannot encode word " + word);
        out.push(entry.index);
        i += entry.token.length;
      }
    }
  }
  return out;
}
const gibran = nativeGP(read("resources/control/gibran_prophet_58585.txt"));
const shakespeare = nativeGP(read("resources/control/shakespeare_first300k.txt"));
assert.equal(gibran.length, 62492);
assert.equal(shakespeare.length, 217106);
/** @param {number[]} array @param {number} windowLength @param {number} stride */
function nativeWindows(array, windowLength, stride = 503) {
  let minimumTop4 = Infinity;
  let count = 0;
  for (let start = 0; start + windowLength <= array.length; start += stride) {
    minimumTop4 = Math.min(minimumTop4, topK(array.slice(start, start + windowLength), 4));
    count++;
  }
  return {count, minimumTop4};
}
const originalReference = [gibran, shakespeare].map(a => nativeWindows(a, 12956));
const singleChapterReference = [gibran, shakespeare].map(a => nativeWindows(a, 3008));
assert.deepEqual(singleChapterReference,
  [{count: 119, minimumTop4: 1015}, {count: 426, minimumTop4: 968}]);

/** Fixed actual printed physical-page rune offsets within the source book. */
const region = (a, b) => {
  const begin = sourcePages.filter(p => p.page < a).reduce((n, p) => n + p.indices.length, 0);
  const length = sourcePages.filter(p => p.page >= a && p.page <= b)
    .reduce((n, p) => n + p.indices.length, 0);
  return {begin, length};
};
assert.equal(region(16, 21).length, 1613);
assert.equal(region(40, 53).length, 3008);

/** @param {number} seed */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
/**
 * Full positive decryption under arbitrary secret 29-symbol bijections.
 * This is the claimed cipher family, with the actual original word/frame
 * layout, independent of any unknown-page fitted key.
 * @param {number[]} plain
 * @param {Array<{L:number,j:number,chapter:number}>} info
 * @param {number} seed
 */
function secretPermutationRoundtrip(plain, info, seed) {
  const random = prng(seed);
  const alphabet = new Map();
  const inverse = new Map();
  const encrypted = plain.map((rune, i) => {
    const state = stateId(info[i]);
    if (!alphabet.has(state)) {
      const permutation = Array.from({length: 29}, (_, j) => j);
      for (let j = 28; j > 0; j--) {
        const k = random() % (j + 1);
        [permutation[j], permutation[k]] = [permutation[k], permutation[j]];
      }
      const inv = new Array(29);
      permutation.forEach((c, p) => {inv[c] = p;});
      alphabet.set(state, permutation);
      inverse.set(state, inv);
    }
    return alphabet.get(state)[rune];
  });
  const decrypted = encrypted.map((rune, i) =>
    inverse.get(stateId(info[i]))[rune]);
  assert.deepEqual(decrypted, plain);
  assert.ok(capacity(encrypted, info).bounds[3] >= topK(plain, 4));
}

const expected = {
  literal: [828, 1569, 2265, 2912],
  nextLength: [849, 1582, 2275, 2910],
  previousLength: [843, 1596, 2290, 2920],
  reverseLengths: [854, 1598, 2298, 2954]
};
const records = [];
for (const name of Object.keys(orientations)) {
  const info = frames(name);
  const book = capacity(source, info);
  assert.deepEqual(book.bounds, expected[name], name + ": exact original all-secret bounds");
  assert.ok(originalReference.every(ref => book.bounds[3] < ref.minimumTop4));
  const eighth = capacity(source, info, 7);
  assert.equal(eighth.total, 3008);
  const native = gibran.slice(0, source.length);
  assert.deepEqual(native, inverseLengthClock(forwardLengthClock(native, info), info));
  secretPermutationRoundtrip(native, info, 0x33011777);
  const decoded = inverseLengthClock(source, info);
  const regions = {};
  for (const [label, [startPage, endPage]] of Object.entries({
    p16to21: [16, 21], p40to53: [40, 53]
  })) {
    const {begin, length} = region(startPage, endPage);
    const window = decoded.slice(begin, begin + length);
    regions[label] = {runes: window.length, ioc: ioc(window),
      initialGP: window.slice(0, 48).map(x => corpus.translit[x]).join(" ")};
  }
  records.push({name, book, eighthChapter: eighth, regions});
}
assert.equal(records[0].eighthChapter.bounds[3], 957);
assert.ok(records[0].eighthChapter.bounds[3] <
  singleChapterReference[0].minimumTop4);
assert.ok(records[0].eighthChapter.bounds[3] <
  singleChapterReference[1].minimumTop4);
console.log("PASS original LP2 all-secret word-length/position resegmentation gate");
console.log(JSON.stringify({runeCount: source.length, wordCount: words.length,
  nativeAllBook: originalReference, nativeChapter: singleChapterReference,
  records}, null, 2));
