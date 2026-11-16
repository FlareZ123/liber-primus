'use strict';

/**
 * Original-input SFT: 256 printed LP2 ink events as a binary AES-256 key
 * and as a byte mask for the 256-cell numeric table.
 *
 * No files are written. Node.js 22, CommonJS, built-in dependencies only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createCipheriv, createDecipheriv } = require('node:crypto');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} name @returns {any} */
const read = (name) => JSON.parse(fs.readFileSync(path.join(base, name), 'utf8'));
const ann = read('lp2-ink-annotations.json');
const gp = read('lp2-corpus.json');
const table = read('lp2-grid-256.json').pages.flatMap((p) => p.bytes);
const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
  53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109];
const index = new Map(gp.runes.map((r, i) => [r, i]));
assert.equal(gp.runes.length, 29);
assert.equal(table.length, 256);
assert.equal(table.filter((n) => n >= 128).length, 129);
assert(table.every((n) => Number.isInteger(n) && n >= 0 && n <= 255));

/** @type {{page:number,pos:number,mark:boolean,value:number}[]} */
const events = [];
for (const p of ann.pages) {
  for (const span of p.red_spans || []) {
    const symbols = [...span.runes];
    assert.equal(symbols.length, span.length);
    symbols.forEach((symbol, j) => {
      const v = index.get(symbol);
      assert.notEqual(v, undefined);
      events.push({ page: p.page, pos: span.start + j, mark: false, value: v });
    });
  }
  for (const mark of p.large_punctuation || []) {
    if (mark[1] === 13) {
      events.push({ page: p.page, pos: mark[0], mark: true, value: 0 });
    }
  }
}
events.sort((a, b) => a.page - b.page || a.pos - b.pos ||
  (a.mark === b.mark ? 0 : a.mark ? -1 : 1));
assert.equal(events.length, 256);
assert.equal(events.filter((e) => e.mark).length, 31);
assert.equal(events.filter((e) => !e.mark).length, 225);

/** @param {number[]} bits @returns {Buffer} */
function packBits(bits) {
  assert.equal(bits.length, 256);
  return Buffer.from(Array.from({ length: 32 }, (_, i) => {
    let n = 0;
    for (let j = 0; j < 8; j++) n = (n << 1) | bits[8 * i + j];
    return n;
  }));
}
/** @param {number[]} array @returns {number} */
const printable = (array) => array.filter((x) =>
  x >= 32 && x <= 126 || x === 9 || x === 10 || x === 13).length;
/** @param {number[]} bits @returns {number[]} */
function bitPlaneMatches(bits) {
  return Array.from({ length: 8 }, (_, bit) =>
    bits.reduce((sum, _, i) =>
      sum + Number(bits[i] === ((table[i] >>> bit) & 1)), 0));
}
const bitRules = [
  { id: 'ordinalParity_mark1', bits: events.map((e) => e.mark ? 1 : e.value & 1),
    expected: '969e9985ec6e7c78636fa82fe7b244f3413f22709fd99b92e10a3e36dde3eb89',
    print: [108, 94], bitBest: 142, rank: 76 },
  { id: 'ordinalParity_mark0', bits: events.map((e) => e.mark ? 0 : e.value & 1),
    expected: '96989984606e0c78436e280fe4b244334139221087199b92e10a3e36d9e26888',
    print: [101, 80], bitBest: 145, rank: 34 },
  { id: 'ordinalHigh_mark1', bits: events.map((e) => e.mark ? 1 : Number(e.value >= 15)),
    expected: 'a6f7134baf6e7b42e2439ff457524deed9e704705dcda280e95c142507e3db5f',
    print: [99, 98], bitBest: 145, rank: 28 },
  { id: 'ordinalHigh_mark0', bits: events.map((e) => e.mark ? 0 : Number(e.value >= 15)),
    expected: 'a6f1134a236e0b42c2421fd454524d2ed9e10410450da280e95c142503e2585e',
    print: [89, 111] },
];
const sourceBytes = Buffer.from(table);
for (const rule of bitRules) {
  const key = packBits(rule.bits);
  assert.equal(key.toString('hex'), rule.expected);
  for (const [modeIndex, mode] of ['ecb', 'cbc'].entries()) {
    const algorithm = 'aes-256-' + mode;
    const iv = mode === 'cbc' ? Buffer.alloc(16) : null;
    const decoder = createDecipheriv(algorithm, key, iv);
    decoder.setAutoPadding(false);
    const plain = Buffer.concat([decoder.update(sourceBytes), decoder.final()]);
    assert.equal(printable([...plain]), rule.print[modeIndex]);
    // Positive plant under the identical key and exact mode.
    const planted = Buffer.alloc(256, 65);
    const enc = createCipheriv(algorithm, key, iv);
    enc.setAutoPadding(false);
    const cipher = Buffer.concat([enc.update(planted), enc.final()]);
    const dec = createDecipheriv(algorithm, key, iv);
    dec.setAutoPadding(false);
    assert.deepEqual(Buffer.concat([dec.update(cipher), dec.final()]), planted);
    console.log(rule.id, mode, 'printable', printable([...plain]) + '/256',
      'first16', plain.subarray(0, 16).toString('hex'));
  }
  if (rule.bitBest !== undefined) {
    const match = Math.max(...bitPlaneMatches(rule.bits));
    const all = Array.from({ length: 256 }, (_, shift) => {
      const shifted = rule.bits.map((_, i) => rule.bits[(i + shift) % 256]);
      return Math.max(...bitPlaneMatches(shifted));
    });
    assert.equal(match, rule.bitBest);
    assert.equal(all.filter((n) => n >= match).length, rule.rank);
    console.log(rule.id, 'best same-ordinal table bit matches', match + '/256',
      'cyclic rotations as good or better', rule.rank + '/256');
  }
}
for (const kind of ['ordinal', 'prime']) {
  for (const marker of [0, 13]) {
    const key = events.map((e) => e.mark ? marker :
      kind === 'ordinal' ? e.value : primes[e.value]);
    assert(key.every((n) => n >= 0 && n < 128));
    const transforms = {
      xor: table.map((n, i) => n ^ key[i]),
      sub: table.map((n, i) => (n - key[i] + 256) % 256),
      add: table.map((n, i) => (n + key[i]) % 256),
    };
    assert.equal(transforms.xor.filter((n) => n >= 128).length, 129);
    for (const [op, output] of Object.entries(transforms)) {
      console.log(kind, 'marker', marker, op,
        'printable', printable(output) + '/256',
        'first8', Buffer.from(output.slice(0, 8)).toString('hex'));
    }
  }
}
console.log('RESULT: No native ASCII/file-header recovery under these frozen direct consumers.');
console.log('LIMIT: Other bit orderings, hidden keys, codecs and nontextual binary data remain open.');
