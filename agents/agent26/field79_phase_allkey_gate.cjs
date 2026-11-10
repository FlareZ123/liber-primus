'use strict';
/**
 * Key-independent phase-78 permutation gate for source-motivated LP2
 * 164×79 cyclic rank framing. Reproduce with:
 *   node agents/agent26/field79_phase_allkey_gate.cjs
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
const {encode} = require('../../sims/word_partition_invariant.cjs');
const root = path.resolve(__dirname, '../..');
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
const sourceCheck=collisions(originalRanks.map((r,i)=>{
  if(r<0)return -1;
  // Map native source back to original EA positions.
  let count=0;
  for(let k=0;k<=i;k++)if(originalRanks[k]>=0)count++;
  return source[count-1];
}),positiveStates);
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
  models:table,
  planted:{secretPhaseTables:78,recovered:nUsed,
    fullExactRecovery:true,originalMarkerMaskPreserved:true,
    plantedStateEqualities:plantCheck.hits,plantedStatePairs:plantCheck.pairs},
  conclusion:'All 16 public-clock/nonce direct-native-GP-per-phase permutation models fail their key-independent source-equality fingerprint; this does not identify a historical cipher or plaintext.'
},null,2));
