'use strict';

/**
 * Original LP2 second-00/X -> p55 receiver and two frozen cipher consumers.
 * SFT: node sims/lp2_p50_second00_x_p55_receiver_sft.cjs
 * Run from the repository root with Node.js 22.
 *
 * Research interpretation is conditional: neither the original period-256
 * equality-event clock nor the chosen pad consumer is a signed Cicada rule.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.bytes.length, 256);
assert.equal(corpus.pages.length, 58);

const observed = [];
let globalIndex = 0;
let predecessor = -1;
for (const page of corpus.pages.filter((page) => page.page < 56)) {
  for (let localIndex = 0; localIndex < page.indices.length; localIndex++) {
    const symbol = page.indices[localIndex];
    if (symbol === predecessor) {
      observed.push({
        page: page.page,
        localIndex,
        globalIndex,
        cell: (globalIndex - 1) % 256,
        symbol,
      });
    }
    predecessor = symbol;
    globalIndex++;
  }
}
assert.equal(globalIndex, 12956);
assert.equal(observed.length, 86);
assert.equal(tokens[192], '00');
assert.equal(tokens[229], '00');

const at192 = observed.filter((event) => event.cell === 192);
const at229 = observed.filter((event) => event.cell === 229);
assert.deepEqual(at192.map((event) => event.symbol), [26, 3, 1, 24]);
assert.deepEqual(at229, [{
  page: 36, localIndex: 228, globalIndex: 8934, cell: 229, symbol: 14,
}]);
assert.equal(corpus.translit[14], 'X');
assert.equal(corpus.prime[14], 47);
assert.equal(tokens[14], '33');
assert.equal(tokens[47], '1G');
assert.equal(tokens[205], '1G');

const p55 = corpus.pages[55].indices;
const wordLengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const exterior = [p55[0]];
const interior = [];
let cursor = 1;
for (const n of wordLengths) {
  exterior.push(p55[cursor]);
  for (let j = 1; j < n - 1; j++) interior.push(p55[cursor + j]);
  exterior.push(p55[cursor + n - 1]);
  cursor += n;
}
assert.equal(cursor, 76);
assert.equal(p55.length, 76);
assert.equal(exterior.length, 33);
assert.equal(interior.length, 43);
assert.equal(wordLengths.reduce((sum, n) => sum + n, 0), 75);
assert.deepEqual(corpus.pages.filter((page) => page.page <= 55 && page.runic_count === 76).map((page) => page.page), [55]);

const alphabet = grid.alphabet;
assert.equal(alphabet.length, 60);
const parseToken = (token, base) => base * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
assert.equal(parseToken('1G', 60), 76);
assert.equal(parseToken('1G', 59), 75);

// Independent, previously studied p57 prime-ordinal 205 points to this
// very same p50 token (the original PARABLE LIKE THE INSTAR clause).
const clause = corpus.pages[57].indices.slice(0, 19);
const clauseSum = clause.reduce((sum, index) => sum + corpus.prime[index], 0);
const primes = [];
for (let n = 2; primes.length < 205; n++) {
  let isPrime = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) { isPrime = false; break; }
  if (isPrime) primes.push(n);
}
assert.equal(clauseSum, 1259);
assert.equal(primes[204], 1259);

const orbit = [];
let node = corpus.prime[14];
do {
  assert.ok(orbit.length < 256, 'functional graph orbit must close');
  orbit.push(node);
  node = grid.bytes[node];
} while (node !== 47);
assert.deepEqual(orbit, [47, 76, 114, 197, 115, 247, 192, 0, 203, 68, 199]);
assert.ok(!orbit.includes(229));

// Candidate 1: source-cell-47 consecutive literal bytes as a GP29 pad
// over the 43 source-selected strict interiors, with the established
// subtractive direction used on solved p56.
const contiguousKey = grid.bytes.slice(47, 47 + interior.length);
assert.equal(contiguousKey.length, 43);
// Candidate 2: source-rooted eleven-cycle outputs, repeated 43 times.
const cycleKey = orbit.map((i) => grid.bytes[i]);

/** @param {number[]} input @param {number[]} key */
function subtractPad(input, key) {
  return input.map((v, i) => ((v - key[i % key.length]) % 29 + 29) % 29);
}
/** @param {number[]} input @param {number[]} key */
function addPad(input, key) {
  return input.map((v, i) => (v + key[i % key.length]) % 29);
}
/** @param {number[]} values */
function ioc(values) {
  const bins = Array(29).fill(0);
  for (const value of values) bins[value]++;
  return bins.reduce((sum, count) => sum + count * (count - 1), 0) / (values.length * (values.length - 1));
}
/** @param {number[]} values */
function printRunes(values) {
  return values.map((value) => corpus.translit[value]).join(' ');
}

const native = corpus.pages[57].indices.slice(0, 43);
for (const [label, key] of [['consecutive-base60-43', contiguousKey], ['functional-cycle-11', cycleKey]]) {
  const output = subtractPad(interior, key);
  assert.deepEqual(addPad(output, key), interior);
  const plantedCipher = addPad(native, key);
  assert.deepEqual(subtractPad(plantedCipher, key), native);
  console.log(label, 'IoC', ioc(output).toFixed(9), printRunes(output));
}
console.log('second-00 event', at229[0], 'prime', corpus.prime[at229[0].symbol]);
console.log('X pointers', { index14: tokens[14], prime47: tokens[47], p57Ordinal205: tokens[205] });
console.log('p55', { total: p55.length, completeWordBody: 75, exterior: exterior.length, interior: interior.length });
console.log('p50 directed 11-cycle', orbit.join(','));
console.log('PASS: all original-source structural checks and literal-pad positive controls');
