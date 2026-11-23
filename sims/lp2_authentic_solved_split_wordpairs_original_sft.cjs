'use strict';

/**
 * Author-authentic solved-Cicada GP29 calibration of the exact unknown
 * word-private equality-pair cipher no-go. One frozen source train/holdout
 * split, 4,096 full-layout resamples per pool, and complete missing-length
 * accounting. No fitted keys or new plaintext claims.
 *
 * node sims/lp2_authentic_solved_split_wordpairs_original_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname,'..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const canonicalPath='resources/liber-primus/lp2-corpus.json';
const transcriptPath='resources/liber-primus/lp2-transcription.txt';
const authenticPath='resources/external/relikd-solved-gp29-native-v1.json';
const corpus=JSON.parse(read(canonicalPath));
const src=read(transcriptPath);
const solved=JSON.parse(read(authenticPath));
assert.deepEqual(solved.runes,corpus.runes);
const idx=new Map(corpus.runes.map((ch,i)=>[ch,i]));

/** Exact original word parse: page and line wraps are not word breaks. */
function parse(s,original=false) {
  const out=[];let w=[];
  for(const ch of s) {
    if(idx.has(ch)) w.push(idx.get(ch));
    else if(original && (ch==='%'||ch==='/'||/\s/u.test(ch))) continue;
    else if(w.length) {out.push(w);w=[];}
  }
  if(w.length)out.push(w);
  return out;
}
function E(word) {
  const m=Array(29).fill(0);
  for(const rune of word)m[rune]++;
  return m.reduce((sum,n)=>sum+n*(n-1)/2,0);
}
const rawUnknown=src.split('%').slice(0,55).join('%');
const unknown=parse(rawUnknown,true);
assert.equal(unknown.length,2896);
assert.equal(unknown.flat().length,12956);
assert.deepEqual(unknown.flat(),corpus.pages.filter(p=>p.page<=55)
  .flatMap(p=>p.indices));
assert.equal(unknown.reduce((s,w)=>s+E(w),0),811);

/**
 * Prespecified provenance split by first-party *section*, not individual
 * words. 5 LP1 sections are training; the remaining 4 heldout source records
 * include the actual solved p56 and p57 (and older solved image excerpts).
 */
const training=solved.sections.slice(0,5).flatMap(s=>parse(s.source_text));
const heldout=solved.sections.slice(5).flatMap(s=>parse(s.source_text));
assert.equal(training.length,589);
assert.equal(heldout.length,151);
function buildPool(words) {
  const p=new Map();
  for(const w of words) {
    if(!p.has(w.length)) p.set(w.length,[]);
    p.get(w.length).push(E(w));
  }
  return p;
}
const pools=[buildPool(training),buildPool(heldout)];
const common=unknown.filter(w=>pools.every(p=>p.has(w.length)));
const omitted=unknown.filter(w=>pools.some(p=>!p.has(w.length)));
assert.equal(common.length,2875);
assert.deepEqual(omitted.map(w=>w.length).sort((a,b)=>a-b),
  [...Array(18).fill(12),...Array(3).fill(14)]);
assert.equal(common.reduce((s,w)=>s+E(w),0),760);
const registered=common.map(w=>[w.length,E(w)]);
let seed=0x3301a211;
function pick(n) {
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  return Math.floor(seed/4294967296*n);
}
function describe(values) {
  const a=values.slice().sort((x,y)=>x-y);
  return {min:a[0], p05:a[Math.floor(a.length*.05)],
    median:a[Math.floor(a.length*.5)], p95:a[Math.floor(a.length*.95)],
    max:a.at(-1)};
}
const results=[];
for(let gi=0;gi<2;gi++) {
  const p=pools[gi];const sums=[],dynamicWords=[],gapPairs=[];
  for(let sample=0;sample<4096;sample++) {
    let total=0,required=0,gap=0;
    for(const [L,ec] of registered) {
      const donor=p.get(L);
      const ep=donor[pick(donor.length)];
      total+=ep;
      if(ep>ec) {required++;gap+=ep-ec;}
    }
    sums.push(total);dynamicWords.push(required);gapPairs.push(gap);
  }
  assert.equal(sums.filter(v=>v<=811).length,0);
  results.push({source:gi===0?'train LP1':'holdout solved Cicada',
    sourceWords:gi===0?training.length:heldout.length,
    sampledWords:2875, sampledCount:4096, pairs:describe(sums),
    mandatoryWordChanges:describe(dynamicWords),
    atLeastSuppressedEqualPairs:describe(gapPairs),
    lowTailComparedToFullOriginal811:0});
}
assert.deepEqual(results.map(x=>x.pairs.min),[1107,985]);
assert.deepEqual(results.map(x=>x.pairs.median),[1220,1080]);
assert.deepEqual(results.map(x=>x.mandatoryWordChanges.min),[503,453]);

/** Heldout p56's actual reversible, nonstationary prime-totient cipher. */
const knownP56=solved.sections.find(s=>s.name==='p56_an_end');
assert.ok(knownP56);
const p56Plain=parse(knownP56.source_text);
const p56Original=parse(src.split('%')[55], true);
assert.equal(p56Plain.length,25);
assert.equal(p56Original.length,25);
assert.deepEqual(p56Plain.map(w=>w.length),p56Original.map(w=>w.length));
assert.equal(p56Plain.flat().length,85);
assert.equal(p56Plain.reduce((s,w)=>s+E(w),0),9);
assert.equal(p56Original.reduce((s,w)=>s+E(w),0),1);
const p57Native=solved.sections.find(s=>s.name==='p57_parable');
assert.equal(parse(p57Native.source_text).flat().length,95);

/** A fixed-content regression for the solved style source, not a key fit. */
const sources=[canonicalPath,transcriptPath,authenticPath];
const hashes=Object.fromEntries(sources.map(n=>[n,
  crypto.createHash('sha256').update(read(n)).digest('hex')]));
console.log('INPUTS',JSON.stringify(hashes));
console.log('FROZEN_SPLIT',JSON.stringify({
  sectionNames:solved.sections.map(s=>s.name),
  trainSections:solved.sections.slice(0,5).map(s=>s.name),
  heldoutSections:solved.sections.slice(5).map(s=>s.name),
  trainWords:training.length, heldoutWords:heldout.length,
  unknownWords:unknown.length, unknownRunes:12956, unknownPairs:811,
  commonPositions:common.length, commonPairs:760,
  missingLength12:18, missingLength14:3,
  missingSlotTreatment:'zero additional native collisions, an intentionally maximally favorable lower bound'
}));
for(const r of results)console.log('CONTROL',JSON.stringify(r));
console.log('SOLVED_P56_NONSTATIONARY_WITNESS',JSON.stringify({
  ciphertextWords:25, plaintextWords:25, wordLengthsPreserved:true,
  knownPlainPairs:9,originalCipherPairs:1,
  authorKnownMechanism:'position-varying prime-totient plus literal F bypass'
}));
console.log('PASS: creator-authentic train/holdout excludes original word-private static-symbol map under its native-word assumptions, no unknown plaintext');
