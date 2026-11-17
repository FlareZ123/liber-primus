'use strict';

/**
 * Exact original-source test: can the p39 × signed-2013 H×G GF(29)
 * quotient of the 256-cell table directly key the flanking LP2 sentences?
 *
 * Read-only SFT: node sims/lp2_p50_hg_q252_flanking_direct_sft.cjs
 * Windows-compatible CommonJS / Node 22; no external dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(base, 'lp2-grid-256.json'), 'utf8'));

/** @param {number} x @returns {number} */
const mod = (x) => ((x % 29) + 29) % 29;
/** @param {number[]} tape @returns {number} */
function ioc(tape) {
  const counts = Array(29).fill(0);
  for (const v of tape) counts[v]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (tape.length * (tape.length - 1));
}
/** @param {number} page @returns {number[]} */
function pageIndices(page) {
  const p = corpus.pages.find((p) => p.page === page);
  assert.ok(p, 'Missing source page ' + page);
  return p.indices;
}
/** @param {number[]} tape @returns {string} */
function translit(tape) {
  return tape.map((n) => corpus.translit[n]).join('');
}
/** @param {number[]} tape @param {number} start @param {-1|1} sign @param {number[]} key @returns {number[]} */
function decode(tape, start, sign, key) {
  return tape.map((v, i) => mod(v + sign * key[(start + i) % key.length]));
}
/** @param {number[]} tape @param {number} start @param {-1|1} sign @param {number[]} key @returns {number[]} */
function encode(tape, start, sign, key) {
  return tape.map((v, i) => mod(v - sign * key[(start + i) % key.length]));
}

// The independently anchored signed-2013 H and p39 red-triad G multiply
// to [12,17,11,21,23] when coefficients are high-first.
// Leading coefficient 12^-1 = 17 modulo 29.
const factor = [12, 17, 11, 21, 23];
const remainder = grid.bytes.map(mod);
const quotient = [];
assert.equal(remainder.length, 256);
for (let i = 0; i < 252; i++) {
  const v = mod(remainder[i] * 17);
  quotient.push(v);
  for (let j = 0; j < factor.length; j++) {
    remainder[i + j] = mod(remainder[i + j] - v * factor[j]);
  }
}
assert.deepEqual(remainder.slice(-4), [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 20), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17, 17, 8, 15, 21, 7, 21, 18, 7]);

// Read the complete authentic sentences, preserving page-carry words.
// The p49 span is exactly 66 rune symbols; p51 has exactly 92.
const p48 = pageIndices(48);
const p49 = pageIndices(49);
const p51 = pageIndices(51);
const p52 = pageIndices(52);
assert.equal(p48.length, 271);
assert.equal(p49.length, 66);
assert.equal(p51.length, 92);
const pre = p48.slice(-72).concat(p49);
const post = p51.concat(p52.slice(0, 78));
assert.equal(pre.length, 138);
assert.equal(post.length, 170);
assert.equal(pageIndices(57).length, 95);
const nativePlant = Array.from({ length: pre.length + post.length }, (_, i) => pageIndices(57)[i % 95]);

console.log('Source: 256 table cells, 252 H×G quotient coefficients, zero four-symbol remainder');
console.log('Original pre-table: 138 runes, post-table: 170 runes; native p57 positive 95 runes');
console.log('Original GP29 IoCs:', ioc(pre).toFixed(12), ioc(post).toFixed(12));
const outputs = [];
for (const sign of [-1, 1]) {
  for (const clock of ['reset', 'continuous']) {
    const postStart = clock === 'reset' ? 0 : pre.length;
    const pp = decode(pre, 0, sign, quotient);
    const po = decode(post, postStart, sign, quotient);
    assert.deepEqual(encode(pp, 0, sign, quotient), pre);
    assert.deepEqual(encode(po, postStart, sign, quotient), post);
    const plantPre = nativePlant.slice(0, pre.length);
    const plantPost = nativePlant.slice(pre.length);
    const cipherPre = encode(plantPre, 0, sign, quotient);
    const cipherPost = encode(plantPost, postStart, sign, quotient);
    assert.deepEqual(decode(cipherPre, 0, sign, quotient), plantPre);
    assert.deepEqual(decode(cipherPost, postStart, sign, quotient), plantPost);
    const row = { sign, clock, preIoc: ioc(pp), postIoc: ioc(po), jointIoc: ioc(pp.concat(po)) };
    outputs.push(row);
    console.log(JSON.stringify(row));
    console.log('  Original pretable candidate:', translit(pp.slice(0, 45)));
    console.log('  Original posttable candidate:', translit(po.slice(0, 45)));
  }
}

const expected = [
  [0.03543848513699355, 0.033693003828750435, 0.035111468336224035],
  [0.03543848513699355, 0.03320570831883049, 0.03492110495367824],
  [0.034380619909023594, 0.03689523146536721, 0.03513261982317357],
  [0.034380619909023594, 0.03355377654020188, 0.03439231777993993],
];
outputs.forEach((row, i) => {
  assert.ok(Math.abs(row.preIoc - expected[i][0]) < 1e-12);
  assert.ok(Math.abs(row.postIoc - expected[i][1]) < 1e-12);
  assert.ok(Math.abs(row.jointIoc - expected[i][2]) < 1e-12);
});

// The signed 2013 BASE29 demonstration motivates one further literal
// representation check: 252 quotient digits as a single big-endian base29 integer.
// This is a format gate, never a free-offset/container-search.
let number = 0n;
for (const v of quotient) number = number * 29n + BigInt(v);
let hex = number.toString(16);
if (hex.length % 2) hex = '0' + hex;
const bytes = Buffer.from(hex, 'hex');
assert.equal(bytes.length, 153);
assert.equal(bytes.subarray(0, 24).toString('hex'), '04598e588f3e70d4100f40d7489f9855a468a0d950156d2a');
console.log('BASE29 quotient as one big-endian integer: bytes=' + bytes.length
  + ' opening24=' + bytes.subarray(0, 24).toString('hex'));
console.log('PASS: 4 authentic full-original input modes, 4 exact forward inverses,'
  + ' 4 native p57 planted recoveries, source polynomial and byte-format checks');


// Independent original-cipher receiver: the *actual solved-p56* F-transparent
// condition, rather than a rigid-key approximation. A native plaintext F is
// printed as F (GP index 0) and consumes no key. Every non-F must consume one
// key symbol; its ciphertext could itself be GP F. The inverse therefore
// branches at printed F but refuses a non-F cipher whose consumed plaintext
// would be GP F. This is an exact feasibility gate, independent of language.
 
/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {{ failAt: number, clocks: number[] }}
 */
function transparentPaths(cipher, key, sign) {
  let clocks = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const clock of clocks) {
      // Only ciphertext F can represent a literal unencrypted plaintext F.
      if (cipher[i] === 0) next.add(clock);
      const plain = mod(cipher[i] + sign * key[clock % key.length]);
      // A consuming branch cannot decode to the protected plaintext F.
      if (plain !== 0) next.add(clock + 1);
    }
    if (next.size === 0) return { failAt: i, clocks: [] };
    clocks = next;
  }
  return { failAt: -1, clocks: [...clocks].sort((a, b) => a - b) };
}

/**
 * @param {number[]} plain
 * @param {number[]} key
 * @param {-1|1} sign
 * @returns {number[]}
 */
function transparentEncode(plain, key, sign) {
  let clock = 0;
  return plain.map((p) => {
    if (p === 0) return 0;
    const c = mod(p - sign * key[clock % key.length]);
    clock += 1;
    return c;
  });
}

// Honest native solved-p57 positive, including the plaintext-F bypass.
const genuineNative = pageIndices(57);
assert.equal(genuineNative.length, 95);
for (const sign of [-1, 1]) {
  const encrypted = transparentEncode(genuineNative, quotient, sign);
  const possible = transparentPaths(encrypted, quotient, sign);
  assert.equal(possible.failAt, -1);
  assert.ok(possible.clocks.includes(genuineNative.filter((v) => v !== 0).length));
}

const protectedTargets = [
  ['pretable p48→p49', pre, [29, 24]],
  ['posttable p51→p52', post, [37, 30]],
  ['terminal p55', pageIndices(55), [61, 63]],
];
for (const [name, source, expected] of protectedTargets) {
  for (const sign of [-1, 1]) {
    const result = transparentPaths(source, quotient, sign);
    assert.equal(result.failAt, expected[sign === -1 ? 0 : 1], name + ' sign ' + sign);
    assert.deepEqual(result.clocks, [], name + ' must have no legal complete inverse');
    console.log('F-transparent source gate: ' + name + ' sign=' + sign
      + ' impossible first at original zero-based rune ' + result.failAt);
  }
}
console.log('PASS: all six original F-transparent Q252 inverses impossible;'
  + ' both genuine solved-p57 transparent-key plants have legal full paths');
