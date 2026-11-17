"use strict";

/**
 * Exact p0–2 red-headings → 156-word prime-sum pointer → 23-cycle GP29
 * source key → original terminal p55. The output itself is the decision.
 * SFT: node sims/lp2_wordmap23_cycle_p55_native_inverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const root = path.resolve(__dirname, "..");
/** @param {string} pathName */
const read = pathName => fs.readFileSync(path.join(root, pathName), "utf8");
const source = read("resources/lp2-transcription.txt");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parsed = parseLP2Words(source, 3);
const words = parsed.words;
assert.equal(words.length, 158);
assert.equal(parsed.runeCount, 729);
/** @param {{runes:string}} word */
const gpSum = word => [...word.runes].reduce((sum, r) => sum + corpus.prime[runeIndex.get(r)], 0);
const sums = words.slice(2).map(gpSum);
const heading = words.slice(0, 2).map(gpSum);
assert.deepEqual(heading, [347, 315]);
assert.equal(sums.length, 156);
const next = sums.map(value => value % 156);
/**
 * @param {number} start
 * @returns {{before:number[],cycle:number[]}}
 */
function orbit(start) {
  const seen = new Map();
  const list = [];
  let at = start;
  while (!seen.has(at)) {
    seen.set(at, list.length);
    list.push(at);
    at = next[at];
  }
  const split = seen.get(at);
  return { before: list.slice(0, split), cycle: list.slice(split) };
}
const a = orbit(heading[0] % 156);
const b = orbit(heading[1] % 156);
assert.deepEqual(a.before.map(i => i + 1), [36, 56, 113]);
assert.equal(a.cycle.length, 23);
assert.equal(b.before.length, 0);
assert.equal(new Set(a.cycle).size, 23);
const originalCycleSums = a.cycle.map(i => sums[i]);
assert.deepEqual(originalCycleSums,
  [220,111,34,336,119,3,563,170,67,209,463,108,244,569,128,237,323,618,277,419,139,143,473]);
const secondStart = a.cycle.indexOf(b.cycle[0]);
assert.equal(secondStart, 6);
const target = corpus.pages.find(p => p.page === 55).indices;
assert.equal(target.length, 76);
const originalF = target.reduce((a, i) => a + (i === 0), 0);
assert.equal(originalF, 3);
/**
 * The historically demonstrated p56 plaintext-F passthrough: P=F must
 * emit C=F without consuming K, while non-F plaintext consumes one symbol.
 * Ciphertext F might instead be encryption of a non-F plaintext rune.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {1|-1} sign Inverse direction: -1 decrypt with subtraction.
 * @returns {{processed:number,solutions:{consumed:number,plain:number[]}[]}}
 */
function decodeAll(cipher, key, sign) {
  // Keep each concrete F-bypass history. A Map keyed only by consumed count
  // silently collapses distinct plaintexts and can drop the planted answer.
  let states = [{ consumed: 0, plain: [] }];
  for (let offset = 0; offset < cipher.length; offset++) {
    const c = cipher[offset];
    const later = [];
    for (const { consumed, plain } of states) {
      if (c === 0) later.push({ consumed, plain: [...plain, 0] });
      const p = ((c + sign * key[consumed % key.length]) % 29 + 29) % 29;
      if (p !== 0) later.push({ consumed: consumed + 1, plain: [...plain, p] });
    }
    if (!later.length) return { processed: offset, solutions: [] };
    states = later;
  }
  return { processed: cipher.length, solutions: states };
}
/**
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {1|-1} sign Inverse direction to be tested.
 * @returns {number[]}
 */
function encrypt(plaintext, key, sign) {
  let used = 0;
  return plaintext.map(p => {
    if (p === 0) return 0;
    const out = ((p - sign * key[used % key.length]) % 29 + 29) % 29;
    used++;
    return out;
  });
}
/** @param {number[]} values */
const ioc = values => {
  const counts = new Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (values.length * (values.length - 1));
};
const known = corpus.pages.find(p => p.page === 57).indices;
assert.equal(known.length, 95);
const knownPlain = known.slice(0, 76);

const outcomes = [];
for (const [startName, shift] of [["firstRedHeading", 0], ["secondRedHeading", secondStart]]) {
  const rotated = originalCycleSums.slice(shift).concat(originalCycleSums.slice(0, shift));
  const key = rotated.map(v => v % 29);
  for (const sign of /** @type {const} */ ([-1, 1])) {
    const direct = target.map((c, i) => ((c + sign * key[i % key.length]) % 29 + 29) % 29);
    const decoded = decodeAll(target, key, sign);
    const plantedCipher = encrypt(knownPlain, key, sign);
    const plant = decodeAll(plantedCipher, key, sign);
    assert.equal(plant.processed, 76);
    assert.ok(plant.solutions.some(sol => sol.plain.every((v, i) => v === knownPlain[i])));
    for (const sol of decoded.solutions) {
      assert.deepEqual(encrypt(sol.plain, key, sign), target);
    }
    const result = {
      heading: startName,
      inverseSign: sign,
      firstContradictionOffset: decoded.processed < 76 ? decoded.processed : null,
      legalFullInverseCount: decoded.solutions.length,
      directGP29IoC: ioc(direct),
      legalPlainIoC: decoded.solutions.length ? ioc(decoded.solutions[0].plain) : null,
      legalKeyConsumed: decoded.solutions.length ? decoded.solutions[0].consumed : null,
      legalPlainRuneTokens: decoded.solutions.length ?
        decoded.solutions[0].plain.map(i => corpus.translit[i]).join(" ") : null,
      syntheticKnownP57Recovered: true,
    };
    outcomes.push(result);
  }
}
assert.deepEqual(outcomes.map(o => o.firstContradictionOffset), [null, 6, 1, 6]);
assert.deepEqual(outcomes.map(o => o.legalFullInverseCount), [2, 0, 0, 0]);
assert.equal(outcomes[0].legalKeyConsumed, 74);
assert.equal(outcomes[0].legalPlainIoC, 0.034736842105263156);

// Independent original p32 11x11 image-coordinate link to the two 563/569
// cycle values: image dimensions are prime sums of its first row and column.
// Two conventional zero/one-based conversions of each cycle sum into a
// 121-cell address return a source-determined 23-rune key, still with no
// language-fitted phase or secret lookup alphabet.
const p32 = corpus.pages.find(page => page.page === 32).indices;
assert.equal(p32.length, 121);
const primes32 = p32.map(index => corpus.prime[index]);
assert.equal(primes32.slice(0, 11).reduce((sum, p) => sum + p, 0), 563);
assert.equal(primes32.filter((_, i) => i % 11 === 0).reduce((sum, p) => sum + p, 0), 569);
assert.equal(originalCycleSums[6], 563);
assert.equal(originalCycleSums[13], 569);
const gridDecisions = [];
for (const [indexing, offset] of /** @type {const} */ ([["zeroBased", 0], ["oneBased", 1]])) {
  const key = originalCycleSums.map(sum => p32[(sum - offset + 121) % 121]);
  for (const [startName, shift] of [["firstRedHeading", 0], ["secondRedHeading", secondStart]]) {
    const rotated = key.slice(shift).concat(key.slice(0, shift));
    for (const sign of /** @type {const} */ ([-1, 1])) {
      const result = decodeAll(target, rotated, sign);
      const plant = decodeAll(encrypt(knownPlain, rotated, sign), rotated, sign);
      assert.ok(plant.solutions.some(item => item.plain.every((v, i) => v === knownPlain[i])));
      for (const item of result.solutions) {
        assert.deepEqual(encrypt(item.plain, rotated, sign), target);
      }
      gridDecisions.push({
        indexing,
        heading: startName,
        inverseSign: sign,
        processedBeforeContradiction: result.processed,
        legalFullInverseCount: result.solutions.length,
        legalPlainIoC: result.solutions.length ? ioc(result.solutions[0].plain) : null,
        legalPlainRuneTokens: result.solutions.length ?
          result.solutions[0].plain.map(i => corpus.translit[i]).join(" ") : null,
        syntheticKnownP57Recovered: true,
      });
    }
  }
}
assert.deepEqual(gridDecisions.map(item => item.processedBeforeContradiction),
  [37,67,65,0,56,76,10,24]);
assert.deepEqual(gridDecisions.map(item => item.legalFullInverseCount),
  [0,0,0,0,0,3,0,0]);

console.log(JSON.stringify({
  model: "original red-heading seeded p0–2 23-word prime-sum cycle / 23-period GP key, natural GP29 signs and p56 transparent-F",
  originalSource: { openingRunes: 729, openingWords: 158,
    bodyWordMap: 156, secondSeedCycleRotation: secondStart, targetPage: 55, targetRunes: 76 },
  decisions: outcomes,
  p32PrimeSumIndexGridDecisions: gridDecisions,
  caveat: "23-cycle is a provisional source selector. No original output is readable GP prose; source does not explicitly select p55 as the key receiver.",
}, null, 2));
