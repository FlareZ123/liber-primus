'use strict';

// Original-input, page-IV ciphertext-feedback DH orbit test for LP2 pp36–38.
// One CJS SFT: node sims/lp2_cuneiform_dh550_pageiv_feedback_sft.cjs
// No external packages and no source-file writes.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const gp = 29;
const mod = (x, n = gp) => ((x % n) + n) % n;

/**
 * Euler totient, including the conventional phi(1)=1.
 * @param {number} n Positive integer
 * @returns {number}
 */
function phi(n) {
  let answer = n;
  let residue = n;
  for (let factor = 2; factor * factor <= residue; factor++) {
    if (residue % factor !== 0) continue;
    answer -= answer / factor;
    while (residue % factor === 0) residue /= factor;
  }
  if (residue > 1) answer -= answer / residue;
  return answer;
}

/**
 * GP29 index of coincidence.
 * @param {number[]} tape Complete rune tape
 * @returns {number}
 */
function ioc(tape) {
  const count = Array(gp).fill(0);
  for (const rune of tape) count[rune]++;
  const totalPairs = count.reduce((sum, k) => sum + k * (k - 1), 0);
  return totalPairs / (tape.length * (tape.length - 1));
}

/**
 * Consume the three physical page fragments of the original numbered sequence.
 * @returns {number[][]}
 */
function originalFragments() {
  return [
    corpus.pages[36].indices.slice(99),
    corpus.pages[37].indices.slice(),
    corpus.pages[38].indices.slice(0, 186)
  ];
}

const fragments = originalFragments();
assert.deepEqual(fragments.map((p) => p.length), [139, 228, 186]);
assert.deepEqual(fragments.map((p) => p[0]), [20, 9, 1]);
assert.equal(fragments.reduce((n, p) => n + p.length, 0), 553);

const orbit = [1];
for (let i = 1; i <= 550; i++) {
  orbit.push((orbit[i - 1] * 1033) % 3301);
}
assert.equal(orbit[550], 1);
assert.equal(new Set(orbit.slice(0, 550)).size, 550);

const delta = fragments.flatMap((page) =>
  page.slice(1).map((rune, i) => mod(rune - page[i]))
);
assert.equal(delta.length, 550);

/**
 * The generator orbit supplies a GP29 shift. No F bypass is presumed.
 * @param {number} orbitElement Positive integer in 1..3300
 * @param {'raw'|'phi'} map Source-motivated shift register
 * @returns {number}
 */
function key(orbitElement, map) {
  return (map === 'raw' ? orbitElement : phi(orbitElement)) % gp;
}

/**
 * Invert one entire page-IV feedback register.
 * @param {'raw'|'phi'} map Shift map
 * @param {-1|1} sign Decrypt P=(C-Cprev)+sign*key
 * @param {number|'iv'} phase Exponent phase (0..549) or per-page IV-index start
 * @param {number[][]} input Exact source fragments
 * @returns {number[]}
 */
function decode(map, sign, phase, input) {
  let clock = 0;
  return input.flatMap((page) => page.slice(1).map((rune, localIndex) => {
    const start = phase === 'iv' ? page[0] + localIndex : clock++ + phase;
    const shift = key(orbit[start % 550], map);
    return mod(rune - page[localIndex] + sign * shift);
  }));
}

/**
 * Encode a known clear GP29 sequence to test exact inverse replay.
 * @param {number[]} native Clear 550-symbol tape
 * @param {'raw'|'phi'} map Shift map
 * @param {-1|1} sign Decryption sign
 * @param {0|1|'iv'} phase Clock start
 * @returns {number[][]}
 */
function plant(native, map, sign, phase) {
  let pos = 0;
  let clock = 0;
  return fragments.map((page) => {
    const out = [page[0]];
    for (let local = 0; local < page.length - 1; local++) {
      const start = phase === 'iv' ? page[0] + local : clock++ + phase;
      const shift = key(orbit[start % 550], map);
      out.push(mod(out[local] + native[pos++] - sign * shift));
    }
    return out;
  });
}

const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
const native = Array.from({ length: 550 }, (_, i) => solved[i % solved.length]);
const records = [];
for (const phase of [0, 1, 'iv']) {
  for (const map of ['raw', 'phi']) {
    for (const sign of [-1, 1]) {
      const output = decode(map, sign, phase, fragments);
      const planted = plant(native, map, sign, phase);
      assert.deepEqual(decode(map, sign, phase, planted), native);
      assert.deepEqual(planted.map((p) => p[0]), [20, 9, 1]);
      records.push({
        phase, map, sign, ioc: ioc(output),
        first35: output.slice(0, 35).map((x) => corpus.translit[x]).join(' ')
      });
    }
  }
}
const global = records.filter((x) => x.phase !== 'iv');
const pageSeeded = records.filter((x) => x.phase === 'iv');
const bestGlobal = [...global].sort((a, b) => b.ioc - a.ioc)[0];
const bestPageSeeded = [...pageSeeded].sort((a, b) => b.ioc - a.ioc)[0];
assert.equal(bestGlobal.map, 'phi');
assert.equal(bestGlobal.sign, 1);
assert.equal(bestGlobal.phase, 1);
assert.ok(Math.abs(bestGlobal.ioc - 0.03495943036926644) < 1e-12);
assert.equal(bestPageSeeded.map, 'raw');
assert.equal(bestPageSeeded.sign, 1);
assert.ok(Math.abs(bestPageSeeded.ioc - 0.035032290114257326) < 1e-12);


// The 2013 DH protocol uses a participant-secret exponent. Exhaust all
// 550 possible initial phases without fitting any plaintext or word model.
// The cipher equation and the original three page IV locations remain fixed.
const allPhaseBest = [];
for (const map of ['raw', 'phi']) {
  for (const sign of [-1, 1]) {
    let best = { phase: -1, ioc: -1 };
    for (let phase = 0; phase < 550; phase++) {
      const score = ioc(decode(map, sign, phase, fragments));
      if (score > best.ioc) best = { phase, ioc: score };
    }
    allPhaseBest.push({ map, sign, ...best });
  }
}
const expected = [
  { map: 'raw', sign: -1, phase: 108, ioc: 0.03656896837224706 },
  { map: 'raw', sign: 1, phase: 383, ioc: 0.03656896837224706 },
  { map: 'phi', sign: -1, phase: 468, ioc: 0.03671468786222885 },
  { map: 'phi', sign: 1, phase: 430, ioc: 0.03709223381354529 }
];
for (let i = 0; i < expected.length; i++) {
  assert.equal(allPhaseBest[i].map, expected[i].map);
  assert.equal(allPhaseBest[i].sign, expected[i].sign);
  assert.equal(allPhaseBest[i].phase, expected[i].phase);
  assert.ok(Math.abs(allPhaseBest[i].ioc - expected[i].ioc) < 1e-12);
  assert.ok(allPhaseBest[i].ioc < 0.042);
}

console.log(JSON.stringify({
  status: 'PASS: authentic source 553 = 3 page IVs + full DH orbit of 550',
  source: 'LP2 p36[99..238), p37[0..228), p38[0..186)',
  pageFragmentLengths: fragments.map((p) => p.length),
  initialGPIndices: fragments.map((p) => p[0]),
  orbitBase: 1033,
  primeModulus: 3301,
  orbitPeriod: 550,
  nativeReferenceIoC: ioc(native),
  directDifferenceIoC: ioc(delta),
  positivePlant: '12/12 configurations recover all 550 solved-p57-based GP29 runes exactly',
  configurations: records,
  allSecretPhaseTests: 2200,
  allSecretPhaseBest: allPhaseBest,
  decision: 'All outputs remain nonprose; source does not authenticate DH feedback or three IV skips'
}, null, 2));
