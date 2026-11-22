"use strict";

/**
 * One fixed source-visible key hypothesis for the original LP2 table flanks:
 * p49 printed line lengths 23,22,21 -> 2013 prime_echo ordinals -> GP29
 * period-three Vigenere. This is a bounded negative, not a proposed solution.
 *
 * Run from the repository root with:
 *   node sims/lp2_p49_line_length_prime_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const primeEcho = read("resources/historical/cicada2013-os-original-prime-echo.sh");
const segments = transcription.split(/^%$/m);
assert.equal(segments.length, 57, "Rune-free physical p50 is omitted");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const numbers = text => [...text].flatMap(char =>
  runeIndex.has(char) ? [runeIndex.get(char)] : []
);
const words = text => text.split(/[-.&$§]/).map(numbers).filter(word => word.length);
const mod = value => ((value % 29) + 29) % 29;
const ioc = input => {
  const counts = Array(29).fill(0);
  for (const rune of input) counts[rune]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (input.length * (input.length - 1));
};
const translit = input => input.map(rune => corpus.translit[rune]).join("");

function pageText(page) {
  if (page === 50) return "";
  return segments[page < 50 ? page : page - 1].replace(/[\/\r\n]/g, "");
}

const p49LineLengths = segments[49].split(/\r?\n/)
  .map(numbers).filter(line => line.length).map(line => line.length);
assert.deepEqual(p49LineLengths, [23, 22, 21]);

// Parse the literal original prime_echo output, not a replacement prime table.
const primes = [...primeEcho.matchAll(/echo\s+(?:-n\s+)?\"(\d+)\t\"/g)]
  .map(match => Number(match[1]));
assert.equal(primes.length, 464);
const primeValues = p49LineLengths.map(ordinal => primes[ordinal - 1]);
assert.deepEqual(primeValues, [83, 79, 73]);
const key = primeValues.map(mod);
assert.deepEqual(key, [25, 21, 15]);

const p48 = pageText(48);
const p49 = pageText(49);
const p51 = pageText(51);
const p52 = pageText(52);
const lastPeriod48 = p48.lastIndexOf(".");
const lastPeriod49 = p49.lastIndexOf(".");
const firstPeriod52 = p52.indexOf(".");
assert(lastPeriod48 >= 0 && lastPeriod49 >= 0 && firstPeriod52 >= 0);
assert(!p51.includes("."), "Post-table p51 has no printed full stop");

const pre48 = p48.slice(lastPeriod48 + 1);
const pre49 = p49.slice(0, lastPeriod49 + 1);
const post52 = p52.slice(0, firstPeriod52 + 1);
const before = pre48 + pre49;
const after = p51 + post52;
const beforeRunes = numbers(before);
const afterRunes = numbers(after);
assert.deepEqual([numbers(pre48).length, numbers(pre49).length], [72, 66]);
assert.deepEqual([numbers(p51).length, numbers(post52).length], [92, 78]);
assert.deepEqual([beforeRunes.length, afterRunes.length], [138, 170]);
assert.deepEqual([words(before).length, words(after).length], [33, 40]);
assert.equal(numbers(pre48).length % 3, 0);
assert.equal(beforeRunes.length % 3, 0);

// The sole tested clock starts at p49's first rune; p48's 72-rune carry
// and the 138-rune pretable sentence both preserve phase zero.
function directDecode(cipher, sign) {
  return cipher.map((value, index) => mod(value + sign * key[index % 3]));
}
function directEncode(plain, sign) {
  return plain.map((value, index) => mod(value - sign * key[index % 3]));
}

const direct = {};
for (const sign of [-1, 1]) {
  const prePlain = directDecode(beforeRunes, sign);
  const postPlain = directDecode(afterRunes, sign);
  assert.deepEqual(directEncode(prePlain, sign), beforeRunes);
  assert.deepEqual(directEncode(postPlain, sign), afterRunes);
  direct[sign === -1 ? "subtract" : "add"] = {
    pretable_ioc: ioc(prePlain),
    posttable_ioc: ioc(postPlain),
    pretable_plaintext: translit(prePlain),
    posttable_plaintext: translit(postPlain)
  };
}

const all = beforeRunes.concat(afterRunes);
const fPositions = all.flatMap((value, index) => value === 0 ? [index] : []);
assert.deepEqual(fPositions, [
  13, 32, 35, 37, 65, 71, 75, 105, 141, 195, 198, 229, 231, 271
]);

// Exact solved-p56 grammar: literal plaintext F is emitted unchanged and
// does not advance the key. Every possible choice at original ciphertext-F
// positions is enumerated; a non-F ciphertext may not decode to plaintext F.
function enumerateTransparentPaths(cipher, sign) {
  const positions = cipher.flatMap((value, index) => value === 0 ? [index] : []);
  const masks = 2 ** positions.length;
  let validPaths = 0;
  let minNonFToFConflicts = Infinity;
  for (let mask = 0; mask < masks; mask++) {
    let phase = 0;
    let bit = 0;
    let conflicts = 0;
    for (let index = 0; index < cipher.length; index++) {
      const value = cipher[index];
      if (value === 0) {
        const bypass = (mask & (1 << bit)) !== 0;
        bit++;
        if (bypass) continue;
      }
      const plain = mod(value + sign * key[phase]);
      if (value !== 0 && plain === 0) conflicts++;
      phase = (phase + 1) % 3;
    }
    if (conflicts === 0) validPaths++;
    minNonFToFConflicts = Math.min(minNonFToFConflicts, conflicts);
  }
  return { masks, validPaths, minNonFToFConflicts };
}

function transparentEncode(plain, sign) {
  let phase = 0;
  const cipher = [];
  const bypassPositions = [];
  for (let index = 0; index < plain.length; index++) {
    const value = plain[index];
    if (value === 0) {
      cipher.push(0);
      bypassPositions.push(index);
    } else {
      cipher.push(mod(value - sign * key[phase]));
      phase = (phase + 1) % 3;
    }
  }
  return { cipher, bypassPositions };
}

function transparentDecode(cipher, sign, bypassPositions) {
  const bypass = new Set(bypassPositions);
  let phase = 0;
  const plain = [];
  for (let index = 0; index < cipher.length; index++) {
    const value = cipher[index];
    if (value === 0 && bypass.has(index)) {
      plain.push(0);
      continue;
    }
    const decoded = mod(value + sign * key[phase]);
    if (value !== 0 && decoded === 0) {
      throw new Error("Non-F ciphertext decoded to plaintext F");
    }
    plain.push(decoded);
    phase = (phase + 1) % 3;
  }
  return plain;
}

const transparent = {};
for (const sign of [-1, 1]) {
  const original = enumerateTransparentPaths(all, sign);
  assert.equal(original.masks, 16384);
  assert.equal(original.validPaths, 0);

  // Plant the authentic clear p57 GP29 stream repeatedly to fill 308 symbols.
  // This validates the exact transparent-F forward/inverse implementation.
  const clear = corpus.pages[57].indices;
  const control = Array.from({ length: 308 }, (_, index) => clear[index % clear.length]);
  const planted = transparentEncode(control, sign);
  assert.deepEqual(
    transparentDecode(planted.cipher, sign, planted.bypassPositions),
    control
  );
  transparent[sign === -1 ? "subtract" : "add"] = {
    ...original,
    positive_control_symbols: control.length,
    positive_control_literal_F_bypasses: planted.bypassPositions.length,
    positive_control_exact_roundtrip: true
  };
}

console.log(JSON.stringify({
  sources: {
    original_p49_scan: "resources/liber-primus/66.jpg",
    transcription: "resources/liber-primus/lp2-transcription.txt",
    corpus: "resources/liber-primus/lp2-corpus.json",
    historical_prime_sequence: "resources/historical/cicada2013-os-original-prime-echo.sh"
  },
  observed_line_lengths: p49LineLengths,
  prime_ordinals: p49LineLengths,
  prime_values: primeValues,
  fixed_gp29_key: key,
  source_windows: {
    pretable: { runes: beforeRunes.length, words: words(before).length },
    posttable: { runes: afterRunes.length, words: words(after).length }
  },
  direct_vigenere: direct,
  transparent_F: {
    ciphertext_F_offsets: fPositions,
    subtract: transparent.subtract,
    add: transparent.add
  },
  clear_p57_ioc: ioc(corpus.pages[57].indices)
}, null, 2));
