"use strict";

/**
 * Floral tail as a source-visible 300/299-symbol cyclic GP29 key,
 * inverted with the authentically solved p56 plaintext-F bypass.
 *
 * Run Windows 11 Node 22:
 *   node sims/lp2_floral_tail300_ftransparent_original_gate.cjs
 *
 * Eight original p54 red glyphs removed leaves 300 glyphs (ninth red
 * glyph plus all 299 black glyphs); alternatively the first 300 of 308,
 * or its genuinely black-only 299-symbol body. Author-selected use as
 * a key is NOT established. Both original reading and reversal are
 * source-visible as two floral ornaments mirror one another.
 *
 * This avoids fitting arbitrary phases, deciphered English, or a key:
 * as each original C is consumed, enumerate every admissible count
 * of transparent plaintext-F = 0 positions. A consuming branch may
 * NEVER decode to GP F, whereas a nonconsuming branch requires C=F.
 * Entirely empty inverse path sets decisively exclude the fixed key.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const gp = JSON.parse(fs.readFileSync(path.join(__dirname,
  "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const mod = x => (x % 29 + 29) % 29;
const floralFirst = gp.pages.slice(40, 54).flatMap(p => p.indices);
const floralLast = gp.pages.slice(54, 56).flatMap(p => p.indices);
assert.equal(floralFirst.length, 3008);
assert.equal(floralLast.length, 308);
const cipher = floralFirst.slice(8);
assert.equal(cipher.length, 3000);
const native = gp.pages.find(p => p.page === 57).indices;
assert.equal(native.length, 95);

/**
 * Enumerate all F-transparent paths without a language model, beam,
 * guessed phase, or arbitrary plaintext substitutions.
 * @param {number[]} tape
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {{firstImpossible:number|null, states:number[], traces:number}}
 */
function allLegal(tape, key, sign) {
  let states = new Set([0]); // counts of bypassed literal plaintext F
  for (let i = 0; i < tape.length; i++) {
    const next = new Set();
    for (const bypass of states) {
      const consumed = i - bypass;
      const k = key[consumed % key.length];
      const p = mod(tape[i] + sign * k);
      if (p !== 0) next.add(bypass);
      if (tape[i] === 0) next.add(bypass + 1);
    }
    states = next;
    if (!states.size) return {firstImpossible: i, states: [], traces: i + 1};
  }
  return {firstImpossible: null, states: [...states], traces: tape.length};
}

/**
 * Authenticated solved p56 plaintext-F bypass, with otherwise additive
 * GP29 key. sign matches decoder P=C+sign*K.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {-1|1} sign
 */
function encrypt(plain, key, sign) {
  let consumed = 0;
  const cipher = plain.map(p => {
    if (p === 0) return 0;
    const out = mod(p - sign * key[consumed % key.length]);
    consumed++;
    return out;
  });
  return {cipher, consumed};
}

/**
 * Positive-plant decryption with the known plaintext bypass selector
 * checks actual rune recovery, not merely legal-path survival.
 * @param {number[]} tape
 * @param {number[]} originalPlain
 * @param {number[]} key
 * @param {-1|1} sign
 */
function decryptPlanted(tape, originalPlain, key, sign) {
  let consumed = 0;
  const decoded = tape.map((x, i) => {
    if (originalPlain[i] === 0) {
      assert.equal(x, 0);
      return 0;
    }
    const p = mod(x + sign * key[consumed % key.length]);
    assert.notEqual(p, 0);
    consumed++;
    return p;
  });
  assert.deepEqual(decoded, originalPlain);
  return consumed;
}

const sourceKeys = [
  ["p54-first300", floralLast.slice(0, 300)],
  ["p54-last300", floralLast.slice(8, 308)],
  ["p54-black299", floralLast.slice(9)]
];

const records = [];
for (const [name, source] of sourceKeys) {
  for (const [direction, key] of [["forward", source], ["reverse", source.slice().reverse()]]) {
    for (const sign of [-1, 1]) {
      const result = allLegal(cipher, key, sign);
      assert.equal(result.states.length, 0);
      assert.notEqual(result.firstImpossible, null);
      assert(result.firstImpossible < 100,
        "unexpected original legal path after first 100");
      const plant = encrypt(native, key, sign);
      const legalPlant = allLegal(plant.cipher, key, sign);
      assert.equal(legalPlant.firstImpossible, null);
      assert(legalPlant.states.includes(native.length - plant.consumed));
      assert.equal(decryptPlanted(plant.cipher, native, key, sign), plant.consumed);
      records.push({
        key: name, direction, sign, keyLength: key.length,
        firstImpossibleOriginalRune: result.firstImpossible,
        originalLength: cipher.length,
        nativePlantRecovered: native.length,
        nativePlantConsumedKeyRunes: plant.consumed
      });
    }
  }
}


// Reverse floral transfer: each of ten *original* exact 300-rune p40
// body blocks keys the complete 299-rune p54 black body. No optimized
// selection of block, source phase, initial state or F skip.
const lastBlack = floralLast.slice(9);
assert.equal(lastBlack.length, 299);
const reverseTransfers = [];
for (let block = 0; block < 10; block++) {
  const source = cipher.slice(block * 300, (block + 1) * 300);
  assert.equal(source.length, 300);
  for (const [direction, key] of [["forward", source], ["reverse", source.slice().reverse()]]) {
    for (const sign of [-1, 1]) {
      const result = allLegal(lastBlack, key, sign);
      assert.equal(result.states.length, 0);
      assert.notEqual(result.firstImpossible, null);
      assert(result.firstImpossible < 299);
      const plant = encrypt(native, key, sign);
      const legalPlant = allLegal(plant.cipher, key, sign);
      assert.equal(legalPlant.firstImpossible, null);
      assert(legalPlant.states.includes(native.length - plant.consumed));
      assert.equal(decryptPlanted(plant.cipher, native, key, sign), plant.consumed);
      reverseTransfers.push({block, direction, sign,
        firstImpossibleOriginalRune: result.firstImpossible,
        nativePlantRecovered: native.length});
    }
  }
}
assert.equal(reverseTransfers.length, 40);
const latestDeath = reverseTransfers.reduce((a, b) =>
  Math.max(a, b.firstImpossibleOriginalRune), 0);
assert.equal(latestDeath, 206);

console.log(JSON.stringify({
  originalRedHeadingLengths: [8, 9],
  chapterLengths: [floralFirst.length, floralLast.length],
  originalBlackLengths: [cipher.length, floralLast.length - 9],
  attemptedSource: "p54 page text as shared cyclic key for p40 3000-rune black body",
  exactTransparentRule: "P=F prints F and consumes no key; all non-F consume",
  cases: records,
  reverseTransfer: {candidateCount: reverseTransfers.length,
    source: "ten independent 300-rune p40 body blocks as key for complete p54 299-rune black body",
    latestFirstImpossibleOriginalRune: latestDeath,
    cases: reverseTransfers},
  verdict: "All twelve p54-to-p40 and forty p40-to-p54 source-visible signed/reversed cyclic keys are exactly impossible under the authentic p56 plaintext-F transparency. No plaintext recovered."
}, null, 2));
