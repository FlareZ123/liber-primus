'use strict';

/**
 * Source-frozen Cicada OS prime_echo row deletion into the LP2 p40-53 body.
 * Usage: node sims/lp2_2013_os_prime_echo_rowdrop_p40_sft.cjs
 * No writes, network or optional dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const bytes = Buffer.from(read('resources/historical/cicada2013-wisdom-folly.b64').replace(/\s/g, ''), 'base64');
assert.equal(bytes.length, 3368);
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
  '7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a');

const sh = read('resources/historical/cicada2013-os-original-prime-echo.sh');
const primes = Array.from(sh.matchAll(/echo(?: -n)?\s+"(\d+)/g), (match) => Number(match[1]));
assert.equal(primes.length, 464);
const rowEndPrimes = primes.filter((unused, i) => (i + 1) % 10 === 0);
assert.equal(rowEndPrimes.length, 46);
const nRows = bytes.length / 8;
assert.equal(nRows, 421);
const removed = new Set(rowEndPrimes.map((p) => p % nRows));
assert.equal(removed.size, 46);
const pad = Buffer.from(Array.from(bytes).filter((unused, i) => !removed.has(Math.floor(i / 8))));
assert.equal(pad.length, 3000);

const runes = corpus.pages.filter((p) => p.page >= 40 && p.page <= 53).flatMap((p) => p.indices);
assert.equal(runes.length, 3008);
const heading = runes.slice(0, 8);
assert.deepEqual(heading, [0, 9, 19, 26, 6, 23, 25, 8]);
const printed = runes.slice(8);
assert.equal(printed.length, 3000);

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/** @param {number} b @param {'mod'|'scale'} scheme @param {number} modulus @returns {number} */
function key(b, scheme, modulus) {
  return scheme === 'mod' ? b % modulus : Math.floor(b * modulus / 256);
}

/**
 * Source heading gives the eight-column rank, using original red rune indices.
 * @param {number[]} a @returns {number[]}
 */
function undoColumn(a) {
  const sorted = heading.map((r, i) => [r, i]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
  const columns = Array(8);
  for (let i = 0; i < 8; i++) columns[sorted[i]] = a.slice(i * 375, (i + 1) * 375);
  return Array.from({length: 3000}, (unused, i) => columns[i % 8][Math.floor(i / 8)]);
}

/** @param {number[]} a @returns {number[]} */
function applyColumn(a) {
  const sorted = heading.map((r, i) => [r, i]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
  return sorted.flatMap((j) => Array.from({length: 375}, (unused, r) => a[r * 8 + j]));
}

/**
 * sign -1 is Vigenere decryption. sign +1 checks the opposite direct operation.
 * @param {number[]} ct @param {'mod'|'scale'} scheme @param {number} sign
 * @returns {number[]}
 */
function decode29(ct, scheme, sign) {
  return ct.map((v, i) => (v + sign * key(pad[i], scheme, 29) + 29) % 29);
}

/** @param {number[]} plain @param {'mod'|'scale'} scheme @param {number} sign @returns {number[]} */
function encode29(plain, scheme, sign) {
  return plain.map((v, i) => (v - sign * key(pad[i], scheme, 29) + 29) % 29);
}

/**
 * GP28 predecessor exclusion, with original F or EA reserved as repeat marker.
 * The first predecessor is the last original red heading rune. The clock can
 * consume the byte on a marker or hold it. All 29 possible outputs are retained.
 * @param {number[]} ct
 * @param {'mod'|'scale'} scheme
 * @param {number} sign
 * @param {0|28} marker
 * @param {boolean} hold
 * @returns {number[]}
 */
function decode28(ct, scheme, sign, marker, hold) {
  const out = [];
  let previous = heading[7];
  let clock = 0;
  for (const v of ct) {
    if (v === previous) {
      out.push(marker);
      if (!hold) clock += 1;
    } else {
      const rank = v < previous ? v : v - 1;
      const digit = (rank + sign * key(pad[clock], scheme, 28) + 28) % 28;
      out.push(digit >= marker ? digit + 1 : digit);
      clock += 1;
    }
    previous = v;
  }
  return out;
}

/**
 * Exact inverse of decode28 for either escape clock.
 * @param {number[]} plain
 * @param {'mod'|'scale'} scheme
 * @param {number} sign
 * @param {0|28} marker
 * @param {boolean} hold
 * @returns {number[]}
 */
function encode28(plain, scheme, sign, marker, hold) {
  const out = [];
  let previous = heading[7];
  let clock = 0;
  for (const p of plain) {
    if (p === marker) {
      out.push(previous);
      if (!hold) clock += 1;
    } else {
      const digit = p > marker ? p - 1 : p;
      const rank = (digit - sign * key(pad[clock], scheme, 28) + 28) % 28;
      const v = rank >= previous ? rank + 1 : rank;
      out.push(v);
      previous = v;
      clock += 1;
    }
  }
  return out;
}

const cases = [];
const native = corpus.pages.find((p) => p.page === 57).indices;
const plant29 = Array.from({length: 3000}, (unused, i) => native[i % native.length]);
for (const geometry of ['printed', 'decolumn']) {
  const ct = geometry === 'printed' ? printed : undoColumn(printed);
  if (geometry === 'decolumn') assert.deepEqual(applyColumn(ct), printed);
  for (const scheme of ['mod', 'scale']) {
    for (const sign of [-1, 1]) {
      const plain = decode29(ct, scheme, sign);
      assert.deepEqual(encode29(plain, scheme, sign), ct);
      const nativeCt = encode29(plant29, scheme, sign);
      assert.deepEqual(decode29(nativeCt, scheme, sign), plant29);
      cases.push({geometry, type: 'GP29', scheme, sign, ioc: ioc(plain)});
      for (const marker of [0, 28]) {
        for (const hold of [false, true]) {
          const decoded = decode28(ct, scheme, sign, marker, hold);
          assert.deepEqual(encode28(decoded, scheme, sign, marker, hold), ct);
          const repeatPositions = new Set(ct.flatMap((v, i) =>
            i > 0 && v === ct[i - 1] ? [i] : []));
          const usable = native.filter((v) => v !== marker);
          const nativePlant = Array.from({length: 3000}, (unused, i) =>
            repeatPositions.has(i) ? marker : usable[i % usable.length]);
          const nativeCipher = encode28(nativePlant, scheme, sign, marker, hold);
          assert.deepEqual(decode28(nativeCipher, scheme, sign, marker, hold), nativePlant);
          cases.push({geometry, type: 'GP28', scheme, sign, marker, hold, ioc: ioc(decoded)});
        }
      }
    }
  }
}
assert.equal(cases.length, 40);
cases.sort((a, b) => b.ioc - a.ioc);
assert.ok(cases[0].ioc < 0.038, 'Original candidate unexpectedly has a nonflat IoC');
console.log(JSON.stringify({
  source_sha256: '7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a',
  original_script_prime_count: primes.length,
  ten_prime_row_ends: rowEndPrimes.length,
  input_eight_byte_rows: nRows,
  distinct_mod_421_rows_removed: removed.size,
  pad_length: pad.length,
  original_chapter_length: runes.length,
  original_body_length: printed.length,
  source_native_plant_ioc: ioc(plant29),
  variants: cases.length,
  maximum_original_ioc: cases[0],
  minimum_original_ioc: cases[cases.length - 1],
  tests: 'All complete original forward inverses and both source-native GP plants passed',
}, null, 2));
