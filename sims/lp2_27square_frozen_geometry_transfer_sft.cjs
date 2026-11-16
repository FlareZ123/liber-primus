'use strict';

/**
 * Read-only SFT for the 2026 public 27x27 GP29 map proposal's first
 * two geometric operations and a frozen, unaided third-step continuation.
 * No unreported search, editable ciphertext, or dictionary tuning.
 * Runs with Node.js 22 from the repository root:
 *   node sims/lp2_27square_frozen_geometry_transfer_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

/** @param {number} n @returns {number|null} */
function phi(n) {
  if (!Number.isInteger(n) || n < 1) return null;
  let remainder = n;
  let value = n;
  for (let divisor = 2; divisor * divisor <= remainder; divisor++) {
    if (remainder % divisor === 0) {
      value -= Math.floor(value / divisor);
      while (remainder % divisor === 0) remainder /= divisor;
    }
  }
  if (remainder > 1) value -= Math.floor(value / remainder);
  return value;
}

/** @param {number} n @returns {number|null} */
function mu(n) {
  if (!Number.isInteger(n) || n < 1) return null;
  let remainder = n;
  let sign = 1;
  for (let divisor = 2; divisor * divisor <= remainder; divisor++) {
    if (remainder % divisor === 0) {
      sign = -sign;
      remainder /= divisor;
      if (remainder % divisor === 0) return 0;
    }
  }
  return remainder > 1 ? -sign : sign;
}

/**
 * @param {number[]} tape
 * @param {number} sourceStart Original three-symbol key-node start, row-major.
 * @param {number} shift Position offset from sourceStart to ciphertext start.
 * @param {number} count Number of ciphertext runes to decode.
 * @returns {{node:number[], key:number[],phase:number, target:number, plaintext:number[]}|null}
 */
function decode(tape, sourceStart, shift, count) {
  const node = tape.slice(sourceStart, sourceStart + 3);
  if (node.length !== 3 || node.some((x) => x === 0)) return null;
  const middle = phi(node[1]);
  assert.notEqual(middle, null);
  const key = [node[0], middle, node[2]];
  const signature = key.map((k) => mu(phi(k)));
  const phase = ((signature.reduce((sum, x) => sum + x, 0) % 3) + 3) % 3;
  const aligned = key.slice(phase).concat(key.slice(0, phase));
  const target = sourceStart + shift;
  if (target < 0 || target + count > tape.length) return null;
  const plaintext = tape.slice(target, target + count).map(
    (c, i) => (c - aligned[i % 3] + 29) % 29
  );
  assert.deepEqual(
    plaintext.map((p, i) => (p + aligned[i % 3]) % 29),
    tape.slice(target, target + count)
  );
  return { node, key: aligned, phase, target, plaintext };
}

/** @param {number[]} a @returns {string} */
function labels(a) { return a.map((x) => corpus.translit[x]).join('-'); }

/**
 * Freeze 2026 author's published 7- and 5-rune key-node origin convention,
 * then extend the same endpoint-node/phi-center recipe one step unaided.
 * @param {number[]} tape A complete 729-rune source prefix.
 */
function trace(tape) {
  assert.equal(tape.length, 729);
  const initialKeyStart = 12 * 27 + 10; // row13, col11
  const center = tape[initialKeyStart + 1];
  if (!center) return null;
  const d1 = phi(center) + phi(phi(center));
  const first = decode(tape, initialKeyStart, d1, 7);
  if (!first) return null;
  const secondKeyStart = first.target + 6; // last of first ciphertext
  const secondCenter = tape[secondKeyStart + 1];
  const second = secondCenter
    ? decode(tape, secondKeyStart, phi(secondCenter), 5)
    : null;
  const thirdKeyStart = second ? second.target + 4 : -1;
  const thirdCenter = second ? tape[thirdKeyStart + 1] : 0;
  const third = thirdCenter
    ? decode(tape, thirdKeyStart, phi(thirdCenter), 7)
    : null;
  return { first, second, third };
}

function main() {
  const endings = [2, 7, 14, 22, 27, 32, 39, 53, 55];
  const starts = [0, 3, 8, 15, 23, 28, 33, 40, 54];
  const totals = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
  assert.equal(corpus.pages.filter((p) => p.page < 56).reduce(
    (total, p) => total + p.indices.length, 0
  ), 12956);

  for (let index = 0; index < endings.length; index++) {
    const tape = corpus.pages.filter(
      (p) => p.page >= starts[index] && p.page <= endings[index]
    ).flatMap((p) => p.indices);
    assert.equal(tape.length, totals[index]);
    if (tape.length < 729) continue;
    const result = trace(tape.slice(0, 729));
    if (!result) { console.log(`p${starts[index]}-${endings[index]}: unavailable center`); continue; }
    const phrases = [result.first, result.second, result.third].map(
      (x) => x ? labels(x.plaintext) : 'NO-VALID-NODE'
    );
    console.log(`p${starts[index]}-${endings[index]}: ${phrases.join(' | ')}`);
    if (index === 0) {
      assert.equal(labels(result.first.node), 'AE-J-EA');
      assert.equal(labels(result.first.key), 'AE-I-EA');
      assert.equal(result.first.target, 348);
      assert.equal(labels(result.first.plaintext), 'A-S-I-G-O-TH-E');
      assert.equal(labels(result.second.node), 'X-OE-X');
      assert.equal(labels(result.second.key), 'X-X-I');
      assert.equal(result.second.target, 364);
      assert.equal(labels(result.second.plaintext), 'W-EA-TH-E-R');
      assert.equal(labels(result.third.node), 'E-A-G');
      assert.equal(labels(result.third.key), 'E-H-G');
      assert.equal(result.third.target, 376);
      assert.equal(labels(result.third.plaintext), 'A-T-T-P-AE-S-W');
    }
  }
  console.log('All original arithmetic, first chapter, and seven other 729-rune source-prefix controls passed.');
}
main();
