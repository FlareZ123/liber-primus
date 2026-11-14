'use strict';
/**
 * Original LP2 p55 red60-keyed secret-label shift obstruction.
 * Run with Node.js 22:
 * node sims/lp2_red60_p55_allsecret_labelshift_sft.cjs
 * Source pattern: original p53 red51 + p54 red9 aligned to all sixty
 * p55 rune positions other than the initials of its sixteen complete words.
 * An arbitrary fixed shift T[label] for each of the 29 GP rune labels
 * applies as C[position] = P[position] + T[redLabel] (mod29).
 * T can be either a permutation (stronger condition) or unrestricted.
 * This test does not assume original key values or decrypt arbitrary LP2.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const dir = path.resolve(__dirname, '..');
const load = file => fs.readFileSync(path.join(dir, file), 'utf8');
const gp = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const symbol = new Map(gp.runes.map((x, i) => [x, i]));
const pages = load('resources/liber-primus/lp2-transcription.txt').split('%');
const words = (pages[54].replace(/\/\r?\n/g, '').match(
  new RegExp('[' + gp.runes.join('') + ']+', 'gu')) || [])
  .map(w => Array.from(w, ch => symbol.get(ch)));
const expected = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.deepEqual(words.map(w => w.length), expected);
const cipher = gp.pages[55].indices;
assert.deepEqual(words.flat(), cipher);
const red = gp.pages[53].indices.slice(128, 179)
  .concat(gp.pages[54].indices.slice(0, 9));
assert.equal(red.length, 60);
const slots = [];
let offset = 0;
for (let word=0;word<words.length;word++) {
  const loc = [];
  for (let i=0;i<words[word].length;i++) {
    if (word > 0 && i===0) continue;
    loc.push(offset+i);
  }
  slots.push(loc);
  offset+=words[word].length;
}
assert.equal(offset,76);
assert.equal(slots.flat().length,60);
const labels = new Map();
let keypos = 0;
const tagged = slots.map(loc => loc.map(position => {
  const key = red[keypos++];
  labels.set(key, (labels.get(key) || 0) + 1);
  return {position, key};
}));
assert.equal(labels.size, 26);
assert.equal(tagged[7].length,12);
/** @param {number[]} source @param {{position:number,key:number}[]} segment
 * @param {Map<number,number>} [existing]
 * @returns {Map<number,number>|null}
 */
function infer(source, segment, existing = new Map()) {
  const candidate = new Map(existing);
  for (let i=0;i<segment.length;i++) {
    const {position,key} = segment[i];
    const shift=(cipher[position]-source[i+1]+29)%29;
    if (candidate.has(key) && candidate.get(key)!==shift) return null;
    candidate.set(key, shift);
  }
  return candidate;
}
/** @param {Map<number,number>} shifts */
function injective(shifts) {return new Set(shifts.values()).size === shifts.size;}
const dictionary = load('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(x=>/^[a-z]+ \d+$/.test(x))
  .map(x=>({word:x.split(' ')[0], runes:encodeSourceNativeGP(x.split(' ')[0])}));
assert.equal(dictionary.length,29157);
const byLength = new Map();
for(const w of dictionary){
  if(!byLength.has(w.runes.length))byLength.set(w.runes.length,[]);
  byLength.get(w.runes.length).push(w);
}
const target = dictionary.filter(x=>x.runes.length===13);
const consistent=target.map(x=>({...x, shifts:infer(x.runes,tagged[7])}))
  .filter(x=>x.shifts);
assert.equal(target.length,382);
assert.deepEqual(consistent.map(x=>x.word), ['handkerchiefs'],
  'one finite native-English 13-rune word satisfies repeated red-label shifts');
assert.equal(consistent.filter(x=>injective(x.shifts)).length,0,
  'no arbitrary-secret 29-symbol bijective red-label mapping fits the 13-rune word');
const anchor = consistent[0].shifts;
const withinOthers = [5,14,15].map(w=>({
  wordOrdinal:w,
  survivingNativeLexicon:byLength.get(words[w].length)
    .filter(x=>infer(x.runes,tagged[w],anchor)!==null).length
}));
assert.deepEqual(withinOthers.map(x=>x.survivingNativeLexicon),[0,0,0],
  'even allowing noninjective shifts, three other words contradict the sole anchor');
const native = Array(76).fill(0);
let start=1;
for(let w=1;w<words.length;w++){
  const source=byLength.get(words[w].length)[(w*13)%byLength.get(words[w].length).length].runes;
  source.forEach((x,j)=>native[start+j]=x);
  start+=source.length;
}
assert.equal(start,76);
const plant = native.slice();
for (let w=0;w<tagged.length;w++)
 for(const {position,key} of tagged[w])
  plant[position]=(native[position]+(11*key+7)%29)%29;
for (let w=0;w<tagged.length;w++)
 for(const {position,key} of tagged[w])
  assert.equal((plant[position]-(11*key+7)%29+29)%29,native[position]);
let plantFits=0;
for(let w=1;w<words.length;w++){
  // Positive model: there exists a single 29-symbol secret bijection
  // that deciphers the planted word interiors and preserves native words.
  const nativeWord=native.slice(tagged[w][0].position-1,
    tagged[w][0].position-1+words[w].length);
  const shifts=new Map();
  for(let j=0;j<tagged[w].length;j++){
    const {position,key}=tagged[w][j];
    const sh=(plant[position]-nativeWord[j+1]+29)%29;
    assert(!shifts.has(key)||shifts.get(key)===sh);
    shifts.set(key,sh);
  }
  plantFits++;
}
assert.equal(plantFits,16);
console.log(JSON.stringify({
  source:'p53 red51 plus p54 red9 / p55 60 noninitial positions',
  originalWords:16,keyedRunes:60,secretRedLabels:labels.size,
  thirteenRuneDictionary:target.length,
  repeatedRedLabelNecessaryMatches:consistent.map(x=>x.word),
  bijectiveRedShiftMatches:0,
  noninjectiveAnchorContradictions:withinOthers,
  nativeGpPositivePlant:{runes:76,wordInteriors:16,roundTrip:true},
  unknownPlaintextRecovered:0,
  scope:'fixed printed order, source-native 29157-word English fixture, original printed word boundaries'
},null,2));
