'use strict';
/**
 * SFT: chapter SUM/PRODUCT route -> p3 GF(29^2) -> q-translation -> p33:91 red receiver.
 *
 * Classification: source-constrained structural handoff. This recovers no new plaintext
 * and does not authenticate the chapter SUM/PRODUCT grammar as a Cicada instruction.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r/g, '');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const parts = transcription.split('%');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const Q = 29;
const mod = (x) => ((x % Q) + Q) % Q;
const product = (a) => a.reduce((z, v) => (z * v) % Q, 1);
const descriptor = (a) => [a.length, mod(a.reduce((s, v) => s + v, 0)), product(a)];

function segmentForPage(page) {
  assert.notEqual(page, 50);
  return parts[page < 50 ? page : page - 1];
}

function pageWords(page) {
  const source = corpus.pages.find((p) => p.page === page).indices;
  const words = [];
  let offset = 0;
  let start = 0;
  let current = [];
  const flush = () => {
    if (!current.length) return;
    words.push({start, end: start + current.length, values: current.slice(), descriptor: descriptor(current)});
    current = [];
  };
  for (const ch of segmentForPage(page)) {
    if (runeIndex.has(ch)) {
      if (!current.length) start = offset;
      assert.equal(source[offset], runeIndex.get(ch), `p${page} rune ${offset}`);
      current.push(runeIndex.get(ch));
      offset++;
    } else if ('-.&$§'.includes(ch)) {
      flush();
    }
  }
  flush();
  assert.equal(offset, source.length, `p${page} rune count`);
  return words;
}

function openingRedEnd(page) {
  const ann = ink.pages.find((p) => p.page === page);
  assert.ok(ann?.red_spans?.length, `p${page} red opener`);
  const spans = ann.red_spans.slice().sort((a, b) => a.start - b.start);
  assert.equal(spans[0].start, 0);
  let end = spans[0].length;
  for (let i = 1; i < spans.length && spans[i].start === end; i++) end += spans[i].length;
  return end;
}

const chapterPages = [0, 3, 8, 15, 23, 27, 33, 40, 54];
const chapterRecords = chapterPages.map((page) => {
  const redEnd = openingRedEnd(page);
  const first = pageWords(page).find((w) => w.start === redEnd);
  assert.ok(first, `p${page} first black word`);
  return {page, redEnd, start: first.start, values: first.values, descriptor: first.descriptor};
});
assert.deepEqual(chapterRecords.map((r) => [r.page, ...r.descriptor]), [
  [0, 4, 15, 23], [3, 4, 9, 11], [8, 3, 23, 2], [15, 4, 22, 13],
  [23, 8, 25, 16], [27, 7, 2, 19], [33, 2, 5, 3], [40, 5, 27, 3], [54, 8, 19, 27]
]);

const routePages = [0, 8, 27, 54, 40];
const route = routePages.map((page) => chapterRecords.find((r) => r.page === page));
assert.deepEqual(route.map((r) => r.descriptor), [
  [4, 15, 23], [3, 23, 2], [7, 2, 19], [8, 19, 27], [5, 27, 3]
]);
assert.deepEqual(route.map((r) => r.descriptor[0]), [4, 3, 7, 8, 5]);

// Canonical continuous printed groups: page separators do not themselves terminate a word.
const canonical = [];
let current = [];
const flushCanonical = () => {
  if (!current.length) return;
  canonical.push({values: current.slice(), descriptor: descriptor(current)});
  current = [];
};
for (const ch of transcription.replaceAll('%', '')) {
  if (runeIndex.has(ch)) current.push(runeIndex.get(ch));
  else if ('-.&$§'.includes(ch)) flushCanonical();
}
flushCanonical();
assert.equal(canonical.length, 2941);
const sameDescriptor = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
for (const r of route) {
  const hits = canonical.filter((w) => sameDescriptor(w.descriptor, r.descriptor));
  assert.equal(hits.length, 1, `route descriptor unique: ${r.descriptor}`);
}

// P3's independently marked red triad [13,23,2] defines F_29[u] by u^2 = 3u + 8.
const p3 = corpus.pages.find((p) => p.page === 3).indices;
const p3Internal = ink.pages.find((p) => p.page === 3).red_spans.find((s) => s.start === 119);
assert.deepEqual({start: p3Internal.start, length: p3Internal.length}, {start: 119, length: 3});
assert.deepEqual(p3.slice(119, 122), [13, 23, 2]);

const add = (x, y) => [mod(x[0] + y[0]), mod(x[1] + y[1])];
const scale = (a, x) => [mod(a * x[0]), mod(a * x[1])];
const mul = (x, y) => [
  mod(x[0] * y[0] + 8 * x[1] * y[1]),
  mod(x[0] * y[1] + x[1] * y[0] + 3 * x[1] * y[1])
];
const same = (x, y) => x[0] === y[0] && x[1] === y[1];
const roots = (sum, prod) => {
  const out = [];
  for (let a = 0; a < Q; a++) for (let b = 0; b < Q; b++) {
    const x = [a, b];
    const value = add(add(mul(x, x), scale(-sum, x)), [prod, 0]);
    if (same(value, [0, 0])) out.push(x);
  }
  return out;
};
const canonSet = (set) => set.map((x) => x.join(',')).sort().join('|');
const affineMaps = (from, to) => {
  const out = [];
  for (let a = 1; a < Q; a++) for (let c = 0; c < Q; c++) {
    if (canonSet(from.map((x) => add(scale(a, x), [c, 0]))) === canonSet(to)) out.push([a, c]);
  }
  return out;
};
const translateCoefficients = (sum, prod, c) => [mod(sum + 2 * c), mod(prod + c * sum + c * c)];
const discriminant = (sum, prod) => mod(sum * sum - 4 * prod);

const routePairs = route.map((r) => r.descriptor.slice(1));
const routeRoots = routePairs.map(([s, p]) => roots(s, p));
assert.deepEqual(routeRoots, [
  [[4, 12], [11, 17]], [[3, 0], [20, 0]], [[0, 20], [2, 9]],
  [[5, 3], [14, 26]], [[9, 3], [18, 26]]
]);
assert.deepEqual(routePairs.map(([s, p]) => discriminant(s, p)), [17, 28, 15, 21, 21]);
assert.deepEqual(routeRoots.slice(0, -1).map((r, i) => affineMaps(r, routeRoots[i + 1])), [
  [], [], [[10, 14], [19, 5]], [[1, 4], [28, 23]]
]);

// The final route step is the orientation-preserving root translation x -> x+q, q=4.
const q = route[0].descriptor[0];
assert.equal(q, 4);
assert.deepEqual(translateCoefficients(19, 27, q), [27, 3]);
assert.deepEqual(routeRoots[3].map((x) => add(x, [q, 0])), routeRoots[4]);

// One frozen continuation of the same operation predicts (SUM,PRODUCT)=(6,11).
const predicted = translateCoefficients(27, 3, q);
assert.deepEqual(predicted, [6, 11]);
assert.equal(discriminant(...predicted), 21);
assert.deepEqual(roots(...predicted), [[13, 3], [22, 26]]);

// On unsolved p0-p55, the predicted pair occurs in exactly two page-local words.
const predictedHits = [];
for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  for (const w of pageWords(page)) {
    if (w.descriptor[1] === predicted[0] && w.descriptor[2] === predicted[1]) {
      predictedHits.push({page, start: w.start, descriptor: w.descriptor, values: w.values});
    }
  }
}
assert.deepEqual(predictedHits, [
  {page: 23, start: 200, descriptor: [3, 6, 11], values: [23, 8, 4]},
  {page: 33, start: 91, descriptor: [3, 6, 11], values: [21, 2, 12]}
]);

// The p33 hit is manuscript-marked: it is the first word of the second red rubric at offset91.
const p33Ann = ink.pages.find((p) => p.page === 33);
assert.deepEqual(p33Ann.red_spans.map((s) => [s.start, s.length]), [[0, 10], [91, 8]]);
const p33SecondWords = pageWords(33).filter((w) => w.start >= 91 && w.end <= 99);
assert.deepEqual(p33SecondWords.map((w) => w.values), [[21, 2, 12], [10, 0, 5, 22, 12]]);
assert.deepEqual(p33SecondWords.map((w) => w.descriptor), [[3, 6, 11], [5, 20, 0]]);

// Charge the marked-word reference class: exactly 50 complete red words on p0-p55;
// p33:91 is the sole red word with the predicted (SUM,PRODUCT) pair.
const redWords = [];
for (const ann of ink.pages.filter((p) => p.page <= 55 && p.page !== 50)) {
  const words = pageWords(ann.page);
  for (const span of ann.red_spans || []) {
    for (const w of words) if (w.start >= span.start && w.end <= span.start + span.length) {
      redWords.push({page: ann.page, spanStart: span.start, spanLength: span.length, ...w});
    }
  }
}
assert.equal(redWords.length, 50);
const predictedRed = redWords.filter((w) => w.descriptor[1] === 6 && w.descriptor[2] === 11);
assert.deepEqual(predictedRed.map((w) => [w.page, w.spanStart, w.start, ...w.descriptor]), [[33, 91, 91, 3, 6, 11]]);

// Charge the whole nine-chapter quadratic translation family.
// The p54/p40 pair is the only equal-discriminant pair, hence the only nontrivial pure-translation pair.
// Both orientations are admitted; only +q predicts a marked receiver.
const chapterTranslationEdges = [];
for (const from of chapterRecords) {
  for (const to of chapterRecords) {
    if (from.page === to.page) continue;
    for (let shift = 0; shift < Q; shift++) {
      const moved = translateCoefficients(from.descriptor[1], from.descriptor[2], shift);
      if (moved[0] === to.descriptor[1] && moved[1] === to.descriptor[2]) {
        const next = translateCoefficients(to.descriptor[1], to.descriptor[2], shift);
        chapterTranslationEdges.push({from: from.page, to: to.page, shift, next});
      }
    }
  }
}
assert.deepEqual(
  chapterRecords.map((r) => [r.page, discriminant(r.descriptor[1], r.descriptor[2])]),
  [[0,17],[3,8],[8,28],[15,26],[23,10],[27,15],[33,13],[40,21],[54,21]]
);
assert.deepEqual(chapterTranslationEdges, [
  {from: 40, to: 54, shift: 25, next: [11,25]},
  {from: 54, to: 40, shift: 4, next: [6,11]}
]);
assert.deepEqual(
  chapterTranslationEdges.map((edge) => ({
    ...edge,
    redHits: redWords
      .filter((w) => w.descriptor[1] === edge.next[0] && w.descriptor[2] === edge.next[1])
      .map((w) => [w.page, w.start, ...w.descriptor])
  })),
  [
    {from: 40, to: 54, shift: 25, next: [11,25], redHits: []},
    {from: 54, to: 40, shift: 4, next: [6,11], redHits: [[33,91,3,6,11]]}
  ]
);


// Receiver-side arithmetic closure: p33:91 alone has PRODUCT^-1 equal to its containing red-span length.
const inverseProductSpanHits = redWords.filter((w) =>
  w.descriptor[2] !== 0 && mod(w.descriptor[2] * w.spanLength) === 1
);
assert.deepEqual(
  inverseProductSpanHits.map((w) => [w.page, w.spanStart, w.start, w.spanLength, ...w.descriptor]),
  [[33, 91, 91, 8, 3, 6, 11]]
);
assert.equal(mod(11 * 8), 1);


// P33:91 and p40:0 are independently the only complete two-word red spans with lengths [3,5].
const red35 = [];
for (const ann of ink.pages.filter((p) => p.page <= 55 && p.page !== 50)) {
  const words = pageWords(ann.page);
  for (const span of ann.red_spans || []) {
    const inside = words.filter((w) => w.start >= span.start && w.end <= span.start + span.length);
    if (inside.length === 2 && inside[0].descriptor[0] === 3 && inside[1].descriptor[0] === 5) red35.push([ann.page, span.start]);
  }
}
assert.deepEqual(red35, [[33, 91], [40, 0]]);

// The predicted word's raw runes and H3 are compact DH-state expressions.
const h3 = (v) => [mod(v[0] - v[2]), v[1], mod(v[0] + v[2])];
assert.deepEqual(p33SecondWords[0].values, [21, 2, 12]); // [B+K,K,aK]
assert.deepEqual(h3(p33SecondWords[0].values), [9, 2, 4]); // [q+g,K,q]

// A third predeclared q-translation predicts (14,22); it has no red receiver.
const third = translateCoefficients(...predicted, q);
assert.deepEqual(third, [14, 22]);
const thirdRed = redWords.filter((w) => w.descriptor[1] === 14 && w.descriptor[2] === 22);
assert.deepEqual(thirdRed, []);

console.log(JSON.stringify({
  classification: 'source-constrained structural handoff; no new plaintext or authenticated cipher opcode',
  route: route.map((r) => ({page: r.page, descriptor: r.descriptor})),
  routeDescriptorGlobalMultiplicity: route.map((r) => canonical.filter((w) => sameDescriptor(w.descriptor, r.descriptor)).length),
  p3Field: {markedTriad: [13, 23, 2], relation: 'u^2 = 3u + 8 over GF(29)'},
  routeDiscriminants: routePairs.map(([s, p]) => discriminant(s, p)),
  routeRoots,
  consecutiveBaseFieldAffineMaps: routeRoots.slice(0, -1).map((r, i) => affineMaps(r, routeRoots[i + 1])),
  qTranslation: {q, p54ToP40: [[19, 27], [27, 3]], predictedNext: predicted, predictedRoots: roots(...predicted)},
  predictedPairHits: predictedHits,
  markedReferenceClass: {completeRedWords: redWords.length, predictedRedHits: predictedRed.map((w) => [w.page, w.start, w.descriptor]), inverseProductSpanHits: inverseProductSpanHits.map((w) => [w.page, w.spanStart, w.spanLength, w.descriptor])},
  p33SecondRubric: {wordDescriptors: p33SecondWords.map((w) => w.descriptor), wordRunes: p33SecondWords.map((w) => w.values), h3FirstWord: h3(p33SecondWords[0].values)},
  uniqueRed35Spans: red35,
  chapterTranslationFamily: chapterTranslationEdges.map((edge) => ({...edge, redHitCount: redWords.filter((w) => w.descriptor[1] === edge.next[0] && w.descriptor[2] === edge.next[1]).length})),
  thirdTranslation: {pair: third, redHits: thirdRed.length},
  decision: 'The p40 terminal quadratic continues by the already-forced +q root translation to the source-marked p33:91 first red word; one further +q has no red receiver. Preserve as a prospective structural handoff, not plaintext.'
}, null, 2));
