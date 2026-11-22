'use strict';

/**
 * Full 256-cell source-table key with deterministic ciphertext-doublet rejection.
 * Enumerates every permissible key-skip path, with original p55's one observed
 * doublet retained as a marked exception to the otherwise strict encoder.
 * Node.js 22, CommonJS, no packages.
 */
const assert = require('node:assert/strict');
const grid = require('../resources/liber-primus/lp2-grid-256.json');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const byteStream = grid.bytes;
const target = corpus.pages.find(p => p.page === 55).indices;
const native = corpus.pages.find(p => p.page === 57).indices.slice(0, 76);
const translit = corpus.translit;
assert.equal(byteStream.length, 256);
assert.deepEqual(byteStream.slice(0, 8), [203, 231, 167, 186, 97, 237, 126, 183]);
assert.deepEqual(grid.pages.map(p => p.tokens.length), [80, 104, 72]);
assert.equal(target.length, 76);
assert.equal(native.length, 76);
assert.deepEqual(target.flatMap((v, i) => i > 0 && v === target[i - 1] ? [i] : []), [59]);

/** @param {number} x @returns {number} */
function mod(x) { return ((x % 29) + 29) % 29; }

/**
 * Encrypt known native plaintext, skipping keys if output equals predecessor.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number} sign
 * @returns {{cipher:number[],skips:[number,number][]}}
 */
function encrypt(plain, key, sign) {
  const cipher = [];
  /** @type {[number,number][]} */
  const skips = [];
  let j = 0;
  for (let i = 0; i < plain.length; i++) {
    let value = mod(plain[i] - sign * key[j % key.length]);
    const start = j;
    while (i > 0 && value === cipher[i - 1]) {
      j++;
      value = mod(plain[i] - sign * key[j % key.length]);
    }
    if (j > start) skips.push([i, j - start]);
    cipher.push(value);
    j++;
  }
  return { cipher, skips };
}

/**
 * Exhaustive exact inverse paths for ciphertext (allowing exact printed
 * doublets as observed exceptions). For each clock state, a skipped key
 * must have yielded the previous ciphertext value; hence all rejected key
 * values are identical, and only the next distinct key value can emit.
 *
 * @typedef {{next:number,plain:number[],skips:[number,number][]}} Path
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @returns {Path[]}
 */
function infer(cipher, key, sign) {
  /** @type {Path[]} */
  let states = [{next:1, plain:[mod(cipher[0] + sign * key[0])], skips:[]}];
  for (let i = 1; i < cipher.length; i++) {
    /** @type {Path[]} */
    const next = [];
    for (const p of states) {
      const current = key[p.next % key.length];
      // Accept this key. When c[i]==c[i-1], this is an observed exception
      // incompatible with the strict output-rejection encoder.
      next.push({
        next:p.next+1,
        plain:p.plain.concat(mod(cipher[i] + sign * current)),
        skips:p.skips
      });
      if (cipher[i] === cipher[i - 1]) continue;
      let count = 1;
      while (count < key.length && key[(p.next + count) % key.length] === current) count++;
      if (count === key.length) continue;
      const selected = key[(p.next + count) % key.length];
      if (mod(-sign * (selected - current)) !== mod(cipher[i] - cipher[i - 1])) continue;
      next.push({
        next:p.next+count+1,
        plain:p.plain.concat(mod(cipher[i] + sign * selected)),
        skips:p.skips.concat([[i,count]])
      });
    }
    states = next;
  }
  return states;
}

/** @param {number[]} sequence @returns {number} */
function ioc(sequence) {
  const count = Array(29).fill(0);
  for (const x of sequence) count[x]++;
  return count.reduce((sum, n) => sum + n*(n-1), 0) / (sequence.length*(sequence.length-1));
}

const summary = [];
for (const projection of ['mod29', 'scaled29']) {
  const key = byteStream.map(v => projection === 'mod29' ? v % 29 : Math.floor(v * 29 / 256));
  for (const sign of [-1, 1]) {
    // A real native-GP source encrypts and recovers exactly, including every
    // output-aware skip; the inverse recovers the unique implanted path.
    const planted = encrypt(native, key, sign);
    const nativePaths = infer(planted.cipher, key, sign);
    assert.equal(nativePaths.filter(p => p.plain.every((v, i) => v === native[i])).length, 1);
    assert.ok(planted.skips.length > 0);
    const paths = infer(target, key, sign);
    const ordered = paths.map(p => ({ioc:ioc(p.plain),skips:p.skips,
      opening:p.plain.slice(0, 28).map(v => translit[v]).join('')}))
      .sort((a, b) => b.ioc-a.ioc);
    assert.ok(paths.length > 0 && ordered[0].ioc < 0.042);
    summary.push({
      projection,sign,plantedSkips:planted.skips,pathCount:paths.length,
      bestIoC:ordered[0].ioc,bestSkipPositions:ordered[0].skips,
      opening:ordered[0].opening
    });
  }
}
assert.deepEqual(summary.map(x => x.pathCount), [3, 14, 4, 14]);
console.log(JSON.stringify({table:'original 256 printed bytes (conditional base60)',
  target:'original LP2 p55 76 ciphertext runes, with one residual doublet at index59',
  rule:'accept or skip keys only where a rejected key would have emitted predecessor',
  positive:'all four exact solved-p57-native GP plants encrypt and invert',
  summary}, null, 2));
