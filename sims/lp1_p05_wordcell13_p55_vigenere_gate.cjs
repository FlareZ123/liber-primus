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
const phiKey = wordCellSums.map((value) => mod(phi(value)));
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

// Positive implementation control: a held-out native-GP plant must round-trip
// under each source-derived key, sign, and carry alignment with no F bypass.
let plantedControls = 0;
for (const key of [rawKey, phiKey]) {
  for (const sign of [-1, 1]) {
    for (const carryLiteral of [false, true]) {
      const encrypted = forward(heldoutShakespeare, key, sign, 0, carryLiteral);
      const recovered = decode(encrypted, key, sign, 0, carryLiteral);
      assert.deepEqual(recovered.plaintext, heldoutShakespeare);
      plantedControls++;
    }
  }
}
assert.equal(plantedControls, 8);

const variants = [];
for (const [keyName, key] of [["word-prime-sums", rawKey], ["word-sum-totients", phiKey]]) {
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
assert.equal(variants.length, 64);
const rank = (items) => items.slice().sort((a, b) => b.score - a.score);
const bestOverall = rank(variants)[0];
const bestRaw = rank(variants.filter((item) => item.keyName === "word-prime-sums"))[0];
const bestPhi = rank(variants.filter((item) => item.keyName === "word-sum-totients"))[0];

const report = {
  classification: "bounded original-p55 negative; no plaintext or authentic LP2 key recovered",
  sourceSelection: {
    p05WordCellCount: wordCellSums.length,
    p55TerminalRedDotCount: endMark.large_mark.dot_count,
    sharedMothPages: ["LP1 p05", "LP2 p53", "LP2 p55"],
    p05WordCellSumsRowMajor: wordCellSums,
    rawPrimeSumKeyMod29: rawKey,
    eulerTotientKeyMod29: phiKey,
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
  testedVariants: variants.length,
  exactOriginalReencryption: true,
  plantedPositiveControls: plantedControls,
  bestOverall,
  bestRaw,
  bestPhi,
  topEight: rank(variants).slice(0, 8)
};

console.log(JSON.stringify(report, null, 2));
