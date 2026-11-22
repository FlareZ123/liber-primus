'use strict';
/**
 * Exact all-cube original LP2 p0–p2 transparent-GP27 invariant.
 *
 * A classical 3x3x3 (27-glyph) keyed Trifid, with two GP29 symbols
 * passed through literally, MUST conserve the individual counts of both
 * transparent symbols regardless of cube, period, scope or direction.
 *
 * This test uses 729 untouched physical LP2 p0–p2 runes and exhausts all
 * matching-length windows in three independent repository GP-English
 * references, with both GP writer orthographies used in solved manuscripts.
 *
 * Run on Windows 11: node sims/lp2_p0_trifid27_transparent_pair_allcube_sft.cjs
 * Node.js 22, read-only, built-ins only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = corpus.pages.slice(0, 3).map(p => p.indices);
assert.deepEqual(pages.map(p => p.length), [262, 266, 201]);
const original = pages.flat();
assert.equal(original.length, 729);
const originalHistogram = new Int32Array(29);
original.forEach(x => originalHistogram[x]++);
assert.equal(originalHistogram[0], 34);  // F, one source-selected bypass
assert.equal(originalHistogram[28], 28); // EA, other proposed bypass

/** @param {string} text @param {boolean} historicOverrides @returns {number[]} */
function gpEncode(text, historicOverrides) {
  const tokens = corpus.translit.map((symbol, i) => [symbol, i]);
  if (historicOverrides) tokens.push(['ING', 21], ['IO', 27]);
  tokens.sort((a, b) => b[0].length - a[0].length);
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/[KQ]/g, 'C')
      .replace(/V/g, 'U').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const token = tokens.find(([label]) => word.startsWith(label, i));
      assert.ok(token, 'Native GP symbol absent: ' + word.slice(i));
      out.push(token[1]);
      i += token[0].length;
    }
  }
  return out;
}

/**
 * Exact keyed 27-cube Trifid with two literal unchanged glyphs.
 * Used only as a native-plaintext positive and original round-trip control.
 * @param {number[]} text GP indices
 * @param {number[]} cube 27 distinct GP symbols 1..27
 * @param {number} period core rune count per Trifid block
 * @param {boolean} inverse
 * @returns {number[]}
 */
function trifid(text, cube, period, inverse) {
  assert.equal(cube.length, 27);
  assert.equal(new Set(cube).size, 27);
  const place = new Int16Array(29).fill(-1);
  cube.forEach((value, i) => { place[value] = i; });
  assert.equal(place[0], -1);
  assert.equal(place[28], -1);
  const positions = [];
  const core = [];
  text.forEach((value, offset) => {
    if (place[value] >= 0) {
      positions.push(offset);
      core.push(place[value]);
    } else {
      assert.ok(value === 0 || value === 28);
    }
  });
  const result = text.slice();
  for (let start = 0; start < core.length; start += period) {
    const block = core.slice(start, start + period);
    const n = block.length;
    let labels;
    if (inverse) {
      const digits = block.flatMap(v => [Math.floor(v / 9), Math.floor(v / 3) % 3, v % 3]);
      labels = Array.from({length: n}, (_, i) => 9 * digits[i] + 3 * digits[n + i] + digits[2 * n + i]);
    } else {
      const digits = [...block.map(v => Math.floor(v / 9)),
        ...block.map(v => Math.floor(v / 3) % 3), ...block.map(v => v % 3)];
      labels = Array.from({length: n}, (_, i) => 9 * digits[3*i] + 3 * digits[3*i + 1] + digits[3*i + 2]);
    }
    labels.forEach((label, j) => { result[positions[start + j]] = cube[label]; });
  }
  return result;
}

/** @param {number[]} stream @returns {Int32Array} */
function histogram(stream) {
  const h = new Int32Array(29);
  stream.forEach(x => h[x]++);
  return h;
}

/**
 * Exhaust every GP-native 729-rune source window, preserving each
 * literal rune identity, and collect transparent-symbol pair frequencies.
 *
 * @param {number[]} stream
 * @returns {object}
 */
function census(stream) {
  const width = original.length;
  assert.ok(stream.length >= width);
  const h = histogram(stream.slice(0, width));
  const pairs = new Set();
  let maxF = 0, maxEA = 0, sameF = 0, sameEA = 0, sameBoth = 0;
  let bestMatchedSymbols = 0;
  for (let start = 0; start + width <= stream.length; start++) {
    maxF = Math.max(maxF, h[0]);
    maxEA = Math.max(maxEA, h[28]);
    if (h[0] === originalHistogram[0]) sameF++;
    if (h[28] === originalHistogram[28]) sameEA++;
    if (h[0] === originalHistogram[0] && h[28] === originalHistogram[28]) sameBoth++;
    const equal = [];
    for (let j = 0; j < 29; j++) {
      if (h[j] === originalHistogram[j]) equal.push(j);
    }
    bestMatchedSymbols = Math.max(bestMatchedSymbols, equal.length);
    for (let i = 0; i < equal.length; i++) {
      for (let j = i + 1; j < equal.length; j++) {
        pairs.add(equal[i] + ',' + equal[j]);
      }
    }
    if (start + width < stream.length) {
      h[stream[start]]--;
      h[stream[start + width]]++;
    }
  }
  assert.ok(maxEA < 28);
  assert.equal(sameEA, 0);
  assert.equal(sameBoth, 0);
  return {
    GP29Runes: stream.length,
    complete729RuneWindows: stream.length - width + 1,
    maxF, maxEA, exactFCountWindows: sameF,
    exactEACountWindows: sameEA, exactFAndEACountWindows: sameBoth,
    possibleAnyTwoUnchangedRunePairs: pairs.size,
    bestMatchedSymbols,
    pairs
  };
}

const controls = [
  ['Gibran', (() => {
    const text = read('resources/control/gibran_prophet_58585.txt');
    const from = text.indexOf('THE PROPHET', 500);
    const to = text.lastIndexOf('*** END OF');
    assert.ok(from > 500 && to > from);
    return text.slice(from + 11, to);
  })()],
  ['Shakespeare', read('resources/control/shakespeare_first300k.txt')],
  ['Emerson', read('resources/control/emerson_essays_2944.txt')]
];

// Native plant tests a real reversible keyed transform; every unchanged
// bypass rune survives both encryption and decryption, not just a count.
const cube = Array.from({length: 27}, (_, i) => ((i * 11) % 27) + 1);
const plant = gpEncode(controls[0][1], false).slice(1000, 1729);
const encrypted = trifid(plant, cube, 27, false);
assert.equal(encrypted.length, 729);
assert.deepEqual(trifid(encrypted, cube, 27, true), plant);
assert.deepEqual([histogram(plant)[0], histogram(plant)[28]],
  [histogram(encrypted)[0], histogram(encrypted)[28]]);
assert.deepEqual(trifid(trifid(original, cube, 27, false), cube, 27, true), original);

const reports = [];
const unions = [];
const allPairByWriter = [];
for (const historicOverrides of [false, true]) {
  const allPairs = new Set();
  let windows = 0;
  for (const [name, source] of controls) {
    const score = census(gpEncode(source, historicOverrides));
    const {pairs, ...printed} = score;
    for (const pair of pairs) allPairs.add(pair);
    windows += score.complete729RuneWindows;
    reports.push({spelling: historicOverrides ? 'ING-IO writer' : 'canonical translit',
      source: name, ...printed});
  }
  unions.push({spelling: historicOverrides ? 'ING-IO writer' : 'canonical translit',
    totalWindows: windows, survivingAnyTwoUnchangedPairs: allPairs.size,
    rejectedAnyTwoUnchangedPairs: 406 - allPairs.size,
    containsFAndEA: allPairs.has('0,28')});
  allPairByWriter.push(allPairs);
}
assert.deepEqual(reports.map(x => x.maxEA), [20,19,16,21,19,16]);
assert.deepEqual(unions.map(x => [x.totalWindows,x.survivingAnyTwoUnchangedPairs,x.containsFAndEA]),
  [[589280,81,false],[583878,93,false]]);
// Entire-manuscript native-word constraint on the same two literally
// unchanged glyphs. All 28 seen GP labels except C (5) occur as their
// own original printed one-rune words, whereas native English singletons
// must be A, I or O (GP indices 24,10,3). The source text grammar, not
// the fitted plaintext, defines all 2,896 complete printed words.
const glyphs = new Map(corpus.runes.map((symbol, i) => [symbol, i]));
const originalUnknown = corpus.pages.slice(0, 56).flatMap(p => p.indices);
assert.equal(originalUnknown.length, 12956);
const transcribed = read('resources/lp2-transcription.txt');
const originalGlyphStream = Array.from(transcribed)
  .filter(symbol => glyphs.has(symbol)).map(symbol => glyphs.get(symbol));
assert.deepEqual(originalGlyphStream.slice(0, 12956), originalUnknown);
const joined = transcribed.replace(/\/\r?\n/g, '').replace(/%\r?\n/g, '')
  .replace(/\r?\n/g, '');
let originalOffset = 0;
const originalWords = [];
for (const fragment of joined.split(/[-.&$]/)) {
  const tokens = Array.from(fragment)
    .filter(symbol => glyphs.has(symbol)).map(symbol => glyphs.get(symbol));
  if (tokens.length && originalOffset < originalUnknown.length) {
    originalWords.push(tokens);
    originalOffset += tokens.length;
  }
}
assert.equal(originalOffset, 12956);
assert.equal(originalWords.length, 2896);
const singletons = originalWords.filter(word => word.length === 1).map(word => word[0]);
assert.equal(singletons.length, 83);
const seenSingles = new Set(singletons);
assert.deepEqual(Array.from({length: 29}, (_, i) => i)
  .filter(i => !seenSingles.has(i)), [5]); // only C never stands alone

const longWordFinalI = originalWords.filter(word => word.length > 1
  && word.at(-1) === 10).length;
const longWordFinalC = originalWords.filter(word => word.length > 1
  && word.at(-1) === 5).length;
assert.equal(longWordFinalI, 96);
assert.equal(longWordFinalC, 91);

// All six possible 27-cube bypass pairs after the exact native-singleton
// restriction. Include C because it never occurs as an original singleton.
const allowed = [3,5,10,24]; // O,C,I,A
const singletonCompatiblePairs = [];
for (let i = 0; i < allowed.length; i++) {
  for (let j = i + 1; j < allowed.length; j++) {
    singletonCompatiblePairs.push(allowed[i] + ',' + allowed[j]);
  }
}
const p0CountCompatible = allPairByWriter.map(set =>
  singletonCompatiblePairs.filter(pair => set.has(pair)));
assert.deepEqual(p0CountCompatible, [[], ['5,10']]);

// A further key-independent invariant: if rune I is literally unchanged,
// its word-final placements cannot move or be changed by ANY secret cube.
// Compare the 96 original long-word-final I with every 2,896-word rolling
// native-prose window. This is descriptive corpus evidence, not a proof
// about all possible original English authoring styles or Latin vocabulary.
const longTailControl = [];
for (const [name, source] of controls) {
  const englishWords = (source.toUpperCase().match(/[A-Z]+/g) || [])
    .map(word => gpEncode(word, true)).filter(word => word.length);
  assert.ok(englishWords.length >= originalWords.length);
  const suffixI = englishWords.map(word => Number(word.length > 1
    && word.at(-1) === 10));
  const n = originalWords.length;
  let sum = suffixI.slice(0, n).reduce((a, b) => a + b, 0);
  let max = -1;
  let matching96 = 0;
  for (let i = 0; i + n <= suffixI.length; i++) {
    max = Math.max(max, sum);
    if (sum === longWordFinalI) matching96++;
    if (i + n < suffixI.length) sum += suffixI[i+n] - suffixI[i];
  }
  assert.equal(matching96, 0);
  longTailControl.push({name, englishWords: englishWords.length,
    complete2896WordWindows: englishWords.length - n + 1,
    maxLongWordFinalI: max, matchingOriginalLongWordFinalI: matching96});
}
assert.deepEqual(longTailControl.map(x => x.maxLongWordFinalI), [0,62,7]);
// Independent non-English original-register competitor: already normalized
// word-preserving GP29 Vulgate. If plaintext is Latin, standalone O/A/I are
// possible, so the singleton screen alone still admits the same six pairs.
// Search the entire source without translating or fitting a key.
const vulgateAlphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const latinWords = read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/).map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))
  .map(line => Array.from(line, symbol => {
    const index = vulgateAlphabet.indexOf(symbol);
    assert.ok(index >= 0 && index < 29, 'Latin GP digit not recognized');
    return index;
  }));
assert.equal(latinWords.length, 39835);
const latinStream = latinWords.flat();
assert.equal(latinStream.length, 204802);
const latin729 = histogram(latinStream.slice(0, 729));
const latinPairs = new Map(singletonCompatiblePairs.map(pair => [pair, 0]));
for (let i = 0; i + 729 <= latinStream.length; i++) {
  for (const pair of singletonCompatiblePairs) {
    const [u, v] = pair.split(',').map(Number);
    if (latin729[u] === originalHistogram[u]
      && latin729[v] === originalHistogram[v]) {
      latinPairs.set(pair, latinPairs.get(pair) + 1);
    }
  }
  if (i + 729 < latinStream.length) {
    latin729[latinStream[i]]--;
    latin729[latinStream[i + 729]]++;
  }
}
const latinSurvivingPairs = [...latinPairs].filter(([, count]) => count > 0);
assert.deepEqual(latinSurvivingPairs, [['3,5', 15]]);
const wordStartC = originalWords.filter(word => word[0] === 5).length;
assert.deepEqual([longWordFinalC, wordStartC], [91,95]);
const latinTailC = latinWords.map(word => +(word.length > 1 && word.at(-1) === 5));
const latinStartC = latinWords.map(word => +(word[0] === 5));
let suffix = latinTailC.slice(0, 2896).reduce((a,b) => a+b, 0);
let prefix = latinStartC.slice(0, 2896).reduce((a,b) => a+b, 0);
let minPrefix = Infinity, maxSuffix = -Infinity;
let matchingOriginalCWordPositions = 0;
for (let i = 0; i + 2896 <= latinWords.length; i++) {
  minPrefix = Math.min(minPrefix, prefix);
  maxSuffix = Math.max(maxSuffix, suffix);
  if (prefix === wordStartC && suffix === longWordFinalC) {
    matchingOriginalCWordPositions++;
  }
  if (i + 2896 < latinWords.length) {
    prefix += latinStartC[i+2896] - latinStartC[i];
    suffix += latinTailC[i+2896] - latinTailC[i];
  }
}
assert.deepEqual([minPrefix, maxSuffix, matchingOriginalCWordPositions],
  [274, 73, 0]);
console.log(JSON.stringify({
  nativeLatin: {
    source: 'Pinned word-preserving Vulgate GP29',
    latinGP: latinStream.length, complete729RuneWindows: latinStream.length - 728,
    singletonCompatiblePairsPassing729: latinSurvivingPairs
      .map(([pair, count]) => ({pair:pair.split(',')
        .map(x=>corpus.translit[Number(x)]).join('/'), windows:count})),
    wholeBookLatin2896WordWindows: latinWords.length - 2896 + 1,
    originalCWordStarts: wordStartC, latinMinCWordStarts: minPrefix,
    originalLongWordCFinal:longWordFinalC, latinMaxLongWordCFinal:maxSuffix,
    fullNativeWordPositionMatches:matchingOriginalCWordPositions
  },
  decision: 'Only O/C of six source-singleton-compatible transparent pairs survives the opening Latin source frequency gate, and O/C fails exact original word-start and terminal C registers in every native-Latin source window.'
}, null, 2));

// Historically plausible third language: the manuscript uses Anglo-Saxon
// Futhorc glyphs, so examine the fixed source-native Old English Beowulf
// profile. Its real GP29 poem word breaks and 48,012 source runes are pinned.
const beowulf = JSON.parse(read('resources/control/beowulf_oe_gp_profile_corrected.json'));
assert.equal(beowulf.schema, 2);
const angloAlphabet = beowulf.positiveControlAlphabet;
const angloStream = Array.from(beowulf.sourceGpBase29, symbol => {
  const value = angloAlphabet.indexOf(symbol);
  assert.ok(value >= 0 && value < 29);
  return value;
});
assert.equal(angloStream.length, 48012);
let angloCursor = 0;
const angloWords = beowulf.allSourceGpWordLengths.map(n => {
  const word = angloStream.slice(angloCursor, angloCursor + n);
  angloCursor += n;
  return word;
});
assert.equal(angloCursor, angloStream.length);
assert.equal(angloWords.length, 10885);
const englishSingletonWordLabels = new Set(angloWords.filter(w=>w.length===1).map(w=>w[0]));
assert.deepEqual([...englishSingletonWordLabels].sort((a,b)=>a-b), [6,23,24,28]);
const oldCompatible = Array.from({length:29}, (_, i) => i)
  .filter(i => !seenSingles.has(i) || englishSingletonWordLabels.has(i));
assert.deepEqual(oldCompatible, [5,6,23,24,28]);
const oldPairCounts = [];
for (let i=0; i<oldCompatible.length; i++) {
  for(let j=i+1; j<oldCompatible.length; j++) {
    oldPairCounts.push({u:oldCompatible[i],v:oldCompatible[j],matches:0});
  }
}
const oldHistogram = histogram(angloStream.slice(0,729));
for (let i=0; i+729<=angloStream.length; i++) {
  for (const pair of oldPairCounts) {
    if (oldHistogram[pair.u]===originalHistogram[pair.u]
      && oldHistogram[pair.v]===originalHistogram[pair.v]) pair.matches++;
  }
  if (i+729<angloStream.length) {
    oldHistogram[angloStream[i]]--;
    oldHistogram[angloStream[i+729]]++;
  }
}
const oldCandidates = oldPairCounts.filter(p=>p.matches);
assert.deepEqual(oldCandidates.map(p=>[p.u,p.v,p.matches]),
  [[5,6,21],[5,23,6],[6,23,102]]);
const oldWordRegistration = oldCandidates.map(({u,v}) => {
  const labels=[u,v];
  const actual=labels.flatMap(x=>[
    originalWords.filter(w=>w[0]===x).length,
    originalWords.filter(w=>w.length>1&&w.at(-1)===x).length]);
  const flags=angloWords.map(w=>labels.flatMap(x=>[
    +(w[0]===x), +(w.length>1&&w.at(-1)===x)]));
  const N=originalWords.length;
  const counts=Array(4).fill(0);
  for(let i=0;i<N;i++)for(let j=0;j<4;j++)counts[j]+=flags[i][j];
  let closestL1=Infinity, exact=0, minima=Array(4).fill(Infinity),
    maxima=Array(4).fill(-Infinity);
  for(let i=0;i+N<=angloWords.length;i++){
    let distance=0;
    for(let j=0;j<4;j++){
      minima[j]=Math.min(minima[j],counts[j]);
      maxima[j]=Math.max(maxima[j],counts[j]);
      distance+=Math.abs(counts[j]-actual[j]);
    }
    closestL1=Math.min(closestL1,distance);
    if(distance===0)exact++;
    if(i+N<angloWords.length)for(let j=0;j<4;j++)
      counts[j]+=flags[i+N][j]-flags[i][j];
  }
  assert.equal(exact,0);
  return {pair:labels.map(x=>corpus.translit[x]).join('/'),
    originalStartFinal:actual,sourceWindowMin:minima,sourceWindowMax:maxima,
    bestTotalAbsoluteDeviation:closestL1,matchingWholeBookWordWindows:exact};
});
assert.deepEqual(oldWordRegistration.map(x=>x.bestTotalAbsoluteDeviation),
  [280,225,381]);
console.log(JSON.stringify({
  nativeOldEnglish: {
    source:'Pinned source-native Beowulf GP29 poem profile',
    originalCompatibleSingletonSymbols:oldCompatible.map(x=>corpus.translit[x]),
    possibleBypassPairs:oldPairCounts.length,
    complete729RuneWindows:angloStream.length-728,
    firstChapterSurvivors:oldCandidates.map(p=>({
      pair:[p.u,p.v].map(x=>corpus.translit[x]).join('/'),
      matching729RuneWindows:p.matches})),
    complete2896WordWindows:angloWords.length-originalWords.length+1,
    wholeBookPositions:oldWordRegistration
  },
  decision:'All 10 source-original-singleton-compatible literal-bypass pairs fail in the pinned Old English Beowulf register: 7 fail p0 exact runic counts; the 3 remaining pairs disagree with observed long-word-final or initial rune identities in every source window.'
},null,2));

console.log(JSON.stringify({
  wholeManuscript: {unknownRunes:12956, printedWords:2896,
    singletonWords:83, distinctSingletonLabels:seenSingles.size,
    absentSingleton:corpus.translit[5], longFinalI:longWordFinalI,
    longFinalC:longWordFinalC},
  singletonCompatiblePairs: singletonCompatiblePairs
    .map(s => s.split(',').map(x => corpus.translit[Number(x)]).join('/')),
  p0CountCompatiblePairs: p0CountCompatible
    .map(s => s.map(pair => pair.split(',')
      .map(x => corpus.translit[Number(x)]).join('/'))),
  sourceLongIControls: longTailControl,
  decision: 'Across these native-English registers, a fixed literal two-rune bypass used throughout all unknown printed words has no remaining possible pair: C/I alone survives original singleton plus p0 count, but source-native word-final I never reaches original 96. No plaintext recovered.'
}, null, 2));

console.log(JSON.stringify({
  original: {physicalPages: [0,1,2], runeCount: original.length,
    sourceF: originalHistogram[0], sourceEA: originalHistogram[28]},
  nativePositive: {runesRestored: 729, literalControlsConserved: true},
  perRegister: reports, acrossRegisters: unions,
  conclusion: 'Original p0-p2 does not match the two literal control-rune counts of any 729-rune reference passage. Every keyed GP27 Trifid that leaves F and EA literally unchanged is ruled out against the stated native-English corpus windows, all keys/periods/directions. No unknown LP2 plaintext recovered.'
}, null, 2));
