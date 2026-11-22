#!/usr/bin/env node
'use strict';

/**
 * Original-source LP2 p51 self-clock and p50 11+2 cycle gate.
 * Repro: node sims/lp2_p51_selfclock_cycle_gate_sft.cjs
 * Uses no network, third-party packages, or mutable source files.
 * Experimental tests are calibrated for post-selected claims, not proofs of intent.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const imagePages = transcription.split('%').filter(s => /[ᚠ-ᛡ]/u.test(s));
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const runes = /[ᚠ-ᛡ]+/gu;
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.equal(imagePages.length, 57, 'p50 has no rune-bearing page');
for (const p of grid.pages) {
  assert.deepEqual(p.tokens.map(t => 60 * grid.alphabet.indexOf(t[0]) + grid.alphabet.indexOf(t[1])), p.bytes);
}
/** @param {string} page */
function words(page) {
  return page.replace(/[\r\n/]/g, '').split(/[-.]/)
    .map(part => (part.match(runes) || []).join('')).filter(Boolean)
    .map(w => Array.from(w, ch => {
      const id = index.get(ch);
      assert.notEqual(id, undefined);
      return id;
    }));
}
const getWords = (page) => words(imagePages[page < 50 ? page : page - 1]);
const page51 = getWords(51);
const page57 = getWords(57);
assert.equal(page51.length, 20);
assert.equal(page51.flat().length, 92);
assert.equal(page57.length, 20);
assert.equal(page57.flat().length, 95);
assert.deepEqual(page51[0], [7, 7, 13]);
const p51Prime = page51[0].reduce((sum, i) => sum + corpus.prime[i], 0);
assert.equal(p51Prime, 81);
const source = Array.from({length: 55}, (_, i) => {
  const page = i < 50 ? i : i + 1;
  const ws = getWords(page);
  const w = ws[0];
  return {page, count:ws.length, candidates:[
    w.reduce((s, i) => s + i, 0),
    w.reduce((s, i) => s + i + 1, 0),
    w.reduce((s, i) => s + corpus.prime[i], 0),
    w.length
  ]};
});
const eligible = source.flatMap(p => p.candidates
  .map((address, mode) => ({address, mode, page:p.page, count:p.count}))
  .filter(o => o.address >= 0 && o.address < 256));

/** O(256) preperiod computation, including cycle lengths, for a total byte-successor map. */
function profile(next) {
  const depth = new Int16Array(256).fill(-1);
  const stamp = new Int16Array(256);
  const indexAt = new Int16Array(256);
  const cycles = [];
  let clock = 0;
  for (let start = 0; start < 256; start++) {
    if (depth[start] !== -1) continue;
    clock++;
    const walk = [];
    let x = start;
    while (depth[x] === -1 && stamp[x] !== clock) {
      stamp[x] = clock;
      indexAt[x] = walk.length;
      walk.push(x);
      x = next[x];
    }
    if (depth[x] === -1) {
      const entry = indexAt[x];
      cycles.push(walk.length - entry);
      for (let i = entry; i < walk.length; i++) depth[walk[i]] = 0;
      for (let i = entry - 1; i >= 0; i--) depth[walk[i]] = depth[next[walk[i]]] + 1;
    } else {
      for (let i = walk.length - 1; i >= 0; i--) depth[walk[i]] = depth[next[walk[i]]] + 1;
    }
  }
  cycles.sort((a, b) => a - b);
  return {depth, cycles};
}
/** @param {number[]} next */
function sourceStat(next) {
  const profile0 = profile(next);
  const matches = eligible.filter(q => profile0.depth[q.address] === q.count);
  return {
    cycle11plus2:profile0.cycles.length === 2 && profile0.cycles[0] === 2 && profile0.cycles[1] === 11,
    p51Self:profile0.depth[81] === 20,
    any:matches.length > 0,
    primeAny:matches.some(q => q.mode === 2),
    matches,
    profile:profile0
  };
}
const observed = sourceStat(bytes);
assert.equal(observed.cycle11plus2, true);
assert.equal(observed.p51Self, true);
assert.deepEqual(observed.matches.map(x => [x.page, x.mode, x.address, x.count]), [[51,2,81,20]]);
let state = 81;
const route = [state];
for (let i = 0; i < 20; i++) {state = bytes[state]; route.push(state);}
assert.equal(state, 115);
assert.equal(observed.profile.depth[115], 0);
assert.equal(observed.profile.depth[32], 1);
const depth20 = Array.from(observed.profile.depth, (n, i) => n === 20 ? i : -1).filter(n => n >= 0);
assert.deepEqual(depth20, [81, 204, 220]);

function rng32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}
function shuffle(a, start, end, random) {
  for (let i = end - 1; i > start; i--) {
    const j = start + Math.floor(random() * (i - start + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
}
function tabulate(N, seed, mode) {
  const random = rng32(seed);
  const total = {cycles:0,self:0,any:0,primeAny:0,cyclesAndSelf:0,cyclesAndAny:0,cyclesAndPrime:0};
  for (let i = 0; i < N; i++) {
    const f = bytes.slice();
    if (mode === 'global') shuffle(f, 0, 256, random);
    else {
      shuffle(f, 0, 80, random);
      shuffle(f, 80, 184, random);
      shuffle(f, 184, 256, random);
    }
    const q = sourceStat(f);
    total.cycles += Number(q.cycle11plus2);
    total.self += Number(q.p51Self);
    total.any += Number(q.any);
    total.primeAny += Number(q.primeAny);
    total.cyclesAndSelf += Number(q.cycle11plus2 && q.p51Self);
    total.cyclesAndAny += Number(q.cycle11plus2 && q.any);
    total.cyclesAndPrime += Number(q.cycle11plus2 && q.primeAny);
  }
  return {mode,N,seed,counts:total};
}
function graphRelabelNull(N, seed, byPage) {
  const random = rng32(seed);
  const counts = {self:0,any:0,primeAny:0};
  const depth = observed.profile.depth;
  for (let i = 0; i < N; i++) {
    const permutation = Array.from({length:256}, (_, j) => j);
    if (byPage) {
      shuffle(permutation, 0, 80, random);
      shuffle(permutation, 80, 184, random);
      shuffle(permutation, 184, 256, random);
    } else shuffle(permutation, 0, 256, random);
    counts.self += Number(depth[permutation[81]] === 20);
    let any = false, primeAny = false;
    for (const q of eligible) {
      if (depth[permutation[q.address]] === q.count) {
        any = true;
        if (q.mode === 2) primeAny = true;
      }
    }
    counts.any += Number(any);
    counts.primeAny += Number(primeAny);
  }
  return {mode: byPage ? 'page-relabel' : 'global-relabel',N,seed,counts};
}

/* Plausible fixed but unauthenticated consumer: word-wise GP29 subtraction
   by the 20 path states modulo29. The p51 source opener fixes start81. */
let x = 81;
const decrypted = page51.map(w => {
  const key = x % 29;
  x = bytes[x];
  return w.map(r => (r - key + 29) % 29);
});
function ioc(w) {
  const flat = w.flat();
  const counts = Array(29).fill(0);
  flat.forEach(i => counts[i]++);
  return counts.reduce((acc, n) => acc + n * (n - 1), 0) / (flat.length * (flat.length - 1));
}
const roman = w => w.map(x => x.map(i => corpus.translit[i]).join('')).join(' ');
const holdout = page57.flat().slice(0, 92);
let offset = 0, pointer = 81;
const plant = page51.map(w => {
  const k = pointer % 29;
  pointer = bytes[pointer];
  const p = holdout.slice(offset, offset + w.length);
  offset += w.length;
  return p.map(t => (t + k) % 29);
});
pointer = 81;
const recovered = plant.map(w => {
  const k = pointer % 29;
  pointer = bytes[pointer];
  return w.map(t => (t - k + 29) % 29);
});
assert.deepEqual(recovered.flat(), holdout);
console.log(JSON.stringify({
  source:{gridSHA256:crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex'),
    p51First:'WWP',p51Words:page51.length,p51Runes:92,p57Words:20,p57Runes:95,
    p51Prime,eligibleAddresses:eligible.length},
  observed:{cycleLengths:observed.profile.cycles,depth20,route,preperiod:20,
    selfClockMatches:observed.matches.map(q => ({page:q.page,encoding:['GP0','GP1','PRIME','LENGTH'][q.mode],start:q.address,wordCount:q.count}))},
  consumers:{wordShiftOriginalIoC:ioc(page51),wordShiftInverseIoC:ioc(decrypted),solvedP57IoC:ioc(page57),
    rawInverse:roman(decrypted),plantedNativeP57Recovery:'PASS'},
  nulls:[
    tabulate(100000,0x33015120,'global'),
    tabulate(100000,0x33015121,'page'),
    graphRelabelNull(200000,0x33015122,false),
    graphRelabelNull(200000,0x33015123,true)
  ],
  limitations:'The source does not authenticate base60 successor semantics, the GP-prime opening selector, the preperiod clock or an original cipher inverse. All null probabilities are conditional on post-discovered statistics.'
}, null, 2));
