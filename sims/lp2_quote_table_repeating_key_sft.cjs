'use strict';

/**
 * Original LP2 p40/p53 duplicated-quotation vs p49–51 table-key test.
 * Conditional hypothesis: the first 21 runes of the two quotations are
 * identical plaintext and the printed table supplies a repeating additive key.
 * @returns {void}
 */
function main() {
  const assert = require('node:assert/strict');
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  /** @param {string} file */
  const load = (file) => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', file), 'utf8'));
  /** @param {number} n */
  const mod = (n) => ((n % 29) + 29) % 29;
  const book = load('lp2-corpus.json');
  const grid = load('lp2-grid-256.json');
  const marks = load('lp2-quote-punctuation-spans.json');
  const C = book.pages.flatMap((p) => p.indices);
  const a = 9811;
  const b = 12522;
  const n = 21;
  assert.equal(book.pages[50].indices.length, 0);
  assert.equal(book.pages.slice(0, 56).reduce((sum, p) => sum + p.indices.length, 0), 12956);
  assert(marks.quotes.some((q) => q.start === a && q.end === 9869));
  assert(marks.quotes.some((q) => q.start === b && q.end === 12592));
  const first = C.slice(a, a + n);
  const second = C.slice(b, b + n);
  const diff = first.map((v, i) => mod(second[i] - v));
  assert.deepEqual(diff, [28,20,22,13,27,19,10,3,2,6,20,24,27,13,3,10,15,2,0,28,18]);
  const tokens = grid.pages.flatMap((p) => p.tokens);
  assert.equal(tokens.length, 256);
  const bytes = tokens.map((token) => {
    assert.equal(token.length, 2);
    const h = grid.alphabet.indexOf(token[0]);
    const l = grid.alphabet.indexOf(token[1]);
    assert(h >= 0 && l >= 0);
    const v = h * 60 + l;
    assert(v >= 0 && v <= 255);
    return v;
  });
  const layouts = {
    rows: bytes,
    columns: Array.from({ length: 256 }, (_, i) => bytes[(i % 32) * 8 + Math.floor(i / 32)]),
  };
  /**
   * @param {number[]} key
   * @param {number} phase
   * @param {number} sign
   * @param {number[]} x
   * @param {number[]} y
   */
  function score(key, phase, sign, x, y) {
    let hits = 0;
    for (let i = 0; i < n; i += 1) {
      const ka = key[(phase + a + i) % key.length];
      const kb = key[(phase + b + i) % key.length];
      if (mod(sign * (kb - ka)) === mod(y[i] - x[i])) hits += 1;
    }
    return hits;
  }
  const outcomes = [];
  for (const [layout, values] of Object.entries(layouts)) {
    const transports = {
      residue: values.map((v) => v % 29),
      base29: values.flatMap((v) => [Math.floor(v / 29), v % 29]),
    };
    for (const [transport, key] of Object.entries(transports)) {
      let max = 0;
      const winners = [];
      for (const sign of [-1, 1]) {
        for (let phase = 0; phase < key.length; phase += 1) {
          const hits = score(key, phase, sign, first, second);
          if (hits > max) {
            max = hits;
            winners.length = 0;
          }
          if (hits === max) winners.push({ sign, phase });
        }
      }
      assert.equal(max, transport === 'residue' ? 5 : 4);
      const plain = book.pages[57].indices.slice(0, n);
      assert.equal(plain.length, n);
      const x = plain.map((v, i) => mod(v + key[(8 + a + i) % key.length]));
      const y = plain.map((v, i) => mod(v + key[(8 + b + i) % key.length]));
      assert.equal(score(key, 8, 1, x, y), n);
      for (let i = 0; i < n; i += 1) {
        assert.equal(mod(x[i] - key[(8 + a + i) % key.length]), plain[i]);
        assert.equal(mod(y[i] - key[(8 + b + i) % key.length]), plain[i]);
      }
      outcomes.push({ layout, transport, period: key.length, best_hits: max, required: n, settings_tested: 2 * key.length, winners });
    }
  }
  assert.equal(outcomes.length, 4);
  console.log(JSON.stringify({ conditional_plaintext_hypothesis: 'p40 and p53 quote first 21 GP runes identical', offsets: [a, b], diff, outcomes, planted_control_hits: 21 }, null, 2));
}
main();
