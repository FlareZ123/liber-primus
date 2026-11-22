'use strict';

/**
 * Original LP2 first chapter: source-visible 729=27^2 rune reflow,
 * complete outer-to-inner square-ring traversal, followed by exact p56
 * phi(prime) / plaintext-F-transparent cipher inverse. Bounded negative.
 * Self-contained original-source regression for Node.js 22 on Windows.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = corpus.pages.slice(0, 3).flatMap(page => page.indices);
assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.runic_count), [262, 266, 201]);
assert.equal(source.length, 27 * 27);

const outerToInner = [];
for (let depth = 0; depth <= 13; depth += 1) {
  const a = depth, b = 26 - depth;
  if (a === b) { outerToInner.push(a * 27 + a); continue; }
  for (let c = a; c < b; c += 1) outerToInner.push(a * 27 + c);
  for (let r = a; r < b; r += 1) outerToInner.push(r * 27 + b);
  for (let c = b; c > a; c -= 1) outerToInner.push(b * 27 + c);
  for (let r = b; r > a; r -= 1) outerToInner.push(r * 27 + a);
}
assert.equal(outerToInner.length, 729);
assert.equal(new Set(outerToInner).size, 729);

/**
 * @param {number} orientation Three bits: bit2 mirror, bits0-1 rotations.
 * @param {boolean} reverse Traverse center-to-edge instead.
 * @returns {number[]}
 */
function readRings(orientation, reverse) {
  const position = outerToInner.map(index => {
    let row = Math.floor(index / 27), column = index % 27;
    if ((orientation & 4) !== 0) column = 26 - column;
    for (let k = 0; k < (orientation & 3); k += 1) {
      const temp = row;
      row = column;
      column = 26 - temp;
    }
    return row * 27 + column;
  });
  if (reverse) position.reverse();
  return position.map(i => source[i]);
}

const sieve = new Uint8Array(180000);
const key = [];
for (let p = 2; p < sieve.length && key.length < 9000; p += 1) {
  if (sieve[p]) continue;
  key.push((p - 1) % 29);
  if (p * p < sieve.length) {
    for (let x = p * p; x < sieve.length; x += p) sieve[x] = 1;
  }
}
assert.equal(key.length, 9000);
const mod = n => ((n % 29) + 29) % 29;

/**
 * Exact p56 plaintext-F bypass reachability, merging equivalent key clocks.
 * @param {number[]} cipher
 * @param {number} start Prime ordinal index, zero-based.
 * @param {number} sign Encryption sign (+1 / -1).
 * @returns {number}
 */
function furthest(cipher, start, sign) {
  let states = [0];
  for (let i = 0; i < cipher.length; i += 1) {
    const next = [];
    const seen = new Uint8Array(i + 2);
    for (const used of states) {
      if (cipher[i] === 0 && !seen[used]) {
        seen[used] = 1;
        next.push(used);
      }
      if (mod(cipher[i] - sign * key[start + used]) !== 0 && !seen[used + 1]) {
        seen[used + 1] = 1;
        next.push(used + 1);
      }
    }
    if (next.length === 0) return i;
    states = next;
  }
  return cipher.length;
}

/**
 * Recover all exactly legal F-transparent paths without fitting plaintext.
 * @param {number[]} cipher
 * @param {number} start
 * @param {number} sign
 * @returns {number[][]}
 */
function decodePaths(cipher, start, sign) {
  let paths = new Map([[0, [[]]]]);
  for (const c of cipher) {
    const next = new Map();
    for (const [used, variants] of paths) {
      if (c === 0) {
        const dest = next.get(used) || [];
        for (const prefix of variants) dest.push(prefix.concat(0));
        next.set(used, dest);
      }
      const p = mod(c - sign * key[start + used]);
      if (p !== 0) {
        const dest = next.get(used + 1) || [];
        for (const prefix of variants) dest.push(prefix.concat(p));
        next.set(used + 1, dest);
      }
    }
    paths = next;
  }
  return [...paths.values()].flat();
}

/** @param {number[]} plain @param {number} start @param {number} sign */
function encrypt(plain, start, sign) {
  let consumed = 0;
  return plain.map(p => p === 0 ? 0 : mod(p + sign * key[start + consumed++]));
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = new Array(29).fill(0);
  for (const v of values) counts[v] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}

const expected = new Map([
  ['0|0|1', [2381, 2382]],
  ['1|0|1', [3243, 4545]],
  ['2|1|-1', [4406]],
  ['3|0|-1', [1359, 1360, 1361, 1362]],
  ['4|0|-1', [2078, 2079, 2080]],
  ['4|1|1', [35, 36]],
  ['5|1|1', [3285, 3286]],
  ['6|0|1', [4438]],
  ['6|1|1', [3308]],
  ['7|0|1', [3515, 3516, 3517]],
  ['7|0|-1', [538, 539, 540, 541, 542]]
]);
const summary = [];
let total = 0, maximum = 0, decodedPaths = 0;
for (let orientation = 0; orientation < 8; orientation += 1) {
  for (const reverse of [false, true]) {
    const cipher = readRings(orientation, reverse);
    for (const sign of [1, -1]) {
      const starts = [];
      for (let start = 0; start < 5000; start += 1) {
        if (furthest(cipher, start, sign) === 729) starts.push(start);
      }
      const name = [orientation, Number(reverse), sign].join('|');
      assert.deepEqual(starts, expected.get(name) || [], name);
      total += starts.length;
      for (const start of starts) {
        const decodes = decodePaths(cipher, start, sign);
        assert.ok(decodes.length > 0);
        decodedPaths += decodes.length;
        for (const decoded of decodes) {
          assert.deepEqual(encrypt(decoded, start, sign), cipher);
          maximum = Math.max(maximum, ioc(decoded));
        }
      }
      if (starts.length) summary.push({orientation, reverse, sign, starts});
    }
  }
}
assert.equal(total, 26);
assert.ok(maximum < 0.04, 'No prime-start candidate supports clear-English IoC');
assert.ok(ioc(corpus.pages[57].indices) > 0.06);

// Authenticated solved-p56 independently fixes this plaintext-F cipher mode.
const knownP56 = ('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE ' +
  'THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE')
  .split(' ');
const spellings = corpus.translit.map((s,i) => ({s,i}))
  .sort((a,b) => b.s.length - a.s.length);
const normalize = s => s.replace(/QU/g,'CW').replace(/V/g,'U')
  .replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');
const p56Plain = [];
for (const word of knownP56) {
  const s = normalize(word);
  for (let i=0;i<s.length;) {
    const token = spellings.find(item => s.startsWith(item.s,i));
    assert.ok(token);
    p56Plain.push(token.i);
    i += token.s.length;
  }
}
assert.equal(p56Plain.length, 85);
assert.deepEqual(encrypt(p56Plain, 0, 1), corpus.pages[56].indices);
console.log(JSON.stringify({
  source: 'p0–2 729 original GP29 runes in one 27-by-27 row-major reflow',
  permutations: '8 dihedral orientations * 2 directions',
  candidateCipherModes: 'plus/minus p56 phi(prime), F-transparent',
  testedPrimeStarts: '0..4999',
  fullReachableModels: total,
  fullLegalPlaintextPaths: decodedPaths,
  maximumOriginalPlaintextIoC: maximum,
  p57ClearIoC: ioc(corpus.pages[57].indices),
  survivors: summary,
  decision: 'Only a bounded gate. No original English or creator-selected key. Do not infer p0 geometry is author-arranged.'
}, null, 2));
