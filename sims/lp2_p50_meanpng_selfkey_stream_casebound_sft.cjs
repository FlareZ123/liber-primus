'use strict';

/** Source-fixed p50 Bitcoin-key self-decryption with complete I/l case-ambiguity ASCII bound. */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { createHash, createECDH, createCipheriv, createDecipheriv } = require('node:crypto');

const grid = JSON.parse(readFileSync(path.resolve(__dirname, '../resources/liber-primus/base60-grid.json'), 'utf8'));
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
const flat = grid.rows.flat();
const b60 = (cell) => 60 * grid.alphabet.indexOf(cell[0]) + grid.alphabet.indexOf(cell[1]);
const table = Buffer.from(flat.map(b60));
const key = Buffer.from(grid.rows.map((row) => b60(row[4])));
const sha256 = (a) => createHash('sha256').update(a).digest();
assert.equal(sha256(table).toString('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
assert.equal(key.length, 32);

/** Standard Bitcoin compressed key address; its source case invariance is independently checked below. */
function address(secret) {
  const e = createECDH('secp256k1');
  e.setPrivateKey(secret);
  const pub = e.getPublicKey(null, 'compressed');
  const hash160 = createHash('ripemd160').update(sha256(pub)).digest();
  const payload = Buffer.concat([Buffer.from([0]), hash160]);
  const bytes = Buffer.concat([payload, sha256(sha256(payload)).subarray(0, 4)]);
  const abc = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = BigInt('0x' + bytes.toString('hex')), s = '';
  while (n !== 0n) {
    s = abc[Number(n % 58n)] + s;
    n /= 58n;
  }
  for (const x of bytes) {
    if (x !== 0) break;
    s = '1' + s;
  }
  return s;
}
assert.equal(address(key), '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK');

const uncertain = flat.flatMap((cell, i) => cell[1] === 'I' || cell[1] === 'l' ? [i] : []);
assert.deepEqual(uncertain, [2, 25, 45, 50, 90, 165, 175, 182, 199, 246]);
assert.ok(uncertain.every((i) => i % 8 !== 4)); // The Bitcoin key itself has no I/l ambiguity.
for (const i of uncertain) {
  const cell = flat[i], flip = cell[0] + (cell[1] === 'I' ? 'l' : 'I');
  assert.equal(Math.abs(b60(cell) - b60(flip)), 29);
}
const layouts = [
  { name: 'seven columns, row-major', bytes: Buffer.from(flat.filter((_, i) => i % 8 !== 4).map(b60)), sourceIndices: flat.map((_, i) => i).filter((i) => i % 8 !== 4) },
  { name: 'seven columns, column-major', bytes: Buffer.from(Array.from({ length: 8 }, (_, col) => col).filter((col) => col !== 4).flatMap((col) => grid.rows.map((row) => b60(row[col])))), sourceIndices: Array.from({ length: 8 }, (_, col) => col).filter((col) => col !== 4).flatMap((col) => grid.rows.map((_, r) => r * 8 + col)) },
  { name: 'whole original panel, row-major', bytes: table, sourceIndices: flat.map((_, i) => i) }
];
const ciphers = [
  { name: 'AES-256-CTR', algorithm: 'aes-256-ctr' },
  { name: 'ChaCha20', algorithm: 'chacha20' }
];
const expected = {
  'seven columns, row-major|AES-256-CTR': ['7bb59f80f346d55c0115ce5492e253c501466339b2fd60d1', 89],
  'seven columns, column-major|AES-256-CTR': ['7b0e41576d689ffe822d9e83fb4c6325c76d97e50c604dfc', 87],
  'whole original panel, row-major|AES-256-CTR': ['7bb59f807fd51cb7a4708c8ed2329ddb77ade52383199d2b', 81],
  'seven columns, row-major|ChaCha20': ['680ba8f37492108d5134fa2da003d0772072392c12e5407c', 84],
  'seven columns, column-major|ChaCha20': ['68b07624eabc5a2fd20caafac9ade097e659cdf0ac786d51', 86],
  'whole original panel, row-major|ChaCha20': ['680ba8f3f801d966f451b8f7e0d31e695699bf362301bd86', 83]
};

for (const layout of layouts) {
  assert.equal(layout.bytes.length, layout.name.startsWith('seven') ? 224 : 256);
  assert.equal(layout.sourceIndices.length, layout.bytes.length);
  const ambiguousOutputPositions = layout.sourceIndices.flatMap((j, i) => uncertain.includes(j) ? [i] : []);
  assert.equal(ambiguousOutputPositions.length, 10);
  assert.ok(!ambiguousOutputPositions.includes(0) && !ambiguousOutputPositions.includes(1));
  for (const cipher of ciphers) {
    const id = layout.name + '|' + cipher.name;
    const iv = Buffer.alloc(16);
    const result = createDecipheriv(cipher.algorithm, key, iv).update(layout.bytes);
    const [first24, printables] = expected[id];
    assert.equal(result.subarray(0, 24).toString('hex'), first24);
    const printable = Array.from(result).filter((n) => n >= 32 && n < 127).length;
    assert.equal(printable, printables);

    // Stream XOR locality proves the bound over all 2^10 plausible case assignments.
    const maximalPrintable = printable + ambiguousOutputPositions.length;
    assert.ok(maximalPrintable <= 99);
    assert.ok(result[0] !== 0x50 && result[0] !== 0x1f && result[0] !== 0x42); // no ZIP, gzip, bzip2 first byte
    const knownNative = Buffer.from('IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE.');
    const encrypted = createCipheriv(cipher.algorithm, key, iv).update(knownNative);
    const decrypted = createDecipheriv(cipher.algorithm, key, iv).update(encrypted);
    assert.deepEqual(decrypted, knownNative);
    console.log(JSON.stringify({
      layout: layout.name, cipher: cipher.name,
      bytes: result.length, first24: result.subarray(0, 24).toString('hex'),
      printable, maximumPrintableAcross1024CaseAssignments: maximalPrintable,
      firstTwoUnambiguous: result.subarray(0, 2).toString('hex'),
      nativeCicadaAsciiPlant: 'PASS', sourceKey: address(key)
    }));
  }
}
console.log('PASS six original self-key output gates, all 2^10 I/l-case ASCII upper bounds, native controls');
