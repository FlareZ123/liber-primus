'use strict';
/**
 * Original source-selected experimental "HEX" OutGuess consumer.
 *
 * The 255 complete p3–p7 printed words and 255 original p8 runes have
 * three repeated-word pairs. Subtract p8 rune at the second occurrence
 * from its first occurrence modulo 29: the fixed source order spells HEX.
 *
 * Do NOT treat this post-observed token as authenticated. Test the exact,
 * uppercase, creator-prior OutGuess password only on the authentic local
 * images (source scroll's terminal page, its p8 receiver and the source
 * 256-byte numerical panel). The companion SFT independently validates a
 * newly embedded known-key payload, LP1's actual known payload images, and a
 * clean generated no-payload JPEG for EVERY original-carrier attempt.
 *
 * Node.js 22, CommonJS, requires pinned OutGuess 0.4 on PATH.
 * Run via the manual reusable OutGuess source runner workflow.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const root = path.join(__dirname, '..');
const sourceDir = path.join(root, 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(
  path.join(sourceDir, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(
  path.join(sourceDir, 'lp2-transcription.txt'), 'utf8');
const grid = JSON.parse(fs.readFileSync(
  path.join(sourceDir, 'lp2-grid-256.json'), 'utf8'));
const runes = new Map(corpus.runes.map((rune, index) => [rune, index]));
const words = [];
let word = [];
for (const page of transcription.split('%').slice(3, 8)) {
  for (const char of page) {
    if (runes.has(char)) word.push(runes.get(char));
    else if ((char === '-' || char === '.') && word.length) {
      words.push(word);
      word = [];
    }
  }
}
if (word.length) words.push(word);
assert.equal(words.length, 255);
assert.equal(words.flat().length, 1145);
assert.deepEqual(words.flat(), corpus.pages.slice(3, 8).flatMap(p => p.indices));
assert.equal(grid.bytes.length, 256);
const receiver = corpus.pages[8].indices;
assert.equal(receiver.length, 255);

const groups = new Map();
words.forEach((w, i) => {
  const id = w.join(',');
  if (!groups.has(id)) groups.set(id, []);
  groups.get(id).push(i);
});
const repeated = [...groups.values()].filter(ids => ids.length > 1);
assert.deepEqual(repeated, [[47, 240], [48, 231], [235, 236]]);
const mod29 = x => ((x % 29) + 29) % 29;
const differences = repeated.map(([a, b]) => mod29(receiver[a] - receiver[b]));
assert.deepEqual(differences, [8, 18, 14]);
const key = differences.map(i => corpus.translit[i]).join('');
assert.equal(key, 'HEX');

const circularMatches = Array.from({ length: 255 }, (_, offset) =>
  repeated.map(([a, b]) =>
    mod29(receiver[(a + offset) % 255] -
      receiver[(b + offset) % 255])).join(',') === '8,18,14'
    ? offset : null).filter(x => x !== null);
assert.deepEqual(circularMatches, [0]);
console.log('SOURCE_HEX_CLUE ' + JSON.stringify({
  origin: 'original p3–p7 255 printed words and original p8 255 runes',
  duplicateWordPositionPairs: repeated, differenceIndices: differences,
  key, originalPhaseOnly:true,
  caveat: 'post-observed hypothesis; independent byte evidence required'
}));

const targetImages = [24, 25, 66, 67, 68];
const reports = [];
for (const jpeg of targetImages) {
  const runner = spawnSync(process.execPath,
    [path.join(__dirname, 'outguess_lp2_keyed_probe.cjs')], {
      cwd: root, encoding:'utf8', timeout:240000, maxBuffer:4*1024*1024,
      env: {
        ...process.env,
        LP2_OUTGUESS_PASSWORD:key,
        LP2_OUTGUESS_SOURCE_IMAGE:String(jpeg)
      }
    });
  assert.equal(runner.status, 0,
    'OutGuess source '+jpeg+' failed\n'+
      String(runner.stderr).slice(-2000)+'\n'+
      String(runner.stdout).slice(-2000));
  const summary = JSON.parse(fs.readFileSync(path.join(
    root, 'outguess-results-keyed', 'summary.json'), 'utf8'));
  assert.deepEqual(summary.keys, [key]);
  assert.deepEqual(summary.pages, [jpeg]);
  assert.equal(summary.attempts, 1);
  assert.equal(summary.controls.knownKey.exactRecovery, true);
  assert.deepEqual(summary.controls.authenticDefaultImages, [0, 8]);
  const result = {
    source:jpeg+'.jpg', originalPage:jpeg-17,
    nativeHeaders: summary.headerMatches,
    payloadCandidates:summary.rawCandidates.map(x => ({
      bytes:x.bytes,first32Hex:x.first32Hex,
      sha256:x.sha256,printableFraction:x.printableFraction,
      shannonBitsPerByte:x.shannonBitsPerByte
    })),
    recognisable:summary.plausible,
    cleanNoPayloadHeader:
      summary.controls.syntheticNoPayload.headerConsistent,
    positiveEmbedded:summary.controls.knownKey.exactRecovery
  };
  reports.push(result);
  console.log('SOURCE_HEX_CARRIER '+JSON.stringify(result));
}
assert.equal(reports.length, 5);
const output = {
  candidate:'source word-collision GP29 differences read HEX',
  key, selectedOriginalImages:targetImages, reported:reports.length,
  authenticatedPayloads:reports.filter(x => x.recognisable.length).length,
  originalPositiveControls:5, syntheticCleanControls:5,
  limits:'No statement of a new embedded message without independently authentic signed/recognisable bytes'
};
console.log('SOURCE_HEX_FINAL '+JSON.stringify(output));
