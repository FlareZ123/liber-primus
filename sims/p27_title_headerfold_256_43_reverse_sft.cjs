"use strict";

/**
 * Source-native continuation of the p55 FOLD -> 13-dot fragment18 -> p27 title route.
 *
 * Reproduces:
 * - fragment18's unique self-indexing 19-rune title;
 * - header-aware fold: equality bits 100000000 = 256;
 * - the only matching pair is P/P, whose GP prime is 43;
 * - uniqueness of that compound signature across every 19-rune LP2 window;
 * - the exact 1432-word / 1433-rune cross-unit coincidence, without treating it as a direction;
 * - signed "lies" -> table cell83, the two 193 cells, and their mirrored 201 outer neighbors;
 * - the resulting 43-cell interval between the two 193 boundaries, with orientation unresolved;
 * - bounded direct-key negatives for the conditional reverse ordering of that interval.
 *
 * Run:
 *   node sims/p27_title_headerfold_256_43_reverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
/** @param {string} p */
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const MOD = 29;

/** @param {number} n @param {number} m */
function mod(n, m) {
  return ((n % m) + m) % m;
}

/** @param {number[]} a */
function translit(a) {
  return a.map((x) => corpus.translit[x]).join("");
}

/** @param {number} seed */
function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

// Canonical full LP2 stream and 13-dot fragment boundaries.
const pages = corpus.pages.slice().sort((a, b) => a.page - b.page);
const pageStarts = new Map();
let total = 0;
for (const page of pages) {
  pageStarts.set(page.page, total);
  total += page.indices.length;
}
assert.equal(total, 13136);
const stream = pages.flatMap((page) => page.indices);

const marks = [];
for (const page of ink.pages) {
  for (const mark of page.large_punctuation || []) {
    if (mark[1] === 13) marks.push(pageStarts.get(page.page) + mark[0]);
  }
}
marks.sort((a, b) => a - b);
assert.equal(marks.length, 31);
const boundaries = [0, ...marks, stream.length];
assert.equal(boundaries.length, 33);

/** @param {number} oneBased */
function fragment(oneBased) {
  const start = boundaries[oneBased - 1];
  const end = boundaries[oneBased];
  return stream.slice(start, end);
}

const title = fragment(18);
assert.equal(title.length, 19);
assert.equal(title[0], 19);
assert.equal(title.length - 1, 18);
assert.equal(translit(title), "MPYLSOAAEHLEEOIMLLSCP");

// Treat M=19 as the self-authenticating length header. Fold the remaining
// 18 payload runes outer-to-inner.
const payload = title.slice(1);
const equality = [];
for (let i = 0; i < 9; i++) {
  equality.push(payload[i] === payload[payload.length - 1 - i] ? 1 : 0);
}
const equalityBits = equality.join("");
const equalityValue = Number.parseInt(equalityBits, 2);
assert.equal(equalityBits, "100000000");
assert.equal(equalityValue, 256);
assert.equal(payload[0], 13);
assert.equal(payload.at(-1), 13);
assert.equal(corpus.translit[13], "P");
assert.equal(corpus.prime[13], 43);

// The complete title-fold signature is source-rare: one hit among every
// possible contiguous 19-rune window in the full LP2 stream.
function compoundSignature(a) {
  if (a.length !== 19 || a[0] !== 19) return false;
  const p = a.slice(1);
  if (p[0] !== 13 || p.at(-1) !== 13) return false;
  for (let i = 1; i < 9; i++) {
    if (p[i] === p[p.length - 1 - i]) return false;
  }
  return true;
}
const signatureHits = [];
for (let i = 0; i + 19 <= stream.length; i++) {
  if (compoundSignature(stream.slice(i, i + 19))) signatureHits.push(i);
}
assert.deepEqual(signatureHits, [6527]);

// It is also the only 13-dot fragment with any of the three self-indexing
// properties used by the route.
const fragmentSpecial = [];
for (let n = 1; n <= 32; n++) {
  const a = fragment(n);
  if (!a.length) continue;
  let fold256 = false;
  if ((a.length - 1) % 2 === 0) {
    const p = a.slice(1);
    let value = 0;
    for (let i = 0; i < p.length / 2; i++) {
      value = (value << 1) | (p[i] === p[p.length - 1 - i] ? 1 : 0);
    }
    fold256 = value === 256;
  }
  if (a[0] === a.length || a.length - 1 === n || fold256) {
    fragmentSpecial.push(n);
  }
}
assert.deepEqual(fragmentSpecial, [18]);

// Canonical 2,896-word repeated p27/p55 bookend. The 1,432 value is a
// word-offset difference while the 1,433 value below is a rune count.
// Their modular relationship is recorded as an exact cross-unit coincidence;
// it is not used as a direction or cipher state.
const runePages = transcription.split("%");
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const RUNIC = /[\u16A0-\u16FF]/u;
const unknownStream = runePages.slice(0, 55).join("%");
const words = [];
let current = [];
for (const ch of unknownStream) {
  if (RUNIC.test(ch)) {
    current.push(runeToIndex.get(ch));
  } else if (ch === "%" || ch === "/" || /\s/u.test(ch)) {
    // Transparent physical page/line wraps.
  } else if (current.length) {
    words.push(current);
    current = [];
  }
}
if (current.length) words.push(current);
assert.equal(words.length, 2896);
const firstWord = [23, 11, 1];
const secondWord = [17, 18, 10];
const starts = [];
for (let i = 0; i + 1 < words.length; i++) {
  if (words[i].length === 3 && words[i + 1].length === 3
      && words[i].every((v, j) => v === firstWord[j])
      && words[i + 1].every((v, j) => v === secondWord[j])) {
    starts.push(i);
  }
}
assert.deepEqual(starts, [1462, 2894]);
const gap = starts[1] - starts[0];
const section = [...transcription.split("$")[5]]
  .filter((ch) => RUNIC.test(ch)).map((r) => runeToIndex.get(r));
assert.equal(section.length, 1433);
assert.equal(gap, 1432);
assert.equal(gap % section.length, section.length - 1);

// GP encoding for the signed 2016 words and canonical printed LP2 words.
const gpTokens = corpus.translit.map((token, index) =>
  ({token: token.toLowerCase(), index}))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} source */
function gpEncode(source) {
  const word = source.toLowerCase().replace(/v/g, "u")
    .replace(/k/g, "c").replace(/z/g, "s");
  const out = [];
  for (let offset = 0; offset < word.length;) {
    const token = gpTokens.find((item) => word.startsWith(item.token, offset));
    if (!token) return null;
    out.push(token.index);
    offset += token.token.length;
  }
  return out;
}

/** @param {string} source */
function printedWords(source) {
  return source.replace(/[\/\r\n]/gu, "").split(/[-.&$§,:!?]/u)
    .map((part) => (part.match(/[ᚠ-᛿]+/gu) || []).join(""))
    .filter(Boolean);
}
const physical = Array.from({length: 58}, (_, page) => page === 50
  ? [] : printedWords(runePages[page > 50 ? page - 1 : page]));

const signedBody = signed.slice(signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
const signedWords = signedBody.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g) || [];
assert.equal(signedWords.length, 43);

const mapped = signedWords.map((word) => {
  const encoded = gpEncode(word);
  assert.ok(encoded);
  const sourcePrimeSum = encoded.reduce((n, i) => n + corpus.prime[i], 0);
  const page = sourcePrimeSum % 58;
  const wordIndex = Math.floor(sourcePrimeSum / 58);
  const selected = physical[page]?.[wordIndex] || null;
  const indices = [...(selected || "")].map((r) => runeToIndex.get(r));
  return {
    word, sourcePrimeSum, page, wordIndex, indices,
    selectedPrimeSum: indices.reduce((n, i) => n + corpus.prime[i], 0),
    selectedOrdinalSum: indices.reduce((n, i) => n + i, 0)
  };
});
const lies = mapped.find((x) => x.word.toLowerCase() === "lies");
assert.deepEqual([lies.sourcePrimeSum, lies.page, lies.wordIndex], [224, 50, 3]);

const page50 = grid.pages.find((p) => p.page === 50);
assert.ok(page50);
assert.deepEqual([page50.tokens[3], page50.bytes[3]], ["3D", 193]);
const page50Start = grid.pages.filter((p) => p.page < 50)
  .reduce((n, p) => n + p.bytes.length, 0);
assert.equal(page50Start, 80);
const selectedCell = page50Start + lies.wordIndex;
assert.equal(selectedCell, 83);

// The signed selector lands on one of exactly two byte-193 cells. Their
// outward neighbors are both 201, producing a mirrored bracket around the
// 43 cells strictly between the 193 boundaries. This selects the interval,
// while neither the source nor this gate fixes forward versus reverse order.
const locations193 = grid.bytes.flatMap((value, index) => value === 193 ? [index] : []);
assert.deepEqual(locations193, [83, 127]);
assert.deepEqual(grid.bytes.slice(82, 84), [201, 193]);
assert.deepEqual(grid.bytes.slice(127, 129), [193, 201]);
const reversedPairs = [];
for (let i = 0; i < 255; i++) {
  for (let j = i + 2; j < 255; j++) {
    if (grid.bytes[i] === grid.bytes[j + 1]
        && grid.bytes[i + 1] === grid.bytes[j]) {
      reversedPairs.push([i, j]);
    }
  }
}
assert.deepEqual(reversedPairs, [[82, 127]]);
const forward43 = grid.bytes.slice(84, 127);
const reverse43 = forward43.slice().reverse();
assert.equal(forward43.length, 43);
assert.equal(reverse43.length, 43);

// The 43 bytes are not themselves a modulo-43 permutation.
assert.equal(new Set(reverse43.map((x) => x % 43)).size, 27);

// Fixed GP word-internal model for bounded direct-key controls.
function languageModel(training) {
  const pairs = Array.from({length: MOD}, () => Array(MOD).fill(1));
  const triples = Array.from({length: MOD}, () =>
    Array.from({length: MOD}, () => Array(MOD).fill(1)));
  const pairTotals = Array(MOD).fill(MOD);
  const tripleTotals = Array.from({length: MOD}, () => Array(MOD).fill(MOD));
  for (const word of training) {
    for (let i = 1; i < word.length; i++) {
      pairs[word[i - 1]][word[i]]++;
      pairTotals[word[i - 1]]++;
    }
    for (let i = 2; i < word.length; i++) {
      triples[word[i - 2]][word[i - 1]][word[i]]++;
      tripleTotals[word[i - 2]][word[i - 1]]++;
    }
  }
  return (wordList) => {
    let log = 0;
    let n = 0;
    for (const word of wordList) {
      for (let i = 1; i < word.length; i++) {
        log += Math.log(pairs[word[i - 1]][word[i]] / pairTotals[word[i - 1]]);
        n++;
      }
      for (let i = 2; i < word.length; i++) {
        log += Math.log(triples[word[i - 2]][word[i - 1]][word[i]]
          / tripleTotals[word[i - 2]][word[i - 1]]);
        n++;
      }
    }
    return log / n;
  };
}
const native = (shakespeare.match(/[A-Za-z]+/g) || [])
  .map(gpEncode).filter((w) => w && w.length >= 2);
const score = languageModel(native.slice(0, Math.floor(native.length * 0.75)));

/** @param {number[][]} input @param {number[]} key @param {-1|1} sign */
function perWordShift(input, key, sign) {
  return input.map((word, i) => word.map((x) => mod(x + sign * key[i], MOD)));
}

/** @param {number[]} values @param {()=>number} random */
function shuffled(values, random) {
  const out = values.slice();
  for (let j = out.length - 1; j > 0; j--) {
    const k = Math.floor(random() * (j + 1));
    [out[j], out[k]] = [out[k], out[j]];
  }
  return out;
}

const addressed = mapped.map((x) => x.indices);
const addressedNull = [];
let random = xorshift(0x26112016);
for (const sign of [-1, 1]) {
  const actual = score(perWordShift(addressed, reverse43, sign));
  let ge = 0;
  for (let trial = 0; trial < 2000; trial++) {
    const control = score(perWordShift(addressed, shuffled(reverse43, random), sign));
    if (control >= actual) ge++;
  }
  addressedNull.push({sign, actual, ge, upperTail: (ge + 1) / 2001});
}
assert.deepEqual(addressedNull.map((x) => x.ge), [1628, 432]);

// p55 "shed circumference" gives 43 interior runes. Apply the conditional
// reverse table order positionwise and keep the surviving word boundaries.
const p55Words = printedWords(runePages[54]);
const innerWords = p55Words.map((word) =>
  [...word].slice(1, -1).map((r) => runeToIndex.get(r))).filter((w) => w.length);
const inner55 = innerWords.flat();
assert.equal(inner55.length, 43);
const innerLengths = innerWords.map((w) => w.length);

/** @param {number[]} flat */
function splitInner(flat) {
  const out = [];
  let offset = 0;
  for (const length of innerLengths) {
    out.push(flat.slice(offset, offset + length));
    offset += length;
  }
  return out;
}
const p55Null = [];
random = xorshift(0x33014355);
for (const sign of [-1, 1]) {
  const actualFlat = inner55.map((x, i) => mod(x + sign * reverse43[i], MOD));
  const actual = score(splitInner(actualFlat));
  let ge = 0;
  for (let trial = 0; trial < 4000; trial++) {
    const key = shuffled(reverse43, random);
    const control = inner55.map((x, i) => mod(x + sign * key[i], MOD));
    if (score(splitInner(control)) >= actual) ge++;
  }
  p55Null.push({
    sign, actual, transliteration: splitInner(actualFlat).map(translit).join(" "),
    ge, upperTail: (ge + 1) / 4001
  });
}
assert.deepEqual(p55Null.map((x) => x.ge), [882, 3162]);

// Finite direct byte readouts under the same conditional reverse order.
const printableCounts = {};
for (const field of ["sourcePrimeSum", "selectedPrimeSum", "selectedOrdinalSum"]) {
  for (const op of ["xor", "sub", "add"]) {
    const output = reverse43.map((byte, i) => {
      const value = mapped[i][field];
      if (op === "xor") return byte ^ (value & 255);
      if (op === "sub") return mod(byte - value, 256);
      return mod(byte + value, 256);
    });
    printableCounts[`${field}_${op}`] =
      output.filter((x) => x >= 32 && x <= 126).length;
  }
}
assert.equal(Math.max(...Object.values(printableCounts)), 22);

console.log(JSON.stringify({
  classification:
    "source-rare 256/43 interval selector with unresolved orientation and bounded conditional reverse-order negatives; no plaintext recovered",
  title: {
    fragment: 18,
    length: title.length,
    headerIndex: title[0],
    payloadLength: payload.length,
    foldBits: equalityBits,
    foldValue: equalityValue,
    onlyMatchedRune: "P",
    matchedRuneIndex: 13,
    matchedRunePrime: corpus.prime[13],
    compoundSignatureHits: signatureHits
  },
  crossUnitCoincidence: {
    repeatedWordStarts: starts,
    wordGap: gap,
    sectionRunes: section.length,
    numericRelation: gap % section.length,
    interpretation: "word and rune units differ; no direction inferred"
  },
  table: {
    signedWord: "lies",
    selectedCell,
    selectedByte: grid.bytes[selectedCell],
    locations193,
    mirroredOuterBytes: [grid.bytes[82], grid.bytes[128]],
    reversedPairLocations: reversedPairs,
    enclosedCells: forward43.length,
    orientation: "unresolved",
    conditionalReverseModulo43Distinct: new Set(reverse43.map((x) => x % 43)).size
  },
  conditionalReverse43DirectTests: {
    addressedWordGp29: addressedNull,
    p55InteriorGp29: p55Null,
    printableCounts
  }
}, null, 2));
