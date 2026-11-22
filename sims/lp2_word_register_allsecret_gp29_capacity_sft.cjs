"use strict";

/**
 * All-secret single-rune-per-printed-word capacity bound for original LP2.
 * A fixed source-visible word summary produces one GP29 value, then each
 * *printed word length* may have an independent arbitrary 29! secret
 * substitution map. The sorted-frequency majorization bound is independent
 * of every such secret key. No stdout artifacts beyond one JSON summary.
 *
 * Node 22, CommonJS; built-ins only; does not write files.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const historical = JSON.parse(load(
  "resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = load("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const original = corpus.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
assert.equal(original.length, 12956);

/**
 * Source words may span a printed line or physical page.
 * Stops at the exact authentic LP2 unknown-rune count so the source's solved
 * p56–p57 material is not accidentally included.
 * @returns {number[][]}
 */
function originalWords() {
  const output = [];
  let word = [], count = 0;
  for (const glyph of transcription) {
    const index = runeIndex.get(glyph);
    if (index !== undefined) {
      word.push(index);
      count++;
      if (count === original.length) {
        output.push(word);
        break;
      }
    } else if ("-.$&§".includes(glyph) && word.length) {
      output.push(word);
      word = [];
    }
  }
  assert.equal(count, original.length);
  assert.deepEqual(output.flat(), original);
  assert.equal(output.length, 2896);
  return output;
}
const words = originalWords();
const byLength = Array.from({length: 15}, () => []);
words.forEach((word, position) => byLength[word.length].push(position));
assert.deepEqual(byLength.map(a => a.length).slice(1),
  [83,448,720,513,317,256,216,156,78,52,32,18,4,3]);

/**
 * @param {number[]} list - one 0..28 symbol for each original printed word
 * @param {number} k - number of most common plaintext rune types
 */
function maximumTopK(list, k) {
  let capacity = 0;
  for (const positions of byLength) {
    const counts = Array(29).fill(0);
    for (const position of positions) counts[list[position]]++;
    counts.sort((a, b) => b - a);
    capacity += counts.slice(0, k).reduce((a, b) => a + b, 0);
  }
  return capacity;
}

/**
 * @param {number[]} a
 */
function countsOf(a) {
  const counts = Array(29).fill(0);
  for (const digit of a) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    counts[digit]++;
  }
  return counts.sort((x, y) => y - x);
}

const selectors = {
  first: word => word[0],
  last: word => word[word.length - 1],
  ordinalSum: word => word.reduce((a, x) => a + x, 0) % 29,
  primeSum: word => word.reduce((a, x) => a + corpus.prime[x], 0) % 29,
  primeProduct: word => word.reduce(
    (a, x) => (a * corpus.prime[x]) % 29, 1),
  ordinalProduct: word => word.reduce((a, x) => (a * (x + 1)) % 29, 1),
  ordinalXor: word => word.reduce((a, x) => a ^ x, 0) % 29,
  alternatingSum: word => (word.reduce(
    (a, x, i) => a + (i % 2 ? -x : x), 0) % 29 + 29) % 29
};

const expected = {
  first: [161, 1536], last: [170, 1546],
  ordinalSum: [170, 1556], primeSum: [176, 1554],
  primeProduct: [424, 1715], ordinalProduct: [435, 1704],
  ordinalXor: [224, 1630], alternatingSum: [173, 1566]
};
const originals = [];
for (const [label, transform] of Object.entries(selectors)) {
  const symbols = words.map(transform);
  const first = maximumTopK(symbols, 1);
  const dozen = maximumTopK(symbols, 12);
  assert.deepEqual([first, dozen], expected[label]);
  originals.push({
    selector: label, allSecretTop1Capacity: first,
    allSecretTop12Capacity: dozen
  });
}

// Every window is genuine published solved LP1 GP29 text, unmodified.
// No target word-length labels or unknown book content enters this control.
const sourceGP = historical.sections.flatMap(section =>
  [...section.source_text].map(rune => runeIndex.get(rune))
    .filter(value => value !== undefined));
assert.equal(sourceGP.length, 2979);
const solvedWindows = [];
for (let start = 0; start + words.length <= sourceGP.length; start++) {
  const nativeCounts = countsOf(sourceGP.slice(start, start + words.length));
  solvedWindows.push({
    top1: nativeCounts[0],
    top12: nativeCounts.slice(0, 12).reduce((a, b) => a + b, 0)
  });
}
assert.equal(solvedWindows.length, 84);
const top1Range = [
  Math.min(...solvedWindows.map(x => x.top1)),
  Math.max(...solvedWindows.map(x => x.top1))
];
const top12Range = [
  Math.min(...solvedWindows.map(x => x.top12)),
  Math.max(...solvedWindows.map(x => x.top12))
];
assert.deepEqual(top1Range, [366, 369]);
assert.deepEqual(top12Range, [2233, 2241]);
for (const {selector, allSecretTop12Capacity} of originals) {
  assert.ok(allSecretTop12Capacity < top12Range[0],
    "all-secret one-rune-per-word family excluded for " + selector);
}

/**
 * Genuine encryption/inversion control:
 * Independently permute 29 GP29 source symbols in every length class;
 * encrypt a native-source 2896-rune passage into words with the *original*
 * printed lengths, filling unused word positions without affecting its
 * first-rune register. Recover all 2896 native runes through inverse maps.
 */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
const random = rng(0x33012016);
const keys = byLength.map(() => {
  const p = Array.from({length: 29}, (_, i) => i);
  for (let j = 28; j > 0; j--) {
    const k = random() % (j + 1);
    [p[j], p[k]] = [p[k], p[j]];
  }
  return p;
});
const native = sourceGP.slice(0, words.length);
const planted = native.map((plain, position) => {
  const len = words[position].length;
  return [
    keys[len][plain],
    ...Array.from({length: len - 1}, () => random() % 29)
  ];
});
assert.deepEqual(planted.map(word => word.length),
  words.map(word => word.length));
const inverse = keys.map(key => {
  const p = Array(29);
  key.forEach((value, originalIndex) => p[value] = originalIndex);
  return p;
});
const recovered = planted.map((word, position) =>
  inverse[word.length][word[0]]);
assert.deepEqual(recovered, native);
assert.ok(maximumTopK(planted.map(w => w[0]), 12) >=
  countsOf(native).slice(0, 12).reduce((a, b) => a + b, 0));

console.log(JSON.stringify({
  status: "PASS",
  originalRupees: original.length,
  originalWords: words.length,
  independentSecretMapsByWordLength: 14,
  selectors: originals,
  nativeSolvedReference: {
    genuineGP29Runes: sourceGP.length,
    fullLengthWindows: solvedWindows.length,
    top1Range,
    top12Range
  },
  originalGate: "ALL 8 candidate word registers have B12 < 2233",
  genuinePlant: {
    lengthPreserved: planted.every((word, i) => word.length === words[i].length),
    sourceRunesRecovered: recovered.length,
    inverseExact: true
  }
}, null, 2));