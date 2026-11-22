'use strict';
/**
 * Source-exact replay of a public 2026 LP2 p0-2 candidate decryption.
 * Counts how many 27x27 key nodes and next ciphertext starts survive
 * the proposal's first published next-key signature / ray predicates.
 *
 * This is a route audit, not a verified decipherment.
 * Run: node sims/lp2_2026_public_27square_route_source_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

/** @type {{ pages: Array<{page:number, indices:number[]}> }} */
const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const pages = source.pages.filter((p) => p.page >= 0 && p.page < 3);
assert.deepEqual(pages.map((p) => p.indices.length), [262, 266, 201]);
const stream = pages.flatMap((p) => p.indices);
assert.equal(stream.length, 729);
const digest = crypto.createHash('sha256').update(Buffer.from(stream)).digest('hex');
assert.equal(digest, '7878349fef98939f6c816d657547e7e80f1b875d83b28e239c328e67b26159c7');
/** @typedef {[number,number]} Cell */
/** @param {number} r @param {number} c */
function rune(r, c) { return stream[27 * (r - 1) + c - 1]; }
/** @param {Cell} p */
function at(p) { return rune(p[0], p[1]); }
/** @param {number} n */
function phi(n) {
  let result = n;
  let x = n;
  for (let p = 2; p * p <= x; p += 1) {
    if (x % p !== 0) continue;
    result -= Math.floor(result / p);
    while (x % p === 0) x /= p;
  }
  if (x > 1) result -= Math.floor(result / x);
  return result;
}
/** @param {number} n */
function mu(n) {
  let sign = 1;
  let x = n;
  for (let p = 2; p * p <= x; p += 1) {
    if (x % p !== 0) continue;
    x /= p;
    sign = -sign;
    if (x % p === 0) return 0;
  }
  return x > 1 ? -sign : sign;
}
/** @param {number[]} key */
function signature(key) { return key.map((k) => mu(phi(k))); }
/** @param {Cell[]} cells @param {boolean} transform */
function getKey(cells, transform) {
  const values = cells.map(at);
  if (values.includes(0)) return null;
  if (transform) values[1] = phi(values[1]);
  return values;
}
/** @param {number} row @param {number} start @param {number} end */
function line(row, start, end) {
  const out = [];
  for (let c = start; c <= end; c += 1) out.push([row, c]);
  return out;
}
/** @param {Cell[]} keyCells @param {boolean} transform @param {Cell[]} cipher */
function decode(keyCells, transform, cipher) {
  const key = getKey(keyCells, transform);
  assert.ok(key);
  const phase = ((signature(key).reduce((s, v) => s + v, 0) % 3) + 3) % 3;
  const aligned = [...key.slice(phase), ...key.slice(0, phase)];
  const plaintext = cipher.map((c, i) => (at(c) - aligned[i % 3] + 29) % 29);
  assert.deepEqual(plaintext.map((v, i) => (v + aligned[i % 3]) % 29), cipher.map(at));
  return { key, phase, aligned, plaintext };
}
const gp = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const firstCells = [...line(13, 25, 27), ...line(14, 1, 4)];
const stages = [
  decode([[13,11],[13,12],[13,13]], true, firstCells),
  decode(line(14,4,6), true, line(14,14,18)),
  decode([[4,23],[14,23],[24,23]], false, [[14,19],[13,19],[12,19],[11,19],[10,19]]),
  decode([[25,19],[26,19],[27,19]], true, [[14,7],[13,7],[12,7],[11,7]]),
];
const proposed = stages.map((s) => s.plaintext.map((i) => gp[i]).join(''));
assert.deepEqual(proposed, ['ASIGOTHE', 'WEATHER', 'TURNS', 'COLD']);
assert.deepEqual(stages.map((s) => s.phase), [0, 2, 0, 1]);
assert.deepEqual(stages.map((s) => s.key), [[25,10,28],[14,10,14],[8,21,5],[8,1,8]]);

/** @param {Cell} p */
const n0 = (p) => 27 * (p[0] - 1) + p[1];
/** @param {Cell} p */
const n90 = (p) => 27 * (p[1] - 1) + 28 - p[0];
/** @param {Cell} p */
const n270 = (p) => 27 * (27 - p[1]) + p[0];
const leftmost = firstCells.reduce((a, b) => b[1] < a[1] || (b[1] === a[1] && b[0] > a[0]) ? b : a);
const nextPhase = ((1 + firstCells.reduce((s, p) => s + mu(n0(p)), 0)) % 3 + 3) % 3;
const outer = ((mu(n90(leftmost)) % 2) + 2) % 2;
const signatureTable = {
  0: [[0,0,0],[1,1,1]],
  1: [[0,1,0],[1,-1,1]],
  2: [[0,-1,0],[1,0,1]],
};
const expected = signatureTable[nextPhase][outer];
assert.deepEqual(expected, [1, 0, 1]);
let valid = 0;
let matching = 0;
let mirrored = 0;
let targetMatches = 0;
for (let r = 1; r <= 27; r += 1) for (let c = 1; c <= 27; c += 1) {
  for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) for (let radius = 1; radius <= 26; radius += 1) {
    const l = [r - dr * radius, c - dc * radius];
    const rr = [r + dr * radius, c + dc * radius];
    if ([l, rr].some(([row, col]) => row < 1 || row > 27 || col < 1 || col > 27)) continue;
    const node = [l, [r,c], rr];
    for (const transformed of [false, true]) {
      const key = getKey(node, transformed);
      if (key === null) continue;
      valid += 1;
      if (!signature(key).every((v,i) => v === expected[i])) continue;
      matching += 1;
      if (at(l) === at(rr)) mirrored += 1;
      if (r === 14 && c === 5 && dr === 0 && dc === 1 && radius === 1 && transformed) targetMatches += 1;
    }
  }
}
assert.deepEqual([valid, matching, mirrored, targetMatches], [26024, 1469, 163, 1]);
const begin = firstCells[0];
const end = firstCells[firstCells.length - 1];
const q = Number(mu(n0(end)) === 0 && mu(n270(end)) === 0);
const z = Number(mu(n0(begin)) === 0 && mu(n90(begin)) === 0);
const distance = q * (1 - z);
let possibleStarts = 0;
for (let r = 1; r <= 27; r += 1) for (let c = 1; c <= 27; c += 1) {
  const dr = Math.abs(r - leftmost[0]);
  const dc = Math.abs(c - leftmost[1]);
  if (Math.min(dr, dc, Math.abs(dr-dc)) === distance) possibleStarts += 1;
}
assert.deepEqual([q, z, distance, possibleStarts], [0, 0, 0, 79]);
console.log(JSON.stringify({
  original729Sha256: digest,
  proposed,
  keyCoordinates: [[[13,11],[13,12],[13,13]], [[14,4],[14,5],[14,6]], [[4,23],[14,23],[24,23]], [[25,19],[26,19],[27,19]]],
  candidateOnly: true,
  fourStages: stages.map((s) => ({key: s.key, phase: s.phase, aligned: s.aligned, plaintext: s.plaintext})),
  firstTransition: {signature: expected, validKeyInstances: valid, compatibleKeyInstances: matching, compatibleMirrorKeyInstances: mirrored, compatibleNextCipherStarts: possibleStarts},
}, null, 2));
