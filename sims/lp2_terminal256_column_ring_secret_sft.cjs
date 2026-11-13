'use strict';
/**
 * Exact all-secret column/shell/row lookup obstruction to a 32x8 grid
 * decoder for original LP2 p55-p57; all eight outer-ring orientations.
 *
 * The final 180 plaintext GP29 symbols are known from solved p56 (prime
 * totient) and directly legible p57. p55 supplies the 76 unknown symbols.
 * Within each prescribed table-cell group the entire 29->29 codebook is
 * unrestricted. No language score or fitted key is used for rejection.
 *
 * Run: node sims/lp2_terminal256_column_ring_secret_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const db = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json')));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json')));
const bytes = grid.bytes;
const mod = value => (value % 29 + 29) % 29;
assert.deepEqual([db.pages[55].indices.length, db.pages[56].indices.length,
  db.pages[57].indices.length, bytes.length], [76, 85, 95, 256]);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(n);
  }
  return primes;
}
const primes = firstPrimes(100);
let primeIndex = 0;
const p56 = db.pages[56].indices.map((c, position) =>
  position === 56 ? 0 : mod(c - (primes[primeIndex++] - 1)));
const gp = db.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} words @returns {number[]} */
function encodeGp(words) {
  const out = [];
  for (const word of words.split(' ')) {
    for (let i = 0; i < word.length;) {
      const token = gp.find(entry => word.startsWith(entry.token, i));
      assert(token, 'Missing GP token at ' + word.slice(i));
      out.push(token.index);
      i += token.token.length;
    }
  }
  return out;
}
assert.deepEqual(p56, encodeGp(
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ' +
  'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'));
const known180 = p56.concat(db.pages[57].indices);
assert.equal(known180.length, 180);

const rings = [];
for (let d = 0; d < 4; d++) {
  const ring = [], top = d, bottom = 31 - d, left = d, right = 7 - d;
  for (let x = left; x <= right; x++) ring.push(8 * top + x);
  for (let y = top + 1; y <= bottom; y++) ring.push(8 * y + right);
  for (let x = right - 1; x >= left; x--) ring.push(8 * bottom + x);
  for (let y = bottom - 1; y >= top + 1; y--) ring.push(8 * y + left);
  rings.push(ring);
}
assert.deepEqual(rings.map(ring => ring.length), [76, 68, 60, 52]);
const corners = [[0, 0], [0, 7], [31, 7], [31, 0]];
/**
 * @param {number} corner @param {-1|1} direction
 * @returns {number[]}
 */
function ringPath(corner, direction) {
  const [cy, cx] = corners[corner];
  const path = rings.flatMap((ring, depth) => {
    const y = Math.max(depth, Math.min(31 - depth, cy));
    const x = Math.max(depth, Math.min(7 - depth, cx));
    const start = ring.indexOf(8 * y + x);
    assert(start >= 0);
    return ring.map((_, i) => ring[(start + direction * i + ring.length * 2) % ring.length]);
  });
  assert.equal(new Set(path).size, 256);
  return path;
}
/**
 * Exact maximum-likelihood count for unrestricted deterministic lookups,
 * one independent 29->29 function for each group. Conflicting observations
 * with the same (group,byte mod29) force at least one error.
 * @param {number[]} path256
 * @param {number[]} target180
 * @param {(i:number, cell:number)=>string|number} group
 */
function obstruction(path256, target180, group) {
  const classes = new Map();
  for (let i = 76; i < 256; i++) {
    const cell = path256[i];
    const key = String(group(i, cell)) + ':' + (bytes[cell] % 29);
    const votes = classes.get(key) || new Map();
    const y = target180[i - 76];
    votes.set(y, (votes.get(y) || 0) + 1);
    classes.set(key, votes);
  }
  let best = 0, conflictingInputs = 0;
  for (const votes of classes.values()) {
    best += Math.max(...votes.values());
    if (votes.size > 1) conflictingInputs++;
  }
  return { errors: 180 - best, distinctStateInputs: classes.size, conflictingInputs };
}
const groupings = {
  column: (_, cell) => cell % 8,
  shellColumn: (i, cell) => (i < 144 ? 1 : i < 204 ? 2 : 3) * 8 + (cell % 8),
  row: (_, cell) => Math.floor(cell / 8)
};
const outcomes = [];
for (let corner = 0; corner < 4; corner++) {
  for (const direction of [-1, 1]) {
    const ring = ringPath(corner, direction);
    const result = { corner, direction };
    for (const [name, group] of Object.entries(groupings))
      result[name] = obstruction(ring, known180, group);
    outcomes.push(result);
  }
}
assert.deepEqual(outcomes.map(item => item.column.errors), [64, 62, 63, 64, 63, 62, 61, 63]);
assert.deepEqual(
  ['column', 'shellColumn', 'row'].map(name => Math.min(...outcomes.map(x => x[name].errors))),
  [61, 57, 10]);

// Source-size positive plant: a distinct invertible affine substitution per
// original grid column. All 180 known symbols must fit perfectly; the affine
// parameters recovered from them must reproduce the withheld 76-symbol shell.
const truePath = ringPath(0, 1);
const plant256 = truePath.map(cell => {
  const column = cell % 8;
  return mod((3 * column + 1) * (bytes[cell] % 29) + 5 * column + 2);
});
assert.equal(obstruction(truePath, plant256.slice(76), groupings.column).errors, 0);
const fitted = Array(8).fill(null);
for (let column = 1; column <= 6; column++) {
  const samples = [];
  for (let i = 76; i < 256; i++) {
    const cell = truePath[i];
    if (cell % 8 === column) samples.push([bytes[cell] % 29, plant256[i]]);
  }
  const [x0, y0] = samples[0];
  const [x1, y1] = samples.find(([x]) => x !== x0);
  const dx = mod(x1 - x0);
  let inv = 1;
  while (mod(inv * dx) !== 1) inv++;
  const a = mod((y1 - y0) * inv), b = mod(y0 - a * x0);
  assert(samples.every(([x, y]) => mod(a * x + b) === y));
  fitted[column] = [a, b];
}
// Inner rings occupy only source columns 1 through 6. The authentic geometry
// therefore cannot determine a column-0 or column-7 key from known p56/p57.
const recoveredOuter = truePath.slice(0, 76).map(cell => {
  const key = fitted[cell % 8];
  return key === null ? null : mod(key[0] * (bytes[cell] % 29) + key[1]);
});
assert.equal(recoveredOuter.filter(x => x !== null).length, 12);
assert.equal(recoveredOuter.filter(x => x === null).length, 64);
for (let i = 0; i < 76; i++) {
  if (recoveredOuter[i] !== null) assert.equal(recoveredOuter[i], plant256[i]);
}
console.log(JSON.stringify({
  source: {tableCells:256, p55Unknown:76, solvedP56:85, clearP57:95,
    originalBytesSha256:'3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290'},
  outcomes, bestErrors: {column:61, shellColumn:57, row:10},
  positiveControl:{correctPath:[0,1], knownFitErrors:0, recoveredOuterWithLearnedKeys:12, unconstrainedOuterColumns:64},
  decision:'No stationary column-local, shell-and-column-local, or row-local 29->29 table, regardless of secret keys, fits 180 authentic known terminal runes in any of eight ring orientations.'
},null,2));
