/**
 * Frozen source-only gate for Director #3463.
 * Reads the p47 DH state as zero-based offsets from p23's marked origin.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8')
);
const transcription = fs.readFileSync(
  path.join(root, 'resources', 'transcriptions', 'lp2-image-corrected.txt'),
  'utf8'
);
const ink = JSON.parse(
  fs.readFileSync(path.join(root, 'resources', 'liber-primus', 'lp2-ink-annotations.json'), 'utf8')
);
const signed = fs.readFileSync(
  path.join(root, 'resources', 'historical', 'cicada2016-4gq25-outguess.asc'),
  'utf8'
);

const OFFSETS = [23, 5, 6, 15, 8, 19, 2, 3, 4];
const TARGET = 'DIRECTION';

/** @param {number} pageNumber */
function readOffsets(pageNumber) {
  const page = corpus.pages.find((entry) => entry.page === pageNumber);
  const gp0 = OFFSETS.map((offset) => page.indices[offset]);
  return {
    page: pageNumber,
    gp0,
    transliteration: gp0.map((value) => corpus.translit[value]).join(''),
  };
}

const transcriptionPages = transcription
  .split('%')
  .map((part) => part.trim())
  .filter(Boolean);
const p23FirstLine = transcriptionPages[23]
  .split('/')
  .map((line) => line.replace(/\s+/g, '').trim())
  .filter(Boolean)[0];
const p23Lengths = p23FirstLine
  .split(/[-.]/)
  .filter(Boolean)
  .map((word) => [...word].length);

const p23Ink = ink.pages.find((entry) => entry.page === 23);
const p23 = readOffsets(23);

const signedCleartext = signed.slice(0, signed.indexOf('-----BEGIN PGP SIGNATURE-----'));
const sourceNineLetterWords = [...new Set(
  (signedCleartext.toUpperCase().match(/[A-Z]+/g) || []).filter((word) => word.length === 9)
)];

const pageReads = corpus.pages
  .filter((page) => page.indices.length > Math.max(...OFFSETS))
  .map((page) => readOffsets(page.page));
const exactTargetPages = pageReads.filter((entry) => entry.transliteration === TARGET);
const authenticatedNineLetterHits = pageReads.filter((entry) =>
  sourceNineLetterWords.includes(entry.transliteration)
);

const expectedLengths = JSON.stringify([2, 6, 3, 5, 4]);
if (JSON.stringify(p23Lengths) !== expectedLengths) {
  throw new Error(`p23 line1 lengths changed: ${JSON.stringify(p23Lengths)}`);
}
if (p23Ink.red_spans.length !== 1 ||
    p23Ink.red_spans[0].start !== 0 ||
    p23Ink.red_spans[0].length !== 16 ||
    JSON.stringify(p23Ink.large_punctuation[0]) !== JSON.stringify([16, 13, 'red'])) {
  throw new Error('p23 source geometry no longer matches frozen red-span/13-dot boundary');
}
if (p23.transliteration !== 'EAXDYIAEWNGG') {
  throw new Error(`unexpected frozen p23 readout: ${p23.transliteration}`);
}
if (exactTargetPages.length !== 0) {
  throw new Error(`frozen negative invalidated: DIRECTION hit on ${JSON.stringify(exactTargetPages)}`);
}
if (authenticatedNineLetterHits.length !== 0) {
  throw new Error(
    `unexpected authenticated nine-letter hit: ${JSON.stringify(authenticatedNineLetterHits)}`
  );
}

const output = {
  hypothesis: 'THE ORIGIN -> zero-based p47-state offsets -> DIRECTION',
  offsets: OFFSETS,
  target: TARGET,
  p23Line1Lengths: p23Lengths,
  p23RedSpan: p23Ink.red_spans[0],
  p23Boundary: p23Ink.large_punctuation[0],
  p23Readout: p23,
  sourceNineLetterWords,
  exactTargetPages,
  authenticatedNineLetterHits,
  conclusion: 'rejected',
};

console.log(JSON.stringify(output, null, 2));

const outputPath = path.join(process.env.RUNNER_TEMP || process.cwd(), 'source-test-output.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n');
