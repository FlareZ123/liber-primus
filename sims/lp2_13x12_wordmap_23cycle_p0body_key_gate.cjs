#!/usr/bin/env node
'use strict';

// Test the 156-word p0-p2 map's 23-cycle as a direct key for its own
// 716-rune black-body stream under the solved p56 additive/F-transparent
// inverse. Also test fixed-width BASE29 serialization of the cycle sums.
// This is a bounded receiver test, not a key search.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseLP2Words } = require('./lp2_word_pages.cjs');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt');

const parsed = parseLP2Words(transcript, 3);
assert.equal(parsed.words.length, 158);
const headings = parsed.words.slice(0, 2);
const bodyWords = parsed.words.slice(2);
assert.equal(bodyWords.length, 156);

const runeIndex = new Map(gp.runes.map((rune, i) => [rune, i]));
function primeSum(word) {
  let total = 0;
  for (const rune of word.runes) {
    const index = runeIndex.get(rune);
    assert.notEqual(index, undefined);
    total += gp.prime[index];
  }
  return total;
}
const headingSums = headings.map(primeSum);
const bodySums = bodyWords.map(primeSum);
assert.deepEqual(headingSums, [347, 315]);
assert.equal(bodySums.length, 156);

function traceToCycle(start, next) {
  const path = [];
  const seen = new Map();
  let at = start;
  while (!seen.has(at)) {
    seen.set(at, path.length);
    path.push(at);
    at = next[at];
  }
  const cycleStart = seen.get(at);
  return {
    path,
    transient: path.slice(0, cycleStart),
    cycle: path.slice(cycleStart),
    repeat: at
  };
}
const pointer = bodySums.map(sum => sum % 156);
const firstTrace = traceToCycle(headingSums[0] % 156, pointer);
const secondTrace = traceToCycle(headingSums[1] % 156, pointer);
assert.equal(firstTrace.transient.length, 3);
assert.equal(firstTrace.cycle.length, 23);
assert.equal(secondTrace.transient.length, 0);
assert.equal(secondTrace.cycle.length, 23);
assert.equal(secondTrace.cycle[0], firstTrace.cycle[6]);

const cyclePrimeSums = firstTrace.cycle.map(index => bodySums[index]);
assert.deepEqual(cyclePrimeSums, [
  220, 111, 34, 336, 119, 3, 563, 170, 67, 209, 463, 108,
  244, 569, 128, 237, 323, 618, 277, 419, 139, 143, 473
]);

const page = n => gp.pages.find(p => p.page === n);
const p0 = page(0), p1 = page(1), p2 = page(2);
assert(p0 && p1 && p2);
assert.equal(p0.indices.length, 262);
assert.equal(p1.indices.length, 266);
assert.equal(p2.indices.length, 201);
const cipher = [
  ...p0.indices.slice(13),
  ...p1.indices,
  ...p2.indices
];
assert.equal(cipher.length, 716);
assert.equal(cipher.filter(value => value === 0).length, 33);

const key23 = cyclePrimeSums.map(sum => sum % 29);
const key46 = cyclePrimeSums.flatMap(sum => [
  Math.floor(sum / 29), sum % 29
]);
assert.equal(key23.length, 23);
assert.equal(key46.length, 46);

function rotate(values, amount) {
  const n = amount % values.length;
  return values.slice(n).concat(values.slice(0, n));
}

// sign=-1 is P=C-K; sign=+1 is P=C+K.
// At ciphertext F, preserve both legal branches:
// literal plaintext F/no key advance, or non-F inverse/key advance.
// A non-F ciphertext cannot decrypt to plaintext F under this rule.
function inverseReachability(ciphertext, key, sign, startPhase = 0) {
  let phases = new Set([startPhase % key.length]);
  let maxPhases = 1;
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const next = new Set();
    for (const phase of phases) {
      const p = (c + sign * key[phase] + 58) % 29;
      if (p !== 0) next.add((phase + 1) % key.length);
      if (c === 0) next.add(phase);
    }
    phases = next;
    maxPhases = Math.max(maxPhases, phases.size);
    if (phases.size === 0) return { failAt: i, maxPhases };
  }
  return { failAt: null, survivors: phases.size, maxPhases };
}

const variants23 = [];
for (const heading of [
  { name: 'first-heading', rotation: 0 },
  { name: 'second-heading', rotation: 6 }
]) {
  const key = rotate(key23, heading.rotation);
  for (const sign of [-1, 1]) {
    for (const offset of [0, 13, 3]) {
      variants23.push({
        heading: heading.name,
        sign,
        startPhase: offset,
        ...inverseReachability(cipher, key, sign, offset)
      });
    }
  }
}
assert.deepEqual(variants23.map(x => x.failAt), [
  27, 13, 28, 162, 3, 126,
  100, 21, 22, 126, 40, 17
]);

const variants46 = [];
for (const heading of [
  { name: 'first-heading', rotation: 0 },
  { name: 'second-heading', rotation: 12 }
]) {
  const key = rotate(key46, heading.rotation);
  for (const sign of [-1, 1]) {
    for (const offset of [0, 13]) {
      variants46.push({
        heading: heading.name,
        sign,
        startPhase: offset,
        ...inverseReachability(cipher, key, sign, offset)
      });
    }
  }
}
assert.deepEqual(variants46.map(x => x.failAt), [
  41, 32, 257, 216, 3, 21, 19, 3
]);

function encrypt(plain, key, sign) {
  let phase = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const c = (p - sign * key[phase] + 58) % 29;
    phase = (phase + 1) % key.length;
    return c;
  });
}
const plantedPlaintext = Array.from(
  { length: cipher.length }, (_, i) => (i * 11 + 7) % 29
);
const positiveControls = [];
for (const item of [
  { name: '23-symbol-mod29', key: key23 },
  { name: '46-symbol-base29', key: key46 }
]) {
  for (const sign of [-1, 1]) {
    const plantedCipher = encrypt(plantedPlaintext, item.key, sign);
    const result = inverseReachability(plantedCipher, item.key, sign, 0);
    assert.equal(result.failAt, null);
    positiveControls.push({
      key: item.name,
      sign,
      exactLegalPathExists: true,
      survivingPhases: result.survivors
    });
  }
}

const output = {
  map: {
    bodyWordCount: bodyWords.length,
    headingPrimeSums: headingSums,
    firstHeadingStart: headingSums[0] % 156,
    secondHeadingStart: headingSums[1] % 156,
    firstTransientCells: firstTrace.transient.length,
    cycleLength: firstTrace.cycle.length,
    secondHeadingCycleRotation: 6,
    cyclePrimeSums
  },
  receiver: {
    runeCount: cipher.length,
    ciphertextFCount: cipher.filter(value => value === 0).length,
    variants23,
    variants46
  },
  positiveControls,
  decision: 'No complete legal p0-p2 F-transparent additive inverse for either frozen cycle-key encoding.'
};
console.log(JSON.stringify(output, null, 2));
