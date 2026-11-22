'use strict';

/**
 * Author-native original clear-LP1 doublet control versus LP2 unknown pages.
 * Compare only genuinely printed GP rune pairs on a physical source page.
 * The control spans are visible clear GP prose, selected by source-visible
 * opening text before any ciphertext statistics are read.
 *
 * Run: node sims/lp2_original_author_clear_gp_doublet_control_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const file = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(file('resources/liber-primus/lp2-corpus.json'));
const runes = new Set(corpus.runes);
const source = file('resources/transcriptions/lp1_wulfic_canonical.txt');
const sections = source.split('%');
// A few authenticated unencrypted first-release passages:
// SOME WISDOM, THE LOSS OF DIVINITY, WE HAVE, MOST THINGS,
// the subsequent continued clear pages, and AN INSTRUCTION.
// The source '&' delimiter is an actual physical page break within sections;
// the '%' delimiter closes a section. Never join across either.
const clearSectionIndices = [3,8,9,10,11,14];

/** @param {string} text */
function clean(text) {
  return [...text].filter(c => runes.has(c));
}

/** @param {Array<Array<string|number>>} seqs */
function count(seqs) {
  let runesN = 0;
  let eligible = 0;
  let repeated = 0;
  for (const seq of seqs) {
    runesN += seq.length;
    eligible += Math.max(0, seq.length - 1);
    for (let j = 1; j < seq.length; j++) repeated += Number(seq[j] === seq[j - 1]);
  }
  return {runes: runesN, eligible, repeated, proportion: repeated / eligible};
}

const controls = clearSectionIndices.map(index => {
  const parts = sections[index].split('&').map(clean).filter(p => p.length>0);
  return {sourceSection: index, ...count(parts)};
});
assert.deepEqual(controls.map(x => x.runes), [157,187,207,192,169,89]);
assert.deepEqual(controls.map(x => x.repeated), [7,7,5,3,3,3]);
assert.deepEqual(controls.map(x => x.eligible), [155,186,206,191,166,87]);
const clear = count(clearSectionIndices.flatMap(i => sections[i].split('&').map(clean).filter(x=>x.length)));
assert.deepEqual({runes:clear.runes, eligible:clear.eligible, repeated:clear.repeated},
  {runes:1001, eligible:991, repeated:28});

const unknown = count(corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .map(p => p.indices));
assert.deepEqual({runes:unknown.runes, eligible:unknown.eligible, repeated:unknown.repeated},
  {runes:12956, eligible:12901, repeated:86});
const solvedP57 = count([corpus.pages[57].indices]);
assert.deepEqual({runes:solvedP57.runes, eligible:solvedP57.eligible, repeated:solvedP57.repeated},
  {runes:95, eligible:94, repeated:1});
const authorPooled = {
  runes: clear.runes+solvedP57.runes,
  eligible: clear.eligible+solvedP57.eligible,
  repeated: clear.repeated+solvedP57.repeated,
};
const ratio = (clear.repeated / clear.eligible) / (unknown.repeated / unknown.eligible);
const pooledRatio = (authorPooled.repeated / authorPooled.eligible) /
  (unknown.repeated / unknown.eligible);
console.log(JSON.stringify({source: {
  originalLP1:'resources/transcriptions/lp1_wulfic_canonical.txt',
  originalLP2:'resources/liber-primus/lp2-corpus.json',
  selectedOriginalClearSections:clearSectionIndices,
  originalPhysicalPageDelimiter:'&', sectionDelimiter:'%'
},controls,clear,unknown,solvedP57,
  clearToUnknownRateRatio:ratio,
  pooledAuthorToUnknownRateRatio:pooledRatio},null,2));
console.log('PASS: original author clear GP text has much higher same-page doublet rate');
console.log('than encrypted LP2. Language/style and adjacent-site dependence remain caveats.');
