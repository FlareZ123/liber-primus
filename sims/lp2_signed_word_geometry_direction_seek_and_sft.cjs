#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r/g, '');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const signed = read('resources/historical/cicada2016-4gq25-outguess.asc');
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));

const clear = signed
  .split('-----BEGIN PGP SIGNATURE-----')[0]
  .split(/\n\n/u)
  .slice(1)
  .join('\n');
const words = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());

assert.equal(words.length, 43);
assert.equal(words[2], 'PATH');
assert.equal(words[5], 'EPIPHANY');
assert.equal(words[23], 'ROAD');
assert.equal(words[29], 'DIRECTION');
assert.equal(words[30], 'SEEK');
assert.equal(words[31], 'AND');

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/[KQ]/g, 'C')
    .replace(/V/g, 'U')
    .replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith('ING', offset)) {
      out.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith('IO', offset)) {
      out.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) => normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, 'unmapped GP spelling: ' + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}
const gpLength = (word) => gp(word).length;
assert.equal(gpLength('DIRECTION'), 9);
assert.equal(gpLength('SEEK'), 4);
assert.equal(gpLength('AND'), 3);
assert.equal(gpLength('EPIPHANY'), 8);
assert.equal(gpLength('SEEKS'), 5);
assert.equal(gpLength('THE'), 2);

const tokens = grid.rows.flat();
const a60 = grid.alphabet;
const a59 = a60.replace('f', '');
const numeral = (token, alphabet, radix) =>
  radix * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
const d59 = tokens.map((token) => numeral(token, a59, 59));
const d60 = tokens.map((token) => numeral(token, a60, 60));
const sink = 189;

/** @param {number} start @returns {number[]} */
function path59(start) {
  const out = [start];
  const seen = new Set();
  while (out.at(-1) !== sink) {
    const cell = out.at(-1);
    assert.ok(cell >= 0 && cell < 256);
    assert.ok(!seen.has(cell), 'unexpected base59 cycle');
    seen.add(cell);
    out.push(d59[cell]);
  }
  return out;
}

const fixed59 = d59
  .map((value, index) => value === index ? index : null)
  .filter((value) => value !== null);
assert.deepEqual(fixed59, [sink]);
for (let cell = 0; cell < 256; cell += 1) path59(cell);

assert.equal(d59[43], 72);
assert.equal(d60[43], 73);

const mirror = (cell) => 8 * Math.floor(cell / 8) + (7 - (cell % 8));
assert.equal(mirror(sink), 186);
const mirrorDistance = Math.abs(sink - mirror(sink));
assert.equal(mirrorDistance, 3);

const rows = [];
for (let index = 0; index < words.length - 2; index += 1) {
  const column = index % 29;
  if (column >= 8) continue;
  const row = gpLength(words[index]);
  const address = 8 * row + column;
  if (address >= 256) continue;
  const pointerPath = path59(address);
  const depth = pointerPath.length - 1;
  const nextLength = gpLength(words[index + 1]);
  const thirdLength = gpLength(words[index + 2]);
  rows.push({
    index,
    word: words[index],
    next: words[index + 1],
    third: words[index + 2],
    row,
    column,
    address,
    depth,
    nextLength,
    thirdLength,
    depthHit: depth === nextLength,
    mirrorHit: depth === nextLength && thirdLength === mirrorDistance,
  });
}

const depthHits = rows.filter((item) => item.depthHit);
assert.deepEqual(depthHits.map((item) => item.index), [5, 29]);
assert.deepEqual(depthHits.map((item) => item.address), [69, 72]);

const mirrorHits = rows.filter((item) => item.mirrorHit);
assert.deepEqual(mirrorHits.map((item) => item.index), [29]);
assert.deepEqual(
  [mirrorHits[0].word, mirrorHits[0].next, mirrorHits[0].third],
  ['DIRECTION', 'SEEK', 'AND'],
);

assert.deepEqual(path59(69), [69, 72, 161, 214, 247, 189]);
assert.deepEqual(path59(72), [72, 161, 214, 247, 189]);
assert.equal(d59[69], 72);
assert.equal(8 * gpLength('DIRECTION') + (29 % 29), 72);
assert.equal(8 * 23 + 2, 186);
assert.equal(8 * 23 + 5, 189);

console.log(JSON.stringify({
  status: 'PASS',
  sourceWords: words.length,
  cell43: { token: tokens[43], base59: d59[43], base60: d60[43], directionCoordinate: 72 },
  depthHits,
  mirrorHits,
  paths: { epiphany: path59(69), direction: path59(72) },
  mirrorRoot: {
    sink,
    mirror: mirror(sink),
    displacement: mirrorDistance,
    sourceCoordinates: {
      start186: [words[23], words[2]],
      sink189: [words[23], words[5]],
    },
  },
  classification:
    'Post-discovery finite source-family control. Canonical GP word length as row and source index mod29 as p50 column uniquely leaves DIRECTION/SEEK/AND after next-word depth and fixed mirror checks; no plaintext or global p50 codec is claimed.',
}, null, 2));
