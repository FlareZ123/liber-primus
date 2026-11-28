'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const CORPUS_PATH = 'resources/liber-primus/lp2-corpus.json';
const corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf8'));
const MOD = 29;

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % MOD) + MOD) % MOD;
}

/** @param {number[]} left @param {number[]} right @returns {number[]} */
function add(left, right) {
  assert.equal(left.length, right.length);
  return left.map((value, index) => mod29(value + right[index]));
}

/** @param {number[]} left @param {number[]} right @returns {number[]} */
function subtract(left, right) {
  assert.equal(left.length, right.length);
  return left.map((value, index) => mod29(value - right[index]));
}

const screenshot = {
  decodedDiscover: [23, 10, 15, 5, 3, 1, 18, 4],
  modifierDiscover: [8, 2, -3, 2, -3, 11, -9, 4],
  // The other two yellow modifier rows visible in RHV0bYJ.
  modifierDirection: [8, 2, 15, 15, -1, 26, 0, 9],
  modifierDivinity: [8, 2, 12, 7, 3, -9, -11, -3],
};

const cipherIfDecodedEqualsCipherPlusModifier = subtract(
  screenshot.decodedDiscover,
  screenshot.modifierDiscover
);
const cipherIfDecodedEqualsCipherMinusModifier = add(
  screenshot.decodedDiscover,
  screenshot.modifierDiscover
);

assert.deepEqual(
  cipherIfDecodedEqualsCipherPlusModifier,
  [15, 8, 18, 3, 6, 19, 27, 0]
);
assert.deepEqual(
  cipherIfDecodedEqualsCipherMinusModifier,
  [2, 12, 12, 7, 0, 12, 9, 8]
);

/** @type {Array<{direction:string,page:number,offset:number,status:string}>} */
const hits = [];
for (const page of corpus.pages) {
  for (let offset = 0; offset <= page.indices.length - 8; offset += 1) {
    const window = page.indices.slice(offset, offset + 8);
    if (
      window.every(
        (value, index) =>
          value === cipherIfDecodedEqualsCipherPlusModifier[index]
      )
    ) {
      hits.push({
        direction: 'decoded=cipher+modifier',
        page: page.page,
        offset,
        status: page.status,
      });
    }
    if (
      window.every(
        (value, index) =>
          value === cipherIfDecodedEqualsCipherMinusModifier[index]
      )
    ) {
      hits.push({
        direction: 'decoded=cipher-modifier',
        page: page.page,
        offset,
        status: page.status,
      });
    }
  }
}

assert.deepEqual(hits, [
  {
    direction: 'decoded=cipher+modifier',
    page: 0,
    offset: 0,
    status: 'unsolved',
  },
]);

const p0 = corpus.pages.find((page) => page.page === 0);
assert.ok(p0);
const p0First8 = p0.indices.slice(0, 8);
assert.deepEqual(p0First8, [15, 8, 18, 3, 6, 19, 27, 0]);

// Independent visible screenshot cross-check: wZVmpq9 exposes CIPHER_DEC 15,8,18.
assert.deepEqual(p0First8.slice(0, 3), [15, 8, 18]);

const trials = {
  DISCOVER: screenshot.modifierDiscover,
  DIRECTION: screenshot.modifierDirection,
  DIVINITY: screenshot.modifierDivinity,
};

/** @type {Record<string, {modifier:number[],decoded:number[],canonicalTranslit:string[]}>} */
const reconstructed = {};
for (const [label, modifier] of Object.entries(trials)) {
  const decoded = add(p0First8, modifier);
  reconstructed[label] = {
    modifier,
    decoded,
    canonicalTranslit: decoded.map((value) => corpus.translit[value]),
  };
}

assert.deepEqual(reconstructed.DISCOVER.decoded, [23, 10, 15, 5, 3, 1, 18, 4]);
assert.deepEqual(reconstructed.DISCOVER.canonicalTranslit, [
  'D', 'I', 'S', 'C', 'O', 'U', 'E', 'R',
]);
assert.deepEqual(reconstructed.DIRECTION.decoded, [23, 10, 4, 18, 5, 16, 27, 9]);
assert.deepEqual(reconstructed.DIVINITY.decoded, [23, 10, 1, 10, 9, 10, 16, 26]);

console.log(JSON.stringify({
  status: 'PASS',
  localization: {
    uniqueHit: hits[0],
    p0First8,
    canonicalCipherTranslit: p0First8.map((value) => corpus.translit[value]),
    visibleCipherDecCrossCheck: p0First8.slice(0, 3),
    arithmetic: 'decoded = cipher + modifier (mod 29)',
  },
  reconstructedTrials: reconstructed,
  interpretation: [
    'The Dec-2016 workbook screenshots are localized to LP2 p0 offset 0.',
    'The yellow modifier rows are crib-derived trial modifiers on the same p0 ciphertext window.',
    'This is historical solver-state evidence, not authenticated Cicada plaintext or key material.',
  ],
}, null, 2));
