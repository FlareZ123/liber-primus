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

/** @param {number[]} indices */
function packed5Bytes(indices) {
  const data = Buffer.alloc(Math.ceil(indices.length * 5 / 8));
  for (let i = 0; i < indices.length; i++) {
    const value = indices[i];
    assert.ok(Number.isInteger(value) && value >= 0 && value < 29);
    for (let b = 0; b < 5; b++) {
      const at = 5 * i + b;
      data[at >> 3] |= ((value >> (4 - b)) & 1) << (7 - (at & 7));
    }
  }
  return data;
}

/** @param {Buffer} data @param {number} count */
function readPacked5(data, count) {
  assert.equal(data.length, Math.ceil(count * 5 / 8));
  const indices = [];
  for (let i = 0; i < count; i++) {
    let value = 0;
    for (let b = 0; b < 5; b++) {
      const at = 5 * i + b;
      value = (value << 1) | ((data[at >> 3] >> (7 - (at & 7))) & 1);
    }
    assert.ok(value < 29);
    indices.push(value);
  }
  assert.deepEqual(packed5Bytes(indices), data,
    'Five-bit MSB packet and its terminal zero pad must round-trip exactly');
  return indices;
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

  for (const transport of ['rune-index-bytes', 'whole-section-base29-integer', 'native-fivebit-msb-packed']) {
    let clock = HISTORIC_OFFSET;
    for (const section of groups) {
      assert.equal(section.runes.length, section.expected);
      const encoded = transport === 'rune-index-bytes' ? Buffer.from(section.runes)
        : transport === 'native-fivebit-msb-packed' ? packed5Bytes(section.runes)
        : base29Bytes(section.runes);
      if (transport === 'whole-section-base29-integer') {
        assert.deepEqual(recoverBase29(encoded, section.expected), section.runes,
          'Whole-section BASE29 encoding must be exact and reversible');
      } else if (transport === 'native-fivebit-msb-packed') {
        assert.deepEqual(readPacked5(encoded, section.expected), section.runes);
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
  const originalGrid = JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/liber-primus/lp2-grid-256.json'), 'utf8')).bytes;
  const historic2014Table = JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/cicada2014-sexagesimal-source.json'), 'utf8')).decimal_values;
  assert.equal(originalGrid.length, 256);
  assert.equal(historic2014Table.length, 256);
  const originalGridBytes = Buffer.from(originalGrid);
  const historic2014Bytes = Buffer.from(historic2014Table);
  const tableKey = source.subarray(HISTORIC_OFFSET, HISTORIC_OFFSET + 256);
  const tableCases = [
    ['original-LP2-printed-p49-p51-256-bytes', originalGridBytes],
    ['2014-stage11-solver-256-byte-archive', historic2014Bytes]
  ];
  for (const [label, encoded] of tableCases) {
    const decoded = xor(encoded, tableKey);
    const control = Buffer.from('CICADA HISTORICAL SOURCE XOR TEST '.repeat(8));
    assert.equal(control.length, 272);
    assert.deepEqual(xor(xor(control.subarray(0, 256), tableKey), tableKey),
      control.subarray(0, 256));
    results.push({
      transport: 'fixed-256-byte-table-original-2013-XOR',
      section: label, sourceAbsoluteOffset: HISTORIC_OFFSET,
      keyBytes: 256, originalRunes: null, result: inspect(decoded),
      plantedBytesRecovered: 256
    });
  }
  assert.equal(Buffer.compare(originalGridBytes, historic2014Bytes) === 0, false);

  console.log(JSON.stringify({
    method: 'original 2013 DATA/560.13 absolute-offset XOR into LP2',
    status: 'experimental original-input test, no automatic plaintext claim',
    historicalOffset: HISTORIC_OFFSET,
    sourceSha256: ISO_SHA, originalOnionKnownControl: 'exact',
    finiteTransports: 3, finiteSections: 2,
    results
  }, null, 2));
}

if (require.main === module) run();
module.exports = { base29Bytes, recoverBase29, xor, inspect };
