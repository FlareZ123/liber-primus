"use strict";
/**
 * Source-fixed F31 marker→fragment→grid-row/key mapping.
 *
 * Hypothesis:
 *  - 30 red 13-dot marks, in physical order, label their following fragments
 *    with successive powers of primitive root 13 modulo 31.
 *  - the unique black 13-dot mark labels its following (empty) fragment 0;
 *  - the otherwise unlabelled leading fragment receives sentinel 31 from the
 *    all-solid five-dot motif.
 *  - each labelled fragment uses the same-labelled 32×8 table row as nonce;
 *    the 32 red-rune interval lengths, reordered by label, form a 32-byte key.
 *
 * This is one source-derived map, not a recovered cipher. Test only the
 * existing finite AES-256-CTR/ChaCha20 + GP29/GP28-EA inverse families.
 * Node 22; no third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { train, encode } = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const grid = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const pages = corpus.pages.filter(p => p.page < 56);
const C = pages.flatMap(p => p.indices);
const MOD = 29, EA = 28, ROOT15 = 15;
const mod = (x, n) => (x % n + n) % n;
assert.equal(C.length, 12956);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(r => r.length === 8));

const gpLog = new Array(29).fill(-1), gpPow = new Array(28);
for (let i = 0, v = 1; i < 28; i++, v = mod(ROOT15 * v, 29)) {
  gpLog[v] = i;
  gpPow[i] = v;
}
assert.equal(new Set(gpPow).size, 28);

/** Build the exact 32 source fragments and their original rune boundaries. */
function originalFragments() {
  const events = [];
  for (const page of ink.pages) {
    const p = corpus.pages[page.page];
    assert.equal(page.rune_count, p.indices.length);
    for (const span of page.red_spans || []) {
      for (let i = 0; i < span.length; i++) {
        assert.equal(corpus.runes[p.indices[span.start + i]], [...span.runes][i]);
        events.push({ page: page.page, offset: span.start + i, kind: 1 });
      }
    }
    for (const mark of page.large_punctuation || []) {
      if (mark[1] === 13) events.push({ page: page.page, offset: mark[0], kind: 0 });
    }
  }
  events.sort((a, b) => a.page - b.page || a.offset - b.offset || a.kind - b.kind);
  assert.equal(events.length, 256);
  let eventIndex = 0, current = 0, redCount = 0;
  const lengths = [], bounds = [0];
  for (const page of corpus.pages) {
    for (let i = 0; i <= page.indices.length; i++) {
      while (eventIndex < events.length &&
             events[eventIndex].page === page.page &&
             events[eventIndex].offset === i) {
        if (events[eventIndex].kind === 0) {
          lengths.push(redCount);
          redCount = 0;
          bounds.push(current);
        } else {
          redCount++;
        }
        eventIndex++;
      }
      if (i < page.indices.length) current++;
    }
  }
  lengths.push(redCount);
  assert.equal(eventIndex, 256);
  assert.equal(current, 13136);
  assert.equal(lengths.length, 32);
  assert.equal(bounds.length, 32);
  assert.equal(bounds[28], C.length);
  assert.equal(lengths.reduce((a, b) => a + b, 0), 225);
  assert.equal(Buffer.from(lengths).toString('hex'),
    '0d00100003000b00000e0c00090b00100013000a00080003003b090005000700');
  return { lengths, bounds };
}
const { lengths, bounds } = originalFragments();
const boundaries = bounds.slice(0, 29);
assert.equal(boundaries.length, 29);
assert.equal(boundaries[18], 6546);

/** The marker labels define the only fragment→row permutation tested here. */
function powMod(a, e, n) {
  let x = 1;
  for (let i = 0; i < e; i++) x = (x * a) % n;
  return x;
}
function f31Mapping() {
  const marks = ink.pages.flatMap(p => (p.large_punctuation || [])
    .filter(m => m[1] === 13)
    .map(m => ({ page: p.page, offset: m[0], ink: m[2] })))
    .sort((a, b) => a.page - b.page || a.offset - b.offset ||
      (a.ink === 'black' ? -1 : b.ink === 'black' ? 1 : 0));
  assert.equal(marks.length, 31);
  assert.equal(marks.filter(m => m.ink === 'red').length, 30);
  assert.equal(marks.filter(m => m.ink === 'black').length, 1);
  assert.deepEqual(marks[7], { page: 7, offset: 194, ink: 'black' });
  assert.deepEqual(marks[8], { page: 7, offset: 194, ink: 'red' });
  const labels = [];
  let exponent = 0;
  for (const mark of marks) {
    if (mark.ink === 'black') labels.push(0);
    else labels.push(powMod(13, exponent++, 31));
  }
  assert.equal(exponent, 30);
  assert.equal(new Set(labels).size, 31);
  assert.deepEqual(labels.slice().sort((a, b) => a - b),
    Array.from({ length: 31 }, (_, i) => i));
  // Fragment 0 precedes every marker; each marker labels its following fragment.
  const rowForFragment = [31, ...labels];
  assert.equal(rowForFragment.length, 32);
  assert.deepEqual(rowForFragment.slice().sort((a, b) => a - b),
    Array.from({ length: 32 }, (_, i) => i));
  // The unique black marker is followed by the known empty fragment.
  assert.equal(rowForFragment[8], 0);
  assert.equal(bounds[8], bounds[9]);
  const keyByLabel = Buffer.alloc(32);
  for (let f = 0; f < 32; f++) keyByLabel[rowForFragment[f]] = lengths[f];
  return { marks, labels, rowForFragment, keyByLabel };
}
const mapping = f31Mapping();
const { marks, labels, rowForFragment, keyByLabel } = mapping;
const keyOrders = [
  ['raw-f31', keyByLabel],
  ['reverse-f31', Buffer.from(keyByLabel).reverse()],
  ['sha256-f31', crypto.createHash('sha256').update(keyByLabel).digest()],
  ['sha256-reverse-f31', crypto.createHash('sha256')
    .update(Buffer.from(keyByLabel).reverse()).digest()]
];
const nonceModes = ['row-zero', 'zero-row', 'row-row', 'sha256-row'];
const algorithms = ['aes-256-ctr', 'chacha20'];
const families = ['add', 'exclude', 'exp'];
const signs = [-1, 1];
const projections = ['mod', 'scale'];

/** @param {number[]} row @param {string} mode @returns {Buffer} */
function nonce(row, mode) {
  const b = Buffer.from(row);
  if (mode === 'row-zero') return Buffer.concat([b, Buffer.alloc(8)]);
  if (mode === 'zero-row') return Buffer.concat([Buffer.alloc(8), b]);
  if (mode === 'row-row') return Buffer.concat([b, b]);
  return crypto.createHash('sha256').update(b).digest().subarray(0, 16);
}

/** One independent fragment-reset stream; no fitted or searched row mapping. */
function makePad(key, ivMode, algorithm) {
  const output = Buffer.alloc(C.length);
  for (let f = 0; f < 28; f++) {
    const start = boundaries[f], end = boundaries[f + 1], len = end - start;
    if (!len) continue;
    const iv = nonce(grid.byte_rows[rowForFragment[f]], ivMode);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const pad = Buffer.concat([cipher.update(Buffer.alloc(len)), cipher.final()]);
    pad.copy(output, start);
  }
  return output;
}

/** @param {number[]} input @param {Buffer} pad @param {object} mode @param {boolean} encodeMode */
function transform(input, pad, mode, encodeMode) {
  const output = new Array(input.length);
  for (let f = 0; f < 28; f++) {
    let previousCipher = -1;
    for (let i = boundaries[f]; i < boundaries[f + 1]; i++) {
      const period = mode.family === 'add' ? 29 : 28;
      const key = mode.projection === 'mod' ? pad[i] % period :
        Math.floor(period * pad[i] / 256);
      const value = input[i];
      let next;
      if (mode.family === 'add') {
        next = mod(value + (encodeMode ? -1 : 1) * mode.sign * key, 29);
      } else if (previousCipher < 0) {
        next = value;
      } else if (mode.family === 'exp') {
        if (encodeMode) {
          next = value === EA ? previousCipher :
            mod(previousCipher + gpPow[mod(value + mode.sign * key, 28)], 29);
        } else {
          next = value === previousCipher ? EA :
            mod(gpLog[mod(value - previousCipher, 29)] - mode.sign * key, 28);
        }
      } else if (encodeMode) {
        next = value === EA ? previousCipher :
          mod(previousCipher + 1 + mod(value + mode.sign * key, 28), 29);
      } else {
        next = value === previousCipher ? EA :
          mod(mod(value - previousCipher - 1, 29) - mode.sign * key, 28);
      }
      output[i] = next;
      if (mode.family !== 'add') previousCipher = encodeMode ? next : value;
    }
  }
  return output;
}

/** @param {number[]} runes @param {number} start @param {number} end */
function normalizedIoC(runes, start, end) {
  const counts = new Uint32Array(29);
  for (let i = start; i < end; i++) counts[runes[i]]++;
  const n = end - start;
  let sum = 0;
  for (const count of counts) sum += count * (count - 1);
  return 29 * sum / (n * (n - 1));
}

/** Same GP-English model used by existing LP2 key/nonce Viterbi screens. */
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const lm = train(shakespeare.slice(0, 200000));
function languageScore(runes) {
  if (!runes.length) return -Infinity;
  let score = lm.unigram[runes[0]];
  if (runes.length > 1) score += lm.bigram[runes[0] * 29 + runes[1]];
  for (let i = 2; i < runes.length; i++) {
    score += lm.trigram[(runes[i - 2] * 29 + runes[i - 1]) * 29 + runes[i]];
  }
  return score / runes.length;
}
const nativePlant = encode(shakespeare.slice(205000)).slice(0, C.length);
assert.equal(nativePlant.length, C.length);

function main() {
  const variants = [];
  for (const [keyName, key] of keyOrders) {
    for (const ivMode of nonceModes) {
      for (const algorithm of algorithms) {
        const pad = makePad(key, ivMode, algorithm);
        for (const family of families) for (const sign of signs)
          for (const projection of projections) {
            const mode = { family, sign, projection };
            const decoded = transform(C, pad, mode, false);
            assert.deepEqual(transform(decoded, pad, mode, true), C);
            variants.push({
              key: keyName, iv: ivMode, algorithm, ...mode,
              trainIoC: normalizedIoC(decoded, 0, boundaries[18]),
              heldoutIoC: normalizedIoC(decoded, boundaries[18], C.length),
              trainEnglishGP: languageScore(decoded.slice(0, boundaries[18])),
              heldoutEnglishGP: languageScore(decoded.slice(boundaries[18])),
              prefix: decoded.slice(0, 54).map(x => corpus.translit[x]).join('')
            });
          }
      }
    }
  }
  variants.sort((a, b) => b.trainEnglishGP - a.trainEnglishGP);
  const byHeldout = variants.slice().sort((a, b) =>
    b.heldoutEnglishGP - a.heldoutEnglishGP);
  const rawEnglishGP = languageScore(C);
  const rawTrainIoC = normalizedIoC(C, 0, boundaries[18]);
  const rawHeldoutIoC = normalizedIoC(C, boundaries[18], C.length);

  // A genuine English-GP positive plant verifies the exact inverse and scorer.
  const plantKey = keyOrders[0][1];
  const plantPad = makePad(plantKey, 'row-zero', 'aes-256-ctr');
  const plantMode = { family: 'exp', sign: 1, projection: 'mod' };
  const plantedCipher = transform(nativePlant, plantPad, plantMode, true);
  const recovered = transform(plantedCipher, plantPad, plantMode, false);
  assert.deepEqual(recovered, nativePlant);

  const output = {
    classification: 'Single source-derived F31 fragment→row/key mapping; candidate cipher family only',
    source: {
      originalCipherRunes: C.length, physicalRunePages: pages.length,
      redRuneTotal: 225, markerTotal: marks.length,
      redMarkers: 30, blackMarkers: 1, sourceFragments: lengths.length,
      unknownFragments: 28, gridRows: grid.byte_rows.length,
      primitiveRoot: 13, modulus: 31, order: 30,
      leadingFragmentSentinel: 31,
      markers: marks, markerLabels: labels, rowForFragment,
      redFragmentLengths: lengths, keyByLabel: [...keyByLabel],
      keyByLabelHex: keyByLabel.toString('hex'),
      boundaries, trainStop: boundaries[18]
    },
    tested: { models: variants.length, keyRepresentations: keyOrders.map(x => x[0]),
      nonceModes, algorithms, families, signs, projections,
      permutationsSearched: false },
    raw: { englishGP: rawEnglishGP, trainIoC: rawTrainIoC,
      heldoutIoC: rawHeldoutIoC },
    bestTraining: variants.slice(0, 12),
    bestHeldout: byHeldout.slice(0, 12),
    positiveControl: {
      plaintext: 'withheld Shakespeare English mapped to GP',
      runes: nativePlant.length, exactRecovered: recovered.length,
      plaintextEnglishGP: languageScore(nativePlant),
      recoveredEnglishGP: languageScore(recovered),
      cipherEnglishGP: languageScore(plantedCipher)
    },
    status: 'No LP2 plaintext claim; compare held-out language score and IoC to raw before accepting any candidate'
  };
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  return output;
}
if (require.main === module) main();
module.exports = { originalFragments, f31Mapping, makePad, transform, normalizedIoC, languageScore, main };
