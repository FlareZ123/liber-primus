'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const index = new Map(corpus.runes.map((rune, i) => [rune, i]));
const symbolIndex = new Map(corpus.translit.map((rune, i) => [rune, i]));
const composites = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
const expectedSectionLengths = [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316];
const expectedBest = [
  [11, 27, 0.03594908696821914],
  [28, 0, 0.03570044112261799],
  [28, 0, 0.035449341956732494],
  [28, 0, 0.03536614406954943],
  [4, 1, 0.03549841807234258],
  [27, 16, 0.03566677906300548],
  [28, 0, 0.035412149085680696],
  [28, 0, 0.03539266046723274],
];

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = new Uint32Array(29);
  for (const symbol of symbols) counts[symbol]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/**
 * The output permutes GP29 independently, so arbitrary secret symbol
 * alphabets and nonzero current-cipher coefficients preserve this IoC.
 * A fixed two-symbol predecessor register continues through page cuts.
 * @param {number[]} ciphertext
 * @param {number} b
 * @param {number} c
 * @returns {number[]}
 */
function projected(ciphertext, b, c) {
  const out = [];
  for (let i = 2; i < ciphertext.length; i++) {
    out.push(mod29(ciphertext[i] + b * ciphertext[i - 1] + c * ciphertext[i - 2]));
  }
  return out;
}

/** @param {number[]} ciphertext @returns {{b:number,c:number,ioc:number}} */
function strongest(ciphertext) {
  let best = {b: -1, c: -1, ioc: -1};
  for (let b = 0; b < 29; b++) {
    for (let c = 0; c < 29; c++) {
      const value = ioc(projected(ciphertext, b, c));
      if (value > best.ioc) best = {b, c, ioc: value};
    }
  }
  return best;
}

/**
 * Source-native GP orthography with the original 2013 digraph aliases.
 * @param {string} source
 * @returns {number[]}
 */
function englishGP(source) {
  const output = [];
  for (const match of source.matchAll(/[a-z]+/giu)) {
    const word = match[0].toUpperCase().replace(/QU/g, 'CW')
      .replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const token = composites.find((part) => word.startsWith(part, i)) || word[i];
      const symbol = symbolIndex.get(token === 'ING' ? 'NG' : token);
      assert.notEqual(symbol, undefined, 'unsupported source spelling: ' + token);
      output.push(symbol);
      i += token.length;
    }
  }
  return output;
}

/**
 * Bijective secret output alphabet used for a constructive native-text plant.
 * The observed original rank bound permits every possible permutation.
 * @param {number} sectionIndex
 * @returns {number[]}
 */
function outputAlphabet(sectionIndex) {
  return Array.from({length: 29}, (_, value) => mod29(3 * value + 5 + sectionIndex));
}

/**
 * Fully reversible, two-back ciphertext-state forward encoder.
 * Previous-cipher state resets only at the eight source-visible '$' sections.
 * @param {number[]} plain
 * @param {number} b
 * @param {number} c
 * @param {number[]} alphabet
 * @returns {number[]}
 */
function encode(plain, b, c, alphabet) {
  const inverse = Array(29).fill(-1);
  for (let t = 0; t < 29; t++) inverse[alphabet[t]] = t;
  assert.ok(inverse.every((x) => x >= 0));
  const ciphertext = [];
  for (let i = 0; i < plain.length; i++) {
    const previous = i > 0 ? ciphertext[i - 1] : 0;
    const previous2 = i > 1 ? ciphertext[i - 2] : 0;
    ciphertext.push(mod29(inverse[plain[i]] - b * previous - c * previous2));
  }
  return ciphertext;
}

/**
 * Exact inverse of encode on the complete section, including its two seeds.
 * @param {number[]} cipher
 * @param {number} b
 * @param {number} c
 * @param {number[]} alphabet
 * @returns {number[]}
 */
function decode(cipher, b, c, alphabet) {
  return cipher.map((current, i) => alphabet[
    mod29(current + b * (i ? cipher[i - 1] : 0) + c * (i >= 2 ? cipher[i - 2] : 0))
  ]);
}

/** @param {string} source @returns {{runes:number[], pages:number[]}[]} */
function originalPrintedWords(source) {
  const all = [];
  let pages = [];
  let runes = [];
  let page = 0;
  function finish() {
    if (runes.length) all.push({runes, pages});
    runes = [];
    pages = [];
  }
  for (const ch of source) {
    if (index.has(ch)) {
      runes.push(index.get(ch));
      pages.push(page >= 50 ? page + 1 : page);
    } else if (ch === '%') {
      page++;
    } else if (ch === '/' || /\s/u.test(ch)) {
      // Printed line/page breaks do not terminate an ongoing word.
    } else {
      finish();
    }
  }
  finish();
  return all;
}

function main() {
  const source = transcription.split('%').slice(0, 55).join('%');
  const sections = source.split('$')
    .map((part) => Array.from(part).filter((rune) => index.has(rune))
      .map((rune) => index.get(rune))).filter((part) => part.length);
  assert.deepEqual(sections.map((section) => section.length), expectedSectionLengths);
  const original = sections.flat();
  assert.equal(original.length, 12956);
  assert.deepEqual(original, corpus.pages.filter((page) => page.page <= 55)
    .flatMap((page) => page.indices));

  const words = originalPrintedWords(source);
  const seams = words.filter((word) => word.pages[0] !== word.pages.at(-1));
  const finalSectionSeams = seams.filter((word) => word.pages[0] >= 40);
  assert.equal(words.length, 2896);
  assert.equal(seams.length, 32);
  assert.equal(finalSectionSeams.length, 12);

  const native = englishGP(read('resources/control/shakespeare_first300k.txt'));
  assert.ok(native.length > 2 * original.length);
  const originalRows = [];
  const controls = [];
  let pos = 0;
  let recoveredOriginal = 0;
  let recoveredNative = 0;
  let transformedNative = 0;
  for (const [sectionIndex, section] of sections.entries()) {
    const best = strongest(section);
    const expected = expectedBest[sectionIndex];
    assert.deepEqual([best.b, best.c], expected.slice(0, 2));
    assert.ok(Math.abs(best.ioc - expected[2]) < 1e-12);
    const nativeSection = native.slice(pos, pos + section.length);
    pos += section.length;
    const nativeIoC = ioc(nativeSection);
    assert.ok(nativeIoC > 0.055, 'held-out natural GP control is too flat');

    // The source-specific example uses new private keys/alphabet in each section.
    // Its decoder must preserve a complete original-layout native message.
    const b = mod29(7 + 3 * sectionIndex);
    const c = mod29(11 + 5 * sectionIndex);
    const alphabet = outputAlphabet(sectionIndex);
    const syntheticCipher = encode(nativeSection, b, c, alphabet);
    const syntheticPlain = decode(syntheticCipher, b, c, alphabet);
    assert.deepEqual(syntheticPlain, nativeSection);
    assert.deepEqual(encode(syntheticPlain, b, c, alphabet), syntheticCipher);
    recoveredNative += nativeSection.length;
    transformedNative += syntheticCipher.filter((value, i) => value !== nativeSection[i]).length;

    // An arbitrary inverse always reencrypts original input. The original
    // result must independently show native-language concentration, and does not.
    const candidate = decode(section, best.b, best.c, alphabet);
    assert.deepEqual(encode(candidate, best.b, best.c, alphabet), section);
    recoveredOriginal += section.length;
    originalRows.push({section: sectionIndex, runes: section.length, best});
    controls.push({section: sectionIndex, nativeIoC, syntheticCipherIoC: ioc(syntheticCipher)});
  }

  const global = strongest(original);
  assert.deepEqual([global.b, global.c], [28, 0]);
  assert.ok(Math.abs(global.ioc - 0.035325062889034774) < 1e-12);
  assert.equal(recoveredOriginal, 12956);
  assert.equal(recoveredNative, 12956);
  assert.ok(transformedNative > 12000);
  assert.ok(Math.max(...originalRows.map((row) => row.best.ioc)) < 0.036);
  assert.ok(Math.min(...controls.map((row) => row.nativeIoC)) > 0.059);
  assert.ok(ioc(corpus.pages[57].indices) > 0.0627);

  console.log(JSON.stringify({
    status: 'PASS: exhaustive 29^2 two-back projection family',
    originalRunes: original.length,
    sections: sections.length,
    printedWords: words.length,
    wholeWordsCrossingPages: seams.length,
    lastSectionPageSeams: finalSectionSeams.length,
    secretGlobalCoefficients: 29 * 29 * 28,
    secretSectionCoefficients: 'each section independently: 29*29*28',
    secretOutputAlphabets: 'arbitrary independent 29! per section',
    global,
    originalRows,
    controls,
    recoveredOriginal,
    recoveredNative,
    transformedNative,
    result: 'No original unknown plaintext or source-selected key. All native-language source controls exceed every original all-secret IoC ceiling.'
  }, null, 2));
}

main();
