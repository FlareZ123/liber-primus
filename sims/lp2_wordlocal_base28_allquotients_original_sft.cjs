'use strict';
/**
 * Original LP2 word-local BASE29 / predecessor-exclusion BASE28 gate.
 * This is a hypothesis test. Neither the wordwise conversion nor its keys
 * are authenticated by Cicada. Windows 11, Node.js 22, CommonJS.
 *
 * Run from repository root:
 *   node sims/lp2_wordlocal_base28_allquotients_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const glyph = new Map(corpus.runes.map((r, i) => [r, i]));
const sourcePages = transcript.split('%');
assert.equal(sourcePages.length, 57);

/** @typedef {{runes:number[],runePages:number[],page:number,section:number,crossPage:boolean}} Word */
/**
 * Treat slash, actual page separators and line endings as non-word-breaking.
 * The source's only complete-word terminators are '-', '.', '&', '$'.
 * @param {string} source
 * @returns {Word[]}
 */
function parseWords(source) {
  /** @type {Word[]} */
  const words = [];
  let current = [];
  let runePages = [];
  let pages = new Set();
  let physical = 0;
  let section = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({
      runes: current,
      runePages,
      page: Math.min(...pages),
      section,
      crossPage: pages.size > 1
    });
    current = [];
    runePages = [];
    pages = new Set();
  };
  for (const ch of source) {
    if (glyph.has(ch)) {
      current.push(glyph.get(ch));
      const actualPage = physical >= 50 ? physical + 1 : physical;
      runePages.push(actualPage);
      pages.add(actualPage);
    } else if (ch === '-' || ch === '.' || ch === '&' || ch === '$') {
      flush();
      if (ch === '$') section++;
    } else if (ch === '%') {
      physical++;
    }
  }
  flush();
  return words;
}
const unknown = parseWords(sourcePages.slice(0, 55).join('%'));
const sourceR = unknown.reduce((n, w) => n + w.runes.length, 0);
const singleton = unknown.filter(w => w.runes.length === 1);
const containingRepeat = unknown.filter(w =>
  w.runes.some((r, i) => i > 0 && r === w.runes[i - 1]));
const repeatedSteps = containingRepeat.reduce((n, w) =>
  n + w.runes.filter((r, i) => i > 0 && r === w.runes[i - 1]).length, 0);
const exceptionRunes = containingRepeat.reduce((n, w) => n + w.runes.length, 0);
assert.equal(unknown.length, 2896);
assert.equal(sourceR, 12956);
assert.equal(unknown.filter(w => w.crossPage).length, 32);
assert.equal(singleton.length, 83);
assert.equal(unknown.filter(w => w.runes.length === 2).length, 448);
assert.equal(new Set(singleton.map(w => w.runes[0])).size, 28);
assert.equal(containingRepeat.length, 62);
assert.equal(repeatedSteps, 63);
assert.equal(exceptionRunes, 371);
assert.equal(new Set(unknown.map(w => w.section)).size, 8);
assert.equal(new Set(unknown.map(w => w.page)).size, 55);

/**
 * An m-rune no-repeat ciphertext word has M=29*28^(m-1)
 * legal strings. One original first rune and the next 28-way ranks
 * form its natural mixed-radix integer R in [0,M).
 * @param {number[]} word
 * @returns {bigint|null}
 */
function rank28(word) {
  let rank = BigInt(word[0]);
  for (let i = 1; i < word.length; i++) {
    if (word[i] === word[i - 1]) return null;
    const digit = word[i] - (word[i] > word[i - 1] ? 1 : 0);
    rank = rank * 28n + BigInt(digit);
  }
  return rank;
}
/** @param {bigint} rank @param {number} length @returns {number[]} */
function unrank28(rank, length) {
  const digits = Array(length);
  for (let i = length - 1; i > 0; i--) {
    digits[i] = Number(rank % 28n);
    rank /= 28n;
  }
  digits[0] = Number(rank);
  assert(digits[0] >= 0 && digits[0] < 29);
  const out = [digits[0]];
  for (let i = 1; i < length; i++) {
    const prev = out[i - 1];
    out.push(digits[i] + (digits[i] >= prev ? 1 : 0));
  }
  return out;
}
/** @param {bigint} integer @param {number} length @returns {number[]} */
function unrank29(integer, length) {
  const out = Array(length);
  for (let i = length - 1; i >= 0; i--) {
    out[i] = Number(integer % 29n);
    integer /= 29n;
  }
  assert.equal(integer, 0n);
  return out;
}
/** @param {number[]} word @returns {bigint} */
function rank29(word) {
  return word.reduce((n, x) => n * 29n + BigInt(x), 0n);
}
/**
 * Source-word boundaries supply length m. An arbitrary secret side
 * quotient Q is allowed independently for EACH original word.
 * @param {number[]} word
 * @returns {{candidates:number[][],repeated:boolean,quotients:number}}
 */
function decodeCandidates(word) {
  const R = rank28(word);
  if (R === null) return {candidates: [], repeated: true, quotients: 0};
  const m = word.length;
  const M = 29n * 28n ** BigInt(m - 1);
  const N = 29n ** BigInt(m);
  /** @type {number[][]} */
  const candidates = [];
  for (let n = R; n < N; n += M) {
    const candidate = unrank29(n, m);
    const Q = (n - R) / M;
    assert.deepEqual(unrank28(rank29(candidate) % M, m), word);
    assert.equal(rank29(candidate) / M, Q);
    candidates.push(candidate);
  }
  assert(candidates.length >= 1 && candidates.length <= 2);
  return {candidates, repeated: false, quotients: candidates.length};
}
/** @param {number[]} word @returns {{code:number[], quotient:bigint}} */
function encodePlant(word) {
  const P = rank29(word);
  const M = 29n * 28n ** BigInt(word.length - 1);
  return {code: unrank28(P % M, word.length), quotient: P / M};
}
// Uncontaminated positive: the real printed-clear p57 source, not its
// ciphertext, must survive the full bijective forward/inverse word transport.
const genuineP57 = parseWords(sourcePages[56]);
const p57Source = genuineP57.flatMap(w => w.runes);
assert.deepEqual(p57Source, corpus.pages[57].indices);
for (const original of genuineP57) {
  const {code, quotient} = encodePlant(original.runes);
  assert.equal(rank28(code) === null, false);
  assert.deepEqual(unrank29(rank28(code) + quotient *
    29n * 28n ** BigInt(code.length - 1), code.length), original.runes);
}
assert.equal(p57Source.length, 95);

/** @param {number[]} word @returns {number[]} */
function histogram(word) {
  const c = Array(29).fill(0);
  for (const v of word) c[v]++;
  return c;
}
/** @typedef {{base:number[],diffs:number[][],nonrepeatRunes:number}} State */
/** @returns {State} */
function newState() {
  return {base: Array(29).fill(0), diffs: [], nonrepeatRunes: 0};
}
const stateGroups = {
  global: new Map(),
  section: new Map(),
  page: new Map(),
  pageCircumference: new Map(),
  pageOrdinalRole: new Map()
};
let q1Available = 0;
for (const word of unknown) {
  const {candidates, repeated} = decodeCandidates(word.runes);
  if (repeated) continue; // Grant all 371 such runes freely in bounds below.
  const first = histogram(candidates[0]);
  let diff = null;
  if (candidates.length === 2) {
    q1Available++;
    const second = histogram(candidates[1]);
    diff = second.map((x, i) => x - first[i]);
  }
  for (const type of Object.keys(stateGroups)) {
    const pageShell = (i) => `${word.runePages[i]}:${
      i === 0 || i === word.runes.length - 1 ? 'circumference' : 'inside'}`;
    const pagePosition = (i) => `${word.runePages[i]}:${
      i === 0 ? 'first' : i === word.runes.length - 1 ? 'last' : 'inside'}`;
    const keys = type === 'global' ? [0] : type === 'section' ? [word.section] :
      type === 'page' ? [...new Set(word.runePages)] :
      type === 'pageCircumference' ? [...new Set(word.runes.map((_, i) => pageShell(i)))] :
      [...new Set(word.runes.map((_, i) => pagePosition(i)))];
    for (const key of keys) {
      let state = stateGroups[type].get(key);
      if (!state) {
        state = newState();
        stateGroups[type].set(key, state);
      }
      // A carried word changes physical-page output alphabet mid-word.
      // Split candidates by actual rune page. Allow a separate, even more
      // generous quotient choice for each fragment of a carried word.
      let firstPart = first;
      let diffPart = diff;
      let partSize = word.runes.length;
      if (type === 'page' || type === 'pageCircumference' ||
          type === 'pageOrdinalRole') {
        const indices = word.runePages.map((p, i) => {
          const candidateKey = type === 'page' ? p :
            type === 'pageCircumference' ? pageShell(i) : pagePosition(i);
          return candidateKey === key ? i : -1;
        }).filter(i => i >= 0);
        partSize = indices.length;
        firstPart = histogram(indices.map(i => candidates[0][i]));
        if (diff) {
          const secondPart = histogram(indices.map(i => candidates[1][i]));
          diffPart = secondPart.map((x, i) => x - firstPart[i]);
        }
      }
      state.nonrepeatRunes += partSize;
      for (let i = 0; i < 29; i++) state.base[i] += firstPart[i];
      if (diffPart) state.diffs.push(diffPart);
    }
  }
}
assert.equal(q1Available, 388);
for (const [type, groups] of Object.entries(stateGroups)) {
  assert.equal([...groups.values()].reduce((n, s) =>
    n + s.nonrepeatRunes, 0), sourceR - exceptionRunes, type);
}
assert.equal(stateGroups.pageCircumference.size, 110);
assert.equal(stateGroups.pageOrdinalRole.size, 165);
/**
 * For a selected set of k plaintext rune values, a secret GP29 bijection
 * may map ANY k decoded labels to these k values, independently by state.
 * For each original word and chosen label set, the unknown Q can then choose
 * the better of its q0/q1 outputs. This is an EXACT maximization over all
 * 29! state alphabets and all legal independent word quotients.
 * For page-private tables, even cross-page word fragments can separately
 * choose Q, a strict superset of the actual single-Q word code.
 *
 * @param {State} state
 * @param {number[]} chosen
 * @returns {number}
 */
function countBest(state, chosen) {
  let count = 0;
  for (const i of chosen) count += state.base[i];
  for (const delta of state.diffs) {
    let improvement = 0;
    for (const i of chosen) improvement += delta[i];
    if (improvement > 0) count += improvement;
  }
  return count;
}
/**
 * @param {Map<any,State>} states
 * @param {number} k
 * @returns {number}
 */
function maximumTopK(states, k) {
  const values = [...states.values()];
  const maxima = values.map(() => 0);
  const chosen = Array(k);
  const walk = (depth, start) => {
    if (depth === k) {
      values.forEach((state, index) => {
        const value = countBest(state, chosen);
        if (value > maxima[index]) maxima[index] = value;
      });
      return;
    }
    for (let i = start; i <= 29 - (k - depth); i++) {
      chosen[depth] = i;
      walk(depth + 1, i + 1);
    }
  };
  walk(0, 0);
  return maxima.reduce((a, b) => a + b, 0);
}
const allSecret = {};
for (const [type, states] of Object.entries(stateGroups)) {
  allSecret[type] = {};
  for (const k of type === 'pageCircumference' || type === 'pageOrdinalRole' ?
    [5] : [1, 2, 3, 5]) {
    const maxNonrepeat = maximumTopK(states, k);
    allSecret[type][k] = {
      upperNonrepeat: maxNonrepeat,
      upperWithEntireRepeatedWordsGrantedFree: maxNonrepeat + exceptionRunes
    };
  }
}
assert.equal(allSecret.global[5].upperNonrepeat, 2489);
assert.equal(allSecret.section[5].upperNonrepeat, 2759);
assert.equal(allSecret.page[5].upperNonrepeat, 3462);
assert.equal(allSecret.pageCircumference[5].upperNonrepeat, 4057);
assert.equal(allSecret.pageOrdinalRole[5].upperNonrepeat, 4379);
assert.equal(allSecret.global[5].upperWithEntireRepeatedWordsGrantedFree, 2860);
assert.equal(allSecret.section[5].upperWithEntireRepeatedWordsGrantedFree, 3130);
assert.equal(allSecret.page[5].upperWithEntireRepeatedWordsGrantedFree, 3833);
assert.equal(allSecret.pageCircumference[5]
  .upperWithEntireRepeatedWordsGrantedFree, 4428);
assert.equal(allSecret.pageOrdinalRole[5]
  .upperWithEntireRepeatedWordsGrantedFree, 4750);

/**
 * Historical F-interrupter alternative: solved Cicada plaintext uses literal
 * transparent F (GP index0). Remove source F from each authentic whole word
 * before rank28 transport, then reinsert it unchanged in the exact source
 * positions. This version does NOT assert LP2 actually uses that rule.
 *
 * The output top-five upper is made extremely forgiving: ALL 458 original F
 * positions are credited to the top-five set, even if real English would
 * not rank F among its five most common rune identities. Every remaining
 * non-F rune in any word containing an adjacency after F-removal gets
 * arbitrary plaintext as well. Different page×word-position fragments of
 * one word are independently permitted to choose their Q candidate.
 */
const fTransparentStates = Object.fromEntries(
  Object.keys(stateGroups).map(type => [type, new Map()])
);
let literalF = 0;
let fExceptionRunes = 0;
let fExceptionWords = 0;
let fEligibleRunes = 0;
let fQ1Available = 0;
let allFWords = 0;
for (const word of unknown) {
  const filtered = word.runes.map((r, i) => ({r, page: word.runePages[i]}))
    .filter(x => x.r !== 0);
  literalF += word.runes.length - filtered.length;
  if (!filtered.length) {
    allFWords++;
    continue;
  }
  const values = filtered.map(x => x.r);
  const physicalPages = filtered.map(x => x.page);
  const {candidates, repeated} = decodeCandidates(values);
  if (repeated) {
    fExceptionWords++;
    fExceptionRunes += values.length;
    continue;
  }
  fEligibleRunes += values.length;
  if (candidates.length === 2) fQ1Available++;
  for (const type of Object.keys(fTransparentStates)) {
    const role = (i) => i === 0 ? 'first' :
      i === values.length - 1 ? 'last' : 'inside';
    const shell = (i) => i === 0 || i === values.length - 1 ?
      'circumference' : 'inside';
    const stateKey = i => type === 'global' ? 0 :
      type === 'section' ? word.section :
      type === 'page' ? physicalPages[i] :
      type === 'pageCircumference' ?
        physicalPages[i] + ':' + shell(i) :
        physicalPages[i] + ':' + role(i);
    const differences = new Map();
    for (let i = 0; i < values.length; i++) {
      const key = stateKey(i);
      const group = fTransparentStates[type];
      let state = group.get(key);
      if (!state) {
        state = newState();
        group.set(key, state);
      }
      state.base[candidates[0][i]]++;
      state.nonrepeatRunes++;
      if (candidates.length === 2) {
        let delta = differences.get(key);
        if (!delta) {
          delta = Array(29).fill(0);
          differences.set(key, delta);
        }
        delta[candidates[1][i]]++;
        delta[candidates[0][i]]--;
      }
    }
    for (const [key, delta] of differences) {
      fTransparentStates[type].get(key).diffs.push(delta);
    }
  }
}
assert.equal(literalF, 458);
assert.equal(fExceptionWords, 67);
assert.equal(fExceptionRunes, 380);
assert.equal(fEligibleRunes, 12118);
assert.equal(fQ1Available, 273);
assert.equal(allFWords, 1);
assert.equal(literalF + fExceptionRunes + fEligibleRunes, sourceR);
assert.equal(fTransparentStates.page.size, 55);
assert.equal(fTransparentStates.pageCircumference.size, 110);
assert.equal(fTransparentStates.pageOrdinalRole.size, 165);
for (const [type, groups] of Object.entries(fTransparentStates)) {
  assert.equal([...groups.values()].reduce((n, state) =>
    n + state.nonrepeatRunes, 0), fEligibleRunes, type);
}
const allSecretFTransparency = {};
for (const [type, states] of Object.entries(fTransparentStates)) {
  const nonRepeat = maximumTopK(states, 5);
  allSecretFTransparency[type] = {
    decodedNonrepeatTop5: nonRepeat,
    boundWithAllFAndExceptionsFree: nonRepeat + literalF + fExceptionRunes
  };
}
assert.deepEqual(
  Object.fromEntries(Object.entries(allSecretFTransparency)
    .map(([type, score]) => [type, score.decodedNonrepeatTop5])),
  {
    global: 2398, section: 2662, page: 3344,
    pageCircumference: 3911, pageOrdinalRole: 4240
  }
);
assert.equal(allSecretFTransparency.pageOrdinalRole
  .boundWithAllFAndExceptionsFree, 5078);

// Positive replay of F-interrupter word transport. It preserves its position,
// including when F is on the first/last position, with a genuine source
// p57 plaintext word rather than just an artificial arithmetic assertion.
for (const word of genuineP57) {
  const notF = word.runes.filter(r => r !== 0);
  if (!notF.length) continue;
  const {code, quotient} = encodePlant(notF);
  const restored = unrank29(rank28(code) + quotient *
    29n * 28n ** BigInt(code.length - 1), code.length);
  const assembled = [];
  let cursor = 0;
  for (const r of word.runes) {
    assembled.push(r === 0 ? 0 : restored[cursor++]);
  }
  assert.deepEqual(assembled, word.runes);
}

/**
 * Original-source "F-pass" discriminant independent of the decoder itself:
 * if one glyph is only a transparent interrupt, source triples x-F-x might
 * unusually avoid equality when source F is deleted. Test F against every
 * other source rune as the same deletion control; never select the glyph
 * yielding the smallest post-hoc return rate as evidence of intended F.
 * All 32 physical-page carries stay joined inside actual complete words.
 */
function bridgeReturns(removed) {
  let bridges = 0;
  let repeats = 0;
  for (const word of unknown) {
    const positions = word.runes.map((r, pos) => ({r, pos}))
      .filter(x => x.r !== removed);
    for (let i = 1; i < positions.length; i++) {
      const left = positions[i - 1], right = positions[i];
      if (right.pos === left.pos + 1) continue;
      bridges++;
      if (left.r === right.r) repeats++;
    }
  }
  return {bridges, repeats};
}
const removedRuneBridges = corpus.runes.map((rune, index) => ({
  rune: corpus.translit[index], ...bridgeReturns(index)
}));
const fBridge = removedRuneBridges[0];
assert.deepEqual(fBridge, {rune: 'F', bridges: 257, repeats: 8});
const FReturnRank = [...removedRuneBridges].sort((a, b) =>
  a.repeats * b.bridges - b.repeats * a.bridges)
  .findIndex(x => x.rune === 'F') + 1;
assert.equal(FReturnRank, 13);

/**
 * A very generous period-native GP spell normalizer for control prose;
 * controls are register examples, not claims about actual LP2 language.
 * @param {string} word
 * @returns {number[]|null}
 */
function nativeGP(word) {
  const runes = new Map(corpus.translit.map((text, i) => [text, i]));
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/Q/g, 'C').replace(/K/g, 'C').replace(/V/g, 'U')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (i + 1 < s.length && runes.has(s.slice(i, i + 2))) {
      out.push(runes.get(s.slice(i, i + 2)));
      i += 2;
    } else if (runes.has(s[i])) {
      out.push(runes.get(s[i]));
      i++;
    } else return null;
  }
  return out;
}
/** @param {number[]} counts @returns {number} */
function top5(counts) {
  return counts.slice().sort((a, b) => b - a)
    .slice(0, 5).reduce((a, b) => a + b, 0);
}
/**
 * Scans every length-12956 contiguous GP window; selects the LEAST
 * English-looking top-five occupancy, an anti-overclaim control.
 * @param {string} name
 */
function control(name) {
  const tokens = read(name).match(/[A-Za-z]+/g) || [];
  const gp = [];
  for (const word of tokens) {
    const encoded = nativeGP(word);
    if (encoded) gp.push(...encoded);
  }
  assert(gp.length >= sourceR);
  const counts = histogram(gp.slice(0, sourceR));
  let minimum = top5(counts);
  let bestStart = 0;
  for (let i = sourceR; i < gp.length; i++) {
    counts[gp[i - sourceR]]--;
    counts[gp[i]]++;
    const val = top5(counts);
    if (val < minimum) {
      minimum = val;
      bestStart = i - sourceR + 1;
    }
  }
  return {name, runeCount: gp.length, windowLength: sourceR,
    minimumTopFive: minimum, minimumStart: bestStart,
    minimumFraction: minimum / sourceR};
}
const controlResults = [
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/shakespeare_first300k.txt',
  'resources/control/emerson_essays_2944.txt'
].map(control);
assert.deepEqual(controlResults.map(x => x.minimumTopFive),
  [5227, 5131, 5336]);
assert(controlResults.every(x =>
  x.minimumTopFive > allSecret.pageOrdinalRole[5]
    .upperWithEntireRepeatedWordsGrantedFree));
assert(controlResults.every(x =>
  x.minimumTopFive > allSecretFTransparency.pageOrdinalRole
    .boundWithAllFAndExceptionsFree));
assert.equal(top5(histogram(p57Source)), 46);

console.log('SOURCE_AND_POSITIVE', JSON.stringify({
  words: unknown.length, runes: sourceR,
  crossingPages: unknown.filter(w => w.crossPage).length,
  singletonWords: singleton.length, repeatContainingWords: containingRepeat.length,
  withinWordRepeatedSteps: repeatedSteps, fullyFreedExceptionRunes: exceptionRunes,
  extraLegalWordQuotients: q1Available, genuineP57RunesRecovered: p57Source.length
}));
console.log('ALL_SECRET_EXACT_SOURCE_BOUNDS', JSON.stringify(allSecret));
console.log('F_DELETION_SOURCE_RETURN_CONTROL', JSON.stringify({
  fBridge, FReturnRank, all29: removedRuneBridges
}));
console.log('F_TRANSPARENT_ORIGINAL_ALL_SECRET_BOUNDS', JSON.stringify({
  literalF, fExceptionRunes, fExceptionWords, fEligibleRunes,
  fQ1Available, allFWords, scopes: allSecretFTransparency
}));
console.log('SOURCE_NATIVE_CONTROL_MINIMA', JSON.stringify(controlResults));
console.log('CONCLUSION: no direct native-English-GP29 inversion of this exact fixed-word BASE29/28 lift under any independent word quotient, arbitrary page-private alphabet, or independently keyed source word circumference/inside or first/interior/last page-role alphabets. All 371 real repeated-word runes were given arbitrary plaintext and Q may vary across crossed page and shell state. With F-interrupter transparency and all F runes optimistically credited to the top-five it also fails all three full-length donor controls, including the 165-page-role case. No first-party source selects the lift; no authentic unknown plaintext was recovered.');
