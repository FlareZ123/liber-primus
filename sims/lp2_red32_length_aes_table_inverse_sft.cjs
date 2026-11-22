'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative */
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const grid = read('resources/liber-primus/base60-grid.json');
const byPage = new Map(corpus.pages.map((p) => [p.page, p]));

/** @typedef {{ at:number, kind:'rune'|'mark' }} RedEvent */
/** @type {RedEvent[]} */
const events = [];
for (const page of ink.pages) {
  const sourcePage = byPage.get(page.page);
  assert.ok(sourcePage, 'original page missing');
  /** @type {RedEvent[]} */
  const local = [];
  for (const [at, dots] of page.large_punctuation || []) {
    if (dots === 13) local.push({ at, kind: 'mark' });
  }
  for (const span of page.red_spans || []) {
    const letters = Array.from(span.runes);
    assert.equal(letters.length, span.length);
    for (let j = 0; j < span.length; j++) {
      const index = corpus.runes.indexOf(letters[j]);
      assert.equal(sourcePage.indices[span.start + j], index, 'source colored glyph');
      local.push({ at: span.start + j + 0.5, kind: 'rune' });
    }
  }
  events.push(...local.sort((a, b) => a.at - b.at));
}

assert.equal(events.length, 256);
assert.equal(events.filter((e) => e.kind === 'rune').length, 225);
assert.equal(events.filter((e) => e.kind === 'mark').length, 31);

const lengths = [0];
for (const event of events) {
  if (event.kind === 'mark') lengths.push(0);
  else lengths[lengths.length - 1]++;
}
assert.equal(lengths.length, 32);
assert.deepEqual(lengths, [
  13, 0, 16, 0, 3, 0, 11, 0,
  0, 14, 12, 0, 9, 11, 0, 16,
  0, 19, 0, 10, 0, 8, 0, 3,
  0, 59, 9, 0, 5, 0, 7, 0,
]);

const keyRaw = Buffer.from(lengths);
const base60 = grid.alphabet;
const keyASCII = Buffer.from(lengths.map((n) => base60[n]).join(''), 'ascii');
assert.equal(keyRaw.toString('hex'), '0d00100003000b00000e0c00090b00100013000a00080003003b090005000700');
assert.equal(keyASCII.toString('ascii'), 'D0G030B00EC09B0G0J0A08030x905070');

const cipherText = Buffer.from(grid.byte_rows.flat());
assert.equal(cipherText.length, 256);
assert.equal(crypto.createHash('sha256').update(cipherText).digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/**
 * @param {Buffer} input
 * @param {Buffer} key
 * @param {string} algorithm
 * @param {'encrypt'|'decrypt'} direction
 */
function transform(input, key, algorithm, direction) {
  const iv = algorithm === 'aes-256-ecb' ? null : Buffer.alloc(16);
  const stream = direction === 'encrypt'
    ? crypto.createCipheriv(algorithm, key, iv)
    : crypto.createDecipheriv(algorithm, key, iv);
  if (algorithm === 'aes-256-ecb' || algorithm === 'aes-256-cbc') stream.setAutoPadding(false);
  return Buffer.concat([stream.update(input), stream.final()]);
}

/** @param {Buffer} buffer */
function diagnostics(buffer) {
  const printable = buffer.reduce((n, b) => n + Number((b >= 32 && b < 127) || b === 9 || b === 10 || b === 13), 0);
  const matches = buffer.toString('latin1').match(/[ -~]+/g) || [];
  const longestAsciiRun = Math.max(0, ...matches.map((v) => v.length));
  const final = buffer[buffer.length - 1];
  const hasPKCS7 = final >= 1 && final <= 16 && buffer.subarray(-final).every((b) => b === final);
  const knownHeaders = [
    ['PNG', Buffer.from('89504e47', 'hex')],
    ['ZIP', Buffer.from('504b0304', 'hex')],
    ['PDF', Buffer.from('25504446', 'hex')],
    ['GZIP', Buffer.from('1f8b', 'hex')],
    ['JPEG', Buffer.from('ffd8', 'hex')],
    ['BZIP2', Buffer.from('425a68', 'hex')],
    ['XZ', Buffer.from('fd377a585a00', 'hex')],
    ['7ZIP', Buffer.from('377abcaf', 'hex')],
  ];
  const headers = knownHeaders.filter(([, prefix]) => buffer.subarray(0, prefix.length).equals(prefix)).map(([name]) => name);
  return { printable, longestAsciiRun, hasPKCS7, headers };
}

const expected = {
  'raw/aes-256-ecb': '2ec6211dc1f850c22ae2641d6947f14e',
  'raw/aes-256-cbc': '2ec6211dc1f850c22ae2641d6947f14e',
  'raw/aes-256-ctr': 'ac3984e51bb1429a109449a5fc34ad8f',
  'raw/chacha20': 'bcce4f31c6f0c0d401b86491acf3eafd',
  'ascii/aes-256-ecb': '3aa8b46aecb2c685056b01d96cd7c637',
  'ascii/aes-256-cbc': '3aa8b46aecb2c685056b01d96cd7c637',
  'ascii/aes-256-ctr': '069b2e4491c891445726a5e89da01bc4',
  'ascii/chacha20': '0acf56206d8d27a0ce9f209c3b58303d',
};

const algorithms = ['aes-256-ecb', 'aes-256-cbc', 'aes-256-ctr', 'chacha20'];
const keys = [['raw', keyRaw], ['ascii', keyASCII]];
const knownPlain = Buffer.alloc(256);
Buffer.from('LIBER PRIMUS ORIGINAL SOURCE CONTROL ').copy(knownPlain);
const outcomes = [];
for (const [name, key] of keys) {
  for (const algorithm of algorithms) {
    const plain = transform(cipherText, key, algorithm, 'decrypt');
    assert.equal(plain.length, 256);
    assert.equal(plain.subarray(0, 16).toString('hex'), expected[name + '/' + algorithm]);
    const cipherPlant = transform(knownPlain, key, algorithm, 'encrypt');
    assert.deepEqual(transform(cipherPlant, key, algorithm, 'decrypt'), knownPlain, 'planted cipher');
    const wrongKey = Buffer.from(key).reverse();
    assert.notDeepEqual(transform(cipherPlant, wrongKey, algorithm, 'decrypt'), knownPlain, 'wrong key');
    const details = diagnostics(plain);
    assert.deepEqual(details.headers, []);
    assert.equal(details.hasPKCS7, false);
    assert.ok(details.longestAsciiRun <= 7);
    outcomes.push({ key: name, algorithm, first16: expected[name + '/' + algorithm], ...details });
  }
}

console.log(JSON.stringify({
  redSegmentLengths: lengths,
  keyRawHex: keyRaw.toString('hex'),
  keyASCII: keyASCII.toString('ascii'),
  sourceTableSHA256: crypto.createHash('sha256').update(cipherText).digest('hex'),
  tested: outcomes.length,
  allPlantedRoundTripsPass: true,
  recognizableOriginalPayloads: 0,
  outcomes,
}, null, 2));
