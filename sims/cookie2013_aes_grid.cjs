'use strict';

/**
 * A bounded source-supplied AES-256 decryption of the original LP2 256-byte
 * page-49/50/51 grid, using two archived 2013 onion HTTP-cookie values.
 * Demonstrates precise source/key recognition criteria with an independently
 * planted ASCII/GPG-header ciphertext.
 *
 * A historical archive reports those cookie values but their origin is not
 * authenticated by a signed Cicada artifact. This is a hypothesis test, not
 * an assertion of the intended key.
 *
 * Run: node sims/cookie2013_aes_grid.cjs
 * @module cookie2013_aes_grid
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const GRID = JSON.parse(fs.readFileSync(path.join(__dirname, '..',
  'resources/liber-primus/base60-grid.json'), 'utf8'));
const COOKIE167 = '6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6';
const COOKIE761 = '7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5';

const rawKeys = {
  cookie167:Buffer.from(COOKIE167,'hex'),
  cookie761:Buffer.from(COOKIE761,'hex'),
  cookieXOR:Buffer.from(COOKIE167,'hex').map((v,i) =>
    v ^ Buffer.from(COOKIE761,'hex')[i])
};
const N = 32, W = 8;
const matrix = GRID.byte_rows;
assert.equal(matrix.length, N);
assert.ok(matrix.every(row => row.length === W &&
  row.every(v => Number.isInteger(v) && v >= 0 && v < 256)));

const traversals = {
  rows:matrix.flat(),
  reverse:matrix.flat().reverse(),
  columns:Array.from({length:W*N}, (_,k) => matrix[k%N][Math.floor(k/N)]),
  rowSnake:matrix.flatMap((row,r) => r%2 ? row.slice().reverse() : row),
  colSnake:Array.from({length:W*N}, (_,k) => {
    const c = Math.floor(k/N),r=k%N;
    return matrix[c%2 ? N-1-r:r][c];
  })
};
const zero = Buffer.alloc(16);
const modes = ['ecb','cbc','cfb','ofb','ctr'];
const prefix = Buffer.from('-----BEGIN PGP SIGNED MESSAGE-----\n', 'ascii');

/** @param {Buffer} key @param {Buffer} data @param {string} mode @param {Buffer|null} iv */
function decrypt(key,data,mode,iv) {
  const state = crypto.createDecipheriv('aes-256-' + mode, key, iv);
  state.setAutoPadding(false);
  return Buffer.concat([state.update(data),state.final()]);
}

/** @param {Buffer} bytes */
function printability(bytes) {
  let ascii = 0, letters = 0;
  for (const value of bytes) {
    ascii += +(value === 9 || value === 10 || value === 13 ||
      (value >= 32 && value <= 126));
    letters += +((value >= 65 && value <= 90) ||
      (value >= 97 && value <= 122));
  }
  return {ascii,letters};
}
/** @param {Buffer} bytes */
function pkcs7(bytes) {
  const pad = bytes[bytes.length-1];
  if (pad<1 || pad>16) return false;
  for(let i=0;i<pad;i++) if(bytes[bytes.length-1-i]!==pad) return false;
  return true;
}

/** @param {Buffer} data */
function scan(data) {
  const rows = [];
  for (const [keyName,key] of Object.entries(rawKeys)) {
    assert.equal(key.length,32);
    for (const [order,values] of Object.entries(traversals)) {
      const encrypted = Buffer.from(values);
      const ivs = {
        zero, first16:encrypted.subarray(0,16),
        last16:encrypted.subarray(240)
      };
      for (const mode of modes) {
        for (const [ivName,iv] of Object.entries(
          mode === 'ecb' ? {none:null}:ivs)) {
          const decoded = decrypt(key,encrypted,mode,iv);
          const score = printability(decoded);
          rows.push({
            key:keyName,order,mode,iv:ivName,...score,
            pgpHeader:decoded.includes(prefix),
            hasFileSignature:
              decoded.subarray(0,4).equals(Buffer.from([0x50,0x4b,3,4])) ||
              decoded.subarray(0,4).equals(Buffer.from([0x25,0x50,0x44,0x46])) ||
              decoded.subarray(0,2).equals(Buffer.from([0x1f,0x8b])) ||
              decoded.subarray(0,2).equals(Buffer.from([0x78,0x9c])),
            pkcs7Valid:pkcs7(decoded),
            sha256:crypto.createHash('sha256').update(decoded).digest('hex')
          });
        }
      }
    }
  }
  assert.equal(rows.length,195);
  rows.sort((a,b) => b.ascii-a.ascii || b.letters-a.letters);
  return rows;
}

function run() {
  assert.equal(GRID.byte_rows.flat().length,256);
  assert.equal(GRID.alphabet.length,60);
  assert.ok(Object.values(traversals).every(x => x.length === 256));
  assert.equal(Object.values(rawKeys).length,3);

  // Exact original-code positive: generated AES-256-CBC ciphertext
  // reproduces byte-for-byte known GPG-like ASCII document.
  const message = Buffer.from('-----BEGIN PGP SIGNED MESSAGE-----\n' +
    'Hash: SHA256\n\n' +
    'AN INDEPENDENT KEY-CONTROL TEST.\n' +
    '3301\n' +
    '-----BEGIN PGP SIGNATURE-----\n', 'ascii');
  const state = crypto.createCipheriv('aes-256-cbc',rawKeys.cookie167,zero);
  state.setAutoPadding(true);
  const ciphertext = Buffer.concat([state.update(message),state.final()]);
  const decrypter = crypto.createDecipheriv('aes-256-cbc',rawKeys.cookie167,zero);
  const restored = Buffer.concat([decrypter.update(ciphertext),decrypter.final()]);
  assert.deepEqual(restored,message);

  const results = scan();
  return {
    source:'krisyotam/cicada3301, liber-primus/analysis/HINTS-NEVER-USED.md, 2013 onion cookies 167 and 761',
    sourceStatus:'Historical third-party archive, not separately signed/authenticated',
    gridBytes:256,
    gridSha256:crypto.createHash('sha256')
      .update(Buffer.from(GRID.byte_rows.flat())).digest('hex'),
    candidateCount:results.length,
    exactOriginalByteHeaders:results.filter(x=>x.pgpHeader ||
      x.hasFileSignature).length,
    validPkcs7LastBlock:results.filter(x=>x.pkcs7Valid).length,
    asciiAtLeast130:results.filter(x=>x.ascii>=130).length,
    best:results.slice(0,10),
    positive:{encryption:'AES-256-CBC',key:'archived cookie167',
      exactMessageRoundtrip:restored.equals(message),
      asciiHeaderRecognized:restored.includes(prefix),
      bytes:restored.length},
    conclusion:'No recognizable plaintext/file headers from archived cookie keys under this precisely bounded AES matrix family.'
  };
}
if (require.main === module) console.log(JSON.stringify(run(),null,2));
module.exports = {traversals,rawKeys,decrypt,printability,pkcs7,scan,run};
