'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const M = 29;
const BASE29 = '0123456789ABCDEFGHIJKLMNOPQRS';
const SPIRAL = [
  3299, 3298, 3296, 3294,
  3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472,
  1820, 708, 1206, 4516,
];

const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const reference = fs.readFileSync(path.join(ROOT, 'resources/liber-primus/lp1-plaintext-reference.txt'), 'utf8');

function mod(x) {
  return ((x % M) + M) % M;
}

function h4(a) {
  return [a[0] - a[3], a[1] - a[2], a[1] + a[2], a[0] + a[3]];
}

function digits29(n) {
  let x = Math.abs(n);
  const out = [];
  do {
    out.push(x % M);
    x = Math.floor(x / M);
  } while (x > 0);
  return out.reverse();
}

function base29(n) {
  const s = digits29(n).map((x) => BASE29[x]).join('');
  return n < 0 ? '-' + s : s;
}

function encodeLatin(text) {
  const alphabet = corpus.translit;
  const source = text
    .toUpperCase()
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

function parseRunicWords(text) {
  const words = [];
  let word = [];
  for (const ch of text) {
    const index = corpus.runes.indexOf(ch);
    if (index >= 0) {
      word.push(index);
    } else if ('-.$&'.includes(ch)) {
      if (word.length) words.push(word);
      word = [];
    }
  }
  if (word.length) words.push(word);
  return words;
}

const hBlocks = [];
for (let i = 0; i < SPIRAL.length; i += 4) hBlocks.push(h4(SPIRAL.slice(i, i + 4)));
assert.deepEqual(hBlocks, [
  [5, 2, 6594, 6593],
  [66, 20, 6536, 6510],
  [680, 200, 5876, 5624],
  [-2696, -498, 1914, 6336],
]);

// Concatenate the BASE29 digits of the second difference coordinate of each
// q-block. The last coordinate is negative at integer precision.
const secondDiff = hBlocks.map((b) => b[1]);
assert.deepEqual(secondDiff.map(base29), ['2', 'K', '6Q', '-H5']);

const absoluteKey = secondDiff.flatMap((n) => digits29(n));
const signedKey = secondDiff.flatMap((n) => {
  const sign = n < 0 ? -1 : 1;
  return digits29(n).map((d) => mod(sign * d));
});
assert.deepEqual(absoluteKey, [2, 20, 6, 26, 17, 5]);
assert.deepEqual(signedKey, [2, 20, 6, 26, 12, 24]);

const p6 = corpus.pages.find((p) => p.page === 6).indices;
assert.equal(p6.length, 196);
const body = p6.slice(82);
assert.equal(body.length, 114);
assert.equal(body.length / absoluteKey.length, 19);

const sourcePages = transcription.split(/\n%\s*\n/);
const p6Words = parseRunicWords(sourcePages[6]);
let pos = 0;
const longWords = [];
for (const word of p6Words) {
  const start = pos;
  pos += word.length;
  if (start >= 82 && word.length >= 4) {
    longWords.push({ start: start - 82, end: pos - 82 });
  }
}
assert.equal(longWords.length, 16);

const native = encodeLatin(reference);
const vocabulary = new Set(
  (reference.match(/[A-Za-z]{4,}/g) || []).map((word) => encodeLatin(word).join(',')),
);
const counts = new Uint32Array(M ** 3);
const totals = new Uint32Array(M ** 2);
for (let i = 2; i < native.length; i++) {
  const context = native[i - 2] * M + native[i - 1];
  counts[context * M + native[i]]++;
  totals[context]++;
}

function trigramScore(data) {
  let total = 0;
  for (let i = 2; i < data.length; i++) {
    const context = data[i - 2] * M + data[i - 1];
    total += Math.log(
      (counts[context * M + data[i]] + 0.2) /
      (totals[context] + 5.8),
    );
  }
  return total / (data.length - 2);
}

function wordHits(data) {
  return longWords.filter(({ start, end }) =>
    vocabulary.has(data.slice(start, end).join(',')),
  ).length;
}

function display(data) {
  return data.map((x) => corpus.translit[x]).join('');
}

const p57 = corpus.pages.find((p) => p.page === 57).indices;
const p57Words = parseRunicWords(sourcePages[56]).filter((w) => w.length >= 4);
const p57Hits = p57Words.filter((w) => vocabulary.has(w.join(','))).length;
assert.equal(p57Words.length, 12);
assert.equal(p57Hits, 11);
assert.ok(trigramScore(p57) > -2.2);

const results = [];
for (const [keyName, key] of [
  ['absolute-digits', absoluteKey],
  ['signed-segment-digits', signedKey],
]) {
  for (const sign of [-1, 1]) {
    const plain = body.map((c, i) => mod(c + sign * key[i % key.length]));
    const replay = plain.map((p, i) => mod(p - sign * key[i % key.length]));
    assert.deepEqual(replay, body);
    const hits = wordHits(plain);
    assert.equal(hits, 0);
    results.push({
      key: keyName,
      sign,
      trigram: trigramScore(plain),
      longWordHits: hits,
      longWords: longWords.length,
      prefix: display(plain.slice(0, 80)),
    });
  }
}

const originalTrigram = trigramScore(body);
for (const result of results) {
  assert.ok(result.trigram < originalTrigram);
}

const output = {
  source: {
    p15SecondDifferenceBase29: secondDiff.map(base29),
    absoluteKey,
    signedKey,
  },
  receiver: {
    page: 6,
    start: 82,
    runes: body.length,
    period: absoluteKey.length,
    repeats: body.length / absoluteKey.length,
  },
  controls: {
    originalTrigram,
    solvedP57Trigram: trigramScore(p57),
    solvedP57LongWordHits: p57Hits,
    solvedP57LongWords: p57Words.length,
  },
  results,
  decision:
    'Reject phase-zero repeating additive use of the p15 second-difference BASE29 arm on the exactly tiled p6 post-red body.',
};

const json = JSON.stringify(output, null, 2);
console.log(json);
fs.writeFileSync(
  path.join(process.env.RUNNER_TEMP || process.cwd(), 'source-test-output.json'),
  json + '\n',
);
