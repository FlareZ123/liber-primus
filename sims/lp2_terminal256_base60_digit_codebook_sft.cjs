'use strict';

/**
 * Original LP2 pp49-51 base60 digit-wise secret-codebook gate.
 *
 * A 32x8 grid has 256 printed two-character base60 numerals. Its outer
 * circumference has 76 cells; the 180 inner cells are provisionally mapped
 * to the independently known p56 decrypted and p57 clear GP29 runes.
 * Suppose each source numeral H:L decodes as:
 *     P[cell] = a[H] + b[L] (mod 29)
 * with 5+60 completely arbitrary secret digit tables. The entire key space
 * is tested exactly by a weighted bipartite graph's cycle constraints.
 * No digit table is selected using any unknown p55 ciphertext.
 *
 * SFT (Windows 11, Node.js 22):
 *   node sims/lp2_terminal256_base60_digit_codebook_sft.cjs
 *
 * No external packages, network, file writes, or fitted language parameters.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');

/** @param {string} name @returns {any} */
function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
}
const corpus = readJSON('resources/liber-primus/lp2-corpus.json');
const table = readJSON('resources/liber-primus/lp2-grid-256.json');
const bytes = table.bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.ok(bytes.every(v => Number.isInteger(v) && v >= 0 && v < 256));
/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;
/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const result = [];
  for (let n = 2; result.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) result.push(n);
  }
  return result;
}
const p56 = corpus.pages[56].indices;
const p57 = corpus.pages[57].indices;
assert.deepEqual([corpus.pages[55].indices.length, p56.length, p57.length],
  [76, 85, 95]);
const primes = firstPrimes(100);
let clock = 0;
const decrypted56 = p56.map((cipher, i) =>
  i === 56 ? 0 : mod29(cipher - (primes[clock++] - 1)));
assert.equal(clock, 84);
const knownInputs = [
  {label: 'p56 authenticated plaintext + p57 literal plaintext',
    runes: decrypted56.concat(p57)},
  {label: 'p56 printed ciphertext + p57 literal plaintext',
    runes: p56.concat(p57)}
];
for (const register of knownInputs) assert.equal(register.runes.length, 180);

// Source-printed rectangle, 32 rows of 8 cells. Outer-to-inner ring sizes
// 76, 68, 60, 52, with each inner ring independently oriented.
const rings = [];
for (let d = 0; d < 4; d++) {
  const positions = [];
  for (let x = d; x <= 7 - d; x++) positions.push(d * 8 + x);
  for (let y = d + 1; y <= 31 - d; y++) positions.push(y * 8 + 7 - d);
  for (let x = 6 - d; x >= d; x--) positions.push((31 - d) * 8 + x);
  for (let y = 30 - d; y > d; y--) positions.push(y * 8 + d);
  rings.push(positions);
}
assert.deepEqual(rings.map(r => r.length), [76, 68, 60, 52]);
assert.equal(new Set(rings.flat()).size, 256);
const corners = [[0, 0], [0, 7], [31, 7], [31, 0]];
const orders = [[], [], [], []];
for (let d = 1; d < 4; d++) {
  for (let corner = 0; corner < 4; corner++) {
    for (const dir of [-1, 1]) {
      const [originalY, originalX] = corners[corner];
      const y = Math.max(d, Math.min(31 - d, originalY));
      const x = Math.max(d, Math.min(7 - d, originalX));
      const ring = rings[d];
      const start = ring.indexOf(y * 8 + x);
      assert.ok(start >= 0);
      orders[d].push(ring.map((_, i) =>
        ring[(start + dir * i + 2 * ring.length) % ring.length]));
    }
  }
}
assert.ok(orders.slice(1).every(o => o.length === 8));

/**
 * Weighted union-find: let z[0..4]=a and z[5..64]=-b.
 * An observed digit pair H:L and plaintext rune P imposes
 * z[H]-z[5+L] = P (mod29). Consistency across all cycles is
 * necessary and sufficient for a solution with arbitrary secret tables.
 *
 * @param {number[]} route - 180 positions in the original printed grid
 * @param {number[]} known - 180 independently supplied rune indices
 * @returns {{fit:boolean,prefix:number,outerPredicted:number,components:number}}
 */
function solveDigitCodebooks(route, known) {
  assert.equal(route.length, 180);
  assert.equal(known.length, 180);
  const parent = Array.from({length:65}, (_, i) => i);
  const diff = Array(65).fill(0);
  /** @param {number} value @returns {[number,number]} */
  function find(value) {
    if (parent[value] === value) return [value, 0];
    const [representative, offset] = find(parent[value]);
    diff[value] = mod29(diff[value] + offset);
    parent[value] = representative;
    return [representative, diff[value]];
  }
  for (let i = 0; i < route.length; i++) {
    const byte = bytes[route[i]];
    const h = Math.floor(byte / 60);
    const l = byte % 60;
    const [hr, hd] = find(h);
    const [lr, ld] = find(l + 5);
    if (hr === lr) {
      if (mod29(hd - ld) !== known[i]) {
        return {fit:false, prefix:i, outerPredicted:0, components:0};
      }
    } else {
      parent[hr] = lr;
      diff[hr] = mod29(known[i] - hd + ld);
    }
  }
  let outerPredicted = 0;
  for (const pos of rings[0]) {
    const byte = bytes[pos];
    const [hr] = find(Math.floor(byte / 60));
    const [lr] = find(5 + byte % 60);
    if (hr === lr) outerPredicted++;
  }
  const components = new Set(parent.map((_, i) => find(i)[0])).size;
  return {fit:true, prefix:180, outerPredicted, components};
}

// Exact original-input all-secret test. Every tested orientation of all
// three known rings has contradictory cycle equations by rune 33 or earlier.
const originalResults = [];
for (const register of knownInputs) {
  let matches = 0;
  let furthestConsistentPrefix = 0;
  const prefixHistogram = {};
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      for (let k = 0; k < 8; k++) {
        const route = orders[1][i].concat(orders[2][j], orders[3][k]);
        const outcome = solveDigitCodebooks(route, register.runes);
        matches += Number(outcome.fit);
        furthestConsistentPrefix = Math.max(furthestConsistentPrefix, outcome.prefix);
        prefixHistogram[outcome.prefix] =
          (prefixHistogram[outcome.prefix] || 0) + 1;
      }
    }
  }
  assert.equal(matches, 0);
  assert.equal(furthestConsistentPrefix, 32);
  originalResults.push({
    register:register.label, tested:512, consistent:matches,
    maximumKnownPrefixBeforeContradiction:furthestConsistentPrefix,
    prefixHistogram
  });
}

// Exact lossless positive. Two independent arbitrary nonlinear digit tables
// generate an entire source-grid known suffix; the SAME unfitted graph fits.
const plantRoute = orders[1][0].concat(orders[2][0], orders[3][0]);
const f = Array.from({length:5}, (_, h) => mod29(7*h+9));
const g = Array.from({length:60}, (_, l) => mod29(11*l+3*l*l));
const positiveKnown = plantRoute.map(pos => {
  const byte = bytes[pos];
  return mod29(f[Math.floor(byte / 60)] + g[byte % 60]);
});
const plant = solveDigitCodebooks(plantRoute, positiveKnown);
assert.equal(plant.fit, true);
assert.equal(plant.prefix, 180);
assert.equal(plant.outerPredicted, 72);
assert.equal(positiveKnown.length, 180);
console.log(JSON.stringify({
  source:'LP2 original 256-token printed base60 table; 180 authentic terminal GP runes',
  architecture:'P[cell] = f[high_base60_digit] + g[low_base60_digit] mod 29',
  keySpace:'5+60 arbitrary secret 29-valued codebook entries',
  outerRingUnknown:76, authenticatedKnownSuffix:180,
  independentInnerRingOrientations:512,
  originalResults, positivePlant:plant,
  recoveredOriginalUnknownPlaintext:0,
  conclusion:'Exact exclusion of additive two-digit codebooks on this optional terminal-ring mapping'
}, null, 2));
