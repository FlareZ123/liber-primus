'use strict';

/**
 * Original LP2 source SFT: complete shared six-phase T6 rotors, granting every
 * printed word its own arbitrary secret GP29 substitution alphabet.
 *
 * Exactly enumerates the 28^5 effective phase-key choices using equality
 * constraints from the 159 native-GP English length-14 word patterns.
 * All three original 14-rune words must have a native reference word shape
 * under one shared key for the declared cipher to explain the complete book.
 *
 * Windows 11, Node.js 22: node sims/lp2_p39_t6_sixphase_anywordalphabet_sft.cjs
 * Read-only and deterministic. No dependencies beyond Node.js.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const wordFrequency = read('resources/control/english_wordfreq_textblob.txt');
const runeSet = new Set(book.runes);

/** @param {number} x @returns {number} */
const mod28 = (x) => (x % 28 + 28) % 28;
/** @param {number} x @returns {number} */
const mod29 = (x) => (x % 29 + 29) % 29;
/** @param {number} x @returns {number} */
const T = (x) => mod29(24 - 2 * x);

/** @type {[string, number][]} */
const tokens = [
  ['ING', 21], ['NG', 21], ['IO', 27],
  ...book.translit.map((name, index) => [name, index])
    .filter(([name]) => name !== 'IA'),
].sort((a, b) => b[0].length - a[0].length);

/**
 * Canonical TextBlob GP reference spelling used by this repository.
 * @param {string} spelling
 * @returns {number[] | null}
 */
function encodeEnglish(spelling) {
  const word = spelling.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  /** @type {number[]} */
  const values = [];
  for (let i = 0; i < word.length;) {
    const pair = tokens.find(([part]) => word.startsWith(part, i));
    if (!pair) return null;
    values.push(pair[1]);
    i += pair[0].length;
  }
  return values;
}

/** @param {number[]} values @returns {string} */
function equalityPattern(values) {
  const map = new Map();
  let unique = 0;
  return values.map((value) => {
    if (!map.has(value)) map.set(value, unique++);
    return map.get(value);
  }).join(',');
}

/** @type {Map<string, string[]>} */
const shapes = new Map();
let lexiconCount = 0;
for (const line of wordFrequency.split(/\r?\n/)) {
  const match = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!match) continue;
  const word = encodeEnglish(match[1]);
  if (!word || word.length > 14) continue;
  lexiconCount++;
  if (word.length !== 14) continue;
  const pattern = equalityPattern(word);
  if (!shapes.has(pattern)) shapes.set(pattern, []);
  shapes.get(pattern).push(match[1]);
}
assert.equal(lexiconCount, 29088);
assert.equal([...shapes.values()].reduce((n, words) => n + words.length, 0), 162);
assert.equal(shapes.size, 159);

/** @type {{word:number[],index:number,start:number}[]} */
const original = [];
let runeStart = 0;
const allSourceWords = transcription.replace(/[\/\n%&$§]/g, '')
  .split(/[-.]/)
  .map((str) => Array.from(str).filter((rune) => runeSet.has(rune))
    .map((rune) => book.runes.indexOf(rune)))
  .filter((word) => word.length)
  .slice(0, 2896);
for (const word of allSourceWords) {
  original.push({ word, index: original.length, start: runeStart });
  runeStart += word.length;
}
const sourceTape = book.pages.filter((page) => page.page <= 55)
  .flatMap((page) => page.indices);
assert.equal(original.length, 2896);
assert.equal(runeStart, 12956);
assert.deepEqual(original.flatMap((entry) => entry.word), sourceTape);
const source14 = original.filter((entry) => entry.word.length === 14);
assert.deepEqual(source14.map((entry) => entry.index), [754, 1353, 2341]);
assert.deepEqual(source14.map((entry) => entry.start), [3405, 6035, 10453]);

/** @type {number[]} */
const pageLocal = [];
for (const page of book.pages.filter((entry) => entry.page <= 55)) {
  for (let i = 0; i < page.indices.length; i++) pageLocal.push(i);
}
assert.equal(pageLocal.length, runeStart);

/** @type {number[]} */
const cycle = [];
let symbol = 0;
for (let i = 0; i < 28; i++) {
  cycle.push(symbol);
  symbol = T(symbol);
}
assert.equal(symbol, 0);
assert.equal(new Set(cycle).size, 28);
assert.ok(!cycle.includes(8));
assert.equal(T(8), 8);
const logs = Array(29).fill(-1);
cycle.forEach((value, index) => { logs[value] = index; });
/** @type {number[][]} */
const powers = [Array.from({ length: 29 }, (_, i) => i)];
for (let exponent = 1; exponent < 28; exponent++) {
  powers.push(powers[exponent - 1].map(T));
}

/** @typedef {'word'|'global'|'page'} Clock */
/** @typedef {{word:number[],index:number,start:number}} SourceWord */
/** @typedef {{word:number[],phase:number[],base:number[]}} PreparedWord */

/**
 * Position on the specified six-slot clock.
 * @param {SourceWord} entry
 * @param {number} index
 * @param {Clock} clock
 * @returns {number}
 */
function clockPosition(entry, index, clock) {
  if (clock === 'word') return index;
  if (clock === 'global') return entry.start + index;
  return pageLocal[entry.start + index];
}

/**
 * In cycle coordinates, de-rotation gives base[i] - secret[phase[i]].
 * GP rune H (index 8) is the separate fixed point and stays at -1.
 * @param {SourceWord[]} words
 * @param {Clock} clock
 * @param {number} sign
 * @returns {PreparedWord[]}
 */
function prepare(words, clock, sign) {
  return words.map((entry) => {
    const phase = [];
    const base = [];
    for (let i = 0; i < entry.word.length; i++) {
      const position = clockPosition(entry, i, clock);
      phase.push(position % 6);
      base.push(entry.word[i] === 8 ? -1 :
        mod28(logs[entry.word[i]] - sign * Math.floor(position / 6)));
    }
    return { word: entry.word, phase, base };
  });
}

/**
 * Exact, alphabet-independent plaintext repeated-letter pattern.
 * @param {PreparedWord} entry
 * @param {number[]} key
 * @returns {string}
 */
function rotatedPattern(entry, key) {
  const unique = new Map();
  let next = 0;
  const pattern = [];
  for (let i = 0; i < entry.word.length; i++) {
    const value = entry.word[i] === 8 ? -1 :
      mod28(entry.base[i] - key[entry.phase[i]]);
    if (!unique.has(value)) unique.set(value, next++);
    pattern.push(unique.get(value));
  }
  return pattern.join(',');
}

/**
 * Enumerate all keys consistent with at least the first 14-rune source word.
 * Equality constraints turn each possible English word pattern into a graph
 * of modular phase differences, then enumerate only its free components.
 * Remaining differences are checked by an exact equality-pattern comparison.
 *
 * @param {SourceWord[]} words exactly three length-14 original or planted words
 * @param {Clock} clock
 * @param {number} sign -1 or 1
 * @param {boolean} findAny stop when the first three-word witness is found
 * @returns {{candidates:number,first:number,two:number,three:number,witness:number[]|null}}
 */
function scan(words, clock, sign, findAny = false) {
  const prepared = prepare(words, clock, sign);
  const counts = [0, 0, 0, 0];
  /** @type {number[]|null} */
  let witness = null;

  for (const pattern of shapes.keys()) {
    if (findAny && witness) break;
    const target = pattern.split(',').map(Number);
    /** @type {Map<number,number[]>} */
    const groups = new Map();
    for (let i = 0; i < 14; i++) {
      if (!groups.has(target[i])) groups.set(target[i], []);
      groups.get(target[i]).push(i);
    }

    const fixedPositions = prepared[0].word.map((value, i) =>
      value === 8 ? i : -1).filter((value) => value >= 0);
    let impossible = false;
    for (let i = 0; i < fixedPositions.length; i++) {
      for (let j = i + 1; j < fixedPositions.length; j++) {
        if (target[fixedPositions[i]] !== target[fixedPositions[j]]) {
          impossible = true;
        }
      }
    }
    if (impossible) continue;

    /** @type {[number,number][][]} */
    const edges = Array.from({ length: 6 }, () => []);
    for (const indices of groups.values()) {
      if (indices.length < 2) continue;
      const fixed = indices.some((i) => prepared[0].word[i] === 8);
      if (fixed && indices.some((i) => prepared[0].word[i] !== 8)) {
        impossible = true;
        break;
      }
      if (fixed) continue;
      const first = indices[0];
      for (const other of indices.slice(1)) {
        const u = prepared[0].phase[first];
        const v = prepared[0].phase[other];
        const delta = mod28(prepared[0].base[other] -
          prepared[0].base[first]);
        if (u === v && delta !== 0) {
          impossible = true;
          break;
        }
        edges[u].push([v, delta]);
        edges[v].push([u, mod28(-delta)]);
      }
      if (impossible) break;
    }
    if (impossible) continue;

    const component = Array(6).fill(-1);
    const potential = Array(6).fill(0);
    /** @type {number[]} */
    const roots = [];
    for (let v = 0; v < 6; v++) {
      if (component[v] >= 0) continue;
      const id = roots.length;
      roots.push(v);
      component[v] = id;
      const stack = [v];
      while (stack.length) {
        const u = stack.pop();
        for (const [q, difference] of edges[u]) {
          const predicted = mod28(potential[u] + difference);
          if (component[q] >= 0) {
            if (component[q] !== id || potential[q] !== predicted) {
              impossible = true;
            }
          } else {
            component[q] = id;
            potential[q] = predicted;
            stack.push(q);
          }
        }
      }
    }
    if (impossible) continue;

    const componentOffsets = Array(roots.length).fill(0);
    /** @param {number} componentIndex @returns {void} */
    function enumerate(componentIndex) {
      if (findAny && witness) return;
      if (componentIndex === roots.length) {
        const key = Array.from({ length: 6 }, (_, i) =>
          mod28(potential[i] + componentOffsets[component[i]]));
        counts[0]++;
        if (rotatedPattern(prepared[0], key) !== pattern) return;
        counts[1]++;
        if (!shapes.has(rotatedPattern(prepared[1], key))) return;
        counts[2]++;
        if (!shapes.has(rotatedPattern(prepared[2], key))) return;
        counts[3]++;
        witness = key;
        return;
      }
      if (componentIndex === component[0]) {
        enumerate(componentIndex + 1);
        return;
      }
      for (let shift = 0; shift < 28; shift++) {
        componentOffsets[componentIndex] = shift;
        enumerate(componentIndex + 1);
        if (findAny && witness) return;
      }
    }
    enumerate(0);
  }
  return {
    candidates: counts[0],
    first: counts[1],
    two: counts[2],
    three: counts[3],
    witness,
  };
}

/** @type {{clock:Clock, sign:number, expected:[number,number,number,number]}[]} */
const cases = [
  { clock: 'word', sign: 1, expected: [786249, 6419, 20, 0] },
  { clock: 'word', sign: -1, expected: [741531, 46003, 101, 0] },
  { clock: 'global', sign: 1, expected: [786249, 6419, 24, 0] },
  { clock: 'global', sign: -1, expected: [741531, 46003, 67, 0] },
  { clock: 'page', sign: 1, expected: [786249, 6419, 11, 0] },
  { clock: 'page', sign: -1, expected: [741531, 46003, 140, 0] },
];

const nativeWords = [
  'absentmindedly',
  'accompaniments',
  'accomplishment',
].map((spelling) => {
  const encoded = encodeEnglish(spelling);
  assert.ok(encoded && encoded.length === 14);
  assert.ok(shapes.has(equalityPattern(encoded)));
  return encoded;
});
const coefficients = [3, 7, 11];
const constants = [2, 5, 8];
const plantedPhase = [0, 2, 5, 7, 11, 13];
/**
 * Plant three genuine English GP words under independent per-word alphabets.
 * @param {Clock} clock
 * @param {number} sign
 * @returns {SourceWord[]}
 */
function plant(clock, sign) {
  return source14.map((originalEntry, wordIndex) => {
    const word = nativeWords[wordIndex].map((symbol, i) => {
      const position = clockPosition(originalEntry, i, clock);
      const seed = mod29(coefficients[wordIndex] * symbol +
        constants[wordIndex]);
      const power = mod28(sign * (Math.floor(position / 6) +
        plantedPhase[position % 6]));
      return powers[power][seed];
    });
    return { ...originalEntry, word };
  });
}

// Genuine encrypt/decrypt and all-secret-pattern positive controls.
for (const test of cases) {
  const positive = plant(test.clock, test.sign);
  const phase = plantedPhase.map((value) => mod28(test.sign * value));
  const prepared = prepare(positive, test.clock, test.sign);
  for (let i = 0; i < 3; i++) {
    assert.equal(rotatedPattern(prepared[i], phase),
      equalityPattern(nativeWords[i]));
  }
  const found = scan(positive, test.clock, test.sign, true);
  assert.ok(found.three > 0,
    'synthetic planted alphabet/phase not detectable: ' +
    test.clock + ' sign ' + test.sign);
  process.stdout.write('PASS positive ' + test.clock + ' T sign ' +
    test.sign + ' key=' + JSON.stringify(found.witness) + '\n');
}

// Original-input exact necessary-plaintext gates.
for (const test of cases) {
  const observed = scan(source14, test.clock, test.sign);
  const counts = [
    observed.candidates, observed.first, observed.two, observed.three,
  ];
  assert.deepEqual(counts, test.expected,
    'original source signature drift: ' + test.clock + ' ' + test.sign);
  assert.equal(observed.three, 0);
  process.stdout.write('PASS original ' + test.clock + ' T sign ' +
    test.sign + ' [enumerated, first, first-two, all-three]=' +
    JSON.stringify(counts) + '\n');
}

process.stdout.write(
  'PASS all six complete shared-six-phase word-alphabet families; ' +
  '0/6 yield all three original 14-rune words as GP English shapes.\n');
