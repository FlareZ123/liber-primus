'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const SOURCE_MD = path.join(ROOT, 'resources', 'cicada2016-4gq25.md');
const GRID_JSON = path.join(ROOT, 'resources', 'liber-primus', 'base60-grid.json');
const CORPUS_JSON = path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json');

const sourceMd = fs.readFileSync(SOURCE_MD, 'utf8');
const grid = JSON.parse(fs.readFileSync(GRID_JSON, 'utf8'));
const corpus = JSON.parse(fs.readFileSync(CORPUS_JSON, 'utf8'));

function parseSignedWords(md) {
  const start = md.indexOf('Hello.');
  const finish = md.indexOf('```', start);
  assert(start >= 0 && finish > start, 'normalized authenticated 2016 text block not found');
  const alpha = md.slice(start, finish).match(/[A-Za-z]+/g).map((x) => x.toUpperCase());
  const end = alpha.indexOf('OPENPGP');
  assert(end >= 0, 'OPENPGP missing from normalized signed text');
  return alpha.slice(0, end + 1);
}

const GP = new Map([
  ['F', 0], ['U', 1], ['TH', 2], ['O', 3], ['R', 4], ['C', 5],
  ['G', 6], ['W', 7], ['H', 8], ['N', 9], ['I', 10], ['J', 11],
  ['EO', 12], ['P', 13], ['X', 14], ['S', 15], ['T', 16], ['B', 17],
  ['E', 18], ['M', 19], ['L', 20], ['NG', 21], ['OE', 22], ['D', 23],
  ['A', 24], ['AE', 25], ['Y', 26], ['IA', 27], ['EA', 28],
]);

const DIGRAPHS = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA'];

function gpEncode(word) {
  const s = word.toUpperCase().replaceAll('V', 'U').replaceAll('K', 'C');
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (DIGRAPHS.includes(pair)) {
      out.push(GP.get(pair));
      i += 2;
      continue;
    }
    const ch = s[i];
    assert(GP.has(ch), `no GP encoding for ${word} at ${ch}`);
    out.push(GP.get(ch));
    i += 1;
  }
  return out;
}

function gp0(word) {
  return gpEncode(word).reduce((a, b) => a + b, 0);
}

function base60(token) {
  assert.strictEqual(token.length, 2);
  const hi = grid.alphabet.indexOf(token[0]);
  const lo = grid.alphabet.indexOf(token[1]);
  assert(hi >= 0 && lo >= 0, `invalid base60 token ${token}`);
  return hi * 60 + lo;
}

function low60(token) {
  const lo = grid.alphabet.indexOf(token[1]);
  assert(lo >= 0, `invalid low digit in ${token}`);
  return lo;
}

function page(n) {
  const p = corpus.pages.find((x) => x.page === n);
  assert(p, `missing physical p${n}`);
  return p;
}

function sub29(cipher, key) {
  assert.strictEqual(cipher.length, key.length);
  return cipher.map((v, i) => (v - key[i] + 29) % 29);
}

const words = parseSignedWords(sourceMd);
assert.strictEqual(words.length, 43, 'authenticated source tokenizer must give 43 words');

const expectedTail = [
  'YOU', 'WILL', 'BE', 'FOUND', 'GOOD', 'LUCK',
  'BEWARE', 'FALSE', 'PATHS', 'VERIFY', 'OPENPGP',
];
assert.deepStrictEqual(words.slice(32, 43), expectedTail);

const state = { K: 2, e: 3, q: 4, g: 5, a: 6, p: 23, B: 19 };
assert.deepStrictEqual(
  expectedTail.map((w) => gpEncode(w).length),
  [state.e, state.q, state.K, state.g, state.q, state.q, state.a, state.g, state.q, state.a, state.g + state.K],
);

// Original p50 base60 pointer route: SEEKS71, depth p=23 -> physical p32.
const tokens = grid.rows.flat();
const bytes = grid.byte_rows.flat();
assert.strictEqual(tokens.length, 256);
assert.strictEqual(bytes.length, 256);
for (let i = 0; i < 256; i += 1) {
  assert.strictEqual(base60(tokens[i]), bytes[i], `base60 mismatch at cell ${i}`);
}
assert.strictEqual(gp0('SEEKS'), 71);
let ptr = gp0('SEEKS');
const seeksChain = [ptr];
for (let i = 0; i < state.p; i += 1) {
  ptr = bytes[ptr];
  seeksChain.push(ptr);
}
assert.strictEqual(ptr, 32, 'SEEKS depth-p pointer must terminate on physical p32');

// P32 center B enters p33.
assert.strictEqual(bytes[state.B], 33, 'p50[B=19] must select p33');

// P33 RISE title uses the visible [3,5] lengths. Literal rise +2 lands p35 FOUND.
const risePair = [3, 5];
const literalRise = risePair[1] - risePair[0];
assert.strictEqual(literalRise, 2);
assert.strictEqual(words[33], 'WILL');
assert.strictEqual(words[33 + literalRise], 'FOUND');

// FOUND self-number -> PATH -> EPIPHANY closes into the already fixed p32 route.
assert.strictEqual(tokens[35], '0d');
assert.strictEqual(bytes[35], gp0('PATH'));
assert.strictEqual(gp0('PATH'), 39);
assert.strictEqual(tokens[39], '05');
assert.strictEqual(bytes[39], 5);
assert.strictEqual(words[5], 'EPIPHANY');

// P32 READ OUT gives THE DEVOTED at [7,8]; DIRECTION index29 folds to GOOD LUCK [36,37].
const directionIndex = words.indexOf('DIRECTION');
assert.strictEqual(directionIndex, 29);
const p32Readout = [7, 8];
const goodLuck = p32Readout.map((x) => x + directionIndex);
assert.deepStrictEqual(goodLuck, [36, 37]);
assert.deepStrictEqual(goodLuck.map((x) => words[x]), ['GOOD', 'LUCK']);

// New visual continuation: original pp36-38 print Arabic section markers 1..5.
// With LUCK fixed at signed index37, the literal section numbers enumerate the entire warning tail.
const printedSectionMarkers = [1, 2, 3, 4, 5];
const warningIndices = printedSectionMarkers.map((n) => 37 + n);
assert.deepStrictEqual(warningIndices, [38, 39, 40, 41, 42]);
assert.deepStrictEqual(
  warningIndices.map((x) => words[x]),
  ['BEWARE', 'FALSE', 'PATHS', 'VERIFY', 'OPENPGP'],
);

// The already source-selected LUCK -> BEWARE p50-low relation lands on p38.
assert.strictEqual(gp0('LUCK'), 31);
assert.strictEqual(gp0('BEWARE'), 88);
assert.strictEqual(tokens[88], '3V');
assert.strictEqual(low60(tokens[88]), gp0('LUCK'));
assert.strictEqual(words[38], 'BEWARE');

// Original-ciphertext local inverses already selected on the corridor.
const local = [
  { page: 33, start: 132, target: 'WILL', key: [25, 5, 26, 2] },
  { page: 34, start: 4, target: 'BE', key: [24, 5] },
  { page: 38, start: 57, target: 'BEWARE', key: [20, 7, 7, 7, 13, 4] },
  { page: 40, start: 71, target: 'PATHS', key: [20, 20, 12, 6] },
];
for (const item of local) {
  const target = gpEncode(item.target);
  const cipher = page(item.page).indices.slice(item.start, item.start + target.length);
  assert.deepStrictEqual(
    sub29(cipher, item.key),
    target,
    `p${item.page} local inverse failed for ${item.target}`,
  );
}

// P39's independently selected DIVINITY word sheds to GP0 22; p50[22]=59=VERIFY.
const p39word = page(39).indices.slice(105, 110);
assert.deepStrictEqual(p39word, [8, 6, 4, 12, 16]);
const p39inner = p39word.slice(1, -1);
assert.deepStrictEqual(p39inner, [6, 4, 12]);
assert.strictEqual(p39inner.reduce((a, b) => a + b, 0), 22);
assert.strictEqual(tokens[22], '0x');
assert.strictEqual(bytes[22], gp0('VERIFY'));
assert.strictEqual(gp0('VERIFY'), 59);
assert.strictEqual(words[41], 'VERIFY');

// P40 repeats the same visible [3,5] RISE encoder; +2 lands exactly on p42 OPENPGP.
assert.strictEqual(40 + literalRise, 42);
assert.strictEqual(words[42], 'OPENPGP');

console.log('PASS lp2_p32_p42_signed_tail_corridor_sft');
console.log('signed tail:', words.slice(32, 43).join(' '));
console.log('SEEKS depth-p chain:', seeksChain.join(' -> '));
console.log('p32 DIRECTION fold:', p32Readout, '+', directionIndex, '=>', goodLuck, 'GOOD LUCK');
console.log('section markers:', printedSectionMarkers, 'from LUCK37 =>', warningIndices, warningIndices.map((i) => words[i]).join(' '));
console.log('corridor local inverses:', local.map((x) => `p${x.page}:${x.target}`).join(', '));
console.log('p39 shed -> VERIFY; p40 RISE+2 -> p42 OPENPGP');
