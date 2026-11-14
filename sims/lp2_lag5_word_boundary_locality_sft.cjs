'use strict';

/**
 * Original-source word-boundary locality gate for lag-five ciphertext echoes.
 * Run from Node.js on the repository; uses only its canonical transcription.
 * Fixed-seed Monte Carlo conditions on each complete word's exact rune multiset,
 * length, and adjacent-equal count. The across-word collision expectation is
 * calculated exactly under independent within-word permutations.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RUNES = new Set(Array.from('ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'));
const input = fs.readFileSync(path.join(__dirname, '..', 'resources', 'lp2-transcription.txt'), 'utf8');
const pages = input.split('%');
const words = pages.slice(0, 55).join('').replace(/[\/\s]/g, '')
  .split(/[-.&$§]+/)
  .filter((w) => w.length > 0 && Array.from(w).every((c) => RUNES.has(c)))
  .map((w) => Array.from(w));

assert.equal(pages.length, 57);
assert.equal(words.length, 2896);
const all = [];
const wordIds = [];
const offsets = [];
const frequencies = [];
const adjacent = [];
for (let i = 0; i < words.length; i++) {
  const w = words[i];
  const counts = new Map();
  let doubles = 0;
  for (let j = 0; j < w.length; j++) {
    const c = w[j];
    all.push(c);
    wordIds.push(i);
    offsets.push(j);
    counts.set(c, (counts.get(c) || 0) + 1);
    if (j > 0 && c === w[j - 1]) doubles++;
  }
  frequencies.push(counts);
  adjacent.push(doubles);
}
assert.equal(all.length, 12956);

// Positive control: a seven-symbol constructed word with two lag-five echoes.
const toy = Array.from('ABCDEAB');
assert.equal(toy.filter((c, i) => i >= 5 && c === toy[i - 5]).length, 2);

let within = 0;
let across = 0;
let withinN = 0;
let acrossN = 0;
let exactCrossMean = 0;
const atOffset = {};
for (let i = 5; i < all.length; i++) {
  const equal = Number(all[i] === all[i - 5]);
  if (wordIds[i] === wordIds[i - 5]) {
    withinN++;
    within += equal;
    const k = offsets[i];
    if (!atOffset[k]) atOffset[k] = { hits: 0, total: 0 };
    atOffset[k].hits += equal;
    atOffset[k].total++;
  } else {
    acrossN++;
    across += equal;
    const a = wordIds[i], b = wordIds[i - 5];
    let matchingPairs = 0;
    for (const [c, n] of frequencies[a]) matchingPairs += n * (frequencies[b].get(c) || 0);
    exactCrossMean += matchingPairs / (words[a].length * words[b].length);
  }
}
assert.deepEqual([within, withinN, across, acrossN], [104, 2105, 375, 10846]);
assert.ok(Math.abs(exactCrossMean - 362.19713875790245) < 1e-6);

let seed = 0x7e9cd005 >>> 0;
function nextUint32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const repetitions = 3000;
let rejected = 0;
const withinNull = [];
const acrossNull = [];
for (let t = 0; t < repetitions; t++) {
  const shuffled = [];
  for (let wi = 0; wi < words.length; wi++) {
    const w = words[wi];
    if (w.length === 1) {
      shuffled.push(w[0]);
      continue;
    }
    let sample;
    while (true) {
      sample = w.slice();
      for (let j = sample.length - 1; j > 0; j--) {
        const k = nextUint32() % (j + 1);
        [sample[j], sample[k]] = [sample[k], sample[j]];
      }
      let n = 0;
      for (let j = 1; j < sample.length; j++) if (sample[j] === sample[j - 1]) n++;
      if (n === adjacent[wi]) break;
      rejected++;
    }
    for (const c of sample) shuffled.push(c);
  }
  let w5 = 0, x5 = 0;
  for (let j = 5; j < shuffled.length; j++) {
    if (shuffled[j] !== shuffled[j - 5]) continue;
    if (wordIds[j] === wordIds[j - 5]) w5++;
    else x5++;
  }
  withinNull.push(w5);
  acrossNull.push(x5);
}
function summarize(samples, original) {
  const mean = samples.reduce((n, x) => n + x, 0) / samples.length;
  const sd = Math.sqrt(samples.reduce((n, x) => n + (x - mean) ** 2, 0) / samples.length);
  const tail = samples.filter((x) => x >= original).length;
  return { original, mean, sd, z: (original - mean) / sd, tail, plusOneP: (tail + 1) / (samples.length + 1) };
}
const result = {
  original: { runes: all.length, words: words.length, within, withinN, across, acrossN, exactCrossMean, atOffset },
  conditionalNull: {
    repetitions,
    seed: '0x7e9cd005',
    rejected,
    within: summarize(withinNull, within),
    across: summarize(acrossNull, across)
  }
};
assert.equal(rejected, 1498708);
assert.equal(result.conditionalNull.within.tail, 1);
assert.equal(result.conditionalNull.across.tail, 733);
console.log(JSON.stringify(result, null, 2));
