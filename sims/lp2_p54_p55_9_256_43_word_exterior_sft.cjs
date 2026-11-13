'use strict';

/**
 * SFT: p54 red9 + (p54 black223 + p55 word exterior33) + p55 word interior43
 * = 9+256+43, and fixed original p50 256-byte table overlay.
 * Input is original-source corpus, ink and numeric-grid JSON. CJS Node22.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const c = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const grid = read('resources/liber-primus/lp2-grid-256.json').bytes;
const head = ink.pages.find((p) => p.page === 54)
  .red_spans.find((s) => s.start === 0);
assert.equal(head.length, 9);
const p54 = c.pages[54].indices;
const p55 = c.pages[55].indices;
assert.equal(p54.length, 232);
assert.equal(p55.length, 76);

// Wordwise 'shed circumference' partition, prior image-adjudicated source.
// The first p55 rune completes a word begun on p54 and remains exterior.
const insidePositions = [
  2, 3, 10, 11, 12, 13, 16, 17, 18, 19,
  24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
  37, 38, 39, 40, 43, 44, 49, 50, 51, 52, 53,
  56, 57, 58, 59, 60, 65, 66, 67, 68, 71, 74
];
const inside = new Set(insidePositions);
const outerPositions = Array.from({ length: 76 }, (_, i) => i)
  .filter((i) => !inside.has(i));
const p54Black = p54.slice(head.length);
const exterior = p54Black.concat(outerPositions.map((i) => p55[i]));
const interior = insidePositions.map((i) => p55[i]);
assert.equal(p54Black.length, 223);
assert.equal(outerPositions.length, 33);
assert.equal(interior.length, 43);
assert.equal(exterior.length, 256);
assert.equal(grid.length, 256);
assert.equal(head.length + exterior.length + interior.length, 308);
assert.deepEqual(interior, [
  19, 10, 12, 6, 23, 2, 27, 24, 17, 5, 28, 0, 14, 10, 19,
  1, 5, 13, 8, 21, 20, 15, 23, 27, 13, 8, 12, 18, 10,
  6, 14, 6, 15, 12, 2, 2, 18, 28, 10, 19, 5, 11, 18
]);

function ioc(x) {
  const bins = new Int32Array(29);
  for (const v of x) bins[v] += 1;
  return bins.reduce((s, n) => s + n * (n - 1), 0) /
    (x.length * (x.length - 1));
}
const k = grid.map((v) => v % 29);
const inverse = (x, sign) => x.map((v, i) => (v + sign * k[i] + 29) % 29);
const sourceControl = Array.from({ length: 256 }, (_, i) =>
  c.pages[57].indices[i % c.pages[57].indices.length]);
const outputs = [-1, 1].map((sign) => {
  const decoded = inverse(exterior, sign);
  assert.deepEqual(inverse(decoded, -sign), exterior);
  const encryptedControl = inverse(sourceControl, -sign);
  assert.deepEqual(inverse(encryptedControl, sign), sourceControl);
  return {
    sign,
    ioc: ioc(decoded),
    preview: decoded.slice(0, 32).map((i) => c.translit[i]).join('-')
  };
});
assert.ok(Math.abs(outputs[0].ioc - 0.0336703431372549) < 1e-12);
assert.ok(Math.abs(outputs[1].ioc - 0.03434436274509804) < 1e-12);

const matchIndex = exterior.reduce((n, v, i) => n + (v === k[i]), 0);
const matchPrime = exterior.reduce((n, v, i) =>
  n + (c.prime[v] === grid[i]), 0);
const asciiIndexXor = exterior.reduce((n, v, i) => {
  const b = grid[i] ^ v;
  return n + (b >= 32 && b < 127);
}, 0);
const asciiPrimeXor = exterior.reduce((n, v, i) => {
  const b = grid[i] ^ c.prime[v];
  return n + (b >= 32 && b < 127);
}, 0);
assert.equal(matchIndex, 10);
assert.equal(matchPrime, 1);
assert.equal(asciiIndexXor, 103);
assert.equal(asciiPrimeXor, 88);

// Fixed-inventory shuffle control on source pairing; 2000 xorshift draws.
let state = 20914562;
function randint(n) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return Math.floor(((state >>> 0) / 4294967296) * n);
}
let atLeast = 0;
const shuffled = exterior.slice();
for (let trial = 0; trial < 2000; trial += 1) {
  for (let j = shuffled.length - 1; j > 0; j -= 1) {
    const q = randint(j + 1);
    [shuffled[j], shuffled[q]] = [shuffled[q], shuffled[j]];
  }
  const matches = shuffled.reduce((n, v, i) => n + (v === k[i]), 0);
  atLeast += matches >= matchIndex;
}
assert.equal(atLeast, 848);

// The original table also has two 193-valued source cells, at 83 and 127;
// exactly 43 bytes between. Three independently selected 43-unit registers:
// this table interval, p55 word interiors, and the same cells of outer256.
// Freeze four simple historically motivated three-register arithmetic reads.
assert.equal(grid[83], 193);
assert.equal(grid[127], 193);
const intervalStart = 84;
const keys = [
  {
    name: 'mod29-grid-minus-exterior',
    values: interior.map((_, i) =>
      (grid[intervalStart + i] - exterior[intervalStart + i] + 29) % 29)
  },
  {
    name: 'mod29-grid-plus-exterior',
    values: interior.map((_, i) =>
      (grid[intervalStart + i] + exterior[intervalStart + i]) % 29)
  },
  {
    name: 'byte-xor-gpindex',
    values: interior.map((_, i) =>
      (grid[intervalStart + i] ^ exterior[intervalStart + i]) % 29)
  },
  {
    name: 'byte-xor-gpprime',
    values: interior.map((_, i) =>
      (grid[intervalStart + i] ^ c.prime[exterior[intervalStart + i]]) % 29)
  }
];
const expected43 = [
  0.03322259136212625, 0.028792912513842746,
  0.029900332225913623, 0.02547065337763012
];
const triple = keys.map(({ name, values }, model) => {
  const decoded = interior.map((v, i) => (v - values[i] + 29) % 29);
  assert.deepEqual(decoded.map((v, i) => (v + values[i]) % 29), interior);
  const planted = c.pages[57].indices.slice(0, 43);
  assert.deepEqual(planted.map((v, i) => (v + values[i]) % 29)
    .map((v, i) => (v - values[i] + 29) % 29), planted);
  assert.ok(Math.abs(ioc(decoded) - expected43[model]) < 1e-12);
  return { name, ioc: ioc(decoded), gp: decoded.map((v) => c.translit[v]).join('-') };
});

console.log(JSON.stringify({
  sourcePartition: 'p54 heading 9 / p54 black223 + p55 word exterior33 / p55 word interior43',
  lengths: [9, 256, 43],
  grid: 'p50 canonical 32x8 base60 original numeric tokens',
  literalGPIndexMatches: matchIndex,
  literalGPPrimeMatches: matchPrime,
  asciiIndexXor,
  asciiPrimeXor,
  sourceP50GridAndExteriorMod29: outputs,
  matchedPermutationUpperTail: (atLeast + 1) / 2001,
  sourceSelected43TripleRegisterInverses: triple,
  originalFullRoundtripAndNativePlant: 'PASS',
  plaintextFound: false
}, null, 2));
