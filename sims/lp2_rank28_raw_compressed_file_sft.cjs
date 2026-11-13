'use strict';

/**
 * Direct binary-compression gate for two no-repeat GP28 readings of LP2.
 *
 * Source groups: full unknown book, nine original visual chapters,
 * 55 rune-bearing physical pages and 26 nonempty 13-dot intervals.
 * For each group and each of the 29 possible previous-rune seeds, read
 * sorted-exclusion and cyclic-exclusion ranks, preserving repeat positions
 * as zero-digit escapes. Decode the radix-28 integer as either minimal
 * or mathematically fixed-width big-endian bytes; try strict raw-DEFLATE,
 * zlib-wrapped DEFLATE and recognizable file-container headers.
 *
 * Run with Node.js 22:
 *   node sims/lp2_rank28_raw_compressed_file_sft.cjs
 *
 * This does not search keys, bit offsets, encryption, dictionary choices or
 * arbitrary reshufflings. It cannot exclude an encrypted, custom-compressed
 * or prefix-framed binary payload.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ROOT = path.resolve(__dirname, '..');
const load = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const annotations = load('resources/liber-primus/lp2-ink-annotations.json');
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const unknown = pages.flatMap(p => p.indices);

assert.equal(corpus.runes.length, 29);
assert.equal(unknown.length, 12956);
assert.equal(pages.length, 55);

const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];

const groups = [{name: 'book', runes: unknown}];
for (const [first, last] of chapters) {
  groups.push({
    name: 'chapter-' + first + '-' + last,
    runes: pages.filter(p => p.page >= first && p.page <= last)
      .flatMap(p => p.indices)
  });
}
for (const page of pages) groups.push({name: 'page-' + page.page, runes: page.indices});

const pageStarts = new Map();
let start = 0;
for (const page of corpus.pages) {
  pageStarts.set(page.page, start);
  if (page.page <= 55) start += page.indices.length;
}
assert.equal(start, unknown.length);

// Preserve two pairs of coincident historical markers: they form two
// empty intervals inside the 28 first-release-to-p55 source fragments.
const markerPositions = [];
for (const page of annotations.pages) {
  if (page.page > 55) continue;
  for (const [offset, dots] of page.large_punctuation || []) {
    if (dots === 13) markerPositions.push(pageStarts.get(page.page) + offset);
  }
}
markerPositions.sort((a, b) => a - b);
assert.equal(markerPositions.length, 28);
assert.equal(markerPositions.at(-1), unknown.length);
const breaks = [0, ...markerPositions];
let emptyIntervals = 0;
for (let i = 0; i + 1 < breaks.length; i++) {
  const segment = unknown.slice(breaks[i], breaks[i + 1]);
  if (!segment.length) {emptyIntervals++; continue;}
  groups.push({name: '13dot-' + i, runes: segment});
}
assert.equal(emptyIntervals, 2);
assert.equal(groups.length, 91);

function rank(previous, current, order) {
  if (previous === current) return null;
  if (order === 'sorted') return current - (current > previous ? 1 : 0);
  return (current - previous + 29) % 29 - 1;
}

/** @param {number[]} runes @param {'sorted'|'cyclic'} order */
function tailValue(runes, order) {
  let value = 0n;
  let count = 0;
  let escapes = 0;
  for (let i = 1; i < runes.length; i++) {
    const digit = rank(runes[i - 1], runes[i], order);
    if (digit === null) {escapes++; continue;}
    assert(digit >= 0 && digit < 28);
    value = 28n * value + BigInt(digit);
    count++;
  }
  return {value, count, escapes, power: 28n ** BigInt(count)};
}

function bytesFromInteger(value, digits, fixed) {
  let hex = value.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  if (fixed) {
    const length = Math.ceil(digits * Math.log2(28) / 8);
    hex = hex.padStart(length * 2, '0');
  }
  return Buffer.from(hex, 'hex');
}

function knownHeader(bytes) {
  const hex = bytes.subarray(0, 8).toString('hex');
  const specs = [
    ['gzip', '1f8b08'], ['zip', '504b0304'],
    ['xz', 'fd377a585a00'], ['png', '89504e470d0a1a0a'],
    ['pdf', '25504446'], ['rar', '526172211a07'],
    ['elf', '7f454c46'], ['riff', '52494646']
  ];
  const hit = specs.find(([name, signature]) => hex.startsWith(signature));
  if (hit) return hit[0];
  if (/^425a683[1-9]/.test(hex)) return 'bzip2';
  return null;
}

/** Attempt only historically plausible, native zlib decoders. */
function attempt(bytes, kind) {
  try {
    return kind === 'raw-deflate'
      ? zlib.inflateRawSync(bytes, {maxOutputLength: 1048576})
      : zlib.inflateSync(bytes, {maxOutputLength: 1048576});
  } catch (_) {
    // Wrong compression format is the expected outcome of a negative gate.
    return null;
  }
}
function printableFraction(bytes) {
  if (!bytes.length) return 0;
  let printable = 0;
  for (const byte of bytes)
    if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13)
      printable++;
  return printable / bytes.length;
}

const hits = [];
const counts = {
  units: groups.length, orders: 2, seeds: 29, widths: 2,
  byteCandidates: 0, headerHits: 0,
  rawDeflateValid: 0, zlibValid: 0,
  readableInflated: 0
};
const sources = [];
for (const group of groups) {
  for (const order of ['sorted', 'cyclic']) {
    const tail = tailValue(group.runes, order);
    for (let seed = 0; seed < 29; seed++) {
      const first = rank(seed, group.runes[0], order);
      const count = tail.count + Number(first !== null);
      const integer = first === null ? tail.value :
        BigInt(first) * tail.power + tail.value;
      for (const fixed of [false, true]) {
        const bytes = bytesFromInteger(integer, count, fixed);
        counts.byteCandidates++;
        const prefix = bytes.subarray(0, 12).toString('hex');
        if (group.name === 'book' && seed === 0 && !fixed)
          sources.push({group: group.name, order, runes: group.runes.length,
            digits: count, escapes: tail.escapes + Number(first === null),
            bytes: bytes.length, prefix});
        const common = {group: group.name, order, seed,
          width: fixed ? 'fixed' : 'minimal', bytes: bytes.length, prefix};
        const header = knownHeader(bytes);
        if (header) {
          counts.headerHits++;
          hits.push({...common, type: 'header', format: header});
        }
        if (bytes.length < 8) continue;
        for (const compression of ['raw-deflate', 'zlib']) {
          const inflated = attempt(bytes, compression);
          if (!inflated) continue;
          if (compression === 'raw-deflate') counts.rawDeflateValid++;
          else counts.zlibValid++;
          const printable = printableFraction(inflated);
          const readable = inflated.length >= 128 && printable >= 0.9;
          if (readable) counts.readableInflated++;
          hits.push({...common, type: compression,
            inflatedBytes: inflated.length,
            printableFraction: +printable.toFixed(6),
            readable, firstText: inflated.subarray(0, 160).toString('latin1')});
        }
      }
    }
  }
}
assert.equal(counts.byteCandidates, 10556);
assert.deepEqual(sources.map(s => s.prefix.slice(0, 24)), [
  '3398a7ff3137d5ad2c522077', '353c4725eead83d4c7d5bc4f'
]);

// Genuine original-English positive: roundtrip a headerless DEFLATE byte
// stream through each exact GP28 excluded-predecessor symbol encoder.
function ranksOf(bytes) {
  let n = BigInt('0x' + bytes.toString('hex'));
  const result = [];
  while (n > 0n) {
    result.push(Number(n % 28n));
    n /= 28n;
  }
  return result.reverse();
}
function emit(ranks, order, seed) {
  const result = [];
  let previous = seed;
  for (const digit of ranks) {
    let next;
    if (order === 'cyclic') next = (previous + 1 + digit) % 29;
    else {
      next = digit + (digit >= previous ? 1 : 0);
    }
    assert.equal(rank(previous, next, order), digit);
    result.push(next);
    previous = next;
  }
  return result;
}
function invert(stream, order, seed) {
  let value = 0n;
  let digits = 0;
  let previous = seed;
  for (const rune of stream) {
    const digit = rank(previous, rune, order);
    if (digit !== null) {value = 28n * value + BigInt(digit); digits++;}
    previous = rune;
  }
  return bytesFromInteger(value, digits, false);
}
const positivePlain = Buffer.from(
  ('SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE. ').repeat(8),
  'utf8');
const positiveCompressed = zlib.deflateRawSync(positivePlain);
const positiveRanks = ranksOf(positiveCompressed);
for (const order of ['sorted', 'cyclic']) {
  for (const seed of [0, 17, 28]) {
    const encoded = emit(positiveRanks, order, seed);
    const withEscape = [...encoded.slice(0, 8), encoded[7], ...encoded.slice(8)];
    assert.deepEqual(invert(encoded, order, seed), positiveCompressed);
    assert.deepEqual(invert(withEscape, order, seed), positiveCompressed);
    assert.deepEqual(zlib.inflateRawSync(invert(withEscape, order, seed)),
      positivePlain);
  }
}

console.log(JSON.stringify({
  title: 'LP2 no-repeat GP28 compressed binary source gate',
  counts, originalBookPrefixes: sources,
  positive: {plaintextBytes: positivePlain.length,
    compressedBytes: positiveCompressed.length,
    exactRecoveries: 6, escapeRoundtrips: 6},
  apparentInflateHits: hits.filter(hit => hit.type !== 'header').length,
  largestInflateHits: hits.filter(hit => hit.type !== 'header')
    .sort((a, b) => b.inflatedBytes - a.inflatedBytes)
    .slice(0, 8),
  fileHeaderHits: hits.filter(hit => hit.type === 'header').slice(0, 8),
  conclusion: counts.readableInflated
    ? 'Original candidate needs independent plaintext and integrity inspection.'
    : 'No readable direct raw-DEFLATE or zlib payload was recovered under this bounded source-native conversion.'
}, null, 2));
