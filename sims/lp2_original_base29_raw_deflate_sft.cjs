'use strict';

/**
 * Original LP2 direct positional-GP29 to raw RFC1951 DEFLATE gate.
 *
 * The signed 2013 Cicada BASE29 operation motivates positional radix29,
 * and historic OpenPGP ZIP compression motivates RFC1951 without a
 * GZIP/ZLIB wrapper. No key, transform, offset or language model is fitted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const zlib = require('node:zlib');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const original = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const allDigits = original.flatMap(p => p.indices);
assert.equal(original.length, 55);
assert.equal(allDigits.length, 12956);
assert.equal(corpus.pages.find(p => p.page === 50).indices.length, 0);

function digitsAsInteger(digits) {
  let n = 0n;
  for (const x of digits) {
    assert(Number.isInteger(x) && x >= 0 && x <= 28);
    n = 29n * n + BigInt(x);
  }
  return n;
}

/** Encode GP29 digits as byte-zero positional big endian, retaining optional width. */
function toBytes(digits, fixed) {
  const n = digitsAsInteger(digits);
  let h = n.toString(16);
  if (h.length % 2 !== 0) h = '0' + h;
  const width = fixed ? Math.ceil(digits.length * Math.log2(29) / 8) : 0;
  if (fixed) h = h.padStart(width * 2, '0');
  return Buffer.from(h, 'hex');
}

/** Decode a byte buffer into minimal positional GP29 digits for a genuine plant. */
function fromBytes(bytes) {
  let n = BigInt('0x' + bytes.toString('hex'));
  if (n === 0n) return [0];
  const digits = [];
  while (n > 0n) {
    digits.push(Number(n % 29n));
    n /= 29n;
  }
  return digits.reverse();
}

const solved = corpus.pages.find(p => p.page === 57).indices
  .map(x => corpus.translit[x]).join('');
assert.equal(corpus.pages.find(p => p.page === 57).indices.length, 95);
const message = Buffer.from(solved + ' ' + solved + ' ' + solved, 'utf8');
const compressed = zlib.deflateRawSync(message);
assert.deepEqual(toBytes(fromBytes(compressed), false), compressed);
const clear = zlib.inflateRawSync(toBytes(fromBytes(compressed), false),
  { info: true, maxOutputLength: 1048576 });
assert.deepEqual(clear.buffer, message);
assert.equal(clear.engine.bytesWritten, compressed.length);
const pgpZip = Buffer.concat([Buffer.from([1]), compressed]);
const pgpBody = toBytes(fromBytes(pgpZip), false);
assert.deepEqual(pgpBody, pgpZip);
assert.deepEqual(zlib.inflateRawSync(pgpBody.subarray(1)), message);
const withTail = Buffer.concat([compressed, Buffer.from('unselected-extra')]);
const tail = zlib.inflateRawSync(withTail, { info: true });
assert.equal(tail.engine.bytesWritten, compressed.length);
assert(tail.engine.bytesWritten < withTail.length);
console.log('POSITIVE: original solved p57 text recovered via strict raw RFC1951 and OpenPGP ZIP-body carriers; junk tails discriminated');

const units = [{ label: 'whole-book', digits: allDigits }];
for (const [a, b] of chapters) {
  const digits = original.filter(p => p.page >= a && p.page <= b)
    .flatMap(p => p.indices);
  units.push({ label: 'chapter-' + a + '-' + b, digits });
}
for (const p of original) units.push({ label: 'page-' + p.page, digits: p.indices });
assert.equal(units.length, 65);
assert.deepEqual(units.slice(1, 10).map(u => u.digits.length),
  [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);

let candidates = 0;
let validRaw = 0;
let validPGPBody = 0;
let bestReadable = 0;
const hits = [];
function printableFraction(data) {
  if (!data.length) return 0;
  let n = 0;
  for (const c of data) {
    if ((c >= 32 && c <= 126) || c === 9 || c === 10 || c === 13) n++;
  }
  return n / data.length;
}
/**
 * Try exact offset-zero input only. Parsing success alone does not
 * identify a meaningful message; require consuming the entire carrier.
 */
function check(data, unit, width, kind) {
  let out;
  try {
    out = zlib.inflateRawSync(data, {
      info: true, maxOutputLength: 1048576
    });
  } catch (e) {
    // Random byte streams routinely have invalid RFC1951 structures.
    if (e.code === 'Z_DATA_ERROR' || e.code === 'ERR_BUFFER_TOO_LARGE'
      || e.code === 'Z_BUF_ERROR') return;
    throw e;
  }
  const consumed = out.engine.bytesWritten;
  const complete = consumed === data.length;
  const fraction = printableFraction(out.buffer);
  if (complete) {
    if (kind === 'raw') validRaw++;
    else validPGPBody++;
  }
  bestReadable = Math.max(bestReadable, out.buffer.length >= 32 ? fraction : 0);
  hits.push({ unit, width, kind, compressedBytes: data.length, consumed,
    complete, decodedBytes: out.buffer.length, printable: Number(fraction.toFixed(4)),
    hexPrefix: out.buffer.subarray(0, 32).toString('hex'),
    textPrefix: out.buffer.subarray(0, 80).toString('utf8') });
}
for (const unit of units) {
  const candidatesForUnit = new Set();
  for (const [width, fixed] of [['fixed', true], ['minimal', false]]) {
    const data = toBytes(unit.digits, fixed);
    if (candidatesForUnit.has(data.toString('hex'))) continue;
    candidatesForUnit.add(data.toString('hex'));
    candidates++;
    check(data, unit.label, width, 'raw');
    if (data[0] === 1) {
      check(data.subarray(1), unit.label, width, 'openpgp-zip-alg1');
    }
  }
}
const coherent = hits.filter(h => h.complete && h.decodedBytes >= 32 && h.printable >= .8);
console.log('SOURCE ORIGINAL:', allDigits.length, 'runes, 65 framed objects,', candidates,
  'unique-within-object GP29 byte representations');
console.log('COMPLETE DIRECT RAW RFC1951:', validRaw);
console.log('COMPLETE OPENPGP ZIP ALGORITHM1 BODIES:', validPGPBody);
console.log('MAX PRINTABLE FRACTION (>=32 bytes, including incomplete parses):',
  bestReadable.toFixed(4));
console.log('PARSES (including incomplete and empty):', JSON.stringify(hits, null, 2));
console.log('COHERENT COMPLETE PAYLOADS:', JSON.stringify(coherent, null, 2));
if (coherent.length > 0) {
  console.log('ALERT: inspect coherent direct original-source payload in the output');
}
console.log('PASS: all original GP29 source input scanned with strict complete-consumption gating and genuine solved-page plants');
