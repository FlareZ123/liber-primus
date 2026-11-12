'use strict';

/**
 * GP29 previous-cipher-state all-secret capacity gate.
 *
 * Test the strongest possible ordinary GP29 symbol-frequency recovery of
 * any chapter-stationary bijective decoder P_i = D_(chapter,C_(i-1))(C_i).
 * For every hidden decoder permutation, the maximal plaintext copies of
 * a chosen m-symbol set are the m most frequent next cipher runes for
 * each observed (chapter,previous cipher rune) state.
 *
 * Original word-boundary flag can optionally be an additional public input.
 * Requires Node.js 22; run:
 *   node sims/lp2_chapter_predecessor_allsecret_capacity_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} filename @returns {string} */
const read = (filename) => fs.readFileSync(path.join(ROOT, filename), 'utf8');
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages = db.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const transcripts = read('resources/lp2-transcription.txt').split('%').slice(0, 55);
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26],
  [27, 32], [33, 39], [40, 53], [54, 55]];
const runeIndex = new Map(db.runes.map((r, i) => [r, i]));
assert.equal(pages.length, 55);
assert.equal(transcripts.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);

/**
 * @typedef {{page:number,chapter:number,q:number,c:number,boundary:boolean}} Transition
 */
/** @type {Transition[]} */
const original = [];
for (let slot = 0; slot < 55; slot++) {
  const physical = slot < 50 ? slot : slot + 1;
  const chars = [...transcripts[slot]];
  /** @type {Array<{r:number,pos:number}>} */
  const positions = [];
  chars.forEach((rune, i) => {
    if (runeIndex.has(rune)) positions.push({r: runeIndex.get(rune), pos: i});
  });
  const source = pages[slot];
  assert.equal(source.page, physical);
  assert.deepEqual(positions.map((p) => p.r), source.indices);
  const chapter = chapters.findIndex(([lo, hi]) => physical >= lo && physical <= hi);
  assert(chapter >= 0);
  for (let i = 1; i < positions.length; i++) {
    const previous = positions[i - 1];
    const current = positions[i];
    const between = chars.slice(previous.pos + 1, current.pos);
    const boundary = between.some((c) => '.-&$§'.includes(c));
    original.push({page: physical, chapter, q: previous.r, c: current.r, boundary});
  }
}
assert.equal(original.length, 12901);
assert.equal(original.filter((r) => r.boundary).length, 2873);

/**
 * Compute an exact all-secret upper bound by granting each observable state
 * an entirely arbitrary secret GP29 permutation, independently per state.
 *
 * @param {Transition[]} stream
 * @param {Array<keyof Transition>} stateFields
 * @param {number} alphabetSubsetSize
 * @returns {{transitions:number,states:number,capacityTransitions:number,
 *    capacityIncludingPageStarts:number}}
 */
function capacity(stream, stateFields, alphabetSubsetSize) {
  /** @type {Map<string,number[]>} */
  const histograms = new Map();
  for (const record of stream) {
    const key = stateFields.map((field) => String(record[field])).join(':');
    if (!histograms.has(key)) histograms.set(key, Array(29).fill(0));
    histograms.get(key)[record.c]++;
  }
  let maximum = 0;
  for (const histogram of histograms.values()) {
    maximum += histogram.slice().sort((a, b) => b - a)
      .slice(0, alphabetSubsetSize).reduce((a, b) => a + b, 0);
  }
  // An optimistic allowance: every original physical page's initial rune
  // is wholly unconstrained, even if the real cipher carries chapter state.
  return {transitions: stream.length, states: histograms.size,
    capacityTransitions: maximum, capacityIncludingPageStarts: maximum + 55};
}

const observed = {
  globalOne: capacity(original, ['q'], 1),
  globalTwo: capacity(original, ['q'], 2),
  globalBoundaryOne: capacity(original, ['q', 'boundary'], 1),
  globalBoundaryTwo: capacity(original, ['q', 'boundary'], 2),
  chapterOne: capacity(original, ['chapter', 'q'], 1),
  chapterTwo: capacity(original, ['chapter', 'q'], 2),
  chapterBoundaryOne: capacity(original, ['chapter', 'q', 'boundary'], 1),
  chapterBoundaryTwo: capacity(original, ['chapter', 'q', 'boundary'], 2),
  pageOne: capacity(original, ['page', 'q'], 1),
  pageTwo: capacity(original, ['page', 'q'], 2)
};
assert.deepEqual(Object.fromEntries(Object.entries(observed)
  .map(([name, value]) => [name, value.capacityIncludingPageStarts])), {
  globalOne: 769, globalTwo: 1414,
  globalBoundaryOne: 854, globalBoundaryTwo: 1562,
  chapterOne: 1310, chapterTwo: 2344,
  chapterBoundaryOne: 1635, chapterBoundaryTwo: 2885,
  pageOne: 2790, pageTwo: 4787
});
assert.deepEqual([
  observed.chapterOne.states, observed.chapterBoundaryOne.states,
  observed.pageOne.states
], [261, 521, 1590]);

// Original runic chapter lengths and separate exact frequency budgets.
// Grant every physical page's initial rune completely unconstrained.
const chapterLengths=Array(chapters.length).fill(0);
const chapterStarts=Array(chapters.length).fill(0);
for(const p of pages){
  const chapter=chapters.findIndex(([a,b])=>p.page>=a&&p.page<=b);
  assert(chapter>=0); chapterLengths[chapter]+=p.indices.length;
  chapterStarts[chapter]++;
}
assert.deepEqual(chapterLengths,[729,1145,1729,1903,1021,1433,1680,3008,308]);
const chapterOffsets=chapterLengths.map((_,i)=>chapterLengths.slice(0,i).reduce((a,b)=>a+b,0));
assert.equal(chapterOffsets[7],9640);
const chapterBoundary=chapters.map((_,chapter)=>{
  const subset=original.filter((row)=>row.chapter===chapter);
  return {chapter,offset:chapterOffsets[chapter],runes:chapterLengths[chapter],
    pageStarts:chapterStarts[chapter],
    maxOne:capacity(subset,['q','boundary'],1).capacityTransitions+chapterStarts[chapter],
    maxTwo:capacity(subset,['q','boundary'],2).capacityTransitions+chapterStarts[chapter]};
});
assert.deepEqual(chapterBoundary.map((c)=>[c.maxOne,c.maxTwo]),
  [[119,215],[167,292],[205,364],[226,401],[141,247],
    [183,322],[209,365],[300,537],[85,142]]);

const tokens = db.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/**
 * Match the pinned existing source-native control normalization without
 * introducing unknown plaintext symbols.
 *
 * @param {string} source
 * @returns {number[]}
 */
function encodeNativeGp(source) {
  const normalized = source.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const symbols = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const t = tokens.find((item) => word.startsWith(item.token, i));
      assert(t, 'Unmapped source word: ' + word.slice(i));
      symbols.push(t.index);
      i += t.token.length;
    }
  }
  return symbols;
}
const E = db.translit.indexOf('E');
const O = db.translit.indexOf('O');
const N = 12956;
const controlSources = [
  {name: 'Shakespeare', filename: 'resources/control/shakespeare_first300k.txt',
    length: 218800, windows: 32},
  {name: 'Gibran', filename: 'resources/control/gibran_prophet_58585.txt',
    length: 63114, windows: 8},
  {name: 'Emerson', filename: 'resources/control/emerson_essays_2944.txt',
    length: 324630, windows: 49}
];
/**
 * Exhaust all original-length consecutive native-GP source windows.
 * Every chapter must meet its own secret-table E and E+O bound;
 * loop reuses rolling counters, avoiding quadratic cost.
 * @param {number[]} all
 * @returns {{windows:number,chapter7EOpass:number,passesNineChapterEandEO:number,firstCompatibleOffsets:number[]}}
 */
const originalOffsets=[];
let absolute=0;
for(const p of pages){
  for(let i=1;i<p.indices.length;i++)originalOffsets.push(absolute+i);
  absolute+=p.indices.length;
}
assert.equal(absolute,N);
assert.equal(originalOffsets.length,original.length);
/**
 * Check the exact existence of arbitrary secret 29! substitution tables at
 * each original (chapter,previous-cipher rune,printed word-boundary) state.
 * @param {number[]} source Native GP sequence.
 * @param {number} start Candidate source rune offset.
 * @param {typeof original} rows Original or planted observed transitions.
 * @returns {{compatible:boolean,firstConflict:number|null}}
 */
function exactBijection(source,start,rows){
  const tables=new Map();
  for(let j=0;j<rows.length;j++){
    const r=rows[j],k=r.chapter+':'+r.q+':'+Number(r.boundary);
    let v=tables.get(k);
    if(!v){v={f:new Map(),inverse:new Map()};tables.set(k,v);}
    const p=source[start+originalOffsets[j]];
    if(v.f.has(r.c)&&v.f.get(r.c)!==p)
      return {compatible:false,firstConflict:originalOffsets[j]};
    if(v.inverse.has(p)&&v.inverse.get(p)!==r.c)
      return {compatible:false,firstConflict:originalOffsets[j]};
    v.f.set(r.c,p);v.inverse.set(p,r.c);
  }
  return {compatible:true,firstConflict:null};
}

function screenEveryWindow(all){
  const e=chapterLengths.map(()=>0),eo=chapterLengths.map(()=>0);
  for(let ch=0;ch<chapterLengths.length;ch++){
    for(let i=chapterOffsets[ch];i<chapterOffsets[ch]+chapterLengths[ch];i++){
      if(all[i]===E)e[ch]++;
      if(all[i]===E||all[i]===O)eo[ch]++;
    }
  }
  const result={windows:all.length-N+1,chapter7EOpass:0,
    passesNineChapterEandEO:0,firstCompatibleOffsets:[],passesExactBijection:0,lastContradiction:null};
  for(let start=0;start+N<=all.length;start++){
    let valid=true;
    for(let ch=0;ch<chapterLengths.length;ch++){
      if(e[ch]>chapterBoundary[ch].maxOne||eo[ch]>chapterBoundary[ch].maxTwo)valid=false;
    }
    if(eo[7]<=chapterBoundary[7].maxTwo)result.chapter7EOpass++;
    if(valid){
      result.passesNineChapterEandEO++;
      if(result.firstCompatibleOffsets.length<5)result.firstCompatibleOffsets.push(start);
      const v=exactBijection(all,start,original);
      if(v.compatible)result.passesExactBijection++;
      else result.lastContradiction=v;
    }
    if(start+N<all.length){
      for(let ch=0;ch<chapterLengths.length;ch++){
        const a=all[start+chapterOffsets[ch]];
        const b=all[start+chapterOffsets[ch]+chapterLengths[ch]];
        if(a===E)e[ch]--;if(a===E||a===O)eo[ch]--;
        if(b===E)e[ch]++;if(b===E||b===O)eo[ch]++;
      }
    }
  }
  return result;
}

/**
 * Exhaust every possible 262-rune native excerpt as the original physical
 * page0 plaintext. Page-local secret tables are completely unconstrained:
 * later page keys, resets, chapters and plaintext elsewhere cannot help.
 * @param {number[]} nativeGp
 * @returns {{windows:number,compatible:number,firstFailuresMin:number,firstFailuresMax:number}}
 */
function firstPageEveryWindow(nativeGp){
  const sourceRows=original.slice(0,pages[0].indices.length-1);
  assert.equal(sourceRows.length,261);
  const out={windows:nativeGp.length-261,compatible:0,
    firstFailuresMin:Infinity,firstFailuresMax:-1};
  for(let start=0;start+262<=nativeGp.length;start++){
    const candidate=exactBijection(nativeGp,start,sourceRows);
    if(candidate.compatible)out.compatible++;
    else{
      out.firstFailuresMin=Math.min(out.firstFailuresMin,candidate.firstConflict);
      out.firstFailuresMax=Math.max(out.firstFailuresMax,candidate.firstConflict);
    }
  }
  return out;
}

let samplePlaintext = null;
const controls = [];
for (const control of controlSources) {
  const all = encodeNativeGp(read(control.filename));
  assert.equal(all.length, control.length);
  /** @type {Array<{e:number,eo:number,localE:number,localEO:number}>} */
  const windows = [];
  for (let start = 0; start + N <= all.length; start += Math.floor(N / 2)) {
    const native = all.slice(start, start + N);
    if (samplePlaintext === null) samplePlaintext = native;
    const e = native.filter((i) => i === E).length;
    const eo = native.filter((i) => i === E || i === O).length;
    const local=native.slice(chapterOffsets[7],chapterOffsets[7]+chapterLengths[7]);
    const localE=local.filter((i)=>i===E).length;
    const localEO=local.filter((i)=>i===E||i===O).length;
    windows.push({e,eo,localE,localEO});
  }
  assert.equal(windows.length, control.windows);
  controls.push({author: control.name, windows: windows.length,
    minimumE: Math.min(...windows.map((v) => v.e)),
    minimumEplusO: Math.min(...windows.map((v) => v.eo)),
    allExceedChapterOne: windows.every((v) =>
      v.e > observed.chapterOne.capacityIncludingPageStarts),
    allExceedChapterTwo: windows.every((v) =>
      v.eo > observed.chapterTwo.capacityIncludingPageStarts),
    minimumChapter40_53E:Math.min(...windows.map((v)=>v.localE)),
    minimumChapter40_53EplusO:Math.min(...windows.map((v)=>v.localEO)),
    allExceedBoundaryChapter7:windows.every((v)=>v.localEO>chapterBoundary[7].maxTwo),
    exhaustive:screenEveryWindow(all),firstPage:firstPageEveryWindow(all)});
}
assert.deepEqual(controls.map((c) => [c.minimumE, c.minimumEplusO]),
  [[1430, 2471], [1437, 2608], [1491, 2464]]);
assert(controls.every((c)=>c.allExceedChapterOne && c.allExceedChapterTwo &&
  c.allExceedBoundaryChapter7));
assert.deepEqual(controls.map((c)=>[c.minimumChapter40_53E,c.minimumChapter40_53EplusO]),
  [[298,539],[320,577],[325,549]]);
assert.deepEqual(controls.map((c)=>[c.exhaustive.windows,
  c.exhaustive.chapter7EOpass,c.exhaustive.passesNineChapterEandEO]),
  [[205845,2202,52],[50159,0,0],[311675,0,0]]);
assert(controls.every((c)=>c.exhaustive.passesExactBijection===0));
assert.deepEqual(controls.map((c)=>[c.firstPage.windows,c.firstPage.compatible,
  c.firstPage.firstFailuresMax]),
  [[218539,0,69],[62853,0,63],[324369,0,69]]);
assert.equal(controls.reduce((sum, c) => sum + c.windows, 0), 89);

// Independently corrected full Old English Beowulf GP control.
const beowulf=JSON.parse(read('resources/control/beowulf_oe_gp_profile_corrected.json'));
const alphabet=beowulf.positiveControlAlphabet;
const beowulfSource=Array.from(beowulf.sourceGpBase29,(symbol)=>alphabet.indexOf(symbol));
assert.equal(beowulfSource.length,48012);
assert(beowulfSource.every((i)=>i>=0&&i<29));
const beowulfPlant=Array.from(beowulf.positiveControlGpBase29,
  (symbol)=>alphabet.indexOf(symbol));
assert.equal(beowulfPlant.length,N);
const beowulfLocal=beowulfPlant.slice(chapterOffsets[7],
  chapterOffsets[7]+chapterLengths[7]);
const beowulfLocalE=beowulfLocal.filter((i)=>i===E).length;
const beowulfLocalEO=beowulfLocal.filter((i)=>i===E||i===O).length;
assert.deepEqual([beowulfLocalE,beowulfLocalEO],[354,541]);
const beowulfExhaustive=screenEveryWindow(beowulfSource);
assert.deepEqual([beowulfExhaustive.windows,beowulfExhaustive.chapter7EOpass,
  beowulfExhaustive.passesNineChapterEandEO],[35057,33170,0]);
assert.equal(beowulfExhaustive.passesExactBijection,0);
const beowulfFirstPage=firstPageEveryWindow(beowulfSource);
assert.deepEqual([beowulfFirstPage.windows,beowulfFirstPage.compatible,
  beowulfFirstPage.firstFailuresMax],[47751,0,69]);

// Full secret-key positive plant: all 9*29 inverse tables are independent
// secret permutations. Recover complete native GP English, including all 55
// physical page start positions, and verify the all-secret bound holds.
/** @type {number} */
let seed = 0x3301c7a9;
/** @returns {number} */
function randomUint32() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
/** @returns {number[]} */
function randomPermutation() {
  const p = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = randomUint32() % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}
const secretForward = Array.from({length: chapters.length},
  () => Array.from({length: 29}, () => randomPermutation()));
const secretInverse = secretForward.map((byPrevious) => byPrevious.map((perm) => {
  const inverse = Array(29);
  perm.forEach((cipher, plaintext) => { inverse[cipher] = plaintext; });
  return inverse;
}));
const planted = [];
const recovered = [];
let offset = 0;
for (const p of pages) {
  const chapter = chapters.findIndex(([lo, hi]) => p.page >= lo && p.page <= hi);
  const plain = samplePlaintext.slice(offset, offset + p.indices.length);
  assert(plain.length > 0);
  const enc = [plain[0]];
  const dec = [enc[0]];
  for (let i = 1; i < plain.length; i++) {
    const previous = enc[i - 1];
    const cipher = secretForward[chapter][previous][plain[i]];
    enc.push(cipher);
    dec.push(secretInverse[chapter][previous][cipher]);
  }
  assert.deepEqual(dec, plain);
  planted.push(...enc);
  recovered.push(...dec);
  offset += plain.length;
}
assert.equal(offset, N);
assert.deepEqual(recovered, samplePlaintext);

// Exact model-positive GP29 plant: 9 chapters * 29 predecessor runes *
// 2 printed-boundary bits, each with a completely secret 29! permutation.
const boundaryTables=Array.from({length:9},()=>Array.from({length:29},
  ()=>[randomPermutation(),randomPermutation()]));
const boundaryPlain=[],boundaryCipher=[],boundaryRows=[];
let plantOffset=0,step=0;
for(const pg of pages){
  const p=samplePlaintext.slice(plantOffset,plantOffset+pg.indices.length);
  const ciphertext=[p[0]],decrypted=[p[0]];
  for(let i=1;i<p.length;i++){
    const originalRow=original[step++];
    const previous=ciphertext[i-1],bit=Number(originalRow.boundary);
    const perm=boundaryTables[originalRow.chapter][previous][bit];
    const encrypted=perm[p[i]];
    ciphertext.push(encrypted);
    decrypted.push(perm.indexOf(encrypted));
    boundaryRows.push({...originalRow,q:previous,c:encrypted});
  }
  assert.deepEqual(decrypted,p);
  boundaryPlain.push(...decrypted);boundaryCipher.push(...ciphertext);
  plantOffset+=pg.indices.length;
}
assert.equal(plantOffset,N);assert.equal(step,original.length);
assert.deepEqual(boundaryPlain,samplePlaintext);
assert(exactBijection(samplePlaintext,0,boundaryRows).compatible);
assert(exactBijection(samplePlaintext,0,boundaryRows.slice(0,261)).compatible);

const plantedRecords = [];
let k = 0;
let start = 0;
for (const p of pages) {
  const cipherPage = planted.slice(start, start + p.indices.length);
  for (let i = 1; i < cipherPage.length; i++) {
    const evidence = original[k++];
    plantedRecords.push({...evidence, q: cipherPage[i - 1], c: cipherPage[i]});
  }
  start += p.indices.length;
}
assert.equal(k, original.length);
assert.equal(start, N);
const plantedE = samplePlaintext.filter((i) => i === E).length;
const plantedEO = samplePlaintext.filter((i) => i === E || i === O).length;
const plantedCapE = capacity(plantedRecords, ['chapter', 'q'], 1)
  .capacityIncludingPageStarts;
const plantedCapEO = capacity(plantedRecords, ['chapter', 'q'], 2)
  .capacityIncludingPageStarts;
assert(plantedCapE >= plantedE && plantedCapEO >= plantedEO);

console.log('PASS: original 12,956 GP29 runes, 12,901 page-internal transitions,');
console.log('all-secret 9-chapter previous-cipher-state capacity, 89 native-GP');
console.log('controls, original word-boundary contrast, and complete 12,956-rune plant.');
console.log(JSON.stringify({observed,chapterBoundary,controls,
  beowulf:{beowulfLocalE,beowulfLocalEO,exhaustive:beowulfExhaustive,
    firstPage:beowulfFirstPage},
  positivePlant: {
  recoveredSymbols: recovered.length,boundaryRecoveredSymbols:boundaryPlain.length,
  plantedE, plantedEO,
  plantedCapE, plantedCapEO, exactRoundtrip: true
}, decision: 'All 653512 exact-length 262-rune native excerpts across four independent corpora fail page0 predecessor+printed-boundary bijection consistency, with a first contradiction by original rune69. Even arbitrary independent secret alphabet tables on later pages cannot repair page0. The positive full-length 522-row source GP plant passes. No unknown plaintext recovered.'}, null, 2));
