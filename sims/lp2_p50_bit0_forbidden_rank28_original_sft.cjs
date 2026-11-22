'use strict';

/**
 * Source-frozen 28-alternative, single-forbidden GP29 codec.
 * A p50 byte with even parity excludes five-back (within a complete
 * printed word); odd parity excludes predecessor. The 29th plaintext
 * symbol F is an explicit bypass that transmits the forbidden symbol.
 *
 * Execute: node sims/lp2_p50_bit0_forbidden_rank28_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const table = require('../resources/liber-primus/lp2-grid-256.json');

const RAW = fs.readFileSync(path.join(__dirname, '..', 'resources', 'lp2-transcription.txt'), 'utf8');
const RUNIC = /[\u16A0-\u16FF]/u;
const SOURCE = corpus.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices);
const BYTE = table.bytes;
const BREAKS = [0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const ALPHABET = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO',
  'P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
assert.equal(SOURCE.length, 12956);
assert.equal(BYTE.length, 256);

/** @returns {number[][]} Complete original printed word rune offsets */
function words() {
  const out = [];
  let current = [], ordinal = 0;
  for (const segment of RAW.split('%').slice(0, 55)) {
    for (const ch of segment) {
      if (RUNIC.test(ch)) current.push(ordinal++);
      else if (ch === '/' || /\s/u.test(ch)) continue;
      else if (current.length) {out.push(current); current = [];}
    }
  }
  if (current.length) out.push(current);
  assert.equal(ordinal, 12956);
  assert.equal(out.length, 2896);
  return out;
}
const ALL_WORDS = words();
const LOCAL_OFFSET = Array(SOURCE.length).fill(0);
for (const word of ALL_WORDS) for (let j = 0; j < word.length; j++) {
  LOCAL_OFFSET[word[j]] = j;
}

/** @param {number} i @param {number[]} previousCipher */
function forbidden(i, previousCipher) {
  const b = BYTE[(i + 255) & 255];
  const distance = (b & 1) === 0 && LOCAL_OFFSET[i] >= 5 ? 5 : 1;
  return i >= distance ? previousCipher[i-distance] : 0;
}

/**
 * @param {number[]} plain GP29 symbols, where F is zero
 * @returns {number[]} encoded symbols
 */
function encode(plain) {
  const out = [];
  for (let i = 0; i < plain.length; i++) {
    const f = forbidden(i, out);
    const p = plain[i];
    assert(Number.isInteger(p) && p >= 0 && p < 29);
    if (p === 0) {out.push(f); continue;}
    const r = (p - 1 + BYTE[(i + 255) & 255]) % 28;
    out.push(r < f ? r : r+1);
  }
  return out;
}

/** @param {number[]} encrypted */
function decode(encrypted) {
  return encrypted.map((c, i) => {
    const f = forbidden(i, encrypted);
    if (c === f) return 0;
    const rank = c < f ? c : c - 1;
    return ((rank - BYTE[(i + 255) & 255]) % 28 + 28) % 28 + 1;
  });
}

/** @param {number[]} runes */
function ioc(runes) {
  const hist = Array(29).fill(0);
  for (const r of runes) hist[r]++;
  return hist.reduce((v, h) => v + h*(h-1), 0) / (runes.length*(runes.length-1));
}

function main() {
  const positiveBody = corpus.pages.find((p) => p.page === 57).indices;
  const positivePlain = Array.from({length: SOURCE.length}, (_,i) =>
    positiveBody[i % positiveBody.length]);
  const encoded = encode(positivePlain);
  assert.deepEqual(decode(encoded), positivePlain);
  assert(ioc(positivePlain) > 0.05);
  console.log('POSITIVE: 12956 original-shaped GP-native p57 symbols exactly recovered');

  const decoded = decode(SOURCE);
  assert.deepEqual(encode(decoded), SOURCE);
  const specialCount = decoded.filter((p) => p === 0).length;
  assert.equal(specialCount, 116);
  const wholeIoC = ioc(decoded);
  assert(Math.abs(wholeIoC-0.03516047962828558) < 1e-12);
  console.log('ORIGINAL: 12956 GP29 ciphertext symbols exactly replayed;');
  console.log('  excluded-symbol events (decoded F):', specialCount);
  console.log('  candidate full plaintext IoC:', wholeIoC);
  for (let chapter = 0; chapter < 9; chapter++) {
    const body = decoded.slice(BREAKS[chapter], BREAKS[chapter+1]);
    console.log('  Chapter', chapter, 'GP runes', body.length,
      'IoC', ioc(body), 'F_count', body.filter((x) => x === 0).length);
  }
  const first = ALL_WORDS.slice(0, 12).map((word) =>
    word.map((offset) => ALPHABET[decoded[offset]]).join(''));
  console.log('  First twelve original word-position decodes:', first.join(' '));
  console.log('  Plaintext language gate FAIL: near-uniform GP29 coincidence and nonwords');
  console.log('PASS: source-frozen two-predecessor rank28/F-exception codec, direct original failure');
}
main();
