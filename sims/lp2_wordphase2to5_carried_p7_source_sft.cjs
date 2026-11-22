"use strict";
/**
 * Original LP2 per-word independently secret m-phase alphabet equality gate
 * for m=1..5, and one source-shaped p7 five-red-word carried-state inverse.
 * Read-only Windows 11 / Node.js 22 / CommonJS standalone SFT.
 * Each phase alphabet may change independently after EVERY complete word:
 * the E_m invariant costs zero key guesses and survives word phase offsets.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const src = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const physical = read("resources/liber-primus/lp2-transcription.txt").split("%");
const unknown = physical.slice(0, 55).join("")
  .replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const runeRe = new RegExp("[" + src.runes.join("") + "]+", "gu");
const toR = new Map(src.runes.map((r, i) => [r, i]));
/** @param {string} original */
function parseWords(original) {
  let offset = 0;
  return (original.match(runeRe) || []).map(s => {
    const word = { start: offset, codes: Array.from(s, r => toR.get(r)) };
    offset += word.codes.length;
    return word;
  });
}
const original = parseWords(unknown);
const originalRunes = src.pages.slice(0, 56).flatMap(p => p.indices);
assert.equal(original.length, 2896);
assert.equal(originalRunes.length, 12956);
assert.deepEqual(original.flatMap(w => w.codes), originalRunes);
assert.equal(original.filter(w => w.codes.length === 1).length, 83);
assert.equal(original.filter(w => w.codes.length === 2).length, 448);

/**
 * E_m sums identical-rune pairs whose within-word positions differ
 * by a multiple of m; it is invariant under a secret bijection chosen
 * independently for EACH word AND EACH residue class mod m.
 * @param {number[]} word
 * @returns {number[]}
 */
function signature(word) {
  const counts = [0, 0, 0, 0, 0];
  for (let i = 0; i < word.length; i++) {
    for (let j = i + 1; j < word.length; j++) {
      if (word[i] === word[j]) {
        for (let m = 1; m <= 5; m++) {
          if ((j - i) % m === 0) counts[m - 1]++;
        }
      }
    }
  }
  return counts;
}
/** @param {number[][]} sigs */
function total(sigs) {
  const z = [0, 0, 0, 0, 0];
  for (const v of sigs) for (let j = 0; j < 5; j++) z[j] += v[j];
  return z;
}
const originalE = total(original.map(w => signature(w.codes)));
assert.deepEqual(originalE, [811, 427, 218, 141, 106]);
const token = src.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} w */
function gpNative(w) {
  const input = w.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < input.length;) {
    if (input.startsWith("ING", i)) { result.push(21); i += 3; }
    else if (input.startsWith("IO", i)) { result.push(27); i += 2; }
    else {
      const t = token.find(t => input.startsWith(t.s, i));
      assert(t);
      result.push(t.i);
      i += t.s.length;
    }
  }
  return result;
}
/** @param {number} seed */
function rng(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}
const donors = [
  { id: "shakespeare", file: "resources/control/shakespeare_first300k.txt", seed: 0x5a0002 },
  { id: "emerson", file: "resources/control/emerson_essays_2944.txt", seed: 0x5a0003 },
  { id: "gibran", file: "resources/control/gibran_prophet_58585.txt", seed: 0x5a0004 }
];
const donorResults = [];
const samples = 5000;
for (const donor of donors) {
  let text = read(donor.file);
  if (donor.id === "gibran") {
    const upper = text.toUpperCase();
    text = text.slice(upper.indexOf("ALMUSTAFA"),
      upper.indexOf("*** END OF THIS PROJECT"));
  }
  const pools = new Map();
  for (const word of text.match(/[A-Za-z]+/g) || []) {
    const native = gpNative(word);
    const group = pools.get(native.length) || [];
    group.push(signature(native));
    pools.set(native.length, group);
  }
  const valid = original.filter(w => pools.has(w.codes.length));
  const actual = total(valid.map(w => signature(w.codes)));
  const lengths = valid.map(w => w.codes.length);
  const rand = rng(donor.seed);
  const minimum = [Infinity, Infinity, Infinity, Infinity, Infinity];
  const maximum = [0, 0, 0, 0, 0];
  const atOrBelow = [0, 0, 0, 0, 0];
  const mean = [0, 0, 0, 0, 0];
  for (let n = 0; n < samples; n++) {
    const values = [0, 0, 0, 0, 0];
    for (const length of lengths) {
      const b = pools.get(length);
      const sample = b[Math.floor(rand() * b.length)];
      for (let j = 0; j < 5; j++) values[j] += sample[j];
    }
    for (let j = 0; j < 5; j++) {
      minimum[j] = Math.min(minimum[j], values[j]);
      maximum[j] = Math.max(maximum[j], values[j]);
      mean[j] += values[j] / samples;
      if (values[j] <= actual[j]) atOrBelow[j]++;
    }
  }
  assert.equal(atOrBelow[0], 0, "existing per-word monalphabet bound");
  assert.equal(atOrBelow[1], 0, "all-secret fresh dual-phase withinword bound");
  assert.equal(atOrBelow[2], 0, "all-secret fresh triple-phase withinword bound");
  donorResults.push({
    donor: donor.id, matchedWords: valid.length, originalE: actual,
    samples, minimum, maximum, mean, atOrBelow
  });
}
assert.deepEqual(donorResults.map(r => r.matchedWords), [2896, 2896, 2893]);
assert.equal(donorResults[0].atOrBelow[3], 5);
assert.equal(donorResults[0].atOrBelow[4], 59);
assert.equal(donorResults[1].atOrBelow[4], 24);
assert.equal(donorResults[2].atOrBelow[4], 1041);

// Literal FIVE source red words at the end of physical p7. These products
// are GP29 0-based index products mod29, rather than prime-value products.
const red = src.pages[7].indices.slice(-14);
const redLengths = [2, 4, 3, 2, 3];
const products = [], redWords = [];
for (let i = 0, pos = 0; i < 5; i++) {
  const chunk = red.slice(pos, pos + redLengths[i]);
  pos += redLengths[i];
  redWords.push(chunk);
  products.push(chunk.reduce((x, y) => x * y % 29, 1));
}
assert.deepEqual(products, [11, 26, 8, 15, 2]);

/**
 * Source-shaped, fully invertible FIVE-phase cipher hypothesis:
 * from p8 onward, a new phase value per GP rune index (j mod5), and
 * a carried inter-word state driven by previous C word final rune/length.
 * This is a frozen exploratory law, NOT authenticated as Cicada's decoder.
 * @param {number[][]} words
 * @param {1|-1} sign
 * @param {boolean} encrypt
 */
function wordFive(words, sign, encrypt) {
  let carried = products[0];
  const result = [];
  for (const w of words) {
    const transformed = w.map((x, i) => {
      const key = (carried + products[i % 5]) % 29;
      return ((x + (encrypt ? sign : -sign) * key) % 29 + 29) % 29;
    });
    result.push(transformed);
    const ciphertextWord = encrypt ? transformed : w;
    carried = (carried + ciphertextWord.at(-1) + w.length) % 29;
  }
  return result;
}
const pageStart = [];
let cumulative = 0;
for (const p of src.pages) {
  pageStart.push(cumulative);
  cumulative += p.indices.length;
}
const p8word = original.findIndex(w => w.start === pageStart[8]);
assert(p8word > 0);
const targetWords = original.slice(p8word).map(w => w.codes);
const targetStart = pageStart[8];
const first300offset = pageStart[16] - targetStart;
const held200offset = pageStart[40] - targetStart;
/** @param {number[]} arr */
function ioc(arr) {
  const counts = Array(29).fill(0);
  for (const x of arr) counts[x]++;
  return counts.reduce((n, x) => n + x * (x - 1), 0) /
    (arr.length * (arr.length - 1));
}
const targetOriginal = targetWords.flat();
const receiver = [];
for (const sign of [1, -1]) {
  const decoded = wordFive(targetWords, sign, false);
  assert.deepEqual(wordFive(decoded, sign, true), targetWords);
  const p = decoded.flat();
  const first = p.slice(first300offset, first300offset + 300);
  const hold = p.slice(held200offset, held200offset + 200);
  const p16original = targetOriginal.slice(first300offset, first300offset + 300);
  const p40original = targetOriginal.slice(held200offset, held200offset + 200);
  assert.equal(first.length, 300);
  assert.equal(hold.length, 200);
  receiver.push({
    sign,
    originalReplay: targetOriginal.length,
    p16First300IoC: ioc(first),
    p16RawIoC: ioc(p16original),
    p40Unfitted200IoC: ioc(hold),
    p40RawIoC: ioc(p40original),
    first48GP: first.slice(0, 48).map(x => src.translit[x]).join("."),
    heldFirst24GP: hold.slice(0, 24).map(x => src.translit[x]).join(".")
  });
}
// Authenticated GP-native solved page p57 95/95 source-rune control.
const p57 = physical[56].replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const nativeSolved = parseWords(p57).map(w => w.codes);
assert.equal(nativeSolved.length, 20);
assert.deepEqual(nativeSolved.flat(), src.pages[57].indices);
for (const sign of [1, -1]) {
  const encrypted = wordFive(nativeSolved, sign, true);
  assert.deepEqual(wordFive(encrypted, sign, false), nativeSolved);
}

/*
 * Strongest five-dot interpretation: FIVE independent fresh arbitrary GP29
 * symbol permutations PER word, and ciphertext feedback of exactly FIVE.
 * Cipher-known D_j=C_j-C_(j-5) then equals the phase-specific permuted
 * plaintext, so E_5(D) is independent of ALL secret word/phase keys.
 */
function fifthResidual(word) {
  return word.map((c, j) =>
    ((c - (j >= 5 ? word[j - 5] : 0)) % 29 + 29) % 29);
}
const sourceFiveFiveE = total(original.map(w => signature(fifthResidual(w.codes))))[4];
assert.equal(sourceFiveFiveE, 68);
const nativeFivePhaseMin = Math.min(...donorResults.map(row => row.minimum[4]));
assert.equal(nativeFivePhaseMin, 78);
assert(sourceFiveFiveE < nativeFivePhaseMin);
/** @param {number[][]} book @param {number} seed */
function fivePhaseFeedbackPlant(book, seed) {
  const random = rng(seed);
  for (const word of book) {
    const maps = Array.from({ length: 5 }, () => {
      const a = Array.from({ length: 29 }, (_, i) => i);
      for (let i = 28; i > 0; i--) {
        const k = Math.floor(random() * (i + 1));
        [a[i], a[k]] = [a[k], a[i]];
      }
      return a;
    });
    const inverse = maps.map(a => {
      const i = Array(29);
      a.forEach((v, j) => { i[v] = j; });
      return i;
    });
    const c = [];
    for (let j = 0; j < word.length; j++) {
      c.push((maps[j % 5][word[j]] + (j >= 5 ? c[j - 5] : 0)) % 29);
    }
    const resid = fifthResidual(c);
    assert.equal(signature(resid)[4], signature(word)[4]);
    const decoded = resid.map((r, j) => inverse[j % 5][r]);
    assert.deepEqual(decoded, word);
    const replay = [];
    for (let j = 0; j < decoded.length; j++) {
      replay.push((maps[j % 5][decoded[j]] + (j >= 5 ? replay[j - 5] : 0)) % 29);
    }
    assert.deepEqual(replay, c);
  }
  return book.flat().length;
}
const sourceNativeShakespeare = new Map();
for (const word of read("resources/control/shakespeare_first300k.txt").match(/[A-Za-z]+/g) || []) {
  const native = gpNative(word);
  if (!sourceNativeShakespeare.has(native.length)) sourceNativeShakespeare.set(native.length, native);
}
const sourceShapePositive = original.map(w => sourceNativeShakespeare.get(w.codes.length));
assert(sourceShapePositive.every(Array.isArray));
assert.equal(fivePhaseFeedbackPlant(sourceShapePositive, 0x33015505), 12956);
const realSolvedFiveFive = physical[56].replace(/\/\r?\n/g, "").replace(/[\r\n%]/g, "");
const solvedFiveWords = parseWords(realSolvedFiveFive).map(w => w.codes);
assert.deepEqual(solvedFiveWords.flat(), src.pages[57].indices);
assert.equal(fivePhaseFeedbackPlant(solvedFiveWords, 0x33015705), 95);
console.log(JSON.stringify({
  source: "p7 final five red word GP index products; original p8-onward printed words, physical p16 and withheld p40",
  exactOriginal: {
    runes: originalRunes.length, words: original.length,
    perWordSecretPhaseEqualPairs: originalE
  },
  allSecretWordLocalPhaseAlphabetGate: {
    languageRegister: "GP29 English source-native donors",
    eachIndependentAlphabetMayChangeEveryWord: true,
    wordClockStartingPhaseMayBeUnknown: true,
    donors: donorResults,
    decision: "m=2 and m=3 original E_m are below all 15000 native length-matched samples; m=4 marginal; m=5 survives the conditional source-native gate"
  },
  fiveProductSourceKeys: products,
  originalCipherSourceTest: receiver,
  nativePositiveP57Recovered: 95,
  fivePhaseFiveBackArbitraryPerWordSecret: { sourceE5: sourceFiveFiveE, lowestNativeE5: nativeFivePhaseMin, sourceRunesPlantRecovered: 12956, genuineSolvedP57Recovered: 95, compatibleTrials: 0 },
  conclusion: "The simple p7 5-product + preceding-cipher-word carry is an invertible source-shaped hypothesis, not an identified original Cicada operation; judge each frozen original receiver independently."
}, null, 2));
