'use strict';
/**
 * SFT: original LP2 printed-word lengths against two pinned medieval texts.
 * Exact source-native length comparison rules out each SOURCE TEXT as an
 * intact word-boundary-preserving running plaintext under ANY alphabet
 * cipher retaining the printed word segmentation, even changing every key.
 *
 * Windows 11 / Node.js 22:
 * node sims/lp2_medieval_source_wordlength_exact_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tokenMap = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
/** @param {string} word @returns {number[]} */
function gpEncode(word) {
  const s = word.toUpperCase().replace(/Þ/g, 'TH').replace(/Ð/g, 'TH')
    .replace(/Æ/g, 'AE').replace(/Œ/g, 'OE')
    .replace(/[ØǪÖ]/g, 'O').replace(/ỽ/g, 'W').normalize('NFD')
    .replace(/\p{M}/gu, '').replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  assert.match(s, /^[A-Z]+$/u);
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      out.push(21); i += 3;
    } else if (s.startsWith('IO', i)) {
      out.push(27); i += 2;
    } else {
      const t = tokenMap.find(item => s.startsWith(item.s, i));
      assert(t, 'missing token ' + s.slice(i));
      out.push(t.i); i += t.s.length;
    }
  }
  return out;
}
/** @param {string} printed @returns {number[][]} */
function printedWords(printed) {
  const out = [];
  let word = [];
  for (const ch of printed) {
    if (runeMap.has(ch)) word.push(runeMap.get(ch));
    else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
      // Physical-line/page punctuation may split one real printed word.
    } else if (word.length) {
      out.push(word); word = [];
    }
  }
  if (word.length) out.push(word);
  return out;
}
const originalWords = printedWords(read('resources/lp2-transcription.txt')
  .split('%').slice(0,55).join('%'));
const original = originalWords.map(w => w.length);
assert.equal(original.length, 2896);
assert.equal(original.reduce((s, n) => s + n, 0), 12956);
assert.equal(original.filter(n => n === 1).length, 83);
assert.equal(original.filter(n => n === 14).length, 3);

/**
 * Exact longest common CONTIGUOUS word-length sequence, allowing any
 * source start, but preserving order and boundaries in both strings.
 * O(originalWords * sourceWords), O(sourceWords) space.
 * @param {number[]} observed
 * @param {number[]} source
 * @returns {{size:number,observedStart:number,sourceStart:number}}
 */
function longestCommonContiguous(observed, source) {
  let previous = new Uint16Array(source.length + 1);
  let current = new Uint16Array(source.length + 1);
  const best = {size:0, observedStart:-1, sourceStart:-1};
  for (let i = 1; i <= observed.length; i++) {
    for (let j = 1; j <= source.length; j++) {
      if (observed[i-1] === source[j-1]) {
        const v = previous[j-1] + 1;
        current[j] = v;
        if (v > best.size) {
          best.size = v;
          best.observedStart = i - v;
          best.sourceStart = j - v;
        }
      } else current[j] = 0;
    }
    [previous, current] = [current, previous];
    current.fill(0);
  }
  return best;
}
/**
 * @param {number[]} lengths @param {number} width
 * @returns {{min:number,max:number,windows:number}}
 */
function contiguousMeans(lengths, width) {
  assert(lengths.length >= width);
  let sum = lengths.slice(0, width).reduce((a,b) => a+b, 0);
  let smallest = sum, largest = sum;
  for (let j = width; j < lengths.length; j++) {
    sum += lengths[j] - lengths[j-width];
    smallest = Math.min(smallest, sum);
    largest = Math.max(largest, sum);
  }
  return {min:smallest/width,max:largest/width,
    windows:lengths.length-width+1};
}
const controls = [
  {name:'Middle Welsh Pwyll',
    source:read('resources/control/pwyll_pendeuic_dyuet_welsh_source.txt')
      .split(/={20,}\r?\n\r?\n/u)[1],
    words:7847, mean:3.441952338473302, longest:7},
  {name:'Old Norse Havamal',
    source:read('resources/control/havamal_old_norse_source.txt')
      .replace(/^I\.\s*/u, ''),
    words:3588, mean:3.980490523968785, longest:8}
];
const results = [];
for (const source of controls) {
  const lexical = source.source.match(/\p{L}+/gu) || [];
  assert.equal(lexical.length, source.words);
  const encoded = lexical.map(gpEncode);
  const lengths = encoded.map(w => w.length);
  const mean = lengths.reduce((s,x) => s+x,0)/lengths.length;
  assert(Math.abs(mean-source.mean) < 1e-12);
  const longest = longestCommonContiguous(original,lengths);
  assert.equal(longest.size,source.longest);

  // A native source passage whose symbols are actually encoded with
  // changing independent GP29 keys preserves ALL printed word lengths.
  const positiveSourceStart = 70;
  const plantedWords = encoded.slice(positiveSourceStart,
    positiveSourceStart + 100);
  const plant = plantedWords.map((w, wordIndex) => w.map(
    (v,j) => gp.runes[(v+17*wordIndex+11*j+3)%29].toString()).join('')).join('-');
  const plantedCipherWords = printedWords(plant);
  assert.equal(plantedCipherWords.length,100);
  const inverse = plantedCipherWords.map((w,i) => w.map(
    (v,j)=>(v-(17*i+11*j+3)%29+29)%29));
  assert.deepEqual(inverse,plantedWords);
  const plantLongest = longestCommonContiguous(
    plantedCipherWords.map(w=>w.length),lengths);
  assert(plantLongest.size >= 100);
  results.push({
    source:source.name,sourceWords:lexical.length,
    sourceMean:mean,originalMean:12956/2896,
    sourceSingletonCount:lengths.filter(n=>n===1).length,
    originalSingletonCount:83,
    sourceLength14Count:lengths.filter(n=>n===14).length,
    originalLength14Count:3,
    contiguousSourceWindowsMatchingOriginalWordCount:
      contiguousMeans(lengths,original.length),
    longestExactConsecutiveLengthMatch:longest,
    positiveSourcePlantMatchedWords:plantLongest.size
  });
}
console.log(JSON.stringify({sourceOriginal:{words:2896,runes:12956},
  invariant:'Any rune cipher preserving original printed word lengths preserves the entire length sequence',
  results},null,2));
console.log('PASS: original word joins, two original source-text negatives, two real-GP length/cipher positives');
