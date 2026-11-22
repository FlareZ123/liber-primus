'use strict';

/**
 * SFT: independent medieval Welsh and Old Norse plaintext-register capacity.
 * Runnable on Windows 11 / Node 22 using built-in modules only.
 * node sims/lp2_nonenglish_register_bounds_sft.cjs
 *
 * No unknown ciphertext is decoded. Source controls match original printed
 * GP29 word lengths and test exact key-independent necessary cipher bounds.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt');
assert.equal(corpus.runes.length, 29);
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} s @returns {string[]} */
function printedWords(s) {
  const out = [];
  let word = '';
  for (const ch of s) {
    if (/[\u16A0-\u16FF]/u.test(ch)) word += ch;
    else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
      // The printed page and line boundary can continue one rune word.
    } else if (word) {
      out.push(word);
      word = '';
    }
  }
  if (word) out.push(word);
  return out;
}
const sourceWords = printedWords(transcript.split('%').slice(0, 55).join('%'));
assert.equal(sourceWords.length, 2896);
assert.equal(sourceWords.reduce((s, word) => s + word.length, 0), 12956);

/** @param {string} original @returns {string} */
function normalizeSpelling(original) {
  // Explicit, contestable equivalences; references remain unmodified.
  return original.toUpperCase().replace(/Þ/g, 'TH').replace(/Ð/g, 'TH')
    .replace(/Æ/g, 'AE').replace(/Œ/g, 'OE')
    .replace(/[ØǪÖ]/g, 'O').replace(/ỽ/g, 'W').replace(/Ẏ/g, 'Y')
    .normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
}
/** @param {string} word @returns {number[]} */
function encode(word) {
  const s = normalizeSpelling(word);
  assert.match(s, /^[A-Z]+$/u, 'non-GP glyph in source word: ' + word);
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      out.push(21);
      i += 3;
    } else if (s.startsWith('IO', i)) {
      out.push(27);
      i += 2;
    } else {
      const t = tokens.find(value => s.startsWith(value.s, i));
      assert(t, 'unknown GP29 transliteration: ' + s.slice(i));
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}
const lp1NativeWord = [...'ᚠᚩᛚᛚᚩᚹᛝ'].map(ch => alphabet.get(ch));
assert.deepEqual(encode('FOLLOWING'), lp1NativeWord);
const p57Reference = read('resources/liber-primus/lp1-plaintext-reference.txt')
  .split('### 57\n')[1].trim();
const p57Transcribed = (p57Reference.match(/[A-Z]+/g) || [])
  .flatMap(encode);
assert.deepEqual(p57Transcribed, corpus.pages[57].indices);

/**
 * @param {number[]} glyphs
 * @returns {{ e:number, doubled:number, interior:number[] }}
 */
function wordProfile(glyphs) {
  const histogram = new Uint16Array(29);
  const interior = new Uint16Array(29);
  let doubled = 0;
  for (let i = 0; i < glyphs.length; i++) {
    histogram[glyphs[i]]++;
    if (i > 0) {
      interior[glyphs[i]]++;
      doubled += Number(glyphs[i] === glyphs[i - 1]);
    }
  }
  return {
    e: histogram.reduce((s, n) => s + n * (n - 1) / 2, 0),
    doubled,
    interior: Array.from(interior)
  };
}
const nativeOriginal = sourceWords.map(w => [...w].map(ch => alphabet.get(ch)));
assert(nativeOriginal.every(w => w.every(x => Number.isInteger(x))));
const originalProfile = nativeOriginal.map(wordProfile);
assert.equal(originalProfile.reduce((s, v) => s + v.e, 0), 811);
assert.equal(originalProfile.reduce((s, v) => s + v.doubled, 0), 63);

// Exact positive for word-local secret permutation with word-internal reversal.
for (const w of nativeOriginal) {
  const transformed = w.map(v => (17 * v + 9) % 29).reverse();
  assert.equal(wordProfile(w).e, wordProfile(transformed).e);
  const inverse = transformed.slice().reverse()
    .map(v => (12 * (v - 9 + 29)) % 29); // inverse of 17 modulo 29 is 12
  assert.deepEqual(inverse, w);
}
const originalLengths = nativeOriginal.map(w => w.length);
const counts = new Map();
for (const n of originalLengths) counts.set(n, (counts.get(n) || 0) + 1);
assert.equal(counts.get(14), 3);

/** @param {string} s @returns {string[]} */
const tokenizeSource = s => s.match(/\p{L}+/gu) || [];
const welsh = read('resources/control/pwyll_pendeuic_dyuet_welsh_source.txt')
  .split(/={20,}\r?\n\r?\n/u);
assert.equal(welsh.length, 2, 'metadata delimiter in pinned Welsh source');
const norse = read('resources/control/havamal_old_norse_source.txt')
  .replace(/^I\.\s*/u, '');
const sources = [
  {name: 'Middle Welsh Pwyll', text: welsh[1], seed: 0x9e3779b9},
  {name: 'Old Norse Havamal', text: norse, seed: 0x9e3779b9 + 101}
];

/**
 * @param {{name:string,text:string,seed:number}} source
 * @returns {object}
 */
function measure(source) {
  const raw = tokenizeSource(source.text);
  const all = raw.map(encode);
  const byLength = Array.from({length: 15}, () => []);
  for (const word of all) {
    if (word.length <= 14) byLength[word.length].push(wordProfile(word));
  }
  const supported = originalLengths.filter(n => byLength[n].length);
  const skipped = originalLengths.length - supported.length;
  assert.equal(skipped, 3, source.name + ' must not fabricate missing length-14 tokens');
  const observedE = originalProfile.reduce((sum, profile, i) =>
    byLength[originalLengths[i]].length ? sum + profile.e : sum, 0);
  assert.equal(observedE, 803);
  let seed = source.seed | 0;
  /** @returns {number} */
  function rand() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }
  const trials = [];
  for (let trial = 0; trial < 1024; trial++) {
    const sums = new Uint32Array(29);
    let e = 0, doubles = 0, interiorSites = 0;
    for (const n of originalLengths) {
      const candidates = byLength[n];
      if (!candidates.length) continue;
      const word = candidates[rand() % candidates.length];
      e += word.e;
      doubles += word.doubled;
      interiorSites += n - 1;
      for (let g = 0; g < 29; g++) sums[g] += word.interior[g];
    }
    assert.equal(interiorSites, 10021);
    const ranked = Array.from(sums).sort((a, b) => b - a);
    trials.push({
      e, doubles,
      top1: ranked[0],
      top5: ranked.slice(0, 5).reduce((a, b) => a + b, 0)
    });
  }
  /** @param {'e'|'doubles'|'top1'|'top5'} key */
  function stats(key) {
    const values = trials.map(t => t[key]);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(4))
    };
  }
  return {
    name: source.name, sourceWords: all.length, samples: trials.length,
    originalMatchedWords: supported.length,
    omittedOriginalLength14Words: skipped,
    matchedOriginalEqualPairs: observedE,
    matchesFixedWordSymbolMap: trials.filter(t => t.e <= observedE).length,
    matchesGlobalPredecessorBound: trials.filter(t =>
      t.top1 <= 578 && t.top5 <= 2510).length,
    matchesEightSectionPredecessorBound: trials.filter(t =>
      t.top1 <= 1031 && t.top5 <= 3912).length,
    matchesWordPositionAndInkBound: trials.filter(t =>
      t.top1 <= 1160 && t.top5 <= 4089).length,
    matchesTwoUnknownModePredecessorBound: trials.filter(t =>
      t.top1 <= 1086).length,
    matchesSectionAndParityPredecessorBound: trials.filter(t =>
      t.top1 <= 1354 && t.top5 <= 4842).length,
    equalPairs: stats('e'), adjacentDoubles: stats('doubles'),
    interiorTop1: stats('top1'), interiorTop5: stats('top5')
  };
}
const results = sources.map(measure);
assert(results.every(r =>
  r.matchesFixedWordSymbolMap === 0 &&
  r.matchesGlobalPredecessorBound === 0 &&
  r.matchesEightSectionPredecessorBound === 0));
console.log(JSON.stringify({original:{wholeWords:sourceWords.length,
  runes:12956, equalPairs:811, matchedEqualPairs:803,
  withinWordDoubles:63}, originalKeylessBounds:{globalTop1:578,
  globalTop5:2510,eightSectionTop1:1031,eightSectionTop5:3912,
  wordPositionInkTop5:4089, twoModeTop1:1086,
  sectionParityTop1:1354,sectionParityTop5:4842},
  results, interpretation:'language-conditional bounds; no original unknown-page plaintext'}, null, 2));
console.log('PASS: source-native solved controls, cipher invariants, length-matched non-English gates');
