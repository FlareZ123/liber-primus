'use strict';

/**
 * Exact original-grid AES payload test using the Cicada 2014 OpenPuff password.
 *
 * Frozen source operands: the 256 printed base60-decoded bytes and password
 * 33011033 from the 2014 Interconnectedness OpenPuff step. SHA256 and legacy
 * OpenSSL EVP_BytesToKey(MD5, one iteration, no salt) are two explicit,
 * unselected historical KDF hypotheses. AES-256 modes are fixed ECB, CBC,
 * CTR; CBC uses IV=0 with SHA256 and its derived IV with EVP.
 *
 * Run on Windows 11 with Node 22: node sims/lp2_p50_openpuff_password_payload_sft.cjs
 * No dependencies beyond Node standard libraries.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const grid = require('../resources/liber-primus/base60-grid.json');
const input = Buffer.from(grid.byte_rows.flat());
const sourcePassword = Buffer.from('33011033', 'ascii');
const expectedSha = '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290';
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));
assert.equal(input.length, 256);
assert.equal(hash(input), expectedSha);

// Legacy un-salted OpenSSL password-to-key derivation, fixed MD5 and 1 iteration.
// This is an explicitly tested historical convention, not known OpenPuff KDF.
function evpBytesToKey(password, n = 48) {
  let out = Buffer.alloc(0);
  let previous = Buffer.alloc(0);
  while (out.length < n) {
    previous = crypto.createHash('md5').update(Buffer.concat([previous, password])).digest();
    out = Buffer.concat([out, previous]);
  }
  return out.subarray(0, n);
}

/** @param {Buffer} bytes @param {'ecb'|'cbc'|'ctr'} mode @param {Buffer} key @param {Buffer | null} iv */
function transform(bytes, mode, key, iv, decrypt) {
  const alg = 'aes-256-' + mode;
  const ctx = decrypt ? crypto.createDecipheriv(alg, key, iv) : crypto.createCipheriv(alg, key, iv);
  if (mode !== 'ctr') ctx.setAutoPadding(false);
  return Buffer.concat([ctx.update(bytes), ctx.final()]);
}

/** @param {Buffer} bytes */
function metrics(bytes) {
  let printable = 0, best = 0, run = 0;
  for (const b of bytes) {
    if (b >= 32 && b <= 126 || b === 9 || b === 10 || b === 13) {
      printable++;
      run++;
      if (run > best) best = run;
    } else run = 0;
  }
  const last = bytes.at(-1);
  const pad = last >= 1 && last <= 16 && bytes.subarray(-last).every(b => b === last) ? last : 0;
  const knownMagic = [
    ['PDF', Buffer.from('%PDF-')],
    ['ZIP', Buffer.from('504b0304','hex')],
    ['GZIP', Buffer.from('1f8b','hex')],
    ['PNG', Buffer.from('89504e470d0a1a0a','hex')],
    ['BZIP2', Buffer.from('BZh')],
    ['XZ', Buffer.from('fd377a585a00','hex')],
    ['UTF8_BOM', Buffer.from('efbbbf','hex')],
    ['OPENPGP_ARMOR', Buffer.from('-----BEGIN PGP')],
  ].filter(([,head]) => bytes.subarray(0,head.length).equals(head)).map(([name])=>name);
  return {printable, longest_printable_run:best, valid_pkcs7_pad_bytes:pad, file_magic:knownMagic, first32_hex:bytes.subarray(0,32).toString('hex'), last16_hex:bytes.subarray(-16).toString('hex')};
}

const directSha256 = crypto.createHash('sha256').update(sourcePassword).digest();
const legacy = evpBytesToKey(sourcePassword);
const candidates = [
  {name:'sha256-ecb',mode:'ecb',key:directSha256,iv:null},
  {name:'sha256-cbc-zeroiv',mode:'cbc',key:directSha256,iv:Buffer.alloc(16)},
  {name:'sha256-ctr-zeroiv',mode:'ctr',key:directSha256,iv:Buffer.alloc(16)},
  {name:'evp-md5-ecb',mode:'ecb',key:legacy.subarray(0,32),iv:null},
  {name:'evp-md5-cbc-derivediv',mode:'cbc',key:legacy.subarray(0,32),iv:legacy.subarray(32,48)},
  {name:'evp-md5-ctr-derivediv',mode:'ctr',key:legacy.subarray(0,32),iv:legacy.subarray(32,48)},
];
const positive = Buffer.from('SOME WISDOM AND SOME WORDS ABOUT THE TABLE. '.repeat(6).slice(0,256),'ascii');
assert.equal(positive.length, 256);

const results = [];
for (const candidate of candidates) {
  const clear = transform(input,candidate.mode,candidate.key,candidate.iv,true);
  assert.deepEqual(transform(clear,candidate.mode,candidate.key,candidate.iv,false),input);
  const plantedCipher = transform(positive,candidate.mode,candidate.key,candidate.iv,false);
  assert.deepEqual(transform(plantedCipher,candidate.mode,candidate.key,candidate.iv,true),positive);
  results.push({candidate:candidate.name, ...metrics(clear)});
}
console.log(JSON.stringify({source:'p49-51 source-printed conventional base60 row-major bytes',table_sha256:expectedSha,password:'33011033',assumptions:'AES-256 with fixed historical-compatible un-salted KDF and no extra nonce; no original author instruction selects these parameters',candidates:results},null,2));
assert.ok(results.every(x => x.longest_printable_run < 24 && x.file_magic.length === 0 && x.valid_pkcs7_pad_bytes === 0), 'A candidate merits independent plaintext/padding followup');
