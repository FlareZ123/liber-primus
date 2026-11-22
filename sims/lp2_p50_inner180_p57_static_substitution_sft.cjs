'use strict';

/**
 * A source-led, all-secret collision test of the direct p50 180-interior
 * byte -> terminal solved GP29 rune lookup proposal. The 95 clear runes on
 * physical p57 are withheld from key fitting: every possible static map from
 * 256 byte symbols to 29 GP symbols must be consistent on repeated inputs.
 *
 * Node 22 CommonJS; read-only; original grid and terminal corpus inputs.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'lp2-grid-256.json'), 'utf8'));
const book = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const bytes = grid.pages.flatMap(page => page.bytes);
const tokens = grid.pages.flatMap(page => page.tokens);
const interior = Array.from({ length: 256 }, (_, index) => index)
  .filter(index => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    return row >= 1 && row <= 30 && col >= 1 && col <= 6;
  });
assert.equal(bytes.length, 256);
assert.equal(tokens.length, 256);
assert.equal(interior.length, 180);
assert.equal(256 - interior.length, 76);
const clear = book.pages.find(page => page.page === 57).indices;
assert.equal(book.pages.find(page => page.page === 56).indices.length, 85);
assert.equal(clear.length, 95);

/** @param {(index:number)=>string|number} keyAt @param {number[]} output */
function collisionAudit(keyAt, output) {
  const first = new Map();
  const violations = [];
  let repeatedKeys = 0;
  for (let i = 0; i < output.length; i++) {
    const key = keyAt(i);
    if (!first.has(key)) {
      first.set(key, { index: i, symbol: output[i] });
      continue;
    }
    repeatedKeys++;
    const earlier = first.get(key);
    if (earlier.symbol !== output[i]) {
      violations.push({
        byte_or_digit: key, p57_first_offset: earlier.index, p57_second_offset: i,
        first_gp: book.translit[earlier.symbol], second_gp: book.translit[output[i]],
        first_grid_index: interior[85 + earlier.index],
        second_grid_index: interior[85 + i]
      });
    }
  }
  return { repeatedKeys, contradictions: violations.length, examples: violations.slice(0, 6) };
}

const lookup = i => bytes[interior[85 + i]];
const direct = collisionAudit(lookup, clear);
assert.deepEqual([direct.repeatedKeys, direct.contradictions], [16, 15]);
assert(direct.examples.some(x => x.byte_or_digit === 86 && x.first_gp === 'P' && x.second_gp === 'E'));

// Positive control: an arbitrarily chosen secret substitution map, including
// repeated bytes, satisfies all exact collisions and a one-rune mutation breaks it.
const plantedMap = Array.from({ length: 256 }, (_, key) => (key * 13 + 7) % 29);
const planted = Array.from({ length: clear.length }, (_, i) => plantedMap[lookup(i)]);
assert.equal(collisionAudit(lookup, planted).contradictions, 0);
const tampered = planted.slice();
tampered[6] = (tampered[6] + 1) % 29;
assert(collisionAudit(lookup, tampered).contradictions > 0);
const projections = [
  ['full byte', lookup],
  ['mod29', i => lookup(i) % 29],
  ['token first digit', i => tokens[interior[85 + i]][0]],
  ['token last digit', i => tokens[interior[85 + i]][1]]
].map(([name, keyAt]) => ({ name, ...collisionAudit(keyAt, clear) }));
console.log(JSON.stringify({
  source: 'p50 32x8 printed grid, natural 30x6 interior, row-major, p56 85 then p57 95 runes',
  result: 'rejected: no static, position-independent byte-to-GP29 substitution exists',
  total_interior: interior.length,
  p57_known_plaintext_count: clear.length,
  projections,
  positive_control: 'PASS: synthetic static table and one-rune tamper',
  unknown_plaintext_recovered: false
}, null, 2));
