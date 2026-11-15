'use strict';

/**
 * Strict original-image-audited small-full-stop BASE29 fixed-width byte gate.
 * Node.js 22 CommonJS; read-only; no external dependencies.
 *
 * Uses only the 138 source-audited four-dot diamond stops. The ambiguous
 * single-dot event (91), comma-form event (127), absent event (125), four
 * nonphysical p15 row entries (57..60), comma marks and large marks are not
 * treated as small-full-stop boundaries.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { isUtf8 } = require('node:buffer');

const root = path.resolve(__dirname, '..');
const load = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const punctuation = JSON.parse(load('resources/liber-primus/lp2-punctuation-identity.json'));
const parts = load('resources/liber-primus/lp2-transcription.txt').split(/\r?\n%\r?\n/);
assert.equal(parts.length, 57);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const source = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(source.length, 12956);
const transcribed = Array.from(parts.slice(0, -2).join('\n'))
  .filter(ch => runeIndex.has(ch))
  .map(ch => runeIndex.get(ch));
assert.deepEqual(transcribed, source, 'derivative transcription must match canonical GP29 rune order');

const audit = punctuation.source_audit;
assert.equal(audit.visible_all_marks_including_31_large, 175);
assert.equal(audit.visible_small_marks, 144);
assert.equal(audit.audited_scope.stops, 141);
assert.equal(audit.audited_scope.commas, 4);
assert.equal(audit.morphology.stop_four_dot_diamonds.count, 138);
assert.equal(audit.morphology.stop_four_dot_diamonds.black, 137);
assert.equal(audit.morphology.stop_four_dot_diamonds.red, 1);
assert.equal(audit.morphology.stop_single_dot_ambiguous, 1);
assert.equal(audit.morphology.stop_three_dot_comma_form, 1);
assert.equal(audit.morphology.stop_absent, 1);
assert.equal(audit.morphology.comma_three_dot_zigzags, 4);

const excluded = new Set([57, 58, 59, 60, 91, 125, 127]);
for (const index of [57, 58, 59, 60]) {
  const e = punctuation.events.find(x => x.index === index);
  assert.ok(e && e.page === 15 && e.local_rune_offset === 9);
  assert.equal(e.original_ink_event, false);
}
for (const [index, page, offset] of [[91, 27, 144], [125, 37, 91], [127, 38, 28]]) {
  const e = punctuation.events.find(x => x.index === index);
  assert.ok(e && e.page === page && e.local_rune_offset === offset);
}
const candidates = punctuation.events.filter(e => e.symbol === '⁘' && e.page <= 55);
assert.equal(candidates.length, 145);
const confirmed = candidates.filter(e => !excluded.has(e.index));
assert.equal(confirmed.length, 138);
const stopOffsets = confirmed.map(e => e.rune_offset).sort((a, b) => a - b);
assert.equal(new Set(stopOffsets).size, 138);
assert.equal(stopOffsets[0], 154);
assert.equal(stopOffsets.at(-1), 12597);

function fieldWidth(n) {
  const limit = 29n ** BigInt(n);
  let width = 0;
  let capacity = 1n;
  while (capacity < limit) {
    capacity *= 256n;
    width++;
  }
  return width;
}

function encodeField(digits) {
  let value = 0n;
  for (const d of digits) {
    assert.ok(Number.isInteger(d) && d >= 0 && d < 29);
    value = value * 29n + BigInt(d);
  }
  const out = Buffer.alloc(fieldWidth(digits.length));
  for (let i = out.length - 1; i >= 0; i--) {
    out[i] = Number(value & 255n);
    value >>= 8n;
  }
  assert.equal(value, 0n);
  return out;
}

function decodeField(bytes, runeCount) {
  let value = 0n;
  for (const byte of bytes) value = value * 256n + BigInt(byte);
  assert.ok(value < 29n ** BigInt(runeCount), 'field value must fit its original GP29 width');
  const out = Array(runeCount).fill(0);
  for (let i = runeCount - 1; i >= 0; i--) {
    out[i] = Number(value % 29n);
    value /= 29n;
  }
  assert.equal(value, 0n);
  return out;
}

function buildFrame(digits, offsets) {
  const boundaries = [0, ...offsets, digits.length];
  const spans = boundaries.slice(1).map((end, i) => ({
    start: boundaries[i],
    end,
    length: end - boundaries[i]
  }));
  assert.ok(spans.every(s => s.length > 0), 'all fields must be nonempty');
  const fields = spans.map(s => encodeField(digits.slice(s.start, s.end)));
  const bytes = Buffer.concat(fields);
  const firstWidth = fields[0].length;
  const maxFirstByte = Number(
    (29n ** BigInt(spans[0].length) - 1n) / (256n ** BigInt(firstWidth - 1))
  );
  return { spans, fields, bytes, firstWidth, maxFirstByte };
}

const signatures = [
  ['GZIP', [0x1f, 0x8b, 0x08]],
  ['ZIP', [0x50, 0x4b, 0x03, 0x04]],
  ['PDF', [0x25, 0x50, 0x44, 0x46, 0x2d]],
  ['PNG', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  ['JPEG', [0xff, 0xd8, 0xff]],
  ['BZIP2', [0x42, 0x5a, 0x68]],
  ['XZ', [0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00]],
  ['7z', [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]],
  ['RAR', [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]],
  ['ELF', [0x7f, 0x45, 0x4c, 0x46]],
  ['SQLite', [0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00]],
  ['ID3', [0x49, 0x44, 0x33]],
  ['OggS', [0x4f, 0x67, 0x67, 0x53]],
  ['RIFF', [0x52, 0x49, 0x46, 0x46]],
  ['HTML', [0x3c, 0x68, 0x74, 0x6d, 0x6c]],
  ['XML', [0x3c, 0x3f, 0x78, 0x6d, 0x6c]]
];

function inspect(frame) {
  const bytes = frame.bytes;
  const printable = bytes.filter(b =>
    (b >= 0x20 && b <= 0x7e) || b === 0x09 || b === 0x0a || b === 0x0d
  ).length / bytes.length;
  const magicAt0 = signatures
    .filter(([, sig]) => sig.every((byte, i) => bytes[i] === byte))
    .map(([name]) => name);
  return {
    byteLength: bytes.length,
    validUtf8: isUtf8(bytes),
    hasNul: bytes.includes(0),
    printableRatio: printable,
    magicAt0
  };
}

const primary = buildFrame(source, stopOffsets);
const primaryCheck = inspect(primary);
assert.equal(primary.spans.length, 139);
assert.equal(primary.spans.reduce((s, x) => s + x.length, 0), 12956);
assert.deepEqual(primary.spans.slice(0, 12).map(s => s.length),
  [154, 121, 22, 53, 44, 40, 97, 494, 21, 21, 44, 183]);
assert.equal(primary.spans.at(-1).length, 359);
assert.equal(primary.bytes.length, 7942);
assert.equal(primary.firstWidth, 94);
assert.equal(primary.maxFirstByte, 0x11);
assert.equal(primary.bytes[0], 0x09);
assert.equal(primaryCheck.validUtf8, false);
assert.equal(primaryCheck.hasNul, true);
assert.equal(primaryCheck.magicAt0.length, 0);
assert.ok(Math.abs(primaryCheck.printableRatio - 0.38013094938302694) < 1e-12);
assert.equal(primary.bytes.subarray(0, 64).toString('hex'),
  '093ad731c61e124f374d5b804210ad3f3b436793ff357dc6315de29c0ee2988d755e5f7fa381cd7c7424bf8751313d062413dada9aeb826cb60a8ce7d775fc8');

for (let i = 0; i < primary.spans.length; i++) {
  const s = primary.spans[i];
  assert.deepEqual(
    decodeField(primary.fields[i], s.length),
    source.slice(s.start, s.end),
    'original field round-trip ' + i
  );
}

// Same 139-field geometry, planted with authentic p57 GP runes cycled to length.
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
const plant = Array.from({ length: source.length }, (_, i) => p57[i % p57.length]);
const recoveredPlant = Array(source.length);
for (let i = 0; i < primary.spans.length; i++) {
  const s = primary.spans[i];
  const decoded = decodeField(
    encodeField(plant.slice(s.start, s.end)),
    s.length
  );
  decoded.forEach((d, j) => { recoveredPlant[s.start + j] = d; });
}
assert.deepEqual(recoveredPlant, plant);

// Independent field/detector positive control: a six-rune GP29 field carrying GZIP magic.
function base29Digits(value, n) {
  let v = value;
  const out = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    out[i] = Number(v % 29n);
    v /= 29n;
  }
  assert.equal(v, 0n);
  return out;
}
const gzipDigits = base29Digits(0x1f8b0800n, 6);
const gzipBytes = encodeField(gzipDigits);
assert.deepEqual([...gzipBytes], [0x1f, 0x8b, 0x08, 0x00]);
assert.deepEqual(decodeField(gzipBytes, 6), gzipDigits);

// Sensitivity: include the one source-audited ambiguous single-dot event.
const ambiguous = punctuation.events.find(e => e.index === 91);
const sensitivityOffsets = [...stopOffsets, ambiguous.rune_offset].sort((a, b) => a - b);
const sensitivity = buildFrame(source, sensitivityOffsets);
const sensitivityCheck = inspect(sensitivity);
assert.equal(sensitivity.spans.length, 140);
assert.equal(sensitivity.bytes.length, 7943);
assert.equal(sensitivityCheck.validUtf8, false);
assert.equal(sensitivityCheck.hasNul, true);
assert.equal(sensitivityCheck.magicAt0.length, 0);
assert.ok(Math.abs(sensitivityCheck.printableRatio - 0.38159385622560743) < 1e-12);
assert.ok(Math.abs(sensitivityCheck.printableRatio - 0.38159385622560743) < 1e-12);

console.log(JSON.stringify({
  source: {
    unknownRunes: source.length,
    confirmedFourDotDiamondStops: stopOffsets.length,
    excluded: {
      editorialP15Rows: [57, 58, 59, 60],
      ambiguousSingleDot: 91,
      absentSmallEvent: 125,
      commaFormTranscribedAsStop: 127,
      commaZigzags: 4,
      largeChapterSectionMarks: 31
    },
    firstStopOffset: stopOffsets[0],
    lastStopOffset: stopOffsets.at(-1),
    fields: primary.spans.length,
    firstFieldLengths: primary.spans.slice(0, 12).map(s => s.length),
    finalEofTail: primary.spans.at(-1).length
  },
  codec: {
    rule: 'minimal b with 256^b >= 29^n; big-endian positional integer',
    bytes: primaryCheck.byteLength,
    firstFieldWidth: primary.firstWidth,
    maxPossibleFirstByte: '0x' + primary.maxFirstByte.toString(16).padStart(2, '0'),
    actualFirst64Hex: primary.bytes.subarray(0, 64).toString('hex'),
    ...primaryCheck
  },
  positiveControls: {
    p57CyclicPlant: { sourceRunes: p57.length, exactRoundTrip: true },
    gzipField: {
      sixGp29Digits: gzipDigits,
      bytes: gzipBytes.toString('hex'),
      exactRoundTrip: true
    }
  },
  ambiguousSensitivity: {
    stops: sensitivityOffsets.length,
    fields: sensitivity.spans.length,
    ...sensitivityCheck
  },
  verdict: 'reject direct strict-small-full-stop BASE29 fixed-width byte-file/text transport; no plaintext or key'
}, null, 2));
