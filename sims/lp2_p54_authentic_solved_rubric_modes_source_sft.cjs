'use strict';

// Original physical LP2 p54 and genuine solved p56/p57 prime-totient controls.
// Single runnable Node.js 22 CommonJS test, read-only, with exact source replay.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const gp = corpus.translit;
/** @param {number} page @returns {number[]} */
function original(page) {
  const record = corpus.pages.find((item) => item.page === page);
  assert.ok(record);
  return record.indices;
}
const p54 = original(54);
const p56 = original(56);
const p57 = original(57);
const p54Ink = ink.pages.find((item) => item.page === 54);
assert.ok(p54Ink);
assert.deepEqual([p54.length, p56.length, p57.length], [232, 85, 95]);
assert.deepEqual(p54Ink.red_spans.map((item) => [item.start, item.length]), [[0, 9]]);
assert.deepEqual(p54Ink.large_punctuation, [[9, 13, 'red']]);
/** @param {number} quantity @returns {number[]} */
function firstPrimes(quantity) {
  /** @type {number[]} */
  const result = [];
  for (let n = 2; result.length < quantity; n++) {
    let isPrime = true;
    for (let divisor = 2; divisor * divisor <= n; divisor++) {
      if (n % divisor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) result.push(n);
  }
  return result;
}
const primes = firstPrimes(300);
const mod = (n) => ((n % 29) + 29) % 29;
/**
 * Inverse or forward p56 historically recovered cipher. A literal F (value 0)
 * bypasses both symbol transformation and prime-key advancement.
 * @param {number[]} runes
 * @param {Set<number>} literalF
 * @param {'decode'|'encode'} direction
 * @returns {number[]}
 */
function phiCodec(runes, literalF, direction) {
  let keyIndex = 0;
  return runes.map((rune, index) => {
    if (literalF.has(index)) {
      assert.equal(rune, 0);
      return 0;
    }
    const shift = primes[keyIndex++] - 1;
    return mod(rune + (direction === 'decode' ? -shift : shift));
  });
}
/** @param {string} words @returns {number[]} */
function toGp(words) {
  const sorted = gp.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  /** @type {number[]} */
  const output = [];
  for (const word of words.split(' ')) {
    for (let position = 0; position < word.length;) {
      const hit = sorted.find((entry) => word.startsWith(entry.token, position));
      assert.ok(hit, 'Unspellable GP word: ' + word.slice(position));
      output.push(hit.index);
      position += hit.token.length;
    }
  }
  return output;
}
/** @param {number[]} runes @returns {string} */
const render = (runes) => runes.map((value) => gp[value]).join(' ');
/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  return counts.reduce((total, count) => total + count * (count - 1), 0) /
    (runes.length * (runes.length - 1));
}
const known56 = toGp('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
const mask56 = new Set([56]);
assert.deepEqual(phiCodec(p56, mask56, 'decode'), known56);
assert.deepEqual(phiCodec(known56, mask56, 'encode'), p56);
assert.equal(render(known56.slice(0, 5)), 'A N E N D');
assert.equal(render(p57.slice(0, 7)), 'P A R A B L E');
const fPositions = p54.map((value, position) => value === 0 ? position : -1)
  .filter((position) => position >= 0);
assert.deepEqual(fPositions, [41, 65, 195]);
/** @type {Array<{mask:number,positions:number[],ioc:number,red9:string,first72:string}>} */
const alternatives = [];
for (let mask = 0; mask < 8; mask++) {
  const positions = fPositions.filter((_, bit) => (mask & (1 << bit)) !== 0);
  const literalF = new Set(positions);
  const decoded = phiCodec(p54, literalF, 'decode');
  assert.deepEqual(phiCodec(decoded, literalF, 'encode'), p54);
  const red9 = render(decoded.slice(0, 9));
  assert.equal(red9, 'D B B B B M IA NG Y');
  alternatives.push({
    mask,
    positions,
    ioc: ioc(decoded),
    red9,
    first72: render(decoded.slice(0, 72))
  });
}
assert.equal(alternatives.length, 8);
assert.ok(Math.max(...alternatives.map((value) => value.ioc)) < 0.038);
console.log(JSON.stringify({
  source: 'Original LP2 p54 source image 71.jpg, red9 followed by red13-dot',
  originalRuneCount: p54.length,
  fixedOperation: 'known p56 prime-totient with optional literal-F bypass',
  solvedControls: {
    p56: { runes: p56.length, correctLiteralF: [56], exactPlaintext: true, ioc: ioc(known56) },
    p57: { runes: p57.length, literalHeading: 'PARABLE', ioc: ioc(p57) }
  },
  originalP54: { ciphertextF: fPositions, alternatives },
  status: 'PASS'
}, null, 2));
