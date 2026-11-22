#!/usr/bin/env node
'use strict';

/**
 * Source-fixed 2013 761.MP3 XOR test on the original LP2 physical p3-p7
 * chapter's two canonical one-byte GP representations.
 *
 * Run: node sims/lp2_p3_p7_761_mp3_rune_xor_sft.cjs /path/to/761.MP3
 * Node 22, standard library only. No offsets, phases, KDFs or fitted transforms.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const mp3Path = process.argv[2] || '/tmp/761.MP3';
const mp3 = fs.readFileSync(mp3Path);
const expectedLength = 4010732;
const expectedSha256 = '83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460';
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
assert.equal(mp3.length, expectedLength, 'original 761.MP3 byte length');
assert.equal(sha256(mp3), expectedSha256, 'original 761.MP3 SHA-256');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.runes.length, 29);
assert.equal(corpus.prime.length, 29);

const selectedPages = corpus.pages.slice(3, 8);
assert.deepEqual(selectedPages.map(p => p.page), [3, 4, 5, 6, 7]);
const pageLengths = selectedPages.map(p => p.indices.length);
assert.deepEqual(pageLengths, [217, 261, 263, 196, 208]);
const indices = selectedPages.flatMap(p => p.indices);
assert.equal(indices.length, 1145);
assert.ok(indices.every(x => Number.isInteger(x) && x >= 0 && x < 29));
const gpPrimeSum = indices.reduce((s, i) => s + corpus.prime[i], 0);
assert.equal(gpPrimeSum, 60675);

const magic = [
  ['JPEG', Buffer.from([0xff, 0xd8, 0xff])],
  ['PNG', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  ['ZIP', Buffer.from([0x50, 0x4b, 0x03, 0x04])],
  ['GZIP', Buffer.from([0x1f, 0x8b])],
  ['PDF', Buffer.from('%PDF-')],
  ['GIF', Buffer.from('GIF8')],
  ['7z', Buffer.from([0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])],
  ['RAR', Buffer.from('Rar!')],
  ['PGP armor', Buffer.from('-----BEGIN PGP')],
  ['MP3 ID3', Buffer.from('ID3')],
  ['Ogg', Buffer.from('OggS')],
  ['RIFF', Buffer.from('RIFF')],
  ['SQLite', Buffer.from([0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00])],
  ['ELF', Buffer.from([0x7f, 0x45, 0x4c, 0x46])],
  ['BZIP2', Buffer.from('BZh')],
  ['XZ', Buffer.from([0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00])]
];

function printable(byte) {
  return byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126);
}
function longestPrintableRun(bytes) {
  let best = 0, run = 0;
  for (const b of bytes) {
    run = printable(b) ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}
function entropy(bytes) {
  const counts = new Uint32Array(256);
  for (const b of bytes) counts[b]++;
  let h = 0;
  for (const n of counts) if (n) {
    const p = n / bytes.length;
    h -= p * Math.log2(p);
  }
  return h;
}
function textPreview(bytes) {
  return Array.from(bytes.subarray(0, 160), b =>
    printable(b) ? String.fromCharCode(b) : '.').join('');
}
function inspect(name, encoded) {
  assert.equal(encoded.length, indices.length);
  const out = Buffer.alloc(encoded.length);
  for (let i = 0; i < encoded.length; i++) out[i] = encoded[i] ^ mp3[i];
  const gpIndexMatches = out.reduce((n, b) => n + (b < 29 ? 1 : 0), 0);
  const gpPrimeSet = new Set(corpus.prime);
  const gpPrimeMatches = out.reduce((n, b) => n + (gpPrimeSet.has(b) ? 1 : 0), 0);
  let utf8 = null;
  try { utf8 = new TextDecoder('utf-8', { fatal: true }).decode(out); }
  catch { /* non-UTF8 is a normal negative outcome */ }
  const printableBytes = out.reduce((n, b) => n + (printable(b) ? 1 : 0), 0);
  return {
    encoding: name,
    byteOffset: 0,
    length: out.length,
    sha256: sha256(out),
    entropyBitsPerByte: Number(entropy(out).toFixed(6)),
    printableBytes,
    printableRatio: Number((printableBytes / out.length).toFixed(6)),
    longestPrintableRun: longestPrintableRun(out),
    distinctByteValues: new Set(out).size,
    gpIndexRangeBytes: gpIndexMatches,
    gpPrimeWeightBytes: gpPrimeMatches,
    validUtf8: utf8 !== null,
    recognizedFileMagicAtOffset0: magic.filter(([, sig]) => out.subarray(0, sig.length).equals(sig)).map(([label]) => label),
    first64Hex: out.subarray(0, 64).toString('hex'),
    first160Latin1Preview: textPreview(out),
    gpText: gpIndexMatches === out.length ? Array.from(out, i => corpus.translit[i]).join('') :
      (gpPrimeMatches === out.length ? Array.from(out, b => corpus.translit[corpus.prime.indexOf(b)]).join('') : null)
  };
}

// The historical 2013 stage used the entire MP3 from byte zero, including
// its ID3v2 tag. The two encodings below are the only canonical one-byte
// representations supplied by the original GP alphabet.
const results = [
  inspect('zero-based GP rune indices 0..28', Buffer.from(indices)),
  inspect('published GP prime weights 2..109', Buffer.from(indices.map(i => corpus.prime[i])))
];

console.log(JSON.stringify({
  classification: 'bounded source-selected transfer test; no key or plaintext presumed',
  source: {
    mp3: { bytes: mp3.length, sha256: expectedSha256, id3Included: true },
    targetPages: [3, 4, 5, 6, 7],
    pageRuneCounts: pageLengths,
    chapterRunes: indices.length,
    chapterGpPrimeSum: gpPrimeSum
  },
  frozenOperation: 'output[i] = oneByteGPEncoding[i] XOR 761.MP3[i], continuous from byte offset zero',
  variants: results,
  decisionRule: 'A direct plaintext recovery requires sustained readable text or an independently recognizable binary payload; entropy or isolated printable bytes alone are not a positive result.',
  result: results.every(r => r.recognizedFileMagicAtOffset0.length === 0 &&
    r.longestPrintableRun < 20 && r.gpText === null) ?
    'both canonical one-byte GP encodings fail to produce a directly readable text or recognized file at the source-fixed offset' :
    'inspect output manually; this is not automatically a decryption'
}, null, 2));
