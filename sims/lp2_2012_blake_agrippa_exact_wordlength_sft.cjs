'use strict';

/**
 * Historical 2012 Cicada text donors as exact original LP2 printed-word
 * length cribs. Only an authentic long-length hit would nominate plaintext;
 * this script makes no key or plaintext-recovery claim.
 *
 * Run from the repository root:
 * node sims/lp2_2012_blake_agrippa_exact_wordlength_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseSharedCorpus} = require('./lp2_word_pages.cjs');

const root = path.join(__dirname, '..');
/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

/**
 * Match the existing GP-control normalization: QU=>CW, V=>U, K=>C,
 * Z=>S and longest available ING, TH, NG, EO, OE, AE, IA, EA rune.
 * @param {string} text
 * @returns {number[]}
 */
function gpWordLengths(text) {
  const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const table = new Map(corpus.translit.map((name, index) => [name, index]));
  table.set('ING', 21);
  return (text.toUpperCase().match(/[A-Z]+/g) || []).map((word) => {
    const s = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    let runes = 0;
    for (let index = 0; index < s.length;) {
      let matched = false;
      for (const width of [3, 2, 1]) {
        if (table.has(s.slice(index, index + width))) {
          index += width;
          runes++;
          matched = true;
          break;
        }
      }
      assert.ok(matched, 'unencodable source word: ' + word);
    }
    return runes;
  });
}

/**
 * Exact longest common contiguous sequence, every start and continuation.
 * O(N*M) time and O(M) RAM, no fitting/threshold shortcuts.
 * @param {number[]} target
 * @param {number[]} source
 */
function longestExact(target, source) {
  const dp = new Uint16Array(source.length + 1);
  let best = {length: 0, manuscriptWord: 0, sourceWord: 0};
  for (let i = 1; i <= target.length; i++) {
    for (let j = source.length; j >= 1; j--) {
      dp[j] = target[i - 1] === source[j - 1] ? dp[j - 1] + 1 : 0;
      if (dp[j] > best.length) {
        best = {length: dp[j], manuscriptWord: i - dp[j],
          sourceWord: j - dp[j]};
      }
    }
  }
  return best;
}

const original = parseSharedCorpus();
assert.equal(original.words.length, 2896);
assert.equal(original.runeCount, 12956);
const target = original.words.map((word) => word.length);
const blake = gpWordLengths(
  read('resources/external/blake-marriage-1906-gutenberg45315.txt'));
const agrippaRecord = JSON.parse(
  read('resources/external/cicada2012-agrippa-gibson-archived-gp-wordlengths.json'));
const agrippa = agrippaRecord.word_lengths;
assert.equal(blake.length, 4609);
assert.equal(agrippa.length, 1682);
assert.equal(agrippaRecord.schema, 1);
assert.equal(agrippaRecord.kind,
  'derived GP29 word lengths only; no copyrighted poem stored');

const findings = [];
for (const [name, source] of [
  ['2012 Blake Marriage (1906 Gutenberg edition)', blake],
  ['2012 Gibson Agrippa (archived historical length register)', agrippa],
]) {
  const match = longestExact(target, source);
  const shape = target.slice(match.manuscriptWord,
    match.manuscriptWord + match.length);
  const start = original.words[match.manuscriptWord];
  findings.push({
    name, sourceWords: source.length, match, shape,
    manuscriptStartPhysicalPage: start.startPage >= 50
      ? start.startPage + 1 : start.startPage,
  });
  assert.equal(match.length, 8);
}

// A real 16-word verbatim donor in an untouched copy is recoverable,
// regardless of the original's observed accidental eight-word overlap.
for (const [name, source] of [['Blake', blake], ['Agrippa', agrippa]]) {
  const planted = target.slice();
  planted.splice(1000, 16, ...source.slice(300, 316));
  assert.ok(longestExact(planted, source).length >= 16,
    'native source planted passage not found: ' + name);
}

console.log(JSON.stringify({
  status: 'bounded full-source word-length-crib negative',
  originalWords: target.length,
  originalRunes: original.runeCount,
  findings,
  complete16WordPositivePlant: '2/2',
  unknownLp2PlaintextRecovered: false,
}, null, 2));
