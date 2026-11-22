'use strict';

/**
 * Original LP2 p49/p51 dual-flank test for the literal 32-input x 8-state
 * byte-packed Mealy receiver. Uses no fitted keys or unknown plaintext.
 *
 * Windows 11: node sims/lp2_p49_p51_32x8_bitpacked_direct_mealy_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8'));
const corpus = read('lp2-corpus.json');
const grid = read('base60-grid.json');

assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((r) => r.length === 8));
assert.equal(grid.byte_rows.length, 32);
assert.equal(corpus.pages.find((p) => p.page === 50).indices.length, 0);
assert.equal(corpus.pages.find((p) => p.page === 49).indices.length, 66);
assert.equal(corpus.pages.find((p) => p.page === 51).indices.length, 92);
assert.equal(corpus.pages.find((p) => p.page === 57).indices.length, 95);

const raw = Buffer.from(grid.byte_rows.flat());
assert.equal(crypto.createHash('sha256').update(raw).digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

const duplicates = grid.rows[0].map((_, col) => {
  /** @type {Map<string, number>} */
  const seen = new Map();
  /** @type {Array<[number, number, string]>} */
  const hits = [];
  for (let r = 0; r < 29; r++) {
    const token = grid.rows[r][col];
    if (seen.has(token)) hits.push([seen.get(token), r, token]);
    else seen.set(token, r);
  }
  return hits;
});
assert.deepEqual(duplicates, [
  [[8, 13, '22'], [10, 27, '2M']],
  [],
  [[4, 14, '3H'], [15, 16, '1Q']],
  [[15, 21, '0s'], [6, 27, '0x']],
  [[4, 14, '0s'], [22, 28, '2O']],
  [[6, 14, '2p']],
  [[12, 13, '0W']],
  [[19, 20, '48']],
]);

/** @param {number} radix */
function sourceTable(radix) {
  const alphabet = radix === 59 ? grid.alphabet.replace('f', '') : grid.alphabet;
  assert.equal(alphabet.length, radix);
  return grid.rows.map((r) => r.map((token) => {
    const a = alphabet.indexOf(token[0]);
    const b = alphabet.indexOf(token[1]);
    assert.ok(a >= 0 && b >= 0);
    const value = radix * a + b;
    assert.ok(value >= 0 && value <= 255);
    return value;
  }));
}

/**
 * Full byte is [next3 | output5] (low5) or [output5 | next3] (high5).
 * Input is the observed original GP29 glyph row, state is the column.
 *
 * @param {number[][]} T 32x8 byte table
 * @param {number[]} input GP29 indices, already in selected reading direction
 * @param {number} seed 0..7
 * @param {'low5' | 'high5'} split
 * @returns {{out:number[], invalid:number, firstInvalid:number}}
 */
function decode(T, input, seed, split) {
  let s = seed;
  const out = [];
  let firstInvalid = -1;
  let invalid = 0;
  for (let i = 0; i < input.length; i++) {
    const byte = T[input[i]][s];
    const p = split === 'low5' ? (byte & 31) : (byte >>> 3);
    s = split === 'low5' ? (byte >>> 5) : (byte & 7);
    out.push(p);
    if (p >= 29) {
      invalid++;
      if (firstInvalid === -1) firstInvalid = i;
    }
  }
  return { out, invalid, firstInvalid };
}

const expectedMin = {
  '60-low5-forward': [0, 5],
  '60-low5-reverse': [4, 6],
  '60-high5-forward': [5, 10],
  '60-high5-reverse': [6, 12],
  '59-low5-forward': [1, 8],
  '59-low5-reverse': [2, 10],
  '59-high5-forward': [8, 7],
  '59-high5-reverse': [7, 10],
};

let tested = 0;
let twoFlankSurvivors = 0;
for (const radix of [60, 59]) {
  const T = sourceTable(radix);
  if (radix === 60) assert.deepEqual(T, grid.byte_rows);
  for (const split of ['low5', 'high5']) {
    for (const direction of ['forward', 'reverse']) {
      const pageReports = [];
      for (const page of [49, 51]) {
        const input = [...corpus.pages.find((p) => p.page === page).indices];
        if (direction === 'reverse') input.reverse();
        const outcomes = Array.from({ length: 8 }, (_, seed) => decode(T, input, seed, split));
        const minBad = Math.min(...outcomes.map((o) => o.invalid));
        const zeroSeeds = outcomes.flatMap((o, i) => o.invalid === 0 ? [i] : []);
        pageReports.push({ page, minBad, zeroSeeds });
        tested += 8;
      }
      const [left, right] = pageReports;
      const pairSeeds = left.zeroSeeds.filter((seed) => right.zeroSeeds.includes(seed));
      twoFlankSurvivors += pairSeeds.length;
      assert.deepEqual([left.minBad, right.minBad], expectedMin[radix + '-' + split + '-' + direction]);
      assert.equal(pairSeeds.length, 0);
      console.log(JSON.stringify({radix, split, direction, pageReports, simultaneousSeeds: pairSeeds}));
    }
  }
}
assert.equal(tested, 128);
assert.equal(twoFlankSurvivors, 0);

/**
 * Nontrivial reversible positive: independently synthesize a 32x8 table
 * whose GP29 output is 7*input + 3*state + 5 (mod 29) and whose successor
 * state is state + 2*input + 1 (mod 8). Both byte packings recover real
 * 95-rune clear p57 under a withheld, varying ciphertext.
 */
const positivePlain = corpus.pages.find((p) => p.page === 57).indices;
const mod = (n, m) => ((n % m) + m) % m;
for (const split of ['low5', 'high5']) {
  const T = Array.from({ length: 32 }, (_, r) => Array.from({ length: 8 }, (_, s) => {
    const p = r < 29 ? mod(7 * r + 3 * s + 5, 29) : r;
    const next = (s + 2 * r + 1) & 7;
    return split === 'low5' ? (next << 5) | p : (p << 3) | next;
  }));
  for (let seed = 0; seed < 8; seed++) {
    const cipher = [];
    let state = seed;
    for (const p of positivePlain) {
      const rune = mod(25 * (p - 3 * state - 5), 29); // 7^-1 mod29 = 25
      cipher.push(rune);
      state = (state + 2 * rune + 1) & 7;
    }
    const decoded = decode(T, cipher, seed, split);
    assert.equal(decoded.invalid, 0);
    assert.deepEqual(decoded.out, positivePlain);
  }
}
console.log('PASS literal p49/p51 dual-flank bitpacked receiver: 128 original scans, 0 compatible full pairs, 16 independent 95/95 native-GP plants');
