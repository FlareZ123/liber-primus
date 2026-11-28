'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const M = 29;

const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8',
));
const ink = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8',
));
const transcription = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8',
);
const reference = fs.readFileSync(
  path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8',
);

function mod(x) {
  return ((x % M) + M) % M;
}

function product(values) {
  let out = 1;
  for (const v of values) out = (out * v) % M;
  return out;
}

function fingerprint(values) {
  assert.equal(values.length, 51);
  const rows = [
    values.slice(0, 17),
    values.slice(17, 34),
    values.slice(34, 51),
  ];
  return {
    rows,
    sums: rows.map((r) => r.reduce((a, b) => a + b, 0) % M),
    products: rows.map(product),
  };
}

function encodeLatin(text) {
  const alphabet = corpus.translit;
  const source = text.toUpperCase()
    .replace(/[KQ]/g, 'C')
    .replace(/V/g, 'U')
    .replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < source.length;) {
    let chosen = -1;
    for (let j = 0; j < alphabet.length; j++) {
      if (
        source.startsWith(alphabet[j], i) &&
        (chosen < 0 || alphabet[j].length > alphabet[chosen].length)
      ) {
        chosen = j;
      }
    }
    if (chosen >= 0) {
      result.push(chosen);
      i += alphabet[chosen].length;
    } else {
      i++;
    }
  }
  return result;
}

const native = encodeLatin(reference);
const counts = new Uint32Array(M ** 3);
const totals = new Uint32Array(M ** 2);
for (let i = 2; i < native.length; i++) {
  const context = native[i - 2] * M + native[i - 1];
  counts[context * M + native[i]]++;
  totals[context]++;
}

function trigramScore(data) {
  let score = 0;
  for (let i = 2; i < data.length; i++) {
    const context = data[i - 2] * M + data[i - 1];
    score += Math.log(
      (counts[context * M + data[i]] + 0.2) /
      (totals[context] + 5.8),
    );
  }
  return score / (data.length - 2);
}

function ioc(data) {
  const ct = new Uint32Array(M);
  for (const x of data) ct[x]++;
  let pairs = 0;
  for (const n of ct) pairs += n * (n - 1);
  return pairs / (data.length * (data.length - 1));
}

function display(data) {
  return data.map((x) => corpus.translit[x]).join('');
}

const p53 = corpus.pages.find((p) => p.page === 53);
const red51 = p53.indices.slice(128, 179);
assert.equal(red51.length, 51);

const fp = fingerprint(red51);
assert.deepEqual(fp.sums, [13, 27, 14]);
assert.deepEqual(fp.products, [19, 19, 0]);

const exactHits = [];
const sumHits = [];
const productHits = [];
let totalWindows = 0;
for (const page of corpus.pages.filter((p) => p.page >= 0 && p.page <= 55)) {
  for (let start = 0; start + 51 <= page.indices.length; start++) {
    totalWindows++;
    const candidate = fingerprint(page.indices.slice(start, start + 51));
    if (candidate.sums.join(',') === '13,27,14') sumHits.push([page.page, start]);
    if (candidate.products.join(',') === '19,19,0') productHits.push([page.page, start]);
    if (
      candidate.sums.join(',') === '13,27,14' &&
      candidate.products.join(',') === '19,19,0'
    ) exactHits.push([page.page, start]);
  }
}
assert.equal(totalWindows, 10206);
assert.deepEqual(sumHits, [[5, 37], [53, 128]]);
assert.deepEqual(productHits, [[6, 89], [53, 128]]);
assert.deepEqual(exactHits, [[53, 128]]);

// e=3 rows and b+K=17 columns are fixed by the independently reconstructed DH state.
const columns = Array.from({ length: 17 }, (_, j) => [
  fp.rows[0][j],
  fp.rows[1][j],
  fp.rows[2][j],
]);

const state = { p: 23, g: 5, A: 8, B: 19, K: 2, b: 15 };
const p55Pointer = state.p + state.g + state.A + state.B;
assert.equal(p55Pointer, 55);
const p55 = corpus.pages.find((p) => p.page === p55Pointer);
assert(p55);
assert.equal(p55.runic_count, state.K * M + (state.p - state.g));
assert.equal(p55.runic_count, 76);
assert.deepEqual(
  corpus.pages.filter((p) => p.page >= 0 && p.page <= 55 && p.runic_count === 76)
    .map((p) => p.page),
  [55],
);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const rawBlocks = transcription.replace(/\r/g, '').split('%');
function blockIndices(raw) {
  return [...raw].map((ch) => runeIndex.get(ch)).filter((x) => x !== undefined);
}
const p55Block = rawBlocks.find((raw) =>
  blockIndices(raw).join(',') === p55.indices.join(',')
);
assert(p55Block, 'exact p55 transcription block not found');
const segmentLengths = [];
let segment = 0;
for (const ch of p55Block) {
  if (runeIndex.has(ch)) {
    segment++;
  } else if (ch !== '/' && !/\s/u.test(ch)) {
    if (segment) segmentLengths.push(segment);
    segment = 0;
  }
}
if (segment) segmentLengths.push(segment);
assert.deepEqual(segmentLengths, [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.equal(segmentLengths.length, state.b + state.K);
assert.equal(segmentLengths.reduce((a, b) => a + b, 0), p55.indices.length);

const p55Ink = ink.pages.find((p) => p.page === 55);
assert(p55Ink);
assert.ok(
  p55Ink.large_punctuation.some(
    ([offset, dots, color]) =>
      offset === p55.runic_count &&
      dots === state.b - state.K &&
      color === 'red',
  ),
);

function decode(sign) {
  const out = [];
  let position = 0;
  for (let segment = 0; segment < 17; segment++) {
    const key = columns[segment];
    for (let t = 0; t < segmentLengths[segment]; t++) {
      out.push(mod(p55.indices[position++] + sign * key[t % 3]));
    }
  }
  assert.equal(position, p55.indices.length);
  return out;
}

const results = [];
for (const sign of [-1, 1]) {
  const plain = decode(sign);
  const replay = [];
  let position = 0;
  for (let segment = 0; segment < 17; segment++) {
    const key = columns[segment];
    for (let t = 0; t < segmentLengths[segment]; t++) {
      replay.push(mod(plain[position++] - sign * key[t % 3]));
    }
  }
  assert.deepEqual(replay, p55.indices);
  results.push({
    sign,
    ioc: ioc(plain),
    trigram: trigramScore(plain),
    translit: display(plain),
  });
}

const p57 = corpus.pages.find((p) => p.page === 57).indices.slice(0, 76);
const controls = {
  originalP55: { ioc: ioc(p55.indices), trigram: trigramScore(p55.indices) },
  solvedP57First76: { ioc: ioc(p57), trigram: trigramScore(p57) },
};
assert.ok(results[0].trigram < controls.originalP55.trigram);
assert.ok(Math.max(...results.map((x) => x.trigram)) < -3.4);
assert.ok(controls.solvedP57First76.trigram > -2.3);

// Positive reversibility plant: exact source-shaped receiver under the same clock.
const plantedPlain = p57;
const plantedCipher = [];
let pp = 0;
for (let segment = 0; segment < 17; segment++) {
  const key = columns[segment];
  for (let t = 0; t < segmentLengths[segment]; t++) {
    plantedCipher.push(mod(plantedPlain[pp++] + key[t % 3]));
  }
}
const recovered = [];
pp = 0;
for (let segment = 0; segment < 17; segment++) {
  const key = columns[segment];
  for (let t = 0; t < segmentLengths[segment]; t++) {
    recovered.push(mod(plantedCipher[pp++] - key[t % 3]));
  }
}
assert.deepEqual(recovered, plantedPlain);

const output = {
  sourceGeometry: {
    page: 53,
    redOffset: 128,
    redRunes: 51,
    reshape: '3x17 row-major from e=3 and b+K=17',
    rowSums: fp.sums,
    rowProducts: fp.products,
    stateRead: {
      rowSums: '[b-K,-K,-b] = [13,27,14]',
      rowProducts: '[B,B,F] = [19,19,0]',
    },
    corpusCharge: {
      windows: totalWindows,
      exactFingerprintHits: exactHits,
      sumOnlyHits: sumHits,
      productOnlyHits: productHits,
    },
  },
  receiver: {
    page: 55,
    heldOutGeometry: {
      pagePointer: 'p+g+A+B = 55',
      totalRunes: 'K*29+(p-g) = 76 = 2I_base29',
      visibleSegments: 'b+K = 17',
      terminalRedDots: 'b-K = 13',
    },
    segmentLengths,
    keyAssignment: 'p53 3x17 columns, one triplet per visible p55 segment, repeated within segment',
    controls,
    results,
  },
  decision:
    'Preserve the unique p53 3x17 row aggregate state fingerprint and p55 held-out geometry (page55, 76 runes, 17 segments, 13 terminal dots). Reject direct phase-zero repeated-column-triplet additive use on the 17 visible p55 segments under both signs; do not tune phase, column order, or key variants.',
};

const json = JSON.stringify(output, null, 2);
console.log(json);
fs.writeFileSync(
  path.join(process.env.RUNNER_TEMP || process.cwd(), 'source-test-output.json'),
  json + '\n',
);
