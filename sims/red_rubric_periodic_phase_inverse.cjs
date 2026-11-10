"use strict";

/**
 * Exact long-red-heading GP29 repeating-additive-key inversion.
 *
 * Anchor selection is source-only: the 11-rune middle heading word on physical
 * LP2 page 3 and the 12-rune middle heading word on page 27. Search arbitrary
 * shared periodic GP keys, unknown relative phase, and the two standard
 * additive/Atbash-style carriers. No language scoring or beam search occurs.
 *
 * The test is conditional on complete English-GP dictionary words, intact
 * original boundaries, and the same key across both headings. It cannot
 * identify the historical cipher by itself.
 *
 * Run: node sims/red_rubric_periodic_phase_inverse.cjs
 */
const assert = require("node:assert/strict");
const {firstRedHeading} = require("./red_rubric_shared_monoalphabet_inverse.cjs");
const {lexicon} = require("./red_verse_dictionary_anchor.cjs");

const N = 29;
const mod = x => (x % N + N) % N;
const wordMap = lexicon().words;
const byLength = new Map();
for (const entry of wordMap.values()) {
  const size = entry.indices.length;
  if (!byLength.has(size)) byLength.set(size, []);
  byLength.get(size).push(entry);
}

const original = {
  left: firstRedHeading(3)[1],
  right: firstRedHeading(27)[1],
  holdouts: [
    {page:0, word:0, cipher:firstRedHeading(0)[0]},
    {page:8, word:1, cipher:firstRedHeading(8)[1]},
    {page:33, word:1, cipher:firstRedHeading(33)[1]}
  ],
  neighboring: [
    {page:3, word:0, clock:-2, cipher:firstRedHeading(3)[0]},
    {page:3, word:2, clock:11, cipher:firstRedHeading(3)[2]},
    {page:27, word:0, clock:-3, cipher:firstRedHeading(27)[0]},
    {page:27, word:2, clock:12, cipher:firstRedHeading(27)[2]}
  ]
};
assert.deepEqual(original.left.length, 11);
assert.deepEqual(original.right.length, 12);
assert.deepEqual(original.holdouts.map(x=>x.cipher.length), [8,8,8]);

/**
 * carrier 0: C-P=K (direct additive key)
 * carrier 1: (28-C)-P=K (Atbash followed by additive key)
 * @param {number[]} cipher
 * @param {number[]} plaintext
 * @param {number} period
 * @param {number} phase
 * @param {number} carrier
 * @returns {Int8Array|null}
 */
function impliedKey(cipher, plaintext, period, phase, carrier) {
  const key = new Int8Array(period).fill(-1);
  for (let i=0; i<cipher.length; i++) {
    const slot = (phase+i) % period;
    const value = mod((carrier ? 28-cipher[i] : cipher[i]) - plaintext[i]);
    if (key[slot] !== -1 && key[slot] !== value) return null;
    key[slot] = value;
  }
  return key;
}

/**
 * Enumerate every lexicon-word pair and every relative phase exactly.
 * @param {number[]} left
 * @param {number[]} right
 * @param {number} period
 * @param {number} carrier
 * @param {boolean} retain
 */
function enumerate(left, right, period, carrier, retain=false) {
  const leftWords = byLength.get(left.length) || [];
  const rightWords = byLength.get(right.length) || [];
  const a = leftWords.map(word => ({
    word, key:impliedKey(left,word.indices,period,0,carrier)
  })).filter(item => item.key !== null);
  let pairs = 0;
  const solutions = [];
  const phaseCounts = Array(period).fill(0);
  for (let shift=0; shift<period; shift++) {
    const b = rightWords.map(word => ({
      word, key:impliedKey(right,word.indices,period,shift,carrier)
    })).filter(item => item.key !== null);
    if (!a.length || !b.length) continue;
    const overlap = [];
    for (let i=0; i<period; i++) {
      if (a[0].key[i] !== -1 && b[0].key[i] !== -1) overlap.push(i);
    }
    const signature = key => overlap.map(i=>key[i]).join(",");
    const lookup = new Map();
    for (const item of a) {
      const name = signature(item.key);
      if (!lookup.has(name)) lookup.set(name, []);
      lookup.get(name).push(item);
    }
    for (const other of b) {
      for (const item of lookup.get(signature(other.key)) || []) {
        pairs++;
        phaseCounts[shift]++;
        if (retain) {
          const key = Array.from(item.key, (value,i) =>
            value === -1 ? other.key[i] : value);
          solutions.push({
            carrier, period, shift,
            left:item.word.english, right:other.word.english, key
          });
        }
      }
    }
  }
  return {pairs,phaseCounts,solutions};
}

/**
 * Decode an original printed word with a frozen key.
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number} carrier
 * @param {number} phase
 */
function decrypt(ciphertext,key,carrier,phase) {
  return ciphertext.map((c,i) => mod(
    (carrier ? 28-c : c) - key[(phase+i+key.length*2)%key.length]));
}

/**
 * Every possible phase for an original holdout is granted to the candidate.
 * This is more permissive than any book/page/heading-fixed clock.
 */
function scoreHoldouts(solution) {
  return original.holdouts.map(item=>{
    const hits = [];
    for(let phase=0;phase<solution.period;phase++) {
      const text = decrypt(item.cipher,solution.key,solution.carrier,phase);
      const word = wordMap.get(text.join(","));
      if(word) hits.push({phase,english:word.english});
    }
    return {page:item.page,word:item.word,length:item.cipher.length,hits};
  });
}

/** Check neighboring title words at the fully fixed title clock. */
function scoreNeighbors(solution) {
  return original.neighboring.map(item=>{
    const phase = mod(
      (item.page===3?0:solution.shift)+item.clock) % solution.period;
    const text = decrypt(item.cipher,solution.key,solution.carrier,phase);
    return {page:item.page,word:item.word,
      english:wordMap.get(text.join(","))?.english || null};
  });
}

/** Exact planted-key recovery in both short-period and period-19 regimes. */
function plantedPositive(period,carrier,shift) {
  const first = (byLength.get(11) || []).find(w=>w.english==="spectacular");
  const second = (byLength.get(12) || []).find(w=>w.english==="implantation");
  assert.ok(first && second);
  let state = 0x18e90133;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  const key = Array.from({length:period},()=>next()%29);
  const encrypt = (plain,phase) => plain.map((p,i)=>{
    const value = mod(p+key[(i+phase)%period]);
    return carrier ? 28-value : value;
  });
  const left = encrypt(first.indices,0);
  const right = encrypt(second.indices,shift);
  const found = enumerate(left,right,period,carrier,true);
  assert.ok(found.solutions.some(item=>
    item.shift===shift &&
    item.left==="spectacular" &&
    item.right==="implantation" &&
    item.key.every((v,i)=>v===key[i])), "planted key not recovered");
  assert.deepEqual(decrypt(left,key,carrier,0),first.indices);
  assert.deepEqual(decrypt(right,key,carrier,shift),second.indices);
  return {period,carrier,shift,exactKeyRecovered:true,
    countCompatiblePairs:found.pairs};
}

function run() {
  const summary = [];
  let firstPeriod = null;
  let firstSolutions = [];
  for (let period=1;period<=20;period++) {
    const row = {period, direct:0, atbash:0};
    for(let carrier=0;carrier<2;carrier++) {
      const found = enumerate(original.left,original.right,period,carrier,
        period===19);
      row[carrier===0?"direct":"atbash"] = found.pairs;
      if(found.pairs>0 && firstPeriod===null) firstPeriod=period;
      if(period===19) firstSolutions.push(...found.solutions);
    }
    summary.push(row);
  }
  assert.equal(firstPeriod,19,
    "source-selected dictionary anchor first compatibility period changed");
  assert.deepEqual(summary.find(x=>x.period===19),
    {period:19,direct:3,atbash:3});
  assert.equal(firstSolutions.length,6);
  const solutions=firstSolutions.map(z=>({
    ...z, holdouts:scoreHoldouts(z), neighbors:scoreNeighbors(z)
  }));
  assert.ok(solutions.every(z=>z.holdouts.every(h=>h.hits.length===0)),
    "an original red-heading dictionary holdout unexpectedly matched");
  const plants=[plantedPositive(7,0,3),plantedPositive(19,1,7)];
  return {
    input:"original LP2 ink-selected title words at pages 3 and 27",
    anchorLengths:[11,12], dictionaryDistinctGPWords:wordMap.size,
    dictionaryAnchorCandidates:[
      (byLength.get(11)||[]).length,(byLength.get(12)||[]).length
    ],
    hypothesis:"one shared periodic mod29 additive key, arbitrary phase and either carrier",
    exactCounts:summary,firstCompatiblePeriod:firstPeriod,
    candidatePairsAtFirstPeriod:solutions,
    independentAllPhaseHoldoutPages:[0,8,33],
    plantedPositive:plants,
    interpretation:"bounded shared-key English-GP two-anchor exclusions; no recovered plaintext or historical key"
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+"\n");
module.exports={impliedKey,enumerate,decrypt,run};
