'use strict';

/**
 * Whole-original-2014-MP3 offset search for the conditional p0 red8+5 crib.
 *
 * Independent source inputs:
 *   2014 authenticated Interconnectedness MP3 (Git blob SHA1 pinned);
 *   p0's first 13 unchanged GP29 ciphertext runes (red8 + red5);
 *   signed 2016 words EPIPHANY SEEKS (GP-native EPIPHANY SEECS).
 *
 * No offset, hash, key, dictionary word, or cipher clock is fitted.
 * Only the two historically tested byte projections and two additive signs.
 * Windows Node.js 22, single-file, no output writes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const corpus = require('../resources/liber-primus/lp2-corpus.json');

const url = 'https://raw.githubusercontent.com/krisyotam/cicada3301/main/media/audio/index.mp3';
const expectedLength = 6651873;
const expectedBlobSha = '09fe068192b76a3697c47ec1d604b527703db798';
const p0 = corpus.pages.find((item) => item.page === 0).indices;
const cribText = ['E', 'P', 'I', 'P', 'H', 'A', 'N', 'Y', 'S', 'E', 'E', 'C', 'S'];
const crib = cribText.map((r) => corpus.translit.indexOf(r));
const mod29 = (x) => (x % 29 + 29) % 29;

assert.equal(p0.length, 262);
assert.deepEqual(p0.slice(0, 13), [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
assert.equal(crib.length, 13);
assert.ok(crib.every((x) => x >= 0));
assert.deepEqual(crib, [18, 13, 10, 13, 8, 24, 9, 26, 15, 18, 18, 5, 15]);

/**
 * @param {Uint8Array} audio
 * @param {number[]} ciphertext
 * @param {'mod29'|'scaled'} projection
 * @param {1|-1} sign
 * @returns {{prefixMatches:number,maxPrefix:number,bestOffset:number,fullOffsets:number[],decodedExamples:string[]}}
 */
function scan(audio, ciphertext, projection, sign) {
  const table = Uint8Array.from({length: 256}, (_, b) =>
    projection === 'mod29' ? b % 29 : Math.floor(29 * b / 256));
  const need = crib.map((p, i) => mod29(sign * (p - ciphertext[i])));
  const limit = audio.length - ciphertext.length;
  assert.ok(limit >= 0);
  let maxPrefix = 0;
  let bestOffset = -1;
  let prefixMatches = 0;
  const fullOffsets = [];
  const decodedExamples = [];
  for (let offset = 0; offset <= limit; offset += 1) {
    if (table[audio[offset]] !== need[0]) continue;
    prefixMatches += 1;
    let k = 1;
    while (k < 13 && table[audio[offset + k]] === need[k]) k += 1;
    if (k > maxPrefix) { maxPrefix = k; bestOffset = offset; }
    if (k === 13) {
      fullOffsets.push(offset);
      const plaintext = ciphertext.map((c, i) => mod29(c + sign * table[audio[offset + i]]));
      assert.deepEqual(plaintext.slice(0, 13), crib);
      decodedExamples.push(plaintext.map((v) => corpus.translit[v]).join('-'));
    }
  }
  return {prefixMatches,maxPrefix,bestOffset,fullOffsets,decodedExamples};
}

function plantedControl(audio) {
  const position = 1234567;
  const first = p0.slice();
  const table = Uint8Array.from({length: 256}, (_, b) => b % 29);
  for (let i = 0; i < 13; i += 1) first[i] = mod29(crib[i] + table[audio[position + i]]);
  const x = scan(audio, first, 'mod29', -1);
  assert.ok(x.fullOffsets.includes(position), 'Search failed to recover known planted offset');
  return {position,found:x.fullOffsets.length,maxPrefix:x.maxPrefix};
}

async function main() {
  const response = await fetch(url, {signal: AbortSignal.timeout(120000)});
  assert.equal(response.status, 200);
  const audio = Buffer.from(await response.arrayBuffer());
  assert.equal(audio.length, expectedLength);
  const gitBlob = crypto.createHash('sha1')
    .update(Buffer.from('blob ' + audio.length + '\0')).update(audio).digest('hex');
  assert.equal(gitBlob, expectedBlobSha);
  const plant = plantedControl(audio);
  const results = [];
  for (const projection of ['mod29','scaled']) {
    for (const sign of [-1, 1]) {
      results.push({projection,sign,...scan(audio,p0,projection,sign)});
    }
  }
  console.log(JSON.stringify({
    originalAudioBytes: audio.length, originalGitBlobSHA1: gitBlob,
    originalP0Runes: p0.length, authenticatedPhrase: 'EPIPHANY SEEKS',
    proposedGP29Crib: 'EPIPHANY SEECS',
    testedOffsetsPerProjection: audio.length - p0.length + 1,
    independentFullLengthPlant: plant, results,
    totalDirectCribMatches: results.reduce((n, r) => n + r.fullOffsets.length, 0),
  }, null, 2));
  console.log('PASS original full-offset 2014 audio/2016 signed red-title crib scan');
}
main().catch((error) => {console.error(error); process.exitCode = 1;});
