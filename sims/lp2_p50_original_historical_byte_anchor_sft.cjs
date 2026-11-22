'use strict';
/**
 * Issue #411: exact p50 8..32-byte match vs source-verified 2012-2014 bytes.
 * Run: node sims/lp2_p50_original_historical_byte_anchor_sft.cjs
 * A significant match must predict withheld adjacent source bytes; a random
 * correlated pad or derived secret is outside this narrowly source-led gate.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(root, file));
/** @param {Buffer} raw */
const hash = (raw) => crypto.createHash('sha256').update(raw).digest('hex');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json').toString('utf8'));
const table = Buffer.from(grid.bytes);
assert.equal(table.length, 256);
assert.equal(hash(table),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

/** Exact original Twitter hexdump reconstructs 64,167 bytes by indexed offsets.
 * @param {string} data
 * @returns {Buffer}
 */
function twitterBytes(data) {
  const lines = data.trim().split(/\r?\n/);
  assert.equal(lines.length, 988);
  const bytes = Buffer.alloc(64167);
  const occupied = new Uint8Array(bytes.length);
  for (const line of lines) {
    const hit = /^([0-9a-f]+): ([0-9a-f]+)$/i.exec(line);
    assert.ok(hit, 'historical Twitter offset/hex');
    const off = parseInt(hit[1], 16);
    const part = Buffer.from(hit[2], 'hex');
    assert.ok(off + part.length <= bytes.length);
    for (let i = 0; i < part.length; i++) {
      assert.equal(occupied[off + i], 0, 'unique historic byte offset');
      occupied[off + i] = 1;
      bytes[off + i] = part[i];
    }
  }
  assert.ok(occupied.every(Boolean), 'complete reconstructed source byte stream');
  return bytes;
}

/** @param {Buffer} b */
const reversed = (b) => Buffer.from(b).reverse();
/** @param {Buffer} b @param {string} order */
function serialize(b, order) {
  if (order === 'row') return Buffer.from(b);
  if (order === 'column') {
    return Buffer.from(Array.from({length: 256}, (_, i) =>
      b[(i % 32) * 8 + Math.floor(i / 32)]));
  }
  if (order === 'row-boustro') {
    return Buffer.from(Array.from({length: 256}, (_, i) => {
      const row = Math.floor(i / 8), col = i % 8;
      return b[row * 8 + (row % 2 ? 7 - col : col)];
    }));
  }
  if (order === 'column-boustro') {
    return Buffer.from(Array.from({length: 256}, (_, i) => {
      const col = Math.floor(i / 32), row = i % 32;
      return b[(col % 2 ? 31 - row : row) * 8 + col];
    }));
  }
  throw Error('unknown source table orientation');
}
const traversals = {};
for (const orientation of ['row', 'column', 'row-boustro', 'column-boustro']) {
  const seq = serialize(table, orientation);
  traversals[orientation] = seq;
  traversals[orientation + '-reverse'] = reversed(seq);
}
const files = new Map();
files.set('2013-Twitter-indexed-64167', twitterBytes(
  read('resources/cicada2013-twitter-hex-stream.txt').toString('utf8')));
files.set('2013-wisdom-folly-payload',
  read('resources/cicada2013-wisdom-folly.bin'));
const outguess = JSON.parse(read('resources/cicada2014-outguess-hex.json').toString('utf8'));
assert.equal(outguess.sources.length, 3);
for (const [i, src] of outguess.sources.entries()) {
  const value = Buffer.from(src.hex, 'hex');
  assert.equal(value.length, 991);
  files.set('2014-OutGuess-original-0' + i, value);
}
const stage04Sft = read('sims/lp2_stage04_256_direct_identity_sft.cjs').toString('utf8');
const stage04Match = /const stage04Hex = '([0-9a-f]{512})';/.exec(stage04Sft);
assert.ok(stage04Match, 'literal pinned historical Stage04 256-byte source');
const historicalStage04 = Buffer.from(stage04Match[1], 'hex');
assert.equal(hash(historicalStage04),
  'd8c0f83cf91d0deda658035e3eb07712b12e72b36ed0e471a71a2fe07dd14ba6');
files.set('2014-authentic-Stage04-256byte-pre-object', historicalStage04);
for (const file of [
  'resources/external/derived/2014-stage04/03-outguess.asc',
  'resources/external/derived/2014-stage04/03-small-rune-image.jpg',
  'resources/external/derived/2014-stage04/04-outguess.bin',
  'resources/external/derived/2014-stage04/05-square.txt',
  'resources/external/2014-stage04-index.html',
]) files.set(file, read(file));
const signatures = [
  'resources/historical/cicada2012-countdown-message.asc',
  'resources/historical/cicada2013-first-onion-hello.asc',
  'resources/historical/cicada2013-forest-clue.asc',
  'resources/historical/cicada2013-second-onion-everything-you-need.asc',
  'resources/historical/cicada2013-second-onion-icmp-echo.asc',
  'resources/historical/cicada2014-stage11-message.asc',
];
for (const file of signatures) files.set(file, read(file));
// The first 17 archive images are the original 2014 LP1 source. These include
// the four Stage5 tablet JPEGs at exact original SHA identities 06..09.
const lp1 = Array.from({length: 17}, (_, i) =>
  read('resources/liber-primus/' + String(i).padStart(2, '0') + '.jpg'));
for (let i = 0; i < 17; i++) {
  files.set('2014-pre-LP2-JPEG-' + String(i).padStart(2, '0'), lp1[i]);
}
// Rebuild the original 2014 Stage5 gzip-expanded byte stream using the exact
// four authentic JPEGs and the documented reverse-tail source operation.
const stage5 = Buffer.concat([
  lp1[6], lp1[7], reversed(Buffer.concat([lp1[8], lp1[9]]))]);
assert.equal(stage5.length, 3010703);
assert.equal(hash(stage5),
  '8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a');
files.set('2014-Stage5-gzip-expanded-source', stage5);

/** @param {string} name @param {Buffer} source @param {object[]} hits */
function scan(name, source, hits) {
  for (const [orientation, key] of Object.entries(traversals)) {
    for (let tableAt = 0; tableAt <= 256 - 8; tableAt += 8) {
      const anchor = key.subarray(tableAt, tableAt + 8);
      for (let sourceAt = source.indexOf(anchor); sourceAt !== -1;
        sourceAt = source.indexOf(anchor, sourceAt + 1)) {
        let forward = 8, backward = 0;
        while (tableAt + forward < 256 && sourceAt + forward < source.length
          && key[tableAt + forward] === source[sourceAt + forward]) forward++;
        while (tableAt > backward && sourceAt > backward
          && key[tableAt - backward - 1] === source[sourceAt - backward - 1]) backward++;
        hits.push({name, orientation, tableAt, sourceAt,
          matchedPrefixBytes: forward, contiguousSpanBytes: forward + backward,
          withheldNext8: forward >= 16, withheldNext24: forward >= 32});
      }
    }
  }
}
const hits = [];
const inventory = [];
let testedBytes = 0;
for (const [name, value] of files) {
  assert.ok(value.length >= 8);
  inventory.push({name, bytes: value.length, sha256: hash(value)});
  testedBytes += value.length;
  scan(name, value, hits);
}
// A cloned authentic source with an independently planted table row proves
// that exact source matches and withheld next 24 bytes are detected.
const plant = Buffer.concat([Buffer.alloc(37, 0xa6), traversals.row.subarray(0, 32),
  Buffer.alloc(43, 0x57)]);
const detected = [];
scan('planted-32byte-row', plant, detected);
assert.ok(detected.some(h => h.orientation === 'row' && h.tableAt === 0
  && h.sourceAt === 37 && h.matchedPrefixBytes >= 32 && h.withheldNext24));
console.log(JSON.stringify({
  classification: 'Finite historical exact-byte source-reuse test; no LP2 plaintext or key',
  p50SHA256: hash(table),
  sourceCount: inventory.length, totalSourceBytes: testedBytes,
  sourceArtifacts: inventory, tableTraversals: Object.keys(traversals),
  anchorBytes: 8, sourceAnchorPositionsPerTraversal: 32,
  originalMatches: hits,
  plant: {byteExact32: true, sourceStart: 37, originalSpan: 32,
    withheldFollowing24BytesRecovered: true},
  boundary: 'Literal printed 8-byte row anchors in 8 source traversals, on actual 2012-14 source bytes only; no inferred hidden KDF, unknown permutation, or pairwise-pad search'
}, null, 2));
