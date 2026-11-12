'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const loadJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const mod = (n) => (n % 29 + 29) % 29;

/** @param {[number,number]} a @param {[number,number]} b @returns {[number,number]} */
function mul(a, b) {
  return [mod(a[0] * b[0] + 8 * a[1] * b[1]),
    mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])];
}

/** @param {[number,number]} a @param {[number,number]} b @returns {[number,number]} */
function add(a, b) {
  return [mod(a[0] + b[0]), mod(a[1] + b[1])];
}

/** @param {number[]} b @returns {number[]} */
function quotient(b) {
  // GF29 table polynomial: low-first descending original coefficients.
  const p = b.slice().reverse().map(mod);
  const divisor = [23, 21, 11, 17, 12]; // (3+26X+24X^2)(27+5X+15X^2)
  const q = Array(252).fill(0);
  for (let i = 255; i >= 4; i--) {
    const coefficient = mod(17 * p[i]); // inverse of leading coefficient 12
    q[i - 4] = coefficient;
    for (let j = 0; j < 5; j++) p[i - 4 + j] = mod(p[i - 4 + j] - coefficient * divisor[j]);
  }
  assert.deepEqual(p.slice(0, 4), [0, 0, 0, 0]);
  return q;
}

/** @param {number[]} q @returns {Record<string, number[]>} */
function streams(q) {
  const result = { coordinateA: [], coordinateB: [], trace: [], norm: [] };
  const generator = [19, 13]; // P/G modulo the original p3 quadratic, in basis [1,u]
  let x = [1, 0];
  for (let i = 0; i < 840; i++) {
    let y = [0, 0];
    for (let j = q.length - 1; j >= 0; j--) y = add(mul(y, x), [q[j], 0]);
    result.coordinateA.push(y[0]);
    result.coordinateB.push(y[1]);
    result.trace.push(mod(2 * y[0] + 3 * y[1]));
    result.norm.push(mod(y[0] * y[0] + 3 * y[0] * y[1] - 8 * y[1] * y[1]));
    x = mul(x, generator);
  }
  assert.deepEqual(x, [1, 0]);
  return result;
}

/** @param {number[][]} pages @param {number[]} stream @param {number} sign @param {'book'|'page'} clock @returns {number[][]} */
function apply(pages, stream, sign, clock) {
  let global = 0;
  return pages.map((page) => page.map((value, i) => {
    const j = clock === 'page' ? i : global++;
    return mod(value + sign * stream[j % stream.length]);
  }));
}

/** @param {string} text @param {string[]} alphabet @returns {number[]} */
function nativeGp(text, alphabet) {
  const source = text.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').replace(/ING/g, 'NG');
  const tokens = alphabet.map((spelling, index) => ({ spelling, index }))
    .sort((a, b) => b.spelling.length - a.spelling.length);
  const out = [];
  for (let i = 0; i < source.length;) {
    const match = tokens.find((item) => source.startsWith(item.spelling, i));
    if (match) {
      out.push(match.index);
      i += match.spelling.length;
    } else i++;
  }
  return out;
}

/** @param {number[]} data @returns {number} */
function ioc(data) {
  const counts = Array(29).fill(0);
  for (const n of data) counts[n]++;
  return counts.reduce((total, count) => total + count * (count - 1), 0) / (data.length * (data.length - 1));
}

/** @param {number[]} reference @returns {(data:number[])=>number} */
function makeTrigramScore(reference) {
  const counts = new Map();
  for (let i = 0; i + 2 < reference.length; i++) {
    const k = reference[i] * 841 + reference[i + 1] * 29 + reference[i + 2];
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const denominator = reference.length - 2 + 0.05 * 29 ** 3;
  return (data) => {
    let total = 0;
    for (let i = 0; i + 2 < data.length; i++) {
      const k = data[i] * 841 + data[i + 1] * 29 + data[i + 2];
      total += Math.log(((counts.get(k) || 0) + 0.05) / denominator);
    }
    return total / (data.length - 2);
  };
}

function main() {
  const c = loadJson('resources/liber-primus/lp2-corpus.json');
  const b = loadJson('resources/liber-primus/base60-grid.json').byte_rows.flat();
  const sha = crypto.createHash('sha256').update(Buffer.from(b)).digest('hex');
  assert.equal(sha, '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
  const originals = c.pages.filter((page) => page.page <= 55 && page.indices.length)
    .map((page) => page.indices);
  const original = originals.flat();
  assert.equal(original.length, 12956);
  const keys = streams(quotient(b));
  const gibran = nativeGp(fs.readFileSync(path.join(root, 'resources/control/gibran_prophet_58585.txt'), 'utf8'), c.translit);
  const split = Math.floor(gibran.length * 0.7);
  const nativeHoldout = gibran.slice(split);
  assert.ok(nativeHoldout.length >= original.length);
  const score = makeTrigramScore(gibran.slice(0, split));
  const nativePages = [];
  let cursor = 0;
  for (const p of originals) {
    nativePages.push(nativeHoldout.slice(cursor, cursor + p.length));
    cursor += p.length;
  }
  const rows = [];
  for (const [name, stream] of Object.entries(keys)) {
    for (const clock of ['book', 'page']) {
      for (const sign of [-1, 1]) {
        const decoded = apply(originals, stream, sign, clock);
        assert.deepEqual(apply(decoded, stream, -sign, clock), originals);
        const ciphertextPlant = apply(nativePages, stream, -sign, clock);
        assert.deepEqual(apply(ciphertextPlant, stream, sign, clock), nativePages);
        rows.push({ projection: name, clock, sign, score: score(decoded.flat()), ioc: ioc(decoded.flat()) });
      }
    }
  }
  rows.sort((a, b) => b.score - a.score);
  assert.ok(rows[0].score < score(nativeHoldout) - 3);
  assert.ok(rows.every((row) => row.ioc < 0.036));
  console.log(JSON.stringify({
    originalLength: original.length, nativeTrainLength: split, nativeHoldoutLength: nativeHoldout.length,
    nativeHoldoutScore: score(nativeHoldout), originalScore: score(original),
    originalIoC: ioc(original), rows
  }, null, 2));
}
main();
