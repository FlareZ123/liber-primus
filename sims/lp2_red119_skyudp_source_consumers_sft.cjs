'use strict';

/**
 * Bounded, original-input consumers of the two punctuation-selected red
 * triads: LP2 p3/p39 at rune offset 119. Run from any working directory:
 *   node sims/lp2_red119_skyudp_source_consumers_sft.cjs
 *
 * This is a negative control, not a proposed recovered LP2 decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const table = JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'base60-grid.json'), 'utf8'));

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const frequencies = Array(29).fill(0);
  for (const value of values) frequencies[value]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/** @param {number[]} values @returns {string} */
function gp(values) {
  return values.map(index => corpus.translit[index]).join('');
}

/**
 * Exact GP29 additive inverse, with the historical solved-page literal-F
 * interrupter as an optional distinct model.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} sign
 * @param {boolean} transparentF
 * @returns {number[]}
 */
function additive(ciphertext, key, sign, transparentF) {
  let clock = 0;
  return ciphertext.map(symbol => {
    if (transparentF && symbol === 0) return 0;
    const decoded = (symbol + sign * key[clock % key.length] + 29) % 29;
    clock++;
    return decoded;
  });
}

/** @param {number[]} ciphertext @param {number[]} seed
 * @param {'plaintext'|'ciphertext'} feedback @param {-1|1} sign
 * @returns {number[]} */
function autokeyDecode(ciphertext, seed, feedback, sign) {
  const out = [];
  for (let i = 0; i < ciphertext.length; i++) {
    const key = i < seed.length ? seed[i] :
      feedback === 'plaintext' ? out[i - seed.length] : ciphertext[i - seed.length];
    out.push((ciphertext[i] + sign * key + 58) % 29);
  }
  return out;
}
/** @param {number[]} plaintext @param {number[]} seed
 * @param {'plaintext'|'ciphertext'} feedback @param {-1|1} sign
 * @returns {number[]} */
function autokeyEncrypt(plaintext, seed, feedback, sign) {
  const out = [];
  for (let i = 0; i < plaintext.length; i++) {
    const key = i < seed.length ? seed[i] :
      feedback === 'plaintext' ? plaintext[i - seed.length] : out[i - seed.length];
    out.push((plaintext[i] - sign * key + 58) % 29);
  }
  return out;
}

const redPages = [3, 39];
const keys = redPages.map(page =>
  corpus.pages[page].indices.slice(119, 122).map(index => 28 - index));
assert.deepEqual(corpus.pages[3].indices.slice(119, 122), [13, 23, 2]);
assert.deepEqual(corpus.pages[39].indices.slice(119, 122), [27, 5, 15]);
assert.equal(gp(keys[0]), 'SCY');
assert.equal(gp(keys[1]), 'UDP');

const postRed = redPages.map(page => corpus.pages[page].indices.slice(122));
assert.deepEqual(postRed.map(a => a.length), [95, 118]);
assert.equal(gp(postRed[0].slice(0, 3)), 'EODEO');
assert.equal(gp(additive(postRed[0].slice(0, 3), keys[0], -1, false)), 'YES');

const tails = redPages.map((page, i) => ({
  page,
  key: gp(keys[i]),
  firstWordCiphertext: gp(postRed[i].slice(0, 3)),
  noSkipSubtractIoC: ioc(additive(postRed[i], keys[i], -1, false)),
  noSkipAddIoC: ioc(additive(postRed[i], keys[i], 1, false)),
  fTransparentSubtractIoC: ioc(additive(postRed[i], keys[i], -1, true)),
  fTransparentAddIoC: ioc(additive(postRed[i], keys[i], 1, true))
}));
assert.equal(tails[0].noSkipSubtractIoC.toFixed(9), '0.038745801');
assert.equal(tails[0].fTransparentSubtractIoC.toFixed(9), '0.035162374');
assert.equal(tails[1].noSkipSubtractIoC.toFixed(9), '0.038823700');
assert.equal(tails[1].fTransparentSubtractIoC.toFixed(9), '0.034477763');

// The red triplets are independent fixed three-rune autokey seeds.
// No fitted shifts, phase, punctuation clocks or skipped runes.
const autokeyResults = redPages.map((page, i) => ({
  page, seed: gp(keys[i]),
  variants: ['plaintext', 'ciphertext'].flatMap(feedback =>
    /** @type {(-1|1)[]} */ ([-1, 1]).map(sign => {
      const decoded = autokeyDecode(postRed[i], keys[i], feedback, sign);
      const known = corpus.pages[57].indices;
      const encrypted = autokeyEncrypt(known, keys[i], feedback, sign);
      assert.deepEqual(autokeyDecode(encrypted, keys[i], feedback, sign), known);
      return { feedback, sign, ioc: ioc(decoded),
        first32: gp(decoded.slice(0, 32)), recoveredPlantRunes: known.length };
    }))
}));
assert.ok(autokeyResults[0].variants[0].first32.startsWith('YESEATH'));
assert.ok(autokeyResults[0].variants[2].first32.startsWith('YESPYO'));
assert.ok(autokeyResults[1].variants[0].first32.startsWith('EOFTH'));
assert.ok(autokeyResults.flatMap(x => x.variants).every(x => x.ioc < 0.041));

const unsolved = corpus.pages.filter(page => page.page <= 55)
  .flatMap(page => page.indices);
const combinedKey = keys.flat();
assert.equal(unsolved.length, 12956);
assert.equal(gp(combinedKey), 'SCYUDP');
const overall = {
  totalRunes: unsolved.length,
  rawIoC: ioc(unsolved),
  noSkipSubtractIoC: ioc(additive(unsolved, combinedKey, -1, false)),
  noSkipAddIoC: ioc(additive(unsolved, combinedKey, 1, false)),
  fTransparentSubtractIoC: ioc(additive(unsolved, combinedKey, -1, true)),
  fTransparentAddIoC: ioc(additive(unsolved, combinedKey, 1, true))
};
assert.equal(overall.noSkipSubtractIoC.toFixed(9), '0.034504386');
assert.equal(overall.noSkipAddIoC.toFixed(9), '0.034488836');
assert.equal(overall.fTransparentSubtractIoC.toFixed(9), '0.035807076');
assert.equal(overall.fTransparentAddIoC.toFixed(9), '0.036108116');

// A UDP header occupies precisely eight bytes. The printed original table
// has 32 rows of eight base-60 byte values; no row can be a complete,
// header-only UDP datagram because each length field is far above 8.
const digits = table.alphabet;
const rows = table.rows.map(tokens => tokens.map(token => {
  assert.equal(token.length, 2);
  const value = 60 * digits.indexOf(token[0]) + digits.indexOf(token[1]);
  assert.ok(value >= 0 && value <= 255);
  return value;
}));
assert.equal(rows.length, 32);
assert.ok(rows.every(row => row.length === 8));
const headers = rows.map((row, index) => ({
  index,
  srcPort: 256 * row[0] + row[1],
  dstPort: 256 * row[2] + row[3],
  udpLength: 256 * row[4] + row[5],
  checksum: 256 * row[6] + row[7]
}));
const lengths = headers.map(header => header.udpLength);
assert.equal(Math.min(...lengths), 3348);
assert.equal(Math.max(...lengths), 63236);
assert.equal(headers.filter(header => header.udpLength === 8).length, 0);
assert.equal(headers.filter(header => [1033, 3301].includes(header.srcPort) ||
  [1033, 3301].includes(header.dstPort)).length, 0);

// The separately documented 2013 ICMP "sky" host IPv4 is not directly
// contained in the unmodified table as four consecutive bytes.
const datastream = rows.flat();
const knownHost = [106, 187, 103, 122];
const hostMatches = [];
for (let start = 0; start + 4 <= datastream.length; start++) {
  if (knownHost.every((value, i) => datastream[start + i] === value)) {
    hostMatches.push(start);
  }
}
assert.deepEqual(hostMatches, []);
console.log(JSON.stringify({
  key: gp(combinedKey),
  p3IsolatedThreeRuneCandidate: 'YES',
  tails,
  autokeyResults,
  overall,
  udp: {
    rows: rows.length,
    minHeaderLength: Math.min(...lengths),
    maxHeaderLength: Math.max(...lengths),
    completeHeaderOnlyRows: 0,
    historicalPortRows: 0,
    known2013HostRawOffsets: hostMatches
  }
}, null, 2));
