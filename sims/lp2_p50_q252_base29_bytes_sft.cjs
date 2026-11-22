'use strict';
/**
 * Exact source-selected BASE29 byte-transport gate for the original p49–51
 * numerical table quotient. Read-only SFT, Node.js 22.
 *
 * Run: node sims/lp2_p50_q252_base29_bytes_sft.cjs
 * Hypothesis tested: historical 2013 BASE29 integer serialization of the
 * 252-digit quotient from the already-established p50/(H*G) factors.
 * This does not claim a historical instruction to serialize the quotient.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/base60-grid.json'), 'utf8'));
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
/**
 * @param {number[]} a Ascending GF29 coefficients
 * @param {number[]} b Ascending GF29 coefficients
 * @returns {number[]}
 */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      out[i+j] = mod(out[i+j] + a[i] * b[j]);
  return out;
}
/**
 * @param {number[]} high Original high-to-low GF29 coefficients
 * @param {number[]} divisor Ascending GF29 coefficients
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(high, divisor) {
  const work = high.slice().reverse();
  const quotient = Array(work.length - divisor.length + 1).fill(0);
  const inverse = Array.from({length:28}, (_,i)=>i+1)
    .find(x=>mod(divisor.at(-1)*x)===1);
  assert.notEqual(inverse, undefined);
  for (let i = work.length-1; i >= divisor.length-1; i--) {
    const at = i - divisor.length + 1;
    const amount = mod(work[i]*inverse);
    quotient[at] = amount;
    for (let j = 0; j < divisor.length; j++)
      work[at+j] = mod(work[at+j]-amount*divisor[j]);
  }
  return {quotient:quotient.reverse(), remainder:work.slice(0,divisor.length-1)};
}
/**
 * Historical 2013 BASE29 as an unsigned big-endian integer, serialized
 * to its shortest big-endian byte representation (no invented padding).
 * @param {number[]} digits GP29/base29 digit values in high-to-low order
 * @returns {Buffer}
 */
function base29Bytes(digits) {
  let n = 0n;
  for (const digit of digits) {
    assert.ok(Number.isInteger(digit) && digit >= 0 && digit < 29);
    n = n*29n + BigInt(digit);
  }
  if (n===0n) return Buffer.from([0]);
  const bytes = [];
  while (n > 0n) {
    bytes.unshift(Number(n & 255n));
    n >>= 8n;
  }
  return Buffer.from(bytes);
}
/** @param {Buffer} bytes @returns {object} */
function summarize(bytes) {
  const printable = [...bytes].filter(x=>x>=32 && x<127).length;
  let utf8 = true;
  try {new TextDecoder('utf-8', {fatal:true}).decode(bytes);}
  catch {utf8 = false;}
  const magics = {
    PNG:'89504e470d0a1a0a',
    JPEG:'ffd8ff',
    GIF87:'474946383761',
    GIF89:'474946383961',
    PDF:'255044462d',
    ZIP:'504b0304',
    GZIP:'1f8b08',
    BZIP2:'425a68',
    ZSTD:'28b52ffd',
    XZ:'fd377a585a00',
    ELF:'7f454c46',
    RIFF:'52494646'
  };
  const prefix = bytes.subarray(0,8).toString('hex');
  return {
    bytes: bytes.length, printable, validUtf8:utf8,
    first32Hex:bytes.subarray(0,32).toString('hex'),
    recognizedPrefix:Object.entries(magics)
      .filter(([,signature])=>prefix.startsWith(signature)).map(([name])=>name)
  };
}
assert.equal(3*29*29+26*29+24,3301,
  'Original 2013 BASE29 3QO control');
assert.deepEqual([...base29Bytes([3,26,24])],[0x0c,0xe5]);
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row=>row.length===8));
const original = grid.byte_rows.flat();
assert.equal(original.length,256);
const H=[3,26,24], G=[27,5,15];
const divisor=multiply(H,G);
assert.deepEqual(divisor,[23,21,11,17,12]);
const {quotient:Q, remainder}=divide(original.map(x=>mod(x)),divisor);
assert.deepEqual(remainder,[0,0,0,0]);
assert.equal(Q.length,252);
assert.deepEqual(Q.slice(0,16),
  [0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21]);
const nine=Array.from({length:9}, (_,i)=>base29Bytes(Q.slice(i*28,i*28+28)));
assert.deepEqual(nine.map(b=>b.length),Array(9).fill(17));
const single=base29Bytes(Q);
const reverse=base29Bytes(Q.slice().reverse());
const nineFields=Buffer.concat(nine);
assert.equal(single.length,153);
assert.equal(nineFields.length,153);
const evidence = {
  original: '256 source bytes, 32 by 8, physical LP2 pages 49–51',
  field:'GF29', sourceFactors:{H,G,product:divisor},
  divisionRemainder:remainder, quotientDigits:Q.length,
  serialized:{
    wholeHighToLow:summarize(single),
    wholeDigitReverse:summarize(reverse),
    nineSourceChaptersOf28Digits:summarize(nineFields)
  },
  sourceSelectedPart:'BASE29 positional integer conversion is known in 2013',
  unselectedPart:'applying it to the quotient, digit order and byte framing',
  decision:'No direct UTF8 text or common file prefix. This tests only unsigned byte framing; no plaintext/key recovered.'
};
console.log(JSON.stringify(evidence,null,2));
