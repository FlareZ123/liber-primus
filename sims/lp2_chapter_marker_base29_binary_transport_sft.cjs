'use strict';

/**
 * Reproducible original-cipher test: continuous BASE29 binary transport
 * over genuine illustrated chapters and 13-dot-delimited source spans.
 * Usage: node sims/lp2_chapter_marker_base29_binary_transport_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'resources', 'liber-primus');
const CHAPTER_PAGE_STARTS = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const HEADERS = [
  ['gzip', [0x1f, 0x8b, 0x08]],
  ['zip', [0x50, 0x4b, 0x03, 0x04]],
  ['png', [137, 80, 78, 71, 13, 10, 26, 10]],
  ['pdf', [37, 80, 68, 70]],
  ['elf', [127, 69, 76, 70]],
  ['pgp-armor', Array.from(Buffer.from('-----BEGIN PGP'))],
  ['bzip2', [66, 90, 104]],
  ['xz', [253, 55, 122, 88, 90, 0]],
  ['zlib-9c', [120, 156]],
  ['zlib-da', [120, 218]],
  ['zlib-01', [120, 1]],
  ['zstd', [40, 181, 47, 253]],
  ['7zip', [55, 122, 188, 175, 39, 28]],
  ['rar', [82, 97, 114, 33]],
  ['pe-mz', [77, 90]],
  ['ogg', [79, 103, 103, 83]]
];

/** @param {string} name */
function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
}

/** @param {number[]} digits @param {boolean} reverseRunes */
function runeInteger(digits, reverseRunes) {
  let value = 0n;
  const items = reverseRunes ? digits.slice().reverse() : digits;
  for (const digit of items) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    value = value * 29n + BigInt(digit);
  }
  return value;
}

/** @param {bigint} value */
function minimalBytes(value) {
  const hex = value.toString(16).padStart(2, '0');
  return Buffer.from(hex.length % 2 === 0 ? hex : '0' + hex, 'hex');
}

/**
 * Treat an entire original region as one unsigned integer in base29.
 * Its ordinary unsigned big-endian byte output has no hidden block size.
 * @param {number[]} digits
 * @param {boolean} reverseRunes
 * @param {boolean} reverseBytes
 * @param {boolean} fixedCapacity
 */
function decode(digits, reverseRunes, reverseBytes, fixedCapacity) {
  const value = runeInteger(digits, reverseRunes);
  let bytes = minimalBytes(value);
  if (fixedCapacity) {
    const capacity = Math.ceil(digits.length * Math.log2(29) / 8);
    assert(capacity >= bytes.length);
    bytes = Buffer.concat([Buffer.alloc(capacity - bytes.length), bytes]);
  }
  return reverseBytes ? Buffer.from(bytes).reverse() : bytes;
}

/**
 * Inverse retaining the exact source region's rune count.
 * @param {Buffer} encoded
 * @param {number} runeCount
 * @param {boolean} reverseRunes
 * @param {boolean} reverseBytes
 */
function reencode(encoded, runeCount, reverseRunes, reverseBytes) {
  const bytes = reverseBytes ? Buffer.from(encoded).reverse() : encoded;
  let value = BigInt('0x' + bytes.toString('hex'));
  const digits = Array(runeCount).fill(0);
  for (let i = runeCount - 1; i >= 0; --i) {
    digits[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n, 'Numeral did not fit its original digit length');
  return reverseRunes ? digits.reverse() : digits;
}

/** @param {Buffer} bytes */
function printableFraction(bytes) {
  let count = 0;
  for (const b of bytes) if ((b >= 32 && b < 127) || b === 9 || b === 10 || b === 13) ++count;
  return count / bytes.length;
}

/** @param {Buffer} bytes */
function typedHeaders(bytes) {
  return HEADERS.filter(([, prefix]) =>
    prefix.length <= bytes.length && prefix.every((v, i) => bytes[i] === v)
  ).map(([name]) => name);
}

/** @param {Buffer} bytes */
function isReadableUtf8(bytes) {
  if (bytes.length < 32 || printableFraction(bytes) < 0.8) return false;
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return true;
  } catch (err) {
    if (err instanceof TypeError) return false;
    throw err;
  }
}

/** @param {Buffer} bytes */
function entropyBits(bytes) {
  const histogram = Array(256).fill(0);
  for (const b of bytes) ++histogram[b];
  let entropy = 0;
  for (const n of histogram) if (n) {
    const p = n / bytes.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/** @param {number[]} sourceDigits */
function controlRoundtrip(sourceDigits) {
  for (const r of [false, true]) for (const b of [false, true]) for (const f of [false, true]) {
    const decoded = decode(sourceDigits, r, b, f);
    assert.deepEqual(reencode(decoded, sourceDigits.length, r, b), sourceDigits);
  }
}

/** @param {Buffer} bytes */
function bytesToDigits(bytes) {
  let n = BigInt('0x' + bytes.toString('hex'));
  const digits = [];
  do {
    digits.unshift(Number(n % 29n));
    n /= 29n;
  } while (n);
  return digits;
}

function main() {
  const corpus = readJson('lp2-corpus.json');
  const ink = readJson('lp2-ink-annotations.json');
  const source = [];
  const first = new Map();
  for (let page = 0; page <= 55; ++page) {
    const record = corpus.pages.find(x => x.page === page);
    assert(record, 'Missing physical LP2 source page ' + page);
    first.set(page, source.length);
    source.push(...record.indices);
  }
  assert.equal(source.length, 12956);

  const chapterEnds = CHAPTER_PAGE_STARTS.map(p => p === 56 ? source.length : first.get(p));
  const chapters = chapterEnds.slice(0, -1).map((start, i) => ({
    kind: 'chapter', id: i, start, end: chapterEnds[i + 1]
  }));
  const marks = [0, source.length];
  for (const annotation of ink.pages) if (annotation.page <= 55) {
    for (const [local, dots] of annotation.large_punctuation || []) if (dots === 13) {
      marks.push(first.get(annotation.page) + local);
    }
  }
  const boundaries = Array.from(new Set(marks)).sort((a, b) => a - b);
  const marked = boundaries.slice(0, -1).map((start, i) => ({
    kind: '13dot', id: i, start, end: boundaries[i + 1]
  })).filter(x => x.end > x.start);
  assert.equal(chapters.length, 9);
  assert.equal(marked.length, 26);

  // Independently documented 2013 example: 3301 -> "3QO" in 0..9,A..S base29.
  assert.deepEqual(bytesToDigits(Buffer.from([0x0c, 0xe5])), [3, 26, 24]);
  // A known plaintext payload can genuinely survive the exact integer transport.
  const planted = Buffer.from('PARABLE: THE PRIMES ARE SACRED', 'utf8');
  const transported = [0, 0, ...bytesToDigits(planted)];
  assert.deepEqual(decode(transported, false, false, false), planted);
  for (const p of [56, 57]) {
    const actual = corpus.pages.find(x => x.page === p);
    assert(actual);
    controlRoundtrip(actual.indices);
  }
  console.log('POSITIVE CONTROLS PASS: 2013 BASE29, planted UTF-8, solved p56/p57 source rune replay');

  const regions = [{ kind: 'whole', id: 0, start: 0, end: source.length }, ...chapters, ...marked];
  const rows = [];
  for (const region of regions) {
    const digits = source.slice(region.start, region.end);
    controlRoundtrip(digits);
    for (const reverseRunes of [false, true])
      for (const reverseBytes of [false, true])
        for (const fixedCapacity of [false, true]) {
          const bytes = decode(digits, reverseRunes, reverseBytes, fixedCapacity);
          rows.push({
            region, runes: digits.length, bytes: bytes.length,
            mode: (reverseRunes ? 'reverse-runes' : 'forward-runes') + '/' +
                  (reverseBytes ? 'reverse-bytes' : 'forward-bytes') + '/' +
                  (fixedCapacity ? 'fixed-capacity' : 'minimal'),
            headHex: bytes.subarray(0, 16).toString('hex'),
            printable: printableFraction(bytes),
            entropy: entropyBits(bytes),
            headers: typedHeaders(bytes),
            readable: isReadableUtf8(bytes)
          });
        }
  }

  for (const kind of ['whole', 'chapter', '13dot']) {
    const subset = rows.filter(x => x.region.kind === kind);
    console.log('\n' + kind.toUpperCase() + ': ' + subset.length / 8 +
      ' exact original regions; ' + subset.length + ' canonical decodes');
    for (const row of subset.filter(x => x.mode === 'forward-runes/forward-bytes/minimal')) {
      console.log(JSON.stringify({
        id: row.region.id, start: row.region.start, end: row.region.end,
        runes: row.runes, bytes: row.bytes, headHex: row.headHex,
        printable: +row.printable.toFixed(4), entropy: +row.entropy.toFixed(4)
      }));
    }
  }
  const significant = rows.filter(x => x.bytes >= 16);
  const hits = significant.filter(x => x.headers.length || x.readable);
  const top = rows.filter(x => x.bytes >= 32).sort((a, b) => b.printable - a.printable).slice(0, 6);
  console.log('\nMAX PRINTABLE-RATIO (>=32 bytes):');
  for (const x of top) console.log(JSON.stringify({
    kind: x.region.kind, id: x.region.id, mode: x.mode,
    bytes: x.bytes, printable: +x.printable.toFixed(4),
    entropy: +x.entropy.toFixed(4), headHex: x.headHex
  }));
  console.log('TYPED HEADER OR READABLE UTF-8 MATCHES:', hits.length);
  for (const x of hits) console.log('CANDIDATE', JSON.stringify(x));

  assert.equal(rows.length, (1 + 9 + 26) * 8);
  assert.equal(hits.length, 0, 'Original input has a possible typed binary payload; inspect before proceeding');
  console.log('\nPASS: no direct unkeyed standard-file or plaintext transport in the declared original frames');
}

main();
