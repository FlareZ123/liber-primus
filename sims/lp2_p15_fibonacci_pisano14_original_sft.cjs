'use strict';

/**
 * Original p15 Fibonacci → GP29 period-14 exact source gate.
 *
 * The p15 square encodes Fibonacci-indexed prime ordinals, with duplicate
 * Fibonacci 1 represented once. This tests the independently determined
 * Fibonacci recurrence modulo the 29-rune GP alphabet on following pp16–22.
 *
 * The source does not explicitly prescribe a period-14 rune cipher.
 * This gate is a finite-native-English exclusion, not a recovered plaintext.
 *
 * SFT: node sims/lp2_p15_fibonacci_pisano14_original_sft.cjs
 * Node.js 20+, CommonJS, built-in modules only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.slice(16, 23).map(p => p.indices);
assert.deepEqual(pages.map(p => p.length), [267, 273, 260, 271, 269, 273, 131]);
const n = pages.reduce((s, p) => s + p.length, 0);
assert.equal(n, 1744);
const period = 14;
const mod = (x, m = 29) => ((x % m) + m) % m;

// Source-calibrated solved-LP1 spelling: ING→21; IO→27.
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} text @returns {number[]} */
function sourceNativeGP(text) {
  const clean = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (const word of clean.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith('ING', i)) {
        output.push(21);
        i += 3;
      } else if (word.startsWith('IO', i)) {
        output.push(27);
        i += 2;
      } else {
        const token = tokens.find(x => word.startsWith(x.s, i));
        assert(token, 'unmapped original GP spelling');
        output.push(token.i);
        i += token.s.length;
      }
    }
  }
  return output;
}

assert.deepEqual(sourceNativeGP('FOLLOWING'), [0, 3, 20, 20, 3, 7, 21]);
assert.deepEqual(sourceNativeGP('FUNCTION'), [0, 1, 9, 5, 16, 27, 9]);

/** @param {number[]} flat */
function overlay(flat) {
  assert.equal(flat.length, n);
  let position = 0;
  return pages.map(p => {
    const result = flat.slice(position, position += p.length);
    return result;
  });
}

/**
 * Secret bijections preserve symbol equality at matching clock positions.
 * @param {number[][]} chunks
 * @param {boolean} pageReset
 */
function samePhaseCollision(chunks, pageReset) {
  const groups = Array.from({length: pageReset ? 7 * period : period},
    () => new Uint32Array(29));
  let pos = 0;
  for (let page = 0; page < chunks.length; page++) {
    for (let j = 0; j < chunks[page].length; j++) {
      const clock = pageReset ? page * period + (j % period) : pos % period;
      groups[clock][chunks[page][j]]++;
      pos++;
    }
  }
  let pairs = 0, hits = 0;
  for (const group of groups) {
    const size = group.reduce((s, x) => s + x, 0);
    pairs += size * (size - 1);
    hits += group.reduce((s, x) => s + x * (x - 1), 0);
  }
  return {pairs, hits, rate: hits / pairs};
}

/**
 * @param {number[]} list
 * @param {boolean} pageReset
 */
function secretAffinePlant(list, pageReset) {
  const source = overlay(list);
  let global = 0;
  const encrypted = source.map((page, pageId) => page.map((p, j) => {
    const clock = pageReset ? pageId * period + j % period : global % period;
    global++;
    const a = 1 + (clock * 11 + 7) % 28;
    const b = (clock * 17 + 5) % 29;
    return mod(a * p + b);
  }));
  const recovered = [];
  global = 0;
  for (let pageId = 0; pageId < source.length; pageId++) {
    const output = [];
    for (let j = 0; j < source[pageId].length; j++) {
      const clock = pageReset ? pageId * period + j % period : global % period;
      global++;
      const a = 1 + (clock * 11 + 7) % 28;
      const b = (clock * 17 + 5) % 29;
      let inv = 1;
      while (mod(inv * a) !== 1) inv++;
      output.push(mod(inv * (encrypted[pageId][j] - b)));
    }
    recovered.push(output);
  }
  assert.deepEqual(recovered, source);
  assert.deepEqual(samePhaseCollision(encrypted, pageReset),
    samePhaseCollision(source, pageReset));
}

/** @returns {number[]} */
function fibonacciKey() {
  const seq = [0, 1];
  for (let i = 2; i <= period + 1; i++) {
    seq.push(mod(seq[i - 1] + seq[i - 2]));
  }
  assert.deepEqual(seq, [0, 1, 1, 2, 3, 5, 8, 13, 21, 5, 26, 2, 28, 1, 0, 1]);
  return seq.slice(0, period);
}

/** @param {number[]} ciphertext @param {number} sign */
function historicalFBypassFirstFailure(ciphertext, sign) {
  const key = fibonacciKey();
  let possible = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    const c = ciphertext[i];
    for (const consumed of possible) {
      // Historical plaintext-F bypass emits F and consumes no keystream.
      if (c === 0) next.add(consumed);
      // Normal encryption must not emit plaintext F: that case bypasses.
      if (mod(c - sign * key[consumed % period]) !== 0) {
        next.add(consumed + 1);
      }
    }
    if (next.size === 0) return i;
    possible = next;
  }
  return -1;
}

function run() {
  const actual = [samePhaseCollision(pages, false),
    samePhaseCollision(pages, true)];
  const expected = [
    {pairs: 215512, hits: 7372, rate: 0.0342069119120977},
    {pairs: 30484, hits: 990, rate: 0.032476053011415824}
  ];
  for (let i = 0; i < 2; i++) {
    assert.equal(actual[i].pairs, expected[i].pairs);
    assert.equal(actual[i].hits, expected[i].hits);
    assert.ok(Math.abs(actual[i].rate - expected[i].rate) < 1e-14);
  }
  const controls = [];
  for (const filename of [
    'resources/control/gibran_prophet_58585.txt',
    'resources/control/shakespeare_first300k.txt',
    'resources/control/emerson_essays_2944.txt'
  ]) {
    const GP = sourceNativeGP(read(filename));
    for (let reset = 0; reset < 2; reset++) {
      const scores = [];
      for (let start = 0; start + n < GP.length; start += 151) {
        scores.push(samePhaseCollision(overlay(GP.slice(start, start + n)),
          Boolean(reset)).rate);
      }
      const below = scores.filter(v => v <= actual[reset].rate).length;
      assert.equal(below, 0, 'no frozen English window below original');
      controls.push({filename, clock: reset ? 'page-reset' : 'continuous',
        windows: scores.length, min: Math.min(...scores), below});
    }
  }
  assert.deepEqual(controls.filter(x => x.clock === 'continuous')
    .map(x => x.windows), [403, 1427, 2117]);
  assert.deepEqual(controls.filter(x => x.clock === 'page-reset')
    .map(x => x.windows), [403, 1427, 2117]);
  const plant = sourceNativeGP(read('resources/control/shakespeare_first300k.txt'))
    .slice(0, n);
  secretAffinePlant(plant, false);
  secretAffinePlant(plant, true);

  const failures = [];
  for (const sign of [-1, 1]) {
    failures.push({sign, pages: pages.map((page, i) =>
      ({page: i + 16, firstFailure:
        historicalFBypassFirstFailure(page, sign)}))});
  }
  assert.deepEqual(failures, [
    {sign: -1, pages: [
      {page: 16, firstFailure: 16}, {page: 17, firstFailure: 44},
      {page: 18, firstFailure: 10}, {page: 19, firstFailure: 60},
      {page: 20, firstFailure: 15}, {page: 21, firstFailure: 2},
      {page: 22, firstFailure: 23}]},
    {sign: 1, pages: [
      {page: 16, firstFailure: 156}, {page: 17, firstFailure: 126},
      {page: 18, firstFailure: 38}, {page: 19, firstFailure: 18},
      {page: 20, firstFailure: 2}, {page: 21, firstFailure: 38},
      {page: 22, firstFailure: -1}]}
  ]);
  console.log(JSON.stringify({n, period, actual, controls, failures,
    positivePlants: 2}, null, 2));
}

if (require.main === module) run();
module.exports = {sourceNativeGP, samePhaseCollision,
  fibonacciKey, historicalFBypassFirstFailure};
