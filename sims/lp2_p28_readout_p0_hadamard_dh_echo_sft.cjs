"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(i));
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} text
 * @returns {{runes:number[],words:Array<{n:number,start:number,end:number,values:number[]}>}}
 */
function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      n: words.length + 1,
      start,
      end: start + current.length - 1,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return { runes, words };
}

/** @param {number} x @param {number} y @returns {[number,number]} */
function H(x, y) {
  return [(x - y + 29) % 29, (x + y) % 29];
}

/** @param {number} d @param {number} s @returns {[number,number]} */
function Hinv(d, s) {
  const inv2 = 15;
  return [((d + s) * inv2) % 29, ((s - d + 29) * inv2) % 29];
}

/** @param {Array<{values:number[]}>} words @returns {number[]} */
function shellOutputs(words) {
  const out = [];
  for (const word of words) {
    for (let k = 0; k < Math.floor(word.values.length / 2); k += 1) {
      out.push(...H(word.values[k], word.values[word.values.length - 1 - k]));
    }
  }
  return out;
}

/** @param {number[]} haystack @param {number[]} needle @returns {boolean} */
function coversAll(haystack, needle) {
  const set = new Set(haystack);
  return needle.every((value) => set.has(value));
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join(" ");
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

for (let x = 0; x < 29; x += 1) {
  for (let y = 0; y < 29; y += 1) {
    assert.deepEqual(Hinv(...H(x, y)), [x, y]);
  }
}

const table = grid.pages.flatMap((page) => page.bytes);
assert.equal(table.length, 256);

const read = gp("READ");
const outWord = gp("OUT");
assert.equal(sum(read), 55);
assert.equal(sum(outWord), 20);
assert.equal(table[55], 80);
assert.equal(table[20], 102);

const p0 = parsePage(physicalPart(0));
const start = table[55];
const end = table[20];
assert.equal(end - start + 1, 23);
assert.equal(p0.runes[start + 11], 0);

const selectedWords = p0.words.filter((word) => word.start >= start && word.end <= end);
assert.deepEqual(selectedWords.map((word) => word.n), [18, 19, 20, 21]);
assert.deepEqual(selectedWords.map((word) => word.values.length), [3, 7, 5, 8]);

// Re-derive the source-selected p28 DH23 state.
const p28Lines = physicalPart(28).trim().split("/").filter((line) => line.trim().length > 0);
const p28Line6 = parsePage(p28Lines[5]);
assert.equal(p28Line6.runes.length, 23);
assert.equal(p28Line6.runes[11], 0);
assert.deepEqual(p28Line6.runes.slice(0, 2), [23, 8]);

const p = p28Line6.runes.length;
const g = p28Line6.words[p28Line6.words.length - 1].values.length;
const a = 6;
const selectedP28Word = p28Line6.words[p28Line6.words.length - 1];
const B = selectedP28Word.start + 1;
const A = modPow(g, a, p);
let b = 1;
while (modPow(g, b, p) !== B) b += 1;
const K = modPow(B, a, p);
assert.deepEqual([p, g, a, b, A, B, K], [23, 5, 6, 15, 8, 19, 2]);

const dhState = [p, g, a, b, A, B, K];
const selectedH = shellOutputs(selectedWords);
assert.equal(selectedH.length, 20);
assert.ok(coversAll(selectedH, dhState));

const firstOccurrenceOrder = [];
const remaining = new Set(dhState);
for (const value of selectedH) {
  if (remaining.has(value)) {
    firstOccurrenceOrder.push(value);
    remaining.delete(value);
  }
}
assert.deepEqual(firstOccurrenceOrder, [19, 23, 6, 15, 8, 5, 2]);

const hits4 = [];
const hitsAny = [];
const centerF23 = [];
let spans4 = 0;
let spans4CenterF = 0;
let spansAny23 = 0;
let spansAny23CenterF = 0;

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));

  for (let i = 0; i + 3 < parsed.words.length; i += 1) {
    const words = parsed.words.slice(i, i + 4);
    const spanStart = words[0].start;
    const spanEnd = words[3].end;
    if (spanEnd - spanStart + 1 !== 23) continue;

    spans4 += 1;
    const centerF = parsed.runes[spanStart + 11] === 0;
    if (centerF) spans4CenterF += 1;
    const h = shellOutputs(words);
    if (coversAll(h, dhState)) {
      hits4.push({
        page,
        words: [words[0].n, words[3].n],
        span: [spanStart, spanEnd],
        centerF,
        h,
      });
    }
  }

  for (let i = 0; i < parsed.words.length; i += 1) {
    for (let j = i; j < parsed.words.length; j += 1) {
      const spanStart = parsed.words[i].start;
      const spanEnd = parsed.words[j].end;
      const length = spanEnd - spanStart + 1;
      if (length > 23) break;
      if (length !== 23) continue;

      spansAny23 += 1;
      const centerF = parsed.runes[spanStart + 11] === 0;
      if (centerF) {
        spansAny23CenterF += 1;
        centerF23.push({
          page,
          words: [parsed.words[i].n, parsed.words[j].n],
          span: [spanStart, spanEnd],
        });
      }

      const words = parsed.words.slice(i, j + 1);
      const h = shellOutputs(words);
      if (coversAll(h, dhState)) {
        hitsAny.push({
          page,
          words: [words[0].n, words[words.length - 1].n],
          wordCount: words.length,
          span: [spanStart, spanEnd],
          centerF,
          h,
        });
      }
    }
  }
}

assert.equal(spans4, 117);
assert.equal(spans4CenterF, 4);
assert.equal(hits4.length, 3);
assert.equal(spansAny23, 614);
assert.equal(spansAny23CenterF, 23);
assert.equal(hitsAny.length, 4);

const centerFAndDh = hitsAny.filter((hit) => hit.centerF);
assert.deepEqual(centerFAndDh.map((hit) => ({
  page: hit.page,
  words: hit.words,
  span: hit.span,
})), [{
  page: 0,
  words: [18, 21],
  span: [80, 102],
}]);

console.log(JSON.stringify({
  status: "PASS",
  receiver: {
    chain: "READ/OUT GP0 -> p50 bytes -> p0 offsets",
    start,
    end,
    wordNumbers: selectedWords.map((word) => word.n),
    wordLengths: selectedWords.map((word) => word.values.length),
    center: start + 11,
    centerRune: corpus.translit[p0.runes[start + 11]],
  },
  p28Dh23: { p, g, a, b, A, B, K },
  hadamard: {
    definition: "H(x,y)=(x-y,x+y) mod29 on each word circumference, outer to inner",
    selectedOutputs: selectedH,
    selectedTranslit: translit(selectedH),
    firstOccurrenceDhOrder: firstOccurrenceOrder,
    coversCompleteDhState: true,
  },
  census: {
    consecutiveFourWordLength23: spans4,
    consecutiveFourWordLength23CenterF: spans4CenterF,
    completeDhHitsFourWord: hits4,
    allWholeWordBoundedLength23: spansAny23,
    allWholeWordBoundedLength23CenterF: spansAny23CenterF,
    completeDhHitsAll: hitsAny,
    centerFAndCompleteDhHits: centerFAndDh,
    centerF23,
  },
  classification:
    "source-linked structural echo: the independently selected p0 23-rune center-F receiver is the sole whole-word-bounded 23-rune center-F span whose frozen H shell outputs contain every p28 DH23 state value; no plaintext or global inverse is claimed",
}, null, 2));
