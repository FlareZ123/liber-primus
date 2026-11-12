'use strict';
/**
 * Original LP2 quotation lengths to literal plaintext-source crib gate.
 *
 * Uses the corrected 34-word sixth quotation at physical p42 (one full-stop
 * inside an earlier editorial eight-rune word). A match would nominate an
 * independently sourced literal plaintext crib while preserving original
 * GP29 word boundaries. No cipher is inferred from a close word-length fit.
 *
 * The four KJV gospels are fetched without storing any copyrighted text,
 * from a Git commit pinned to 0e8cc040... and checked against its blob SHA.
 * Local references are already preserved in resources/ and cited below.
 *
 * Run: node sims/lp2_quotation_corrected_34word_crib_sft.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const REPO = 'takelley1/plaintext-bible-kjv';
const COMMIT = '0e8cc040bfb69f564e15ba93b2569b00e28420a8';
const QUOTES = Object.freeze({
  q4: [5,7,2,3,4,6,4,3,3,4,4,4,5,4],
  q5: [9,8,3,4,6,3,10,2,4,7,6,2,4],
  q6: [4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5],
  q7: [5,7,2,3,4,10,3,9,7,3,7,4,3,3]
});
const LOCAL = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/external/blake-marriage-1906-gutenberg45315.txt',
  'resources/external/2013-book-of-law-I.txt',
  'resources/external/2013-book-of-law-II.txt',
  'resources/external/2013-book-of-law-III.txt'
];
const GOSPELS = Object.freeze({
  '40-matthew.txt': '5c1415d4a2248a92d4e0d06335452f9d77b6f198',
  '41-mark.txt': '4ad09eba435b6c2cb07d832c188df9366ccf8500',
  '42-luke.txt': '1f055a16211ceb43b75c37ca7b831eecf5284f9f',
  '43-john.txt': '61fab2c4f7d51b41b81f02d0f26c6275734fe58e'
});

/** @param {string} word @returns {number} canonical Gematria Primus rune count. */
function gpLength(word) {
  const normal = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  return (normal.match(/TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || []).length;
}

/** @param {string} text @returns {string[]} alphabetic source words. */
function wordsOf(text) {
  return (text.match(/[A-Za-z]+/g) || []).map(word => word.toUpperCase());
}

/** @param {string[]} words @param {number[]} target */
function search(words, target) {
  const lengths = words.map(gpLength);
  assert(lengths.length >= target.length);
  let best = -1, bestStart = -1, longest = -1, exact = 0;
  for (let i = 0; i + target.length <= lengths.length; i++) {
    let equal = 0, contiguous = 0;
    for (let j = 0; j < target.length; j++) {
      if (lengths[i + j] === target[j]) {
        equal++;
        contiguous++;
        if (contiguous > longest) longest = contiguous;
      } else contiguous = 0;
    }
    if (equal > best) { best = equal; bestStart = i; }
    if (equal === target.length) exact++;
  }
  return {matchedWordLengths: best, total: target.length,
    longestContiguous: longest, exactWindows: exact,
    startWordIndex: bestStart,
    bestWindow: words.slice(bestStart, bestStart + target.length).join(' ')};
}

/** @param {string} url @returns {Promise<Buffer>} */
function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error('HTTP ' + response.statusCode + ' for ' + url));
        return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/** @param {Buffer} bytes @returns {string} canonical Git blob SHA1. */
function gitBlobSha(bytes) {
  return crypto.createHash('sha1').update('blob ' + bytes.length + '\0')
    .update(bytes).digest('hex');
}

/** @returns {Promise<object>} */
async function run() {
  assert.equal(QUOTES.q6.length, 34);
  assert.equal(QUOTES.q6.reduce((sum, n) => sum + n, 0), 160);
  const samples = LOCAL.map(file => ({
    name: file,
    text: fs.readFileSync(path.join(root, file), 'utf8')
  }));
  for (const [file, blob] of Object.entries(GOSPELS)) {
    const url = 'https://raw.githubusercontent.com/' + REPO + '/' + COMMIT + '/' + file;
    const bytes = await download(url);
    assert.equal(gitBlobSha(bytes), blob, 'KJV source changed: ' + file);
    samples.push({name: REPO + '/' + file + '@' + COMMIT.slice(0, 12),
      text: bytes.toString('utf8')});
  }
  const output = [];
  for (const sample of samples) {
    const words = wordsOf(sample.text);
    const gates = Object.fromEntries(
      Object.entries(QUOTES).map(([key, pattern]) => [key, search(words, pattern)]));
    for (const gate of Object.values(gates)) {
      assert.equal(gate.exactWindows, 0,
        'New source-exact quoted plaintext crib in ' + sample.name);
    }
    const nativePlant = words.slice(100, 134).map(gpLength);
    assert.equal(search(words, nativePlant).exactWindows >= 1, true,
      'Positive planted 34-word native quotation must be found');
    output.push({source: sample.name, corpusWords: words.length, gates});
  }
  return {
    status: 'No exact original quotation GP word-length crib among eleven frozen sources',
    originalSource: 'LP2 7 quote spans; corrected sixth p42 full-stop at original offset 10320',
    quoteLengths: QUOTES,
    knownLimitation: 'Finite source set; English with these lengths may occur elsewhere; no cipher inverse or key derived',
    corpus: output
  };
}
if (require.main === module) {
  run().then(result => process.stdout.write(JSON.stringify(result, null, 2) + '\n'))
    .catch(error => { process.stderr.write(String(error) + '\n'); process.exitCode = 1; });
}
module.exports = {run, gpLength, wordsOf, search, gitBlobSha};
