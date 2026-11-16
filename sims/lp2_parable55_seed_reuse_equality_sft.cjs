'use strict';

/**
 * PARABLE strict-inner-rune 55-symbol proposed page seeds: a necessary,
 * unknown-key-independent test for page-local reused substitution streams.
 *
 * If two pages with identical seed reuse any same-position GP29 bijections,
 * equality C_a[j]===C_b[j] iff P_a[j]===P_b[j]. This includes arbitrary
 * repeated additive keystreams, arbitrary repeated 29-rune permutations,
 * and many nonstationary page-key generators.
 *
 * SFT: node sims/lp2_parable55_seed_reuse_equality_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const p57 = read('resources/lp2-transcription.txt').split('%').slice(-1)[0]
  .replace(/\/\r?\n/g, '').replace(/\r?\n/g, '');
const mapping = new Map(gp.runes.map((r, i) => [r, i]));
const rx = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const p57Words = (p57.match(rx) || []).map(word =>
  Array.from(word, char => mapping.get(char)));
assert.equal(p57Words.length, 20);
assert.equal(p57Words.flat().length, 95);
const title = p57Words[0].slice(1, -1);
const body = p57Words.slice(1).flatMap(word => word.slice(1, -1));
assert.equal(title.length, 5);
assert.equal(body.length, 50);
const pages = gp.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length, 0), 12956);

/**
 * Compare all original page pairs sharing a proposed fixed source seed.
 * @param {number[][]} groups
 * @param {number[]} seeds
 */
function sameSeedMatches(groups, seeds) {
  let comparisons = 0;
  let matches = 0;
  let pairCount = 0;
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      if (seeds[i] !== seeds[j]) continue;
      pairCount++;
      const n = Math.min(groups[i].length, groups[j].length);
      for (let k = 0; k < n; k++) {
        comparisons++;
        matches += Number(groups[i][k] === groups[j][k]);
      }
    }
  }
  return {pairCount, comparisons, matches, proportion: matches / comparisons};
}
const source = pages.map(p => p.indices);
const keys = {
  printed_title_first: [...title, ...body],
  table_split_body_first: [...body, ...title]
};
const original = Object.fromEntries(Object.entries(keys).map(([name, seed]) =>
  [name, sameSeedMatches(source, seed)]));
assert.deepEqual([original.printed_title_first.pairCount,
  original.printed_title_first.comparisons,
  original.printed_title_first.matches], [106, 22716, 785]);
assert.deepEqual([original.table_split_body_first.pairCount,
  original.table_split_body_first.comparisons,
  original.table_split_body_first.matches], [106, 23150, 826]);

// Public-domain English reference texts are pinned independently of the
// unknown LP2 ciphertext. Deterministic source-native GP29 orthography.
const sorted = gp.translit.map((t, i) => ({t, i}))
  .sort((a, b) => b.t.length - a.t.length);
/** @param {string} text */
function encodeEnglish(text) {
  const words = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S')
    .match(/[A-Z]+/g) || [];
  /** @type {number[]} */
  const out = [];
  for (const word of words) {
    for (let offset = 0; offset < word.length;) {
      const candidate = sorted.find(v => word.startsWith(v.t, offset));
      if (candidate) {
        out.push(candidate.i);
        offset += candidate.t.length;
      } else {
        offset++;
      }
    }
  }
  return out;
}
/** @param {number[]} input */
function makeOriginalLengthPages(input) {
  let cursor = 0;
  const output = pages.map(page => {
    const symbols = input.slice(cursor, cursor + page.indices.length);
    cursor += page.indices.length;
    return symbols;
  });
  assert.equal(cursor, 12956);
  assert(output.every((symbols, i) => symbols.length === pages[i].indices.length));
  return output;
}
const english = {};
for (const [label, file] of [
  ['gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['emerson', 'resources/control/emerson_essays_2944.txt']
]) {
  const plaintext = makeOriginalLengthPages(encodeEnglish(read(file)));
  english[label] = Object.fromEntries(Object.entries(keys).map(([name, seed]) =>
    [name, sameSeedMatches(plaintext, seed)]));
  for (const seed of Object.values(keys)) {
    // Positive plant: any deterministic position-wise source-seeded shift
    // leaves equality between equal-seed page pairs exactly unchanged.
    const planted = plaintext.map((page, i) => page.map((v, j) =>
      (v + 17 * seed[i] + 13 * j + (j * j % 29)) % 29));
    assert.deepEqual(sameSeedMatches(planted, seed),
      sameSeedMatches(plaintext, seed));
  }
}
assert.equal(english.gibran.printed_title_first.matches, 1351);
assert.equal(english.gibran.table_split_body_first.matches, 1420);
assert.equal(english.emerson.printed_title_first.matches, 1437);
assert.equal(english.emerson.table_split_body_first.matches, 1405);
console.log(JSON.stringify({
  original, independentEnglishControls: english,
  conclusion: 'No source-patterned equal-seed page-start reused GP29 substitution stream to ordinary English register'
}, null, 2));
