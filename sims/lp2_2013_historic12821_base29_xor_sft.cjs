'use strict';
/**
 * Source-selected 2013 ISO XOR to LP2 original rune-bearing chapters.
 * Tests the exact historical offset 12821 without fitting a pad position.
 * Uses the 2013 puzzle's XOR and BASE29 instructions as two explicit
 * registers, each over two untouched original 2014 manuscript sections.
 *
 * Node.js 22 CommonJS. Input is the SHA-256-pinned DATA/560.13 binary.
 * This is a prospective 2013-to-2014 transfer hypothesis, not a known key.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ISO_SIZE = 118818811;
const ISO_SHA = 'db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f';
const HISTORIC_OFFSET = 12821;
const HISTORIC_CIPHERTEXT = Buffer.from(
  '28c07e1b102d4d5c4c1a376e064477e1416fcc94928765', 'hex');
const HISTORIC_PLAINTEXT = Buffer.from('gbyh7znm6c7ezsmr.onion\n', 'ascii');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));

/** @param {number[]} indices */
function base29Bytes(indices) {
  let value = 0n;
  for (const rune of indices) {
    assert.ok(Number.isInteger(rune) && rune >= 0 && rune < 29);
    value = value * 29n + BigInt(rune);
  }
  let hex = value.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  return Buffer.from(hex, 'hex');
}

/** @param {Buffer} raw @param {number} runeCount */
function recoverBase29(raw, runeCount) {
  let value = BigInt('0x' + raw.toString('hex'));
  const result = Array(runeCount).fill(0);
  for (let i = runeCount - 1; i >= 0; i--) {
    result[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n, 'base29 packet exceeds declared rune width');
  return result;
}

/** @param {Buffer} data @param {Buffer} key */
function xor(data, key) {
  assert.equal(data.length, key.length);
  return Buffer.from(data.map((v, i) => v ^ key[i]));
}

/** @param {Buffer} data */
function inspect(data) {
  const chars = [...data];
  const printable = chars.filter(x => x >= 32 && x <= 126).length;
  const latin = chars.filter(x => x >= 65 && x <= 90 || x >= 97 && x <= 122).length;
  const spaces = chars.filter(x => x === 32).length;
  const text = data.toString('latin1');
  const runs = (text.match(/[A-Za-z ]{8,}/g) || []).sort((a, b) => b.length - a.length);
  return {
    bytes: data.length,
    printable,
    printableFraction: Number((printable / data.length).toFixed(5)),
    latin, spaces,
    longestLetterSpaceRuns: runs.slice(0, 5),
    first48Hex: data.subarray(0, 48).toString('hex'),
    first128Ascii: chars.slice(0, 128).map(x =>
      x >= 32 && x <= 126 ? String.fromCharCode(x) : '.').join(''),
    sha256: crypto.createHash('sha256').update(data).digest('hex')
  };
}

/** @param {number} from @param {number} to */
function runePages(from, to) {
  const pages = corpus.pages.filter(p => p.page >= from && p.page <= to);
  assert.equal(pages.length, to - from + 1);
  return pages.flatMap(p => p.indices);
}

function run() {
  assert.ok(process.argv[2], 'Expected original DATA/560.13 filename');
  const source = fs.readFileSync(process.argv[2]);
  assert.equal(source.length, ISO_SIZE);
  assert.equal(crypto.createHash('sha256').update(source).digest('hex'), ISO_SHA);
  assert.deepEqual(
    xor(HISTORIC_CIPHERTEXT,
      source.subarray(HISTORIC_OFFSET,
        HISTORIC_OFFSET + HISTORIC_CIPHERTEXT.length)),
    HISTORIC_PLAINTEXT,
    'Historical 2013 original XOR control failed');

  const groups = [
    { label: 'first rune section: physical p0–p2', runes: runePages(0, 2), expected: 729 },
    { label: 'second rune section: physical p3–p7', runes: runePages(3, 7), expected: 1145 }
  ];
  const results = [];

  for (const transport of ['rune-index-bytes', 'whole-section-base29-integer']) {
    let clock = HISTORIC_OFFSET;
    for (const section of groups) {
      assert.equal(section.runes.length, section.expected);
      const encoded = transport === 'rune-index-bytes'
        ? Buffer.from(section.runes) : base29Bytes(section.runes);
      if (transport === 'whole-section-base29-integer') {
        assert.deepEqual(recoverBase29(encoded, section.expected), section.runes,
          'Whole-section BASE29 encoding must be exact and reversible');
      } else {
        assert.deepEqual([...encoded], section.runes);
      }
      assert.ok(clock + encoded.length <= source.length);
      const sourceKey = source.subarray(clock, clock + encoded.length);
      const decoded = xor(encoded, sourceKey);
      const plant = Buffer.alloc(encoded.length, 0x20);
      const witness = Buffer.from(
        'THE PRIMES ARE SACRED. CICADA SOURCE XOR PLANT. ', 'ascii');
      for (let i = 0; i < plant.length; i++)
        plant[i] = witness[i % witness.length];
      assert.deepEqual(xor(xor(plant, sourceKey), sourceKey), plant,
        'Independent ASCII XOR plant must decrypt perfectly');
      assert.notDeepEqual(xor(xor(plant, sourceKey),
        source.subarray(clock + 1, clock + 1 + encoded.length)), plant,
      'Wrong historical offset control must not recover planted text');
      results.push({
        transport, section: section.label, originalRunes: section.runes.length,
        sourceAbsoluteOffset: clock, keyBytes: encoded.length,
        result: inspect(decoded), plantedBytesRecovered: plant.length
      });
      clock += encoded.length;
    }
  }
  console.log(JSON.stringify({
    method: 'original 2013 DATA/560.13 absolute-offset XOR into LP2',
    status: 'experimental original-input test, no automatic plaintext claim',
    historicalOffset: HISTORIC_OFFSET,
    sourceSha256: ISO_SHA, originalOnionKnownControl: 'exact',
    finiteTransports: 2, finiteSections: 2,
    results
  }, null, 2));
}

if (require.main === module) run();
module.exports = { base29Bytes, recoverBase29, xor, inspect };
