'use strict';

/**
 * Test the unique 32x8 D4 row-mirror of the 2014 onion2 256-byte string as a
 * direct GP29 key. The mirror is selected by the observed 179 common-factor
 * link to the original LP2 grid and p53 red numeral; this selection is
 * retrospective and is not evidence of creator intent.
 *
 * Fixed source-derived orientation: reverse the eight bytes in each of the
 * 32 rows. No free rotations/phases. Test both conventional byte-to-GP
 * reducers, Vigenere subtraction/addition, Beaufort (with/without Atbash),
 * and page-repeat/page-one-shot/global-repeat clocks: 36 settings.
 *
 * A planted positive control uses this same mirrored key and must be
 * recovered at rank 1. This tests only direct GP29 key reuse, not KDF, XOR,
 * AES/ChaCha, or timing-state roles for the historical bytes.
 *
 * Run from repository root:
 *   node sims/onion2_mirror_gp29_vigenere_gate.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const timing = JSON.parse(read('resources/cicada2014-onion2-timing.json'));
const candidates = JSON.parse(read('resources/cicada-hiddenservice-256-candidates.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const annotations = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const shakeText = read('resources/control/shakespeare_first300k.txt');

const source = candidates.sourceServices.find((x) => x.id === 'onion2');
assert.ok(source);
assert.equal(source.hex, timing.final_hex);
assert.equal(source.hex.length, 512);
const originalBytes = Buffer.from(timing.final_hex, 'hex');
assert.equal(originalBytes.length, 256);
assert.equal(crypto.createHash('sha256').update(originalBytes).digest('hex'),
  timing.final_bytes_sha256);

const matrix = Array.from({ length: 32 }, (_, r) =>
  Array.from(originalBytes.subarray(r * 8, (r + 1) * 8))
);
const flipLR = (m) => m.map((row) => row.slice().reverse());
const flipUD = (m) => m.slice().reverse().map((row) => row.slice());
const transpose = (m) => Array.from({ length: m[0].length }, (_, c) =>
  m.map((row) => row[c])
);
const d4 = [
  ['identity', matrix],
  ['flipLR', flipLR(matrix)],
  ['flipUD', flipUD(matrix)],
  ['rotate180', flipUD(flipLR(matrix))],
  ['transpose', transpose(matrix)],
  ['transpose_flipLR', flipLR(transpose(matrix))],
  ['transpose_flipUD', flipUD(transpose(matrix))],
  ['transpose_rotate180', flipUD(flipLR(transpose(matrix)))]
];

const gridBytes = Buffer.from(grid.bytes);
assert.equal(gridBytes.length, 256);
assert.equal(crypto.createHash('sha256').update(gridBytes).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

function gcd(a, b) {
  while (b !== 0n) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}
function bigEndian(bytes) {
  return BigInt('0x' + Buffer.from(bytes).toString('hex'));
}
const N = bigEndian(gridBytes);
const page53 = corpus.pages.find((p) => p.page === 53);
const ink53 = annotations.pages.find((p) => p.page === 53);
assert.equal(page53.indices.length, 179);
const red = ink53.red_spans.flatMap((span) =>
  page53.indices.slice(span.start, span.start + span.length)
);
assert.equal(red.length, 51);
assert.equal(ink53.red_spans.length, 1);
assert.deepEqual(ink53.red_spans[0], { start: 128, length: 51 });
const R = red.reduce((value, digit) => value * 29n + BigInt(digit), 0n);

const orientationGcds = d4.map(([name, m]) => ({
  name,
  shape: [m.length, m[0].length],
  gcdWithGrid: gcd(N, bigEndian(m.flat())).toString()
}));
const matching = d4.filter(([, m]) => bigEndian(m.flat()) % 179n === 0n);
assert.equal(matching.length, 1);
assert.equal(matching[0][0], 'flipLR');

const mirroredBytes = Buffer.from(matching[0][1].flat());
const H = bigEndian(mirroredBytes);
assert.equal(gcd(N, H), 2864n);
assert.equal(gcd(R, H), 358n);
assert.equal(gcd(N, H), 16n * 179n);
assert.equal(gcd(R, H), 2n * 179n);

const MOD = 29;
const DIGRAPHS = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28 };
const LETTERS = {
  A: 24, B: 17, C: 5, D: 23, E: 18, F: 0, G: 6, H: 8, I: 10, J: 11, K: 5,
  L: 20, M: 19, N: 9, O: 3, P: 13, Q: 5, R: 4, S: 15, T: 16, U: 1, V: 1,
  W: 7, X: 14, Y: 26, Z: 15
};
const RUNE_NAMES = [
  'F', 'U', 'TH', 'O', 'R', 'C', 'G', 'W', 'H', 'N', 'I', 'J', 'EO', 'P',
  'X', 'S', 'T', 'B', 'E', 'M', 'L', 'NG', 'OE', 'D', 'A', 'AE', 'Y', 'IA',
  'EA'
];
function encodeGP(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const d = DIGRAPHS[s.slice(i, i + 2)];
    if (d !== undefined) {
      out.push(d);
      i++;
    } else {
      out.push(LETTERS[s[i]]);
    }
  }
  return out;
}

const modelSymbols = encodeGP(shakeText.slice(0, 240000));
const unigramCounts = new Uint32Array(MOD);
const bigramCounts = new Uint32Array(MOD * MOD);
const trigramCounts = new Uint32Array(MOD ** 3);
for (let i = 0; i < modelSymbols.length; i++) {
  const x = modelSymbols[i];
  unigramCounts[x]++;
  if (i) bigramCounts[modelSymbols[i - 1] * MOD + x]++;
  if (i > 1) trigramCounts[
    (modelSymbols[i - 2] * MOD + modelSymbols[i - 1]) * MOD + x
  ]++;
}
const unigram = new Float64Array(MOD);
const bigram = new Float64Array(MOD * MOD);
const trigram = new Float64Array(MOD ** 3);
for (let c = 0; c < MOD; c++) {
  unigram[c] = Math.log((unigramCounts[c] + 1) / (modelSymbols.length + MOD));
}
for (let a = 0; a < MOD; a++) {
  for (let c = 0; c < MOD; c++) {
    bigram[a * MOD + c] = Math.log(
      (bigramCounts[a * MOD + c] + 12 * Math.exp(unigram[c])) /
      (unigramCounts[a] + 12)
    );
  }
}
for (let a = 0; a < MOD; a++) {
  for (let v = 0; v < MOD; v++) {
    for (let c = 0; c < MOD; c++) {
      const ix = (a * MOD + v) * MOD + c;
      trigram[ix] = Math.log(
        (trigramCounts[ix] + 9 * Math.exp(bigram[v * MOD + c])) /
        (bigramCounts[a * MOD + v] + 9)
      );
    }
  }
}

const pages = corpus.pages.filter((p) => p.page <= 55)
  .sort((a, b) => a.page - b.page);
const trainPages = pages.filter((p) => p.page <= 27 && p.indices.length >= 180);
const holdPages = pages.filter((p) => p.page >= 28 && p.indices.length >= 180);
const globalOffsets = new Map();
let totalOffset = 0;
for (const page of pages) {
  globalOffsets.set(page.page, totalOffset);
  totalOffset += page.indices.length;
}

const reducers = [
  { name: 'byte-mod29', apply: (b) => b % MOD },
  { name: 'byte-scaled29', apply: (b) => Math.floor(MOD * b / 256) }
];
const configs = Array.from({ length: 6 }, (_, i) => ({
  atbash: i >= 3,
  op: i % 3,
  name: (i >= 3 ? 'atbash+' : '') + ['vig-', 'vig+', 'beaufort'][i % 3]
}));
const clocks = ['page-repeat', 'page-one-shot', 'global-repeat'];
const keys = reducers.map((reducer) =>
  Array.from(mirroredBytes, reducer.apply)
);

function keyIndex(clock, page, i) {
  if (clock === 'page-one-shot') return i;
  if (clock === 'global-repeat') return (globalOffsets.get(page) + i) % 256;
  return i % 256;
}
function decrypt(cipher, key, config) {
  const x = config.atbash ? MOD - 1 - cipher : cipher;
  if (config.op === 0) return (x - key + MOD) % MOD;
  if (config.op === 1) return (x + key) % MOD;
  return (key - x + MOD) % MOD;
}
function scorePages(inputPages, candidate, holdout = false) {
  const key = keys[candidate.reducer];
  const config = configs[candidate.config];
  let score = 0;
  let count = 0;
  for (const page of inputPages) {
    let a = 0, b = 0;
    const end = holdout ? 180 : 90;
    for (let i = 0; i < end; i++) {
      const ki = keyIndex(candidate.clock, page.page, i);
      if (ki >= 256) break;
      const plain = decrypt(page.indices[i], key[ki], config);
      if (holdout ? i >= 92 : i >= 2) {
        score += trigram[(a * MOD + b) * MOD + plain];
        count++;
      }
      a = b;
      b = plain;
    }
  }
  return score / count;
}
function scoreFull(candidate) {
  const key = keys[candidate.reducer];
  const config = configs[candidate.config];
  let all = 0, allN = 0, later = 0, laterN = 0;
  const pageScores = [];
  for (const page of pages) {
    let a = 0, b = 0, s = 0, n = 0;
    for (let i = 0; i < page.indices.length; i++) {
      const ki = keyIndex(candidate.clock, page.page, i);
      if (ki >= 256) break;
      const plain = decrypt(page.indices[i], key[ki], config);
      if (i >= 2) {
        const value = trigram[(a * MOD + b) * MOD + plain];
        s += value;
        n++;
        all += value;
        allN++;
        if (page.page >= 28) {
          later += value;
          laterN++;
        }
      }
      a = b;
      b = plain;
    }
    if (n) pageScores.push({ page: page.page, length: n + 2, score: s / n });
  }
  return {
    allPages: all / allN,
    laterPages: later / laterN,
    bestPages: pageScores.sort((a, b) => b.score - a.score).slice(0, 8)
  };
}

const variants = [];
for (let reducer = 0; reducer < reducers.length; reducer++) {
  for (let config = 0; config < configs.length; config++) {
    for (const clock of clocks) {
      const candidate = { reducer, config, clock };
      variants.push({
        ...candidate,
        train: scorePages(trainPages, candidate, false),
        holdout: scorePages(holdPages, candidate, true)
      });
    }
  }
}
assert.equal(variants.length, 36);
variants.sort((a, b) => b.train - a.train);
const best = variants[0];
const bestFull = scoreFull(best);

function rawScores() {
  let train = 0, trainN = 0, holdout = 0, holdN = 0;
  for (const page of trainPages) {
    for (let i = 2; i < 90; i++) {
      train += trigram[
        (page.indices[i - 2] * MOD + page.indices[i - 1]) * MOD + page.indices[i]
      ];
      trainN++;
    }
  }
  for (const page of holdPages) {
    for (let i = 92; i < 180; i++) {
      holdout += trigram[
        (page.indices[i - 2] * MOD + page.indices[i - 1]) * MOD + page.indices[i]
      ];
      holdN++;
    }
  }
  return { train: train / trainN, holdout: holdout / holdN };
}

// Positive control: the exact mirrored source key, byte-mod29, Vigenere
// subtraction, global-repeat, no rotation. The 36-case family must recover it.
const plantText = encodeGP(shakeText.slice(240000));
const plantedPages = Array.from({ length: 8 }, (_, j) =>
  plantText.slice(1000 + j * 600, 1180 + j * 600)
);
const plantedCipher = plantedPages.map((plain, j) => plain.map((p, i) => {
  const key = keys[0][(j * 180 + i) % 256];
  for (let c = 0; c < MOD; c++) {
    if (decrypt(c, key, configs[0]) === p) return c;
  }
  throw new Error('no inverse for planted rune');
}));
const plantedScores = [];
for (let reducer = 0; reducer < reducers.length; reducer++) {
  for (let config = 0; config < configs.length; config++) {
    for (const clock of clocks) {
      let score = 0, count = 0;
      for (let j = 0; j < 4; j++) {
        let a = 0, b = 0;
        for (let i = 0; i < 90; i++) {
          const ki = clock === 'global-repeat' ? (j * 180 + i) % 256
            : clock === 'page-one-shot' ? i : i % 256;
          const plain = decrypt(
            plantedCipher[j][i], keys[reducer][ki], configs[config]
          );
          if (i >= 2) {
            score += trigram[(a * MOD + b) * MOD + plain];
            count++;
          }
          a = b;
          b = plain;
        }
      }
      plantedScores.push({ reducer, config, clock, score: score / count });
    }
  }
}
plantedScores.sort((a, b) => b.score - a.score);
const plantedRank = plantedScores.findIndex((x) =>
  x.reducer === 0 && x.config === 0 && x.clock === 'global-repeat'
) + 1;
assert.equal(plantedRank, 1);

const previewPage = pages.find((p) => p.page === 28);
const preview = previewPage.indices.slice(0, 90).map((c, i) =>
  RUNE_NAMES[decrypt(
    c,
    keys[best.reducer][keyIndex(best.clock, previewPage.page, i)],
    configs[best.config]
  )]
).join(' ');

console.log(JSON.stringify({
  input: {
    onion2Bytes: originalBytes.length,
    onion2SourceSha256: timing.final_bytes_sha256,
    gridBytes: gridBytes.length,
    gridSha256: crypto.createHash('sha256').update(gridBytes).digest('hex'),
    p53Runes: page53.indices.length,
    p53RedRunes: red.length,
    redGridGcd: gcd(R, N).toString(),
    mirrorSha256: crypto.createHash('sha256').update(mirroredBytes).digest('hex')
  },
  d4OrientationGcds,
  selectedOrientation: 'flipLR (reverse each 8-byte row)',
  mirrorGcdWithGrid: gcd(N, H).toString(),
  mirrorGcdWithP53Red: gcd(R, H).toString(),
  tested: variants.length,
  fixedFamily: {
    reducers: reducers.map((x) => x.name),
    transforms: configs.map((x) => x.name),
    clocks,
    rotations: 0
  },
  positiveControl: { expected: 'byte-mod29/vig-/global-repeat', rank: plantedRank },
  raw: rawScores(),
  best: {
    mapping: reducers[best.reducer].name,
    transform: configs[best.config].name,
    clock: best.clock,
    train: best.train,
    holdout: best.holdout,
    full: bestFull
  },
  top10: variants.slice(0, 10).map((x) => ({
    mapping: reducers[x.reducer].name,
    transform: configs[x.config].name,
    clock: x.clock,
    train: x.train,
    holdout: x.holdout
  })),
  page28Preview: preview
}, null, 2));
