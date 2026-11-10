'use strict';
/**
 * Key-independent phase-78 permutation gate for source-motivated LP2
 * 164×79 cyclic rank framing. Reproduce with:
 *   node sims/field79_phase_allkey_gate.cjs
 *
 * Every secret, fixed arbitrary bijection of GP28 for each public F79
 * phase preserves symbol equality between two positions in the same phase.
 * Test four publicly defined clocks × four salt/nonce variants, then
 * compare 200 contiguous native-GP Shakespeare windows per variant.
 * Source phase, EA interpretation, and candidate clocks are hypotheses.
 *
 * Node.js 22 / CJS, no third-party dependencies, no writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./word_partition_invariant.cjs');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const cipher = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const N = 12956, BLOCKS = 164, WIDTH = 79, PHASE = 35, PAYLOAD = 78;
assert.equal(cipher.length, N);
assert.equal(BLOCKS * WIDTH, N);
const mod = (x, n) => (x % n + n) % n;

// Ranks: 28 possible nonzero GP-index differences, -1 for zero (86 events).
const records = [];
for (let b = 0; b < BLOCKS; b++) {
  const first = (PHASE + b * WIDTH) % N;
  const salt = mod(cipher[first] - cipher[mod(first-1,N)], 29);
  for (let j = 1; j <= PAYLOAD; j++) {
    const d = mod(cipher[(first+j)%N] - cipher[(first+j-1)%N], 29);
    records.push({b, j, salt, rank:d ? d-1 : -1});
  }
}
assert.equal(records.length, 12792);
assert.equal(records.filter(x => x.rank < 0).length, 86);
assert.ok(records.every(x => x.salt > 0));

/**
 * Public state of a candidate F79 field element. The offset 35 shifts
 * phase labels uniformly in most clocks and cannot improve collisions.
 * @param {{b:number,j:number,salt:number}} x
 * @param {string} clock
 * @param {string} mix
 */
function phase(x, clock, mix) {
  let t;
  if (clock === 'global79') t = 79*x.b+x.j;
  else if (clock === 'payload78') t = 78*x.b+x.j-1;
  else if (clock === 'packetPlusColumn') t = x.b+x.j;
  else if (clock === 'blockOnly') t = x.b;
  else throw new Error('Unknown clock');
  t += PHASE;
  if (mix === 'addsalt') t += x.salt;
  else if (mix === 'xorsalt') t ^= x.salt;
  else if (mix === 'mulsalt') t += x.b*x.salt;
  else if (mix !== 'none') throw new Error('Unknown salt mix');
  return mod(t, 78);
}

/**
 * Equality under each unknown state-specific 28-symbol permutation
 * is an exact invariant, independent of all 78 secret tables.
 * @param {number[]} ranks -1 means a masked zero-difference site
 * @param {number[]} states
 */
function collisions(ranks, states) {
  const hist = new Uint16Array(78*28);
  const totals = new Uint16Array(78);
  let hits = 0, pairs = 0;
  for (let i = 0; i < ranks.length; i++) {
    const r = ranks[i];
    if (r < 0) continue;
    const s = states[i];
    hits += hist[s*28+r]++;
    pairs += totals[s]++;
  }
  return {hits, pairs, ioc:hits/pairs};
}

const originalRanks = records.map(x => x.rank);
const reference = read('resources/control/shakespeare_first300k.txt')
  .toUpperCase().match(/[A-Z]+/g).flatMap(encode)
  .filter(x => x < 28);
assert.ok(reference.length > 200000);
const nUsed = originalRanks.filter(x => x >= 0).length;
assert.equal(nUsed, 12706);

// Exact source-native contiguous controls at 200 evenly spaced offsets,
// with all 86 original zero-difference (conjectured EA) positions retained.
// These overlapping reference windows are NOT 200 independent null draws.
const windows = 200;
const starts = Array.from({length:windows},(_,i) =>
  1000 + Math.floor((reference.length - 14000)*i/windows));
const clocks = ['global79','payload78','packetPlusColumn','blockOnly'];
const mixes = ['none','addsalt','xorsalt','mulsalt'];
const table = [];
let globalControlMin = Infinity;
for (const clock of clocks) for (const mix of mixes) {
  const states = records.map(x => phase(x,clock,mix));
  const original = collisions(originalRanks,states);
  let minRef = Infinity, maxRef = -Infinity;
  for (const start of starts) {
    let k = 0;
    const planted = originalRanks.map(r => r < 0 ? -1 : reference[start+k++]);
    assert.equal(k,nUsed);
    const stat = collisions(planted,states).ioc;
    minRef = Math.min(minRef,stat);
    maxRef = Math.max(maxRef,stat);
  }
  globalControlMin = Math.min(globalControlMin,minRef);
  table.push({clock,mix,original,referenceMin:minRef,referenceMax:maxRef,
    windows,allReferenceWindowsAboveOriginal:minRef>original.ioc});
}
assert.equal(table.length, 16);
assert.ok(table.every(x => x.allReferenceWindowsAboveOriginal));

// All-secret 28-symbol top-k capacity for each of 78 phase tables.
// Unknown per-state bijections cannot change any state-local rank counts.
// For any set of k plaintext GP runes, its possible global frequency is
// bounded by the sum of the k largest counts in each state.
for(const row of table){
  const states=records.map(x=>phase(x,row.clock,row.mix));
  const h=Array.from({length:78},()=>new Uint16Array(28));
  for(let i=0;i<originalRanks.length;i++)
    if(originalRanks[i]>=0)h[states[i]][originalRanks[i]]++;
  row.capacity=new Array(28).fill(0);
  for(const stateHist of h){
    const counts=Array.from(stateHist).sort((a,b)=>b-a);
    let sum=0;
    for(let k=0;k<28;k++){sum+=counts[k];row.capacity[k]+=sum;}
  }
  row.minEdits=Infinity;
  row.nearestSourceOffset=-1;
}
// Exhaust all contiguous 12,706-GP-non-EA Shakespeare source windows.
// Each rune alteration changes a top-k occupancy by at most one, hence the
// largest source-minus-key-independent-capacity deficit lower-bounds edits.
// These source windows overlap; this is a finite, source-specific inequality.
const rolling=new Uint16Array(28);
for(let i=0;i<nUsed;i++)rolling[reference[i]]++;
let minNativeTop1=Infinity,minNativeTop12=Infinity;
for(let start=0;start<=reference.length-nUsed;start++){
  if(start){rolling[reference[start-1]]--;rolling[reference[start+nUsed-1]]++;}
  const sorted=Array.from(rolling).sort((a,b)=>b-a);
  const changes=table.map(()=>0);
  let sum=0;
  for(let k=0;k<28;k++){
    sum+=sorted[k];
    if(k===0)minNativeTop1=Math.min(minNativeTop1,sum);
    if(k===11)minNativeTop12=Math.min(minNativeTop12,sum);
    for(let i=0;i<table.length;i++)
      changes[i]=Math.max(changes[i],sum-table[i].capacity[k]);
  }
  for(let i=0;i<table.length;i++){
    const row=table[i];
    if(changes[i]<row.minEdits){
      row.minEdits=changes[i];row.nearestSourceOffset=start;
    }
  }
}
const sourceWindows=reference.length-nUsed+1;
assert.equal(sourceWindows,204462);
assert.equal(minNativeTop1,1381);
assert.equal(minNativeTop12,9608);
assert.ok(table.every(x=>x.minEdits>=2071));
const mostPermissive=table.slice().sort((a,b)=>a.minEdits-b.minEdits)[0];
assert.equal(mostPermissive.minEdits,2071);
const bestOriginal = table.slice().sort((a,b)=>b.original.ioc-a.original.ioc)[0];
assert.equal(bestOriginal.original.hits,37358);
assert.equal(bestOriginal.original.pairs,1028589);
assert.equal(bestOriginal.clock,'payload78');
assert.equal(bestOriginal.mix,'none');

// A *different* planted source-GP control with unknown arbitrary 28-way
// per-phase bijections, to demonstrate the invariant and full inversion.
const positiveClock = 'packetPlusColumn', positiveMix = 'addsalt';
const positiveStates = records.map(x=>phase(x,positiveClock,positiveMix));
const units = [1,3,5,9,11,13,15,17,19,23,25,27];
const keys = Array.from({length:78},(_,state)=>({
  a:units[(state*7+3)%units.length],b:(state*11+5)%28}));
const source = reference.slice(150000,150000+nUsed);
assert.equal(source.length,nUsed);
let offset=0;
const encrypted = originalRanks.map((rank,i)=>{
  if(rank<0)return -1;
  const {a,b}=keys[positiveStates[i]];
  return mod(a*source[offset++]+b,28);
});
assert.equal(offset,nUsed);
const reconstructed = encrypted.map((rank,i)=>{
  if(rank<0)return -1;
  const {a,b}=keys[positiveStates[i]];
  for(let x=0;x<28;x++) if(mod(a*x+b,28)===rank)return x;
  throw new Error('Missing secret inverse');
}).filter(x=>x>=0);
assert.deepEqual(reconstructed,source);
const plantCheck=collisions(encrypted,positiveStates);
let sourceCursor=0;
const sourceInOriginalMask=originalRanks.map(r=>r<0?-1:source[sourceCursor++]);
assert.equal(sourceCursor,nUsed);
const sourceCheck=collisions(sourceInOriginalMask,positiveStates);
assert.equal(plantCheck.hits,sourceCheck.hits);
assert.equal(plantCheck.pairs,sourceCheck.pairs);

console.log(JSON.stringify({
  interpretation:'Source-motivated F79 phase, entire fixed arbitrary GP28 permutation class',
  originalSource:{runes:12956,packets:164,packetWidth:79,
    payloadWidth:78,phase:35,zeroSteps:86,nonzeroRanks:nUsed},
  secretKeysCovered:'Any 78 arbitrary, fixed, phase-indexed GP28 permutations',
  sourceControls:{source:'GP-encoded Shakespeare',windowsPerModel:200,
    overlapping:true,exactOriginalMarkerMask:true},
  topOriginal:bestOriginal,
  minimumReferenceAcrossAllModels:globalControlMin,
  allSecretTopK:{contiguousControlWindows:sourceWindows,
    nativeMinimumTop1:minNativeTop1,nativeMinimumTop12:minNativeTop12,
    maximumOriginalTop12Capacity:Math.max(...table.map(x=>x.capacity[11])),
    minimumRequiredEditsAnyModelAnyWindow:mostPermissive.minEdits,
    leastExcludingClock:mostPermissive.clock,leastExcludingMix:mostPermissive.mix},
  models:table.map(x=>({...x,capacitySummary:{top1:x.capacity[0],top3:x.capacity[2],top12:x.capacity[11]},capacity:undefined})),
  planted:{secretPhaseTables:78,recovered:nUsed,
    fullExactRecovery:true,originalMarkerMaskPreserved:true,
    plantedStateEqualities:plantCheck.hits,plantedStatePairs:plantCheck.pairs},
  conclusion:'All 16 public-clock/nonce direct-native-GP-per-phase permutation models fail their key-independent source-equality fingerprint; this does not identify a historical cipher or plaintext.'
},null,2));
