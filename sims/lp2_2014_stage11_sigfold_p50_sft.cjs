'use strict';

/**
 * 2014 Stage11 OpenPGP RSA-MPI "fold" into p50 numerical table test.
 * Direct full-original byte inverses, read-only, Windows Node.js 22.
 * Run: node sims/lp2_2014_stage11_sigfold_p50_sft.cjs
 *
 * Hypothesis is conditional: literal p14 FOLD does not authenticate a
 * signature-folding algorithm or its transfer to the 256-cell table.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const originalSignature = read('resources/historical/cicada2014-stage11-message.asc');
const originalGrid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const originalCorpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));

const page14 = originalCorpus.pages[14].indices;
assert.equal(page14.length, 137);
assert.equal(page14.slice(2, 6)
  .map((index) => originalCorpus.translit[index]).join(''), 'FOLD');

const sigBlock = originalSignature
  .split('-----BEGIN PGP SIGNATURE-----')[1]
  .split('-----END PGP SIGNATURE-----')[0];
assert.ok(sigBlock, 'missing historical stage11 OpenPGP signature');
const base64 = sigBlock.split(/\r?\n/)
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith('Version:') &&
    !s.startsWith('='))
  .join('');
const originalPacket = Buffer.from(base64, 'base64');
assert.equal(originalPacket.length, 543);
const sig = originalPacket.subarray(-512);
assert.equal(sig.length, 512);
const sigHashes = {
  packet_sha256: crypto.createHash('sha256').update(originalPacket).digest('hex'),
  mpi_sha256: crypto.createHash('sha256').update(sig).digest('hex'),
};

const tokens = originalGrid.pages.flatMap((p) => p.tokens);
assert.equal(tokens.length, 256);
const alphabet = originalGrid.alphabet;
assert.equal(alphabet.length, 60);
const originalBytes = tokens.map((tok) =>
  60 * alphabet.indexOf(tok[0]) + alphabet.indexOf(tok[1]));
assert.deepEqual(originalBytes, originalGrid.bytes);
assert.equal(originalBytes.length, 256);

const halves = [
  ['signature-first-half', Array.from(sig.subarray(0, 256))],
  ['signature-second-half', Array.from(sig.subarray(256))],
  ['signature-XOR-fold', Array.from(sig.subarray(0, 256),
    (b, i) => b ^ sig[256 + i])],
];

const ops = {
  xor: (cipher, key) => cipher ^ key,
  subtract: (cipher, key) => (cipher - key + 256) & 255,
  add: (cipher, key) => (cipher + key) & 255,
};

function reverseOp(value, key, operation) {
  switch (operation) {
    case 'xor': return value ^ key;
    case 'subtract': return (value + key) & 255;
    case 'add': return (value - key + 256) & 255;
    default: throw new Error('unrecognized frozen operation');
  }
}

function languageCheck(bytes) {
  let printable = 0, run = 0, maxRun = 0;
  for (const b of bytes) {
    if (b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)) printable++;
    if (b >= 32 && b <= 126) {
      run++;
      maxRun = Math.max(maxRun, run);
    } else run = 0;
  }
  return {printable, maxRun};
}

const plant = Buffer.alloc(256, 32);
Buffer.from('HELLO FROM LIBER PRIMUS', 'ascii').copy(plant, 0);
const expected = [92, 89, 84, 102, 86, 102, 99, 94, 88];
const expectedRuns = [6, 5, 3, 8, 5, 4, 5, 6, 7];

console.log('2014 original Stage11 PGP packet bytes', originalPacket.length);
console.log('2014 original RSA MPI suffix', sigHashes);
console.log('p50 original table 256 source bytes; original p14 word FOLD');
let tests = 0;
for (const [keyName, key] of halves) {
  assert.equal(key.length, 256);
  for (const [operation, decode] of Object.entries(ops)) {
    const output = originalBytes.map((b, i) => decode(b, key[i]));
    const back = output.map((b, i) => reverseOp(b, key[i], operation));
    assert.deepEqual(back, originalBytes);
    const nativeCipher = Array.from(plant, (b, i) =>
      reverseOp(b, key[i], operation));
    const recovered = nativeCipher.map((b, i) => decode(b, key[i]));
    assert.deepEqual(recovered, Array.from(plant));
    const {printable, maxRun} = languageCheck(output);
    assert.equal(printable, expected[tests]);
    assert.equal(maxRun, expectedRuns[tests]);
    const preview = output.slice(0, 28)
      .map((n) => n >= 32 && n <= 126 ? String.fromCharCode(n) : '.')
      .join('');
    console.log(keyName, operation, 'printable', printable + '/256',
      'max-printable-run', maxRun, 'lead', preview);
    tests++;
  }
}
assert.equal(tests, 9);
console.log('PASS: nine direct original 256-byte inverses and full exact replay,');
console.log('nine independent positive plants, no readable source-key payload.');
