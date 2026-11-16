"use strict";

/**
 * Reproduce the 2 July 2014 p54 red-title / modcipher crib check.
 * Run from the repository root:
 *   node sims/lp2_p54_2014_modcipher_beginning_crib_sft.cjs
 *
 * The 2014 decoder has IA/IO and NG/ING aliases. This tests the stored
 * constant-modulus-shift proposal for all three eight-rune candidate words.
 * It does not decrypt p54 or test the separate p56 red-title key schedule.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const oldScript = read("resources/external/2014-irc-shared/anoniem4l-modcracker-M5BccDpT.py");
const sections = transcription.split(/^%$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const numbers = text => [...text].flatMap(char =>
  runeIndex.has(char) ? [runeIndex.get(char)] : []
);
const nthPrime = ordinal => {
  let count = 0;
  let candidate = 1;
  while (count < ordinal) {
    candidate++;
    let prime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) { prime = false; break; }
    }
    if (prime) count++;
  }
  return candidate;
};
const aliases = new Map([["IO", "IA"], ["ING", "NG"]]);
const tokenize = word => {
  const options = [...corpus.translit, ...aliases.keys()].sort((a, b) => b.length - a.length);
  const out = [];
  let rest = word;
  while (rest.length) {
    const spelling = options.find(candidate => rest.startsWith(candidate));
    if (!spelling) throw new Error("No GP29 token for suffix: " + rest);
    out.push(aliases.get(spelling) || spelling);
    rest = rest.slice(spelling.length);
  }
  return out;
};
const primeValues = symbols =>
  symbols.map(symbol => nthPrime(corpus.translit.indexOf(symbol) + 1));

const p54Section = sections[53]; // physical p54; rune-free physical p50 omitted
const firstLine = p54Section.split(/\r?\n/).map(numbers).find(line => line.length);
assert(firstLine);
const titleSymbols = firstLine.map(index => corpus.translit[index]);
assert.deepEqual(titleSymbols, ["A", "M", "NG", "D", "IA", "TH", "X", "I", "M"]);
const cipherWord = titleSymbols.slice(1);
assert.equal(cipherWord.length, 8);
const cipherPrimeValues = primeValues(cipherWord);
assert.deepEqual(cipherPrimeValues, [71, 79, 89, 107, 5, 47, 31, 71]);

const ourMatch = oldScript.match(/our\s*=\s*\[([^\]]+)\]/);
const wantMatch = oldScript.match(/want\s*=\s*\[([^\]]+)\]/);
assert(ourMatch && wantMatch);
const parseArray = text => text.split(",").map(value => Number(value.trim()));
const originalOur = parseArray(ourMatch[1]);
const originalWant = parseArray(wantMatch[1]);
assert.deepEqual(originalOur, cipherPrimeValues);
assert.deepEqual(originalWant, [89, 31, 11, 63, 13, 59, 107, 29]);

const candidateWords = ["DIRECTION", "DECEPTION", "BEGINNING"];
const candidates = Object.fromEntries(candidateWords.map(word => {
  const symbols = tokenize(word);
  return [word, {
    symbols,
    runeCount: symbols.length,
    primeValues: primeValues(symbols)
  }];
}));
assert.deepEqual(candidates.DIRECTION.symbols, ["D", "I", "R", "E", "C", "T", "IA", "N"]);
assert.deepEqual(candidates.DECEPTION.symbols, ["D", "E", "C", "E", "P", "T", "IA", "N"]);
assert.deepEqual(candidates.BEGINNING.symbols, ["B", "E", "G", "I", "N", "N", "I", "NG"]);
for (const candidate of Object.values(candidates)) assert.equal(candidate.runeCount, 8);
assert.deepEqual(candidates.DIRECTION.primeValues, [89, 31, 11, 67, 13, 59, 107, 29]);
assert.deepEqual(candidates.DECEPTION.primeValues, [89, 67, 13, 67, 43, 59, 107, 29]);
assert.deepEqual(candidates.BEGINNING.primeValues, [61, 67, 17, 31, 29, 29, 31, 79]);

function commonDifferenceMatches(target, cipher, maxModulus = 330) {
  assert.equal(target.length, cipher.length);
  const matches = [];
  const nearest = [];
  for (let modulus = 1; modulus <= maxModulus; modulus++) {
    const differences = cipher.map((value, index) =>
      target[index] - (value % modulus)
    );
    const distinct = new Set(differences).size;
    const spread = Math.max(...differences) - Math.min(...differences);
    if (distinct === 1) matches.push({ modulus, shift: differences[0] });
    nearest.push({ modulus, distinct, spread });
  }
  nearest.sort((a, b) => a.distinct - b.distinct || a.spread - b.spread);
  return { matches, closest: nearest.slice(0, 8) };
}
const tests = Object.fromEntries(candidateWords.map(word => [
  word,
  commonDifferenceMatches(candidates[word].primeValues, cipherPrimeValues)
]));
for (const word of candidateWords) assert.deepEqual(tests[word].matches, []);

const storedDirectionDelta = originalWant.map((value, i) =>
  value - candidates.DIRECTION.primeValues[i]
);
assert.deepEqual(storedDirectionDelta, [0, 0, 0, -4, 0, 0, 0, 0]);

console.log(JSON.stringify({
  original_p54_first_line: titleSymbols,
  ciphertext_word: cipherWord,
  ciphertext_prime_values: cipherPrimeValues,
  candidates,
  original_modcracker_arrays: { our: originalOur, want: originalWant },
  stored_direction_target_delta_from_canonical: storedDirectionDelta,
  corrected_constant_modulus_tests: tests,
  decision: "All three candidate words fit eight GP29 runes under IA/IO and NG/ING aliases; none matches the historical constant-modulus-shift model for m=1..330. No plaintext recovered."
}, null, 2));
