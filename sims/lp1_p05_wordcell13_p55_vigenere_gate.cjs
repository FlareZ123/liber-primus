"use strict";
/**
 * Source-constrained 13-word-cell p05 key test on moth-linked LP2 p55.
 *
 * Human-solver hypothesis:
 * - LP1 p05 has 13 rune-word cells whose GP-prime sums are fixed by the
 *   original canonical transcription.
 * - LP2 p55 reuses the p05 moth and ends in a red 13-dot mark.
 * - p05 explicitly calls primes and the totient function sacred.
 * - The solved p56 inverse supplies a historically demonstrated additive
 *   GP29 operation with literal, non-consuming F interrupters.
 * - The 2016 signed message says "words are the map, numbers are the direction",
 *   motivating a numeric-rank columnar-transposition control.
 * - The p57 "shed circumferences" reading of the p05 central column gives
 *   CABAL→UOID→FORM (13 GP runes); test its φ(GP-prime-weight) key as well.
 *
 * Test only the row-major 13-word-cell key, raw sums or phi(sum) mod 29,
 * either additive direction, two source-motivated p55 alignments (include
 * the incoming carry rune, or leave it unchanged), and all 8 masks of the
 * three visible p55 F positions. No key permutations, arbitrary phases,
 * fitted plaintext, or alternate targets.
 *
 * Run from repository root:
 *   node sims/lp1_p05_wordcell13_p55_vigenere_gate.cjs
 *
 * This is a bounded exploratory test, not a claim that the 13-dot mark
 * authorially selects a period-13 Vigenere cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  decodeFMask, trainNativeGP, languageScore
} = require("./historical_solve_path_transfer.cjs");
const { plaintextWords } = require("./authentic_decryption_regression.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const punctuation = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const emerson = read("resources/control/emerson_essays_2944.txt");
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const N = 29;
const mod = (x) => ((x % N) + N) % N;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const gpPrime = corpus.prime;

function phi(n) {
  let x = n;
  let result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x /= p;
      result -= result / p;
    }
  }
  if (x > 1) result -= result / x;
  return result;
}

const lines = lp1.split(/\r?\n/);
const start = lines.findIndex((line) => line.startsWith("272-138-"));
assert.ok(start >= 0, "missing original LP1 p05 square transcription");
const p05Rows = lines.slice(start, start + 5);
assert.equal(p05Rows.length, 5);
assert.ok(p05Rows.every((line) => line.endsWith("/")));

function tokenValue(token) {
  if (/^\d+$/.test(token)) return Number(token);
  const indices = [...token].map((rune) => {
    assert.ok(runeIndex.has(rune), "unmapped original GP rune " + rune);
    return runeIndex.get(rune);
  });
  return indices.reduce((sum, index) => sum + gpPrime[index], 0);
}
const p05Tokens = p05Rows.flatMap((line) => line.replace(/\/$/, "").split("-"));
const wordCellSums = p05Tokens
  .filter((token) => !/^\d+$/.test(token))
  .map(tokenValue);
assert.deepEqual(wordCellSums, [
  341, 366, 199, 130, 320, 245, 91, 226, 320, 130, 199, 366, 341
], "row-major p05 rune-word prime sums");
const rawKey = wordCellSums.map((value) => mod(value));
const wordCellTotients = wordCellSums.map(phi);
const phiKey = wordCellTotients.map(mod);

// The source-derived p05 central-column path CABAL → UOID → FORM is 13 GP
// runes. Apply the page's prime/totient instruction to each key rune's GP
// prime weight, matching the known p56 φ(prime) operation.
const phraseKeySymbols = plaintextWords("CABAL UOID FORM").flat();
const phraseKeyText = phraseKeySymbols.map((index) => corpus.translit[index]).join("");
assert.equal(phraseKeyText, "CABALUOIDFORM");
assert.equal(phraseKeySymbols.length, 13);
const phraseKeyPrimeWeights = phraseKeySymbols.map((index) => gpPrime[index]);
const phraseKeyPhiMod29 = phraseKeyPrimeWeights.map((value) => mod(phi(value)));
assert.deepEqual(phraseKeyPhiMod29, [12, 9, 2, 9, 14, 2, 6, 1, 1, 1, 6, 10, 12]);
assert.equal(rawKey.length, 13);

const p55 = corpus.pages.find((page) => page.page === 55).indices;
const p57 = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(p55.length, 76);
assert.equal(p55[0], 21, "p55 begins with the incoming NG carry rune");
const FPositions = p55.flatMap((symbol, i) => symbol === 0 ? [i] : []);
assert.deepEqual(FPositions, [15, 25, 41]);
const endMark = punctuation.events.find((event) =>
  event.page === 55 && event.symbol === "⁜" && event.rune_offset === 12956
);
assert.ok(endMark, "missing p55 terminal large punctuation event");
assert.equal(endMark.local_rune_offset, 76);
assert.equal(endMark.large_mark.dot_count, 13,
  "p55 terminal red punctuation must have 13 dots");
assert.equal(wordCellSums.length, endMark.large_mark.dot_count,
  "the proposed key length is selected by both 13 source word cells and 13 terminal dots");

const model = trainNativeGP(emerson);
const heldoutShakespeare = plaintextWords(shakespeare).flat().slice(0, 76);
assert.equal(heldoutShakespeare.length, 76);

function ioc(symbols) {
  const counts = new Uint32Array(N);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

function keyStream(key, length) {
  return Array.from({ length }, (_, i) => key[i % key.length]);
}

function forward(cipherPlain, key, sign, mask, carryLiteral, literalPositions = []) {
  const target = carryLiteral ? cipherPlain.slice(1) : cipherPlain;
  // Literal positions must come from the ciphertext being replayed, not from
  // the recovered plaintext (decryption can create additional F symbols).
  const positions = literalPositions;
  const stream = keyStream(key, target.length);
  const encrypted = [];
  let consumed = 0;
  for (let i = 0; i < target.length; i++) {
    const fBit = positions.indexOf(i);
    if (fBit >= 0 && ((mask >>> fBit) & 1)) {
      assert.equal(target[i], 0, "literal-F replay position");
      encrypted.push(0);
    } else {
      encrypted.push(mod(target[i] - sign * stream[consumed++]));
    }
  }
  return carryLiteral ? [cipherPlain[0], ...encrypted] : encrypted;
}

function decode(cipher, key, sign, mask, carryLiteral) {
  const target = carryLiteral ? cipher.slice(1) : cipher;
  const positions = target.flatMap((symbol, i) => symbol === 0 ? [i] : []);
  const stream = keyStream(key, target.length);
  // decodeFMask implements C - K. Negate K for the C + K direction.
  const inverseStream = sign < 0 ? stream : stream.map((value) => mod(-value));
  const result = decodeFMask(target, positions, mask, inverseStream);
  const plaintext = carryLiteral ? [cipher[0], ...result.plaintext] : result.plaintext;
  const reencryption = forward(plaintext, key, sign, mask, carryLiteral, positions);
  assert.deepEqual(reencryption, cipher, "every candidate must replay original p55 exactly");
  return { plaintext, consumed: result.consumed };
}

function columnOrder(values, descending) {
  return values.map((_, index) => index).sort((a, b) => {
    const difference = values[a] - values[b];
    return (descending ? -difference : difference) || (a - b);
  });
}

function columnarForward(symbols, values, descending, carryLiteral) {
  const target = carryLiteral ? symbols.slice(1) : symbols;
  const width = values.length;
  const rowCount = Math.ceil(target.length / width);
  const remainder = target.length % width;
  const columnLengths = Array.from({ length: width }, (_, column) =>
    column < remainder ? rowCount : rowCount - 1
  );
  const grid = Array.from({ length: rowCount }, () => Array(width));
  for (let i = 0; i < target.length; i++) {
    grid[Math.floor(i / width)][i % width] = target[i];
  }
  const encrypted = [];
  for (const column of columnOrder(values, descending)) {
    for (let row = 0; row < columnLengths[column]; row++) {
      encrypted.push(grid[row][column]);
    }
  }
  return carryLiteral ? [symbols[0], ...encrypted] : encrypted;
}

function columnarInverse(cipher, values, descending, carryLiteral) {
  const target = carryLiteral ? cipher.slice(1) : cipher;
  const width = values.length;
  const rowCount = Math.ceil(target.length / width);
  const remainder = target.length % width;
  const columnLengths = Array.from({ length: width }, (_, column) =>
    column < remainder ? rowCount : rowCount - 1
  );
  const columns = Array(width);
  let offset = 0;
  for (const column of columnOrder(values, descending)) {
    columns[column] = target.slice(offset, offset + columnLengths[column]);
    offset += columnLengths[column];
  }
  const plaintext = [];
  for (let row = 0; row < rowCount; row++) {
    for (let column = 0; column < width; column++) {
      if (row < columnLengths[column]) plaintext.push(columns[column][row]);
    }
  }
  return carryLiteral ? [cipher[0], ...plaintext] : plaintext;
}

// Positive implementation control: a held-out native-GP plant must round-trip
// under each source-derived additive key, sign, and carry alignment with no F bypass.
let plantedControls = 0;
for (const key of [rawKey, phiKey, phraseKeyPhiMod29]) {
  for (const sign of [-1, 1]) {
    for (const carryLiteral of [false, true]) {
      const encrypted = forward(heldoutShakespeare, key, sign, 0, carryLiteral);
      const recovered = decode(encrypted, key, sign, 0, carryLiteral);
      assert.deepEqual(recovered.plaintext, heldoutShakespeare);
      plantedControls++;
    }
  }
}
assert.equal(plantedControls, 12);

// Positive implementation control for the source-motivated 13-column
// numerical-rank transposition, with stable row-major tie handling.
let plantedColumnarControls = 0;
for (const values of [wordCellSums, wordCellTotients]) {
  for (const descending of [false, true]) {
    for (const carryLiteral of [false, true]) {
      const encrypted = columnarForward(heldoutShakespeare, values, descending, carryLiteral);
      const recovered = columnarInverse(encrypted, values, descending, carryLiteral);
      assert.deepEqual(recovered, heldoutShakespeare);
      plantedColumnarControls++;
    }
  }
}
assert.equal(plantedColumnarControls, 8);

const variants = [];
for (const [keyName, key] of [
  ["word-prime-sums", rawKey],
  ["word-sum-totients", phiKey],
  ["central-column-phrase-phi-prime", phraseKeyPhiMod29]
]) {
  for (const sign of [-1, 1]) {
    for (const carryLiteral of [false, true]) {
      for (let mask = 0; mask < (1 << FPositions.length); mask++) {
        const result = decode(p55, key, sign, mask, carryLiteral);
        variants.push({
          keyName,
          direction: sign < 0 ? "subtract" : "add",
          alignment: carryLiteral ? "incoming carry left literal; key starts at first complete p55 word"
            : "key starts at physical p55 page boundary",
          mask,
          consumed: result.consumed,
          score: languageScore(result.plaintext, model),
          ioc: ioc(result.plaintext),
          preview: result.plaintext.map((index) => corpus.translit[index]).join("")
        });
      }
    }
  }
}
assert.equal(variants.length, 96);

const columnarVariants = [];
for (const [keyName, values] of [["word-prime-sums", wordCellSums], ["word-sum-totients", wordCellTotients]]) {
  for (const descending of [false, true]) {
    for (const carryLiteral of [false, true]) {
      const plaintext = columnarInverse(p55, values, descending, carryLiteral);
      assert.deepEqual(
        columnarForward(plaintext, values, descending, carryLiteral),
        p55,
        "every columnar candidate must replay original p55 exactly"
      );
      columnarVariants.push({
        keyName,
        direction: descending ? "descending" : "ascending",
        alignment: carryLiteral ? "incoming carry left literal; transpose first complete p55 word"
          : "transpose from physical p55 page boundary",
        score: languageScore(plaintext, model),
        ioc: ioc(plaintext),
        preview: plaintext.map((index) => corpus.translit[index]).join("")
      });
    }
  }
}
assert.equal(columnarVariants.length, 8);

const rank = (items) => items.slice().sort((a, b) => b.score - a.score);
const bestOverall = rank(variants)[0];
const bestRaw = rank(variants.filter((item) => item.keyName === "word-prime-sums"))[0];
const bestPhi = rank(variants.filter((item) => item.keyName === "word-sum-totients"))[0];
const bestPhrase = rank(variants.filter((item) => item.keyName === "central-column-phrase-phi-prime"))[0];
const bestPhraseSubtract = rank(variants.filter((item) =>
  item.keyName === "central-column-phrase-phi-prime" && item.direction === "subtract"
))[0];
const bestColumnar = rank(columnarVariants)[0];
const bestRawColumnar = rank(columnarVariants.filter((item) => item.keyName === "word-prime-sums"))[0];
const bestPhiColumnar = rank(columnarVariants.filter((item) => item.keyName === "word-sum-totients"))[0];

const report = {
  classification: "bounded original-p55 negative; no plaintext or authentic LP2 key recovered",
  sourceSelection: {
    p05WordCellCount: wordCellSums.length,
    p55TerminalRedDotCount: endMark.large_mark.dot_count,
    sharedMothPages: ["LP1 p05", "LP2 p53", "LP2 p55"],
    p05WordCellSumsRowMajor: wordCellSums,
    rawPrimeSumKeyMod29: rawKey,
    eulerTotientKeyMod29: phiKey,
    wordCellTotients: wordCellTotients,
    centralColumnPhrase: phraseKeyText,
    centralColumnPhrasePrimeWeights: phraseKeyPrimeWeights,
    centralColumnPhrasePhiMod29: phraseKeyPhiMod29,
    p55OriginalRunes: p55.length,
    p55IncomingCarryRune: corpus.translit[p55[0]],
    p55VisibleFPositions: FPositions
  },
  model: {
    trainingSource: "resources/control/emerson_essays_2944.txt",
    heldoutControlSource: "resources/control/shakespeare_first300k.txt",
    heldoutControlRunes: heldoutShakespeare.length,
    heldoutControlScore: languageScore(heldoutShakespeare, model),
    p57CleartextScore: languageScore(p57, model),
    p57CleartextIoC: ioc(p57)
  },
  originalP55Baseline: {
    score: languageScore(p55, model),
    ioc: ioc(p55)
  },
  testedAdditiveVariants: variants.length,
  testedColumnarVariants: columnarVariants.length,
  testedTotalVariants: variants.length + columnarVariants.length,
  exactOriginalReencryption: true,
  plantedPositiveControls: plantedControls + plantedColumnarControls,
  bestAdditiveOverall: bestOverall,
  bestRaw,
  bestPhi,
  bestPhrase,
  bestPhraseSubtract,
  topAdditiveEight: rank(variants).slice(0, 8),
  bestColumnar,
  bestRawColumnar,
  bestPhiColumnar,
  allColumnarVariants: rank(columnarVariants)
};

console.log(JSON.stringify(report, null, 2));
