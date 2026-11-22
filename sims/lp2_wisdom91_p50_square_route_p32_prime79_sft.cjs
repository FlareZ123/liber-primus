'use strict';

/**
 * SFT: original 2014 Wisdom centre91 -> LP2 table square-root route
 * -> p32 (11x11) coordinate -> p15 prime79 -> p55-size pointer.
 *
 * Windows 11 / Node.js 22: node sims/lp2_wisdom91_p50_square_route_p32_prime79_sft.cjs
 * Source-only navigation test. It claims no ciphertext decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const readJSON = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));

const table = readJSON('resources/liber-primus/lp2-grid-256.json');
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const cells = table.pages.flatMap((p) => p.tokens);
const values = table.pages.flatMap((p) => p.bytes);
assert.equal(cells.length, 256);
assert.equal(values.length, 256);
assert.equal(
  crypto.createHash('sha256').update(Buffer.from(values)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'
);

/** @param {number[]} next @param {number} start @param {number} edges */
function follow(next, start, edges) {
  const out = [start];
  for (let k = 0; k < edges; k++) out.push(next[out.at(-1)]);
  return out;
}

/** @param {number} x */
function squareRoot(x) {
  const n = Math.floor(Math.sqrt(x));
  return n > 0 && n * n === x ? n : -1;
}

/** @param {number[]} next */
function allAdditiveSquareTriples(next) {
  const found = [];
  for (let start = 0; start < next.length; start++) {
    const [a, b, c] = follow(next, start, 3).slice(1);
    const roots = [a, b, c].map(squareRoot);
    if (roots[0] > 0 && roots[1] > 0 && roots[0] + roots[1] === roots[2])
      found.push({ start, values: [a, b, c], roots });
  }
  return found;
}

const original2014WisdomSquare = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272],
];
for (const row of original2014WisdomSquare)
  assert.equal(row.reduce((a, b) => a + b, 0), 1033);
assert.equal(original2014WisdomSquare[2][2], 91);
const original2014Stage10Centres = [809, 331, 91];
assert.deepEqual(original2014Stage10Centres.filter((n) => n >= 0 && n < 256), [91]);

const walk = follow(values, 91, 16);
assert.deepEqual(walk.slice(0, 6), [91, 49, 16, 121, 237, 32]);
assert.deepEqual(walk.slice(1, 4).map(squareRoot), [7, 4, 11]);

const globalHits = allAdditiveSquareTriples(values);
assert.deepEqual(globalHits, [{
  start: 91,
  values: [49, 16, 121],
  roots: [7, 4, 11],
}]);

const digits59 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'.replace('f', '');
assert.equal(digits59.length, 59);
const values59 = cells.map((v) => digits59.indexOf(v[0]) * 59 + digits59.indexOf(v[1]));
assert.deepEqual(follow(values59, 91, 3), [91, 48, 249, 156]);
assert.equal(allAdditiveSquareTriples(values59).length, 0);

const p32 = corpus.pages.find((p) => p.page === 32).indices;
const p55 = corpus.pages.find((p) => p.page === 55).indices;
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
const side = squareRoot(p32.length);
assert.equal(side, 11);
const [row, col] = globalHits[0].roots;
assert.equal(row + col, side);
const sourceIndex = row * side + col;
const rune = p32[sourceIndex];
assert.equal(sourceIndex, 81);
assert.equal(corpus.translit[rune], 'NG');
assert.equal(corpus.prime[rune], 79);
assert.equal(3301 - 3222, 79); // p15 JPEG 32.jpg, top row second cell 3222
assert.deepEqual(follow(values, 79, 5), [79, 82, 201, 74, 205, 76]);

// Exact original-histogram random-table permutation null for a single,
// preselected non-square start 91. For positive distinct a,b and c=a+b,
// the three distinct lookups draw source values without replacement.
// The target p32 cell is fixed, not shuffled.
const mult = Array(256).fill(0);
for (const v of values) mult[v]++;
const denom = 256 * 255 * 254;
let anyTripleWeights = 0;
let thirdRoot11Weights = 0;
let root11Prime79Weights = 0;
for (let a = 1; a <= 15; a++) {
  for (let b = 1; a + b <= 15; b++) {
    if (a === b) continue; // repeated address cannot have two different outputs
    const c = a + b;
    const weight = mult[a * a] * mult[b * b] * mult[c * c];
    anyTripleWeights += weight;
    if (c === 11) {
      thirdRoot11Weights += weight;
      if (corpus.prime[p32[11 * a + b]] === 79)
        root11Prime79Weights += weight;
    }
  }
}
assert.equal(denom, 16581120);
assert.equal(anyTripleWeights, 106);
assert.equal(thirdRoot11Weights, 20);
assert.equal(root11Prime79Weights, 2);

const planted = values.slice();
planted[92] = 4;
planted[4] = 9;
planted[9] = 25;
assert(allAdditiveSquareTriples(planted).some((x) => x.start === 92 && x.roots.join(',') === '2,3,5'));


// Lowest-description direct ciphertext consumer: transfer the independently
// SOLVED p56 prime-totient cipher with initial prime79, the 22nd prime.
// The historical plaintext-F bypass does not consume the prime clock.
// Test ALL valid unknown bypass masks by propagating prime-index states.
const primes = [];
for (let n = 2; primes.length < 200; n++) {
  let ok = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { ok = false; break; }
  }
  if (ok) primes.push(n);
}
assert.equal(primes[21], 79);

/** @param {number[]} cipher @param {number} sign */
function strictTotientStates(cipher, sign) {
  let states = new Set([21]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const k of states) {
      const key = (primes[k] - 1) % 29;
      const plain = ((cipher[i] + sign * key) % 29 + 29) % 29;
      if (plain !== 0) next.add(k + 1);
      if (cipher[i] === 0) next.add(k); // possible literal plaintext-F bypass
    }
    states = next;
    if (states.size === 0) return { firstImpossible: i, survivors: 0 };
  }
  return { firstImpossible: -1, survivors: states.size };
}
assert.deepEqual(strictTotientStates(p55, -1), { firstImpossible: 5, survivors: 0 });
assert.deepEqual(strictTotientStates(p55, 1), { firstImpossible: 61, survivors: 0 });

// Genuine solved p57 native-GP material is a positive under each sign.
const clearPlant = corpus.pages.find((p) => p.page === 57).indices.slice(0, 76);
assert.equal(clearPlant.length, 76);
for (const sign of [-1, 1]) {
  let k = 21;
  const encrypted = clearPlant.map((plain) => {
    if (plain === 0) return 0;
    const cipher = ((plain - sign * ((primes[k] - 1) % 29)) % 29 + 29) % 29;
    k++;
    return cipher;
  });
  assert.equal(strictTotientStates(encrypted, sign).firstImpossible, -1);
}


// Secondary, source-defined 7+4=11 p32 torus stripe and solved-p57
// circumference selection. No fitted key phase, word order or language score.
const torusKey = Array.from({ length: 11 }, (_, i) => {
  const k = i + 1;
  return p32[((7 * k) % 11) * 11 + ((4 * k) % 11)];
});
assert.deepEqual(torusKey, [21, 20, 26, 24, 3, 22, 14, 7, 3, 23, 20]);
const transcript = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const physicalP55Words = transcript.split('%')[54].replace(/\/\s*/g, '').match(/[\u16A0-\u16FF]+/gu);
assert.equal(physicalP55Words.length, 17);
assert.equal(Array.from(physicalP55Words[0]).length, 1);
const gpByRune = new Map(corpus.runes.map((rune, i) => [rune, i]));
const strictWordInteriors = physicalP55Words.flatMap(
  (word) => Array.from(word).slice(1, -1).map((rune) => gpByRune.get(rune))
);
assert.equal(strictWordInteriors.length, 43);
assert.deepEqual(strictWordInteriors.flatMap((x, i) => x === 0 ? [i] : []), [11]);
assert.deepEqual(strictTotientStates(strictWordInteriors, -1), {
  firstImpossible: -1,
  survivors: 1,
});
assert.deepEqual(strictTotientStates(strictWordInteriors, 1), {
  firstImpossible: 38,
  survivors: 0,
});

/** @param {number[]} seq */
function indexOfCoincidence(seq) {
  const counts = Array(29).fill(0);
  for (const value of seq) counts[value]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (seq.length * (seq.length - 1));
}
const decoderCases = [
  { name: 'p55 all76', cipher: p55, expectation: [[0.029473684210526315, 0.03508771929824561], [0.034035087719298245, 0.031578947368421054]] },
  { name: 'p55 strict inner43', cipher: strictWordInteriors, expectation: [[0.03433001107419712, 0.02547065337763012], [0.023255813953488372, 0.03322259136212625]] },
];
for (const sample of decoderCases) {
  for (let family = 0; family < 2; family++) {
    for (const sign of [-1, 1]) {
      const recovered = sample.cipher.map((value, i) => {
        const runeIndex = torusKey[i % torusKey.length];
        const shift = family === 0 ? runeIndex : (primes[runeIndex] - 1) % 29;
        return ((value + sign * shift) % 29 + 29) % 29;
      });
      const actual = indexOfCoincidence(recovered);
      assert(Math.abs(actual - sample.expectation[family][(sign + 1) / 2]) < 1e-12,
        sample.name + ' torus family ' + family + ' sign ' + sign);
      for (let i = 0; i < recovered.length; i++) {
        const runeIndex = torusKey[i % torusKey.length];
        const shift = family === 0 ? runeIndex : (primes[runeIndex] - 1) % 29;
        assert.equal((recovered[i] - sign * shift + 2900) % 29, sample.cipher[i]);
      }
      console.log('TORUS ' + sample.name + ' family=' + (family ? 'phi(prime)' : 'gpIndex') +
        ' sign=' + sign + ' IoC=' + actual.toFixed(8));
    }
  }
}

console.log('PASS: 256 original cells, source 2014 centre91, and unique base60 square-root route');
console.log('91 -> 49 -> 16 -> 121 -> 237 -> 32; roots 7+4=11');
console.log('p32[7,4] = NG (GP prime79); p15 3301-3222 =79');
console.log('79 -> 82 -> 201 -> 74 -> 205 -> 76 = p55 original rune count');
console.log('Base59: no additive-square-triple start among 256 addresses');
console.log('Exact fixed-start shuffle-null: any = ' + anyTripleWeights + '/' + denom);
console.log('Third root11 = ' + thirdRoot11Weights + '/' + denom);
console.log('Third root11 + source cell prime79 = ' + root11Prime79Weights + '/' + denom);
console.log('Direct p55 p56-style phi(prime) from initial prime79 fails all valid F masks at runes 5/61.');
console.log('No unknown-page plaintext or decryption is claimed.');
