#!/usr/bin/env node
'use strict';

/**
 * 2015 first-chapter prime-delta: fixed event-value extraction.
 * The participant explicitly noticed exactly 40 identical-neighbor D
 * values, so preserve each right-side repeated value (including overlapping
 * repeats in three-/four-symbol runs) as one GP29 rune in printed order.
 * Test the only literal 40-rune event-value readout against native English.
 * This is an analyst hypothesis, not an authenticated Cicada cipher.
 *
 * Windows 11, Node 22: one read-only standalone SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(base, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = corpus.pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(source.length, 729);
assert.equal(corpus.pages[57].indices.length, 95);
const mod = value => ((value % 29) + 29) % 29;
const primes = [];
for (let n = 2; primes.length < source.length + 1; n++) {
  let prime = true;
  for (let q = 2; q*q <= n; q++) if (n%q === 0) {prime = false; break;}
  if (prime) primes.push(n);
}
assert.equal(primes[0], 2);
assert.equal(primes[1], 3);

/** @param {number[]} cipher @returns {number[]} */
function primeDelta(cipher) {
  let previous = mod(-primes[0]);
  return cipher.map((c, i) => {
    const shifted = mod(c - primes[i+1]);
    const difference = mod(shifted - previous);
    previous = shifted;
    return difference;
  });
}

/** @param {number[]} diffs @returns {number[]} */
function inverseDelta(diffs) {
  let previous = mod(-primes[0]);
  return diffs.map((d, i) => {
    previous = mod(previous + d);
    return mod(previous + primes[i+1]);
  });
}

/** @param {number[]} d @returns {{position:number,value:number}[]} */
function repeatedRightValues(d) {
  return d.flatMap((v, i) =>
    i > 0 && v === d[i-1] ? [{position:i,value:v}] : []);
}
const originalD = primeDelta(source);
assert.deepEqual(inverseDelta(originalD), source);
const events = repeatedRightValues(originalD);
assert.equal(events.length, 40);
assert.deepEqual(events.map(e=>e.position), [
  9,49,57,65,67,124,158,161,174,226,227,289,323,336,340,367,
  374,456,460,477,488,493,504,509,527,541,545,546,547,555,572,574,
  610,618,676,687,707,710,711,724
]);
const values = events.map(e => e.value);
assert.deepEqual(values, [
  9,18,3,28,7,3,22,7,5,28,28,3,16,13,26,2,17,7,25,21,
  10,28,19,4,19,3,26,26,26,13,16,7,8,21,3,21,24,17,17,14
]);
const latin = a => a.map(n => corpus.translit[n]).join('');
assert.equal(latin(values),
  'NEOEAWOOEWCEAEAOTPYTHBWAENGIEAMRMOYYYPTWHNGONGABBX');

// Historical original exactly selects the event-count maximum among the
// 729 shifts of *ciphertext* relative to the fixed prime clock.
const phaseCounts = Array.from({length:729}, (_, i) => repeatedRightValues(primeDelta(
  source.slice(i).concat(source.slice(0,i)))).length);
assert.equal(Math.max(...phaseCounts), 40);
assert.deepEqual(phaseCounts.flatMap((n,i)=>n===40?[i]:[]),[0]);

// Native alphabet mapping, using source spellings that are actually attested
// in original Cicada solved pages. Use independent Shakespeare to test scores.
const token = corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} text @returns {number[]} */
function encode(text) {
  const normalized = text.toUpperCase().replace(/QU/g,'CW')
    .replace(/ING/g,'NG').replace(/IO/g,'IA').replace(/K/g,'C')
    .replace(/V/g,'U').replace(/Z/g,'S');
  const output = [];
  for (const word of normalized.match(/[A-Z]+/g)||[]) {
    for (let remain=word;remain.length;) {
      const matched = token.find(x => remain.startsWith(x.s));
      if (!matched) break;
      output.push(matched.i);
      remain = remain.slice(matched.s.length);
    }
  }
  return output;
}
const train = encode(read('resources/control/gibran_prophet_58585.txt'));
const validation = encode(read('resources/control/shakespeare_first300k.txt'));
assert.deepEqual([train.length,validation.length],[62492,217106]);

const tri = new Uint32Array(29**3), pair = new Uint32Array(29**2);
for (let i=2;i<train.length;i++) {
  tri[train[i-2]*841+train[i-1]*29+train[i]]++;
  pair[train[i-2]*29+train[i-1]]++;
}
/** @param {number[]} seq @returns {number} */
function languageScore(seq) {
  assert.ok(seq.length>=3);
  let log=0;
  for(let i=2;i<seq.length;i++){
    const b=seq[i-2]*29+seq[i-1];
    log+=Math.log((tri[b*29+seq[i]]+0.05)/(pair[b]+29*0.05));
  }
  return log/(seq.length-2);
}
const originalScore = languageScore(values);
const english40 = Array.from({length:1000},(_,i)=>
  languageScore(validation.slice(i*200,i*200+40)));
assert.ok(english40.every(s=>s > originalScore));
assert.ok(originalScore < -4.9 && originalScore > -5.1);

// Exact positive: synthesize a *genuine* 729-rune encoded register with
// exactly forty nonadjacent neighbor-equality events containing the first
// forty original clear p57 runes; every other difference is constrained
// unequal to its predecessor. This tests both full invertibility and the
// ability to recover a deliberately carried 40-symbol native message.
const positiveText = corpus.pages[57].indices.slice(0,40);
const plantedSites = new Set(positiveText.map((_,i)=>11+i*17));
assert.equal(plantedSites.size,40);
const plantedD=[];
const targetBySite = new Map(positiveText.map((v,i)=>[11+i*17,v]));
for(let i=0;i<729;i++){
  let value;
  if(targetBySite.has(i)) {
    value = targetBySite.get(i);
  } else if(targetBySite.has(i+1)) {
    value = targetBySite.get(i+1);
  } else {
    value = mod(i*11+3);
    while((i>0 && value===plantedD[i-1]) ||
      (targetBySite.has(i+2) && value===targetBySite.get(i+2))) {
      value=mod(value+1);
    }
  }
  plantedD.push(value);
}

const plantedCipher=inverseDelta(plantedD);
assert.deepEqual(primeDelta(plantedCipher),plantedD);
const plantedEvents=repeatedRightValues(primeDelta(plantedCipher));
assert.equal(plantedEvents.length,40);
assert.deepEqual(plantedEvents.map(x=>x.position),[...plantedSites]);
assert.deepEqual(plantedEvents.map(x=>x.value),positiveText);
const positiveScore=languageScore(positiveText);
assert.ok(positiveScore>-3.7);
assert.ok(originalScore<Math.min(...english40));

// A second source-motivated, completely typed 40-symbol consumer:
// original p32 (121 runes) can be interpreted as an inferred 11x11 square;
// solved p57 says SHED CIRCUMFERENCES. Take exactly the clockwise outer 40,
// from its upper-left cell, and subtract the documented 2015 40 event values.
const p32 = corpus.pages[32].indices;
assert.equal(p32.length, 121);
const outer = [];
for(let col=0;col<11;col++) outer.push(col);
for(let row=1;row<11;row++) outer.push(row*11+10);
for(let col=9;col>=0;col--) outer.push(110+col);
for(let row=9;row>=1;row--) outer.push(row*11);
assert.equal(outer.length, 40);
assert.equal(new Set(outer).size, 40);
const ring = outer.map(i=>p32[i]);
const ringRead = ring.map((v,i)=>mod(v-values[i]));
const indexCoincidence = xs => {
  const count=new Uint32Array(29);
  for(const v of xs) count[v]++;
  return count.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
};
assert.equal(latin(ringRead),'JPOEHEIALLFHOERSIBSMASOTHETLYHOMRPTNGHFEOAYLXD');
assert.ok(Math.abs(indexCoincidence(ringRead)-0.03205128205128205)<1e-12);
const ringPositiveCipher = positiveText.map((v,i)=>mod(v+values[i]));
assert.deepEqual(ringPositiveCipher.map((v,i)=>mod(v-values[i])),positiveText);

console.log(JSON.stringify({
  sourcePages:'p0-p2',sourceRunes:source.length,
  eventRule:'first-prime-shift difference; keep every right-side repeated D value',
  original:{events:events,valuesGP29:values,transliteration:latin(values),
    meanTrigramLogProbability:originalScore},
  phaseCounts:{max40AtOnlyPhase0:true},
  p32Outer40DirectKey: {
    consumer:'source p32 inferred 11x11 clockwise border, C minus 2015 forty event values',
    originalOutput:latin(ringRead), originalIoC:indexCoincidence(ringRead),
    unmodifiedBorderIoC:indexCoincidence(ring),
    positivePlant40:latin(positiveText),
    positiveRecoveredExactly:true
  },
  independentEnglish:{trainingRunes:train.length,validationRunes:validation.length,
    windows40:english40.length,lowestScore:Math.min(...english40),
    windowsAtOrBelowOriginal:english40.filter(s=>s<=originalScore).length},
  native40Positive:{events:plantedEvents.length,message:latin(positiveText),
    logProbability:positiveScore,exactRoundtrip:true},
  decision:'Original forty event values have no coherent GP-native English reading. No authored event codec, key, plaintext or destination.'
},null,2));
