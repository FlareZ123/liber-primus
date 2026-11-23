'use strict';
/**
 * Original-LP2 all-key gate for a globally shared 29-state evolving
 * first-difference cipher driven by the source-visible p7 quartic.
 *
 * Reproduce: node sims/lp2_p7_quartic_29state_allsecret_original_sft.cjs
 * Inputs: canonical physical-page rune corpus and independently annotated
 * original large punctuation. No language optimization or estimated key.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) { return fs.readFileSync(path.join(root, name), 'utf8'); }
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const pages = db.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const inkPages = new Map(ink.pages.map(p => [p.page, p]));
assert.equal(pages.length, 55);
const total = pages.reduce((n, p) => n + p.indices.length, 0);
const interiors = total - pages.length;
assert.equal(total, 12956);
assert.equal(interiors, 12901);
const coefficients = [11, 26, 8, 15, 2];
/** @param {number} n @returns {number} */
function mod(n) { return (n % 29 + 29) % 29; }
/** @param {number} s @returns {number} */
function quartic(s) {
  let sum = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) sum = mod(sum * s + coefficients[i]);
  return sum;
}
assert.equal(quartic(3), 3);
assert.equal(quartic(4), 4);
assert.equal(mod(coefficients[1] + 2*coefficients[2]*4 + 3*coefficients[3]*16 + 4*coefficients[4]*64), 17);
const gp = db.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} source @returns {number[]} */
function encodeGP(source) {
  const out = [];
  for (const original of source.match(/[A-Za-z]+/g) || []) {
    const word = original.toUpperCase().replace(/[KVZQ]/g,
      c => ({K:'C', V:'U', Z:'S', Q:'C'})[c]);
    for (let i = 0; i < word.length;) {
      const token = gp.find(x => word.startsWith(x.token, i));
      assert(token, 'Unencodable GP word: ' + word);
      out.push(token.index);
      i += token.token.length;
    }
  }
  return out;
}
/** @param {number[]} seq @returns {number} */
function top1(seq) {
  const h = Array(29).fill(0);
  for (const x of seq) { assert(Number.isInteger(x) && x >= 0 && x < 29); h[x]++; }
  return Math.max(...h);
}
/** @param {{page:number,indices:number[]}} page @returns {number[]} */
function markerOffsets(page) {
  const m = inkPages.get(page.page)?.large_punctuation || [];
  return [...new Set(m.map(x => x[0]).filter(x => Number.isInteger(x) && x > 1 && x < page.indices.length))].sort((a, b) => a - b);
}
/**
 * A page's first ciphertext rune is the freely provided IV. All later
 * genuine internal punctuation can optionally reset the hidden 29-state
 * carry; previous ciphertext rune remains unchanged across that mark.
 *
 * @param {{page:number,indices:number[]}} page
 * @param {boolean} resetAtLargeMarks
 * @returns {Array<{start:number,end:number}>}
 */
function segments(page, resetAtLargeMarks) {
  const starts = [1, ...(resetAtLargeMarks ? markerOffsets(page) : []), page.indices.length];
  return starts.slice(0, -1).map((start, i) => ({start, end:starts[i + 1]}));
}
/**
 * For each possible secret seed q=0..28 in one original uninterrupted
 * segment, H[q][state][delta] counts the *actual* source observations.
 * @param {number[]} ciphertext
 * @param {number} start
 * @param {number} end
 * @param {'cipher'|'difference'} driver
 * @returns {number[][][]}
 */
function segmentHistograms(ciphertext, start, end, driver) {
  return Array.from({length:29}, (_, seed) => {
    const h = Array.from({length:29}, () => Array(29).fill(0));
    let s = seed;
    for (let j = start; j < end; j++) {
      const c = ciphertext[j];
      const d = mod(c - ciphertext[j - 1]);
      h[s][d]++;
      s = mod(quartic(s) + (driver === 'cipher' ? c : d));
    }
    return h;
  });
}
/**
 * Exact over-relaxed all-key single-plaintext-rune bound:
 * B1 = sum_state max_delta sum_segment max_seed H[segment][seed][state][delta].
 * The maximizations use a different hidden seed per (segment,state), even
 * though an actual 29-state decoder must use ONE seed per segment. Thus the
 * computed B1 is >= the true maximum under every arbitrary shared 29!
 * alphabet in every state, and all 29^segments hidden seed choices.
 *
 * @param {Array<{page:number,indices:number[]}>} textPages
 * @param {'cipher'|'difference'} driver
 * @param {boolean} resetAtLargeMarks
 * @returns {{groups:number,eligible:number,maximum:number,byState:number[]}}
 */
function bound(textPages, driver, resetAtLargeMarks) {
  const groups = [];
  let eligible = 0;
  for (const p of textPages) {
    for (const span of segments(p, resetAtLargeMarks)) {
      const n = span.end - span.start;
      assert(n > 0);
      eligible += n;
      groups.push(segmentHistograms(p.indices, span.start, span.end, driver));
    }
  }
  const byState = Array(29).fill(0);
  for (let state = 0; state < 29; state++) {
    for (let delta = 0; delta < 29; delta++) {
      let possible = 0;
      for (const group of groups) {
        let bestSeed = 0;
        for (let seed = 0; seed < 29; seed++) {
          if (group[seed][state][delta] > bestSeed) bestSeed = group[seed][state][delta];
        }
        possible += bestSeed;
      }
      if (possible > byState[state]) byState[state] = possible;
    }
  }
  return {groups:groups.length, eligible,
    maximum:byState.reduce((x, y) => x + y, 0), byState};
}
/** @param {number} seed @returns {number} */
function nextSeed(seed) { return (Math.imul(seed, 1664525) + 1013904223) >>> 0; }
/** @returns {number[][]} */
function privateSecretAlphabets() {
  let seed = 0x27332f17;
  return Array.from({length:29}, () => {
    const q = Array.from({length:29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      seed = nextSeed(seed);
      const j = seed % (i + 1);
      [q[i], q[j]] = [q[j], q[i]];
    }
    return q;
  });
}
/**
 * Exact encoder and decoder of a full native GP source plant under genuine
 * arbitrary 29! shared state alphabets. Page and punctuation resets are
 * deterministic planted secret seeds, not claims of real Cicada keys.
 * @param {number[]} plaintext
 * @param {'cipher'|'difference'} driver
 * @param {boolean} resetAtLargeMarks
 * @returns {Array<{page:number,indices:number[]}>}
 */
function plant(plaintext, driver, resetAtLargeMarks) {
  const maps = privateSecretAlphabets();
  const inverse = maps.map(row => row.map((_, i) => row.indexOf(i)));
  let cursor = 0;
  const ciphertextPages = [];
  for (const p of pages) {
    const desired = plaintext.slice(cursor, cursor + p.indices.length);
    assert.equal(desired.length, p.indices.length);
    const encrypt = [desired[0]];
    const marks = new Set(resetAtLargeMarks ? markerOffsets(p) : []);
    let segmentNo = 0, state = mod(17*p.page + 3);
    for (let j = 1; j < desired.length; j++) {
      if (marks.has(j)) {segmentNo++; state = mod(17*p.page + 7*segmentNo + 3);}
      const delta = inverse[state][desired[j]];
      const c = mod(encrypt[j - 1] + delta);
      encrypt.push(c);
      state = mod(quartic(state) + (driver === 'cipher' ? c : delta));
    }
    let decodedState = mod(17*p.page + 3);
    segmentNo = 0;
    const decoded = [encrypt[0]];
    for (let j = 1; j < encrypt.length; j++) {
      if (marks.has(j)) {segmentNo++; decodedState = mod(17*p.page + 7*segmentNo + 3);}
      const delta = mod(encrypt[j] - encrypt[j - 1]);
      const clear = maps[decodedState][delta];
      decoded.push(clear);
      assert.equal(mod(encrypt[j - 1] + inverse[decodedState][clear]), encrypt[j],
        'Exact forward reencryption of original-length plant');
      decodedState = mod(quartic(decodedState) + (driver === 'cipher' ? encrypt[j] : delta));
    }
    assert.deepEqual(decoded, desired, 'Exact full native-source positive');
    ciphertextPages.push({page:p.page,indices:encrypt});
    cursor += p.indices.length;
  }
  assert.equal(cursor, total);
  return ciphertextPages;
}
const originalDoubles = pages.reduce((sum, p) => sum +
  p.indices.slice(1).filter((x, i) => x === p.indices[i]).length, 0);
assert.equal(originalDoubles, 86);
const sources = [
  {name:'Gibran',data:encodeGP(read('resources/control/gibran_prophet_58585.txt')),
    starts:[1000, 11000, 21000, 31000, 41000]},
  {name:'Shakespeare',data:encodeGP(read('resources/control/shakespeare_first300k.txt')),
    starts:[20000, 56000, 92000, 128000, 164000]}
];
const native = [];
for (const source of sources) for (const offset of source.starts) {
  const text = source.data.slice(offset, offset + total);
  assert.equal(text.length, total);
  let cursor = 0, head = [];
  for (const page of pages) {
    head.push(...text.slice(cursor + 1, cursor + page.indices.length));
    cursor += page.indices.length;
  }
  native.push({source:source.name, offset, mostCommonGP:top1(head)});
}
assert.equal(Math.min(...native.map(x => x.mostCommonGP)), 1410);
const original = [];
const controls = [];
const nativePlant = sources[0].data.slice(1000, 1000 + total);
for (const driver of ['cipher', 'difference']) {
  for (const resetAtLargeMarks of [false, true]) {
    const real = bound(pages, driver, resetAtLargeMarks);
    const planted = plant(nativePlant, driver, resetAtLargeMarks);
    const plantedBound = bound(planted, driver, resetAtLargeMarks);
    let cursor = 0, interior = [];
    for (const p of pages) {
      interior.push(...nativePlant.slice(cursor + 1, cursor + p.indices.length));
      cursor += p.indices.length;
    }
    const trueTop1 = top1(interior);
    assert(real.maximum < Math.min(...native.map(x => x.mostCommonGP)),
      'Original all-key bound must contradict every real-text control');
    assert(plantedBound.maximum >= trueTop1, 'A genuine encrypted native book must obey theorem');
    assert.equal(real.eligible, interiors);
    assert.equal(plantedBound.eligible, interiors);
    original.push({driver,resetAtLargeMarks,...real});
    controls.push({driver,resetAtLargeMarks,nativeRecovered:total,
      exactReenciphered:interiors,realNativeMostCommon:trueTop1,
      plantedUpperBound:plantedBound.maximum});
  }
}
assert.deepEqual(original.map(x => x.maximum), [1026,1120,1056,1146]);
assert.deepEqual(original.map(x => x.groups), [55,75,55,75]);
console.log(JSON.stringify({
  hypothesis:'one evolving 29-state carry, original p7 quartic + observed ciphertext/delta, 29 globally shared entirely secret bijections',
  source:{runePages:pages.length, runes:total,eligible:interiors,adjacentEqual:originalDoubles,
    visibleLargeMarks:pages.reduce((z,p)=>z+(inkPages.get(p.page)?.large_punctuation?.length||0),0)},
  original, nativeComparisons:native,positiveControls:controls,
  decision:'All four tested shared-alphabet page/mark-seeded evolving states are excluded for all ten native GP prose controls. No unknown LP2 key/plaintext or authenticated operator.'
}, null, 2));
