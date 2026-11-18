'use strict';
const fs = require('fs');
const assert = require('assert');
const read = (p) => fs.readFileSync(p, 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const mod = (x) => ((x % 29) + 29) % 29;
const T6 = (x) => mod(24 - 2 * x);
const invT6 = (x) => mod(14 * (24 - x));
const segments = read('resources/transcriptions/liber_primus_master.txt').split('%');
const start = segments.findIndex((s) => s.includes('ᛋᚻᛖᚩᚷᛗᛡᚠ'));
assert.equal(start, 16);
const pages = segments.slice(start, start + 56);
assert.equal(pages.length, 56);

const words = [];
const stream = [];
let current = [];
const delimiters = new Set(['-', '.', '&', '$', '§']);
for (let page = 0; page < pages.length; page++) {
  let paragraph = 0;
  for (const ch of pages[page]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      const item = { value, page, paragraph, streamIndex: stream.length };
      current.push(item);
      stream.push(item);
    } else if (delimiters.has(ch)) {
      if (current.length) { words.push(current); current = []; }
      if (ch === '&') paragraph++;
    }
    // '/' and '%' are line/page markers, not guaranteed word boundaries.
  }
}
if (current.length) words.push(current);
assert.equal(words.length, 2896);
assert.equal(stream.length, 12956);
const pageRunes = Array(56).fill(0);
for (const item of stream) pageRunes[item.page]++;
assert.equal(pageRunes[2], 201);

const pairs = [];
const pairsByPage = Array(56).fill(0);
const hitsByPage = Array(56).fill(0);
for (const word of words) for (let i = 6; i < word.length; i++) {
  const left = word[i - 6].value;
  const right = word[i].value;
  const page = word[i].page;
  pairs.push([left, right]);
  pairsByPage[page]++;
  if (right === T6(left)) hitsByPage[page]++;
}
assert.equal(pairs.length, 1290);
assert.equal(hitsByPage.reduce((a, b) => a + b, 0), 80);
assert.equal(pairsByPage[2], 34);
assert.equal(hitsByPage[2], 2);

let best = { a: null, b: null, hits: -1 };
for (let a = 1; a < 29; a++) for (let b = 0; b < 29; b++) {
  let hits = 0;
  for (const [x, y] of pairs) if (y === mod(a * x + b)) hits++;
  if (hits > best.hits) best = { a, b, hits };
}
assert.deepEqual(best, { a: 27, b: 24, hits: 80 });

const feedback = stream.map((item, i) =>
  i < 6 ? item.value : mod(item.value - T6(stream[i - 6].value))
);
const ic = (values) => {
  const f = Array(29).fill(0);
  for (const x of values) f[x]++;
  return f.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
};
const renderWords = (selected) => selected.map((w) =>
  w.map((item) => gp.translit[feedback[item.streamIndex]]).join('')
).join(' ');
const p2Words = words.filter((w) => w.some((x) => x.page === 2));
const p3Para0 = words.filter((w) => w.some((x) => x.page === 3 && x.paragraph === 0));

const laneCounts = Array.from({ length: 6 }, () => Array(29).fill(0));
const laneTotals = Array(6).fill(0);
for (const word of words) for (let j = 0; j < word.length; j++) {
  let value = word[j].value;
  for (let k = 0; k < Math.floor(j / 6); k++) value = invT6(value);
  laneCounts[j % 6][value]++;
  laneTotals[j % 6]++;
}
const lp1 = read('resources/transcriptions/lp1_wulfic_canonical.txt').split('%');
const clearCounts = Array(29).fill(0);
for (const p of [3, 8, 9, 10, 11, 14]) for (const ch of lp1[p]) {
  const x = runeIndex.get(ch);
  if (x !== undefined) clearCounts[x]++;
}
const clearTotal = clearCounts.reduce((a, b) => a + b, 0);
assert.equal(clearTotal, 1001);
const sorted = (counts, total) => counts.map((n) => n / total).sort((a, b) => b - a);
const baseline = sorted(clearCounts, clearTotal);
const lanes = laneCounts.map((counts, lane) => {
  const s = sorted(counts, laneTotals[lane]);
  return {
    lane,
    symbols: laneTotals[lane],
    topFrequency: s[0],
    sortedFrequencyL1FromClearLP1: s.reduce((a, x, i) => a + Math.abs(x - baseline[i]), 0)
  };
});
const render = (arr) => arr.map((x) => gp.translit[x]).join('·');
const p2Output = renderWords(p2Words);
const p3Output = renderWords(p3Para0);
console.log(JSON.stringify({
  source: { pages: pages.length, words: words.length, runes: stream.length, p2Runes: pageRunes[2] },
  affine: {
    pairs: pairs.length,
    bestOf812: best,
    t6Hits: 80,
    p2: { pairs: pairsByPage[2], hits: hitsByPage[2] },
    pageHits: hitsByPage.map((hits, page) => ({ page, hits })).filter((x) => x.hits)
  },
  continuousFeedback: {
    formula: 'P[i] = C[i] - T6(C[i-6]) mod 29; first six C symbols fixed as seed',
    inputIC: ic(stream.map((x) => x.value)),
    outputIC: ic(feedback),
    p2FirstWords: p2Output.split(' ').slice(0, 24).join(' '),
    p3FirstParagraph: p3Output.slice(0, 900)
  },
  sixLaneTransition: {
    formula: 'D[word,j] = T6^(-floor(j/6))(C[word,j])',
    clearLP1Runes: clearTotal,
    clearLP1TopFrequency: baseline[0],
    lanes
  }
}, null, 2));
