'use strict';

/**
 * Original-source SFT for the p14 FOLD-word / 133-runic 7x7 historical
 * square hypothesis. Run: node sims/lp2_p14_foldword_133_stage10_sevensquare_sft.cjs
 *
 * Purely read-only. The 133-rune receiver and its alphabet are sourced
 * from committed originals; no plaintext, key, padding or word boundaries
 * are selected from the decoded output.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const historical = read('resources/cicada2014-openpuff-magic-squares.txt');
const stage11 = read('resources/historical/stage11-2014-index.html');
const literary = read('resources/control/gibran_prophet_58585.txt');
const GP = 29;
const mod = (n) => ((n % GP) + GP) % GP;

assert.match(stage11, /<title>133<\/title>/);
assert.match(stage11, /<div id="331">/);
assert.equal(corpus.runes.length, GP);
assert.equal(corpus.translit.length, GP);

const square = historical.trim().split(/\r?\n\s*\r?\n/)[1]
  .trim().split(/\r?\n/).map((line) =>
    line.trim().split(/\s+/).map((value) => mod(Number(value))));
assert.equal(square.length, 7);
for (const row of square) assert.equal(row.length, 7);

const sourceSquareInteger = historical.trim().split(/\r?\n\s*\r?\n/)[1]
  .trim().split(/\r?\n/).map((line) =>
    line.trim().split(/\s+/).map(Number));
for (const row of sourceSquareInteger) {
  assert.equal(row.reduce((a, b) => a + b, 0), 1033);
}

function inverse(A) {
  const n = A.length;
  const t = A.map((row, i) =>
    [...row, ...Array.from({length: n}, (_, j) => Number(i === j))]);
  for (let j = 0; j < n; j++) {
    const pivot = t.findIndex((row, i) => i >= j && row[j] !== 0);
    assert.ok(pivot >= 0, 'source historical square must be invertible over GF29');
    [t[j], t[pivot]] = [t[pivot], t[j]];
    const reciprocal = Array.from({length: 28}, (_, i) => i + 1)
      .find((k) => mod(k * t[j][j]) === 1);
    assert.ok(reciprocal !== undefined);
    t[j] = t[j].map((v) => mod(v * reciprocal));
    for (let i = 0; i < n; i++) {
      if (i === j) continue;
      const ratio = t[i][j];
      t[i] = t[i].map((v, k) => mod(v - ratio * t[j][k]));
    }
  }
  return t.map((row) => row.slice(n));
}

const transpose = (A) => A[0].map((_, j) => A.map((row) => row[j]));

function transform(A, symbols, layout) {
  assert.equal(symbols.length % 7, 0);
  const n = symbols.length / 7;
  const out = symbols.slice();
  for (let i = 0; i < n; i++) {
    const positions = Array.from({length: 7}, (_, j) =>
      layout === 'adjacent' ? 7 * i + j : j * n + i);
    const vector = positions.map((pos) => symbols[pos]);
    positions.forEach((pos, j) => {
      out[pos] = mod(A[j].reduce(
        (sum, a, k) => sum + a * vector[k], 0));
    });
  }
  return out;
}

function decode(source, A, layout, direction) {
  const operand = direction === 'reverse' ? source.slice().reverse() : source;
  return transform(A, operand, layout);
}

function encode(plain, A, layout, direction) {
  const operand = transform(inverse(A), plain, layout);
  return direction === 'reverse' ? operand.reverse() : operand;
}

function ioc(seq) {
  const counts = Array(GP).fill(0);
  seq.forEach((x) => counts[x]++);
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (seq.length * (seq.length - 1));
}

function gpLiterary(source) {
  const first = source.indexOf('*** START OF');
  const last = source.indexOf('*** END OF');
  assert.ok(first >= 0 && last > first);
  const story = source.slice(source.indexOf('\n', first) + 1, last)
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase().replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const native = [];
  for (const token of story.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < token.length;) {
      let match = -1;
      for (let j = 0; j < corpus.translit.length; j++) {
        if (token.startsWith(corpus.translit[j], i) &&
          (match < 0 ||
           corpus.translit[j].length > corpus.translit[match].length)) {
          match = j;
        }
      }
      if (match < 0) i++;
      else {
        native.push(match);
        i += corpus.translit[match].length;
      }
    }
  }
  return native;
}

const original = corpus.pages[14].indices;
assert.equal(original.length, 137);
const runeWord = original.slice(2, 6)
  .map((i) => corpus.translit[i]).join('');
assert.equal(runeWord, 'FOLD');
const withoutFold = original.slice(0, 2).concat(original.slice(6));
assert.equal(withoutFold.length, 133);
assert.equal(withoutFold.length / 7, 19);

const literaryRunes = gpLiterary(literary);
const controlScores = [];
for (let pos = 0; pos + 133 <= literaryRunes.length; pos += 133) {
  controlScores.push(ioc(literaryRunes.slice(pos, pos + 133)));
}
controlScores.sort((a, b) => a - b);
assert.ok(controlScores.length >= 300);
const nativeControl = literaryRunes.slice(0, 133);
const candidateMatrices = [
  ['M', square],
  ['inverse(M)', inverse(square)],
  ['transpose(M)', transpose(square)],
  ['transpose(inverse(M))', transpose(inverse(square))],
];

console.log('SOURCES: p14=31.jpg; 137 authentic GP runes; FOLD at offsets 2..5.');
console.log('SOURCE: 2014 Stage11 HTML title=133, id=331; source Stage10 7x7 square with row sum 1033.');
console.log('Typed receiver: remove literal FOLD, 133=7x19; no plaintext-dependent choices.');
console.log('Independent Gibran native-GP controls:', controlScores.length,
  '133-rune disjoint windows, minimum IoC=', controlScores[0],
  'median=', controlScores[Math.floor(controlScores.length / 2)]);
console.log('Unmodified 133-rune original IoC:', ioc(withoutFold));
let successes = 0;
let maximum = 0;
const scores = [];
for (const [name, A] of candidateMatrices) {
  for (const layout of ['adjacent', 'stripes']) {
    for (const direction of ['forward', 'reverse']) {
      const plain = decode(withoutFold, A, layout, direction);
      const recovered = encode(plain, A, layout, direction);
      assert.deepEqual(recovered, withoutFold);
      const fullRestored = plain.slice(0, 2).concat(original.slice(2, 6),
        plain.slice(2));
      assert.equal(fullRestored.length, 137);
      assert.deepEqual(fullRestored.slice(2, 6), original.slice(2, 6));
      const plantedCipher = encode(nativeControl, A, layout, direction);
      assert.deepEqual(
        decode(plantedCipher, A, layout, direction), nativeControl);
      successes++;
      const score = ioc(plain);
      maximum = Math.max(maximum, score);
      scores.push(score);
      const preview = plain.slice(0, 16)
        .map((i) => corpus.translit[i]).join(' ');
      console.log(name, layout, direction, 'IoC=', score,
        'first16=', preview);
    }
  }
}
assert.equal(successes, 16);
assert.ok(maximum < controlScores[0],
  'all candidates must be below every native control window');
assert.ok(Math.abs(ioc(withoutFold) - 0.03463203463203463) < 1e-12);
console.log('PASS: 16 full-packet original inverses and exact original replay;');
console.log('PASS: 16 native-text planted positives; all outputs nonlinguistic by calibrated IoC.');
console.log('Scope: direct source 7x7 GF29 map after literal FOLD removal only.');
console.log('NO plaintext or authenticated decoder recovered.');
