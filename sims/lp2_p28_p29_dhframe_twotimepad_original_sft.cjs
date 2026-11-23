'use strict';
/**
 * Agent41, 2026-11-23: p28/p29 aligned 269-rune two-time-pad gate.
 * Run: node sims/lp2_p28_p29_dhframe_twotimepad_original_sft.cjs
 * Pure read-only Node.js 22/CommonJS SFT. No optional dependencies.
 *
 * Candidate: C28[t] = s*P28[t]+K[t]+a, C29body[t] = s*P29[t]+K[t]+b
 * on original intact rune/word registers, with s=+1 or -1, any common
 * secret K[t], and any two fixed page constants a,b in GF(29).
 * Thus P29[t] = P28[t] - s*(C28[t]-C29[t]) + s*(a-b).
 * The unknown pad cancels before testing source-native English words.
 *
 * Scope: an English lexicon is a finite control, not all possible words,
 * and actual LP2 plaintext may alter spacing or use a different register.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(root, p), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalTranscription = read('resources/liber-primus/lp2-transcription.txt').split('%');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
const mod29 = x => ((x % 29) + 29) % 29;

assert.equal(corpus.pages.length, 58);
assert.equal(runeIndex.size, 29);
const original28 = corpus.pages[28].indices;
const original29 = corpus.pages[29].indices;
assert.equal(original28.length, 269);
assert.equal(original29.length, 277);
assert.deepEqual(original29.slice(0, 2), [2, 23]);
assert.deepEqual(original29.slice(-6), [5, 18, 12, 6, 8, 19]);
const originalBody29 = original29.slice(2, -6);
assert.equal(originalBody29.length, original28.length);

/**
 * Source-native English GP29 representation. Both standard and optional
 * historical ING->NG / IO->IA variants enter the dictionary.
 * @param {string} input
 * @param {boolean} historical
 * @returns {number[]|null}
 */
function encodeWord(input, historical) {
  let s = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  if (historical) s = s.replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const a = [];
  for (let i = 0; i < s.length;) {
    const rune = translit.find(t => s.startsWith(t.s, i));
    if (!rune) return null;
    a.push(rune.i);
    i += rune.s.length;
  }
  return a;
}

/** @param {string} source @returns {number[]} */
function encodeText(source) {
  const s = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  const a = [];
  for (let i = 0; i < s.length;) {
    const rune = translit.find(t => s.startsWith(t.s, i));
    if (rune) {
      a.push(rune.i);
      i += rune.s.length;
    } else i++;
  }
  return a;
}

const dictionaryMaps = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const m = /^([a-z]+)\s+\d+$/.exec(line);
  if (!m) continue;
  for (const old of [false, true]) {
    const word = encodeWord(m[1], old);
    if (!word || word.length > 18) continue;
    if (!dictionaryMaps.has(word.length)) dictionaryMaps.set(word.length, new Map());
    dictionaryMaps.get(word.length).set(word.join(','), word);
  }
}
const dictionary = new Map([...dictionaryMaps].map(([n, words]) => [n, [...words.values()]]));
assert(dictionary.get(6).length > 5000);

/**
 * Recover the printed word offsets directly from unmodified source text.
 * The minus/dot punctuation separates words; the slash/newline does not.
 * @param {number} page
 * @returns {{start:number,len:number}[]}
 */
function sourceWords(page) {
  const section = originalTranscription[page];
  const words = [];
  let offset = 0, start = 0, length = 0;
  const finish = () => {
    if (length) words.push({ start, len: length });
    length = 0;
  };
  const decoded = [];
  for (const character of section) {
    const index = runeIndex.get(character);
    if (index !== undefined) {
      if (!length) start = offset;
      offset++;
      length++;
      decoded.push(index);
    } else if ('-. $&§'.includes(character)) finish();
  }
  finish();
  assert.deepEqual(decoded, corpus.pages[page].indices);
  return words;
}

const words28 = sourceWords(28)
  .filter(w => w.start > 0 && w.start + w.len < 269);
const words29 = sourceWords(29)
  .filter(w => w.start >= 2 && w.start + w.len <= 271)
  .map(w => ({ start: w.start - 2, len: w.len }));
const spans = [];
for (const a of words28) for (const b of words29) {
  const start = Math.max(a.start, b.start);
  const width = Math.min(a.start + a.len, b.start + b.len) - start;
  if (width >= 4) spans.push({ start, width, a, b });
}
spans.sort((a, b) => b.width - a.width || a.start - b.start);
assert.equal(spans.length, 20);
assert.equal(spans[0].width, 6);

/**
 * Return all offsets s*(a-b) in GF29 that allow a dictionary word pair
 * for the precise overlapped source rune positions. Unknown K[t] cancels.
 * @param {number[]} C28
 * @param {number[]} C29
 * @param {{start:number,width:number,a:{start:number,len:number},b:{start:number,len:number}}} span
 * @param {1|-1} orientation
 * @returns {number[]}
 */
function compatibleShifts(C28, C29, span, orientation) {
  const { start, width, a, b } = span;
  const candidatesA = dictionary.get(a.len) || [];
  const candidatesB = dictionary.get(b.len) || [];
  const bSlices = new Set(candidatesB.map(w =>
    w.slice(start - b.start, start - b.start + width).join(',')));
  const delta = Array.from({ length: width }, (_, i) =>
    mod29(C28[start + i] - C29[start + i]));
  const shifts = [];
  for (let shift = 0; shift < 29; shift++) {
    let matched = false;
    for (const word of candidatesA) {
      const want = word.slice(start - a.start, start - a.start + width)
        .map((v, i) => mod29(v - orientation * delta[i] + shift)).join(',');
      if (bSlices.has(want)) {
        matched = true;
        break;
      }
    }
    if (matched) shifts.push(shift);
  }
  return shifts;
}

/** @param {number[]} a @param {number[]} b @returns {number} */
function chiDelta(a, b) {
  const count = new Array(29).fill(0);
  for (let i = 0; i < a.length; i++) count[mod29(a[i] - b[i])]++;
  const expected = a.length / 29;
  return count.reduce((s, n) => s + (n - expected) ** 2 / expected, 0);
}

const gates = {};
for (const orientation of [1, -1]) {
  const results = spans.map(span => ({
    start: span.start,
    width: span.width,
    candidates: compatibleShifts(original28, originalBody29, span, orientation),
  }));
  const impossible = results.filter(s => s.candidates.length === 0)
    .map(s => ({ start: s.start, width: s.width }));
  gates[orientation] = { impossible, sixWide: results.filter(s => s.width === 6) };
  assert(impossible.some(s => s.start === 20 && s.width === 6));
  assert(impossible.some(s => s.start === 45 && s.width === 6));
}

/** @param {number} seed @returns {() => number} */
function lcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
const rng = lcg(0x3301a29);
/**
 * Source-word-length-matched planted plaintext: independent GP English
 * dictionary words, while the nonword page fragments are arbitrary runes.
 * @param {{start:number,len:number}[]} words
 * @param {number} count
 * @returns {number[]}
 */
function plant(words, count) {
  const tape = Array.from({ length: count }, () => Math.floor(rng() * 29));
  for (const w of words) {
    const choices = dictionary.get(w.len);
    if (!choices || !choices.length) continue;
    const choice = choices[Math.floor(rng() * choices.length)];
    for (let i = 0; i < w.len; i++) tape[w.start + i] = choice[i];
  }
  return tape;
}
let plantedChecks = 0;
for (let trial = 0; trial < 3; trial++) {
  const p = plant(words28, 269), q = plant(words29, 269);
  const key = Array.from({ length: 269 }, () => Math.floor(rng() * 29));
  const offsetA = 7, offsetB = 11;
  for (const orientation of [1, -1]) {
    const ca = p.map((v, i) => mod29(orientation * v + key[i] + offsetA));
    const cb = q.map((v, i) => mod29(orientation * v + key[i] + offsetB));
    const expectedShift = mod29(orientation * (offsetA - offsetB));
    for (const span of spans) {
      assert(compatibleShifts(ca, cb, span, orientation).includes(expectedShift));
      plantedChecks++;
    }
    // A genuine shared-secret pad exists and is identical in both plants.
    for (let i = 0; i < 269; i++) {
      assert.equal(mod29(ca[i] - orientation * p[i] - offsetA), key[i]);
      assert.equal(mod29(cb[i] - orientation * q[i] - offsetB), key[i]);
    }
  }
}
assert.equal(plantedChecks, 120);

/**
 * A stronger all-secret family: the second page has an unknown invertible
 * multiplier of the same arbitrary pad. In GF29 every nonzero multiplier
 * is a legal unit. With
 *
 *   C28 = orientation*P28 + K + a
 *   C29 = orientation*P29 + gain*K + b
 *
 * the pad again cancels, now giving
 *   P29 = gain*P28 + orientation*(C29-gain*C28) + shift,
 * where shift = orientation*(gain*a-b) can be any GF29 symbol.
 * @param {number[]} C28
 * @param {number[]} C29
 * @param {{start:number,width:number,a:{start:number,len:number},b:{start:number,len:number}}} span
 * @param {number} gain Nonzero GF29 element.
 * @param {1|-1} orientation
 * @returns {number[]}
 */
function affinePadShifts(C28, C29, span, gain, orientation) {
  const { start, width, a, b } = span;
  const bSlices = new Set((dictionary.get(b.len) || [])
    .map(w => w.slice(start - b.start, start - b.start + width).join(',')));
  const aSlices = (dictionary.get(a.len) || [])
    .map(w => w.slice(start - a.start, start - a.start + width));
  const delta = Array.from({ length: width }, (_, i) =>
    mod29(C29[start + i] - gain * C28[start + i]));
  const matches = [];
  for (let shift = 0; shift < 29; shift++) {
    if (aSlices.some(word => bSlices.has(word
      .map((v, i) => mod29(gain * v + orientation * delta[i] + shift))
      .join(',')))) matches.push(shift);
  }
  return matches;
}

// Original p28/p29: grant every nonzero gain, both orientations, and every
// possible relative affine offset. These four source overlaps alone exclude
// the complete family without guessing even one keystream symbol.
const widthSix = spans.filter(span => span.width === 6);
assert.deepEqual(widthSix.map(span => span.start), [20, 45, 65, 219]);
const affineCases = [];
for (let gain = 1; gain < 29; gain++) {
  for (const orientation of [1, -1]) {
    const candidates = widthSix.map(span =>
      affinePadShifts(original28, originalBody29, span, gain, orientation));
    const common = Array.from({ length: 29 }, (_, i) => i)
      .filter(shift => candidates.every(choices => choices.includes(shift)));
    assert.equal(common.length, 0, 'Original shared affine-pad family survived');
    affineCases.push({
      gain, orientation, perSpanCandidateCounts: candidates.map(v => v.length),
    });
  }
}
assert.equal(affineCases.length, 56);

// True positive: independent native dictionary words, unrelated arbitrary
// pads, an explicitly unequal page offset, every source word boundary and
// three independently chosen non-unit/nontrivial gains.
let affinePlantedChecks = 0;
for (let trial = 0; trial < 2; trial++) {
  const p = plant(words28, 269), q = plant(words29, 269);
  const key = Array.from({ length: 269 }, () => Math.floor(rng() * 29));
  const offsetA = 7, offsetB = 11;
  for (const gain of [2, 5, 19]) for (const orientation of [1, -1]) {
    const ca = p.map((v, i) => mod29(orientation * v + key[i] + offsetA));
    const cb = q.map((v, i) => mod29(orientation * v + gain * key[i] + offsetB));
    const shift = mod29(orientation * (gain * offsetA - offsetB));
    for (const span of spans) {
      assert(affinePadShifts(ca, cb, span, gain, orientation).includes(shift));
      affinePlantedChecks++;
    }
    for (let i = 0; i < 269; i++) {
      assert.equal(mod29(ca[i] - orientation * p[i] - offsetA), key[i]);
      assert.equal(mod29(cb[i] - orientation * q[i] - offsetB), mod29(gain * key[i]));
    }
  }
}
assert.equal(affinePlantedChecks, 240);

// Secondary broad English control: independent, original-length GP donor pairs.
const donors = ['gibran_prophet_58585.txt', 'shakespeare_first300k.txt',
  'emerson_essays_2944.txt'].map(n => encodeText(read('resources/control/' + n)));
const draw = lcg(0x29a3301);
const distribution = [];
for (let i = 0; i < 6000; i++) {
  const a = donors[i % 3], b = donors[(i + 1) % 3];
  const x = Math.floor(draw() * (a.length - 269));
  const y = Math.floor(draw() * (b.length - 269));
  distribution.push(chiDelta(a.slice(x, x + 269), b.slice(y, y + 269)));
}
const originalChi = chiDelta(original28, originalBody29);
const atOrBelow = distribution.filter(x => x <= originalChi).length;
assert(originalChi > 20 && originalChi < 22);
assert(atOrBelow < 200);
distribution.sort((a, b) => a - b);

console.log(JSON.stringify({
  status: 'PASS',
  scope: 'p28 versus p29 269-rune interior, intact printed GP words, same additive pad; any 29-symbol relative constant and both arithmetic orientations',
  original: {
    sourcePageLengths: [269, 277],
    p29Frame: [[2, 23], [5, 18, 12, 6, 8, 19]],
    originalInner: originalBody29.length,
    completeInteriorWords: [words28.length, words29.length],
    overlappingWordPairsWidthAtLeast4: spans.length,
    lexiconByLength: [6, 7, 11].map(n => [n, dictionary.get(n).length]),
    gates,
    affinePad: {
      nonzeroGains: 28, orientations: 2, candidateOffsets: 29,
      widthSixOverlaps: 4, candidateGainSignPairs: affineCases.length,
      survivors: 0, nonzeroSpanCountsForGain5Plus: affineCases.find(c => c.gain === 5 && c.orientation === 1).perSpanCandidateCounts,
    },
    deltaChiSquared28Degrees: originalChi,
    donorPairsAtOrBelowChi: [atOrBelow, distribution.length],
    donorMedianChi: distribution[3000],
  },
  positive: { plantedSharedPadWordOverlaps: plantedChecks, affineScaledPlantedOverlaps: affinePlantedChecks, nativeDonorWindows: distribution.length },
  conclusion: 'Neither a same-register shared additive pad nor any nonzero-scaled shared additive pad can yield words from this declared finite GP-English dictionary across both original page word tapes; altered segmentation/other alphabets remain open. No unknown plaintext recovered.',
}, null, 2));
