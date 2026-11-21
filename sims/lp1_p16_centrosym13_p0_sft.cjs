'use strict';
/** Native Node 22 CJS: LP1 p16 13 rotational orbits -> LP2 p0 ciphertext. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const M = [
  [434, 1311, 312, 278, 966],
  [204, 812, 934, 280, 1071],
  [626, 620, 809, 620, 626],
  [1071, 280, 934, 812, 204],
  [966, 278, 312, 1311, 434],
];
const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const p0 = source.pages[0].indices;
const opening = source.pages.slice(0, 3).flatMap(page => page.indices);
const parable = source.pages[57].indices;
const title = [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5];
assert.deepEqual(p0.slice(0, 13), title);
assert.equal(p0.length, 262);
assert.equal(opening.length, 729);
assert.equal(parable.length, 95);
assert.equal(source.translit.length, 29);
const mod = n => ((n % 29) + 29) % 29;

/** @param {number} n */
function phi(n) {
  let t = n, r = n;
  for (let p = 2; p * p <= t; ++p) if (t % p === 0) {
    r = r / p * (p - 1);
    while (t % p === 0) t /= p;
  }
  return t > 1 ? r / t * (t - 1) : r;
}

/** @param {number[]} xs */
function ioc(xs) {
  const f = Array(29).fill(0);
  xs.forEach(x => f[x]++);
  return f.reduce((acc, n) => acc + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

for (let r = 0; r < 5; r++) {
  assert.equal(M[r].reduce((a, b) => a + b), 3301);
  assert.equal(M.reduce((a, row) => a + row[r], 0), 3301);
  for (let c = 0; c < 5; c++) assert.equal(M[r][c], M[4 - r][4 - c]);
}
assert.equal(M.reduce((a, row, i) => a + row[i], 0), 3301);
assert.equal(M.reduce((a, row, i) => a + row[4 - i], 0), 3301);
const seen = new Set(), values = [], sizes = [];
for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
  const i = 5 * r + c, j = 5 * (4 - r) + (4 - c);
  if (seen.has(i)) continue;
  seen.add(i); seen.add(j);
  values.push(M[r][c]);
  sizes.push(i === j ? 1 : 2);
}
assert.equal(seen.size, 25);
assert.deepEqual(sizes, [...Array(12).fill(2), 1]);
assert.equal(new Set(values).size, 13);
assert.deepEqual(values, [434,1311,312,278,966,204,812,934,280,1071,626,620,809]);
const sorted = [...values].sort((a, b) => a - b);
const keys = {
  direct: values.map(n => mod(n)),
  totient: values.map(n => mod(phi(n))),
  rank: values.map(n => sorted.indexOf(n)),
};

/**
 * Exact reachability under solved-p56 F-transparent semantics:
 * literal plaintext F consumes no key; non-F plaintext consumes one.
 * @param {number[]} text @param {number[]} key @param {number} sign
 */
function reachable(text, key, sign) {
  let phases = new Set([0]), max = 1;
  for (let offset = 0; offset < text.length; ++offset) {
    const next = new Set();
    for (const phase of phases) {
      const c = text[offset];
      if (c === 0) next.add(phase); // Literal plaintext F
      if (mod(c + sign * key[phase]) !== 0) next.add((phase + 1) % 13);
    }
    if (!next.size) return { firstImpossibleOffset: offset, endPhases: 0, maxStates: max };
    phases = next;
    max = Math.max(max, phases.size);
  }
  return { firstImpossibleOffset: null, endPhases: phases.size, maxStates: max };
}

/** @param {number[]} plain @param {number[]} key @param {number} sign */
function encryptF(plain, key, sign) {
  let k = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const c = mod(p - sign * key[k % 13]); k++;
    return c;
  });
}

const cases = [];
for (const [name, key] of Object.entries(keys)) for (const sign of [-1, 1]) {
  assert.equal(reachable(encryptF(parable, key, sign), key, sign).firstImpossibleOffset, null);
  const p = opening.map((c, i) => mod(c + sign * key[i % 13]));
  const inverse = reachable(p0, key, sign);
  assert.notEqual(inverse.firstImpossibleOffset, null);
  cases.push({
    projection: name, sign: sign > 0 ? '+' : '-',
    key,
    redTitle: p.slice(0, 8).map(i => source.translit[i]).join('') +
      ' | ' + p.slice(8, 13).map(i => source.translit[i]).join(''),
    p0IoC: Number(ioc(p.slice(0, 262)).toFixed(10)),
    p0to2IoC: Number(ioc(p).toFixed(10)),
    ...inverse, plantRecovered: 95
  });
}
assert.deepEqual(cases.map(x => x.firstImpossibleOffset), [51,218,41,46,25,126]);
console.log(JSON.stringify({
  originalImages: ['16.jpg','17.jpg'], magicConstant: 3301,
  uniqueOrbits: values.length, orbitSizes: sizes, values,
  p0redRunes: title.length, p0BlackRunes: p0.length - title.length,
  chapterRunes: opening.length, ciphertextChapterIoC: ioc(opening),
  cases
}, null, 2));
