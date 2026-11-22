'use strict';

/**
 * A small source-motivated terminal-75 key test on original LP2, not a decoder.
 * The solved p57 has 95 runes in 20 printed words, so stripping one edge
 * rune per word gives 75 GP29 values, equal to p55 after its carried NG.
 *
 * Four predeclared elementary additive receivers:
 * remove first or last rune of every p57 word; p55 body minus/plus the key.
 * No key rotations, phase search, alternate page cuts or hidden parameters.
 *
 * Run on Windows 11 / Node.js 22 from the repository root:
 * node sims/lp2_p57_edge75_p55_carry_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const GP = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const ROM = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X',
  'S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
assert.equal([...GP].length, 29);
assert.equal(ROM.length, 29);

/** @param {number} a @returns {number} */
const mod = a => ((a % 29) + 29) % 29;

/**
 * @param {number[]} arr
 * @returns {number}
 */
const ioc = arr => {
  const freq = Array(29).fill(0);
  for (const v of arr) {
    assert(Number.isInteger(v) && v >= 0 && v < 29);
    freq[v] += 1;
  }
  return freq.reduce((t, f) => t + f * (f - 1), 0)
    / (arr.length * (arr.length - 1));
};

/** @param {number[]} values @returns {string} */
const roman = values => values.map(x => ROM[x]).join('');

/**
 * Recover canonical p57 printed whole words, joining genuine physical wraps.
 * @returns {number[][]}
 */
function p57Words() {
  const src = fs.readFileSync(path.join(__dirname,
    '../resources/liber-primus/lp2-transcription.txt'), 'utf8');
  const pages = src.split('%');
  assert.equal(pages.length, 57); // physical p50 is the runeless table
  const last = pages.at(-1).replace(/[\r\n/&]/g, '');
  const words = last.split(/[-.]+/)
    .map(span => Array.from(span)
      .filter(c => GP.includes(c))
      .map(c => GP.indexOf(c)))
    .filter(v => v.length);
  assert.equal(words.length, 20);
  assert.equal(words.flat().length, 95);
  assert.deepEqual(words.flat(), corpus.pages[57].indices);
  assert.deepEqual(words.map(v => v.length),
    [7, 4, 2, 6, 7, 2, 2, 7, 2, 4, 4, 3, 3, 14, 4, 2, 8, 5, 3, 6]);
  return words;
}

function main() {
  const p55 = corpus.pages[55].indices;
  const p57 = corpus.pages[57].indices;
  assert.equal(p55.length, 76);
  assert.equal(p57.length, 95);
  assert.equal(p55[0], 21); // original physical p54→55 carried NG
  const body = p55.slice(1);
  assert.equal(body.length, 75);
  const words = p57Words();
  const first = words.flatMap(w => w.slice(1));
  const last = words.flatMap(w => w.slice(0, -1));
  assert.equal(first.length, 75);
  assert.equal(last.length, 75);
  assert.notDeepEqual(first, last);

  /** @type {{edge:string, sign:string, normalized_ioc:number, plaintext_roman:string}[]} */
  const results = [];
  for (const [edge, key] of [['remove-first', first], ['remove-last', last]]) {
    for (const sign of ['C-minus-K', 'C-plus-K']) {
      const minus = sign === 'C-minus-K';
      const plain = body.map((c, i) =>
        mod(c + (minus ? -key[i] : key[i])));
      const recovered = plain.map((p, i) =>
        mod(p + (minus ? key[i] : -key[i])));
      assert.deepEqual(recovered, body);
      results.push({
        edge, sign,
        normalized_ioc: Number(ioc(plain).toFixed(12)),
        plaintext_roman: roman(plain)
      });
    }
  }

  const solvedWindowIocs = Array.from({length: 21}, (_, i) =>
    ioc(p57.slice(i, i + 75)));
  const clearMin = Math.min(...solvedWindowIocs);
  assert(clearMin > 0.059);
  assert(results.every(x => x.normalized_ioc < clearMin));
  assert.deepEqual(results.map(x => x.normalized_ioc), [
    0.03963963964, 0.034234234234, 0.033513513514, 0.038198198198
  ]);
  console.log(JSON.stringify({
    original_p55_runes: 76,
    original_p55_carried_NG: 1,
    original_p55_remaining_runes: 75,
    original_clear_p57_runes: 95,
    original_clear_p57_printed_words: 20,
    exact_edge_stripped_key_length: 75,
    solved_p57_full_ioc: ioc(p57),
    solved_p57_min_sliding_75_ioc: clearMin,
    results,
    conclusion: 'All four direct additive edge75 candidates are nonlinguistic. ' +
      'The length match alone supplies no authentic cipher opcode or plaintext.'
  }, null, 2));
}
main();
