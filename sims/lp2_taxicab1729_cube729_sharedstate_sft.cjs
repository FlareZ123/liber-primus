'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} relative @returns {string} */
function resource(relative) {
  return fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
}

const source = JSON.parse(resource('resources/liber-primus/lp2-corpus.json'));
const p0 = source.pages.filter(p => p.page >= 0 && p.page <= 2).flatMap(p => p.indices);
const tree = source.pages.filter(p => p.page >= 8 && p.page <= 14).flatMap(p => p.indices);
assert.equal(p0.length, 729);
assert.equal(tree.length, 1729);
assert.equal(9 ** 3, 729);
assert.equal(9 ** 3 + 10 ** 3, 1729);
assert.equal(1 ** 3 + 12 ** 3, 1729);

const gpMap = new Map(source.translit.map((name, index) => [name, index]));
gpMap.set('ING', 21);
const lexemes = [...gpMap.keys()].sort((a, b) => b.length - a.length);

/** @param {string} text @returns {number[]} */
function encodeGP(text) {
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
    for (let offset = 0; offset < word.length;) {
      const token = lexemes.find(t => word.startsWith(t, offset));
      assert.ok(token, 'Unmapped source token');
      out.push(gpMap.get(token));
      offset += token.length;
    }
  }
  return out;
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function equalityCount(a, b) {
  assert.equal(a.length, b.length);
  let count = 0;
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) count++;
  return count;
}

/** @param {number[]} a @param {number[]} b @returns {number[]} */
function additiveDifference(a, b) {
  assert.equal(a.length, b.length);
  return a.map((v, i) => (v - b[i] + 29) % 29);
}

const firstCube = tree.slice(0, 729);
const secondCube = tree.slice(1000, 1729);
const observedFirst = equalityCount(p0, firstCube);
const observedLast = equalityCount(p0, secondCube);
assert.equal(observedFirst, 20);
assert.equal(observedLast, 24);
assert.equal(additiveDifference(p0, firstCube).filter(x => x === 0).length, 20);
assert.equal(additiveDifference(p0, secondCube).filter(x => x === 0).length, 24);

// Independently fixed, complete reference source windows; neither ciphertext nor
// a recovered key influences the source normalization or the window sampling.
const a = encodeGP(resource('resources/control/shakespeare_first300k.txt'));
const b = encodeGP(resource('resources/control/gibran_prophet_58585.txt'));
assert.equal(a.length, 217644);
assert.equal(b.length, 62696);
const n = 20000;
let state = 0x1729729;
/** @returns {number} */
function random32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}

let total = 0;
let minimum = 730;
let atMost20 = 0;
let atMost24 = 0;
for (let sample = 0; sample < n; sample++) {
  const offsetA = random32() % (a.length - 729);
  const offsetB = random32() % (b.length - 729);
  let matching = 0;
  for (let i = 0; i < 729; i++) {
    if (a[offsetA + i] === b[offsetB + i]) matching++;
  }
  total += matching;
  minimum = Math.min(minimum, matching);
  if (matching <= 20) atMost20++;
  if (matching <= 24) atMost24++;
}
assert.equal(total, 871112);
assert.equal(minimum, 21);
assert.equal(atMost20, 0);
assert.equal(atMost24, 18);

// Positive controls: a shared secret modular pad, and a much stronger secret
// independent 29-way alphabet permutation at each of 729 positions.
// Both preserve equality at each aligned position for any plaintext.
const plainA = a.slice(50, 779);
const plainB = b.slice(77, 806);
const equalPlant = equalityCount(plainA, plainB);
state = 0x3301729;
const ca = [];
const cb = [];
const pa = [];
const pb = [];
for (let i = 0; i < 729; i++) {
  const perm = Array.from({ length: 29 }, (_, k) => k);
  for (let j = 28; j > 0; j--) {
    const k = random32() % (j + 1);
    [perm[j], perm[k]] = [perm[k], perm[j]];
  }
  const xa = perm[plainA[i]];
  const xb = perm[plainB[i]];
  ca.push(xa);
  cb.push(xb);
  pa.push(perm.indexOf(xa));
  pb.push(perm.indexOf(xb));
}
assert.deepEqual(pa, plainA);
assert.deepEqual(pb, plainB);
assert.equal(equalityCount(ca, cb), equalPlant);
assert.equal(equalityCount(pa, pb), equalPlant);

// The two 729-cube cuts are inside the original p10 and p11 images,
// respectively, so neither cut is an independently printed delimiter.
const firstThreePages = source.pages.filter(p => p.page >= 8 && p.page <= 10);
const firstFourPages = source.pages.filter(p => p.page >= 8 && p.page <= 11);
assert.equal(firstThreePages.reduce((s, p) => s + p.indices.length, 0), 786);
assert.equal(firstFourPages.reduce((s, p) => s + p.indices.length, 0), 1059);
assert.equal(729 - 523, 206);
assert.equal(1000 - 786, 214);

console.log(JSON.stringify({
  source: 'LP2 pp0-2 (729), pp8-14 (1729)',
  cubeCuts: ['[0,729)', '[1000,1729)'],
  originalEqualPositions: [observedFirst, observedLast],
  nativeReference: {
    samples: n,
    shakespeareRuneCount: a.length,
    gibranRuneCount: b.length,
    meanEqual: total / n,
    minEqual: minimum,
    samplesAtMost20: atMost20,
    samplesAtMost24: atMost24
  },
  positiveSecretPermutationPlant: { length: plainA.length, matches: equalPlant, recovered: 729 },
  conclusion: 'Neither source-frozen cube cut resembles native English under a common per-position bijective alphabet; no authentic key or plaintext recovered.'
}, null, 2));
