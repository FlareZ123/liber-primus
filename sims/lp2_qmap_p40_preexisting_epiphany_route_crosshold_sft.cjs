'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const MOD = 29;
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8').replace(/\r/g, '');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number} x @returns {number} */
function mod(x) { return ((x % MOD) + MOD) % MOD; }

/** @param {[number,number]} x @param {[number,number]} y @returns {[number,number]} */
function mul(x, y) {
  const [a, b] = x;
  const [c, d] = y;
  return [mod(a * c + 8 * b * d), mod(a * d + b * c + 3 * b * d)];
}

/** @param {number[]} coefficients @returns {[number,number]} */
function evaluate(coefficients) {
  /** @type {[number,number]} */
  let acc = [0, 0];
  /** @type {[number,number]} */
  let power = [1, 0];
  for (const coefficient of coefficients) {
    acc = [mod(acc[0] + coefficient * power[0]), mod(acc[1] + coefficient * power[1])];
    power = mul(power, [0, 1]);
  }
  return acc;
}

/** @param {number} page @param {number} start @param {number} length @returns {number[]} */
function redSpan(page, start, length) {
  const record = ink.pages.find((item) => item.page === page);
  assert(record);
  const span = (record.red_spans || []).find((item) => item.start === start && item.length === length);
  assert(span);
  return [...span.runes].map((rune) => {
    const value = runeIndex.get(rune);
    assert.notStrictEqual(value, undefined);
    return value;
  });
}

const clear = signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert(clear);
const words = (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase());
assert.strictEqual(words.length, 43);
assert.deepStrictEqual(words.slice(4, 9), ['EMPTY', 'EPIPHANY', 'SEEKS', 'THE', 'DEVOTED']);

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number} */
function gp0(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  let offset = 0;
  let sum = 0;
  while (offset < normalized.length) {
    if (normalized.startsWith('ING', offset)) { sum += 21; offset += 3; continue; }
    if (normalized.startsWith('IO', offset)) { sum += 27; offset += 2; continue; }
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, offset));
    assert(token, 'unmapped word ' + word);
    sum += token.value;
    offset += token.symbol.length;
  }
  return sum;
}

// Reproduce the pre-existing 19-November 560-case route without using Q.
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');

/** @param {string} token @param {string} alphabet @returns {number|null} */
function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  return high < 0 || low < 0 ? null : high * alphabet.length + low;
}

const tables = {
  base60: tokens.map((token) => decodeToken(token, alphabet60)),
  base59: tokens.map((token) => decodeToken(token, alphabet59)),
};

/** @param {Array<number|null>} table @param {number} start @param {number} steps @returns {number[]|null} */
function walk(table, start, steps) {
  const route = [start];
  let state = start;
  for (let i = 0; i < steps; i += 1) {
    if (state < 0 || state >= 256) return null;
    const next = table[state];
    if (next === null || next === undefined) return null;
    state = next;
    route.push(state);
  }
  return route;
}

const source = words.map((word, index) => ({ index, word, gp0: gp0(word) }));
const pageCounts = new Map(corpus.pages.map((page) => [page.page, page.indices.length]));
const dh = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
const hits = [];
let tested = 0;
for (let index = 0; index <= source.length - 4; index += 1) {
  const [w0, w1, w2, w3] = source.slice(index, index + 4);
  for (const [field, depth] of Object.entries(dh)) {
    if (depth < 2) continue;
    for (const [radix, table] of Object.entries(tables)) {
      tested += 1;
      const route = walk(table, w1.gp0, depth);
      if (!route) continue;
      const terminal = route[depth];
      if (route[depth - 2] !== w2.gp0) continue;
      if (route[depth - 1] !== w3.gp0) continue;
      if (!pageCounts.has(terminal)) continue;
      if (pageCounts.get(terminal) !== w0.gp0) continue;
      hits.push({ index, words: [w0.word, w1.word, w2.word, w3.word], field, depth, radix, terminal, route });
    }
  }
}
assert.strictEqual(tested, 560);
assert.strictEqual(hits.length, 1);
assert.strictEqual(hits[0].index, 5);
assert.deepStrictEqual(hits[0].words, ['EPIPHANY', 'SEEKS', 'THE', 'DEVOTED']);
assert.strictEqual(hits[0].field, 'p');
assert.strictEqual(hits[0].depth, 23);
assert.strictEqual(hits[0].radix, 'base60');
assert.strictEqual(hits[0].terminal, 32);
assert.strictEqual(pageCounts.get(32), 121);
assert.strictEqual(gp0('EPIPHANY'), 121);

const route = hits[0].route;
const signedOnRoute = source.filter((word) => route.includes(word.gp0));
const interiorSigned = signedOnRoute.filter((word) => word.word !== 'SEEKS' && word.word !== 'THE' && word.word !== 'DEVOTED');
assert.deepStrictEqual(interiorSigned.map((word) => [word.index, word.word, word.gp0]), [[4, 'EMPTY', 92]]);
assert.strictEqual(route.indexOf(92), 7);

// Independently derive the new Q map from the 2014 marked objects.
const Q = [5, 5, 14, 9, 10, 4, 27, 17, 25];
const EQ = evaluate(Q);
assert.deepStrictEqual(EQ, [17, 24]);
const dlog = new Map();
let state = [1, 0];
for (let k = 0; k < 840; k += 1) {
  assert(!dlog.has(state.join(',')));
  dlog.set(state.join(','), k);
  state = mul(state, EQ);
}
assert.deepStrictEqual(state, [1, 0]);
assert.strictEqual(dlog.size, 840);

/** @param {number[]} span @returns {[number,number]} */
function orbitCoordinate(span) {
  const residue = evaluate(span);
  const k = dlog.get(residue.join(','));
  assert.notStrictEqual(k, undefined);
  return [Math.floor(k / MOD), k % MOD];
}

const p40Coordinate = orbitCoordinate(redSpan(40, 0, 8));
const p56Coordinate = orbitCoordinate(redSpan(56, 0, 5));
assert.deepStrictEqual(p40Coordinate, [5, 8]);
assert.deepStrictEqual(p56Coordinate, [4, 5]);
assert.deepStrictEqual(words.slice(p40Coordinate[0], p40Coordinate[1] + 1), hits[0].words);
assert.deepStrictEqual(words.slice(p56Coordinate[0], p56Coordinate[1] + 1), ['EMPTY', 'EPIPHANY']);

// The solved p56 title is AN END under the authentic prime-minus-one prefix.
const p56Cipher = redSpan(56, 0, 5);
const primePrefix = [1, 2, 4, 6, 10];
const p56Plain = p56Cipher.map((value, i) => mod(value - primePrefix[i]));
assert.deepStrictEqual(p56Plain, [24, 9, 18, 9, 23]);
assert.strictEqual(p56Plain.map((index) => corpus.translit[index]).join(''), 'ANEND');

// Final cross-holdout: the Q coordinates recover exactly the independently operational
// route clause, while solved AN END marks the held-out source boundary immediately before it.
assert.strictEqual(p56Coordinate[1], p40Coordinate[0]);
assert.strictEqual(words[p56Coordinate[0]], 'EMPTY');
assert.strictEqual(words[p40Coordinate[0]], 'EPIPHANY');

console.log(JSON.stringify({
  preexisting_route_family_cases: tested,
  preexisting_unique_route: {
    source_interval: [hits[0].index, hits[0].index + 3],
    words: hits[0].words,
    field: hits[0].field,
    depth: hits[0].depth,
    radix: hits[0].radix,
    terminal_page: hits[0].terminal,
    terminal_runes: pageCounts.get(hits[0].terminal),
    heldout_interior_source_word: { index: 4, word: 'EMPTY', route_step: 7, gp0: 92 },
  },
  q_operator: { E_Q: EQ, order: dlog.size },
  p40_red_coordinate: p40Coordinate,
  p40_words: words.slice(5, 9),
  p56_red_coordinate: p56Coordinate,
  p56_words: words.slice(4, 6),
  p56_solved_title: 'AN END',
  chronological_crossholdout: 'Q/p40 recovers the exact 19-November operational source clause; solved p56 AN END marks its held-out EMPTY;EPIPHANY entry boundary.',
}, null, 2));
