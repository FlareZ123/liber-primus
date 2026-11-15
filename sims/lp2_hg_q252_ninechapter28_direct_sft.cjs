'use strict';

/**
 * Original LP2 pp49-51 H*G quotient as nine 28-position chapter keys.
 *
 * SFT: node sims/lp2_hg_q252_ninechapter28_direct_sft.cjs
 * Node.js 22, CommonJS built-ins only.
 * Original-source operations and source-selected chapter geometry are fixed.
 * The quotient-to-key interpretation is a hypothesis, not a Cicada instruction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

/** @param {string} name @returns {any} */
function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
}

/** @param {number} x @returns {number} */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number} x @returns {number} */
function mod28(x) {
  return ((x % 28) + 28) % 28;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = new Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((total, count) => total + count * (count - 1), 0)
    / (values.length * (values.length - 1));
}

const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const table = readJson('resources/liber-primus/lp2-grid-256.json');
const archiveTable = readJson('resources/liber-primus/base60-grid.json');
const tableBytes = table.bytes;
assert.equal(tableBytes.length, 256);
assert.deepEqual(tableBytes, archiveTable.byte_rows.flat());

// H=3+26X+24X^2 from the 2013 BASE29 example.
// G=27+5X+15X^2 from the original p39 red triad.
// Descending coefficients of H*G are [12,17,11,21,23].
const product = [12, 17, 11, 21, 23];
assert.equal(mod29(12 * 17), 1);
const dividend = tableBytes.map(x => x % 29);
const remainder = dividend.slice();
const quotient = [];
for (let i = 0; i < 252; i++) {
  const current = mod29(remainder[i] * 17);
  quotient.push(current);
  for (let j = 0; j < product.length; j++) {
    remainder[i + j] = mod29(remainder[i + j] - current * product[j]);
  }
}
assert.deepEqual(remainder.slice(252), [0, 0, 0, 0]);
assert.deepEqual(quotient.slice(0, 20),
  [0, 12, 9, 28, 2, 25, 23, 21, 18, 28, 21, 17, 17, 8, 15, 21, 7, 21, 18, 7]);

// The nine chapter lengths are read from the original visual chapter starts.
// Their sum is 12,956 and all are source-defined, before interpreting quotient.
const chapters = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const unknown = corpus.pages.filter(page => page.status === 'unsolved')
  .flatMap(page => page.indices);
assert.equal(unknown.length, 12956);
assert.equal(chapters.reduce((sum, length) => sum + length, 0), unknown.length);

const rootPowers = [1];
for (let i = 1; i < 28; i++) rootPowers.push((rootPowers[i - 1] * 15) % 29);
assert.equal((rootPowers[27] * 15) % 29, 1);
assert.equal(new Set(rootPowers).size, 28);

/**
 * @param {number} symbol Original GP29 symbol
 * @param {number} key Quotient coefficient 0..28
 * @param {'add'|'mul'} operation Decoding family
 * @param {-1|1} sign
 * @returns {number} Original-register inverse candidate
 */
function decode(symbol, key, operation, sign) {
  if (operation === 'add') return mod29(symbol + sign * key);
  return (symbol * rootPowers[mod28(sign * key)]) % 29;
}

/**
 * @param {number} symbol Candidate plaintext GP29 symbol
 * @param {number} key
 * @param {'add'|'mul'} operation
 * @param {-1|1} sign
 * @returns {number} Exact forward encryption of decoder
 */
function encode(symbol, key, operation, sign) {
  if (operation === 'add') return mod29(symbol - sign * key);
  return (symbol * rootPowers[mod28(-sign * key)]) % 29;
}

const distinctPerRow = [];
for (let chapter = 0; chapter < 9; chapter++) {
  const row = quotient.slice(28 * chapter, 28 * (chapter + 1));
  distinctPerRow.push(new Set(row).size);
}
assert.deepEqual(distinctPerRow, [16, 19, 21, 16, 19, 16, 18, 17, 22]);

const clear = corpus.pages.find(page => page.page === 57).indices;
assert.equal(clear.length, 95);
const result = [];
for (const operation of ['add', 'mul']) {
  for (const sign of [-1, 1]) {
    let offset = 0;
    const decoded = [];
    const chapterIoC = [];
    for (let chapter = 0; chapter < 9; chapter++) {
      const part = [];
      for (let i = 0; i < chapters[chapter]; i++) {
        const key = quotient[28 * chapter + i % 28];
        const symbol = unknown[offset + i];
        const plaintext = decode(symbol, key, operation, sign);
        assert.equal(encode(plaintext, key, operation, sign), symbol);
        part.push(plaintext);
      }
      offset += chapters[chapter];
      chapterIoC.push(ioc(part));
      decoded.push(...part);
    }

    // Independent solved-p57 source-native positive control: a complete
    // symbol-by-symbol original-register encrypt/decrypt plant.
    for (let i = 0; i < clear.length; i++) {
      const key = quotient[i % 28];
      const encrypted = encode(clear[i], key, operation, sign);
      assert.equal(decode(encrypted, key, operation, sign), clear[i]);
    }
    const observed = ioc(decoded);
    assert.ok(observed > 0.033 && observed < 0.036);
    result.push({operation, sign, ioc: observed,
      chapters: chapterIoC.map(x => Number(x.toFixed(6)))});
  }
}

/**
 * Exact source-native plaintext-F bypass viability on a GP29 additive key.
 * A literal output F leaves the key pointer unchanged. A normal ciphertext
 * F can alternatively decode from non-F plaintext and consume the pointer.
 * All possible histories are retained without choosing English words.
 *
 * @param {number[]} cipher Original or planted GP29 ciphertext
 * @param {number[]} row One 28-residue source key
 * @param {-1|1} sign Original inverse sign
 * @param {boolean} freeStart Grant all 28 unknown initial phases
 * @returns {{failureAt:number, phases:number[]}}
 */
function additiveFStates(cipher, row, sign, freeStart) {
  let phases = new Set(freeStart
    ? Array.from({length: 28}, (_, i) => i)
    : [0]);
  for (let i = 0; i < cipher.length; i++) {
    const token = cipher[i];
    const next = new Set();
    for (const phase of phases) {
      if (token === 0) next.add(phase);
      if (decode(token, row[phase], 'add', sign) !== 0) {
        next.add((phase + 1) % 28);
      }
    }
    if (next.size === 0) return {failureAt: i, phases: []};
    phases = next;
  }
  return {failureAt: -1, phases: [...phases]};
}

const expectedFBypassCollapses = {
  '-1': {
    fixed: [40, 142, 0, 60, 37, 8, 43, 18, 0],
    free: [171, 142, 130, 205, 130, 298, 72, 134, 91]
  },
  '1': {
    fixed: [39, 19, 13, 113, 24, 2, 67, 40, 36],
    free: [388, 157, 107, 123, 256, 198, 225, 211, 185]
  }
};
const strictFResults = [];
const plantedNative = Array.from({length: chapters[0]}, (_, i) => clear[i % clear.length]);

for (const sign of [-1, 1]) {
  const firstRow = quotient.slice(0, 28);
  const plantedCipher = [];
  let nativePhase = 0;
  for (const plaintext of plantedNative) {
    if (plaintext === 0) {
      plantedCipher.push(0);
    } else {
      plantedCipher.push(encode(plaintext, firstRow[nativePhase], 'add', sign));
      nativePhase = (nativePhase + 1) % 28;
    }
  }
  const positive = additiveFStates(plantedCipher, firstRow, sign, false);
  assert.equal(positive.failureAt, -1);
  assert.ok(positive.phases.includes(nativePhase));

  for (const policy of ['fixed', 'free']) {
    let offset = 0;
    const firstFailures = [];
    for (let chapter = 0; chapter < chapters.length; chapter++) {
      const row = quotient.slice(chapter * 28, (chapter + 1) * 28);
      const cipher = unknown.slice(offset, offset + chapters[chapter]);
      const observed = additiveFStates(cipher, row, sign, policy === 'free');
      assert.ok(observed.failureAt >= 0);
      firstFailures.push(observed.failureAt);
      offset += chapters[chapter];
    }
    assert.deepEqual(firstFailures, expectedFBypassCollapses[String(sign)][policy]);
    strictFResults.push({sign, initialPhase: policy, firstImpossibleRune: firstFailures});
  }
}

// Multiplication has 0 -> 0 automatically. Under the documented
// nonconsuming plaintext-F policy, advance the periodic key only on nonzero
// GP29 ciphertext symbols. This variant is still an exact GP29 bijection.
const powerFSkipResults = [];
for (const sign of [-1, 1]) {
  let offset = 0;
  const fullPlaintext = [];
  const perChapter = [];
  for (let chapter = 0; chapter < chapters.length; chapter++) {
    let phase = 0;
    const row = quotient.slice(chapter * 28, (chapter + 1) * 28);
    const plaintext = [];
    for (let i = 0; i < chapters[chapter]; i++) {
      const cipher = unknown[offset + i];
      const symbol = cipher === 0 ? 0 : decode(cipher, row[phase], 'mul', sign);
      assert.equal(encode(symbol, row[phase], 'mul', sign), cipher);
      plaintext.push(symbol);
      if (cipher !== 0) phase = (phase + 1) % 28;
    }
    offset += chapters[chapter];
    perChapter.push(Number(ioc(plaintext).toFixed(6)));
    fullPlaintext.push(...plaintext);
  }
  // Same authentic solved-p57 repeated plant, but with nonconsuming F.
  let phase = 0;
  const row = quotient.slice(0, 28);
  for (const symbol of plantedNative) {
    const cipher = symbol === 0 ? 0 : encode(symbol, row[phase], 'mul', sign);
    assert.equal(cipher === 0 ? 0 : decode(cipher, row[phase], 'mul', sign), symbol);
    if (symbol !== 0) phase = (phase + 1) % 28;
  }
  powerFSkipResults.push({sign, ioc: ioc(fullPlaintext), chapters: perChapter});
}
console.log(JSON.stringify({strictFResults, powerFSkipResults}, null, 2));

console.log(JSON.stringify({
  originalRunes: unknown.length,
  printedTableBytes: tableBytes.length,
  quotientSymbols: quotient.length,
  quotientRemainder: remainder.slice(252),
  chapterKeyWidth: 28,
  keyRowDistinctSymbols: distinctPerRow,
  nativePositiveSymbolsPerModel: clear.length,
  solvedClearP57IoC: ioc(clear),
  result
}, null, 2));
