'use strict';
/**
 * Original source: stem-gap floral binary left22, right31, 32x8 numeral table.
 * An opposite-facing floral pair suggests row reflection J(r)=(53-r) mod32.
 * The same two inputs supply difference9, yielding ordered pairs
 * L=22-9i, R=31+9i, i=0..15. Previous Cicada used explicit XOR;
 * here test only direct column-aligned XOR of paired original 8byte rows.
 *
 * This is a conditional historically executable operation, not a
 * Cicada-authored key assertion. No extra compression or cipher is inferred.
 * Windows Node22: node sims/lp2_floral_stem22_31_mirror_rowxor_original_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const bytes = JSON.parse(fs.readFileSync(
  path.join(root, 'lp2-grid-256.json'), 'utf8')).bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const pairs = Array.from({length:16},(_,i) => [
  ((22-9*i)%32+32)%32, (31+9*i)%32
]);
assert.equal(new Set(pairs.flat()).size,32);
assert.ok(pairs.every(([l,r])=>(l+r)%32===21));
assert.deepEqual(pairs[0],[22,31]);
assert.deepEqual(pairs[15],[15,6]);
const output = Buffer.from(pairs.flatMap(([left,right]) =>
  Array.from({length:8},(_,col) => bytes[8*left+col]^bytes[8*right+col])));
assert.equal(output.length,128);
const roundtrip = pairs.flatMap(([left,right],i) =>
  Array.from({length:8},(_,col) =>
    output[8*i+col]^bytes[8*right+col]));
assert.deepEqual(roundtrip,
  pairs.flatMap(([left])=>bytes.slice(8*left,8*left+8)));
const printable = [...output].filter(x=>x>=32&&x<=126).length;
assert.equal(printable,51);
assert.equal(output.subarray(0,32).toString('hex'),
  '9a1d0a49240c1a0100c0061ac9f1891f79f32c2ac37e259db77492067ca2c8c3');
const first = output.subarray(0,16);
const knownSignatures = [
  Buffer.from('25504446','hex'), // PDF
  Buffer.from('89504e470d0a1a0a','hex'), // PNG
  Buffer.from('504b0304','hex'), // ZIP
  Buffer.from('1f8b08','hex'), // gzip
  Buffer.from('7f454c46','hex'), // ELF
  Buffer.from('47494638','hex') // GIF
];
assert.ok(knownSignatures.every(sig=>!first.subarray(0,sig.length).equals(sig)));
const counts = Array(256).fill(0);
for(const value of output) counts[value]++;
const entropy = counts.reduce((s,n) =>
  n === 0 ? s : s-(n/128)*Math.log2(n/128),0);
assert.ok(Math.abs(entropy-6.625)<1e-10);
console.log(JSON.stringify({
  result:'PASS / direct 128-byte mirror XOR is not readable text or known file header',
  sourceTableRows:32,sourceTableBytes:256,pairedRows:16,
  xorOutputBytes:128,printableAsciiCount:printable,
  outputEntropyBitsPerByte:entropy,first32BytesHex:output.subarray(0,32).toString('hex'),
  outputSha256:crypto.createHash('sha256').update(output).digest('hex'),
  allRowsConsumedOnce:true,
  unchangedByteRoundtrip:true
}, null, 2));
