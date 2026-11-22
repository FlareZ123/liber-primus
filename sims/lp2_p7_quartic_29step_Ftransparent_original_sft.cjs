'use strict';

/**
 * P7 source-red five-word GF29 polynomial evaluated as 29-step direct key.
 * Two literal GP29 origins, both arithmetic signs, original p8 receivers,
 * and exhaustive historically authentic literal-plaintext-F skip grammar.
 * Read-only original-input SFT, CommonJS / Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const coefficients = [11, 26, 8, 15, 2];
const mod = (x) => ((x % 29) + 29) % 29;
/** @param {number} x @returns {number} */
function f(x) {
  return coefficients.reduceRight((value, coefficient) =>
    mod(value * x + coefficient), 0);
}
/** @param {number[]} values @returns {number} */
function coincidence(values) {
  const freq = Array(29).fill(0);
  for (const x of values) freq[x]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} ciphertext @param {number} origin @param {number} sign @returns {number[]} */
function directDecrypt(ciphertext, origin, sign) {
  return ciphertext.map((c, i) => mod(c + sign * f((origin + i) % 29)));
}
/** @param {number[]} plaintext @param {number} origin @param {number} sign @returns {number[]} */
function directEncrypt(plaintext, origin, sign) {
  return plaintext.map((p, i) => mod(p - sign * f((origin + i) % 29)));
}

/**
 * The historical Cicada solved-p56 rule is plaintext-F transparency:
 * emitted ciphertext F MAY BE a literal plaintext F with no clock consumed,
 * or an encrypted non-F. A non-F ciphertext NEVER decodes to plaintext F.
 *
 * @typedef {{clock: number, plain: number[], bypass: number[]}} State
 * @param {number[]} ciphertext
 * @param {number} origin
 * @param {number} sign
 * @returns {{states: State[], firstImpossible: number|null}}
 */
function transparentDecrypt(ciphertext, origin, sign) {
  /** @type {State[]} */
  let states = [{ clock: origin, plain: [], bypass: [] }];
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    /** @type {State[]} */
    const next = [];
    for (const state of states) {
      if (c === 0) {
        next.push({ clock: state.clock, plain: state.plain.concat(0),
          bypass: state.bypass.concat(i) });
      }
      const p = mod(c + sign * f(state.clock % 29));
      if (p !== 0) {
        next.push({ clock: state.clock + 1, plain: state.plain.concat(p),
          bypass: state.bypass });
      }
    }
    states = next;
    if (states.length === 0) return { states, firstImpossible: i };
  }
  return { states, firstImpossible: null };
}

/** @param {number[]} plaintext @param {number} origin @param {number} sign @returns {number[]} */
function transparentEncrypt(plaintext, origin, sign) {
  let clock = origin;
  const output = [];
  for (const p of plaintext) {
    if (p === 0) {
      output.push(0);
    } else {
      output.push(mod(p - sign * f(clock % 29)));
      clock++;
    }
  }
  return output;
}

const p8 = corpus.pages[8].indices;
const p9 = corpus.pages[9].indices;
assert.equal(p8.length, 255);
assert.equal(p9.length, 268);
assert.deepEqual([f(3), f(4)], [3, 4]);
const solved = corpus.pages[57].indices;
assert.ok(solved.includes(0));
const windows = [
  ['all original p8 + first p9 true carry, 256', p8.concat(p9[0])],
  ['p8 black243 + first p9 true carry, 244', p8.slice(12).concat(p9[0])]
];
const forbidden = {
  256: { '0:-1': 7, '0:1': 2, '1:-1': 49, '1:1': 13 },
  244: { '0:-1': 12, '0:1': 86, '1:-1': 15, '1:1': 4 }
};
for (const [label, ciphertext] of windows) {
  assert.equal(ciphertext.length % 2, 0);
  const native = Array.from({ length: ciphertext.length },
    (_, i) => solved[i % solved.length]);
  console.log(label);
  for (const origin of [0, 1]) {
    for (const sign of [-1, 1]) {
      const plain = directDecrypt(ciphertext, origin, sign);
      assert.deepEqual(directEncrypt(plain, origin, sign), ciphertext);
      assert.deepEqual(directDecrypt(directEncrypt(native, origin, sign),
        origin, sign), native);
      const transparent = transparentDecrypt(ciphertext, origin, sign);
      const barrier = forbidden[ciphertext.length][origin + ':' + sign];
      assert.equal(transparent.firstImpossible, barrier);
      assert.equal(transparent.states.length, 0);
      assert.ok(transparentDecrypt(transparentEncrypt(native, origin, sign),
        origin, sign).states.some((s) =>
        JSON.stringify(s.plain) === JSON.stringify(native)));
      const ic = coincidence(plain);
      assert.ok(ic < 0.05, 'unexpected original output signal');
      console.log('origin=' + origin + ' sign=' + sign +
        ' directIoC=' + ic.toFixed(8) +
        ' FTransparentImpossibleAt=' + barrier +
        ' nativePlant=' + native.length + '/' + native.length);
    }
  }
}
console.log('PASS: eight polynomial 29-step receivers, native plants and strict F branch exhaustion');
