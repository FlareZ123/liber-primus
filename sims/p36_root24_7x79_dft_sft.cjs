'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

/** @param {string} p */
const read = (p) => fs.readFileSync(p, 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const referenceText = read('resources/liber-primus/lp1-plaintext-reference.txt');

/** @param {number} x */
const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number} a @param {number} e */
function pow29(a, e) {
  let out = 1;
  let b = mod29(a);
  while (e > 0) {
    if (e & 1) out = mod29(out * b);
    b = mod29(b * b);
    e = Math.floor(e / 2);
  }
  return out;
}

const root = 24;
assert.equal(pow29(root, 7), 1);
for (let k = 1; k < 7; k++) assert.notEqual(pow29(root, k), 1);

const stream = corpus.pages
  .filter((p) => p.page <= 55 && p.indices?.length)
  .flatMap((p) => p.indices);
assert.equal(stream.length, 12956);

const block = stream.slice(8805, 9358);
assert.equal(block.length, 553);
assert.equal(block.length, 7 * 79);
const rows = Array.from({ length: 7 }, (_, r) => block.slice(r * 79, (r + 1) * 79));

const lanes = [];
for (let k = 0; k < 7; k++) {
  const lane = [];
  for (let c = 0; c < 79; c++) {
    let sum = 0;
    for (let r = 0; r < 7; r++) sum = mod29(sum + rows[r][c] * pow29(root, k * r));
    lane.push(sum);
  }
  lanes.push(lane);
}

// Invert the seven-point transform exactly. 7^-1 mod29 = 25.
const inv7 = 25;
const recoveredRows = Array.from({ length: 7 }, () => Array(79).fill(0));
for (let r = 0; r < 7; r++) {
  for (let c = 0; c < 79; c++) {
    let sum = 0;
    for (let k = 0; k < 7; k++) sum = mod29(sum + lanes[k][c] * pow29(root, (7 - ((k * r) % 7)) % 7));
    recoveredRows[r][c] = mod29(inv7 * sum);
  }
}
assert.deepEqual(recoveredRows, rows);

/** @param {string} text */
function parseGp(text) {
  const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const prose = text.split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#') && !line.trim().startsWith('['))
    .join(' ')
    .replace(/[0-9a-f]{64,}/gi, ' ')
    .toUpperCase();
  const out = [];
  for (const word of prose.match(/[A-Z]+/g) || []) {
    let i = 0;
    while (i < word.length) {
      const token = tokens.find((t) => word.startsWith(t.s, i));
      if (token) {
        out.push(token.i);
        i += token.s.length;
      } else {
        i++;
      }
    }
  }
  return out;
}

const reference = parseGp(referenceText);
const split = Math.floor(reference.length * 0.8);
const train = reference.slice(0, split);
const trigramCounts = new Map();
let trigramTotal = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const key = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigramCounts.set(key, (trigramCounts.get(key) || 0) + 1);
  trigramTotal++;
}

/** @param {number[]} sequence */
function score(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  let logp = 0;
  for (let i = 0; i + 2 < sequence.length; i++) {
    const key = sequence[i] * 841 + sequence[i + 1] * 29 + sequence[i + 2];
    logp += Math.log(((trigramCounts.get(key) || 0) + 0.05) / (trigramTotal + 0.05 * 29 ** 3));
  }
  return {
    ioc: counts.reduce((s, c) => s + c * (c - 1), 0) / (sequence.length * (sequence.length - 1)),
    trigramNatsPerRune: logp / (sequence.length - 2),
    zeroCount: counts[0],
  };
}

const solvedWindows = [];
for (let i = 0; i + 79 <= reference.length; i++) {
  solvedWindows.push(score(reference.slice(i, i + 79)).trigramNatsPerRune);
}
solvedWindows.sort((a, b) => a - b);

const laneResults = lanes.map((lane, k) => ({ k, ...score(lane) }));
assert(laneResults.every((r) => r.trigramNatsPerRune < solvedWindows[0]));
assert.notEqual(laneResults[1].zeroCount, 79);

console.log(JSON.stringify({
  source: {
    globalInterval: [8805, 9358],
    runes: block.length,
    matrix: [7, 79],
    primitiveSeventhRoot: root,
  },
  exactInverseRoundTrip: true,
  laneResults,
  solved79Windows: {
    count: solvedWindows.length,
    worst: solvedWindows[0],
    median: solvedWindows[Math.floor(solvedWindows.length / 2)],
    best: solvedWindows.at(-1),
  },
  decision: 'The root24 seven-point GF29 transform across the exact seven 79-rune source packets is invertible, but no frequency lane is direct native GP plaintext and the root24 lane is not a zero parity/checksum lane.',
}, null, 2));
