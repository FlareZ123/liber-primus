'use strict';
/**
 * Standalone original-input test of a two-stage GP29 cipher:
 * a per-word, period-five affine pad followed by predecessor-excluding
 * 28-rank emission, with one reserved/repeat marker.
 *
 * Reads original immutable GP ciphertext and source-native English word
 * lexicon. Never guesses plaintext to improve a source decoder.
 * Run: node sims/lp2_predecessor_rank_word5_affine_joint_sft.cjs
 *
 * @typedef {{name:string,gp:number[]}} NativeWord
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pageData = gp.pages.filter(p => p.page <= 55);
const cipher = pageData.flatMap(p => p.indices);
const pageStarts = new Set();
let total = 0;
for (const page of pageData) {
  if (page.indices.length) pageStarts.add(total);
  total += page.indices.length;
}
assert.equal(cipher.length, 12956);
assert.equal(total, 12956);

const runeToIndex = new Map(gp.runes.map((r, i) => [r, i]));
const sourceText = read('resources/liber-primus/lp2-transcription.txt');
const words = [];
let word = [], n = 0;
for (const ch of sourceText) {
  if (runeToIndex.has(ch)) {
    if (n + word.length === cipher.length) break;
    word.push(runeToIndex.get(ch));
  } else if ('- .&$§'.includes(ch) && word.length) {
    words.push(word);
    n += word.length;
    word = [];
  }
}
if (word.length) words.push(word);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), cipher);
const offsets = [];
for (const w of words) {
  offsets.push(offsets.length ? offsets[offsets.length - 1] +
    words[offsets.length - 1].length : 0);
  assert(w.length >= 1 && w.length <= 14);
}
const observedRepeat = cipher.map((c, i) =>
  i > 0 && !pageStarts.has(i) && c === cipher[i - 1]);
assert.equal(observedRepeat.filter(Boolean).length, 86);

const translits = gp.translit.map((spelling, index) =>
  ({spelling, index})).sort((a, b) => b.spelling.length - a.spelling.length);
/**
 * Native GP orthography, calibrated by solved LP1 and LP2 page 57.
 * ING and IO retain their established one-rune historical spelling.
 * @param {string} spelling
 * @returns {number[]}
 */
function encodeNativeGP(spelling) {
  const clean = spelling.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < clean.length;) {
    if (clean.startsWith('ING', i)) {
      out.push(21);
      i += 3;
    } else if (clean.startsWith('IO', i)) {
      out.push(27);
      i += 2;
    } else {
      const token = translits.find(x => clean.startsWith(x.spelling, i));
      assert(token, 'GP transliteration missing for ' + spelling);
      out.push(token.index);
      i += token.spelling.length;
    }
  }
  return out;
}
assert.deepEqual(encodeNativeGP('FOLLOWING'), [0,3,20,20,3,7,21]);
assert.deepEqual(encodeNativeGP('FUNCTION'), [0,1,9,5,16,27,9]);
const lexicon = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(s => /^[a-z]+ \d+$/.test(s))
  .map(s => ({name:s.split(' ')[0],gp:encodeNativeGP(s.split(' ')[0])}));
assert.equal(lexicon.length, 29157);
const dictionaryByLength = new Map();
for (const item of lexicon) {
  if (!dictionaryByLength.has(item.gp.length))
    dictionaryByLength.set(item.gp.length, []);
  dictionaryByLength.get(item.gp.length).push(item);
}

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % 29) + 29) % 29;
}
/** @param {number} x @returns {number} */
function inverse(x) {
  assert(x > 0 && x < 29);
  for (let i = 1; i < 29; i++) if ((x * i) % 29 === 1) return i;
  throw new Error('not invertible');
}
/**
 * Necessary and sufficient for existence of word-local a != 0 and five
 * arbitrary additive residues in T_j = a*P_j + b_(j mod5).
 * Every secret pad cancels in each lag-five first difference.
 * @param {number[]} x
 * @returns {string}
 */
function signature(x) {
  const diff = x.slice(5).map((v, i) => mod(v - x[i]));
  const first = diff.find(v => v !== 0);
  const scalar = first === undefined ? 0 : inverse(first);
  return x.length + ':' + diff.map(v => v * scalar % 29).join(',');
}
const sourceBySignature = new Map();
for (const item of lexicon) {
  if (item.gp.length < 10 || item.gp.length > 14) continue;
  const sig = signature(item.gp);
  if (!sourceBySignature.has(sig)) sourceBySignature.set(sig, []);
  sourceBySignature.get(sig).push(item.name);
}
assert.equal([...sourceBySignature.values()].reduce((s, x) => s + x.length, 0), 5154);
assert.equal(sourceBySignature.size, 5133);
const longWords = words.flatMap((w, i) =>
  w.length >= 10 && w.length <= 14 ?
    [{wordIndex:i,offset:offsets[i],length:w.length}] : []);
assert.deepEqual([10,11,12,13,14].map(length =>
  longWords.filter(w => w.length === length).length), [52,32,18,4,3]);

/**
 * Decode a 29-way predecessor-rank emitter. The distinguished marker
 * emits the previous ciphertext rune. Other intermediate symbols are
 * ranked among the 28 nonidentical possible next ciphertext symbols.
 *
 * @param {number[]} C
 * @param {number} marker
 * @param {'sorted'|'cyclic'} order
 * @param {'pages'|'book'} reset
 * @returns {number[]}
 */
function decodeEmitter(C, marker, order, reset) {
  return C.map((c, i) => {
    if (i === 0 || (reset === 'pages' && pageStarts.has(i))) return c;
    const p = C[i - 1];
    if (p === c) return marker;
    const d = order === 'sorted' ? c - Number(c > p) :
      mod(c - p - 1);
    assert(d >= 0 && d < 28);
    return d + Number(d >= marker);
  });
}
/**
 * Exact corresponding forward emitter, including non-consuming first
 * printed rune at every source page reset.
 * @param {number[]} T
 * @param {number} marker
 * @param {'sorted'|'cyclic'} order
 * @param {'pages'|'book'} reset
 * @returns {number[]}
 */
function encodeEmitter(T, marker, order, reset) {
  const C = [];
  for (let i = 0; i < T.length; i++) {
    if (i === 0 || (reset === 'pages' && pageStarts.has(i))) {
      C.push(T[i]);
      continue;
    }
    const p = C[i - 1], t = T[i];
    if (t === marker) {
      C.push(p);
      continue;
    }
    const d = t - Number(t > marker);
    C.push(order === 'sorted' ? d + Number(d >= p) :
      mod(p + d + 1));
  }
  return C;
}
const sourceResults = [];
const distinctLongIndices = new Set();
for (const order of ['sorted', 'cyclic']) {
  for (const reset of ['pages', 'book']) {
    let totalMatches = 0;
    const hits = [];
    for (let marker = 0; marker < 29; marker++) {
      const T = decodeEmitter(cipher, marker, order, reset);
      assert.deepEqual(encodeEmitter(T, marker, order, reset), cipher);
      for (const point of longWords) {
        const possibilities = sourceBySignature.get(signature(
          T.slice(point.offset, point.offset + point.length)));
        if (!possibilities) continue;
        totalMatches++;
        distinctLongIndices.add(point.wordIndex);
        hits.push({marker:gp.translit[marker],wordIndex:point.wordIndex,
          sourceOffset:point.offset,possibleEnglish:possibilities});
      }
    }
    sourceResults.push({order,reset,totalMatches,hits});
  }
}
assert.deepEqual(sourceResults.map(x => x.totalMatches), [1,1,7,7]);
assert.deepEqual([...distinctLongIndices].sort((a,b)=>a-b),
  [1181,1898,2297,2844]);

/**
 * A dictionary word is feasible for the exact physical doublet mask if
 * each five-position phase marks either zero occurrences or exactly one
 * distinct plaintext letter and excludes that letter from non-marked sites.
 * @param {number[]} p
 * @param {boolean[]} mask
 * @returns {boolean}
 */
function compatibleMask(p, mask) {
  for (let phase = 0; phase < 5; phase++) {
    const marked = [], unmarked = [];
    for (let i = phase; i < p.length; i += 5)
      (mask[i] ? marked : unmarked).push(p[i]);
    if (marked.length &&
      (!marked.every(x => x === marked[0]) || unmarked.includes(marked[0])))
      return false;
  }
  return true;
}

/**
 * Construct source-native English word-for-word on the exact original
 * 2,896-word/12,956-rune geometry. Choose each secret word pad so every
 * one of the original 86 predecessor repeats is preserved exactly,
 * including their original physical-page positions.
 */
const plantMarker = 1;
const plainPlant = [], intermediatePlant = [];
const plantedKeys = [];
for (let wi = 0; wi < words.length; wi++) {
  const n = words[wi].length, start = offsets[wi];
  const mask = Array.from({length:n}, (_, i) => observedRepeat[start + i]);
  const dictionary = dictionaryByLength.get(n);
  assert(dictionary && dictionary.length);
  /** @type {NativeWord | null} */
  let chosen = null;
  for (let j = 0; j < dictionary.length; j++) {
    const candidate = dictionary[(wi * 17 + j) % dictionary.length];
    if (compatibleMask(candidate.gp, mask)) {
      chosen = candidate;
      break;
    }
  }
  assert(chosen, 'native English word constrained by original event positions');
  const a = 5 + (wi * 7) % 24;
  const pad = Array.from({length:5}, (_, phase) => {
    const yes = [], no = [];
    for (let i = phase; i < n; i += 5)
      (mask[i] ? yes : no).push(chosen.gp[i]);
    if (yes.length) return mod(plantMarker - a * yes[0]);
    for (let attempt = 0; attempt < 29; attempt++) {
      const b = (wi * 11 + phase * 7 + attempt) % 29;
      if (no.every(p => mod(a * p + b) !== plantMarker)) return b;
    }
    throw new Error('no reserved-symbol-free five-phase key');
  });
  plainPlant.push(...chosen.gp);
  intermediatePlant.push(...chosen.gp.map((v,i)=>mod(a*v+pad[i%5])));
  plantedKeys.push({a,pad});
}
assert.equal(plainPlant.length, 12956);
assert.equal(intermediatePlant.length, 12956);
for (let i = 0; i < cipher.length; i++) {
  if (i > 0 && !pageStarts.has(i))
    assert.equal(intermediatePlant[i] === plantMarker, observedRepeat[i]);
}
const positive = [];
for (const order of ['sorted','cyclic']) {
  for (const reset of ['pages','book']) {
    const encrypted = encodeEmitter(intermediatePlant,plantMarker,order,reset);
    const decoded = decodeEmitter(encrypted,plantMarker,order,reset);
    assert.deepEqual(decoded,intermediatePlant);
    for (let i = 0; i < encrypted.length; i++)
      if (i > 0 && !(reset==='pages' && pageStarts.has(i)))
        assert.equal(encrypted[i] === encrypted[i-1], observedRepeat[i]);
    let recovered = 0, matched = 0;
    for (let wi = 0; wi < words.length; wi++) {
      const start = offsets[wi], n = words[wi].length;
      const {a,pad} = plantedKeys[wi], ai = inverse(a);
      for (let i = 0; i < n; i++) {
        const value = mod(ai * mod(decoded[start+i]-pad[i%5]));
        assert.equal(value,plainPlant[start+i]);
        recovered++;
      }
      if (n >= 10 && n <= 14 &&
        sourceBySignature.has(signature(decoded.slice(start,start+n))))
        matched++;
    }
    assert.equal(recovered,12956);
    assert.equal(matched,109);
    positive.push({order,reset,recovered,matchedLongWords:matched,
      retainedOriginalDoublets:86});
  }
}
console.log(JSON.stringify({
  input:{pages:pageData.length,words:words.length,unknownRunes:cipher.length,
    exactSamePageRepeatEvents:86,longNativeWordSlots:109},
  family:'fixed GP29 predecessor-rank order, freely selected repeat marker, independent nonzero multiplier and five additive keys per word',
  original:{sourceLongWordLengthHistogram:[52,32,18,4,3],
    dictionaryWordsLong:5154,sourceResults,
    unionCompatibleOriginalLongWords:distinctLongIndices.size,
    impossibleLongWordsEvenWithPerWordMarkerAndOrder:
      longWords.length-distinctLongIndices.size},
  positive:{nativeGPWords:words.length,nativeGPRunes:plainPlant.length,
    originalDoubletMaskPreservedExactly:true,positive},
  interpretation:'Finite conditional exclusion; no original unknown-page plaintext or first-party selected key'
},null,2));
