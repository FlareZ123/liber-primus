"use strict";

/**
 * Original LP2 key-independent three- and four-rune block-bijection gate.
 *
 * Any deterministic bijection over k-rune blocks preserves equality of
 * complete blocks inside one page. The gate even permits independently
 * secret bijections and independently selected block phase per page.
 *
 * SFT: node sims/lp2_pageprivate_kblock_allsecret_sft.cjs
 * Node.js 22 CommonJS, standard libraries only. Read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length > 0);
const lengths = pages.map(p => p.indices.length);
const original = pages.flatMap(p => p.indices);

assert.equal(pages.length, 55);
assert.equal(original.length, 12956);
assert.equal(lengths.reduce((a, b) => a + b, 0), original.length);
assert.deepEqual(original.slice(0, 8), [15, 8, 18, 3, 6, 19, 27, 0]);

const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/**
 * Greedy canonical GP conversion with the independently source-attested
 * single-rune ING and IO spellings from solved original LP1 and LP2 p57.
 *
 * @param {string} text
 * @returns {number[]}
 */
function sourceNativeGP(text) {
  const clean = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        result.push(21);
        i += 3;
      } else if (word.startsWith("IO", i)) {
        result.push(27);
        i += 2;
      } else {
        const token = tokens.find(t => word.startsWith(t.s, i));
        assert(token, "unmapped source word: " + word);
        result.push(token.i);
        i += token.s.length;
      }
    }
  }
  return result;
}

/**
 * Number of identical unordered pairs of nonoverlapping aligned block types.
 * Every arbitrary bijection F maps x=y iff F(x)=F(y), regardless of its key.
 *
 * @param {number[]} page
 * @param {number} k
 * @param {number} phase
 * @returns {number}
 */
function collisionPairs(page, k, phase) {
  const seen = new Map();
  let collisions = 0;
  for (let i = phase; i + k <= page.length; i += k) {
    const word = page.slice(i, i + k).join(",");
    const count = seen.get(word) || 0;
    collisions += count;
    seen.set(word, count + 1);
  }
  return collisions;
}

/**
 * Permit all k independent page-local block starts. Lower and upper bounds
 * remain valid even if an adversary selects every page phase after reading
 * the original ciphertext.
 *
 * @param {number[]} sequence
 * @param {number} k
 * @returns {{minimum:number,maximum:number,phaseZero:number}}
 */
function blockEnvelope(sequence, k) {
  assert.equal(sequence.length, original.length);
  let offset = 0;
  let minimum = 0;
  let maximum = 0;
  let phaseZero = 0;
  for (const len of lengths) {
    const page = sequence.slice(offset, offset + len);
    const byPhase = [];
    for (let phase = 0; phase < k; phase++) {
      byPhase.push(collisionPairs(page, k, phase));
    }
    minimum += Math.min(...byPhase);
    maximum += Math.max(...byPhase);
    phaseZero += byPhase[0];
    offset += len;
  }
  assert.equal(offset, sequence.length);
  return {minimum, maximum, phaseZero};
}

/**
 * Encrypt every complete block with independent page and slot affine keys.
 * This is only an implementation plant of a subset of arbitrary k-block
 * bijections. Untouched remainder symbols stay unchanged and are excluded
 * from collision counting.
 *
 * @param {number[]} plaintext
 * @param {number} k
 * @returns {{cipher:number[],restored:number[]}}
 */
function pagePrivateAffinePlant(plaintext, k) {
  const cipher = plaintext.slice();
  const restored = plaintext.slice();
  let offset = 0;
  for (let pageIndex = 0; pageIndex < lengths.length; pageIndex++) {
    const len = lengths[pageIndex];
    const a = 1 + ((7 * pageIndex + 3 * k) % 28);
    const inverse = Array.from({length:28}, (_,i) => i + 1)
      .find(x => (x * a) % 29 === 1);
    assert(inverse);
    for (let i = 0; i + k <= len; i += k) {
      for (let j = 0; j < k; j++) {
        const at = offset + i + j;
        const b = (11 * pageIndex + 5 * j + k) % 29;
        cipher[at] = (a * plaintext[at] + b) % 29;
        restored[at] = (inverse * ((cipher[at] - b + 29) % 29)) % 29;
      }
    }
    offset += len;
  }
  return {cipher, restored};
}

const literary = [
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 33],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 133]
].map(([name, file, expectedWindows]) => {
  const runes = sourceNativeGP(read(file));
  assert(runes.length >= original.length);
  return {name, runes, expectedWindows};
});

/** @type {Record<string, number>} */
const expected = {
  "3:Gibran": 226, "3:Shakespeare": 108,
  "4:Gibran": 40, "4:Shakespeare": 11
};

for (const k of [3, 4]) {
  const observed = blockEnvelope(original, k);
  assert.deepEqual(observed, k === 3
    ? {minimum: 0, maximum: 17, phaseZero: 4}
    : {minimum: 0, maximum: 0, phaseZero: 0});
  for (const {name, runes, expectedWindows} of literary) {
    const windows = [];
    for (let start = 0; start + original.length <= runes.length; start += 1536) {
      windows.push(blockEnvelope(runes.slice(start, start + original.length), k));
    }
    assert.equal(windows.length, expectedWindows);
    const smallest = Math.min(...windows.map(w => w.minimum));
    assert.equal(smallest, expected[String(k) + ":" + name]);
    assert(observed.maximum < smallest,
      "an all-secret k-block family unexpectedly overlaps the control");
    const plaintext = runes.slice(0, original.length);
    const plant = pagePrivateAffinePlant(plaintext, k);
    assert.deepEqual(plant.restored, plaintext);
    assert.equal(blockEnvelope(plaintext, k).phaseZero,
      blockEnvelope(plant.cipher, k).phaseZero);
    console.log(JSON.stringify({
      k, nativeSource: name, windows: windows.length,
      originalMaximumAllPhases: observed.maximum,
      nativeMinimumAllPhases: smallest,
      nativeMedianMinimum: windows.map(w => w.minimum)
        .sort((a, b) => a - b)[Math.floor(windows.length / 2)],
      plantLength: plant.restored.length,
      plantExact: true
    }));
  }
}

// Source-authentic independently solved LP2 p57 rather than simulated prose.
const p57 = gp.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
const p57Words = "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE";
assert(sourceNativeGP(p57Words).every((v, i) => p57[i] === v),
  "original source-authentic PARABLE prefix");
console.log("Original 12956 source runes and first 37 runes of solved p57 verified.");
