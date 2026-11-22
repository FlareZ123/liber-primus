'use strict';

/**
 * LP2 18-new-source public-domain quote fingerprint SFT.
 *
 * Supply the original GITenberg text file contents in one local folder
 * (paths are the manifest's basename). The exact Git blob SHA-1 guards
 * against edition drift. No text files are modified and no ciphertext
 * key fitting is performed. All four target shapes are original LP2
 * quoted runs; no source passage was selected by a language model.
 *
 * Node 22, CommonJS; example from repo root:
 * node sims/lp2_quote18_publicdomain_sft.cjs path/to/texts
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SOURCES = [
  ['The Time Machine', 'GITenberg/The-Time-Machine_35', '35.txt', '274f8365792e456d976f64578a4b3a71502db45e', 35854, 7],
  ['The Picture of Dorian Gray', 'GITenberg/The-Picture-of-Dorian-Gray_174', '174.txt', 'e3de9090fb56f2745adfe21bdf015a4e6e942354', 83502, 8],
  ['Frankenstein', 'GITenberg/Frankenstein_84', '84.txt', '176b1be39b6d925277c2d3bf413959a5dae8f095', 78333, 7],
  ['The War of the Worlds', 'GITenberg/The-War-of-the-Worlds_36', '36.txt', '6552c05ab20acc98e6d6930de0821c663e2a8f96', 63971, 7],
  ['Dr Jekyll and Mr Hyde', 'GITenberg/The-Strange-Case-of-Dr.-Jekyll-and-Mr.-Hyde_43', '43.txt', '5ee15fcfada406ea1f3a359314ac9bca4a926d50', 29019, 6],
  ['The Prince', 'GITenberg/The-Prince_1232', '1232.txt', '505d4f2d8658b0ade4a9c670fc53fbda476c79c0', 52620, 7],
  ['As a Man Thinketh', 'GITenberg/As-a-Man-Thinketh_4507', '4507.txt', '853d924eda98304cd2662fa8bc77e680598a570d', 10734, 6],
  ['Meditations', 'GITenberg/Meditations_2680', '2680.txt', 'cb9f6fa4a0ac4b62ab3d860a26a7730adcd15843', 75239, 8],
  ['Walden', 'GITenberg/Walden-and-On-The-Duty-Of-Civil-Disobedience_205', '205.txt', 'ef740fbc0f9bf70ce68534ff40f151f597ca580b', 120159, 7],
  ['The Secret Garden', 'GITenberg/The-Secret-Garden_17396', '17396.txt', 'baac5264407fbcd2845d9ba49f0169053e798f5e', 86619, 7],
  ['Dracula', 'GITenberg/Dracula_345', '345.txt', 'b6f73c6a78878851adc88db05cf0f945b63853f7', 166506, 8],
  ['Thus Spake Zarathustra', 'GITenberg/Thus-Spake-Zarathustra--A-Book-for-All-and-None_1998', '1998.txt', 'f7265f12cd1a9f02d0d84a37032c0b06aa2d303e', 116703, 8],
  ['The Dhammapada', 'GITenberg/Dhammapada-a-Collection-of-Verses--Being-One-of-the-Canonical-Books-of-the-Buddhists_2017', '2017.txt', 'cabc66525315001cfde2d62902c6c235f0dd54b9', 14834, 6],
  ['Tao Teh King', 'GITenberg/The-Tao-Teh-King-or-the-Tao-and-its-Characteristics_216', '216.txt', 'd8cc99c3cf19a4a34d77e172ca9a2aa89827e802', 13520, 8],
  ['The Upanishads', 'GITenberg/The-Upanishads_3283', '3283.txt', '331fbfb5f9344d7e06b86597033450779c00526e', 20907, 7],
  ['Beyond Good and Evil', 'GITenberg/Beyond-Good-and-Evil_4363', '4363.txt', '9d09eebd9d29b814d91858572b49abdf0bb805d1', 67311, 9],
  ['The Book of Tea', 'GITenberg/The-Book-of-Tea_769', '769.txt', 'fd1545103600f8f8e18d4ced550106767be891fb', 21361, 6],
  ['The Kybalion', 'GITenberg/The-KybalionA-Study-of-The-Hermetic-Philosophy-of-Ancient-Egypt-and-Greece_14209', '14209.txt', '04b68061063bd61a0f7192c48d2dfd9c60370bcf', 37411, 6],
];

const TARGETS = {
  p40_quote14: [5, 7, 2, 3, 4, 6, 4, 3, 3, 4, 4, 4, 5, 4],
  p42_quote13: [9, 8, 3, 4, 6, 3, 10, 2, 4, 7, 6, 2, 4],
  p42p43_quote34: [4, 2, 4, 6, 6, 8, 8, 3, 5, 5, 9, 2, 2, 4, 3, 3, 2, 8, 4, 7, 4, 4, 3, 2, 5, 3, 3, 6, 3, 11, 4, 4, 8, 5],
  p53_quote14: [5, 7, 2, 3, 4, 10, 3, 9, 7, 3, 7, 4, 3, 3],
};

/**
 * @param {string} word - Upper-case Latin word.
 * @returns {number} Native GP rune length (ING precedes NG).
 */
const gpLength = word => (word.match(/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g) || []).length;

/**
 * @param {Record<string, number[]>} targets - Fixed native GP length tapes.
 * @returns {Map<string, {id:string,start:number}[]>}
 */
function seedMap(targets) {
  const lookup = new Map();
  for (const [id, pattern] of Object.entries(targets)) {
    for (let start = 0; start + 6 <= pattern.length; start += 1) {
      const key = pattern.slice(start, start + 6).join(',');
      const entries = lookup.get(key) || [];
      entries.push({ id, start });
      lookup.set(key, entries);
    }
  }
  return lookup;
}

/**
 * @param {number[]} source - GP rune lengths of a fixed source edition.
 * @param {Record<string, number[]>} targets - Exact original quote lengths.
 * @returns {{length:number,id:string,sourceStart:number,targetStart:number}}
 */
function longestMatch(source, targets) {
  const lookup = seedMap(targets);
  let best = { length: 0, id: '', sourceStart: -1, targetStart: -1 };
  for (let i = 0; i + 6 <= source.length; i += 1) {
    const matches = lookup.get(source.slice(i, i + 6).join(',')) || [];
    for (const { id, start } of matches) {
      const pattern = targets[id];
      let a = start, b = i, len = 6;
      while (a > 0 && b > 0 && pattern[a - 1] === source[b - 1]) {
        a -= 1; b -= 1; len += 1;
      }
      while (a + len < pattern.length && b + len < source.length
        && pattern[a + len] === source[b + len]) {
        len += 1;
      }
      if (len > best.length) best = { length: len, id, sourceStart: b, targetStart: a };
    }
  }
  return best;
}

/** @param {Buffer} content @returns {string} Immutable Git blob id */
function gitBlobSha(content) {
  return crypto.createHash('sha1')
    .update('blob ' + content.length + '\0')
    .update(content)
    .digest('hex');
}

function run(readSource) {
  const all = [];
  let wordTotal = 0;
  for (const [name, repository, filename, expectedSha, expectedWords, expectedLongest] of SOURCES) {
    const raw = readSource(filename, repository);
    assert.equal(gitBlobSha(raw), expectedSha, 'edition changed: ' + name);
    const words = (raw.toString('utf8').match(/[A-Za-z]+/g) || []).map(w => w.toUpperCase());
    assert.equal(words.length, expectedWords, 'word count changed: ' + name);
    const lengths = words.map(gpLength);
    const best = longestMatch(lengths, TARGETS);
    assert.equal(best.length, expectedLongest, 'best match changed: ' + name);
    assert(best.length < 12, 'a qualifying long source crib requires follow-up: ' + name);
    // Source-native positive: a genuine planted 34-word contiguous snippet
    // is detected by the exact same original-source scanner.
    const plant = lengths.slice(Math.floor(lengths.length / 2), Math.floor(lengths.length / 2) + 34);
    const plantedBest = longestMatch(lengths, { planted_source_quote34: plant });
    assert.equal(plantedBest.length, 34, 'planted source quote control failed: ' + name);
    wordTotal += words.length;
    all.push({ name, words: words.length, longest: best.length,
      longestSpan: best.id, plantedRecovered: plantedBest.length });
  }
  assert.equal(wordTotal, 1094603);
  return {
    classification: 'FINITE NEGATIVE; NO NEW LP2 PLAINTEXT OR KEY',
    sources: all.length,
    words: wordTotal,
    targetQuoteLengths: Object.fromEntries(Object.entries(TARGETS).map(([id, x]) => [id, x.length])),
    qualifyingMatchesAtLeast12Words40Runes: 0,
    sourceResults: all,
  };
}

if (require.main === module) {
  const folder = process.argv[2];
  assert(folder, 'usage: node sims/lp2_quote18_publicdomain_sft.cjs path/to/18-gutenberg-txt-files');
  console.log(JSON.stringify(run(filename => fs.readFileSync(path.join(folder, filename))), null, 2));
}
module.exports = { SOURCES, TARGETS, gpLength, longestMatch, gitBlobSha, run };
