'use strict';

/**
 * Frozen 2014-LP2 numbered-paragraph crib screen.
 * Single-file Node.js 22 test. Run from any working directory.
 *
 * Sources are the four independent historical Enchiridion translations,
 * a second Higginson edition (edition sensitivity), Crossley's Golden
 * Sayings of Epictetus, and Giles's 1910 Art of War.
 * The test downloads texts into memory and verifies each Git blob SHA.
 * Johns's 1903 Code of Hammurabi translation is selected independently
 * by the Babylonian numeral imagery immediately before the five original
 * numbered LP2 paragraphs.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SOURCES = [
  ['Carter Enchiridion', 'jtauber/enchiridion', 'text/EN_carter.txt', '353fe7c7ccb3e665bcc64314b0b2a86e332a06e5', 7457, 7],
  ['Higginson Enchiridion', 'jtauber/enchiridion', 'text/EN_higginson.txt', '3003f72c83fdc54f457e1b69aa99236c68bd865e', 6696, 7],
  ['Long Enchiridion', 'jtauber/enchiridion', 'text/EN_long.txt', '6f1dd901dd058999c0703bb2cf137a25d3b35895', 8160, 7],
  ['Matheson Enchiridion', 'jtauber/enchiridion', 'text/EN_matheson.txt', '0a61d1be52888126472908979e064dfd657dcc32', 7391, 6],
  ['Gutenberg Higginson edition', 'GITenberg/The-Enchiridion_45109', '45109-0.txt', '63d5d6c6cf906c515a2dcebea7ccef5be285172f', 13934, 7],
  ['Crossley Golden Sayings', 'GITenberg/The-Golden-Sayings-of-Epictetus-with-the-Hymn-of-Cleanthes_871', '871.txt', '9aee8f946027271e39dfaf32bc61c34870b54788', 26815, 7],
  ['Giles Art of War', 'GITenberg/The-Art-of-War_132', '132.txt', '43ca671c7408a29533c53705b50293095f99d707', 57591, 8],
  ['Johns Hammurabi Code (1903)', 'GITenberg/The-Oldest-Code-of-Laws-in-the-WorldB.C.-2285-2242_17150', '17150.txt', '6c1e40d46ffc9e2d87c5ee6e4a2878ff09eaf04c', 19870, 7],
];

const EXPECTED = [
  [4,3,8,2,5,3,3,7,3,5,4,2,5,8,5,3,5,6,6,3,2,11,8,3,8,3,2,3,4,5],
  [4,4,6,4,10,4,7,6,5,2,4,3,3,5,4,4,2,9,3,2],
  [3,4,4,2,5,3,6,2,3,2,3,1,2,3,3,6,3,4,9,4,8,3,8,4,3],
  [7,9,7,2,3,2,5,4,7,6,2,4,10,3,4,3,11,5,3],
  [6,4,7,1,6,3,5,3,9,2,3,3,2,5,4,9,4,3,7,12,8,3,3,2,5,3,5,2],
];

/** @param {string} text @returns {number[][]} */
function originalParagraphs(text) {
  const pages = text.split('\n%\n');
  const raw = [
    pages[36].split('\n1-')[1],
    pages[37].split('\n3-')[0].replace(/^2-/, ''),
    pages[37].split('\n3-')[1].split('\n4-')[0],
    pages[37].split('\n4-')[1] + pages[38].split('\n5-')[0],
    pages[38].split('\n5-')[1].split('\n&\n')[0],
  ];
  const paras = raw.map(s => s.replace(/\/\r?\n/g, '').replace(/\r?\n/g, '')
    .split(/[-.]+/).filter(w => /[\u16a0-\u16ff]/u.test(w))
    .map(w => [...w].length));
  assert.deepEqual(paras, EXPECTED, 'physical-page 36-38 paragraph transcription changed');
  assert.deepEqual(paras.map(p => p.reduce((sum, x) => sum + x, 0)), [139,91,98,96,129]);
  return paras;
}

/** @param {string} word @returns {number} */
function gpLength(word) {
  return (word.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || []).length;
}

/**
 * Six-word exact seeds with maximal bidirectional extension.
 * @param {number[]} source
 * @param {number[][]} targets
 * @returns {{length:number,paragraph:number,sourceStart:number,targetStart:number}}
 */
function longestMatch(source, targets) {
  const seeds = new Map();
  targets.forEach((target, p) => {
    for (let i = 0; i + 6 <= target.length; i += 1) {
      const key = target.slice(i, i + 6).join(',');
      if (!seeds.has(key)) seeds.set(key, []);
      seeds.get(key).push([p, i]);
    }
  });
  let best = { length: 0, paragraph: -1, sourceStart: -1, targetStart: -1 };
  for (let i = 0; i + 6 <= source.length; i += 1) {
    for (const [p, start] of seeds.get(source.slice(i, i + 6).join(',')) || []) {
      const target = targets[p];
      let a = start, b = i;
      while (a > 0 && b > 0 && target[a - 1] === source[b - 1]) { a -= 1; b -= 1; }
      let length = 0;
      while (a + length < target.length && b + length < source.length
        && target[a + length] === source[b + length]) length += 1;
      if (length > best.length) {
        best = { length, paragraph: p + 1, sourceStart: b, targetStart: a };
      }
    }
  }
  return best;
}

/** @param {Buffer} bytes @returns {string} */
function gitBlobSha(bytes) {
  return crypto.createHash('sha1')
    .update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
}

/** @param {string} repository @param {string} filename @returns {Promise<Buffer>} */
async function fetchText(repository, filename) {
  const url = 'https://raw.githubusercontent.com/' + repository + '/master/' + filename;
  const response = await fetch(url);
  assert(response.ok, 'download failed: ' + url + ' HTTP ' + response.status);
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const transcript = fs.readFileSync(path.join(__dirname, '../resources/liber-primus/lp2-transcription.txt'), 'utf8');
  const targets = originalParagraphs(transcript);
  const results = [];
  for (const [name, repo, filename, sha, expectedWords, expectedLongest] of SOURCES) {
    const bytes = await fetchText(repo, filename);
    assert.equal(gitBlobSha(bytes), sha, 'source edition changed: ' + name);
    const words = (bytes.toString('utf8').match(/[A-Za-z]+/g) || []).map(w => w.toUpperCase());
    assert.equal(words.length, expectedWords, 'word count changed: ' + name);
    const lengths = words.map(gpLength);
    const best = longestMatch(lengths, targets);
    assert.equal(best.length, expectedLongest, 'original match changed: ' + name);
    assert(best.length < 12, 'a potential long crib requires independent investigation: ' + name);
    const plant = lengths.slice(Math.floor(lengths.length / 2), Math.floor(lengths.length / 2) + 20);
    assert.equal(longestMatch(lengths, [plant]).length, 20, '20-word positive plant failed: ' + name);
    results.push({ name, repo, filename, blobSha: sha, words: words.length, longest: best });
  }
  assert.equal(results.reduce((sum, x) => sum + x.words, 0), 147914);
  console.log(JSON.stringify({
    classification: 'FINITE NO-CRIB RESULT; NO UNKNOWN LP2 PLAINTEXT',
    physicalPages: [36,37,38],
    paragraphRuneLengths: [139,91,98,96,129],
    textWords: 128044,
    examinedSourceFiles: SOURCES.length,
    qualifying12Word40RuneMatches: 0,
    results,
  }, null, 2));
}

if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { SOURCES, EXPECTED, originalParagraphs, gpLength, longestMatch, gitBlobSha };
