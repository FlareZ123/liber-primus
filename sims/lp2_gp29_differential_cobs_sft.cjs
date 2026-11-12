'use strict';

/**
 * Source-fixed GP29 differential COBS gate for original LP2.
 * COBS (1997) uses length codes to eliminate forbidden zero symbols.
 * The GP29 analogue takes modulo-29 differences of adjacent ciphertext
 * runes and regards exact repeats (difference zero) as frame delimiters.
 *
 * Reproduction: node sims/lp2_gp29_differential_cobs_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = gp.pages.filter(p => p.status === 'unsolved' && p.indices.length);

/**
 * The alphabet has zero plus 28 nonzero symbols. A length code 1..28
 * encodes 0..27 nonzero symbols; 28 means continuation without a zero.
 * @param {number[]} plain
 * @returns {number[]}
 */
function encodeCOBS29(plain) {
  const out = [0];
  let codeAt = 0, code = 1;
  for (const x of plain) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    if (x === 0) {
      out[codeAt] = code;
      codeAt = out.length;
      out.push(0);
      code = 1;
    } else {
      out.push(x);
      code++;
      if (code === 28) {
        out[codeAt] = 28;
        codeAt = out.length;
        out.push(0);
        code = 1;
      }
    }
  }
  out[codeAt] = code;
  return out;
}

/**
 * @param {number[]} frame
 * @returns {{valid:boolean, plain?:number[], reason?:string, at?:number}}
 */
function inspectFrame(frame) {
  if (!frame.length) return {valid: false, reason: 'empty'};
  const plain = [];
  let i = 0;
  while (i < frame.length) {
    const k = frame[i];
    if (k < 1 || k > 28) return {valid: false, reason: 'invalid-code', at: i};
    if (i + k > frame.length) return {valid: false, reason: 'overrun', at: i};
    for (let j = i + 1; j < i + k; j++) {
      if (frame[j] === 0) return {valid: false, reason: 'zero-payload', at: j};
      plain.push(frame[j]);
    }
    i += k;
    if (k < 28 && i < frame.length) plain.push(0);
  }
  return {valid: true, plain};
}

/**
 * @param {number[]} ciphertext
 * @returns {number[]}
 */
function differential(ciphertext) {
  return ciphertext.slice(1).map((value, i) => (value - ciphertext[i] + 29) % 29);
}

/** @param {number[]} differences */
function splitFrames(differences) {
  const frames = [];
  let start = 0;
  for (let i = 0; i <= differences.length; i++) {
    if (i === differences.length || differences[i] === 0) {
      frames.push({start, end: i, data: differences.slice(start, i)});
      start = i + 1;
    }
  }
  return frames;
}

/**
 * Known English source only for positive control; exact GP transliteration.
 * @param {number} length
 * @returns {number[]}
 */
function nativeEnglish(length) {
  const tokens = gp.translit.map((token, i) => ({token, i}))
    .sort((a, b) => b.token.length - a.token.length);
  const text = read('resources/control/shakespeare_first300k.txt');
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  const out = [];
  for (const raw of words) {
    const word = raw.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let j = 0; j < word.length;) {
      const match = tokens.find(x => word.startsWith(x.token, j));
      assert(match, 'invalid GP normalization at ' + word.slice(j));
      out.push(match.i);
      j += match.token.length;
    }
    if (out.length >= length) break;
  }
  assert(out.length >= length);
  return out.slice(0, length);
}

/**
 * @param {number[][]} plainPackets
 * @returns {number[]}
 */
function encodePackets(plainPackets) {
  const differences = [];
  for (let i = 0; i < plainPackets.length; i++) {
    if (i) differences.push(0);
    differences.push(...encodeCOBS29(plainPackets[i]));
  }
  const cipher = [24];
  for (const d of differences) cipher.push((cipher[cipher.length - 1] + d) % 29);
  return cipher;
}

function main() {
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);
  const records = [];
  let repeatEvents = 0;
  for (const p of pages) {
    const d = differential(p.indices);
    repeatEvents += d.filter(x => x === 0).length;
    for (const frame of splitFrames(d)) {
      records.push({
        page: p.page, start: frame.start, length: frame.data.length,
        ...inspectFrame(frame.data),
      });
    }
  }
  assert.equal(repeatEvents, 86);
  assert.equal(records.length, 141);
  const invalid = records.filter(x => !x.valid);
  const reasons = {};
  for (const row of invalid) reasons[row.reason] = (reasons[row.reason] || 0) + 1;
  assert.deepEqual(reasons, {overrun: 132, empty: 2});
  assert.equal(records.length - invalid.length, 7);

  const plain = nativeEnglish(12956);
  const packets = [];
  for (let i = 0; i < plain.length; i += 137) packets.push(plain.slice(i, i + 137));
  const cipher = encodePackets(packets);
  const plantedFrames = splitFrames(differential(cipher));
  assert.equal(plantedFrames.length, packets.length);
  const recovered = [];
  for (const f of plantedFrames) {
    const parsed = inspectFrame(f.data);
    assert(parsed.valid);
    recovered.push(...parsed.plain);
  }
  assert.deepEqual(recovered, plain);
  assert.deepEqual(encodePackets(packets), cipher);

  console.log(JSON.stringify({
    original: {pages: pages.length, runes: 12956, zeroDifferences: repeatEvents,
      frames: records.length, valid: records.length - invalid.length,
      invalid: invalid.length, reasons, example: invalid[0]},
    plantedNativeGP: {plaintextRunes: plain.length, packets: packets.length,
      ciphertextRunes: cipher.length, exactInverse: true},
    decision: 'The fixed GP29 differential-COBS interpretation is excluded on original LP2.',
  }, null, 2));
}
main();
