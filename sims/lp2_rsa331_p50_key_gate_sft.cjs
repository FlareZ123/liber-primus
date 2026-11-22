"use strict";

/**
 * Bounded source-derived test of the original Stage11 133/331 and p0 E=67
 * arithmetic cross-reference as a possible RSA key for the original p50
 * 32x8 numeric table, followed by a repeating GP29 additive-key use. It tests
 * row-major and the single red-heading-selected reverse-column-major order.
 *
 * This is a hypothesis test, not an assertion that the HTML numbers are RSA
 * parameters or that the p50 table is RSA ciphertext.
 *
 * Run from repository root:
 *   node sims/lp2_rsa331_p50_key_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = rel => fs.readFileSync(path.join(ROOT, rel), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/lp2-transcription.txt");
const dictionaryText = read("resources/control/english_wordfreq_textblob.txt");

assert.equal(corpus.translit.length, 29);
assert.equal(corpus.runes.length, 29);
assert.deepEqual(corpus.translit, [
  "F","U","TH","O","R","C","G","W","H","N",
  "I","J","EO","P","X","S","T","B","E","M",
  "L","NG","OE","D","A","AE","Y","IA","EA"
]);

const E = 133;
const N = 331;
const D = 67;
assert.equal((E * D) % (N - 1), 1, "133 and 67 must be inverse modulo phi(331)=330");

assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8));
const tableValues = grid.byte_rows.flat();
assert.equal(tableValues.length, 256);
assert(tableValues.every(x => Number.isInteger(x) && x >= 0 && x <= 255));

function powmod(a, e, n) {
  let result = 1;
  while (e > 0) {
    if (e & 1) result = (result * a) % n;
    a = (a * a) % n;
    e >>= 1;
  }
  return result;
}
const rsaDecoded = tableValues.map(value => powmod(value, D, N));
assert(rsaDecoded.every(x => x >= 0 && x < N));
const directAsciiPrintable = rsaDecoded.filter(x => x >= 32 && x <= 126).length;
const directByteRange = rsaDecoded.filter(x => x <= 255).length;
assert.equal(directAsciiPrintable, 78);
assert.equal(directByteRange, 200);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
function indicesOf(word) {
  return Array.from(word, rune => {
    const index = runeIndex.get(rune);
    assert.notEqual(index, undefined, "Unknown rune in source word");
    return index;
  });
}

const parsed = parseLP2Words(transcription, 55);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.deepEqual(parsed.words.slice(0, 2).map(word => word.length), [8, 5]);

// The two red p0 heading words supply the candidate 67 exponent relation;
// the tested stream begins at the first black-body rune.
const bodyWords = parsed.words.slice(2).map(word => indicesOf(word.runes));
assert.equal(bodyWords.length, 2894);
assert.equal(bodyWords.reduce((sum, word) => sum + word.length, 0), 12943);

const lastTranscriptPage = transcription.split("%").slice(-1)[0];
const p57Parsed = parseLP2Words(lastTranscriptPage, 1);
const p57Words = p57Parsed.words.map(word => indicesOf(word.runes));
assert.equal(p57Words.length, 20);
assert.equal(p57Words.reduce((sum, word) => sum + word.length, 0), 95);
assert.deepEqual(p57Words.flat(), corpus.pages[57].indices,
  "Clear p57 transcription must agree with the independent original corpus");

const grouped = ["ING", "TH", "NG", "EO", "OE", "AE", "IA", "EA"];
const spellings = new Map(corpus.translit.map((name, index) => [name, index]));
for (const [alias, primary] of [
  ["K", "C"], ["Z", "S"], ["ING", "NG"], ["IO", "IA"], ["V", "U"]
]) spellings.set(alias, spellings.get(primary));

function encodeLatin(word) {
  const letters = word.toUpperCase().replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < letters.length;) {
    const part = grouped.find(token => letters.startsWith(token, i)) || letters[i];
    const value = spellings.get(part);
    if (value === undefined) return null;
    out.push(value);
    i += part.length;
  }
  return out;
}

function wordKey(indices) {
  return indices.map(index => String.fromCharCode(65 + index)).join("");
}
const dictionary = new Set();
for (const line of dictionaryText.split(/\r?\n/)) {
  const match = line.match(/^([a-z]+)\s+\d+/i);
  if (!match) continue;
  const encoded = encodeLatin(match[1]);
  if (encoded && encoded.length >= 3) dictionary.add(wordKey(encoded));
}
assert(dictionary.size > 28000);

const mod29 = value => ((value % 29) + 29) % 29;
const key256 = rsaDecoded.map(value => value % 29);
const key512 = rsaDecoded.flatMap(value => [Math.floor(value / 29), value % 29]);
assert.equal(key256.length, 256);
assert.equal(key512.length, 512);

function encryptWords(words, key, sign) {
  let offset = 0;
  return words.map(word => word.map(plain => {
    if (plain === 0) return 0; // authentic p56 transparent-F rule
    const cipher = mod29(plain + sign * key[offset]);
    offset = (offset + 1) % key.length;
    return cipher;
  }));
}

/**
 * Exact ambiguity-aware inverse for the authentic p56 plaintext-F bypass:
 * ciphertext F can be either a transparent plaintext F (no key consumed) or
 * a non-F plaintext encrypted with the current key (one key consumed).
 *
 * All starting phases are admitted. The only retained state is the repeating
 * key offset; paths with the same offset are merged by dictionary rune score.
 */
function decodeDP(words, key, sign) {
  const period = key.length;
  let scores = new Int32Array(period);
  let hitCounts = new Int16Array(period);
  scores.fill(0);       // every possible starting phase
  hitCounts.fill(0);

  let firstDeadWord = -1;
  let survivingOffsets = period;
  let bestCoverage = 0;
  let bestHitWords = 0;
  let totalVariants = 0;
  let maxFanout = 0;

  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    const nextScores = new Int32Array(period);
    const nextHits = new Int16Array(period);
    nextScores.fill(-1);
    nextHits.fill(-1);

    for (let start = 0; start < period; start++) {
      if (scores[start] < 0) continue;
      let states = [{offset: start, output: ""}];

      for (const cipher of word) {
        const next = [];
        for (const state of states) {
          if (cipher === 0) {
            next.push({offset: state.offset, output: state.output + "A"});
            const plain = mod29(cipher - sign * key[state.offset]);
            if (plain !== 0) {
              next.push({
                offset: (state.offset + 1) % period,
                output: state.output + String.fromCharCode(65 + plain)
              });
            }
          } else {
            const plain = mod29(cipher - sign * key[state.offset]);
            if (plain !== 0) {
              next.push({
                offset: (state.offset + 1) % period,
                output: state.output + String.fromCharCode(65 + plain)
              });
            }
          }
        }
        states = next;
        if (states.length === 0) break;
      }

      maxFanout = Math.max(maxFanout, states.length);
      totalVariants += states.length;
      for (const state of states) {
        const hit = word.length >= 3 && dictionary.has(state.output);
        const score = scores[start] + (hit ? word.length : 0);
        const count = hitCounts[start] + (hit ? 1 : 0);
        if (score > nextScores[state.offset] ||
            (score === nextScores[state.offset] && count > nextHits[state.offset])) {
          nextScores[state.offset] = score;
          nextHits[state.offset] = count;
        }
      }
    }

    scores = nextScores;
    hitCounts = nextHits;
    survivingOffsets = 0;
    bestCoverage = -1;
    bestHitWords = 0;
    for (let offset = 0; offset < period; offset++) {
      if (scores[offset] >= 0) {
        survivingOffsets++;
        if (scores[offset] > bestCoverage ||
            (scores[offset] === bestCoverage && hitCounts[offset] > bestHitWords)) {
          bestCoverage = scores[offset];
          bestHitWords = hitCounts[offset];
        }
      }
    }
    if (survivingOffsets === 0) {
      firstDeadWord = wordIndex;
      break;
    }
  }

  return {
    firstDeadWord,
    firstDeadAfterWords: firstDeadWord < 0 ? null : firstDeadWord + 1,
    survivingOffsets,
    bestCoverage,
    bestHitWords,
    totalVariants,
    maxFanout
  };
}

const p57ExpectedCoverage = p57Words.reduce((sum, word) =>
  sum + (word.length >= 3 && dictionary.has(wordKey(word)) ? word.length : 0), 0);
assert(p57ExpectedCoverage > 0);

const hypotheses = [
  {name: "one-symbol-per-cell m-mod29", key: key256},
  {name: "padded-base29 m high-digit then low-digit", key: key512}
];
const results = [];
for (const hypothesis of hypotheses) {
  for (const sign of [-1, 1]) {
    const original = decodeDP(bodyWords, hypothesis.key, sign);
    assert.equal(original.survivingOffsets, 0,
      "No full original inverse should survive this bounded hypothesis");

    const plantedCipher = encryptWords(p57Words, hypothesis.key, sign);
    const plant = decodeDP(plantedCipher, hypothesis.key, sign);
    assert.equal(plant.firstDeadWord, -1,
      "The authentic F-transparent inverse must retain the planted p57 path");
    assert(plant.bestCoverage >= p57ExpectedCoverage,
      "The planted p57 dictionary coverage must remain reachable");

    results.push({
      order: "row-major",
      hypothesis: hypothesis.name,
      keyLength: hypothesis.key.length,
      sign,
      original,
      p57Plant: plant
    });
  }
}


 // One source-motivated transposition, not a permutation search:
 // 347-315=32, the original table has 32 rows, and modulo 256 the two red
 // heading sums land in the same row in adjacent columns under column-major
 // indexing. Their printed order (347 then 315) selects descending columns.
 const columnMajorValues = Array.from({length: 8}, (_, col) =>
   grid.byte_rows.map(row => row[col])
 ).flat();
 const reverseColumnMajorValues = columnMajorValues.slice().reverse();
 const redHeadingSums = [347, 315];
 const redHeadingColumnMajorAddresses = redHeadingSums.map(sum => {
   const index0 = sum % 256;
   const row0 = index0 % 32;
   const col0 = Math.floor(index0 / 32);
   return {
     sum, index0, row0, col0,
     columnMajorByte: columnMajorValues[index0],
     reverseColumnMajorPhase0: 255 - index0
   };
 });
 assert.deepEqual(
   redHeadingColumnMajorAddresses.map(({row0, col0}) => [row0, col0]),
   [[27, 2], [27, 1]]
 );
 assert.equal(
   redHeadingColumnMajorAddresses[0].index0 - redHeadingColumnMajorAddresses[1].index0,
   32
 );
 assert.deepEqual(
   redHeadingColumnMajorAddresses.map(x => x.reverseColumnMajorPhase0),
   [164, 196]
 );

 const reverseColumnMajorDecoded = reverseColumnMajorValues.map(value =>
   powmod(value, D, N)
 );
 const reverseColumnMajorKey256 = reverseColumnMajorDecoded.map(value => value % 29);
 const reverseColumnMajorKey512 = reverseColumnMajorDecoded.flatMap(value => [
   Math.floor(value / 29), value % 29
 ]);
 const reverseColumnMajorHypotheses = [
   {name: "one-symbol-per-cell m-mod29", key: reverseColumnMajorKey256},
   {name: "padded-base29 m high-digit then low-digit", key: reverseColumnMajorKey512}
 ];
 for (const hypothesis of reverseColumnMajorHypotheses) {
   for (const sign of [-1, 1]) {
     const original = decodeDP(bodyWords, hypothesis.key, sign);
     assert.equal(original.survivingOffsets, 0,
       "No full original inverse should survive heading-selected reverse-column-major order");
     const plantedCipher = encryptWords(p57Words, hypothesis.key, sign);
     const plant = decodeDP(plantedCipher, hypothesis.key, sign);
     assert.equal(plant.firstDeadWord, -1,
       "F-transparent inverse must retain reverse-column-major planted p57 path");
     assert(plant.bestCoverage >= p57ExpectedCoverage,
       "Reverse-column-major planted p57 dictionary coverage must remain reachable");
     results.push({
       order: "reverse-column-major (32-row stride; red-heading direction)",
       hypothesis: hypothesis.name,
       keyLength: hypothesis.key.length,
       sign,
       original,
       p57Plant: plant
     });
   }
 }

 const reverseColumnMajorAsciiPrintable = reverseColumnMajorDecoded.filter(
   x => x >= 32 && x <= 126
 ).length;
 const reverseColumnMajorByteRange = reverseColumnMajorDecoded.filter(
   x => x <= 255
 ).length;

console.log(JSON.stringify({
  source: "original LP2 transcription, canonical GP29 corpus, original p50 base60 grid",
  hypothesis: "RSA private operation c^67 mod331 on p50 table bytes; test row-major and red-heading-selected reverse-column-major orders as repeating GP29 additive keys",
  arithmetic: {publicExponent: E, modulus: N, privateExponent: D, inverseCheck: (E * D) % (N - 1)},
  sourceShape: {
    originalRunes: parsed.runeCount,
    originalWords: parsed.words.length,
    pageCarryingWords: parsed.crossPageWords,
    p0RedHeadingLengths: [8, 5],
    testedBlackBodyRunes: 12943,
    testedBlackBodyWords: 2894,
    p50TableShape: "32x8",
    redHeadingPrimeSums: redHeadingSums,
    redHeadingColumnMajorAddresses,
    p50TableCells: tableValues.length,
    p50CellRange: [Math.min(...tableValues), Math.max(...tableValues)]
  },
  rsaOutputRange: [Math.min(...rsaDecoded), Math.max(...rsaDecoded)],
  directAsciiPrintable,
  directByteRange,
  reverseColumnMajorRsaOutputRange: [Math.min(...reverseColumnMajorDecoded), Math.max(...reverseColumnMajorDecoded)],
  reverseColumnMajorAsciiPrintable,
  reverseColumnMajorByteRange,
  dictionaryWords: dictionary.size,
  p57Plant: {words: p57Words.length, runes: 95, dictionaryCoverage: p57ExpectedCoverage},
  results
}, null, 2));
