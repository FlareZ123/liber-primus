#!/usr/bin/env node
'use strict';

/**
 * Whole-source familywise null for LP2 merged-punctuation wordlength bags.
 *
 * Original question: after screening all contiguous windows in five fixed
 * source corpora, how surprising is any exact 26+-word multiset match when
 * every original word length is globally shuffled, preserving all 175 span
 * sizes, 2,896 total word lengths, and the full search procedure?
 *
 * Windows: node sims/lp2_sourcebag_global_multiset_null_sft.cjs
 * Deterministic, read-only, single-file CommonJS test.
 */
const assert = require('node:assert/strict');
const {originalSpans, sources, key} =
  require('./lp2_two_sentence_sourcebag_crib_sft.cjs');
const {mix, hash, hashKey} =
  require('./lp2_sliding_merged_sentence_bag_sft.cjs');

const TRIALS = 2000;
const SEED = 0x20143301;

/** @param {number} seed @returns {()=>number} */
function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
/**
 * Fisher-Yates with rejection sampling for unbiased bounded int.
 * @param {Uint8Array} data
 * @param {()=>number} random
 * @returns {void}
 */
function shuffle(data, random) {
  for (let i = data.length - 1; i > 0; i--) {
    const range = i + 1;
    const limit = Math.floor(4294967296 / range) * range;
    let raw;
    do { raw = random(); } while (raw >= limit);
    const j = raw % range;
    const temp = data[i];
    data[i] = data[j];
    data[j] = temp;
  }
}
/** @param {Uint8Array} values @returns {[Uint32Array,Uint32Array]} */
function prefixHashes(values) {
  const a = new Uint32Array(values.length + 1);
  const b = new Uint32Array(values.length + 1);
  for (let i = 0; i < values.length; i++) {
    a[i + 1] = (a[i] + mix(values[i], 0x9e3779b9)) >>> 0;
    b[i + 1] = (b[i] + mix(values[i], 0x6a09e667)) >>> 0;
  }
  return [a, b];
}

const observed = originalSpans();
const flat = Uint8Array.from(observed.flat());
assert.equal(flat.length, 2896);
const offsets = [0];
for (const a of observed) offsets.push(offsets.at(-1) + a.length);

/** @type {{span:number, start:number,end:number,length:number}[]} */
const pairs = [];
for (let i = 0; i + 1 < observed.length; i++) {
  if (observed[i].length < 13 || observed[i + 1].length < 13) continue;
  pairs.push({span:i,start:offsets[i],end:offsets[i+2],
    length:offsets[i+2]-offsets[i]});
}

const rng = xorshift(SEED);
/** @type {Uint8Array[]} */
const trials = [];
/** @type {Map<number,Map<string,Array<{trial:number,span:number}>>>} */
const slots = new Map();
function indexSignature(length, signature, trial, span) {
  if (!slots.has(length)) slots.set(length, new Map());
  const group = slots.get(length);
  if (!group.has(signature)) group.set(signature, []);
  group.get(signature).push({trial,span});
}

// Observed original remains unchanged.
function indexBook(book, trial) {
  const [a, b] = prefixHashes(book);
  for (const {span, start, end, length} of pairs) {
    indexSignature(length, hashKey((a[end] - a[start]) >>> 0,
      (b[end] - b[start]) >>> 0), trial, span);
  }
}
indexBook(flat, -1);
for (let t = 0; t < TRIALS; t++) {
  const book = flat.slice();
  shuffle(book, rng);
  trials.push(book);
  indexBook(book, t);
}

const controlWindowMatches = new Uint32Array(TRIALS);
const controlPairMatches = Array.from({length:TRIALS}, () => new Set());
/** @type {{source:string, originalSpan:number,sourceWordStart:number,wordCount:number}[]} */
const observedMatches = [];
let sourceWindowsExamined = 0;
for (const {name, spans} of sources) {
  const words = spans.flat();
  for (const [length, group] of slots) {
    if (words.length < length) continue;
    let [h1, h2] = hash(words.slice(0, length));
    for (let start = 0; start + length <= words.length; start++) {
      const match = group.get(hashKey(h1, h2));
      if (match) {
        const referenceBag = key(words.slice(start, start + length));
        for (const {trial, span} of match) {
          const {start:from,end:to} = pairs.find((p) => p.span === span);
          const book = trial === -1 ? flat : trials[trial];
          if (key(Array.from(book.subarray(from, to))) !== referenceBag) continue;
          if (trial === -1) {
            observedMatches.push({source:name,originalSpan:span,
              sourceWordStart:start,wordCount:length});
          } else {
            controlWindowMatches[trial]++;
            controlPairMatches[trial].add(span);
          }
        }
      }
      sourceWindowsExamined++;
      const next = start + length;
      if (next < words.length) {
        h1 = (h1 - mix(words[start],0x9e3779b9) +
          mix(words[next],0x9e3779b9)) >>> 0;
        h2 = (h2 - mix(words[start],0x6a09e667) +
          mix(words[next],0x6a09e667)) >>> 0;
      }
    }
  }
}
assert(observedMatches.some((m) => m.source === 'Shakespeare excerpt'
  && m.originalSpan === 68 && m.sourceWordStart === 35571
  && m.wordCount === 41), 'Unexpected mismatch at observed source candidate');

const observedPairCount = new Set(observedMatches.map(m => m.originalSpan)).size;
const asWindows = observedMatches.length;
const exactWindowTail = 1 + [...controlWindowMatches].filter(n=>n>=asWindows).length;
const exactPairTail = 1 + controlPairMatches.filter(s=>s.size>=observedPairCount).length;
const withAnyNull = controlPairMatches.filter(s=>s.size>0).length;
const maxControlWindows=Math.max(...controlWindowMatches);
const maxControlPairs=Math.max(...controlPairMatches.map(s=>s.size));

console.log(JSON.stringify({
  status:'PASS',
  originalSpans:observed.length,
  originalWords:flat.length,
  sourceCorpora:sources.map(s=>s.name),
  originalEligiblePairs:pairs.length,
  candidateDistinctWindowLengths:slots.size,
  sourceWindowsExamined,
  observedMatches,
  observedDistinctOriginalPairs:observedPairCount,
  null: {
    model:'uniform fixed-whole-book wordlength-multiset shuffle, source and span counts fixed',
    seed:SEED, trials:TRIALS, withAnyMatch:withAnyNull,
    windowsAtLeastObserved:exactWindowTail-1,
    pairsAtLeastObserved:exactPairTail-1,
    windowsAddOneTail:exactWindowTail/(TRIALS+1),
    distinctPairsAddOneTail:exactPairTail/(TRIALS+1),
    maxWindowHits:maxControlWindows,
    maxDistinctOriginalPairs:maxControlPairs
  }
},null,2));
