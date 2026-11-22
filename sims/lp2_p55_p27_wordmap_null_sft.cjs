'use strict';

/**
 * Discovery-aware word-map null for the source-selected p55 terminal pair.
 *
 * Run:
 *   node sims/lp2_p55_p27_wordmap_null_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-transcription.txt'), 'utf8');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const unknown = source.split('%').slice(0, 55).join('%');
const physicalPage = (page) => page >= 50 ? page + 1 : page;

const words = [];
let fragment = [];
let rawPage = 0;
let line = 1;
let localRune = 0;
let startPage = 0;
let startLine = 1;
let startLocal = 0;

function finishWord() {
  if (!fragment.length) return;
  words.push({
    runes: fragment.map((index) => corpus.runes[index]).join(''),
    translit: fragment.map((index) => corpus.translit[index]).join(''),
    length: fragment.length,
    page: physicalPage(startPage),
    line: startLine,
    localRune: startLocal
  });
  fragment = [];
}

for (const char of unknown) {
  if (alphabet.has(char)) {
    if (!fragment.length) {
      startPage = rawPage;
      startLine = line;
      startLocal = localRune;
    }
    fragment.push(alphabet.get(char));
    localRune++;
  } else if (char === '%') {
    rawPage++;
    line = 1;
    localRune = 0;
  } else if (char === '/') {
    line++;
  } else if (/\s/u.test(char)) {
    // Physical wrapping is not a complete-word delimiter.
  } else {
    finishWord();
  }
}
finishWord();

assert.equal(words.length, 2896);

const frequencies = new Map();
for (const word of words) {
  frequencies.set(word.runes, (frequencies.get(word.runes) || 0) + 1);
}

const originStart = 2894;
assert.deepEqual(words.slice(originStart).map((word) => word.translit), ['DJU', 'BEI']);

function routeStats(order) {
  const first = words[order[originStart]];
  const second = words[order[originStart + 1]];
  const pairKey = first.runes + '\0' + second.runes;
  const pairStarts = [];

  for (let i = 0; i + 1 < order.length; i++) {
    const key = words[order[i]].runes + '\0' + words[order[i + 1]].runes;
    if (key === pairKey) pairStarts.push(i);
  }

  const other = pairStarts.filter((index) => index !== originStart);
  if (other.length !== 1) {
    return {pairRepeat: false, uniqueRepeatedNeighbor: false, terminal: false};
  }

  const destination = other[0];
  const candidates = [];
  for (const slot of [destination - 1, destination + 2]) {
    if (slot < 0 || slot >= order.length) continue;
    const anchor = slot < destination ? destination : destination + 1;
    if (words[slot].page !== words[anchor].page) continue;
    const word = words[order[slot]];
    if (frequencies.get(word.runes) === 2) candidates.push({slot, word});
  }

  if (candidates.length !== 1) {
    return {pairRepeat: true, uniqueRepeatedNeighbor: false, terminal: false};
  }

  const chosen = candidates[0];
  const occurrences = [];
  for (let i = 0; i < order.length; i++) {
    if (words[order[i]].runes === chosen.word.runes) occurrences.push(i);
  }
  assert.equal(occurrences.length, 2);
  const nextSlot = occurrences.find((index) => index !== chosen.slot);

  let repeatedNeighbors = 0;
  for (const slot of [nextSlot - 1, nextSlot + 1]) {
    if (slot < 0 || slot >= order.length) continue;
    if (words[slot].page !== words[nextSlot].page) continue;
    if (frequencies.get(words[order[slot]].runes) === 2) repeatedNeighbors++;
  }

  return {
    pairRepeat: true,
    uniqueRepeatedNeighbor: true,
    terminal: repeatedNeighbors === 0,
    destination,
    nextSlot,
    pair: [first.translit, second.translit],
    bridge: chosen.word.translit
  };
}

const identity = words.map((unused, index) => index);
assert.deepEqual(routeStats(identity), {
  pairRepeat: true,
  uniqueRepeatedNeighbor: true,
  terminal: true,
  destination: 1462,
  nextSlot: 2767,
  pair: ['DJU', 'BEI'],
  bridge: 'BF'
});

const groups = new Map();
for (let i = 0; i < words.length; i++) {
  const key = words[i].page + '|' + words[i].length;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(i);
}
const groupList = [...groups.values()];

let state = 0x48a91f2d;
function randomUnit() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) / 4294967296;
}

const trials = 20000;
let pairRepeat = 0;
let uniqueRepeatedNeighbor = 0;
let terminal = 0;

for (let trial = 0; trial < trials; trial++) {
  const order = identity.slice();
  for (const group of groupList) {
    const values = group.map((index) => order[index]);
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(randomUnit() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    for (let i = 0; i < group.length; i++) order[group[i]] = values[i];
  }

  const stats = routeStats(order);
  if (stats.pairRepeat) pairRepeat++;
  if (stats.uniqueRepeatedNeighbor) uniqueRepeatedNeighbor++;
  if (stats.terminal) terminal++;
}

assert.equal(pairRepeat, 480);
assert.equal(uniqueRepeatedNeighbor, 135);
assert.equal(terminal, 125);

console.log('ORIGINAL: p55 DJU/BEI repeats once at p27; unique repeated outside neighbor BF points p52');
console.log('MATCHED NULL 20,000: selected terminal pair repeats once elsewhere in 480 books (2.4%)');
console.log('BRIDGE: 135/480 repeated-pair controls (28.125%) have exactly one repeated outside neighbor');
console.log('TERMINAL: 125/135 bridge controls (92.59%) stop at a copy whose immediate neighbors are unique');
console.log('DECISION: p55->p27 pair remains the useful word-map event; BF->p52 adds weak conditional evidence');
