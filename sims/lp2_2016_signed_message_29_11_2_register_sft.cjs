#!/usr/bin/env node
'use strict';

// Reproduce the word/paragraph structure of the authenticated January 2016
// clear-signed payload. PGP signature verification is handled by the
// repository's source audit; this script checks only the exact cleartext
// segmentation and token counts used by issue #2045.

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const sourcePath = path.join(
  __dirname,
  '..',
  'resources',
  'historical',
  'cicada2016-4gq25-outguess.asc'
);
const raw = fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
const lines = raw.split('\n');
const hashLine = lines.findIndex((line) => /^Hash: /.test(line));
const signatureLine = lines.indexOf('-----BEGIN PGP SIGNATURE-----');
assert(hashLine >= 0, 'clear-signed Hash header must be present');
assert(signatureLine > hashLine, 'PGP signature block must follow cleartext');

const clearLines = lines.slice(hashLine + 2, signatureLine);
const cleartext = clearLines.join('\n');
const paragraphs = cleartext
  .split(/\n[ \t]*\n/)
  .filter((paragraph) => paragraph.trim().length > 0);

function words(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ''))
    .filter((token) => token.length > 0)
    .filter((token) => !/^\d+$/.test(token))
    .filter((token) => !/^[0-9A-F]{8}$/i.test(token))
    .filter((token) => /[A-Za-z]/.test(token));
}

assert.strictEqual(paragraphs.length, 7, 'expected greeting, two core paragraphs, coda, good-luck, numeric footer, warning/verification');
const paragraphWords = paragraphs.map(words);
assert.deepStrictEqual(paragraphWords.map((xs) => xs.length), [1, 8, 21, 6, 2, 0, 5]);

const greeting = paragraphWords[0];
const core = paragraphWords[1].concat(paragraphWords[2]);
const coda11 = paragraphWords[3]
  .concat(paragraphWords[4], words('Beware false paths.'));
const verification2 = words('Verify OpenPGP 7A35090F.');
const coda = coda11.concat(verification2);
const allWords = paragraphWords.flat();
const bodyWords = core.concat(coda);
const oldPrefix29 = allWords.slice(0, 29);

assert.deepStrictEqual(greeting, ['Hello']);
assert.strictEqual(core.length, 29);
assert.strictEqual(core[0], 'The');
assert.strictEqual(core[28], 'direction');
assert.strictEqual(coda11.length, 11);
assert.strictEqual(verification2.length, 2);
assert.strictEqual(coda.length, 13);
assert.strictEqual(bodyWords.length, 42);
assert.strictEqual(allWords.length, 43);
assert.strictEqual(oldPrefix29[28].toLowerCase(), 'the');
assert.strictEqual(allWords.indexOf('direction'), 29);
assert.strictEqual(bodyWords.indexOf('direction') + 1, 29);
assert(raw.includes('their \nmeaning'), 'hard line break after "their " should remain inside the same paragraph');
assert(paragraphs[2].trim().endsWith('direction.'), '29-word core must end at sentence-final "direction."');
assert.strictEqual(coda11.join(' '), 'Seek and you will be found Good luck Beware false paths');
assert.strictEqual(verification2.join(' '), 'Verify OpenPGP');

const output = {
  source: 'resources/historical/cicada2016-4gq25-outguess.asc',
  rawSha256: crypto.createHash('sha256').update(raw, 'utf8').digest('hex'),
  paragraphWordCounts: paragraphWords.map((xs) => xs.length),
  greeting,
  coreParagraphs: paragraphs.slice(1, 3),
  coreWordCount: core.length,
  coreWords: core,
  bodyWordOrdinals: { first: 1, last: 29, direction: 29 },
  codaWordCount: coda.length,
  coda11,
  verification2,
  totalAlphabeticTokensExcludingFooterAndKeyId: allWords.length,
  oldFirst29Of43EndsAt: oldPrefix29[28],
  directionZeroBasedIndexInFullList: allWords.indexOf('direction'),
  directionOneBasedOrdinalInBody: bodyWords.indexOf('direction') + 1,
  lineBreakAfterTheirPreserved: true
};
console.log(JSON.stringify(output, null, 2));
