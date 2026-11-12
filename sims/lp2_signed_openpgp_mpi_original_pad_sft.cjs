'use strict';

/**
 * Source-locked direct GP29 pad test for RSA signature MPIs on signed Cicada messages.
 * Reproduce with: node sims/lp2_signed_openpgp_mpi_original_pad_sft.cjs
 * The test makes no claim that the historical author intended a signature pad.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');

/** @param {string} p */
function read(p) {
  return fs.readFileSync(path.join(ROOT, p), 'utf8');
}

/** @param {string} armored */
function extractRsaSignature(armored) {
  const start = armored.indexOf('-----BEGIN PGP SIGNATURE-----');
  const end = armored.indexOf('-----END PGP SIGNATURE-----', start);
  assert(start >= 0 && end > start, 'missing signed source');
  const lines = armored.slice(start + 29, end).split(/\r?\n/)
    .map((x) => x.trim())
    .filter((x) => /^[A-Za-z0-9+/]+={0,2}$/.test(x));
  const buf = Buffer.from(lines.join(''), 'base64');
  assert.equal(buf[0], 0x89, 'expected old-format tag-2 packet');
  const len = buf.readUInt16BE(1);
  assert.equal(buf.length, len + 3);
  const body = buf.subarray(3);
  assert.equal(body[0], 4);
  assert.equal(body[1], 1, 'expected canonical text signature');
  assert.equal(body[2], 1, 'expected RSA public-key algorithm');
  assert.equal(body[3], 2, 'expected SHA-1 hash algorithm');
  let pos = 6 + body.readUInt16BE(4);
  pos += 2 + body.readUInt16BE(pos);
  pos += 2; // signed digest prefix
  const bits = body.readUInt16BE(pos);
  pos += 2;
  const mpi = body.subarray(pos, pos + Math.ceil(bits / 8));
  assert.equal(pos + mpi.length, body.length);
  assert.equal(mpi.length, 512);
  return { bytes: [...mpi], bits, sha256: crypto.createHash('sha256').update(mpi).digest('hex') };
}

/** @param {number[]} xs */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) {
    assert(x >= 0 && x < 29);
    counts[x]++;
  }
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

/** @param {string} text @param {string[]} translit */
function tokenizeReference(text, translit) {
  const clean = text.split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('[')
      && !/^\s*[0-9\s]+$/.test(line))
    .join(' ').toUpperCase().replace(/[^A-Z]/g, '');
  const units = translit.map((value, index) => ({ value, index }))
    .sort((a, b) => b.value.length - a.value.length);
  const output = [];
  for (let i = 0; i < clean.length;) {
    const unit = units.find((v) => clean.startsWith(v.value, i));
    if (unit) {
      output.push(unit.index);
      i += unit.value.length;
    } else {
      i++;
    }
  }
  return output;
}

/**
 * @param {number[][]} pages
 * @param {number[]} key
 * @param {1|-1} sign
 * @param {boolean} restart
 * @param {boolean} inverse
 */
function transport(pages, key, sign, restart, inverse) {
  let position = 0;
  return pages.map((page) => {
    if (restart) position = 0;
    return page.map((rune) => {
      const shift = sign * key[position++ % key.length] * (inverse ? -1 : 1);
      return (rune + shift + 29) % 29;
    });
  });
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length).map((p) => p.indices);
const flat = pages.flat();
assert.equal(flat.length, 12956);
assert.equal(pages.length, 55);
const native = tokenizeReference(read('resources/liber-primus/lp1-plaintext-reference.txt'), corpus.translit);
assert(native.length >= 3000);
const nativeIoc = ioc(native);
assert(nativeIoc > 0.055);
const seed = Array.from({ length: flat.length }, (_, i) => native[i % native.length]);
const plantPages = [];
let offset = 0;
for (const page of pages) {
  plantPages.push(seed.slice(offset, offset + page.length));
  offset += page.length;
}
const sourceFiles = [
  'resources/historical/cicada2014-stage11-message.asc',
  'resources/historical/cicada2016-4gq25-outguess.asc',
];
const outcomes = [];
for (const sourceFile of sourceFiles) {
  const signature = extractRsaSignature(read(sourceFile));
  const rows = [];
  for (const reducer of ['mod29', 'scaled29', 'unbiased29']) {
    const key = signature.bytes.flatMap((v) =>
      reducer === 'unbiased29' ? (v < 232 ? [v % 29] : [])
        : [reducer === 'mod29' ? v % 29 : Math.floor(v * 29 / 256)]);
    assert(key.length >= 400);
    for (const reverse of [false, true]) {
      const pad = reverse ? key.slice().reverse() : key;
      for (const sign of /** @type {Array<1|-1>} */ ([-1, 1])) {
        for (const restart of [false, true]) {
          const plaintext = transport(pages, pad, sign, restart, true).flat();
          const ci = ioc(plaintext);
          const encrypted = transport(plantPages, pad, sign, restart, false);
          const restored = transport(encrypted, pad, sign, restart, true).flat();
          assert.deepEqual(restored, seed, 'native GP control must recover exactly');
          assert.deepEqual(transport(transport(pages, pad, sign, restart, true),
            pad, sign, restart, false), pages, 'original must exactly re-encode');
          rows.push({ reducer, reverse, sign, restart, ioc: ci, keyLength: key.length });
        }
      }
    }
  }
  assert.equal(rows.length, 24);
  rows.sort((a, b) => b.ioc - a.ioc);
  assert(rows[0].ioc < 0.04, 'direct original inverse unexpectedly nonflat');
  outcomes.push({ sourceFile, rsaMpiBits: signature.bits, rsaMpiSha256: signature.sha256, best: rows[0], worst: rows.at(-1), tested: rows.length });
}
console.log(JSON.stringify({
  originalRunes: flat.length,
  originalIoC: ioc(flat),
  nativeReferenceRunes: native.length,
  nativeReferenceIoC: nativeIoc,
  exactPlaintextControlRunesPerVariant: flat.length,
  outcomes,
}, null, 2));
