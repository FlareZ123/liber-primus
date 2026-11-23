'use strict';

/**
 * Source-fixed GF29 quartic LFSR IV, using Cicada's authenticated solved-p56
 * transparent literal F skip semantics on the original p8 recipient.
 *
 * Original-condition runner: Node.js 22 / Windows11.
 * Report: im-results/lp2-p7-irreducible-quartic-lfsr4-allseed-original-gate.md
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const gp = JSON.parse(fs.readFileSync(path.join(root,
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const p7 = gp.pages.find(page => page.page === 7).indices;
const p8to14 = gp.pages.filter(page => page.page >= 8 && page.page <= 14)
  .flatMap(page => page.indices);
const p57 = gp.pages.find(page => page.page === 57).indices;
const mod = x => ((x % 29) + 29) % 29;
const weights = [7, 25, 16, 9];
const stateBase = 29 ** 3;
const initialValues = [
  { label: 'p8 red first word XIXM', seed: p8to14.slice(0, 4), starts: [4, 12] },
  { label: 'p8 second red first four', seed: p8to14.slice(4, 8), starts: [12] },
  { label: 'p8 second red last four', seed: p8to14.slice(8, 12), starts: [12] },
  { label: 'p7 terminal four red runes', seed: p7.slice(-4), starts: [0, 12] }
];
assert.deepEqual(p8to14.slice(0, 12),
  [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]);
assert.deepEqual(p7.slice(-4), [28, 6, 28, 19]);
assert.equal(p8to14.length, 1729);

/** @param {number[]} source @returns {number} */
function pack(source) {
  assert.equal(source.length, 4);
  return source.reduce((value, atom) => value * 29 + atom, 0);
}

/** @param {number} state @returns {number[]} */
function unpack(state) {
  const out = Array(4);
  for (let i = 3; i >= 0; i--) {
    out[i] = state % 29;
    state = Math.floor(state / 29);
  }
  return out;
}

/** @param {number} state @returns {{value:number, next:number}} */
function step(state) {
  const old = unpack(state);
  const value = mod(weights[0] * old[3] + weights[1] * old[2]
    + weights[2] * old[1] + weights[3] * old[0]);
  return { value, next: (state % stateBase) * 29 + value };
}

/**
 * The exact source F-transparent law:
 * - original C=F=0 may be literal P=F=0, with NO key clock step;
 * - any observed C may be the encrypted nonzero P, consuming one key;
 * - encrypted P=0 is forbidden, so a nonzero C cannot be literal F.
 * @param {number[]} cipher
 * @param {number[]} seed
 * @param {number} sign -1 or +1
 * @param {number} start global source rune index
 * @returns {{firstImpossible:null|number,until:number,maxStates:number,branches:number,finalStates:Set<number>}}
 */
function decodeFeasible(cipher, seed, sign, start) {
  let current = new Set([pack(seed)]);
  let maxStates = 1;
  let branches = 0;
  for (let i = start; i < cipher.length; i++) {
    const next = new Set();
    for (const state of current) {
      const value = step(state);
      if (mod(cipher[i] + sign * value.value) !== 0) {
        next.add(value.next);
      }
      if (cipher[i] === 0) {
        next.add(state);
        branches++;
      }
    }
    current = next;
    maxStates = Math.max(maxStates, current.size);
    if (current.size === 0) {
      return { firstImpossible: i, until: i, maxStates, branches,
        finalStates: current };
    }
  }
  return { firstImpossible: null, until: cipher.length - 1,
    maxStates, branches, finalStates: current };
}

/**
 * @param {number[]} plain
 * @param {number[]} seed
 * @param {number} sign
 * @returns {{cipher:number[],state:number}}
 */
function encryptTransparent(plain, seed, sign) {
  let state = pack(seed);
  const cipher = [];
  for (const p of plain) {
    if (p === 0) {
      cipher.push(0);
    } else {
      const k = step(state);
      cipher.push(mod(p - sign * k.value));
      state = k.next;
    }
  }
  return { cipher, state };
}

/** @type {Array<{source:string,recipientStart:number,sign:number,firstImpossible:number|null,maxStates:number,branchCount:number}>} */
const results = [];
const required = [
  [4, -1, 18], [4, +1, 87], [12, -1, 14], [12, +1, 55],
  [12, -1, 14], [12, +1, 19], [12, -1, 55], [12, +1, 14],
  [0, -1, 9], [0, +1, 8], [12, -1, 79], [12, +1, 18]
];
for (const model of initialValues) {
  for (const start of model.starts) {
    for (const sign of [-1, 1]) {
      const tested = decodeFeasible(p8to14, model.seed, sign, start);
      assert.equal(tested.finalStates.size, 0, 'no original consistent full path');
      results.push({ source: model.label, recipientStart: start, sign,
        firstImpossible: tested.firstImpossible,
        maxStates: tested.maxStates, branchCount: tested.branches });
    }
  }
}
assert.deepEqual(results.map(x => [x.recipientStart, x.sign, x.firstImpossible]),
  required);
const positives = [];
for (const model of initialValues) {
  for (const sign of [-1, 1]) {
    const native = Array.from({ length: 255 }, (_, i) => p57[i % p57.length]);
    const synthetic = encryptTransparent(native, model.seed, sign);
    const decrypted = decodeFeasible(synthetic.cipher, model.seed, sign, 0);
    assert.equal(decrypted.firstImpossible, null);
    assert.ok(decrypted.finalStates.has(synthetic.state),
      'genuine native source key-history must survive F bypass decoding');
    assert.equal(synthetic.cipher.length, native.length);
    positives.push({ source: model.label, sign,
      nativeRunes: native.length, survivingStates: decrypted.finalStates.size,
      authenticKeyPathSurvives: true });
  }
}
console.log(JSON.stringify({
  model: 'p7 irreducible quartic LFSR4 and original p56 literal F transparent clock',
  originalSource: { pages: 'p8-p14', runes: p8to14.length, results },
  sourceNativePositive: positives
}, null, 2));
console.log('PASS: source-fixed quartic F-transparent branches, original impossible, native plant legal.');
