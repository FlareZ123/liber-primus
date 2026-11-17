'use strict';

/**
 * Fully source-frozen ambiguity witness at the proposed 27x27 p0–p2 map's
 * transition after block 17 (THEN). Rechecks the published Report 00–16
 * constraints using untouched canonical GP29 original ciphertext.
 *
 * node sims/lp2_p0_27square_afterthen_fulllattice_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const tape = source.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
assert.equal(tape.length, 729);
const at = ([r, c]) => tape[(r - 1) * 27 + c - 1];
const n0 = ([r, c]) => 27 * (r - 1) + c;
const n1 = ([r, c]) => 27 * (c - 1) + 28 - r;
const n2 = x => 730 - n0(x);
const n3 = x => 730 - n1(x);
const mod = (x, n) => ((x % n) + n) % n;

/** @param {number} n @returns {number} */
function phi(n) {
  let value = n;
  let rest = n;
  for (let d = 2; d * d <= rest; d += 1) {
    if (rest % d !== 0) continue;
    value -= value / d;
    while (rest % d === 0) rest /= d;
  }
  if (rest > 1) value -= value / rest;
  return value;
}

/** @param {number} n @returns {number} */
function mu(n) {
  let sign = 1;
  let rest = n;
  for (let d = 2; d * d <= rest; d += 1) {
    if (rest % d !== 0) continue;
    rest /= d;
    sign = -sign;
    if (rest % d === 0) return 0;
    while (rest % d === 0) rest /= d;
  }
  return rest > 1 ? -sign : sign;
}

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

/** @param {number[][]} cells @returns {number[]} */
function leftmost(cells) {
  return cells.reduce((x, y) => y[1] < x[1] ||
    (y[1] === x[1] && y[0] > x[0]) ? y : x);
}

/** @param {number[][]} node @returns {number} */
function nodeAxis(node) {
  const dr = node[2][0] - node[0][0];
  const dc = node[2][1] - node[0][1];
  if (dr === 0) return 0;       // horizontal
  if (dc === 0) return 2;       // vertical
  return dr * dc > 0 ? 1 : 3;  // NW-SE or NE-SW
}

const previous = {
  node: [[25, 22], [26, 22], [27, 22]], // IA–IA–IA
  cipher: [[25, 25], [25, 26], [25, 27]], // L–T–W
  phases: [0, 2, 0, 1, 0, 1, 2, 1, 0, 2, 2, 1, 2, 0, 1, 2, 1],
};
const prevRaw = previous.node.map(at);
const prevKey = [prevRaw[0], phi(prevRaw[1]), prevRaw[2]];
const prevSig = prevKey.map(x => mu(phi(x)));
const prevPhase = mod(prevSig.reduce((a, b) => a + b, 0), 3);
const prevAligned = prevKey.slice(prevPhase).concat(prevKey.slice(0, prevPhase));
assert.deepEqual(prevRaw, [27, 27, 27]);
assert.equal(prevPhase, 1);
assert.equal(previous.cipher.map((x, i) =>
  source.translit[mod(at(x) - prevAligned[i % 3], 29)]).join(''), 'THEN');
const S = previous.phases.reduce((a, b) => a + b, 0);
assert.equal(S, 18); // 17 published source-key phases, including SOON main route

const B = previous.cipher[0];
const E = previous.cipher.at(-1);
const L = leftmost(previous.cipher);
const M = previous.node[1];
const Z = previous.node.at(-1);
const mode = Math.floor(S / 7) % 4;
assert.equal(mode, 2); // reflected/+1
const nextPhase = mod(1 + previous.cipher.reduce((sum, x) => sum + mu(n2(x)), 0), 3);
const nextOuter = mod(prevSig[0] + mu(n1(L)), 2);
const targetSig = nextPhase === 0 ? (nextOuter ? [1, 1, 1] : [0, 0, 0])
  : nextPhase === 1 ? (nextOuter ? [1, -1, 1] : [0, 1, 0])
  : (nextOuter ? [1, 0, 1] : [0, -1, 0]);
assert.equal(nextPhase, 0);
assert.deepEqual(targetSig, [1, 1, 1]);
assert.ok(!(nextPhase === 2 && S % 7 === 6));

const tau = mod(mu(n3(E)) + phi(prevRaw[1]), 2);
const axisScore = mu(n2(B) + n0(M)) + mu(gcd(n1(E), n2(E)));
const nextAxis = axisScore < 0 ? 'diagonal' : axisScore > 0 ? 'vertical' : 'horizontal';
const keyRow = mod(1 + B[1] + E[0] + M[0] + mu(n2(B)), 2);
const keyCol = mod(1 + B[0] + E[0] + M[0], 2);
const endRow = mod(1 + prevPhase + mu(n2(M)), 2);
const leftRow = mod(keyRow + 1 + prevPhase + mu(M[0]), 2);
const leftCol = mod(B[0] + previous.cipher.reduce((sum, x) => sum + mu(n1(x)), 0)
  + 1 + mu(n3(M)), 2);
const rayAllowance = Number(mu(n0(E)) === 0 && mu(n3(E)) === 0);
const exactRay = Number(rayAllowance && !(mu(n0(B)) === 0 && mu(n1(B)) === 0));
const mirrorBit = Number(Math.max(Math.abs(Z[0] - L[0]), Math.abs(Z[1] - L[1])) % 3 !== 2);
const group = Number((mu(n1(M) + n2(Z)) < 0) === (mu(n1(L) + n2(Z)) < 0));
const sourcePrimeSum = prevRaw.reduce((sum, v) => sum + source.prime[v], 0);
const diagonalBit = Number(mu(gcd(n1(M), n3(Z))) < 0)
  ^ Number(mu(sourcePrimeSum) > 0)
  ^ Number(mu(n0(M) + n3(Z)) !== 0);
const keyAxis = 2 * group + diagonalBit;
const radiusParity = mod(M[0] + M[1] + B[0] + B[1], 2)
  ^ Number(mu(gcd(n2(Z), n2(L))) < 0)
  ^ Number(mu(n1(B) + n1(E)) > 0);

assert.deepEqual({
  tau, nextAxis, keyRow, keyCol, endRow, leftRow, leftCol,
  rayAllowance, exactRay, mirrorBit, keyAxis, radiusParity,
}, {
  tau: 0, nextAxis: 'diagonal', keyRow: 0, keyCol: 1,
  endRow: 1, leftRow: 1, leftCol: 0, rayAllowance: 1,
  exactRay: 1, mirrorBit: 1, keyAxis: 2, radiusParity: 1,
});

/**
 * Apply every relevant finite Report 00–16 constraint. Report 16's word
 * acceptance is explicitly limited to the TWO familiar complete English
 * words in the competing certificate, with no dictionary optimization.
 * @param {{node:number[][], cipher:number[][], expected:string}} candidate
 */
function certify(candidate) {
  const {node, cipher, expected} = candidate;
  assert.equal(nodeAxis(node), keyAxis);  // Reports 13–14
  const center = node[1];
  const rad = Math.max(Math.abs(node[0][0] - center[0]),
    Math.abs(node[0][1] - center[1]));
  assert.equal(rad % 2, radiusParity);  // Report 15
  assert.equal(center[0] % 2, keyRow);
  assert.equal(center[1] % 2, keyCol); // Report 04
  assert.equal(at(node[0]), at(node[2])); // Report 07
  assert.equal(mirrorBit, 1);
  const raw = node.map(at);
  assert.ok(raw.every(x => x >= 1)); // Report 00 key domain
  const derived = [raw[0], phi(raw[1]), raw[2]];
  assert.deepEqual(derived.map(x => mu(phi(x))), targetSig);
  const phase = mod(targetSig.reduce((a, b) => a + b, 0), 3);
  assert.equal(phase, nextPhase); // Report 01 + 11
  assert.ok(cipher.length >= 2); // Report 08
  const first = cipher[0];
  const last = cipher.at(-1);
  const l = leftmost(cipher);
  assert.deepEqual(l, last); // Report 02, tau=0
  assert.equal(tau, 0);
  assert.ok(cipher.every((x, i) => x[0] === first[0] - i
    && x[1] === first[1] - i)); // Report 03 up-left
  assert.equal(nextAxis, 'diagonal');
  assert.equal(last[0] % 2, endRow);
  assert.equal(l[0] % 2, leftRow); // Report 05
  assert.equal(l[1] % 2, leftCol); // Report 09
  assert.ok([-1, 0].includes(mu(n1(l)))); // Report 02 reflected mode
  const dr = Math.abs(first[0] - L[0]);
  const dc = Math.abs(first[1] - L[1]);
  const d8 = Math.min(dr, dc, Math.abs(dr - dc));
  assert.ok(d8 <= rayAllowance); // Report 06
  assert.equal(d8, exactRay); // Report 12
  const gs = [
    gcd(n0(center), n0(first)),
    gcd(n0(center), n0(l)),
    gcd(n1(center), n3(last)),
    gcd(n0(center), n2(last)),
  ];
  assert.ok(gs.every(g => mu(g) !== 0)); // Report 10
  const aligned = derived.slice(phase).concat(derived.slice(0, phase));
  const text = cipher.map((x, i) =>
    source.translit[mod(at(x) - aligned[i % 3], 29)]).join('');
  assert.equal(text, expected); // Report 00; words are intact (Report 16)
  return {text, raw: raw.map(v => source.translit[v]),
    key: aligned.map(v => source.translit[v]), sourceCenter: center,
    radius: rad, begin: first, end: last, gcdChecks: gs.map(mu)};
}

const the = certify({
  node: [[17, 17], [20, 17], [23, 17]],
  cipher: [[22, 21], [21, 20]],
  expected: 'THE',
});
const my = certify({
  node: [[5, 25], [8, 25], [11, 25]],
  cipher: [[18, 17], [17, 16]],
  expected: 'MY',
});

// Independent third complete-word candidate, with the same legitimate X–M–X
// source and a different ray location. It does not rely on a guessed key.
const of = certify({
  node: [[5, 25], [8, 25], [11, 25]],
  cipher: [[6, 5], [5, 4]],
  expected: 'OF',
});

// Count alternative source nodes and ciphertext locations without any language
// filter; all pass the exact source-predicted key/source/cipher constraints.
const keys = [];
for (let r = 2; r <= 26; r += 2) {
  for (let c = 1; c <= 27; c += 2) {
    for (let radius = 1; radius <= 13; radius += 2) {
      if (r - radius < 1 || r + radius > 27) continue;
      const node = [[r - radius, c], [r, c], [r + radius, c]];
      const raw = node.map(at);
      if (raw.some(x => x === 0) || raw[0] !== raw[2]) continue;
      const key = [raw[0], phi(raw[1]), raw[2]];
      if (key.some(x => mu(phi(x)) !== 1)) continue;
      keys.push({node, key});
    }
  }
}
assert.equal(keys.length, 4);
const all = [];
for (let r = 2; r <= 27; r += 1) {
  for (let c = 2; c <= 27; c += 1) {
    for (let length = 2; length <= Math.min(r, c); length += 1) {
      const first = [r, c];
      const last = [r - length + 1, c - length + 1];
      if (last[0] % 2 !== endRow || last[1] % 2 !== leftCol) continue;
      if (mu(n1(last)) > 0) continue;
      const dr = Math.abs(r - L[0]), dc = Math.abs(c - L[1]);
      if (Math.min(dr, dc, Math.abs(dr - dc)) !== exactRay) continue;
      for (const {node, key} of keys) {
        const center = node[1];
        const checks = [
          gcd(n0(center), n0(first)),
          gcd(n0(center), n0(last)),
          gcd(n1(center), n3(last)),
          gcd(n0(center), n2(last)),
        ];
        if (checks.some(x => mu(x) === 0)) continue;
        const plain = Array.from({length}, (_, i) => source.translit[
          mod(at([r - i, c - i]) - key[i % 3], 29)]).join('');
        all.push(plain);
      }
    }
  }
}
assert.equal(all.length, 1104);
assert.equal(new Set(all).size, 1093);
assert.ok(all.includes('MY') && all.includes('THE') && all.includes('OF'));

console.log(JSON.stringify({
  original: 'LP2 p0–p2, all 729 unmodified GP29 rune indices',
  lastFittedBlock: '17: THEN',
  reportedPhaseSum: S,
  reportedRuleRange: '00–16',
  ciphertextKeyPairsSatisfyingFiniteRules: all.length,
  distinctDecodedOutputs: new Set(all).size,
  directCompleteWordAlternatives: [the, my, of],
  status: 'Three authentic-source alternatives; no unique continuation, no new LP2 plaintext',
}, null, 2));
