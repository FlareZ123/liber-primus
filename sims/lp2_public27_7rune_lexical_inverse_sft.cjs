'use strict';

/**
 * Single-file original-source test of a seven-rune LP2 opening candidate.
 * This fully enumerates every GP29 source-node key, including both key-node
 * orientations, at the uniquely typeset original 2/1/2/2 word location.
 *
 * The starting-location rule and candidate English output were identified
 * retrospectively in 2026, and are not first-party Cicada instructions.
 * This test measures conditional specificity, not cryptographic authenticity.
 *
 * Run: node sims/lp2_public27_7rune_lexical_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} name Relative repository path. */
function read(name) { return fs.readFileSync(path.join(root, name), 'utf8'); }
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const wordlist = read('resources/control/english_wordfreq_textblob.txt');
const grid = source.pages.filter((p) => p.page <= 2).flatMap((p) => p.indices);
assert.deepEqual(source.pages.slice(0, 3).map((p) => p.indices.length), [262, 266, 201]);
assert.equal(grid.length, 729);
const runeId = new Map(source.runes.map((r, i) => [r, i]));
const mod = (v) => ((v % 29) + 29) % 29;

/** Parse authentic printed word boundaries, preserving cross-page/line words. */
function sourceWords() {
  const raw = transcription.split('%').slice(0, 55).join('%');
  const result = [];
  let token = [], start = -1, runeCount = 0;
  for (const ch of raw) {
    if (runeId.has(ch)) {
      if (token.length === 0) start = runeCount;
      token.push(runeId.get(ch));
      runeCount++;
    } else if (ch !== '%' && ch !== '/' && !/\s/u.test(ch)) {
      if (token.length) result.push({start, end:runeCount-1,
        sep:ch, indices:token});
      token = [];
    }
  }
  if (token.length) result.push({start, end:runeCount-1, sep:'', indices:token});
  assert.equal(runeCount, 12956);
  assert.equal(result.length, 2896);
  assert.deepEqual(result.flatMap((w) => w.indices),
    source.pages.filter((p) => p.page <= 55).flatMap((p) => p.indices));
  return result;
}
const printed = sourceWords();
const pattern = [2, 1, 2, 2];
const originalPattern = [];
for (let i = 0; i <= printed.length-4; i++) {
  if (pattern.every((length, j) => printed[i+j].indices.length === length)) {
    originalPattern.push(printed.slice(i, i+4));
  }
}
assert.equal(originalPattern.length, 1);
assert.deepEqual(originalPattern[0].map((w) => w.start), [348, 350, 351, 353]);
assert.deepEqual(originalPattern[0].map((w) => w.end), [349, 350, 352, 354]);
assert.deepEqual(originalPattern[0].map((w) => w.sep), ['.', '-', '-', '-']);
const position = originalPattern[0][0].start;
const originalCipher = grid.slice(position, position+7);
assert.deepEqual(originalCipher, [20, 25, 9, 2, 13, 1, 14]);

/** @param {number} n Positive GP index. */
function phi(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let result = n, rest = n;
  for (let p = 2; p*p <= rest; p++) if (rest % p === 0) {
    result -= result / p;
    while (rest % p === 0) rest /= p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}
/** @param {number} n Positive GP index. */
function mu(n) {
  assert.ok(Number.isInteger(n) && n > 0);
  let rest = n, sign = 1;
  for (let p = 2; p*p <= rest; p++) if (rest % p === 0) {
    rest /= p;
    sign = -sign;
    if (rest % p === 0) return 0;
    while (rest % p === 0) rest /= p;
  }
  return rest > 1 ? -sign : sign;
}

/**
 * Counts geometric positive-index key nodes, and each admissible orientation,
 * untransformed/transformed center, and mu(phi()) mod3 key rotation.
 */
const axes = [[0,1],[1,0],[1,1],[1,-1]];
const keys = new Map();
let geometricNodes = 0;
for (let row = 0; row < 27; row++) for (let col = 0; col < 27; col++) {
  for (const [dy, dx] of axes) for (let radius = 1; radius <= 13; radius++) {
    const y0 = row-dy*radius, x0=col-dx*radius;
    const y2 = row+dy*radius, x2=col+dx*radius;
    if (Math.min(y0,x0,y2,x2)<0||Math.max(y0,x0,y2,x2)>=27)continue;
    const original = [grid[27*y0+x0],grid[27*row+col],grid[27*y2+x2]];
    if (original.includes(0)) continue;
    geometricNodes++;
    for (const reversed of [false,true]) for (const changedCenter of [false,true]) {
      let key = reversed ? original.slice().reverse() : original.slice();
      if (changedCenter) key[1] = phi(key[1]);
      const phase = mod(key.reduce((sum, x) => sum+mu(phi(x)), 0)) % 3;
      key = key.slice(phase).concat(key.slice(0,phase));
      const signature = key.join(',');
      keys.set(signature, (keys.get(signature)||0)+1);
    }
  }
}
assert.equal(geometricNodes, 13012);
assert.equal([...keys.values()].reduce((a,b)=>a+b,0), 52048);
assert.equal(keys.size, 17095);

/** Source-native 29-GP English spelling encoder. */
const tokens = source.translit.map((value,i)=>({value,i}))
  .sort((a,b)=>b.value.length-a.value.length);
/** @param {string} word ASCII dictionary spelling. @returns {number[]|null} */
function encode(word) {
  word = word.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG');
  const result=[];
  for(let i=0;i<word.length;) {
    const t = tokens.find((candidate)=>word.startsWith(candidate.value,i));
    if (!t) return null;
    result.push(t.i);
    i += t.value.length;
  }
  return result;
}

/** Highest frequency attested spelling per unique source-native GP word. */
const dictionary = new Map();
for (const line of wordlist.split(/\r?\n/u)) {
  const match = /^([A-Za-z]+)\s+(\d+)$/.exec(line);
  if (!match) continue;
  const encoded = encode(match[1]);
  if (!encoded) continue;
  const id = encoded.join(',');
  const freq = Number(match[2]);
  const old = dictionary.get(id);
  if (!old || old.freq < freq) dictionary.set(id,{word:match[1],freq});
}
assert.equal(dictionary.size, 29061);

const results = [];
const shapeIndexes = [[0,2],[2,3],[3,5],[5,7]];
let allFourWords = 0, commonFourWords = 0;
for (const [keyString, modes] of keys) {
  const key = keyString.split(',').map(Number);
  const plain = originalCipher.map((c,i)=>mod(c-key[i%3]));
  const words = shapeIndexes.map(([start,end])=>
    dictionary.get(plain.slice(start,end).join(',')));
  if (!words.every(Boolean)) continue;
  allFourWords++;
  const common = ['a','i','o'].includes(words[1].word.toLowerCase()) &&
    words.every((w) => w.freq >= 100);
  if (common) commonFourWords++;
  const score = words.reduce((sum,w)=>sum+Math.log10(w.freq+1),0);
  results.push({phrase:words.map((w)=>w.word).join(' '),
    key, modes, frequencies:words.map((w)=>w.freq),
    score:Number(score.toFixed(3)),common});
}
results.sort((a,b)=>b.score-a.score);
assert.equal(allFourWords, 86);
assert.equal(commonFourWords, 2);
assert.equal(results[0].phrase, 'as i go the');
assert.deepEqual(results[0].key, [25,10,28]);
assert.deepEqual(results[0].frequencies, [8064,7687,905,80030]);
assert.equal(results[0].score,15.653);
assert.equal(results[0].modes,10);
assert.equal(results[1].phrase, 'no a ll to');
assert.deepEqual(results[1].key, [11,22,14]);
assert.equal(results[1].score,14.787);
const plaintext = originalCipher.map((v,i)=>mod(v-results[0].key[i%3]));
assert.deepEqual(plaintext,[24,15,10,6,3,2,18]);
assert.equal(plaintext.map((x)=>source.translit[x]).join(''),'ASIGOTHE');
assert.deepEqual(plaintext.map((x,i)=>mod(x+results[0].key[i%3])),originalCipher);

// Independently source-positioned key-node arithmetic, previously proposed.
assert.deepEqual(grid.slice(334,337),[25,11,28]); // original AE J EA
assert.deepEqual([25,phi(11),28],results[0].key); // AE I EA

console.log(JSON.stringify({
  evidenceScope:'Original LP2 pp0-2, selected retrospectively in public 2026 proposal',
  sourceStartingPosition:position,
  sourcePrintedPattern:pattern,
  uniqueMatchingPrintedPattern:originalPattern.length,
  originalCipher,
  sourceNodes:geometricNodes,
  sourceNodeOrientationAndCenterModes:geometricNodes*4,
  uniqueAlignedThreeRuneKeys:keys.size,
  dictionaryGpWordTypes:dictionary.size,
  validFourWordCandidates:allFourWords,
  commonSingleRuneAndWordFrequencyCandidates:commonFourWords,
  rankedCandidateReadings:results.slice(0,15),
  interpretation:'AS I GO THE is the top independent dictionary-frequency reading at this conditioned source position; the choice of location, key mechanism and phrase is historically retrospective, so authenticity is unproven.'
},null,2));
console.log('PASS: exhaustive source-rooted seven-rune lexical inverse, no authenticated unknown plaintext claimed.');
