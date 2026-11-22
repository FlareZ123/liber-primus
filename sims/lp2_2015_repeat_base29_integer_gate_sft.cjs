'use strict';

/**
 * One frozen historical transport hypothesis on LP2 p0–p2.
 *
 * Starting from the dated 2015 successive-prime/difference operation,
 * collect the 40 exactly repeated D values (and source ciphertext values at
 * their sites). Interpret that fixed GP29 sequence as one BASE29 integer,
 * an operation explicitly demonstrated by the signed 2013 Cicada challenge.
 *
 * Independent alternative: interpret the 40 original event POSITIONS among
 * 729 original runes as a rank in the combinatorial number system (both
 * colexicographic and lexicographic conventions). No OCR, learned alphabet,
 * inferred key, or plaintext fitting is used.
 *
 * Classification: negative bounded transport trial. NOT a decryption.
 *
 * Run: node sims/lp2_2015_repeat_base29_integer_gate_sft.cjs
 * All source reads are immutable; no writes or network requests.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const C = corpus.pages.slice(0, 3).flatMap((page) => page.indices);
assert.equal(C.length, 729);
assert.equal(corpus.translit.length, 29);
const p = [];
for (let n = 2; p.length <= C.length; n++) {
  if (p.every((q) => q * q > n || n % q !== 0)) p.push(n);
}
const mod = (n) => ((n % 29) + 29) % 29;
const repeat = [];
let previousShifted = 27; // fictitious F (GP index zero) minus prime 2
let previousD = -1;
for (let i = 0; i < C.length; i++) {
  const shifted = mod(C[i] - p[i + 1]);
  const d = mod(shifted - previousShifted);
  if (i > 0 && d === previousD) {
    repeat.push({ pos: i, d, c: C[i] });
  }
  previousShifted = shifted;
  previousD = d;
}
assert.equal(repeat.length, 40);
assert.deepEqual(repeat.slice(0, 5).map((r) => r.pos),
  [9, 49, 57, 65, 67]);
assert.deepEqual(repeat.slice(-3).map((r) => r.pos),
  [710, 711, 724]);

/** @param {number[]} digits Base29 GP rune indices, high place first. */
function base29Integer(digits) {
  return digits.reduce((value, digit) => {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    return 29n * value + BigInt(digit);
  }, 0n);
}

/** @param {bigint} value Nonnegative integer. */
function toBytes(value) {
  assert.ok(value >= 0n);
  const s = value.toString(16);
  return Buffer.from(s.padStart(Math.ceil(s.length / 2) * 2, '0'), 'hex');
}

/** @param {bigint} value @param {number} width */
function toBase29(value, width) {
  const digits = new Array(width).fill(0);
  let n = value;
  for (let i = width - 1; i >= 0; i--) {
    digits[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return digits;
}

/** @param {number} n @param {number} k */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  const smaller = Math.min(k, n - k);
  let result = 1n;
  for (let j = 1; j <= smaller; j++) {
    result = result * BigInt(n - smaller + j) / BigInt(j);
  }
  return result;
}

/** @param {number[]} positions Increasing subset of {0,...,N-1}. */
function rankColex(positions) {
  return positions.reduce((rank, pos, j) =>
    rank + choose(pos, j + 1), 0n);
}

/** @param {number[]} positions @param {number} N */
function rankLex(positions, N) {
  let rank = 0n;
  let prior = -1;
  for (let j = 0; j < positions.length; j++) {
    for (let i = prior + 1; i < positions[j]; i++) {
      rank += choose(N - i - 1, positions.length - j - 1);
    }
    prior = positions[j];
  }
  return rank;
}

/** @param {Buffer} bytes */
function summary(bytes) {
  const readable = [...bytes].filter((c) => c >= 32 && c <= 126).length;
  const ascii = [...bytes].map((c) =>
    c >= 32 && c <= 126 ? String.fromCharCode(c) : '.').join('');
  const magic = (
    bytes.subarray(0, 4).equals(Buffer.from('%PDF')) ? 'PDF' :
    bytes.subarray(0, 4).equals(Buffer.from('89504e47', 'hex')) ? 'PNG' :
    bytes.subarray(0, 2).equals(Buffer.from('1f8b', 'hex')) ? 'gzip' :
    bytes.subarray(0, 2).equals(Buffer.from('504b', 'hex')) ? 'ZIP' :
    bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex')) ? 'JPEG' :
    'none'
  );
  return {
    bytes: bytes.length,
    hex: bytes.toString('hex'),
    printable: readable,
    ascii,
    magic
  };
}

const positions = repeat.map((r) => r.pos);
const output = {
  originalC: summary(toBytes(base29Integer(repeat.map((r) => r.c)))),
  repeatedD: summary(toBytes(base29Integer(repeat.map((r) => r.d)))),
  colexRank: summary(toBytes(rankColex(positions))),
  lexRank: summary(toBytes(rankLex(positions, 729)))
};
assert.equal(output.repeatedD.hex,
  '01a80e13d25f18b5e617e91c893c824deb362f8745118fcc9a');
assert.equal(output.originalC.hex,
  '049f5302e750c916e63332aa7a145df445bdb2b2cb7efcb0b7');
assert.equal(output.colexRank.hex,
  '09cec7fc6e54fdda07907b7b0de08ff5f466f410a7f4014dbd9c1fb4');
assert.equal(output.lexRank.hex,
  '056e94b062c1a38daa24180377f07c6b23b7628190dcb79bd4cbe2b3');
assert.equal(rankColex(Array.from({length: 40}, (_, i) => i)), 0n);
assert.equal(rankLex(Array.from({length: 40}, (_, i) => i), 729), 0n);
assert.equal(rankColex([...Array.from({length: 39}, (_, i) => i), 40]), 1n);
assert.equal(rankLex([...Array.from({length: 39}, (_, i) => i), 40], 729), 1n);
assert.ok(rankColex(positions) < choose(729, 40));
assert.ok(rankLex(positions, 729) < choose(729, 40));
// Independent source-native BASE29 conversion positive: the 2013 signed
// challenge encodes 3301 as the GP-index values for 3 Q O = [3,26,24].
assert.equal(base29Integer([3, 26, 24]), 3301n);
const control = Buffer.from('LP2_KEY_CONTROL', 'ascii');
assert.deepEqual(toBytes(base29Integer(toBase29(
  BigInt('0x' + control.toString('hex')), 40
))), control);
assert.deepEqual(
  toBase29(base29Integer(repeat.map((r) => r.d)), 40),
  repeat.map((r) => r.d)
);
for (const [key, item] of Object.entries(output)) {
  assert.equal(item.magic, 'none', key);
}
console.log(JSON.stringify({positions, ...output}, null, 2));
console.log('DECISION: none of these four fully frozen direct');
console.log('original-source integer transports yields plaintext or file magic.');
