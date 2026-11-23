'use strict';
// Read-only, offline original-source single-file test for Director #2393.
// Usage from the repository: node sims/lp2_onion6_quoted_crib_original_sft.cjs

/** @typedef {{ start:number, end:number, text:string }} Word */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const archive = JSON.parse(read('resources/external/2014-onion6-seven-rune-pages.json'));
const quoteMetadata = JSON.parse(read('resources/liber-primus/lp2-quote-punctuation-spans.json'));
const originalTape = read('resources/liber-primus/lp2-transcription.txt');
const RUNE = /[\u16A0-\u16FF]/u;
const LATIN = /[A-Za-z]/;

/** Count Unicode GP glyphs (or Latin letters) in physical printed words.
 * Slash/newline, percent page markers and source colon-before-F do not split words.
 * Printed word boundaries alone split words. Original ciphertext rune offsets
 * are accumulated before splitting, preserving genuine physical page carries.
 * @param {string} source
 * @param {RegExp} letter
 * @returns {{ words:Word[], count:number }}
 */
function parseWords(source, letter) {
  /** @type {Word[]} */
  const words = [];
  let word = '';
  let start = 0;
  let count = 0;
  function flush() {
    if (word) {
      words.push({ start, end:count, text:word });
      word = '';
    }
  }
  for (const c of source) {
    if (letter.test(c)) {
      if (!word) start = count;
      word += c.toUpperCase();
      count++;
    } else if ('-.$&§'.includes(c)) {
      flush();
    }
  }
  flush();
  return { words, count };
}

/** Canonical 2014 GP composite-letter spelling, longest match first.
 * @param {string} word
 * @returns {number}
 */
function projectedLength(word) {
  const parts = ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'EA', 'IA'];
  let i = 0, length = 0;
  while (i < word.length) {
    const compound = parts.find(p => word.startsWith(p, i));
    i += compound ? compound.length : 1;
    length++;
  }
  return length;
}

/** Exhaustive fixed-word-count source scan and longest contiguous run.
 * @param {number[]} target
 * @param {number[]} donor
 */
function compare(target, donor) {
  let fullMatches = 0;
  let maxWords = 0;
  let maxRunes = 0;
  let coordinates = null;
  for (let ti = 0; ti < target.length; ti++) {
    for (let di = 0; di < donor.length; di++) {
      let n = 0, runes = 0;
      while (ti+n < target.length && di+n < donor.length &&
             target[ti+n] === donor[di+n]) {
        runes += target[ti+n];
        n++;
      }
      if (ti === 0 && n === target.length) fullMatches++;
      if (n > maxWords || (n === maxWords && runes > maxRunes)) {
        maxWords = n;
        maxRunes = runes;
        coordinates = { quoteWordOffset:ti, sourceWordOffset:di };
      }
    }
  }
  return { fullMatches, maxWords, maxRunes, coordinates };
}

const tape = parseWords(originalTape, RUNE);
assert.equal(tape.count, 13136, 'full original LP2 tape including solved p56/57');
assert.equal(tape.words.filter(w => w.start < 12956).length, 2896);
const targets = quoteMetadata.quotes.map((q, n) => {
  const selected = tape.words.filter(w => w.start >= q.start && w.end <= q.end);
  assert.equal(selected[0].start, q.start, 'quote start ' + n);
  assert.equal(selected[selected.length - 1].end, q.end, 'quote end ' + n);
  const lengths = selected.map(w => w.text.length);
  assert.equal(lengths.reduce((a,b)=>a+b,0), q.length);
  return lengths;
});
assert.deepEqual(targets.map(t => t.length), [4,5,2,14,13,34,14]);

const originalPages = archive.originals.map(p => p.runic_text);
assert.deepEqual(archive.originals.map(p => p.page),
  ['10','11','12','13','107','167','229']);
const runicGroups = [
  originalPages.slice(0,4).join('\n'),
  originalPages.slice(4,6).join('\n'),
  originalPages[6]
];
const original = runicGroups.map(s => parseWords(s, RUNE).words.map(w=>w.text.length));
assert.deepEqual(original.map(s=>s.length), [181,87,18]);
assert.deepEqual(runicGroups.map(s=>parseWords(s,RUNE).count), [755,319,89]);

const corrected = archive.corrected_roman.map(p => parseWords(p.text, LATIN).words.map(w=>w.text));
assert.deepEqual(corrected.map(s=>s.length), [181,87,18]);
const modes = {
  'source-native-GP-runes':original,
  'editorially-corrected-GP29':corrected.map(s=>s.map(projectedLength)),
  'editorially-corrected-raw-Latin':corrected.map(s=>s.map(w=>w.length))
};
const result = Object.fromEntries(Object.entries(modes).map(([name, groups]) =>
  [name, targets.map(q => groups.map(g => compare(q,g)))]
));
for (const rows of Object.values(result)) {
  for (const i of [0,1,3,4,5,6]) {
    assert.ok(rows[i].every(z => z.fullMatches === 0));
  }
  assert.ok(rows.every(row => row.every(z => z.maxWords < 12 && z.maxRunes < 40)));
}
assert.equal(result['source-native-GP-runes'][2][0].fullMatches, 2);
assert.equal(result['editorially-corrected-raw-Latin'][2][0].fullMatches, 5);
assert.equal(result['source-native-GP-runes'][5][0].maxWords, 6);
assert.equal(result['source-native-GP-runes'][5][0].maxRunes, 22);

console.log(JSON.stringify({
  sourcePages:archive.originals.map(p => p.page),
  sourceWordCounts:original.map(g=>g.length),
  quotedWordVectors:targets,
  byConvention:result,
  interpretation:'NO full 12-word/40-rune 2014 Onion6 literal quote crib'
}, null, 2));
