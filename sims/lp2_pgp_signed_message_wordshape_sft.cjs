'use strict';

// Original LP2 all-word geometry versus 20 archived PGP-armored messages.
// Node.js 22, CommonJS. Inputs are exact source files named below.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SOURCES = [
  ['2012-01-book-code-poem.asc', '9ef203cc71092742bf98eedd329309109f377a1a', 63, 6],
  ['2012-01-coordinates.asc', '7906deec84cfc26907ef417ee3ba7d727d1f5f53', 0, 0],
  ['2012-01-end-of-puzzle.asc', 'c663727c481f86ccedf26757800f60026ee56809', 54, 6],
  ['2012-01-final-message.asc', 'e23635603e319d2a69013cce659ed4ece5c00089', 54, 6],
  ['2012-01-key-in-front-of-you.asc', '05e3d26db1c62cab41062c13ea285d179758ddcc', 30, 6],
  ['2013-01-opening-book-code.asc', 'f001e1170bde401011a5d4fc7fd2a7ece6433e44', 84, 5],
  ['2012-01-key-announcement.asc', 'd84bb81450813910370c9fa5130cb5dac5043440', 39, 6],
  ['2012-01-second-chance.asc', '71d6cdf77010b281ae252a7a169bd95a04096841', 15, 4],
  ['2013-01-cicada-os-message.asc', '2efa3c9fbf1e15742899ac35672ad56f91e9e9d4', 8, 5],
  ['2013-01-rune-table-morse.asc', '297c1dfee74ff79acc2d944952d06d1012928803', 0, 0],
  ['2013-01-telnet-hello.asc', '8bd13123ecb11cb797890b3b84e2e2603a6cc747', 15, 5],
  ['2014-01-final-message.asc', '59afb0ced3f3d998a8bee0fc99b864107dc7a6ef', 18, 5],
  ['2013-cicada-os-message.asc', '2efa3c9fbf1e15742899ac35672ad56f91e9e9d4', 8, 5],
  ['2014-01-liber-primus-hash-block.asc', 'd0a2ac971fd21ebba249b502a6ece4094de6dcdc', 488, 5],
  ['2014-01-onion-welcome.asc', 'e2b7382ac2cfb0adfe028cc063fc6048e0ad718e', 18, 5],
  ['2014-01-opening-book-code.asc', '1f9a61b97d5de9c4ca57402c064365a503d956a9', 24, 4],
  ['2014-05-liber-primus-release.asc', '5bfaaeaf5364291e8a38d27222946f9db93cd50b', 18, 5],
  ['2015-07-planned-parenthood-denial.asc', 'f8fa3ee84e89c7e7bfa5b0b0f6f6c461e8e89812', 53, 5],
  ['2017-04-final-message.asc', 'bed70cfda8a5dab14768cf96fee8bf122e4b8468', 10, 4],
  ['2017-04-final-warning.asc', 'f455e72159fc9fea9e3d89df835468ea67fe3cf4', 10, 4],
];
const RUNE = /[ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ]/gu;
const BEGIN = '-----BEGIN PGP SIGNED MESSAGE-----';
const SIGNATURE = '-----BEGIN PGP SIGNATURE-----';

/** @param {Buffer} raw @returns {string} Git's canonical object ID. */
function gitBlobSha(raw) {
  return crypto.createHash('sha1').update('blob ' + raw.length + '\0').update(raw).digest('hex');
}

/** @param {string} text @returns {number[]} Original full-word lengths. */
function originalLengths(text) {
  // 57 rune-bearing physical LP2 pages; page 50 is a separate runeless grid.
  // The first 55 segments are exactly unknown physical pp0-49 and pp51-55.
  const pages = text.split(/(?:\r?\n)?%\s*(?:\r?\n)?/);
  assert.equal(pages.length, 57);
  const unknown = pages.slice(0, 55).join('').replace(/\/\s*/g, '');
  const lengths = unknown.split(/[-.&$§!?:() \t\n]+/u)
    .map(word => (word.match(RUNE) || []).length).filter(Boolean);
  assert.equal(lengths.length, 2896);
  assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
  return lengths;
}

/** @param {string} text @returns {string[]} Latin words inside clear-signed body. */
function signedWords(text) {
  const start = text.indexOf(BEGIN);
  const end = text.indexOf(SIGNATURE);
  if (start === -1 || end === -1) return [];
  const body = text.slice(start + BEGIN.length, end)
    .replace(/^Hash:[^\n]*\n/m, '')
    .replace(/^- /gm, '');
  return body.match(/[A-Za-z]+/g) || [];
}

/** @param {string} word @returns {number} Native GP29 symbol count. */
function gpLength(word) {
  return (word.toUpperCase().match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || []).length;
}

/**
 * @param {number[]} source
 * @param {number[]} target
 * @returns {{length:number,sourceStart:number,targetStart:number}}
 */
function longestMatch(source, target) {
  let best = { length: 0, sourceStart: 0, targetStart: 0 };
  for (let i = 0; i < source.length; i += 1) {
    for (let j = 0; j < target.length; j += 1) {
      if (source[i] !== target[j]) continue;
      let len = 1;
      while (i + len < source.length && j + len < target.length
        && source[i + len] === target[j + len]) len += 1;
      if (len > best.length) best = { length: len, sourceStart: i, targetStart: j };
    }
  }
  return best;
}

/**
 * @param {string} sourceFolder - Directory with archived .asc files.
 * @param {string} transcriptionPath - Repository's LP2 rune transcription.
 * @returns {object} Exact source-native results.
 */
function run(sourceFolder, transcriptionPath) {
  const transcription = fs.readFileSync(transcriptionPath, 'utf8');
  const targets = originalLengths(transcription);
  // A real, previously solved source is a better positive than an invented plant.
  // The p57 PARABLE is word-for-word in Cicada's older 761.MP3 metadata.
  const page57 = transcription.split(/(?:\\r?\\n)?%\\s*(?:\\r?\\n)?/)[56]
    .replace(/\\/\\s*/g, '')
    .split(/[-.&$§!?:() \\t\\n]+/u)
    .map(word => (word.match(RUNE) || []).length).filter(Boolean);
  const solved = fs.readFileSync(
    path.join(path.dirname(transcriptionPath), 'lp1-plaintext-reference.txt'), 'utf8');
  const solvedWords = (solved.split('### 57')[1].match(/[A-Z]+/g) || []);
  const solvedLengths = solvedWords.map(gpLength);
  assert.equal(page57.length, 20);
  assert.equal(page57.reduce((a, b) => a + b, 0), 95);
  assert.deepEqual(page57, solvedLengths, 'authentic solved p57 full-word control');
  assert.equal(longestMatch(solvedLengths, page57).length, 20);
  const items = [];
  for (const [name, expectedGitSha, expectedWords, expectedLongest] of SOURCES) {
    const raw = fs.readFileSync(path.join(sourceFolder, name));
    assert.equal(gitBlobSha(raw), expectedGitSha, name + ': source blob changed');
    const words = signedWords(raw.toString('utf8'));
    assert.equal(words.length, expectedWords, name + ': word count changed');
    const lengths = words.map(gpLength);
    const best = longestMatch(lengths, targets);
    assert.equal(best.length, expectedLongest, name + ': original match changed');
    assert(best.length < 12, name + ': candidate long source crib');
    if (words.length >= 20) {
      const control = lengths.slice(Math.floor(lengths.length / 2), Math.floor(lengths.length / 2) + 20);
      assert.equal(longestMatch(lengths, control).length, 20, name + ': planted control');
    }
    items.push({ name, words: words.length, best,
      candidate: words.slice(best.sourceStart, best.sourceStart + best.length).join(' ') });
  }
  return { classification: 'NO SOURCE-LENGTH CRIB, NO LP2 PLAINTEXT',
    originalRunes: 12956, originalWords: 2896, archivedMessages: SOURCES.length,
    authenticP57Control: { recoveredWords: 20, originalRunes: 95 },
    qualifyingMatchesAtLeast12Words: 0, items };
}
if (require.main === module) {
  const folder = process.argv[2];
  assert(folder, 'usage: node sims/lp2_pgp_signed_message_wordshape_sft.cjs archive-asc-folder');
  const original = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-transcription.txt');
  console.log(JSON.stringify(run(folder, original), null, 2));
}
module.exports = { SOURCES, gitBlobSha, originalLengths, signedWords, gpLength, longestMatch, run };
