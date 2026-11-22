'use strict';
/**
 * Original LP2 p3-p8, frozen p7-GF4/p50-radix59 correction:
 * exact obstruction to a direct 29-state associative commutative
 * word accumulator, even with an arbitrary secret output permutation
 * separately for each word length.
 *
 * Windows 11 / Node.js 22 SFT:
 * node sims/lp2_scroll255_commutative_accumulator_obstruction_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const read = name => fs.readFileSync(path.join(base, name), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const transcription = read('lp2-transcription.txt').split('%');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = x => (x % 29 + 29) % 29;
const bag = w => [...w].sort((a, b) => a - b).join(',');

const words = [];
let pending = [];
for (let page = 3; page <= 7; page++) {
  for (const char of transcription[page]) {
    if (runeIndex.has(char)) pending.push(runeIndex.get(char));
    else if ((char === '-' || char === '.') && pending.length) {
      words.push(pending);
      pending = [];
    }
  }
}
if (pending.length) words.push(pending);
assert.equal(words.length, 255);
assert.deepEqual(words.flat(), corpus.pages.slice(3, 8).flatMap(p => p.indices));
const cipher = corpus.pages[8].indices;
assert.equal(cipher.length, 255);

const redFive = [
  [23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]
];
assert.deepEqual(corpus.pages[7].indices.slice(194), redFive.flat());
const products = redFive.map(w => w.reduce((acc, v) => mod(acc * v), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);

function gf4mul(a, b) {
  let v = 0;
  for (let bit = 0; bit < 2; bit++) {
    if ((b >>> bit) & 1) v ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return v;
}
const state = [products[4] % 4, 0, 0, 0];
const addresses = [];
for (let i = 0; i < 255; i++) {
  addresses.push(state.reduce((acc, digit) => 4 * acc + digit, 0));
  let feedback = 0;
  for (let j = 0; j < 4; j++) feedback ^= gf4mul(state[j], products[j] % 4);
  state.splice(0, 4, state[1], state[2], state[3], feedback);
}
assert.equal(new Set(addresses).size, 255);
assert.deepEqual(addresses.slice(0, 8), [128, 1, 7, 30, 123, 236, 177, 199]);
const digits = grid.alphabet.replace('f', '');
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const table = tokens.map(t => 59 * digits.indexOf(t[0]) + digits.indexOf(t[1]));
assert(table.every(v => v >= 0 && v <= 251));
const corrected = cipher.map((value, i) => mod(value + table[addresses[i]]));
const fourPairs = [[47, 240], [48, 231], [235, 236], [88, 179]];
assert.deepEqual(fourPairs.map(([i, j]) => [corrected[i], corrected[j]]),
  [[20, 20], [8, 8], [2, 2], [9, 9]]);

const byBag = new Map(words.map((w, i) => [bag(w), i]));
assert.equal(byBag.size, 251);
/**
 * If equal-length words have equal emitted values under an injective
 * length-specific output code, their internal accumulator states coincide.
 * Adding the same symbol must then keep the states and their outputs equal.
 * The test requires only observed source words and one-rune extensions.
 */
function witnessList(outputs) {
  const witnesses = [];
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if (words[i].length !== words[j].length || outputs[i] !== outputs[j]) continue;
      for (let r = 0; r < 29; r++) {
        const left = byBag.get(bag([...words[i], r]));
        const right = byBag.get(bag([...words[j], r]));
        if (left === undefined || right === undefined) continue;
        if (outputs[left] !== outputs[right]) {
          witnesses.push({ base: [i, j], addedRune: r,
            extension: [left, right],
            values: [outputs[i], outputs[j], outputs[left], outputs[right]] });
        }
      }
    }
  }
  return witnesses;
}
const witnesses = witnessList(corrected);
assert.deepEqual(witnesses, [
  { base: [54, 235], addedRune: 5, extension: [74, 105], values: [2, 2, 17, 21] },
  { base: [54, 236], addedRune: 5, extension: [74, 105], values: [2, 2, 17, 21] }
]);
assert.deepEqual(words[54], [6, 28]);
assert.deepEqual(words[235], [23, 21]);
assert.deepEqual(words[236], [23, 21]);
assert.deepEqual(words[74], [5, 28, 6]);
assert.deepEqual(words[105], [5, 21, 23]);
for (const [a, b] of [[54, 74], [235, 105], [236, 105]]) {
  assert.deepEqual(bag([...words[a], 5]), bag(words[b]));
}

// Positive control: an actual commutative associative GP29 accumulator
// on the SAME 255 original words must have zero extension contradictions.
const planted = words.map(w => mod(w.reduce((s, r) => s + r, 0)));
assert.deepEqual(witnessList(planted), []);

// Independent second symbol class: a different global H collision has
// incompatible continuation by two common multiset symbols {5,10}.
assert.deepEqual([words[128], words[166], words[183], words[221]],
  [[26], [27, 20], [5, 10, 26], [20, 27, 10, 5]]);
assert.deepEqual([corrected[128], corrected[166], corrected[183], corrected[221]],
  [25, 25, 19, 8]);
// Both H=2 and H=25 require multiple distinct hidden states under a fixed
// global state-to-output map. Each of the other 27 emitted symbols requires
// its own state: any compatible global readout needs at least 31 states.
assert.equal(new Set(corrected).size, 29);
console.log(JSON.stringify({
  sourceWords: words.length, sourceRunes: words.flat().length,
  outputRunes: corrected.length, outputDistinctSymbols: present.size,
  originalSourceAnagrams: fourPairs,
  nonAssociativeEvidence: witnesses,
  additivePositiveControl: 'PASS: zero extension contradictions',
  globalDeterministicStateLowerBound: 31,
  conclusion: 'No direct 29-state commutative associative word accumulator with injective length-specific readout'
}, null, 2));
console.log('PASS: original corrected scroll register violates universal monoid extension congruence.');
