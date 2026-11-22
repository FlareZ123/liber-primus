'use strict';

/**
 * Original-input necessary condition for ANY secret 28-way stationary
 * codebook per p50 clock phase after bit0-selected lag1/lag5 exclusions.
 * Positive plants use source-native GP29 and genuinely unknown random
 * 28-way phase alphabets. This excludes entire keyspaces, not trial keys.
 * Node 22/Windows: node sims/lp2_p50_bit0_forbidden_rank28_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const table = require('../resources/liber-primus/lp2-grid-256.json');
const authenticated = require('../resources/external/relikd-solved-gp29-native-v1.json');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');

const ROOT = path.resolve(__dirname, '..');
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const bytes = table.bytes;
const raw = fs.readFileSync(path.join(ROOT, 'resources', 'lp2-transcription.txt'), 'utf8');
assert.equal(original.length, 12956);
assert.equal(bytes.length, 256);
const local = Array(original.length).fill(0);
let word = [], offset = 0, wordCount = 0;
for (const part of raw.split('%').slice(0, 55)) for (const glyph of part) {
  if (/[\u16a0-\u16ff]/u.test(glyph)) word.push(offset++);
  else if (glyph === '/' || /\s/u.test(glyph)) continue;
  else if (word.length) {
    word.forEach((index, j) => {local[index] = j;});
    word = [];
    wordCount++;
  }
}
if (word.length) {
  word.forEach((index, j) => {local[index] = j;});
  wordCount++;
}
assert.equal(offset, original.length);
assert.equal(wordCount, 2896);

/** @param {number} i @param {number[]} sourceCipher */
function forbidden(i, sourceCipher) {
  const length = (bytes[(i + 255) & 255] & 1) === 0 && local[i] >= 5 ? 5 : 1;
  return i >= length ? sourceCipher[i - length] : 0;
}

/** @param {number[]} ciphertext @returns {number[]} */
function observedAllowedRanks(ciphertext) {
  return ciphertext.map((c, i) => {
    const f = forbidden(i, ciphertext);
    return c === f ? -1 : c < f ? c : c - 1;
  });
}

/**
 * Same-clock equality among nonexception positions is unchanged by any
 * single-valued unknown 28-way permutation at each of 256 phases.
 * @param {number[]} ranks Symbols -1 (exception) or 0..27.
 */
function phaseCollision(ranks, globalStart = 0) {
  const freq = Array.from({length: 256}, () => Array(28).fill(0));
  const size = Array(256).fill(0);
  for (let i = 0; i < ranks.length; i++) {
    const symbol = ranks[i];
    if (symbol === -1) continue;
    assert(Number.isInteger(symbol) && symbol >= 0 && symbol < 28);
    const k = (globalStart + i + 255) & 255;
    freq[k][symbol]++;
    size[k]++;
  }
  let equalPairs = 0, eligiblePairs = 0;
  for (let phase = 0; phase < 256; phase++) {
    eligiblePairs += size[phase] * (size[phase] - 1);
    for (const n of freq[phase]) equalPairs += n * (n - 1);
  }
  return {
    Q: equalPairs / eligiblePairs, equalPairs,
    eligiblePairs, positions: size.reduce((v, n) => v + n, 0)
  };
}

/** @param {number[]} native */
function nativeRanks(native) {
  return native.map(p => p === 0 ? -1 : p - 1);
}

/** @returns {number[][]} */
function secretCodebooks() {
  let state = 0x42ca5fa1;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  return Array.from({length: 256}, () => {
    const row = Array.from({length: 28}, (_, i) => i);
    for (let j = 27; j > 0; j--) {
      const k = next() % (j + 1);
      [row[j], row[k]] = [row[k], row[j]];
    }
    assert.equal(new Set(row).size, 28);
    return row;
  });
}

/** @param {number[]} native @param {number[][]} codebooks */
function encrypt(native, codebooks) {
  const out = [];
  for (let i = 0; i < native.length; i++) {
    const f = forbidden(i, out);
    if (native[i] === 0) {out.push(f); continue;}
    const rank = codebooks[(i+255)&255][native[i] - 1];
    out.push(rank < f ? rank : rank+1);
  }
  return out;
}

/** @param {number[]} ciphertext @param {number[][]} codebooks */
function decrypt(ciphertext, codebooks) {
  const inverse = codebooks.map(row => {
    const inv = Array(28);
    row.forEach((value, i) => {inv[value] = i;});
    return inv;
  });
  return ciphertext.map((c, i) => {
    const f = forbidden(i, ciphertext);
    if (c === f) return 0;
    const rank = c < f ? c : c - 1;
    return inverse[(i+255)&255][rank] + 1;
  });
}

const rmap = new Map(authenticated.runes.map((glyph, i) => [glyph, i]));
const auth = authenticated.sections.flatMap(section =>
  Array.from(section.source_text).filter(glyph => rmap.has(glyph))
    .map(glyph => rmap.get(glyph)));
assert.equal(auth.length, 2979);

function main() {
  const observed = phaseCollision(observedAllowedRanks(original));
  assert.equal(observed.positions, 12840);
  assert.equal(observed.equalPairs, 22560);
  assert.equal(observed.eligiblePairs, 631360);
  assert(Math.abs(observed.Q-0.03573238722757222) < 1e-14);

  const results = [];
  const nativeControls = [];
  for (let j = 0; j < 16; j++) {
    const sample = Array.from({length: original.length}, (_,i) =>
      auth[(j*177+i)%auth.length]);
    nativeControls.push(sample);
    results.push({group:'authenticated solved GP',id:j,
      ...phaseCollision(nativeRanks(sample))});
  }
  for (const [name,fn,windows] of [
    ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 8],
    ['Gibran', 'resources/control/gibran_prophet_58585.txt', 2]
  ]) {
    const native = encodeSourceNativeGP(fs.readFileSync(path.join(ROOT,fn),'utf8'));
    assert(native.length >= windows*12956);
    for (let j = 0; j < windows; j++) {
      const sample = native.slice(j*12956, (j+1)*12956);
      nativeControls.push(sample);
      results.push({group:name,id:j,...phaseCollision(nativeRanks(sample))});
    }
  }
  const minimum = Math.min(...results.map(row => row.Q));
  const maximum = Math.max(...results.map(row => row.Q));
  assert(minimum > 0.046);
  console.log('AUTHENTIC ORIGINAL ALLOWED-RANK EQUALITY:', JSON.stringify(observed));
  console.log('NATIVE CONTROLS: total',results.length,
    'min Q',minimum,'max Q',maximum);
  for (const name of ['authenticated solved GP','Shakespeare','Gibran']) {
    const subset = results.filter(row => row.group === name);
    console.log('  ',name,'windows',subset.length,
      'range',Math.min(...subset.map(row => row.Q)),
      Math.max(...subset.map(row => row.Q)));
  }

  // This single illustrated chapter physically contains the p50 table.
  // The global phase is retained, so its 3008 original runes constitute a
  // genuinely independent bounded check of whole-book averaging.
  const tableauChapterStart = 9640;
  const tableauChapterEnd = 12648;
  const tableauRanks = observedAllowedRanks(original).slice(
    tableauChapterStart, tableauChapterEnd);
  const tableauObservation = phaseCollision(tableauRanks, tableauChapterStart);
  const nativeTableauQ = nativeControls.map((native) =>
    phaseCollision(nativeRanks(native.slice(tableauChapterStart, tableauChapterEnd)),
      tableauChapterStart).Q);
  const tableauNativeMin = Math.min(...nativeTableauQ);
  assert.equal(tableauObservation.positions <= 3008, true);
  assert.equal(tableauObservation.eligiblePairs, 31850);
  assert(Math.abs(tableauObservation.Q - 0.03466248037676609) < 1e-14);
  assert(tableauNativeMin > 0.045);
  console.log('ORIGINAL TABLE-CONTAINING ILLUSTRATED CHAPTER p40–p53:',
    JSON.stringify(tableauObservation));
  console.log('Same chapter register over all 26 controls, min native Q:',
    tableauNativeMin);

  const nativePlant = encodeSourceNativeGP(fs.readFileSync(
    path.join(ROOT, 'resources/control/shakespeare_first300k.txt'), 'utf8')
  ).slice(0, original.length);
  assert.equal(nativePlant.length, original.length);
  const permutation = secretCodebooks();
  const plantedCipher = encrypt(nativePlant, permutation);
  assert.deepEqual(decrypt(plantedCipher, permutation), nativePlant);
  const phi = phaseCollision(observedAllowedRanks(plantedCipher));
  const source = phaseCollision(nativeRanks(nativePlant));
  assert.deepEqual(phi,source);
  console.log('POSITIVE: 12956/12956 original-layout native GP29 recovered');
  console.log('POSITIVE: equality invariant exactly preserved under 256 independent secret 28-way substitutions');
  console.log('ALL-SECRET NEGATIVE: no stationary 256-phase arbitrary 28! codebook can raise the original Q to native GP register');
  console.log('PASS');
}
main();
