'use strict';

/**
 * Corrected source-native count test for authenticated plaintext-F transparency.
 *
 * Historical rule: plaintext F always yields ciphertext F without using a key;
 * ciphertext F can also result from the normal encryption of NON-F plaintext.
 * Therefore the only necessary count inequality is P_F <= C_F.
 *
 * Earlier versions of this test incorrectly assumed C_F <= P_F and claimed
 * all native-English windows violate that condition. That false exclusion was
 * retracted 2026-11-13 after comparison to solved original LP1 and p56.
 *
 * Run: node sims/lp2_literal_f_fullbook_native_capacity_sft.cjs
 * @typedef {{name:string,sourceLength:number,windows:number,minF:number,maxF:number,maxAt:number}} Control
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encodeSourceNativeGP } = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.filter((p) => p.page <= 55);
const original = pages.flatMap((p) => p.indices);
assert.equal(original.length, 12956);
const n = original.length;
const fOriginal = original.filter((x) => x === 0).length;
assert.equal(fOriginal, 458);

const section = pages.filter((p) => p.page >= 40 && p.page <= 53)
  .flatMap((p) => p.indices);
assert.equal(section.length, 3008);
const sectionF = section.filter((x) => x === 0).length;
assert.equal(sectionF, 125);

/**
 * Exact F count extrema over all contiguous controls at the frozen length.
 * @param {number[]} gp
 * @param {number} length
 * @returns {{minF:number,maxF:number,maxAt:number,windows:number}}
 */
function extrema(gp, length) {
  assert(gp.length >= length);
  let count = 0, minF = Infinity, maxF = -1, maxAt = -1;
  for (let i = 0; i < gp.length; i++) {
    if (gp[i] === 0) count++;
    if (i >= length && gp[i - length] === 0) count--;
    if (i >= length - 1) {
      minF = Math.min(minF, count);
      if (count > maxF) { maxF = count; maxAt = i - length + 1; }
    }
  }
  return { minF, maxF, maxAt, windows: gp.length - length + 1 };
}
/** @type {Control[]} */
const observations = [];
let compatibleWhole = 0, compatibleSection = 0;
for (const [name, filename, wantedLength, wantedMaximum, wantedSectionMaximum] of [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 217106, 321, 96],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 62492, 390, 109],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 321327, 432, 119]
]) {
  const native = encodeSourceNativeGP(read(filename));
  assert.equal(native.length, wantedLength);
  const r = extrema(native, n);
  const sr = extrema(native, section.length);
  assert.equal(r.maxF, wantedMaximum);
  assert.equal(sr.maxF, wantedSectionMaximum);
  // CORRECT DIRECTION: all these controls have FEWER plaintext F symbols
  // than the observed ciphertext. This is compatible, not contradictory.
  assert.ok(r.maxF <= fOriginal);
  assert.ok(sr.maxF <= sectionF);
  compatibleWhole += r.windows;
  compatibleSection += sr.windows;
  observations.push({
    name, sourceLength: native.length, ...r,
    originalCipherF: fOriginal, correctCountNecessaryConditionPasses: true,
    section40to53: {
      originalCipherF: sectionF, ...sr,
      correctCountNecessaryConditionPasses: true
    }
  });
}
assert.equal(compatibleWhole, 562060);
assert.equal(compatibleSection, 591904);

// Genuine solved-page direction witness: p56 has five original ciphertext F
// sites, exactly ONE plaintext F at index56 under the historical totient key.
// The other four ciphertext Fs encode A, I, D, C and advance the key.
const p56 = corpus.pages.find((p) => p.page === 56).indices;
assert.deepEqual(p56.flatMap((x, i) => x === 0 ? [i] : []),
  [35, 47, 51, 56, 74]);
assert.equal(p56[56], 0);
const solvedP56PlaintextFs = [56];
assert.equal(solvedP56PlaintextFs.length, 1);
assert.ok(solvedP56PlaintextFs.length < 5);

// Build a compatible illustrative F-transparent source-native plant with
// ordinary non-F ciphertext letters sometimes becoming F.
const native = encodeSourceNativeGP(
  read('resources/control/gibran_prophet_58585.txt')).slice(0, n);
assert.equal(native.length, n);
const plainF = native.filter((x) => x === 0).length;
assert.equal(plainF, 322);
const encrypted = native.map((x, i) =>
  x === 0 ? 0 : (i % 29 === 0 ? 0 : 1 + (x * 13 + i * 7) % 28));
const encryptedF = encrypted.filter((x) => x === 0).length;
assert.ok(encryptedF > plainF);
assert.ok(native.every((p, i) => p !== 0 || encrypted[i] === 0));
assert.ok(encrypted.some((c, i) => c === 0 && native[i] !== 0));

console.log(JSON.stringify({
  hypothesis: 'authenticated plaintext-F transparency, not ciphertext-F exclusivity',
  original: {
    runes: n, ciphertextFs: fOriginal,
    standaloneSection: { pages: '40-53', runes: section.length,
      ciphertextFs: sectionF }
  },
  solvedP56: {
    ciphertextFsAt: [35, 47, 51, 56, 74],
    plaintextFsAt: solvedP56PlaintextFs,
    otherCipherFsRepresent: ['A', 'I', 'D', 'C']
  },
  controls: observations,
  countNecessaryGate: {
    direction: 'number_of_plaintext_F <= number_of_ciphertext_F',
    previouslyReportedExclusionsRetracted: true,
    windowsSatisfyingNecessaryWholeCount: compatibleWhole,
    windowsSatisfyingNecessarySectionCount: compatibleSection
  },
  FtransparentPositive: {
    genuineEnglishSourceFs: plainF, ciphertextFs: encryptedF,
    nonFPlaintextCanEncryptToF: true
  },
  limitation: 'A passing necessary F-count bound does not authenticate any plaintext, cipher key or whole-stream alignment. Original F positions could constrain exact proposed cribs.'
}, null, 2));
