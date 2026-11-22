'use strict';
/**
 * Original-source two-time-pad screen, pp8–14 central 121-rune strip vs p32.
 * Conditional hypothesis: C1 = P1 + K + A, C2 = P2 + K + B mod29,
 * with one shared positionwise K, intact printed word breaks, and
 * native GP29 lexicon words for both plaintexts.
 *
 * The unknown constant difference A-B is granted every value in Z/29.
 * Run: node sims/lp2_onion7_center_p32_twotimepad_lexicon_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const mod = n => (n % 29 + 29) % 29;
const spellings = gp.translit.map((v, i) => ({v, i}))
  .sort((a, b) => b.v.length - a.v.length);

/** @param {string} word @returns {number[]} */
function encode(word) {
  const normalized = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Z/g, 'S').replace(/Q/g, 'C');
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const rune = spellings.find(x => normalized.startsWith(x.v, i));
    if (rune) {
      out.push(rune.i);
      i += rune.v.length;
    } else {
      i++;
    }
  }
  return out;
}

const sources = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/liber-primus/lp1-plaintext-reference.txt'
];
/** @type {Map<string, {spelling:string,values:number[]}>[]} */
const lexicon = Array.from({length:30}, () => new Map());
for (const source of sources) {
  for (const spelling of read(source).toUpperCase().match(/[A-Z]+/g) || []) {
    const values = encode(spelling);
    if (values.length > 0 && values.length < lexicon.length) {
      const id = values.join(',');
      if (!lexicon[values.length].has(id)) {
        lexicon[values.length].set(id, {spelling, values});
      }
    }
  }
}
assert.equal(lexicon.reduce((sum, map) => sum + map.size, 0), 12305);

const runeSet = new Set(gp.runes);
const pageStrings = read('resources/liber-primus/lp2-transcription.txt').split('%');
/**
 * Physical GP29 word starts/lengths; / line breaks do not end a word.
 * @param {number} page
 * @returns {{start:number,length:number}[]}
 */
function printedWords(page) {
  const words = [];
  let pos = 0;
  let length = 0;
  const finish = () => {
    if (length) {
      words.push({start:pos-length, length});
      length = 0;
    }
  };
  for (const ch of pageStrings[page]) {
    if (runeSet.has(ch)) {
      pos++;
      length++;
    } else if ('-.$&§'.includes(ch)) {
      finish();
    }
  }
  finish();
  assert.equal(pos, gp.pages[page].indices.length);
  return words;
}

const chapter = gp.pages.filter(p => p.page >= 8 && p.page <= 14)
  .flatMap(p => p.indices);
const left = chapter.slice(6*133+6, 6*133+6+121);
const right = gp.pages[32].indices;
assert.equal(chapter.length, 1729);
assert.equal(left.length, 121);
assert.equal(right.length, 121);
assert.deepEqual(left, gp.pages[11].indices.slice(18, 139),
  'The 13x133 center is a real contiguous p11 local18–138 substring');

const leftWords = printedWords(11)
  .map(w => ({start:w.start-18, length:w.length}))
  .filter(w => w.start >= 2 && w.start + w.length <= 117);
const rightWords = printedWords(32);
assert.equal(leftWords.length, 26);
assert.equal(rightWords.length, 22);
assert.equal(leftWords.reduce((n,w) => n + w.length, 0), 115);
assert.equal(rightWords.reduce((n,w) => n + w.length, 0), 121);

/** @returns {{left:number,right:number,start:number,length:number}[]} */
function longOverlaps() {
  const out = [];
  for (let a = 0; a < leftWords.length; a++) {
    for (let b = 0; b < rightWords.length; b++) {
      const A = leftWords[a], B = rightWords[b];
      const start = Math.max(A.start, B.start);
      const length = Math.min(A.start+A.length,B.start+B.length) - start;
      if (length >= 5) out.push({left:a,right:b,start,length});
    }
  }
  return out.sort((x,y) => y.length-x.length || x.start-y.start);
}
const overlaps = longOverlaps();
assert.deepEqual(overlaps.map(e => e.length), [8,6,6,5]);

/**
 * Counts every native-GP word-pair compatible with an actual ciphertext
 * difference in an overlapping original printed-word interval.
 * Offset is the completely free secret difference between two Caesar IVs.
 * @param {number[]} difference
 * @param {{left:number,right:number,start:number,length:number}} edge
 * @param {number} offset
 * @returns {number}
 */
function matchingPairs(difference, edge, offset) {
  const A = leftWords[edge.left], B = rightWords[edge.right];
  const leftOffset = edge.start - A.start;
  const rightOffset = edge.start - B.start;
  const rightSignatures = new Map();
  for (const word of lexicon[B.length].values()) {
    const key = word.values.slice(rightOffset, rightOffset+edge.length)
      .map((v,i) => mod(v+difference[edge.start+i]-offset)).join(',');
    rightSignatures.set(key, (rightSignatures.get(key)||0)+1);
  }
  let count = 0;
  for (const word of lexicon[A.length].values()) {
    const key = word.values.slice(leftOffset,leftOffset+edge.length).join(',');
    count += rightSignatures.get(key) || 0;
  }
  return count;
}

const originalDifference = left.map((c,i) => mod(c-right[i]));
const outcomes = overlaps.map(edge => {
  const matchesByOffset = Array.from({length:29},
    (_,offset) => matchingPairs(originalDifference,edge,offset));
  const a = leftWords[edge.left], b = rightWords[edge.right];
  return {page11:{localStart:a.start+18,length:a.length},
    page32:{localStart:b.start,length:b.length},
    overlapRunes:edge.length,
    candidates:[lexicon[a.length].size,lexicon[b.length].size],
    zeroOffsetPairs:matchesByOffset[0],
    offsetsWithPairs:matchesByOffset
      .map((n,offset) => ({offset,n})).filter(x => x.n>0)};
});
assert.deepEqual(outcomes.map(x => x.overlapRunes), [8,6,6,5]);
assert.deepEqual(outcomes.map(x => x.zeroOffsetPairs), [0,0,0,0]);
assert.equal(outcomes.filter(x => x.offsetsWithPairs.length===0).length,3);
assert.deepEqual(outcomes[3].offsetsWithPairs, [{offset:7,n:1}]);

// Complete positive: synthesize two original-boundary native-GP word
// streams; encrypt both under exactly the same 121-rune keystream;
// the difference cancels that pad and must preserve every injected pair.
const p1 = Array(121).fill(0), p2 = Array(121).fill(0);
for (const word of leftWords) {
  const native = lexicon[word.length].values().next().value.values;
  native.forEach((v,i) => {p1[word.start+i]=v;});
}
for (const word of rightWords) {
  const native = lexicon[word.length].values().next().value.values;
  native.forEach((v,i) => {p2[word.start+i]=v;});
}
const pad = Array.from({length:121}, (_,i) => (7*i+3)%29);
const planted1 = p1.map((v,i) => mod(v+pad[i]));
const planted2 = p2.map((v,i) => mod(v+pad[i]));
const plantedDifference = planted1.map((v,i) => mod(v-planted2[i]));
assert.deepEqual(plantedDifference, p1.map((v,i) => mod(v-p2[i])));
for (const edge of overlaps) {
  assert.ok(matchingPairs(plantedDifference, edge, 0)>=1,
    'Shared-pad native-word positive plant must be recognized');
}
console.log(JSON.stringify({
  hypothesis:'One common additive 121-rune pad plus arbitrary constant IV offset',
  originalGeometry:'LP2 13x133 pp8–14 center = p11 local18–138; compare p32 all121',
  vocabulary:{texts:sources,uniqueGPSequences:12305},
  printedWords:{p11Complete:26,p32:22},
  constraints:outcomes,
  nativePlantedSharedPad:{matchedAllFourLongOverlaps:true,
    exactPadCancellation:true},
  conclusion:'Direct literal alignment cannot give both passages attested native-GP words at three long independent overlaps, for any of 29 constant offsets. Other dictionaries, encodings, segmentation or changing pads remain possible.'
},null,2));
