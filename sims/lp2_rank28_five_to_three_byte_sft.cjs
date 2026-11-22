"use strict";
/**
 * Keyless 28-choice self-avoiding rune stream to three-byte records.
 * A base28 five-digit integer fits in 24 bits iff it is < 2**24.
 * Repro: node sims/lp2_rank28_five_to_three_byte_sft.cjs
 * Input: frozen original LP2 physical p0..55 source rune indices.
 *
 * @module lp2_rank28_five_to_three_byte_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const SOURCE = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const original = SOURCE.pages.filter(p => p.page <= 55 && p.runic_count);
const LIMIT = 2 ** 24;
const BASE28_FIVE = 28 ** 5;
assert.equal(BASE28_FIVE, 17210368);
assert.equal(LIMIT, 16777216);
assert.equal(original.length, 55);
assert.equal(original.reduce((n, p) => n + p.indices.length, 0), 12956);

/**
 * @param {number} preceding Previous cipher rune, 0..28.
 * @param {number} current Current cipher rune, distinct from preceding.
 * @param {"cyclic"|"sorted"} mode 28-way rank convention.
 * @returns {number}
 */
function rank(preceding, current, mode) {
  assert(current !== preceding);
  return mode === "cyclic"
    ? ((current - preceding + 29) % 29) - 1
    : current - Number(current > preceding);
}

/**
 * @param {number[][]} pages Original-shaped GP ciphertext pages.
 * @param {"cyclic"|"sorted"} mode
 * @param {boolean} pageReset Each printed page supplies its own first-rune seed.
 * @returns {number[]}
 */
function ranks(pages, mode, pageReset) {
  const result = [];
  let prev = 0;
  for (const page of pages) {
    if (pageReset) prev = null;
    for (const c of page) {
      if (prev === null) {
        prev = c;
        continue;
      }
      if (c !== prev) result.push(rank(prev, c, mode));
      prev = c;
    }
  }
  return result;
}

/**
 * Reads five radix28 ranks as a 24-bit unsigned integer, fixed leading-zero
 * representation. Overflow is a mechanical rejection, never silently wrapped.
 * @param {number[]} input
 * @param {number} phase 0..4
 * @param {boolean} reverseDigits
 * @returns {{groups:number,overflow:number,printableRate:number,firstHex:string}}
 */
function pack(input, phase, reverseDigits) {
  let groups = 0, overflow = 0, printable = 0, nByte = 0;
  const first = [];
  for (let i = phase; i + 5 <= input.length; i += 5) {
    let v = 0;
    for (let j = 0; j < 5; j++)
      v = v * 28 + input[i + (reverseDigits ? 4 - j : j)];
    groups++;
    if (v >= LIMIT) {
      overflow++;
      continue;
    }
    for (let shift = 16; shift >= 0; shift -= 8) {
      const byte = (v >>> shift) & 255;
      printable += Number(byte >= 32 && byte <= 126);
      nByte++;
      if (first.length < 12) first.push(byte);
    }
  }
  return {
    groups, overflow,
    printableRate:printable / nByte,
    firstHex:Buffer.from(first).toString("hex")
  };
}

/** @param {number} v @returns {number[]} */
function fiveDigits(v) {
  assert(Number.isInteger(v) && v >= 0 && v < LIMIT);
  const out = Array(5).fill(0);
  for (let i = 4; i >= 0; i--) {
    out[i] = v % 28;
    v = Math.floor(v / 28);
  }
  return out;
}

/**
 * Complete known-source byte plant. GP cipher stream is synthesized by the
 * independently specified 28-choice rank encoder and fully recovered.
 * @param {"cyclic"|"sorted"} mode
 * @returns {number}
 */
function nativePlant(mode) {
  const phrase = "LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE";
  const plaintext = Buffer.from(phrase.slice(0, 93), "ascii");
  assert.equal(plaintext.length, 93);
  const digits = [];
  for (let i = 0; i < plaintext.length; i += 3) {
    const v = plaintext[i] * 65536 + plaintext[i+1] * 256 + plaintext[i+2];
    digits.push(...fiveDigits(v));
  }
  const c = [], seed = 0;
  let prev = seed;
  for (const digit of digits) {
    const current = mode === "cyclic"
      ? (prev + digit + 1) % 29
      : digit + Number(digit >= prev);
    assert(current !== prev);
    c.push(current);
    prev = current;
  }
  const reranked = ranks([c], mode, false);
  assert.deepEqual(reranked, digits);
  const recovered = [];
  for (let i = 0; i < reranked.length; i += 5) {
    const block = pack(reranked.slice(i, i+5), 0, false);
    assert.equal(block.overflow, 0);
    assert.equal(block.groups, 1);
    recovered.push(...Buffer.from(block.firstHex,"hex"));
  }
  assert.deepEqual(Buffer.from(recovered), plaintext);
  return recovered.length;
}


/**
 * Verify exact reconstruction of the original GP ciphertext from rank
 * digits plus the positions of its literal repeat markers.
 * @param {number[][]} pages
 * @param {"cyclic"|"sorted"} mode
 * @param {boolean} pageReset
 * @returns {number}
 */
function replay(pages, mode, pageReset) {
  let prev = 0, checked = 0;
  for (const page of pages) {
    if (pageReset) prev = null;
    for (const originalRune of page) {
      if (prev === null) {
        prev = originalRune;
        checked++;
        continue;
      }
      if (originalRune !== prev) {
        const digit = rank(prev, originalRune, mode);
        const ciphertext = mode === "cyclic"
          ? (prev + digit + 1) % 29
          : digit + Number(digit >= prev);
        assert.equal(ciphertext, originalRune);
      }
      prev = originalRune;
      checked++;
    }
  }
  assert.equal(checked, 12956);
  return checked;
}

function run() {
  const pages = original.map(p => p.indices);
  const sourceDoublets = pages.reduce((n, p) =>
    n + p.slice(1).filter((c, j) => c === p[j]).length, 0);
  assert.equal(sourceDoublets, 86);

  const tests = [];
  for (const mode of ["cyclic", "sorted"]) {
    assert.equal(nativePlant(mode), 93);
    for (const pageReset of [false, true]) {
      assert.equal(replay(pages, mode, pageReset), 12956);
      const stream = ranks(pages, mode, pageReset);
      assert.equal(stream.length, pageReset ? 12815 : 12870);
      for (let phase = 0; phase < 5; phase++) {
        for (const reversed of [false, true]) {
          tests.push({
            mode, pageReset, phase, reverseDigits:reversed,
            ...pack(stream, phase, reversed)
          });
        }
      }
    }
  }
  assert.equal(tests.length, 40);
  assert(tests.every(t => t.overflow > 0));
  const primary = tests.find(t =>
    t.mode === "cyclic" && !t.pageReset &&
    t.phase === 0 && !t.reverseDigits);
  assert.equal(primary.groups, 2574);
  assert.equal(primary.overflow, 54);
  assert.equal(tests.reduce((n, t) => Math.min(n, t.overflow), Infinity), 50);
  const summary = {
    status:"literal five-base28-digit to three-byte source route excluded",
    original:{runes:12956,immediateRepeats:sourceDoublets,pages:55},
    contract:{records:5,base:28,bytes:3,largestValid:LIMIT-1,
      numericRange:BASE28_FIVE,
      uniformOverflowProbability:(BASE28_FIVE-LIMIT)/BASE28_FIVE},
    positivePlant:{binaryBytes:93,recovered:93,bothRankEncoders:true},
    primary,
    allModels:{tested:tests.length,minOverflow:Math.min(...tests.map(t=>t.overflow)),
      maxOverflow:Math.max(...tests.map(t=>t.overflow)),
      printableMin:Math.min(...tests.map(t=>t.printableRate)),
      printableMax:Math.max(...tests.map(t=>t.printableRate))},
    models:tests
  };
  console.log(JSON.stringify(summary,null,2));
  return summary;
}
if (require.main === module) run();
module.exports = {rank,ranks,pack,fiveDigits,nativePlant,replay,run};
