'use strict';
/**
 * SFT: finite direct 2012-Mabinogion (original Middle Welsh) running key.
 *
 * Source-native GP29 key characters in literal word order, all key starts.
 * Fixed operators: standard additive Vigenere C=P+K; same operation on
 * ciphertext differential stream delta(C)=P+K. Authentic solved-LP1 plaintext
 * is a 729-rune matched native-positive. No AI plaintext scoring.
 *
 * Windows 11 / Node 22:
 * node sims/lp2_welsh_bookkey_p0_classical_running_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const token = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} word @returns {number[]} */
function gpEncode(word) {
  const s = word.toUpperCase().normalize('NFD')
    .replace(/\p{M}/gu, '').replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  assert.match(s, /^[A-Z]+$/u);
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      out.push(21); i += 3;
    } else if (s.startsWith('IO', i)) {
      out.push(27); i += 2;
    } else {
      const t = token.find(x => s.startsWith(x.s, i));
      assert(t, 'missing GP rune for '+s);
      out.push(t.i); i += t.s.length;
    }
  }
  return out;
}
const source = read('resources/control/pwyll_pendeuic_dyuet_welsh_source.txt')
  .split(/={20,}\r?\n\r?\n/u)[1];
assert(source && source.startsWith('Pwyll Pendeuic Dyuet'));
const key = (source.match(/\p{L}+/gu) || []).flatMap(gpEncode);
assert.equal(key.length, 27009);
const opening = gp.pages.slice(0, 3).flatMap(p => p.indices);
const holdout = gp.pages.slice(3, 8).flatMap(p => p.indices);
assert.equal(opening.length, 729);
assert.equal(holdout.length, 1145);
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const frequencies = new Uint16Array(29);
  for (const x of a) frequencies[x]++;
  return frequencies.reduce((sum, n) => sum + n * (n - 1), 0)
    / (a.length * (a.length - 1));
}
/**
 * @param {number[]} ciphertext
 * @param {number} keyOffset
 * @param {'raw'|'chain'} mode
 * @returns {number[]}
 */
function decode(ciphertext, keyOffset, mode) {
  const out = [];
  let prev = 0;
  ciphertext.forEach((c, i) => {
    const delta = mode === 'raw' ? c : (c - prev + 29) % 29;
    out.push((delta - key[keyOffset + i] + 29) % 29);
    prev = c;
  });
  return out;
}
/**
 * @param {number[]} plaintext
 * @param {number} keyOffset
 * @param {'raw'|'chain'} mode
 * @returns {number[]}
 */
function encrypt(plaintext, keyOffset, mode) {
  let prev = 0;
  const ciphertext = [];
  plaintext.forEach((p, i) => {
    const value = (p + key[keyOffset + i]) % 29;
    prev = mode === 'raw' ? value : (prev + value) % 29;
    ciphertext.push(prev);
  });
  return ciphertext;
}
// Authentically solved plaintext: unencrypted LP1 p10–p13, 755 GP29 runes.
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt').replace(/\r\n/g, '\n');
const start = lp1.indexOf('ᚦᛖ-ᛚᚩᛋᛋ');
const end = lp1.indexOf('\n$\n%\n', start);
assert(start >= 0 && end > start);
const plainNative = lp1.slice(start, end).replace(/\/\n%\n/gu, '')
  .replace(/\/\n/gu, '').replace(/\n/gu, '');
const nativeRunes = [...plainNative].filter(x => gp.runes.includes(x))
  .map(x => gp.runes.indexOf(x));
assert.equal(nativeRunes.length, 755);
const plant = nativeRunes.slice(0, opening.length);
const baseIoC = ioc(plant);
assert(baseIoC > 0.05);
const plantStart = 3301;
for (const mode of ['raw', 'chain']) {
  const c = encrypt(plant, plantStart, mode);
  assert.deepEqual(decode(c, plantStart, mode), plant);
  assert.equal(ioc(decode(c, plantStart, mode)), baseIoC);
}
console.log('SOLVED-CICADA plant: LP1 p10–13 original rune register '
  + plant.length + ' symbols, native IoC '+baseIoC.toFixed(7)
  + ', both Welsh-key encrypt/decrypt modes exact');

// Exact all-offset receiver on original untouched p0/p1/p2 ciphertext.
for (const mode of ['raw', 'chain']) {
  let bestIoc = -1;
  let bestOffset = -1;
  const scoredFixed = [];
  for (let offset = 0; offset <= key.length - opening.length; offset++) {
    const histogram = new Uint16Array(29);
    let prev = 0;
    for (let i = 0; i < opening.length; i++) {
      const c = opening[i];
      const sourceValue = mode === 'raw' ? c : (c - prev + 29) % 29;
      histogram[(sourceValue - key[offset + i] + 29) % 29]++;
      prev = c;
    }
    const score = histogram.reduce((sum, n) => sum + n * (n - 1), 0)
      / (opening.length * (opening.length - 1));
    if (score > bestIoc) {
      bestIoc = score;
      bestOffset = offset;
    }
    if ([0, 133, 331, 3301].includes(offset)) {
      scoredFixed.push({offset, ioc: score});
    }
  }
  const recovered = decode(opening, bestOffset, mode);
  const verifyCiphertext = encrypt(recovered, bestOffset, mode);
  assert.deepEqual(verifyCiphertext, opening);
  const heldoutSourceOffset = bestOffset + opening.length;
  const heldoutRecovered = decode(holdout, heldoutSourceOffset, mode);
  const replay = encrypt(heldoutRecovered, heldoutSourceOffset, mode);
  assert.deepEqual(replay, holdout);
  console.log(JSON.stringify({
    mode, originalOpeningRunes: opening.length,
    sourceKeyRunes: key.length,
    startsTested: key.length - opening.length + 1,
    rawOpeningIoC: ioc(opening),
    bestOffset, bestOpeningIoC: bestIoc,
    knownSourceStarts: scoredFixed,
    independentOriginalHoldoutRunes: holdout.length,
    heldoutIoC: ioc(heldoutRecovered),
    openingFirst64GP: recovered.slice(0, 64).map(x => gp.translit[x]).join(' ')
  }, null, 2));
  assert(bestIoc < 0.05, 'Unexpected prose-frequency score: investigate');
}
console.log('PASS: original p0–p2, disjoint original p3–p7 and two solved-LP1 plants');
