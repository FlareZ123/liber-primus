'use strict';

/**
 * @file Original LP2 direct-running-pad test from the exact first-party 2014
 * Fifth Onion PGP-signed media attachment.
 *
 * Node.js 22, CommonJS. Read-only SFT. No external dependencies or network.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const message = fs.readFileSync(
  path.join(root, 'resources/historical/cicada2014-onion5-signed.asc'),
  'utf8',
);
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'),
  'utf8',
));

/**
 * The actual clearsigned payload is a sequence of complete lowercase hex lines
 * between the author-written introductory sentence and the first GEB book-code
 * record. Selecting those lines excludes the later coordinates and PGP armor.
 *
 * @param {string} signedMessage
 * @returns {Buffer}
 */
function getMediaBytes(signedMessage) {
  assert.ok(signedMessage.startsWith('-----BEGIN PGP SIGNED MESSAGE-----'));
  const mediaRegion = signedMessage.split(/\r?\n3PI:/)[0];
  assert.ok(mediaRegion.includes('Very good.  You have done well to come this far.'));
  const hex = mediaRegion.split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => /^[0-9a-f]+$/.test(line))
    .join('');
  assert.equal(hex.length, 24014);
  const media = Buffer.from(hex, 'hex');
  assert.equal(media.length, 12007);
  assert.equal(media.subarray(0, 2).toString('hex'), 'ffd8');
  assert.equal(media.subarray(1082, 1084).toString('hex'), 'ffd9');
  assert.equal(media.subarray(1084, 1086).toString('hex'), 'ffd8');
  assert.equal(media.subarray(2717, 2719).toString('hex'), 'ffd9');
  assert.equal(media.subarray(2719, 2721).toString('hex'), 'fff3');
  return media;
}

/**
 * @param {number[]} runes
 * @returns {number}
 */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0)
    / (runes.length * (runes.length - 1));
}

/**
 * For sign=+1 this emits C=P+K. For sign=-1 this inverts it. Reversing
 * the sign must reconstruct the exact original input.
 *
 * @param {number[][]} sourcePages
 * @param {Buffer} pad
 * @param {'mod'|'scaled'} codec
 * @param {1|-1} sign
 * @param {'book'|'page'} clock
 * @returns {number[][]}
 */
function shiftPages(sourcePages, pad, codec, sign, clock) {
  let counter = 0;
  return sourcePages.map(page => {
    if (clock === 'page') counter = 0;
    return page.map(rune => {
      const byte = pad[counter % pad.length];
      const shift = codec === 'mod'
        ? byte % 29
        : Math.floor(byte * 29 / 256);
      counter += 1;
      return (rune + sign * shift + 29) % 29;
    });
  });
}

/**
 * @param {number[][]} pages
 * @returns {number[]}
 */
function flatten(pages) {
  return pages.flat();
}

const media = getMediaBytes(message);
const pads = [
  ['all-12007', media],
  ['godel-jpeg-1084', media.subarray(0, 1084)],
  ['escher-jpeg-1635', media.subarray(1084, 2719)],
  ['bach-audio-9288', media.subarray(2719)],
];
assert.deepEqual(pads.map(([name, p]) => [name, p.length]), [
  ['all-12007', 12007],
  ['godel-jpeg-1084', 1084],
  ['escher-jpeg-1635', 1635],
  ['bach-audio-9288', 9288],
]);

const unsolved = corpus.pages
  .filter(page => page.page < 56 && Array.isArray(page.indices) && page.indices.length)
  .map(page => page.indices);
assert.equal(unsolved.length, 55);
assert.equal(flatten(unsolved).length, 12956);

const solvedP57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(solvedP57.length, 95);
assert.ok(ioc(solvedP57) > 0.0627 && ioc(solvedP57) < 0.0628);

const observed = [];
for (const [name, pad] of pads) {
  for (const codec of ['mod', 'scaled']) {
    for (const sign of [-1, 1]) {
      for (const clock of ['book', 'page']) {
        const decoded = shiftPages(unsolved, pad, codec, sign, clock);
        observed.push({name, codec, sign, clock, ioc: ioc(flatten(decoded))});

        // Exact 95-rune native-GP positive. Source-selected media bytes
        // are intentionally used in the forward cipher and recovery.
        const planted = shiftPages([solvedP57], pad, codec, 1, clock);
        const recovered = shiftPages(planted, pad, codec, -1, clock);
        assert.deepEqual(recovered, [solvedP57]);
        assert.ok(ioc(flatten(recovered)) > 0.06);

        // All unchanged original GP values must reconstruct exactly.
        const reconstructed = shiftPages(decoded, pad, codec, -sign, clock);
        assert.deepEqual(reconstructed, unsolved);
      }
    }
  }
}

const originalIoc = ioc(flatten(unsolved));
const sorted = observed.sort((a, b) => a.ioc - b.ioc);
assert.equal(observed.length, 32);
assert.ok(Math.abs(originalIoc - 0.03447839786450569) < 1e-14);
assert.ok(Math.abs(sorted[0].ioc - 0.034455686431610885) < 1e-14);
assert.ok(Math.abs(sorted[31].ioc - 0.03454425625359781) < 1e-14);
assert.deepEqual(
  [sorted[31].name, sorted[31].codec, sorted[31].sign, sorted[31].clock],
  ['bach-audio-9288', 'mod', 1, 'page'],
);

console.log(JSON.stringify({
  input: {
    signedOriginalMediaBytes: media.length,
    components: pads.map(([name, p]) => ({name, bytes: p.length})),
    lp2OriginalCipherRunes: flatten(unsolved).length,
    originalIoc,
    solvedP57Ioc: ioc(solvedP57),
  },
  models: observed.length,
  minimum: sorted[0],
  maximum: sorted[31],
  syntheticNativePositiveRoundtrips: 32,
  unchangedCipherForwardRoundtrips: 32,
  conclusion: 'No original GP-native plaintext from the frozen direct media-pad family',
}, null, 2));
