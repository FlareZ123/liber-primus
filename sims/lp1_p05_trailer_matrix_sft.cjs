'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function assert(ok, message) { if (!ok) throw new Error(message); }
function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }

// Return the byte offset immediately after the first JPEG EOI marker.
// Handles stuffed FF00 bytes, restart markers, and markers between scans.
function jpegEoiEnd(buf) {
  assert(buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8, 'missing JPEG SOI');
  let i = 2;
  while (i < buf.length) {
    assert(buf[i] === 0xff, 'expected JPEG marker at ' + i);
    while (i < buf.length && buf[i] === 0xff) i++;
    assert(i < buf.length, 'truncated marker');
    const marker = buf[i++];
    if (marker === 0xd9) return i;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    assert(i + 2 <= buf.length, 'truncated segment length');
    const len = buf.readUInt16BE(i);
    assert(len >= 2 && i + len <= buf.length, 'bad segment length for FF' + marker.toString(16));
    if (marker !== 0xda) { i += len; continue; }
    i += len;
    // Entropy-coded scan: FF00 is a stuffed data byte; D0-D7 are restart markers.
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      let j = i + 1;
      while (j < buf.length && buf[j] === 0xff) j++;
      assert(j < buf.length, 'truncated entropy marker');
      const next = buf[j];
      if (next === 0x00 || (next >= 0xd0 && next <= 0xd7)) { i = j + 1; continue; }
      if (next === 0xd9) return j + 1;
      // Another marker (e.g. DHT) begins here; let the outer parser handle it.
      break;
    }
  }
  throw new Error('JPEG EOI not found');
}

function parseHexRows(payload) {
  const starts = [];
  for (let i = 0; i < payload.length; i++) if (payload[i] === 0xa0) starts.push(i);
  assert(JSON.stringify(starts) === JSON.stringify([0, 36, 72, 108, 143]), 'unexpected row markers: ' + starts);
  const rows = [];
  for (let r = 0; r < 5; r++) {
    const start = starts[r] + 1;
    const end = r === 4 ? payload.length : starts[r + 1];
    const chunk = payload.subarray(start, end);
    const candidates = [];
    // Each row has five 3-byte cells and four 0x02 padding runs. Exactly one
    // row has one padding byte missing; infer which gap from the bytes.
    const shortGaps = chunk.length === 34 ? [0, 1, 2, 3] : [-1];
    for (const shortGap of shortGaps) {
      const cells = [];
      const gaps = [];
      let pos = 0;
      for (let c = 0; c < 5; c++) {
        if (pos + 3 > chunk.length) break;
        cells.push(Array.from(chunk.subarray(pos, pos + 3)));
        pos += 3;
        if (c < 4) {
          const gapLen = c === shortGap ? 4 : 5;
          gaps.push(Array.from(chunk.subarray(pos, pos + gapLen)));
          pos += gapLen;
        }
      }
      if (pos === chunk.length && cells.length === 5 && gaps.every(g => g.length > 0 && g.every(x => x === 0x02))) {
        candidates.push({ cells, gaps, shortGap });
      }
    }
    assert(candidates.length === 1, 'row ' + r + ': expected one parse, got ' + candidates.length);
    rows.push(candidates[0]);
  }
  return rows;
}

function phi(n) {
  let x = n, result = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x = Math.floor(x / p);
      result -= Math.floor(result / p);
    }
  }
  if (x > 1) result -= Math.floor(result / x);
  return result;
}
function mod(x, m) { return ((x % m) + m) % m; }
function inv(a, m) {
  let [t, newT, r, newR] = [0, 1, m, mod(a, m)];
  while (newR !== 0) {
    const q = Math.floor(r / newR);
    [t, newT] = [newT, t - q * newT];
    [r, newR] = [newR, r - q * newR];
  }
  assert(r === 1, 'non-invertible key ' + a + ' mod ' + m);
  return mod(t, m);
}
function render(indices, alphabet) { return indices.map(i => alphabet[i]).join(''); }

const root = path.resolve(__dirname, '..');
const imagePath = path.join(root, 'resources', 'liber-primus', '05.jpg');
const corpusPath = path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json');
const file = fs.readFileSync(imagePath);
const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
const eoiEnd = jpegEoiEnd(file);
const image = file.subarray(0, eoiEnd);
const trailer = file.subarray(eoiEnd);
assert(trailer.length === 336713, 'unexpected trailer length ' + trailer.length);
assert(trailer.length === 360 + image.length, 'trailer is not 360-byte header plus image-length payload');
const reversed = Buffer.from(trailer.subarray(360)).reverse();
assert(reversed.equals(image), 'trailer payload is not the byte-reversal of the first JPEG');

const header = trailer.subarray(0, 360);
assert(header[0] === 0x0a && header[1] === 0x0a, 'header does not begin LF LF');
const hexText = header.subarray(2).toString('ascii');
assert(/^[0-9a-f]+$/i.test(hexText) && hexText.length === 358, 'header is not 358 hexadecimal characters');
const payload = Buffer.from(hexText, 'hex');
assert(payload.length === 179, 'decoded header length ' + payload.length);
const parsedRows = parseHexRows(payload);
const cells = parsedRows.map(row => row.cells);
const cellInts = cells.map(row => row.map(cell => cell[0] * 65536 + cell[1] * 256 + cell[2]));
const cellHex = cells.map(row => row.map(cell => Buffer.from(cell).toString('hex').toUpperCase()));

// Visually transcribed from the 5x5 square printed on the same page.
const magic = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272],
];
assert(magic.every(row => row.reduce((a, b) => a + b, 0) === 1033), 'visible square row sum is not 1033');
const conflicts = new Map();
for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
  const k = magic[r][c], v = cellHex[r][c];
  if (!conflicts.has(k)) conflicts.set(k, new Set());
  conflicts.get(k).add(v);
}
const nonFunctional = [...conflicts.entries()].filter(([, values]) => values.size > 1)
  .map(([value, values]) => ({ magic_value: value, rgb_values: [...values] }));
assert(nonFunctional.length === 1 && nonFunctional[0].magic_value === 18, 'unexpected magic-value to RGB mapping conflicts');
assert(nonFunctional[0].rgb_values.includes('028313') && nonFunctional[0].rgb_values.includes('831302'), '18-cell twist changed');
const rotationalMismatches = [];
for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
  const rr = 4 - r, cc = 4 - c;
  if (r * 5 + c < rr * 5 + cc && cellHex[r][c] !== cellHex[rr][cc]) {
    rotationalMismatches.push({ a: [r, c], b: [rr, cc], value_a: cellHex[r][c], value_b: cellHex[rr][cc] });
  }
}
assert(rotationalMismatches.length === 1 && rotationalMismatches[0].a.join(',') === '1,4' && rotationalMismatches[0].b.join(',') === '3,0', 'unexpected 180-degree symmetry break');
const twistA = cells[1][4], twistB = cells[3][0];
assert(twistB[0] === twistA[1] && twistB[1] === twistA[2] && twistB[2] === twistA[0], '18-cell triplets are not a one-step cyclic rotation');
assert(parsedRows[3].shortGap === 0, 'short 0x02 separator is not after row 4, cell 1');

// Direct, clue-constrained first check: one RGB channel byte per p55 rune, mod 29.
const p55 = corpus.pages.find(p => p.page === 55);
assert(p55 && p55.runic_count === 76 && p55.indices.length === 76, 'canonical p55 corpus shape changed');
const p55Body = p55.indices.slice(1); // first rune is the p54 carry, not p55 body
assert(p55Body.length === 75 && p55Body.length === 25 * 3, 'p55 body is not 25 three-rune blocks');
const flatBytes = cells.flat(2);
const rawKey = flatBytes.map(x => x % 29);
const phiKey = flatBytes.map(x => phi(x) % 29);
function streamResult(key, op) {
  const out = p55Body.map((c, i) => {
    const k = key[i];
    if (op === 'subtract') return mod(c - k, 29);
    if (op === 'add') return mod(c + k, 29);
    if (op === 'multiply') return mod(c * k, 29);
    if (op === 'divide') return mod(c * inv(k, 29), 29);
    throw new Error('unknown operation ' + op);
  });
  return { indices: out, transliteration: render(out, corpus.translit) };
}
const streamTests = {};
for (const [name, key] of [['raw_rgb_mod29', rawKey], ['phi_each_rgb_byte_mod29', phiKey]]) {
  for (const op of ['subtract', 'add', 'multiply', 'divide']) streamTests[name + '_' + op] = streamResult(key, op);
}

const result = {
  file: 'resources/liber-primus/05.jpg',
  file_bytes: file.length,
  file_sha256: sha256(file),
  first_jpeg_eoi_end: eoiEnd,
  trailer_bytes: trailer.length,
  trailer_sha256: sha256(trailer),
  exact_layout: 'JPEG || (LF LF || 358 hex chars) || reverse(JPEG)',
  reverse_payload_equals_first_jpeg: reversed.equals(image),
  header_hex_characters: hexText.length,
  decoded_header_bytes: payload.length,
  decoded_header_sha256: sha256(payload),
  row_markers: [0, 36, 72, 108, 143],
  row_lengths_after_marker: parsedRows.map(row => row.cells.length * 3 + row.gaps.reduce((n, g) => n + g.length, 0)),
  short_gap: { row_zero_based: 3, after_cell_zero_based: 0, bytes: 4, expected_bytes: 5 },
  rgb_triplets_hex: cellHex,
  rgb24_values: cellInts,
  visible_square: magic,
  visible_square_row_sums: magic.map(row => row.reduce((a, b) => a + b, 0)),
  magic_to_rgb_conflicts: nonFunctional,
  '180_degree_rgb_mismatches': rotationalMismatches,
  cyclic_rotation_at_mismatch: { from: twistA, to: twistB },
  p55_body_runes: p55Body.length,
  p55_three_rune_blocks: p55Body.length / 3,
  direct_stream_tests: streamTests,
};
console.log(JSON.stringify(result, null, 2));
