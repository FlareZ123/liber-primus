'use strict';
/**
 * One source-frozen original LP2 p55 Stage04 99x76 key-row gate. Director #580.
 * No adjustable alignment, byte convention, rune shifts, or row permutations.
 * Node.js 22: node sims/lp2_stage04_99x76_p55_rowpad_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json').toString());
const p55 = corpus.pages.find(p => p.page === 55).indices;
const p57 = corpus.pages.find(p => p.page === 57).indices;
const original = read('resources/external/derived/2014-stage04/04-outguess.bin');
const ref = read('resources/liber-primus/lp1-plaintext-reference.txt').toString();
assert.equal(original.length, 7524);
assert.equal(99 * 76, 7524);
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
assert.equal(crypto.createHash('sha256').update(original).digest('hex'),
  '35d31e61275c6b0420e7729161d5f6272122ea7edb87076fe84f3fe3c70af6db');

const letters = corpus.translit;
const byName = new Map(letters.map((name, i) => [name, i]));
const patterns = letters.slice().sort((a, b) => b.length - a.length);
const replace = { K: 'C', Q: 'C', V: 'U', Z: 'S' };
/** @param {string} plain @returns {number[]} */
function gp(plain) {
  const out = [];
  for (const word of (plain.toUpperCase().replace(/#[^\n]*/g, ' ')
    .replace(/\[.*?\]/g, ' ').match(/[A-Z]+/g) || [])) {
    for (let i = 0; i < word.length;) {
      const t = patterns.find(k => word.startsWith(k, i));
      if (t) { out.push(byName.get(t)); i += t.length; }
      else {
        const index = byName.get(replace[word[i]] || word[i]);
        if (index !== undefined) out.push(index);
        i++;
      }
    }
  }
  return out;
}
const native = gp(ref);
const trigram = new Uint32Array(29 ** 3);
const bigram = new Uint32Array(29 ** 2);
for (let i = 2; i < native.length; i++) {
  const context = native[i - 2] * 29 + native[i - 1];
  bigram[context]++;
  trigram[context * 29 + native[i]]++;
}
/** @param {number[]} seq @returns {number} */
function score(seq) {
  let score = 0;
  for (let i = 2; i < seq.length; i++) {
    const c = seq[i - 2] * 29 + seq[i - 1];
    score += Math.log((trigram[c * 29 + seq[i]] + 0.2) / (bigram[c] + 5.8));
  }
  return score / (seq.length - 2);
}
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const h = new Array(29).fill(0);
  seq.forEach(x => h[x]++);
  return h.reduce((s, x) => s + x * (x - 1), 0) / (seq.length * (seq.length - 1));
}
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} ciphertext @param {Uint8Array | Buffer} raw
 *  @returns {{row:number,sign:number,score:number,ioc:number,indices:number[],runes:string}[]} */
function evaluate(ciphertext, raw) {
  const results = [];
  for (let row = 0; row < 99; row++) {
    const key = Array.from(raw.subarray(row * 76, (row + 1) * 76), x => x % 29);
    for (const sign of [-1, 1]) {
      const output = ciphertext.map((c, i) => mod(c + sign * key[i]));
      assert.deepEqual(output.map((x, i) => mod(x - sign * key[i])), ciphertext);
      results.push({row, sign, score: score(output), ioc: ioc(output),
        indices: output, runes: output.map(i => letters[i]).join('-')});
    }
  }
  return results.sort((a, b) => b.score - a.score);
}
const observed = evaluate(p55, original);
assert.equal(observed.length, 198);
const best = observed[0];
const nativePlant = p57.slice(0, 76);
const plantKey = Array.from(original.subarray(0, 76), b => b % 29);
const planted = nativePlant.map((p, i) => mod(p + plantKey[i]));
const recovery = planted.map((c, i) => mod(c - plantKey[i]));
assert.deepEqual(recovery, nativePlant);
assert.notDeepEqual(evaluate(planted, original)[0].indices, new Array(76).fill(-1));

/** Stable Fisher-Yates independent control, source-byte histogram preserved. */
function shuffledBytes(source, rng) {
  const out = Buffer.from(source);
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng() % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
let state = 0x33017524;
const rng = () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return state >>> 0; };
const nullMax = [];
for (let i = 0; i < 256; i++) nullMax.push(evaluate(p55, shuffledBytes(original, rng))[0].score);
nullMax.sort((a, b) => a - b);
const tail = (nullMax.filter(x => x >= best.score).length + 1) / (nullMax.length + 1);
const windows = [];
for (let i = 0; i + 76 <= native.length; i++) windows.push(score(native.slice(i, i + 76)));
windows.sort((a, b) => a - b);
const result = {
  input: {source: 'Stage04 original binary, no 2014 creator-authenticated decoder',
    bytes: original.length, keyRows: 99, keyColumns: 76, runeCount: p55.length},
  output: {
    scoreOriginalRaw: score(p55), iocOriginalRaw: ioc(p55),
    best, top10: observed.slice(0, 10).map(({row,sign,score,ioc})=>({row,sign,score,ioc})),
    controlNativeP57First76: {score:score(nativePlant),ioc:ioc(nativePlant)},
    lp1Native76: {windows:windows.length,min:windows[0],q01:windows[Math.floor(windows.length / 100)]},
    sourceBytePermutationNull: {trials: nullMax.length, each: 198,
      median: nullMax[128], q95: nullMax[243], bestFamilywiseEmpiricalUpperTail: tail}
  },
  controls: {
    nativePlantEncryptedThenRecoveredExactly: recovery.length,
    all99RowsAllSignsOriginalReencryption: true,
    allOutputsPreserveOriginal76Positions: true
  },
  conclusion: 'No native GP words or authenticated original key follow from any of the 198 frozen original Stage04 row pads.'
};
console.log(JSON.stringify(result,null,2));
