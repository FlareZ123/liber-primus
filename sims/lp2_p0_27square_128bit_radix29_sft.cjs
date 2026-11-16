'use strict';

/**
 * SFT: p0–2 source 27×27 direct radix29 format gate for 128-bit cipher blocks.
 * Whole-array numerical obstruction holds for every cipher key and IV.
 * Positive: AES-256-CTR blocks encode, decode and decrypt from 27 digits.
 * Execute from repository root with Node 22. No file writes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const original = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(original.length, 729);
assert.equal(grid.bytes.length, 256);
const LIMIT = 1n << 128n;

/** @param {number[]} digits @returns {bigint} */
function decode(digits) {
  return digits.reduce((n, d) => {
    assert(Number.isInteger(d) && d >= 0 && d < 29);
    return n * 29n + BigInt(d);
  }, 0n);
}

/** @param {bigint} n @returns {number[]} */
function encode(n) {
  assert(n >= 0n && n < LIMIT);
  const digits = new Array(27);
  for (let i = 26; i >= 0; i--) {
    digits[i] = Number(n % 29n);
    n /= 29n;
  }
  assert.equal(n, 0n);
  return digits;
}

/** @param {number[]} digits @returns {number[][]} */
function rows(digits) {
  assert.equal(digits.length, 729);
  return Array.from({length: 27}, (_, i) => digits.slice(27*i, 27*(i+1)));
}

/** @param {number[][]} square @returns {number[][]} */
function transpose(square) {
  return square.map((_, i) => square.map(row => row[i]));
}

/** @param {number[][]} square @returns {number[]} */
function valid(square) {
  return square.map((row, i) => decode(row) < LIMIT ? i : -1).filter(i => i !== -1);
}

const sourceRows = rows(original);
const rowValid = valid(sourceRows);
const colValid = valid(transpose(sourceRows));
const revValid = valid(rows([...original].reverse()));
const rowHeads = sourceRows.map(row => row[0]);
const colHeads = transpose(sourceRows).map(row => row[0]);
const reversedHeads = rows([...original].reverse()).map(row => row[0]);
const distinctCount = values => new Set(values).size;
const upperLeadingDigit = Number((LIMIT-1n) / (29n ** 26n));
assert.equal(upperLeadingDigit,3,'128-bit block permits only four base29 leading values');
const LIMIT_PLUS_TWO_FLAGS = 1n << 130n;
const twoFlagLeadingDigit = Number((LIMIT_PLUS_TWO_FLAGS-1n) / (29n ** 26n));
assert.equal(twoFlagLeadingDigit,12,'130-bit block permits thirteen base29 leading values');
assert.equal(distinctCount(rowHeads),18);
assert.equal(distinctCount(colHeads),18);
assert.equal(distinctCount(reversedHeads),17);
// Every single unknown 29! alphabet permutation preserves source leading
// symbol equality. >4 observed leading rune types exclude all such keys.
assert.ok(distinctCount(rowHeads)>upperLeadingDigit+1);
assert.ok(distinctCount(colHeads)>upperLeadingDigit+1);
assert.ok(distinctCount(reversedHeads)>upperLeadingDigit+1);

// All possible 27 symbol-clock phases are included, with a cyclic reading
// to preserve the exact source glyphs rather than guessing a start cursor.
/** @param {number[]} tape @returns {number[]} */
function phaseLeaderDiversity(tape) {
  return Array.from({length:27}, (_,phase)=>
    distinctCount(Array.from({length:27},(_,i)=>tape[(phase+27*i)%729])));
}
const transposeTape = transpose(sourceRows).flat();
const phaseCounts = phaseLeaderDiversity(original);
const phaseCountsTranspose = phaseLeaderDiversity(transposeTape);
const phaseCountsReverse = phaseLeaderDiversity([...original].reverse());
assert.deepEqual(phaseCounts,[18,17,17,18,18,14,19,17,18,18,17,20,17,16,15,19,16,18,20,19,16,16,17,20,19,20,17]);
assert.deepEqual(phaseCountsTranspose,[18,18,15,17,17,18,19,17,15,16,21,15,14,15,23,16,18,16,18,17,17,19,20,18,15,20,19]);
assert.equal(Math.min(...phaseCountsReverse),14);
assert.ok(Math.min(...phaseCounts)>twoFlagLeadingDigit+1);
assert.ok(Math.min(...phaseCountsTranspose)>twoFlagLeadingDigit+1);
assert.ok(Math.min(...phaseCountsReverse)>twoFlagLeadingDigit+1);
assert.deepEqual(rowValid, [7,10,13,18,24]);
assert.deepEqual(colValid, [7,13,17,22]);
assert.deepEqual(revValid, [10,18]);

// A planted 432-byte AES-256-CTR ciphertext MUST pass the same 27-digit gate.
const key = Buffer.from(grid.bytes.slice(0,32));
const iv = Buffer.alloc(16);
const clear = Buffer.alloc(432);
const phrase = Buffer.from('SOURCE-SHAPED-27-BLOCK-AES-256-CTR-TEST-');
for (let i = 0; i < clear.length; i++) clear[i] = phrase[i % phrase.length];
const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
const ciphertext = Buffer.concat([cipher.update(clear), cipher.final()]);
assert.equal(ciphertext.length, clear.length);
const packed = [];
for (let i = 0; i < 27; i++) {
  const hex = ciphertext.subarray(i*16, (i+1)*16).toString('hex');
  const n = BigInt('0x'+hex);
  const digits = encode(n);
  assert.equal(decode(digits), n);
  packed.push(...digits);
}
assert.equal(packed.length, 729);
assert.equal(valid(rows(packed)).length, 27);
assert.ok(distinctCount(rows(packed).map(row=>row[0]))<=4);
const pi = Array.from({length:29},(_,i)=>(i*11+7)%29);
assert.equal(new Set(pi).size,29);
const permuted = packed.map(digit => pi[digit]);
const inverse = Array.from({length:29},(_,i)=>pi.indexOf(i));
const unpermuted = permuted.map(digit => inverse[digit]);
assert.deepEqual(unpermuted,packed,'unknown-digit-permutation positive');
assert.ok(distinctCount(rows(permuted).map(row=>row[0]))<=4);
const restored = Buffer.concat(rows(packed).map(row =>
  Buffer.from(decode(row).toString(16).padStart(32,'0'), 'hex')));
assert.deepEqual(restored, ciphertext);
const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
const decrypted = Buffer.concat([decipher.update(restored), decipher.final()]);
assert.deepEqual(decrypted, clear);
console.log(JSON.stringify({
  source: 'LP2 original physical p0–p2 729 runes',
  row_valid: rowValid,
  full_secret_alphabet_first_rune_types: {row: distinctCount(rowHeads), column: distinctCount(colHeads), reverse: distinctCount(reversedHeads)},
  maximum_permitted_first_rune_types: upperLeadingDigit+1,
  maximum_permitted_first_rune_types_if_128bits_plus_2_flags: twoFlagLeadingDigit+1,
  minimal_first_rune_types_over_all_27_cyclic_phases: {row: Math.min(...phaseCounts), column: Math.min(...phaseCountsTranspose), reverse: Math.min(...phaseCountsReverse)},
  column_valid: colValid,
  reverse_valid: revValid,
  all_original_rows_represent_128bit_blocks: rowValid.length === 27,
  full_AES_256_CTR_positive: decrypted.equals(clear),
}, null, 2));
