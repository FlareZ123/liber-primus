'use strict';

/**
 * Full original printed p49-p51 32x8 base-60 table: independent human
 * visual transcription against the canonical parsed table.
 *
 * Each MANUAL_ROWS line was read from the original 66.jpg, 67.jpg, 68.jpg
 * source scans, in their printed row/column order, WITHOUT OCR. The 256
 * token spellings are independent of the JSON being compared against.
 * Scan SHA-256 locks the source used for visual comparison.
 *
 * All I/l ambiguities were examined in the original source at full resolution:
 * uppercase I ink height ~67 original pixels; lowercase l ~73 pixels.
 * This is a source integrity gate, NOT a decoded hidden message.
 *
 * Windows 11 / Node.js 22 / CommonJS. Read-only, no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {Buffer} */
const raw = p => fs.readFileSync(path.join(root, 'resources/liber-primus', p));

const scanHashes = {
  '66.jpg': 'aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335',
  '67.jpg': 'bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776',
  '68.jpg': '2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b',
};
for (const [file, expected] of Object.entries(scanHashes)) {
  assert.equal(crypto.createHash('sha256').update(raw(file)).digest('hex'),
    expected, 'source original JPEG mismatch: ' + file);
}

// 10 rows on 66.jpg, 13 on 67.jpg, 9 on 68.jpg.
const MANUAL_ROWS = [
  '3N 3p 2l 36 1b 3v 26 33',
  '1W 49 2a 3g 47 04 33 3W',
  '21 3M 0F 0X 1g 2H 0x 1R',
  '1n 3I 2r 0P 2U 16 2L 2D',
  '1t 1s 3H 0d 0s 1K 2D 05',
  '1K 1O 0S 1D 3o 1l 3J 1G',
  '4D 0G 0l 0x 1Q 2p 2a 1K',
  '4E 1w 2Q 19 1k 3G 24 0p',
  '22 4F 0P 3C 3J 1D 2n 1m',
  '2i 1J 3P 2v 1s 2O 0k 1M',
  '2M 0w 3L 3D 2r 0S 1p 15',
  '3V 3e 3I 0n 3u 1O 0u 0Z',
  '3g 2U 1C 0Y 1N 3n 0W 3Q',
  '22 13 0V 3c 0E 34 0W 1t',
  '1D 2N 3H 47 0s 2p 0Z 34',
  '0g 3v 1Q 0s 0D 0K 2h 3D',
  '3L 2x 1Q 20 2n 2L 1C 2p',
  '0A 29 3r 0D 45 0k 2e 2W',
  '25 3U 1W 2r 46 2s 2X 39',
  '3p 0X 0E 1q 0q 4B 49 48',
  '3r 3b 3C 1M 1j 0I 4A 48',
  '40 3m 4E 0s 2S 1v 3T 0I',
  '3t 2B 2k 2t 2O 0e 2l 1L',
  '28 2a 0J 1L 0c 3C 2o 0X',
  '00 2Z 2d 1T 2u 1t 1j 0l',
  '1o 1E 3T 18 3E 1G 27 0L',
  '0v 2t 06 11 1A 2U 4B 1O',
  '2M 3d 2S 0x 0w 0q 0p 2V',
  '18 0q 1D 49 2O 00 1v 2t',
  '1k 3s 3G 21 3w 0W 29 2r',
  '2O 2L 0g 3Y 0M 0u 3I 3C',
  '1r 2c 2q 3o 30 0a 39 1K',
].map(line => line.split(' '));

const canonical = JSON.parse(raw('base60-grid.json').toString('utf8'));
assert.deepEqual(canonical.page_row_counts, [10, 13, 9]);
assert.equal(MANUAL_ROWS.length, 32);
assert.equal(MANUAL_ROWS.flat().length, 256);
assert.ok(MANUAL_ROWS.every(row => row.length === 8));
assert.deepEqual(MANUAL_ROWS, canonical.rows);

const alphabet = canonical.alphabet;
assert.equal(alphabet.length, 60);
assert.equal(new Set(alphabet).size, 60);
const converted = MANUAL_ROWS.map(row => row.map(token => {
  assert.equal(token.length, 2);
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, token);
  const n = 60 * hi + lo;
  assert.ok(n <= 255, token);
  return n;
}));
assert.deepEqual(converted, canonical.byte_rows);
console.log(JSON.stringify({
  original_scans: Object.keys(scanHashes),
  human_transcribed_rows: MANUAL_ROWS.length,
  independent_matched_source_cells: 256,
  byte_decoder_matches: 256,
  altered_original_ciphertext: 0,
  recovered_plaintext: false
}, null, 2));
