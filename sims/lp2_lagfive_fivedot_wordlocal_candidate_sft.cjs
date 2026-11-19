'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n'); }

const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const sections = read('resources/liber-primus/lp2-transcription.txt').split('%');
assert.equal(sections.length, 57);
const words = [];
let current = [];
for (let s = 0; s < 55; s++) {
  for (const ch of sections[s]) {
    if (runeMap.has(ch)) current.push(runeMap.get(ch));
    else if ('-.&$§'.includes(ch) && current.length) { words.push(current); current = []; }
  }
}
if (current.length) words.push(current);
assert.equal(words.length, 2896);
assert.equal(words.reduce((n, w) => n + w.length, 0), 12956);
const lengthCounts = new Int32Array(15);
for (const w of words) lengthCounts[w.length]++;
assert.deepEqual(Array.from(lengthCounts), [0,83,448,720,513,317,256,216,156,78,52,32,18,4,3]);

const translitTokens = gp.translit.map((symbol, value) => ({symbol: symbol.toLowerCase(), value})).sort((a,b) => b.symbol.length-a.symbol.length);
function encodeGP(word) {
  const norm = word.toLowerCase().replace(/qu/g, 'cw').replace(/ing/g, 'ng').replace(/io/g, 'ia').replace(/[vkz]/g, c => ({v:'u',k:'c',z:'s'})[c]);
  const out = [];
  for (let i = 0; i < norm.length;) {
    const token = translitTokens.find(t => norm.startsWith(t.symbol, i));
    assert.ok(token, 'Unknown GP English input ' + word);
    out.push(token.value); i += token.symbol.length;
  }
  return out;
}
const nativeByLength = Array.from({length:15}, () => new Set());
for (const file of ['resources/control/gibran_prophet_58585.txt','resources/control/shakespeare_first300k.txt']) {
  for (const word of read(file).match(/[A-Za-z]+/g) || []) {
    const encoded = encodeGP(word);
    if (encoded.length <= 14) nativeByLength[encoded.length].add(encoded.join(','));
  }
}
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
for (const section of solved.sections) {
  let word = [];
  for (const ch of section.source_text) {
    if (runeMap.has(ch)) word.push(runeMap.get(ch));
    else if (word.length) { if (word.length <= 14) nativeByLength[word.length].add(word.join(',')); word = []; }
  }
  if (word.length && word.length <= 14) nativeByLength[word.length].add(word.join(','));
}
const expectedSizes = [0,14,67,336,961,1247,1342,1086,781,523,280,159,74,22,5];
assert.deepEqual(nativeByLength.map(s => s.size), expectedSizes);
const native = new Set(nativeByLength.flatMap(s => [...s]));
assert.equal(native.size, 6897);
function hits(candidateWords) { return candidateWords.filter(w => native.has(w.join(','))).length; }
const baseline = hits(words);
assert.equal(baseline, 79);

const keySpecs = [
  {name:'pentagram clockwise 1-based', key:[1,3,5,2,4]},
  {name:'pentagram counterclockwise 1-based', key:[1,4,2,5,3]},
  {name:'pentagram clockwise 0-based', key:[0,2,4,1,3]},
  {name:'pentagram counterclockwise 0-based', key:[0,3,1,4,2]}
];
const keyResults = [];
for (const spec of keySpecs) for (const sign of [-1, 1]) {
  const candidate = words.map(w => w.map((v, i) => (v + sign * spec.key[i % 5] + 29) % 29));
  keyResults.push({name:spec.name, sign, hits:hits(candidate)});
}
assert.deepEqual(keyResults.map(x => x.hits), [92,77,89,91,88,85,97,77]);

function railForward(word, order) {
  const out = [];
  for (const r of order) for (let i = r; i < word.length; i += 5) out.push(word[i]);
  return out;
}
function railInverse(word, order) {
  const lengths = Array.from({length:5}, (_, r) => Math.max(0, Math.ceil((word.length - r) / 5)));
  const blocks = Array(5); let p = 0;
  for (const r of order) { blocks[r] = word.slice(p, p + lengths[r]); p += lengths[r]; }
  const out = [];
  for (let i = 0; i < word.length; i++) out.push(blocks[i % 5][Math.floor(i / 5)]);
  return out;
}
const natural = [0,1,2,3,4], star = [0,2,4,1,3], reverseStar = [0,3,1,4,2];
const railResults = [
  {name:'natural forward', fn:w => railForward(w,natural)},
  {name:'natural inverse', fn:w => railInverse(w,natural)},
  {name:'pentagram forward', fn:w => railForward(w,star)},
  {name:'pentagram inverse', fn:w => railInverse(w,star)},
  {name:'reverse-star forward', fn:w => railForward(w,reverseStar)},
  {name:'reverse-star inverse', fn:w => railInverse(w,reverseStar)}
].map(x => ({name:x.name, hits:hits(words.map(x.fn))}));
assert.deepEqual(railResults.map(x => x.hits), [79,79,79,79,77,77]);

function pairCounts(word) {
  let adjacent = 0, lag5 = 0;
  for (let i = 0; i + 1 < word.length; i++) if (word[i] === word[i+1]) adjacent++;
  for (let i = 0; i + 5 < word.length; i++) if (word[i] === word[i+5]) lag5++;
  return [adjacent, lag5];
}
const pools = {Gibran:Array.from({length:15},()=>[]), Shakespeare:Array.from({length:15},()=>[]), SolvedCicada:Array.from({length:15},()=>[])};
for (const [name,file] of [['Gibran','resources/control/gibran_prophet_58585.txt'],['Shakespeare','resources/control/shakespeare_first300k.txt']]) {
  for (const word of read(file).match(/[A-Za-z]+/g) || []) { const encoded = encodeGP(word); if (encoded.length <= 14) pools[name][encoded.length].push(encoded); }
}
for (const section of solved.sections) {
  let word = [];
  for (const ch of section.source_text) {
    if (runeMap.has(ch)) word.push(runeMap.get(ch));
    else if (word.length) { if (word.length <= 14) pools.SolvedCicada[word.length].push(word); word = []; }
  }
  if (word.length && word.length <= 14) pools.SolvedCicada[word.length].push(word);
}
function expectedStats(transform) {
  const out = {};
  for (const [family, byLength] of Object.entries(pools)) {
    const sums = Array.from({length:15}, () => [0,0]);
    const counts = new Int32Array(15);
    for (let len = 1; len <= 14; len++) for (const word of byLength[len]) {
      const [a,l] = pairCounts(transform(word)); sums[len][0] += a; sums[len][1] += l; counts[len]++;
    }
    let adjacent = 0, lag5 = 0;
    for (let len = 1; len <= 14; len++) if (counts[len]) {
      adjacent += lengthCounts[len] * sums[len][0] / counts[len];
      lag5 += lengthCounts[len] * sums[len][1] / counts[len];
    }
    out[family] = {adjacent, lag5};
  }
  return out;
}
const period5Control = expectedStats(w => w.map((v,i) => (v - [1,3,5,2,4][i%5] + 29) % 29));
const railInverseControl = expectedStats(w => railInverse(w,natural));
assert.ok(period5Control.Gibran.adjacent > 350 && period5Control.Gibran.adjacent < 360);
assert.ok(railInverseControl.Gibran.adjacent > 390 && railInverseControl.Gibran.adjacent < 400);

const expectedRandomHits = expectedSizes.reduce((sum, size, len) => sum + lengthCounts[len] * size / (29 ** len), 0);
assert.ok(Math.abs(expectedRandomHits - 86.39592509418684) < 1e-9);
const report = {
  original:{words:words.length,runes:words.reduce((n,w)=>n+w.length,0),lengthCounts:Array.from(lengthCounts),baselineNativeHits:baseline},
  fiveDotPeriod5Keys:keyResults,
  fiveRailTranspositions:railResults,
  nativeControlExpected:{period5Additive:period5Control, inverseFiveRail:railInverseControl},
  uniform29WordLengthMatchedExpectedHits:expectedRandomHits,
  bestPeriod5CandidateHits:Math.max(...keyResults.map(x=>x.hits)),
  observedOriginal:{withinWordAdjacentRepeats:63,withinWordLag5Repeats:104}
};
console.log(JSON.stringify(report, null, 2));