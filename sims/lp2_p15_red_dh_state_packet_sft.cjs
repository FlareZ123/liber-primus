'use strict';

/**
 * Agent2, 2026-11-28.
 *
 * Source-only census for the p15 red-state packet and its relation to the
 * visually paired p6 red11 packet.  This script does not read the signed 2016
 * plaintext, candidate LP2 plaintext, fitted keys, or language models.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const source = read('resources/liber-primus/lp2-transcription.txt');
const runeToIndex = new Map(corpus.runes.map((glyph, i) => [glyph, i]));

const words = [];
let page = 0;
let local = 0;
let current = [];

function emitWord() {
  if (!current.length) return;
  assert(current.every(x => x.page === current[0].page));
  words.push({
    page: current[0].page,
    start: current[0].pos,
    vals: current.map(x => x.value),
  });
  current = [];
}

for (const ch of source) {
  if (runeToIndex.has(ch)) {
    while (page < corpus.pages.length &&
           local === corpus.pages[page].indices.length) {
      emitWord();
      page++;
      local = 0;
    }
    assert(page < corpus.pages.length);
    current.push({page, pos: local, value: runeToIndex.get(ch)});
    local++;
  } else if (/[.\-$%&]/.test(ch)) {
    // Newlines and "/" are line wrapping, not printed word separators.
    emitWord();
  }
}
emitWord();

const totalRunes = corpus.pages.reduce((n, p) => n + p.indices.length, 0);
assert.equal(totalRunes, 13136);

const mod = x => ((x % 29) + 29) % 29;
const sum29 = vals => mod(vals.reduce((a, b) => a + b, 0));
const product29 = vals => vals.reduce((a, b) => mod(a * b), 1);
const descriptor = w => ({
  L: w.vals.length,
  S: sum29(w.vals),
  P: product29(w.vals),
});

function redSpan(pageNumber, start) {
  const pageInk = ink.pages.find(p => p.page === pageNumber);
  assert(pageInk);
  const span = (pageInk.red_spans || []).find(s => s.start === start);
  assert(span);
  const contained = words.filter(w =>
    w.page === pageNumber &&
    w.start >= span.start &&
    w.start + w.vals.length <= span.start + span.length
  );
  assert.equal(contained.reduce((n, w) => n + w.vals.length, 0), span.length);
  return {span, words: contained, descriptors: contained.map(descriptor)};
}

const p15Top = redSpan(15, 0);
const p15Bottom = redSpan(15, 9);
const p15 = [...p15Top.words, ...p15Bottom.words].map(descriptor);

assert.deepEqual(p15, [
  {L: 4, S: 11, P: 0},
  {L: 5, S: 8, P: 26},
  {L: 4, S: 22, P: 10},
  {L: 2, S: 6, P: 5},
  {L: 5, S: 5, P: 0},
]);

// Freeze the discovered algebra without DH names.  This is the exact
// source-only relation later interpreted against the already-established
// DH23 state.
function internalPacket(ds) {
  if (ds.length !== 5) return false;
  const [a, b, c, d, e] = ds;
  return (
    a.L === c.L &&
    b.L === e.L &&
    e.S === b.L &&
    d.P === b.L &&
    a.P === 0 &&
    e.P === 0 &&
    mod(a.S * b.S) === 1 &&
    c.P === mod(d.L * b.L)
  );
}
assert(internalPacket(p15));

const fiveWordHits = [];
for (let i = 0; i + 4 < words.length; i++) {
  const window = words.slice(i, i + 5);
  if (window.some(w => w.page !== window[0].page)) continue;
  const ds = window.map(descriptor);
  if (internalPacket(ds)) {
    fiveWordHits.push({
      wordIndex: i,
      page: window[0].page,
      starts: window.map(w => w.start),
      descriptors: ds,
    });
  }
}
assert.deepEqual(fiveWordHits.map(x => [x.page, x.starts]), [
  [15, [0, 4, 9, 13, 15]],
]);

// The lower p15 three-word packet is also exact and unique among all
// same-page consecutive three-word windows.  The other five word-order
// permutations have zero exact descriptor hits.
const lower = p15Bottom.descriptors;
const permutations = a => {
  if (a.length <= 1) return [a.slice()];
  const out = [];
  for (let i = 0; i < a.length; i++) {
    for (const rest of permutations(a.slice(0, i).concat(a.slice(i + 1)))) {
      out.push([a[i], ...rest]);
    }
  }
  return out;
};
function exactDescriptorHits(target) {
  const hits = [];
  for (let i = 0; i + target.length - 1 < words.length; i++) {
    const window = words.slice(i, i + target.length);
    if (window.some(w => w.page !== window[0].page)) continue;
    const ds = window.map(descriptor);
    if (ds.every((d, j) =>
      d.L === target[j].L && d.S === target[j].S && d.P === target[j].P)) {
      hits.push({wordIndex: i, page: window[0].page, starts: window.map(w => w.start)});
    }
  }
  return hits;
}
const lowerPermutationHits = permutations(lower).map(target => ({
  target,
  hits: exactDescriptorHits(target),
}));
assert.equal(lowerPermutationHits[0].hits.length, 1);
assert.deepEqual(
  [lowerPermutationHits[0].hits[0].page, lowerPermutationHits[0].hits[0].starts],
  [15, [9, 13, 15]]
);
assert(lowerPermutationHits.slice(1).every(x => x.hits.length === 0));

// Charge the eight obvious physical reading orientations of the two p15
// red spans.  Only natural top-to-bottom, left-to-right order satisfies
// the frozen internal packet.
const physicalOrientations = [];
for (const swapSpans of [false, true]) {
  for (const reverseTop of [false, true]) {
    for (const reverseBottom of [false, true]) {
      let top = p15Top.descriptors.slice();
      let bottom = p15Bottom.descriptors.slice();
      if (reverseTop) top.reverse();
      if (reverseBottom) bottom.reverse();
      const ds = swapSpans ? [...bottom, ...top] : [...top, ...bottom];
      physicalOrientations.push({
        swapSpans,
        reverseTop,
        reverseBottom,
        matches: internalPacket(ds),
      });
    }
  }
}
assert.equal(physicalOrientations.filter(x => x.matches).length, 1);
assert(physicalOrientations[0].matches);

// Interpret only after the source-only assertions above.  These state values
// are already established elsewhere from the DH23/p6/p7 chain.
const state = {p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4, F: 0};
const inv = x => {
  for (let y = 1; y < 29; y++) if (mod(x * y) === 1) return y;
  throw new Error('noninvertible');
};
assert.deepEqual(p15, [
  {L: state.q, S: inv(state.A), P: state.F},
  {L: state.g, S: state.A, P: inv(state.B)},
  {L: state.q, S: state.p - 1, P: mod(state.K * state.g)},
  {L: state.K, S: state.a, P: state.g},
  {L: state.g, S: state.g, P: state.F},
]);

const p6 = redSpan(6, 71);
assert.deepEqual(p6.descriptors, [
  {L: 4, S: 13, P: 13},
  {L: 1, S: 19, P: 19},
  {L: 4, S: 7, P: 14},
  {L: 2, S: 26, P: 23},
]);
assert.deepEqual(p6.descriptors.map(x => x.S), [
  mod(state.b - state.K), state.B, mod(state.g + state.K), inv(state.B),
]);
assert.deepEqual(p6.descriptors.map(x => x.P), [
  mod(state.b - state.K), state.B, mod(-state.b), state.p,
]);

// P15's lower printed lengths are [q,K,g]=[4,2,5].  Transfer only that
// segmentation to the visually paired p6 red11 span, then use the already
// established p7 operation: GP29 product of each group.
const p6Runes = corpus.pages.find(p => p.page === 6).indices.slice(71, 82);
const p15LowerLengths = p15Bottom.descriptors.map(x => x.L);
assert.deepEqual(p15LowerLengths, [4, 2, 5]);
let cursor = 0;
const resegmented = p15LowerLengths.map(L => {
  const vals = p6Runes.slice(cursor, cursor + L);
  cursor += L;
  return {L, S: sum29(vals), P: product29(vals)};
});
assert.equal(cursor, p6Runes.length);
assert.deepEqual(resegmented.map(x => x.P), [
  mod(state.b - state.K), mod(-state.K), state.b,
]);
assert.deepEqual(resegmented.map(x => x.P), [13, 27, 15]);

// Existing outside-in H3(x,y,z) = (x-z, y, x+z) gives a compact consequence;
// record it without treating H3 as newly authenticated by this observation.
const H3 = ([x, y, z]) => [mod(x - z), y, mod(x + z)];
const p6ResegmentedProductH3 = H3(resegmented.map(x => x.P));
assert.deepEqual(p6ResegmentedProductH3, [27, 27, 28]);

// Existing p7 product register, source-only control.
const p7 = redSpan(7, 194);
assert.deepEqual(p7.descriptors.map(x => x.P), [11, 26, 8, 15, 2]);
assert.deepEqual(p7.descriptors.map(x => x.P), [
  inv(state.A), inv(state.B), state.A, inv(state.K), state.K,
]);

console.log(JSON.stringify({
  schema: 1,
  sourceOnly: true,
  totalRunes,
  printedWords: words.length,
  p15: {
    top: p15Top.descriptors,
    bottom: p15Bottom.descriptors,
    combined: p15,
    internalFiveWordHits: fiveWordHits,
    lowerPermutationHitCounts: lowerPermutationHits.map(x => x.hits.length),
    physicalOrientations,
  },
  p6: {
    nativeDescriptors: p6.descriptors,
    p15LowerLengthResegmentation: resegmented,
    resegmentedProducts: resegmented.map(x => x.P),
    resegmentedProductH3: p6ResegmentedProductH3,
  },
  p7Products: p7.descriptors.map(x => x.P),
  classification:
    'Source-only state-serialization evidence. No unknown plaintext, key schedule, receiver, or cipher is established.',
}, null, 2));
