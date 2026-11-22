'use strict';

/**
 * Exact all-secret 3-track GF(29) Hill-mixer inverse gate for LP2 p24–p26.
 * Windows 11, Node.js 22, CommonJS. Run as one test file.
 *
 * An arbitrary secret invertible 3x3 matrix maps 3 concurrent plaintext runes
 * to 3 original runes. A row of its inverse is any nonzero GF(29)^3 vector.
 * Projective normalization leaves only 29^2+29+1 = 871 distinct equality
 * signatures. Exhausting those rows bounds every unknown matrix and every
 * static output alphabet relabeling without fitting a key or a word.
 *
 * Two original-source clocks are independently fixed:
 *   (1) physical page's t-th original rune, first 265 common slots;
 *   (2) identical source print-line ordinal and rune-column position,
 *       255 slots over 12 source lines.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const segments = read('resources/liber-primus/lp2-transcription.txt').split('%');
const runes = new Map(corpus.runes.map((s, i) => [s, i]));
const alphabet = new Map(corpus.translit.map((s, i) => [s.toLowerCase(), i]));
const digraphs = ['th', 'ng', 'eo', 'oe', 'ae', 'ia', 'ea'];
const mod = n => ((n % 29) + 29) % 29;

/** @param {string} spelling @returns {number[] | null} */
function gp(spelling) {
  const s = spelling.toLowerCase().replace(/qu/g, 'cw')
    .replace(/v/g, 'u').replace(/[kq]/g, 'c').replace(/z/g, 's')
    .replace(/ing/g, 'ng').replace(/io/g, 'ia');
  const output = [];
  for (let i = 0; i < s.length;) {
    const token = digraphs.find(x => s.startsWith(x, i)) || s[i];
    const value = alphabet.get(token);
    if (value === undefined) return null;
    output.push(value);
    i += token.length;
  }
  return output;
}

/** @param {number} page */
function parse(page) {
  const physical = segments[page];
  const lineRunes = physical.split('/')
    .map(line => [...line].filter(rune => runes.has(rune))
      .map(rune => runes.get(rune))).filter(line => line.length > 0);
  const wordLengths = [...physical.replace(/\/\s*/g, '')
    .matchAll(/[\u16a0-\u16ff]+/g)].map(match => [...match[0]].length);
  const cipher = lineRunes.flat();
  assert.deepEqual(cipher, corpus.pages[page].indices,
    'original source page ' + page);
  assert.equal(lineRunes.length, 12);
  assert.equal(wordLengths.reduce((a, b) => a + b, 0), cipher.length);
  return {page, cipher, lineLengths:lineRunes.map(line => line.length),
    wordLengths};
}
const pages = [24, 25, 26].map(parse);
assert.deepEqual(pages.map(p => p.cipher.length), [270, 273, 265]);

const lengthGlobal = 265;
const width = Array.from({length:12}, (_, line) =>
  Math.min(...pages.map(p => p.lineLengths[line])));
assert.equal(width.reduce((a, b) => a + b, 0), 255);

const indicesLine = pages.map(p => {
  let absolute = 0;
  const indices = [];
  for (let line = 0; line < 12; line++) {
    for (let column = 0; column < width[line]; column++) {
      indices.push(absolute + column);
    }
    absolute += p.lineLengths[line];
  }
  assert.equal(absolute, p.cipher.length);
  return indices;
});
const globalOriginal = pages.map(p => p.cipher.slice(0, lengthGlobal));
const lineOriginal = pages.map((p, j) =>
  indicesLine[j].map(index => p.cipher[index]));

/** @returns {number[][]} Every nonzero projective GF(29)^3 direction. */
function projectiveRows() {
  const rows = [];
  for (let b = 0; b < 29; b++) {
    for (let c = 0; c < 29; c++) rows.push([1, b, c]);
  }
  for (let c = 0; c < 29; c++) rows.push([0, 1, c]);
  rows.push([0, 0, 1]);
  assert.equal(rows.length, 871);
  return rows;
}
const directions = projectiveRows();

/** @param {number[]} seq */
function collisionCount(seq) {
  const n = seq.length, histogram = new Array(29).fill(0);
  for (const symbol of seq) histogram[symbol]++;
  const pairs = histogram.reduce((a, x) => a + x * (x - 1), 0);
  return {pairs, ioc:pairs / (n * (n - 1))};
}

/**
 * @param {number[][]} triple Three same-length rune tapes.
 * @returns {{direction:number[],pairs:number,ioc:number}[]}
 */
function rank(triple) {
  assert.equal(triple.length, 3);
  const n = triple[0].length;
  assert(triple.every(x => x.length === n));
  const ranked = [];
  for (const direction of directions) {
    const h = new Array(29).fill(0);
    for (let t = 0; t < n; t++) {
      const value = mod(direction[0] * triple[0][t] +
        direction[1] * triple[1][t] + direction[2] * triple[2][t]);
      h[value]++;
    }
    const pairs = h.reduce((a, x) => a + x * (x - 1), 0);
    ranked.push({direction, pairs, ioc:pairs / (n * (n - 1))});
  }
  ranked.sort((a, b) => b.pairs - a.pairs);
  return ranked;
}
const observedGlobal = rank(globalOriginal);
const observedLine = rank(lineOriginal);
assert.deepEqual(observedGlobal[0].direction, [0, 1, 11]);
assert.deepEqual(observedLine[0].direction, [1, 10, 6]);
assert.ok(Math.abs(observedGlobal[0].ioc - 0.0375071469411092) < 1e-14);
assert.ok(Math.abs(observedLine[0].ioc - 0.03810406052184653) < 1e-14);
assert.equal(observedGlobal.filter(x => x.ioc >= 0.048).length, 0);
assert.equal(observedLine.filter(x => x.ioc >= 0.048).length, 0);

/**
 * @param {number[][]} triple
 * @param {number} trials
 * @returns {{trials:number,aboveOrEqual:number,minimum:number,median:number,maximum:number}}
 */
function cyclicControls(triple, trials) {
  const n = triple[0].length, best = rank(triple)[0].pairs;
  const maxima = [];
  for (let i = 0; i < trials; i++) {
    const shifts = [0, (i * 13 + 17) % n, (i * 47 + 31) % n];
    const shifted = triple.map((stream, lane) =>
      stream.map((_, t) => stream[(t + shifts[lane]) % n]));
    maxima.push(rank(shifted)[0].pairs);
  }
  maxima.sort((a, b) => a - b);
  const denominator = n * (n - 1);
  return {trials, aboveOrEqual:maxima.filter(x => x >= best).length,
    minimum:maxima[0] / denominator,
    median:maxima[Math.floor(trials / 2)] / denominator,
    maximum:maxima.at(-1) / denominator};
}
const rotatedGlobal = cyclicControls(globalOriginal, 100);
const rotatedLine = cyclicControls(lineOriginal, 40);
assert.equal(rotatedGlobal.aboveOrEqual, 100);
assert.equal(rotatedLine.aboveOrEqual, 31);

/**
 * @param {number} seed
 * @returns {()=>number} Unsigned xorshift32 stream.
 */
function randomGenerator(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {Map<number,number[][]>} pool @param {()=>number} random */
function drawPages(pool, random) {
  return pages.map(page =>
    page.wordLengths.flatMap(length => {
      const choices = pool.get(length);
      assert(choices && choices.length, 'no native word of length ' + length);
      return choices[random() % choices.length];
    }));
}

/** @param {string} body */
function wordPool(body) {
  const pool = new Map();
  for (const match of body.matchAll(/[A-Za-z]+/g)) {
    const native = gp(match[0]);
    if (!native) continue;
    if (!pool.has(native.length)) pool.set(native.length, []);
    pool.get(native.length).push(native);
  }
  return pool;
}
const references = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt'
];
const authorControls = references.map((reference, author) => {
  const pool = wordPool(read(reference));
  const random = randomGenerator((0x33014563 + author * 31777) >>> 0);
  let minimumGlobal = Infinity, minimumLine = Infinity;
  let belowGlobal = 0, belowLine = 0;
  for (let trial = 0; trial < 1000; trial++) {
    const native = drawPages(pool, random);
    for (let j = 0; j < 3; j++) {
      const global = collisionCount(native[j].slice(0, 265)).ioc;
      const line = collisionCount(indicesLine[j].map(i => native[j][i])).ioc;
      minimumGlobal = Math.min(minimumGlobal, global);
      minimumLine = Math.min(minimumLine, line);
      if (global <= observedGlobal[0].ioc) belowGlobal++;
      if (line <= observedLine[0].ioc) belowLine++;
    }
  }
  assert.equal(belowGlobal, 0);
  assert.equal(belowLine, 0);
  return {reference, nativeReceiverSamples:3000,
    minimumGlobal, minimumLine, belowGlobal, belowLine};
});
assert.deepEqual(authorControls.map(x =>
  Number(x.minimumGlobal.toFixed(8))), [0.04971412, 0.04854202, 0.04988565]);
assert.deepEqual(authorControls.map(x =>
  Number(x.minimumLine.toFixed(8))), [0.04965262, 0.04786166, 0.04974525]);

// Source-shaped, original GP word-length positive. A nontrivial matrix,
// rather than a common pad, genuinely mixes all three plaintext pages.
const textblob = read('resources/control/english_wordfreq_textblob.txt');
const plantPool = new Map();
for (const line of textblob.split(/\r?\n/)) {
  const match = /^([a-z]+)\s+(\d+)/.exec(line);
  if (!match) continue;
  const word = gp(match[1]);
  if (!word) continue;
  if (!plantPool.has(word.length)) plantPool.set(word.length, []);
  plantPool.get(word.length).push(word);
}
const plantedNative = drawPages(plantPool, randomGenerator(0x3301a9bc));
const mixingMatrix = [[1, 2, 3], [5, 7, 11], [13, 17, 19]];
const inverseRows = [
  {direction:[1,25,22], scale:5, plaintextPage:0},
  {direction:[1,2,17], scale:2, plaintextPage:1},
  {direction:[1,13,15], scale:7, plaintextPage:2}
];

/** @param {number[][]} triple */
function forward(triple) {
  const n = triple[0].length;
  return mixingMatrix.map(row => Array.from({length:n}, (_, t) =>
    mod(row[0] * triple[0][t] + row[1] * triple[1][t] +
      row[2] * triple[2][t])));
}
/** @param {number[][]} triple */
function inverse(triple) {
  return inverseRows.map(({direction, scale}) =>
    Array.from({length:triple[0].length}, (_, t) =>
      mod(scale * (direction[0] * triple[0][t] +
        direction[1] * triple[1][t] + direction[2] * triple[2][t]))));
}
for (let a = 0; a < 3; a++) {
  for (let b = 0; b < 3; b++) {
    const product = inverseRows[a].direction.reduce((sum, x, i) =>
      sum + x * mixingMatrix[i][b], 0);
    assert.equal(mod(inverseRows[a].scale * product), a === b ? 1 : 0);
  }
}
const expectedRows = inverseRows.map(x => x.direction.join(',')).sort();
for (const [label, source] of [
  ['global', plantedNative.map(p => p.slice(0, 265))],
  ['line', plantedNative.map((p, j) =>
    indicesLine[j].map(index => p[index]))]
]) {
  const plantedCipher = forward(source);
  const rankPositive = rank(plantedCipher);
  const top3 = rankPositive.slice(0, 3).map(x => x.direction.join(',')).sort();
  assert.deepEqual(top3, expectedRows, label + ' exact three inverse rows');
  assert.deepEqual(inverse(plantedCipher), source, label + ' all plaintext runes');
  assert.deepEqual(forward(inverse(plantedCipher)), plantedCipher,
    label + ' all ciphertext runes');
  assert(rankPositive[2].ioc > 0.05);
  console.log('POSITIVE', label, source[0].length,
    'runes per native original-shaped page, 3/3 true inverse rows',
    'ranked top three; replay exact; third IoC', rankPositive[2].ioc);
}
console.log('ORIGINAL global 265 triples', JSON.stringify({
  best:observedGlobal[0], highSignalRows:0, cyclicControl:rotatedGlobal}));
console.log('ORIGINAL source-line 255 triples', JSON.stringify({
  best:observedLine[0], highSignalRows:0, cyclicControl:rotatedLine}));
console.log('NATIVE GP original-word-shape 9000 receiver controls',
  JSON.stringify(authorControls));
console.log('PASS: no nonzero GF29 linear row across any original three-page',
  'alignment recovers GP-native English-like symbol concentration; this',
  'excludes any one fixed invertible 3x3 matrix with any secret coefficients',
  'under that plaintext register. No new unknown plaintext.');
