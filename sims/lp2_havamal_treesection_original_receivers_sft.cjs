'use strict';
/**
 * SFT: independently frozen Old Norse Havamal source-key hypothesis.
 * Source: LP2 seven tree-illustrated pages p8..p14, 1729 original runes.
 * Key: original Old Norse Havamal GP29, in printed word order, all offsets.
 * Encodings: direct additive, ciphertext-differential additive, and the
 * 28-nonzero-step alphabet (EA sentinel) motivated by rare original doublets.
 *
 * Windows 11 / Node 22:
 * node sims/lp2_havamal_treesection_original_receivers_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const letters = gp.translit.map((s,i) => ({s,i}))
  .sort((a,b) => b.s.length - a.s.length);
/** @param {string} word @returns {number[]} */
function gpEncode(word) {
  const source = word.toUpperCase().replace(/Þ/g, 'TH')
    .replace(/Ð/g, 'TH').replace(/Æ/g, 'AE').replace(/Œ/g, 'OE')
    .replace(/[ØǪÖ]/g, 'O').normalize('NFD')
    .replace(/\p{M}/gu, '').replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  assert.match(source, /^[A-Z]+$/u);
  const out = [];
  for (let i = 0; i < source.length;) {
    if (source.startsWith('ING', i)) {
      out.push(21); i += 3;
    } else if (source.startsWith('IO', i)) {
      out.push(27); i += 2;
    } else {
      const item = letters.find(x => source.startsWith(x.s, i));
      assert(item);
      out.push(item.i); i += item.s.length;
    }
  }
  return out;
}
const havamal = read('resources/control/havamal_old_norse_source.txt')
  .replace(/^I\.\s*/u, '');
const key = (havamal.match(/\p{L}+/gu) || []).flatMap(gpEncode);
assert.equal(key.length, 14282);
const sourceChapter = gp.pages.slice(8, 15).flatMap(p => p.indices);
const heldout = gp.pages.slice(15, 22).flatMap(p => p.indices);
assert.equal(sourceChapter.length, 1729);
assert.equal(heldout.length, 1772);
/** @param {number} n @returns {number} */
const mod28 = n => (n % 28 + 28) % 28;
/**
 * @param {number[]} ciphertext
 * @param {number} off
 * @param {'raw'|'chain'|'ea-skip'} mode
 * @returns {number[]}
 */
function decode(ciphertext, off, mode) {
  const clear = [];
  let prev = 0;
  ciphertext.forEach((c, i) => {
    const delta = mode === 'raw' ? c : (c - prev + 29) % 29;
    if (mode === 'ea-skip') {
      clear.push(delta === 0 ? 28 : mod28(delta - 1 - key[off+i]));
    } else {
      clear.push((delta - key[off+i] + 29) % 29);
    }
    prev = c;
  });
  return clear;
}
/**
 * @param {number[]} clear
 * @param {number} off
 * @param {'raw'|'chain'|'ea-skip'} mode
 * @returns {number[]}
 */
function encrypt(clear, off, mode) {
  const cipher = [];
  let prev = 0;
  clear.forEach((p, i) => {
    const step = mode === 'ea-skip'
      ? (p === 28 ? 0 : 1 + mod28(p + key[off+i]))
      : (p + key[off+i]) % 29;
    prev = mode === 'raw' ? step : (prev + step) % 29;
    cipher.push(prev);
  });
  return cipher;
}
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const f = new Uint16Array(29);
  data.forEach(x => f[x]++);
  return f.reduce((s, x) => s + x * (x - 1), 0)
    / (data.length * (data.length - 1));
}
// Solved LP1 p10–p13: 755 genuine original unencrypted GP runes.
const native = read('resources/transcriptions/lp1_wulfic_canonical.txt').replace(/\r\n/g, '\n');
const nativeStart = native.indexOf('ᚦᛖ-ᛚᚩᛋᛋ');
const nativeEnd = native.indexOf('\n$\n%\n', nativeStart);
assert(nativeStart >= 0 && nativeEnd > nativeStart);
const gpNative = [...native.slice(nativeStart, nativeEnd)]
  .filter(ch => gp.runes.includes(ch))
  .map(ch => gp.runes.indexOf(ch));
assert.equal(gpNative.length, 755);
const nativeIoC = ioc(gpNative);
assert(nativeIoC > 0.05);
for (const mode of ['raw', 'chain', 'ea-skip']) {
  const ct = encrypt(gpNative, 138, mode);
  assert.deepEqual(decode(ct, 138, mode), gpNative);
  assert.equal(ioc(decode(ct, 138, mode)), nativeIoC);
}
console.log('Positive: 755 solved-LP1 original runes, three source-key '
  + 'receivers, all native and exact, IoC ' + nativeIoC.toFixed(7));

// Frozen real source region and fixed disjoint holdout. No guessed plaintext.
for (const mode of ['raw', 'chain', 'ea-skip']) {
  let bestAt = -1;
  let bestScore = -1;
  const fixed = [];
  for (let at = 0; at <= key.length - sourceChapter.length; at++) {
    const f = new Uint16Array(29);
    let prev = 0;
    for (let i = 0; i < sourceChapter.length; i++) {
      const c = sourceChapter[i];
      const d = mode === 'raw' ? c : (c - prev + 29) % 29;
      const plain = mode === 'ea-skip'
        ? (d === 0 ? 28 : mod28(d - 1 - key[at+i]))
        : (d - key[at+i] + 29) % 29;
      f[plain]++;
      prev = c;
    }
    const score = f.reduce((sum, n) => sum + n*(n-1), 0)
      / (sourceChapter.length * (sourceChapter.length - 1));
    if (score > bestScore) {
      bestScore = score;
      bestAt = at;
    }
    if ([0, 9, 138, 3301].includes(at)) fixed.push({at, score});
  }
  const decrypted = decode(sourceChapter, bestAt, mode);
  const testHoldout = decode(heldout, bestAt + sourceChapter.length, mode);
  assert.deepEqual(encrypt(decrypted, bestAt, mode), sourceChapter);
  assert.deepEqual(encrypt(testHoldout, bestAt + sourceChapter.length, mode), heldout);
  console.log(JSON.stringify({
    mode, sourceLength: key.length, originalRunes: sourceChapter.length,
    starts: key.length - sourceChapter.length + 1,
    originalRawIoC: ioc(sourceChapter), bestAt, bestOpeningIoC: bestScore,
    disjointHoldoutRunes: heldout.length, disjointHoldoutIoC: ioc(testHoldout),
    fixedSourceStarts: fixed,
    originalFirst64GP: decrypted.slice(0,64).map(x => gp.translit[x]).join(' ')
  }, null, 2));
  assert(bestScore < 0.05, 'Unexpected original source text probability: inspect');
}
console.log('PASS: authentic original tree chapter, 1772-rune holdout, three controls');
