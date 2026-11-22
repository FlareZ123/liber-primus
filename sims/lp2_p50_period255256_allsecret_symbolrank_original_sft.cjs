'use strict';

/**
 * Exact unknown-key symbol-rank capacity of a repeated 255- or 256-position
 * GP29 lookup cipher on all original LP2 pp0-p55 ciphertext.
 *
 * Any independently secret invertible 29-symbol substitution at each
 * period phase preserves its phase histogram. Consequently, the sum
 * of the top five original phase-bin counts upper-bounds how many
 * decrypted symbols can belong to any five chosen plaintext runes.
 *
 * This includes any Caesar/Vigenere key derived from a 255-state GF4
 * clock or p50's native 256 cells as a special case. Five source-visible
 * key-reset conventions are tested without fitting alphabets or phases.
 *
 * Windows Node22 CommonJS SFT. Read-only, with exact 12956-rune source,
 * source-word/line punctuation and native-GP encrypted positive controls.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8')
  .split('%');
const glyph = new Map(corpus.runes.map((r, i) => [r, i]));
const original = corpus.pages.slice(0, 56).flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(corpus.pages[50].indices.length, 0);
assert.equal(corpus.pages[57].indices.length, 95);

/** Source-visible period-reset clock, with no secret choice of reset sites. */
const phase = {
  continuous: [], physical_page: [], illustrated_chapter: [],
  complete_word: [], printed_line: []
};
const chapterStarts = new Set([0, 3, 8, 15, 23, 27, 33, 40, 54]);
let position = 0;
let wordClock = 0;
let chapterClock = 0;
let wordCount = 0;
let hyphenCount = 0;
let fullStopCount = 0;
for (let page = 0; page <= 55; page++) {
  if (page === 50) continue;
  if (chapterStarts.has(page)) chapterClock = 0;
  let pageClock = 0;
  let lineClock = 0;
  for (const ch of transcript[page < 50 ? page : page - 1]) {
    if (glyph.has(ch)) {
      assert.equal(glyph.get(ch), original[position],
        'Raw transcription and index corpus must agree at rune ' + position);
      phase.continuous.push(position++);
      phase.physical_page.push(pageClock++);
      phase.illustrated_chapter.push(chapterClock++);
      phase.complete_word.push(wordClock++);
      phase.printed_line.push(lineClock++);
    } else if (ch === '-' || ch === '.') {
      if (wordClock) wordCount++;
      wordClock = 0;
      if (ch === '-') hyphenCount++;
      else fullStopCount++;
    } else if (ch === '/') {
      lineClock = 0;
    }
  }
}
assert.equal(position, original.length);
assert.equal(wordCount, 2896);
assert.deepEqual([hyphenCount, fullStopCount], [2727, 175]);
assert.equal(new Set(Object.values(phase).map(v => v.length)).size, 1);

const mod29 = n => ((n % 29) + 29) % 29;

/**
 * Exact sum of the k greatest original ciphertext counts within each
 * independently keyed phase: necessary upper bound for any source-wide
 * top-k native-GP plaintext runes after a fixed invertible GP29 map per phase.
 *
 * @param {number[]} stream Original runes.
 * @param {number[]} siteClock Source-visible phase index for each rune.
 * @param {number} period Number of independent secret substitution rows.
 * @param {number} k Number of most common recovered glyphs.
 */
function rankUpperBound(stream, siteClock, period, k) {
  assert.equal(stream.length, siteClock.length);
  const rows = Array.from({ length: period }, () => new Uint32Array(29));
  for (let i = 0; i < stream.length; i++) {
    assert(stream[i] >= 0 && stream[i] < 29);
    rows[siteClock[i] % period][stream[i]]++;
  }
  return rows.reduce((total, row) => {
    const ranked = Array.from(row).sort((a, b) => b - a);
    return total + ranked.slice(0, k).reduce((a, b) => a + b, 0);
  }, 0);
}

const expected = {
  continuous: { 255: [1233, 4818], 256: [1244, 4861] },
  physical_page: { 255: [1245, 4851], 256: [1241, 4858] },
  illustrated_chapter: { 255: [1241, 4833], 256: [1244, 4856] },
  complete_word: { 255: [561, 2660], 256: [561, 2660] },
  printed_line: { 255: [684, 3055], 256: [684, 3055] }
};
const observations = [];
for (const [clockName, clock] of Object.entries(phase)) {
  for (const period of [255, 256]) {
    const B1 = rankUpperBound(original, clock, period, 1);
    const B5 = rankUpperBound(original, clock, period, 5);
    assert.deepEqual([B1, B5], expected[clockName][period]);
    observations.push({
      clock: clockName, period, sourceRunes: original.length,
      B1, B5, B5Fraction: Number((B5 / original.length).toFixed(8))
    });
  }
}

/**
 * Stronger independent 2-mode model: each of the nine visually bounded
 * original chapters may use either of two wholly independent 255/256-row
 * hidden substitution banks. Enumerate all 2^8 inequivalent assignments,
 * fixing chapter zero to bank A to remove the global A/B symmetry.
 * This is stricter than only alternating chapters or testing one split.
 */
const authoredChapters = [
  [0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]
];
const chapterTapes = authoredChapters.map(([a, b]) =>
  corpus.pages.slice(a, b + 1).flatMap(p => p.indices));
assert.equal(chapterTapes.flat().length, original.length);

/** @param {number} period Repeating positions per secret bank. */
function allTwoBankChapterAssignments(period, tapes = chapterTapes) {
  const hist = tapes.map(tape => {
    const rows = Array.from({ length: period }, () => new Uint32Array(29));
    tape.forEach((c, i) => rows[i % period][c]++);
    return rows;
  });
  let maximumTopFive = -1;
  let bestMask = -1;
  let minimumTopFive = Infinity;
  let scanned = 0;
  for (let mask = 0; mask < 256; mask++) {
    let total = 0;
    for (let phaseIndex = 0; phaseIndex < period; phaseIndex++) {
      const bankA = new Uint32Array(29);
      const bankB = new Uint32Array(29);
      for (let chapterIndex = 0; chapterIndex < 9; chapterIndex++) {
        const bank = chapterIndex === 0 || ((mask >>> (chapterIndex - 1)) & 1)
          ? bankA : bankB;
        const row = hist[chapterIndex][phaseIndex];
        for (let c = 0; c < 29; c++) bank[c] += row[c];
      }
      for (const bank of [bankA, bankB]) {
        total += Array.from(bank).sort((a, b) => b - a)
          .slice(0, 5).reduce((a, b) => a + b, 0);
      }
    }
    scanned++;
    if (total > maximumTopFive) {
      maximumTopFive = total;
      bestMask = mask;
    }
    minimumTopFive = Math.min(minimumTopFive, total);
  }
  return { period, scanned, maximumTopFive, bestMask, minimumTopFive,
    maximumFraction: Number((maximumTopFive / original.length).toFixed(8)) };
}
const twoBankChapterBounds = [255, 256].map(period =>
  allTwoBankChapterAssignments(period));
assert.deepEqual(twoBankChapterBounds.map(x =>
  [x.scanned, x.maximumTopFive, x.bestMask, x.minimumTopFive]),
[[256, 6084, 60, 4833], [256, 6114, 185, 4856]]);
assert(twoBankChapterBounds.every(x => x.maximumTopFive / original.length < 46 / 95));

/**
 * Reversible first-order additive-integrator cipher is a distinct mechanism
 * motivated by the very rare adjacent ciphertext doublets. If:
 *    C[i] = C[i-1] + E_{phase}(P[i]) (mod29)
 * then source D[i]=(C[i]-C[i-1]) mod29 is precisely the output of the
 * same unknown fixed per-phase secret permutation E. Apply the identical
 * no-key rank theorem to D, including source-visible accumulator resets.
 */
const differential = {};
const differentialBounds = [];
for (const [clockName, clock] of Object.entries(phase)) {
  const values = original.map((c, i) =>
    mod29(c - (i === 0 || clock[i] === 0 ? 0 : original[i-1])));
  differential[clockName] = values;
  for (const period of [255, 256]) {
    const B1 = rankUpperBound(values, clock, period, 1);
    const B5 = rankUpperBound(values, clock, period, 5);
    differentialBounds.push({
      clock:clockName,period,B1,B5,
      B5Fraction:Number((B5/original.length).toFixed(8))
    });
  }
}
const expectedDifferential = {
  continuous:{255:4894,256:4940},
  physical_page:{255:4901,256:4912},
  illustrated_chapter:{255:4858,256:4920},
  complete_word:{255:2760,256:2760},
  printed_line:{255:3048,256:3048}
};
for (const row of differentialBounds)
  assert.equal(row.B5, expectedDifferential[row.clock][row.period]);
assert.equal(differential.continuous.filter(x => x === 0).length, 86);

const chapterDifferentialTapes = chapterTapes.map(tape =>
  tape.map((c, i) => mod29(c - (i===0 ? 0 : tape[i-1]))));
const twoBankDifferentialBounds = [255,256].map(period =>
  allTwoBankChapterAssignments(period, chapterDifferentialTapes));
assert.deepEqual(twoBankDifferentialBounds.map(x =>
  [x.scanned,x.maximumTopFive,x.bestMask,x.minimumTopFive]),
  [[256,6106,180,4858],[256,6180,15,4920]]);
assert(twoBankDifferentialBounds.every(x =>
  x.maximumTopFive/original.length < 46/95));

/**
 * Transparent literal-F clock is a historically authenticated solved-p56
 * variant: visible F rune 0 passes as itself and consumes no key phase.
 * The encrypted non-F symbols then use a secret GP28 permutation at each
 * 255/256 phase. For top-five recovered rune occupancy, either the chosen
 * five exclude F (sum five largest non-F phase bins) or they include it
 * (original F count + sum four largest non-F phase bins).
 *
 * Grant two arbitrary secret chapter-mode banks again, and maximize over
 * every one of the 2^8 inequivalent nine-chapter assignments.
 */
const originalFCount = original.filter(x=>x===0).length;
assert.equal(originalFCount,458);
const skipFTapes = chapterTapes.map(tape => {
  const nonF=tape.filter(x=>x!==0);
  return {
    direct:nonF,
    integrator:nonF.map((x,i)=>mod29(x-(i===0?0:nonF[i-1])))
  };
});
/** @param {number} period fixed bank cycle @param {"direct"|"integrator"} mode */
function allTwoBankTransparentF(period,mode) {
  const hist=skipFTapes.map(t=>{
    const rows=Array.from({length:period},()=>new Uint32Array(29));
    t[mode].forEach((x,i)=>rows[i%period][x]++);
    return rows;
  });
  let best=-1,bestMask=-1,least=Infinity;
  for(let mask=0;mask<256;mask++){
    let topFourNonF=0,topFiveNonF=0;
    for(let phaseIndex=0;phaseIndex<period;phaseIndex++){
      const banks=[new Uint32Array(29),new Uint32Array(29)];
      for(let chapter=0;chapter<9;chapter++){
        const bucket=chapter===0||((mask>>>(chapter-1))&1)?banks[0]:banks[1];
        for(let c=(mode==='direct'?1:0);c<29;c++)bucket[c]+=hist[chapter][phaseIndex][c];
      }
      for(const bank of banks){
        const sorted=Array.from(bank).slice(mode==='direct'?1:0).sort((a,b)=>b-a);
        topFourNonF+=sorted.slice(0,4).reduce((a,b)=>a+b,0);
        topFiveNonF+=sorted.slice(0,5).reduce((a,b)=>a+b,0);
      }
    }
    const capacity=Math.max(topFiveNonF,originalFCount+topFourNonF);
    if(capacity>best){best=capacity;bestMask=mask;}
    least=Math.min(least,capacity);
  }
  return {period,mode,assignments:256,B5:best,mask:bestMask,
    smallestB5:least,fraction:Number((best/original.length).toFixed(8))};
}
const transparentFBounds=[];
for(const mode of ['direct','integrator'])
  for(const period of [255,256])
    transparentFBounds.push(allTwoBankTransparentF(period,mode));
assert.deepEqual(transparentFBounds.map(x=>[x.mode,x.period,x.B5,x.mask]),
  [['direct',255,6026,27],['direct',256,6056,88],
   ['integrator',255,6030,38],['integrator',256,6020,58]]);
assert(transparentFBounds.every(x=>x.B5/original.length<46/95));

/** Exact histogram for any recovered candidate plaintext. */
function globalTopK(stream, k) {
  const counts = new Uint32Array(29);
  for (const x of stream) counts[x]++;
  return Array.from(counts).sort((a, b) => b - a).slice(0, k)
    .reduce((a, b) => a + b, 0);
}
const solved = corpus.pages[57].indices;
assert.deepEqual([globalTopK(solved, 1), globalTopK(solved, 5)], [15, 46]);

/**
 * Native-GP positive: repeat source-authentic solved p57 to source length,
 * encrypt it with one invertible phase-specific affine GP29 substitution,
 * and show exact forward replay plus rank capacity of its encrypted tape.
 * The affine state is solely a test plant, not an alleged LP2 key.
 */
const positivePlain = Array.from({ length: original.length },
  (_, i) => solved[i % solved.length]);
const positiveCipher = positivePlain.map((p, i) =>
  mod29(7 * p + 13 * (phase.continuous[i] % 256) + 17));
const positiveReconstructed = positiveCipher.map((c, i) =>
  mod29(25 * (c - 13 * (phase.continuous[i] % 256) - 17)));
assert.deepEqual(positiveReconstructed, positivePlain);
const positiveTopFive = globalTopK(positivePlain, 5);
const positiveCapacity = rankUpperBound(positiveCipher, phase.continuous, 256, 5);
assert(positiveCapacity >= positiveTopFive);
assert(positiveTopFive / positivePlain.length > 0.48);
assert(rankUpperBound(original, phase.continuous, 256, 5) / original.length < 0.38);

/** Positive native-GP test for the additive cumulative-cipher variant. */
const positiveIntegratorCipher = [];
for (let i=0;i<positivePlain.length;i++) {
  const increment=mod29(7*positivePlain[i]+13*(i%256)+17);
  positiveIntegratorCipher.push(mod29(increment+
    (i===0?0:positiveIntegratorCipher[i-1])));
}
const positiveDelta = positiveIntegratorCipher.map((c,i)=>
  mod29(c-(i===0?0:positiveIntegratorCipher[i-1])));
const recoveredNative = positiveDelta.map((d,i)=>
  mod29(25*(d-13*(i%256)-17)));
assert.deepEqual(recoveredNative,positivePlain);
assert(rankUpperBound(positiveDelta,phase.continuous,256,5)>=positiveTopFive);
assert(rankUpperBound(differential.continuous,phase.continuous,256,5)/original.length<.39);

console.log(JSON.stringify({
  theorem: 'Any unchanged phase-reused GP29 substitution (even 29! secret maps per phase) cannot exceed this source histogram bound for its five most frequent output glyphs',
  originalRunes: original.length,
  sourceWords: wordCount,
  periods: [255, 256],
  sourceNativeP57TopFive: [globalTopK(solved, 5), solved.length],
  exactBounds: observations,
  firstOrderAdditiveIntegratorAllSecretBounds: differentialBounds,
  twoBankFirstOrderIntegratorChapterBounds: twoBankDifferentialBounds,
  allTwoBankTransparentFChapterBounds: transparentFBounds,
  exhaustiveTwoSecretChapterBankBounds: twoBankChapterBounds,
  syntheticNativeControl: {
    nativeRunes: positivePlain.length,
    trueTopFive: positiveTopFive,
    ciphertextUpperBoundTopFive: positiveCapacity,
    trueGP29ForwardReplay: positivePlain.length,
    trueFirstOrderIntegratorReplay: recoveredNative.length
  },
  caveat: 'No original key or plaintext. Bounds require globally reused per-phase invertible maps; nonnative plaintext or evolving key escapes.'
}, null, 2));
