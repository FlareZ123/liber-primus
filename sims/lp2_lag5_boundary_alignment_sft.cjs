'use strict';
/**
 * Source-rune-frozen word-boundary alignment test for the LP2 lag-five echoes.
 * SFT: node sims/lp2_lag5_boundary_alignment_sft.cjs
 * Original source bytes are never modified; independently planted data is
 * used only as a positive detector control.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/lp2-transcription.txt')
  .split('%').slice(0,55).join('%').replace(/\/\r?\n/g, '').replace(/[\r\n%]/g,'');
const rx = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const words = (transcription.match(rx) || [])
  .map(w => [...w].map(r => gp.runes.indexOf(r)));
const originalRunes = words.flat();
assert.equal(originalRunes.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(originalRunes, gp.pages.slice(0,56).flatMap(p => p.indices));
const N = originalRunes.length;
const originalBreaks = [];
let offset = 0;
for(let i = 0; i < words.length-1; i++) {
  offset += words[i].length;
  originalBreaks.push(offset);
}
const breakSet = new Set(originalBreaks);
const chapterEnds = [729,1874,3603,5506,6527,7960,9640,12648,12956];
const chapterWords = Array.from({length:9}, () => []);
offset = 0;
for(const word of words) {
  const chapter = chapterEnds.findIndex(e => e > offset);
  assert(chapter >= 0);
  assert(offset + word.length <= chapterEnds[chapter]);
  chapterWords[chapter].push(word.length);
  offset += word.length;
}
assert.deepEqual(chapterWords.map(a => a.length),
  [158,255,383,437,224,326,378,669,66]);

// Pages: 55 rune-bearing originals; p50 is a 256-byte numeric table.
const pageLengths = gp.pages.slice(0,56).filter(p => p.indices.length)
  .map(p => p.indices.length);
assert.equal(pageLengths.length, 55);
const pageDefinitions = [];
let pageStart = 0;
for(const width of pageLengths) {
  const end = pageStart + width;
  const cuts = [pageStart, ...originalBreaks.filter(x => x > pageStart && x < end), end];
  const lengths = cuts.slice(1).map((x, i) => x - cuts[i]);
  pageDefinitions.push({
    start: pageStart, end, lengths,
    startCarry: pageStart > 0 && !breakSet.has(pageStart),
    endCarry: end < N && !breakSet.has(end),
    hasEndBreak: breakSet.has(end),
  });
  pageStart = end;
}
assert.equal(pageStart, N);
assert.equal(pageDefinitions.filter(p => p.endCarry).length, 32);
assert.equal(pageDefinitions.filter(p => p.hasEndBreak && p.end < N).length, 22);

const FIRST_LAG = 2, LAST_LAG = 10;
function makePrefix(runes) {
  const single = [], adjacentPair = [];
  for(let lag = FIRST_LAG; lag <= LAST_LAG; lag++) {
    const a = new Uint32Array(N+1);
    const b = new Uint32Array(N+1);
    for(let i = 0; i < N; i++) {
      a[i+1] = a[i] + Number(i >= lag && runes[i] === runes[i-lag]);
      b[i+1] = b[i] + Number(i > lag &&
        runes[i] === runes[i-lag] && runes[i-1] === runes[i-lag-1]);
    }
    single[lag] = a;
    adjacentPair[lag] = b;
  }
  return { single, adjacentPair };
}
function count(breaks, prefix) {
  const single = Array(LAST_LAG+1).fill(0);
  const adjacentPair = Array(LAST_LAG+1).fill(0);
  let start = 0;
  for(const end of [...breaks, N]) {
    const len = end - start;
    assert(len > 0);
    for(let lag = FIRST_LAG; lag <= LAST_LAG; lag++) {
      if(len > lag) {
        single[lag] += prefix.single[lag][end] - prefix.single[lag][start + lag];
        if(len > lag + 1) {
          adjacentPair[lag] += prefix.adjacentPair[lag][end] -
            prefix.adjacentPair[lag][start + lag + 1];
        }
      }
    }
    start = end;
  }
  assert.equal(start, N);
  return { single, adjacentPair };
}
const prefix = makePrefix(originalRunes);
const original = count(originalBreaks, prefix);
assert.equal(original.single[5], 104);
assert.equal(original.adjacentPair[5], 9);

let rngState = 0x43ca7711;
function random() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return rngState >>> 0;
}
function shuffle(a, first = 0, end = a.length) {
  for(let j = end-1; j > first; j--) {
    const k = first + (random() % (j-first+1));
    [a[j], a[k]] = [a[k], a[j]];
  }
  return a;
}
/** Permute the original complete-word length multiset inside nine visible chapters. */
function chapterShuffle() {
  const breaks = [];
  let pos = 0;
  for(const group of chapterWords) {
    for(const len of shuffle(group.slice())) {
      pos += len;
      if(pos < N) breaks.push(pos);
    }
  }
  assert.equal(breaks.length, 2895);
  return breaks;
}
/** Preserve page length, number of word fragments, fixed page-break/carry,
 * and both pieces of every page-carried word. Shuffle only full interior
 * page-words, with all source runes and original physical page offsets fixed.
 */
function pageShuffle() {
  const breaks = [];
  for(const page of pageDefinitions) {
    const seg = page.lengths.slice();
    shuffle(seg, Number(page.startCarry), seg.length - Number(page.endCarry));
    let pos = page.start;
    for(let i = 0; i < seg.length-1; i++) {
      pos += seg[i];
      breaks.push(pos);
    }
    if(page.hasEndBreak) breaks.push(page.end);
  }
  assert.equal(breaks.length, 2895);
  return breaks;
}
const train = 2000, test = 5000;
function moments(x) {
  const mean = x.reduce((a,b)=>a+b,0)/x.length;
  const sd = Math.sqrt(x.reduce((a,b)=>a+(b-mean)**2,0)/(x.length-1));
  assert(sd > 0);
  return { mean, sd };
}
function runNull(label, generator, seed) {
  rngState = seed >>> 0;
  const trainSingle = Array.from({length: LAST_LAG+1}, () => []);
  const trainPair = Array.from({length: LAST_LAG+1}, () => []);
  for(let t = 0; t < train; t++) {
    const x = count(generator(), prefix);
    for(let lag = FIRST_LAG; lag <= LAST_LAG; lag++) {
      trainSingle[lag].push(x.single[lag]);
      trainPair[lag].push(x.adjacentPair[lag]);
    }
  }
  const mSingle = trainSingle.map((x,i) =>
    i >= FIRST_LAG ? moments(x) : null);
  const mPair = trainPair.map((x,i) =>
    i >= FIRST_LAG && i <= 7 ? moments(x) : null);
  const obsSingleZ = Array.from({length: LAST_LAG-1}, (_,j) => {
    const l=j+FIRST_LAG, m=mSingle[l];
    return (original.single[l] - m.mean) / m.sd;
  });
  const obsPairZ = Array.from({length:6}, (_,j) => {
    const l=j+FIRST_LAG, m=mPair[l];
    return (original.adjacentPair[l] - m.mean) / m.sd;
  });
  const maxSingle = Math.max(...obsSingleZ.map(z => Math.abs(z)));
  const maxPair = Math.max(...obsPairZ);
  let fixedSingleHits = 0, fixedPairHits = 0, familySingleHits = 0, familyPairHits = 0;
  for(let t = 0; t < test; t++) {
    const x = count(generator(), prefix);
    if(x.single[5] >= original.single[5]) fixedSingleHits++;
    if(x.adjacentPair[5] >= original.adjacentPair[5]) fixedPairHits++;
    let familyMaxS = 0, familyMaxP = -Infinity;
    for(let lag=FIRST_LAG;lag<=LAST_LAG;lag++) {
      const m=mSingle[lag], z=(x.single[lag]-m.mean)/m.sd;
      familyMaxS=Math.max(familyMaxS, Math.abs(z));
      if(lag<=7) {
        const mp=mPair[lag],zp=(x.adjacentPair[lag]-mp.mean)/mp.sd;
        familyMaxP=Math.max(familyMaxP,zp);
      }
    }
    if(familyMaxS >= maxSingle) familySingleHits++;
    if(familyMaxP >= maxPair) familyPairHits++;
  }
  return {
    label, sourceRngSeed: '0x'+seed.toString(16),
    randomizedData: 'word separator positions only; rune order fixed',
    trainingBooks: train, testBooks: test,
    lagFiveSingle: {
      original: original.single[5], mean:mSingle[5].mean, sd:mSingle[5].sd,
      z:obsSingleZ[3], upperHits:fixedSingleHits,
      upperP:(fixedSingleHits+1)/(test+1),
    },
    lagFiveAdjacentPairs: {
      original: original.adjacentPair[5], mean:mPair[5].mean, sd:mPair[5].sd,
      z:obsPairZ[3], upperHits:fixedPairHits,
      upperP:(fixedPairHits+1)/(test+1),
    },
    singleFamilyLags: [2,3,4,5,6,7,8,9,10],
    singleFamilyMaxAbsZ: maxSingle, singleFamilyTail:familySingleHits,
    singleFamilyP:(familySingleHits+1)/(test+1),
    pairFamilyLags:[2,3,4,5,6,7],
    pairFamilyMaxZ:maxPair,pairFamilyTail:familyPairHits,
    pairFamilyP:(familyPairHits+1)/(test+1),
    allSingleZ:obsSingleZ,
    allPairZ:obsPairZ,
  };
}
// End-to-end source invariance under a deterministic no-op shuffle:
// compare counts with the original unchanged word lengths and page cuts.
assert.deepEqual(count(originalBreaks, prefix), original);
const chapter = runNull('nine source chapters, same original word-length multiset',
  chapterShuffle,0x436a5501);
const page = runNull('55 original pages, exact carry and edge fragments',
  pageShuffle,0x43ca7711);
assert(chapter.lagFiveSingle.z > 2.5);
assert(page.lagFiveSingle.z > 2.5);
// Planted dependence: overwrite three five-back outputs inside each original
// length>=8 word. A correct word-aware detector sees the planted pairs.
const plant = originalRunes.slice();
let start=0, plantedWords=0;
for(const w of words) {
  if(w.length >= 8) {
    for(let j=5;j<8;j++) plant[start+j] = plant[start+j-5];
    plantedWords++;
  }
  start += w.length;
}
const planted = count(originalBreaks, makePrefix(plant));
assert(planted.adjacentPair[5] >= plantedWords*2);
assert(planted.adjacentPair[5] > original.adjacentPair[5]+100);
console.log(JSON.stringify({
  decision: 'word-boundary positions correlate with fixed original lag-five rune echoes under two original-length-preserving nulls',
  originalWords:words.length,originalRunes:N,
  originalSourceLagFiveHits:original.single[5],
  originalSourceLagFiveAdjacentPairs:original.adjacentPair[5],
  positivePlant:{ wordsModified:plantedWords,
    lagFivePairs:planted.adjacentPair[5], allOriginalRunesUnchangedInMainTest:true },
  chapter, page, unknownPlaintextRecovered:0,
}, null, 2));
