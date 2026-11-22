'use strict';

/**
 * F-transparent classic Vigenere autokey using the authenticated 2014
 * FIRFUMFERENFE key. Read-only original-input CommonJS SFT for Node 22.
 *
 * Both ordinary plaintext and ciphertext autokey feedback are included.
 * All legal historical literal-F bypass masks are enumerated exactly.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const historicalKey = 'FIRFUMFERENFE'.split('').map((r) => corpus.translit.indexOf(r));
const mod = (x) => (x % 29 + 29) % 29;
assert.equal(historicalKey.length, 13);
assert.ok(historicalKey.every((n) => n >= 0));

/**
 * @param {number[]} plaintext
 * @param {'P'|'C'} feedback
 * @param {-1|1} decodeSign
 * @returns {number[]}
 */
function encode(plaintext, feedback, decodeSign) {
  const queue = historicalKey.slice();
  const output = [];
  for (const p of plaintext) {
    if (p === 0) {
      output.push(0);
      continue;
    }
    const c = mod(p - decodeSign * queue[0]);
    output.push(c);
    queue.shift();
    queue.push(feedback === 'P' ? p : c);
  }
  return output;
}

/**
 * @typedef {{queue: number[], plain: number[], literalF: number[]}} State
 * @param {number[]} cipher
 * @param {'P'|'C'} feedback
 * @param {-1|1} decodeSign
 * @returns {{states: State[], firstImpossible: number|null}}
 */
function decode(cipher, feedback, decodeSign) {
  /** @type {State[]} */
  let states = [{ queue: historicalKey.slice(), plain: [], literalF: [] }];
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    /** @type {State[]} */
    const next = [];
    for (const state of states) {
      if (c === 0) {
        next.push({
          queue: state.queue,
          plain: state.plain.concat(0),
          literalF: state.literalF.concat(i)
        });
      }
      const p = mod(c + decodeSign * state.queue[0]);
      if (p !== 0) {
        next.push({
          queue: state.queue.slice(1).concat(feedback === 'P' ? p : c),
          plain: state.plain.concat(p),
          literalF: state.literalF
        });
      }
    }
    states = next;
    if (states.length === 0) {
      return { states, firstImpossible: i };
    }
  }
  for (const state of states) {
    assert.deepEqual(encode(state.plain, feedback, decodeSign), cipher);
  }
  return { states, firstImpossible: null };
}

/** @param {number[]} values @returns {number} */
function indexOfCoincidence(values) {
  const counts = Array(29).fill(0);
  for (const n of values) counts[n]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

// Genuine GP29 already-solved page p57 used as the English source for an
// independent synthetic positive; the historical p57 plaintext stays unchanged.
const solvedControl = corpus.pages[57].indices;
assert.equal(solvedControl.length, 95);
assert.ok(solvedControl.includes(0));
for (const feedback of ['P', 'C']) {
  for (const sign of [-1, 1]) {
    const cipher = encode(solvedControl, feedback, sign);
    const inverse = decode(cipher, feedback, sign);
    assert.ok(inverse.states.some((state) =>
      JSON.stringify(state.plain) === JSON.stringify(solvedControl)));
    console.log('native solved-text plant ' + feedback + ' sign=' + sign +
      ': exact positive, paths=' + inverse.states.length);
  }
}

const original = corpus.pages[54].indices.concat(corpus.pages[55].indices);
assert.equal(corpus.pages[54].indices.length, 232);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(original.length, 308);
const windows = [
  ['p54+55 chapter start including nine-rune red heading', original],
  ['p54+55 after original nine-rune red heading', original.slice(9)],
  ['p55 physical page reset', corpus.pages[55].indices],
  ['p55 complete-word body after incoming carry', corpus.pages[55].indices.slice(1)]
];
const expected = {
  'p54+55 chapter start including nine-rune red heading': { 'P-1': 20, 'P1': 1, 'C-1': 22, 'C1': 1 },
  'p54+55 after original nine-rune red heading': { 'P-1': 4, 'P1': 16, 'C-1': 4, 'C1': 16 },
  'p55 physical page reset': { 'P-1': null, 'P1': null, 'C-1': 14, 'C1': 51 },
  'p55 complete-word body after incoming carry': { 'P-1': 13, 'P1': 1, 'C-1': 13, 'C1': 1 }
};
for (const [label, cipher] of windows) {
  for (const feedback of ['P', 'C']) {
    for (const sign of [-1, 1]) {
      const result = decode(cipher, feedback, sign);
      const name = feedback + sign;
      assert.equal(result.firstImpossible, expected[label][name],
        'original exact-reachability gate ' + label + ' ' + name);
      const best = result.states.length
        ? Math.max(...result.states.map((state) => indexOfCoincidence(state.plain)))
        : null;
      console.log(label + ' mode=' + name + ' source=' + cipher.length +
        ' validPaths=' + result.states.length +
        ' firstForbidden=' + result.firstImpossible +
        ' bestIoC=' + best);
    }
  }
}
console.log('PASS: all original historical-key F-aware autokey gates and native plants');
