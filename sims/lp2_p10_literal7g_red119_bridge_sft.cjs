'use strict';

/**
 * Reproduce the original-source p10 literal "7 G" -> 119 selector candidate.
 * This is an address hypothesis, not an LP2 decryption or cipher proof.
 * Run from any directory with Node.js 22.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const runes = Array.from(corpus.runes);
const runeSet = new Set(runes);
const transcriptPages = transcription.split(/^%$/m);

// The runeless physical p50 has no segment in this transcription.
assert.equal(transcriptPages.length, 57);
let transcribed = 0;
for (let i = 0; i < transcriptPages.length; i++) {
  const page = i < 50 ? i : i + 1;
  const textRunes = Array.from(transcriptPages[i]).filter((r) => runeSet.has(r));
  assert.deepEqual(textRunes.map((r) => runes.indexOf(r)), corpus.pages[page].indices);
  transcribed += textRunes.length;
}
assert.equal(transcribed, 13136);

/** @type {Array<{page:number,digit:number,following:string,runeOffset:number}>} */
const printedNumbers = [];
for (let i = 0; i < transcriptPages.length; i++) {
  const page = i < 50 ? i : i + 1;
  if (page > 55) continue;
  const section = transcriptPages[i];
  for (const match of section.matchAll(/[0-9]/g)) {
    const remainder = section.slice(match.index + 1);
    const after = /^-([\u16A0-\u16FF]+)/u.exec(remainder);
    assert.ok(after, 'a printed decimal numeral must precede a GP word');
    printedNumbers.push({
      page,
      digit: Number(match[0]),
      following: after[1],
      runeOffset: Array.from(section.slice(0, match.index)).filter((r) => runeSet.has(r)).length,
    });
  }
}
assert.deepEqual(printedNumbers.map((x) => [x.page, x.digit]), [
  [10, 7], [36, 1], [37, 2], [37, 3], [37, 4], [38, 5],
]);
const literalSeven = printedNumbers[0];
assert.equal(literalSeven.runeOffset, 169);
assert.equal(literalSeven.following, 'ᚷ');
assert.equal(literalSeven.following.length, 1);

// The one-based seventh Gematria Primus rune is G, with prime value 17.
assert.equal(runes[6], 'ᚷ');
assert.equal(corpus.translit[6], 'G');
assert.equal(corpus.prime[6], 17);
const proposedAddress = literalSeven.digit * corpus.prime[6];
assert.equal(proposedAddress, 119);

// Independently enumerated visible red three-rune spans, from ink annotations.
const triples = ink.pages.flatMap((page) => (page.red_spans || [])
  .filter((span) => span.length === 3)
  .map((span) => {
    const punctuation = page.large_punctuation || [];
    for (const at of [span.start, span.start + 3]) {
      assert.ok(punctuation.some(([offset, dots, color]) =>
        offset === at && dots === 13 && color === 'red'));
    }
    const atbash = Array.from(span.runes)
      .map((r) => corpus.translit[28 - runes.indexOf(r)]).join('');
    return { page: page.page, offset: span.start, original: span.runes, atbash };
  }));
assert.deepEqual(triples.map((x) => [x.page, x.offset, x.atbash]), [
  [3, 119, 'SCY'],
  [39, 119, 'UDP'],
]);
assert.ok(triples.every((x) => x.offset === proposedAddress));

console.log(JSON.stringify({
  interpretation: 'candidate address, NOT a decipherment',
  literal: { page: 10, runeOffset: 169, tokens: '7 ᚷ', ordinal: 7, prime: 17 },
  proposedAddress,
  redSpans: triples,
  otherArabicNumerals: printedNumbers.slice(1),
}, null, 2));
