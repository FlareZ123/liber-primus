// @ts-check
/**
 * Key-independent test of literal EA-on-equal-ciphertext marker architecture.
 * GP word boundaries, source-native wordlengths and independent authored prose.
 * Run with Node.js 22 from the repository root; no dependencies beyond built-ins.
 */
'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');

const {words, runeCount, crossPageWords} = parseSharedCorpus();
assert.equal(runeCount, 12956);
assert.equal(words.length, 2896);
assert.equal(crossPageWords, 32);

/** @param {string[]} word @returns {number[]} */
function repeatOffsets(word) {
  const out = [];
  for (let j = 1; j < word.length; j++) if (word[j] === word[j-1]) out.push(j);
  return out;
}
let repeatCount = 0, repeatAtWordEnd = 0;
for (const w of words) {
  const z = [...w.runes], found = repeatOffsets(z);
  repeatCount += found.length;
  repeatAtWordEnd += found.filter(j => j === z.length - 1).length;
}
assert.equal(repeatCount, 63);
assert.equal(repeatAtWordEnd, 19);

const digraphs = ['TH','EO','NG','OE','AE','IA','EA'];
/**
 * Convert actual source word to the published GP29 longest-digraph register.
 * @param {string} text
 * @returns {string[]}
 */
function gpWord(text) {
  const s = text.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const match = digraphs.find(t => s.startsWith(t,i));
    if (match) {out.push(match); i += match.length;}
    else {out.push(s[i]); i++;}
  }
  return out;
}
let seed = 0x3301ac23;
/** @returns {number} Deterministic [0,1) xorshift32 uniform */
function random() {
  seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const originalLengths = words.map(w => w.length);
const files = [
  ['Shakespeare','resources/control/shakespeare_first300k.txt'],
  ['Emerson','resources/control/emerson_essays_2944.txt'],
  ['Gibran','resources/control/gibran_prophet_58585.txt']
];
const result = [];
for (const [name, file] of files) {
  const source = fs.readFileSync(file,'utf8');
  const rawWords = source.match(/[A-Za-z]+/g) || [];
  const byLength = new Map();
  for (const raw of rawWords) {
    const word = gpWord(raw), group = byLength.get(word.length) || [];
    group.push(word);
    byLength.set(word.length, group);
  }
  for (const n of originalLengths) assert(byLength.has(n), `${name}: missing word length ${n}`);
  let totalFinal = 0, totalAll = 0, maxFinal = 0, exceeds = 0;
  for (let rep = 0; rep < 1000; rep++) {
    let final = 0, all = 0;
    for (const n of originalLengths) {
      const candidates = byLength.get(n);
      const word = candidates[Math.floor(random() * candidates.length)];
      for (let j = 1; j < word.length; j++) if (word[j] === 'EA') {
        all++;
        if (j === word.length - 1) final++;
      }
    }
    totalFinal += final; totalAll += all;
    maxFinal = Math.max(maxFinal, final);
    if (final >= repeatAtWordEnd) exceeds++;
  }
  assert.equal(exceeds, 0);
  result.push({name, sourceWords: rawWords.length, draws: 1000,
    expectedTotalWithinWordEA: totalAll / 1000,
    expectedWordFinalEA: totalFinal / 1000,
    maxWordFinalEA: maxFinal,
    controlDrawsAtLeastOriginal: exceeds});
}
console.log(JSON.stringify({original: {words: words.length, runes:runeCount,
  crossPageWords, withinWordAdjacentEqual: repeatCount,
  atWordFinal: repeatAtWordEnd}, controls: result}, null, 2));
