'use strict';

/**
 * Source-fixed 2016 signed "words/map; meaning/road; numbers/direction"
 * ordinal rows against the original LP2 32x8 base60 byte table.
 * Run from any working directory: node sims/lp2_signed_2016_semantic_pairs_p50_aes192_sft.cjs
 * Requires Node.js 22, no packages, no writes.
 *
 * These finite consumers are hypotheses, not an author-authenticated key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createCipheriv, createDecipheriv } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8');
const body = source.slice(source.indexOf('\n\n') + 2, source.indexOf('-----BEGIN PGP SIGNATURE-----'));
const words = (body.match(/[A-Za-z]+/g) || []).map(word => word.toLowerCase());
const pairs = [['words', 'map'], ['meaning', 'road'], ['numbers', 'direction']];
const positions = pairs.map(([from, to]) => [words.indexOf(from) + 1, words.indexOf(to) + 1]);
assert.deepEqual(positions, [[16, 19], [21, 24], [27, 30]]);

const table = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const values = Buffer.from(table.bytes);
assert.equal(values.length, 256);
const gp = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8')).translit;
const row = ordinal => values.subarray((ordinal - 1) * 8, ordinal * 8);
assert.equal([...row(30)].reduce((sum, value) => sum + value, 0), 1229);
const inputRows = positions.map(([a]) => row(a));
const outputRows = positions.map(([, b]) => row(b));

for (let k = 0; k < pairs.length; k++) {
  const differences = [...inputRows[k]].map((v, i) => ((outputRows[k][i] - v) % 29 + 29) % 29);
  process.stdout.write(
    pairs[k].join(' -> ') + ' ' + positions[k].join(' -> ') +
    ' GP29 delta = ' + differences.map(index => gp[index]).join(' ') + '\n'
  );
}

const keys = {
  'xor-pairs': Buffer.from(inputRows.flatMap((r, i) => [...r].map((v, j) => v ^ outputRows[i][j]))),
  'forward-delta': Buffer.from(inputRows.flatMap((r, i) => [...r].map((v, j) => (outputRows[i][j] - v + 256) % 256))),
  'reverse-delta': Buffer.from(inputRows.flatMap((r, i) => [...r].map((v, j) => (v - outputRows[i][j] + 256) % 256))),
  'subject-rows': Buffer.concat(inputRows),
  'object-rows': Buffer.concat(outputRows),
};

const signatures = [
  Buffer.from('25504446', 'hex'), // %PDF
  Buffer.from('504b0304', 'hex'), // ZIP
  Buffer.from('1f8b08', 'hex'), // gzip
  Buffer.from('425a68', 'hex'), // bzip2
  Buffer.from('89504e470d0a1a0a', 'hex'), // PNG
  Buffer.from('ffd8ff', 'hex'), // JPEG
  Buffer.from('-----BEGIN', 'ascii'), // ASCII armor
];

for (const [label, key] of Object.entries(keys)) {
  assert.equal(key.length, 24);
  for (const [mode, iv] of [['ecb', null], ['cbc', Buffer.alloc(16)]]) {
    const name = 'aes-192-' + mode;
    const cipher = createCipheriv(name, key, iv);
    cipher.setAutoPadding(false);
    const testText = Buffer.alloc(256, 0x41);
    const planted = Buffer.concat([cipher.update(testText), cipher.final()]);
    const positive = createDecipheriv(name, key, iv);
    positive.setAutoPadding(false);
    assert.deepEqual(Buffer.concat([positive.update(planted), positive.final()]), testText);

    const decipher = createDecipheriv(name, key, iv);
    decipher.setAutoPadding(false);
    const candidate = Buffer.concat([decipher.update(values), decipher.final()]);
    assert.equal(candidate.length, 256);
    const printable = [...candidate].filter(v => v >= 32 && v <= 126 || v === 9 || v === 10 || v === 13).length;
    const magic = signatures.some(sig => candidate.subarray(0, sig.length).equals(sig));
    process.stdout.write(
      label + ' ' + name + ' printable=' + printable + '/256' +
      ' first16=' + candidate.subarray(0, 16).toString('hex') +
      ' known_magic=' + magic + '\n'
    );
  }
}
// Source literal AES-256 + 128-bit IV layout: rows16,19,21,24 as key,
// rows27,30 as IV. This is a separate unfitted six-row interpretation.
const orderedWordPositions = positions.flat();
const key256 = Buffer.concat(orderedWordPositions.slice(0, 4).map(ordinal => row(ordinal)));
const iv128 = Buffer.concat(orderedWordPositions.slice(4).map(ordinal => row(ordinal)));
assert.equal(key256.length, 32);
assert.equal(iv128.length, 16);
for (const mode of ['cbc', 'ctr', 'cfb']) {
  const name = 'aes-256-' + mode;
  const encryptor = createCipheriv(name, key256, iv128);
  if (mode === 'cbc') encryptor.setAutoPadding(false);
  const plantedPlain = Buffer.alloc(256, 0x41);
  const plantedCipher = Buffer.concat([encryptor.update(plantedPlain), encryptor.final()]);
  const positive = createDecipheriv(name, key256, iv128);
  if (mode === 'cbc') positive.setAutoPadding(false);
  assert.deepEqual(Buffer.concat([positive.update(plantedCipher), positive.final()]), plantedPlain);
  const decipher = createDecipheriv(name, key256, iv128);
  if (mode === 'cbc') decipher.setAutoPadding(false);
  const candidate = Buffer.concat([decipher.update(values), decipher.final()]);
  assert.equal(candidate.length, 256);
  const printable = [...candidate].filter(v => v >= 32 && v <= 126 || v === 9 || v === 10 || v === 13).length;
  const magic = signatures.some(sig => candidate.subarray(0, sig.length).equals(sig));
  process.stdout.write(
    'six-literal-rows ' + name + ' printable=' + printable + '/256' +
    ' first16=' + candidate.subarray(0, 16).toString('hex') +
    ' known_magic=' + magic + '\n'
  );
}
process.stdout.write('PASS: original signed ordinals, ten AES-192 and three AES-256 direct inverses, all positives\n');
