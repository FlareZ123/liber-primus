'use strict';

/**
 * Source-boundary gate for the only two isolated red three-rune LP2 spans.
 * Run: node sims/lp2_red119_bracket_boundary_sft.cjs
 * Uses the canonical 58-page corpus, source-ink annotations and
 * transcribed printed word delimiters. No cipher/key/offset search.
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const transcription = readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const printedPages = transcription.split('%');
const alphabet = new Set(corpus.runes);

/** @param {string} text @returns {string[]} */
const runes = text => Array.from(text).filter(char => alphabet.has(char));
/** @param {string} text @returns {number[]} */
const indices = text => runes(text).map(char => corpus.runes.indexOf(char));
/** @param {string} text @returns {string} */
const atbash = text => indices(text).map(i => corpus.translit[28 - i]).join('');

const allRedSpans = ink.pages.flatMap(page =>
  (page.red_spans || []).map(span => ({ page: page.page, ...span })),
);
const allRedTriads = allRedSpans.filter(span => span.length === 3);
assert.equal(allRedSpans.length, 18);
assert.deepEqual(allRedTriads.map(span => [span.page, span.start]), [[3, 119], [39, 119]]);

const expected = [
  { page: 3, source: 'ᛈᛞᚦ', left: 'ᛞᛠᛖᛡᚾᛏ', right: 'ᛇᛞᛇ', red: 'SCY', leftAtbash: 'CFIUMEO', rightAtbash: 'TCT' },
  { page: 39, source: 'ᛡᚳᛋ', left: 'ᛗᛋᚹᛟᚻ', right: 'ᛈᛞᛋᛡ', red: 'UDP', leftAtbash: 'NPNGGL', rightAtbash: 'SCPU' },
];

const evidence = expected.map(item => {
  const printed = printedPages[item.page];
  const page = ink.pages.find(p => p.page === item.page);
  const original = corpus.pages.find(p => p.page === item.page);
  const triad = allRedTriads.find(span => span.page === item.page);
  assert.ok(printed && page && original && triad);
  assert.deepEqual(indices(printed), original.indices,
    'Transcribed printed words must preserve exactly the original corpus order');
  assert.equal(printed.indexOf(item.source), printed.lastIndexOf(item.source),
    'Red source triple must have a unique printed occurrence on this page');
  const occurrence = printed.indexOf(item.source);
  assert.ok(occurrence >= 0);
  const before = printed.slice(0, occurrence);
  const after = printed.slice(occurrence + item.source.length);
  assert.equal(runes(before).length, 119);
  assert.equal(runes(after).length, original.runic_count - 122);
  assert.equal(triad.start, 119);
  assert.equal(triad.length, 3);
  assert.equal(triad.runes, item.source);
  assert.deepEqual(
    page.large_punctuation.filter(([offset]) => offset === 119 || offset === 122),
    [[119, 13, 'red'], [122, 13, 'red']],
  );
  assert.ok(before.endsWith('&\n'),
    'Previous printed passage ends before the first red13 bracket');
  assert.ok(after.startsWith('.'),
    'Second red13 bracket precedes the first complete black word');
  const precedingWord = before.match(/([\u16a0-\u16ff]+)\.\/?\s*&\s*$/u)?.[1];
  const followingWord = after.match(/^\.\s*([\u16a0-\u16ff]+)/u)?.[1];
  assert.equal(precedingWord, item.left);
  assert.equal(followingWord, item.right);
  assert.equal(atbash(triad.runes), item.red);
  assert.equal(atbash(precedingWord), item.leftAtbash);
  assert.equal(atbash(followingWord), item.rightAtbash);
  return {
    page: item.page,
    redBracket: [119, 122],
    bracketRuneCount: 3,
    additionalFullyEnclosedWords: 0,
    sourceTriad: triad.runes,
    atbashTriad: item.red,
    previousCompleteBlackWord: { source: precedingWord, atbash: item.leftAtbash, outsideBrackets: true },
    nextCompleteBlackWord: { source: followingWord, atbash: item.rightAtbash, outsideBrackets: true },
    remainingBlackRunes: runes(after).length,
  };
});

// Independent known plaintext warns against promoting a global red-ink Atbash rule.
const solved = allRedSpans.find(span => span.page === 57 && span.start === 0);
assert.ok(solved);
assert.equal(indices(solved.runes).map(i => corpus.translit[i]).join(''), 'PARABLE');
assert.equal(atbash(solved.runes), 'SRARJHI');

console.log(JSON.stringify({
  decision: 'Neither original red13-to-red13 bracket contains another complete printed rune word. The source-selected local reading ends at SCY and UDP.',
  scannedOriginalImageReferences: ['resources/liber-primus/20.jpg', 'resources/liber-primus/56.jpg'],
  originalRunesMatchCanonicalTranscription: true,
  boundaryEvidence: evidence,
  solvedP57Control: 'PARABLE -> SRARJHI under Atbash, so no global red-ink rule',
  interpretation: 'No source-bounded complete instruction, authenticated key or third-passage decoder',
}, null, 2));
