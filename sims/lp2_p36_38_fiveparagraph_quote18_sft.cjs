'use strict';
/**
 * Five exact numbered original LP2 pp36–38 paragraph word-lengths versus
 * 18 source-pinned pre-2014 GITenberg editions. No plaintext key fitting.
 * Node.js 22, CommonJS; run with the same 18-text input folder as
 * the existing quote18 corpus gate.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SOURCES, gpLength, longestMatch, gitBlobSha } =
  require('./lp2_quote18_publicdomain_sft.cjs');

const ROOT = path.join(__dirname, '..');
const json = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const source = json('resources/liber-primus/lp2-corpus.json');
const transcript = fs.readFileSync(path.join(ROOT, 'resources/lp2-transcription.txt'), 'utf8').split('%');
const byRune = new Map(source.runes.map((rune, i) => [rune, i]));
const visibleParagraphEnds = [0, 139, 230, 328, 424, 553];

/** Extract exact source paragraph boundaries and word lengths from original
 * rune-bearing text. Printed slash, newline and page break do not end words.
 */
function originalParagraphs() {
  const expected = [
    [4,3,8,2,5,3,3,7,3,5,4,2,5,8,5,3,5,6,6,3,2,11,8,3,8,3,2,3,4,5],
    [4,4,6,4,10,4,7,6,5,2,4,3,3,5,4,4,2,9,3,2],
    [3,4,4,2,5,3,6,2,3,2,3,1,2,3,3,6,3,4,9,4,8,3,8,4,3],
    [7,9,7,2,3,2,5,4,6,6,2,4,10,3,4,3,11,5,3],
    [6,4,7,1,6,3,5,3,9,2,3,3,2,5,4,9,4,3,7,12,8,3,3,2,5,3,5,2]
  ];
  const paragraphs = Array.from({length: 5}, () => []);
  const pending = Array(5).fill(0);
  const runes = [];
  /** @param {number} i */
  function paragraph(i) {
    return visibleParagraphEnds.findIndex((x, p) =>
      p < 5 && i >= x && i < visibleParagraphEnds[p + 1]);
  }
  let sourcePageRunes = 0;
  for (const page of [36, 37, 38]) {
    let local = 0;
    for (const char of transcript[page]) {
      if (byRune.has(char)) {
        const absolute = sourcePageRunes + local;
        const first = 99;
        local++;
        const i = absolute - first;
        if (i >= 0 && i < 553) {
          const p = paragraph(i);
          assert(p >= 0 && p < 5);
          pending[p]++;
          runes.push(byRune.get(char));
        }
      } else if (['-', '.', '&', '$', '§'].includes(char) && runes.length) {
        const p = paragraph(runes.length - 1);
        if (p >= 0 && pending[p]) {
          paragraphs[p].push(pending[p]);
          pending[p] = 0;
        }
      }
    }
    assert.equal(local, source.pages[page].indices.length,
      'source physical-page rune inventory drifted');
    sourcePageRunes += local;
  }
  for (let p = 0; p < 5; p++) {
    if (pending[p]) paragraphs[p].push(pending[p]);
    assert.deepEqual(paragraphs[p], expected[p],
      'frozen original paragraph word lengths changed: ' + p);
  }
  assert.deepEqual(runes, [
    ...source.pages[36].indices.slice(99),
    ...source.pages[37].indices,
    ...source.pages[38].indices.slice(0, 186)
  ], 'all five original paragraph runes must align exactly');
  assert.equal(runes.length, 553);
  return paragraphs;
}

/** @param {(filename:string,repository:string)=>Buffer} readSource */
function run(readSource) {
  const patterns = originalParagraphs();
  const targets = Object.fromEntries(patterns.map((v, i) => ['numbered_' + (i + 1), v]));
  const sourceResults = [];
  let wordTotal = 0;
  let possibleLong = 0;
  for (const [name, repository, filename, expectedSha, expectedWords] of SOURCES) {
    const raw = readSource(filename, repository);
    assert.equal(gitBlobSha(raw), expectedSha, 'source edition drift: ' + name);
    const words = (raw.toString('utf8').match(/[A-Za-z]+/g) || []).map(w => w.toUpperCase());
    assert.equal(words.length, expectedWords, 'word count drift: ' + name);
    const lengths = words.map(gpLength);
    const winner = longestMatch(lengths, targets);
    const originalRunes = winner.id ? patterns[Number(winner.id.slice(-1)) - 1]
      .slice(winner.targetStart, winner.targetStart + winner.length)
      .reduce((a, b) => a + b, 0) : 0;
    const qualifies = winner.length >= 12 && originalRunes >= 40;
    if (qualifies) possibleLong++;
    const positive = lengths.slice(
      Math.floor(lengths.length / 2), Math.floor(lengths.length / 2) + 25);
    const planted = longestMatch(lengths, {knownNativeSource25: positive});
    assert.equal(planted.length, 25,
      'native source positive failed in ' + name);
    sourceResults.push({name, words: words.length,
      longestMatchedWords: winner.length,
      originalRunesAtLongest: originalRunes,
      originalParagraph: winner.id,
      originalStartWord: winner.targetStart,
      sourceStartWord: winner.sourceStart,
      qualifies, nativePositiveWords: planted.length});
    wordTotal += words.length;
  }
  assert.equal(wordTotal, 1094603);
  const byParagraph = Object.fromEntries(
    patterns.map((v, i) => ['numbered_' + (i + 1),
      {words: v.length, runes: v.reduce((a,b)=>a+b,0)}]));
  return {classification: possibleLong > 0
      ? 'FOLLOW UP NEEDED: source-length candidate(s), no plaintext verified'
      : 'FINITE NO-CRIB RESULT: no 12-word / 40-rune match',
    sourceWordCount: wordTotal, sourceEditions: sourceResults.length,
    originalFiveParagraphs: byParagraph,
    matchingCondition: '12 or more contiguous whole words plus >=40 original GP runes, punctuation unrestricted',
    candidateSourcesMeetingCondition: possibleLong,
    requiresFiveHeldoutWords: true,
    sourceResults,
    limitation: 'only these 18 exact source editions, exact word-length transport and fixed GP tokenization; other sources or transformed boundaries not excluded'};
}
if (require.main === module) {
  const folder = process.argv[2];
  assert(folder, 'supply the previously pinned quote18 source folder');
  console.log(JSON.stringify(run(filename => fs.readFileSync(path.join(folder, filename))), null, 2));
}
module.exports = {originalParagraphs, run};
