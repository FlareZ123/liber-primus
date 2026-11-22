'use strict';
/**
 * Source-proposed F79 evolving-rank GP28 gate (Agent 26).
 * Reproducer: node agents/agent26/field79_rank_gate.cjs
 *
 * This tests a deliberately finite alternative to fixed public (salt,slot)
 * permutations. It does not identify the authorial source key or cipher.
 * A fixed but entirely unknown permutation of the 28 non-EA GP symbols
 * cannot change the decoded collision index; test all listed public masks
 * without searching the hidden substitution key.
 *
 * Input: canonical LP2 physical pages 0..55 (page50 is runeless).
 * Candidate: a circular 164 x 79 stream starting at rune offset 35;
 * the first difference in each packet is published salt, 78 remaining
 * differences represent 28 nonzero step ranks or zero=EA.
 * The 53^t mod79 progression is source-motivated, not authenticated.
 *
 * Node.js 22, CommonJS, dependencies only from the repository.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('../../sims/word_partition_invariant.cjs');

const root = path.resolve(__dirname, '../..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const C = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const N = C.length;
const BLOCKS = 164, WIDTH = 79, PHASE = 35, PAYLOAD = 78;
assert.equal(N, BLOCKS * WIDTH);

const mod = (x, m) => ((x % m) + m) % m;
const power = [];
let p = 1;
for (let k = 0; k < 78; k++) {
  power.push(p);
  p = p * 53 % 79;
}
assert.equal(p, 1);

const records = [];
for (let b = 0; b < BLOCKS; b++) {
  const start = (PHASE + b * WIDTH) % N;
  const salt = mod(C[start] - C[mod(start - 1, N)], 29);
  for (let j = 1; j <= PAYLOAD; j++) {
    const d = mod(C[(start + j) % N] - C[(start + j - 1) % N], 29);
    records.push({b, j, salt, rank: d === 0 ? -1 : d - 1});
  }
}
assert.equal(records.length, BLOCKS * PAYLOAD);
assert.equal(records.filter(x => x.rank < 0).length, 86);
assert.equal(records.filter(x => x.rank >= 0).length, 12706);
assert.ok(records.every(x => x.salt > 0));

// The original (salt, rank) framing exactly reconstructs the input, for
// every secret mask or substitution. This is bookkeeping, not key evidence.
let prior = C[mod(PHASE - 1, N)];
for (let b = 0; b < BLOCKS; b++) {
  const start = (PHASE + b * WIDTH) % N;
  const salt = records[b * PAYLOAD].salt;
  prior = mod(prior + salt, 29);
  assert.equal(prior, C[start]);
  for (let j = 1; j <= PAYLOAD; j++) {
    const rank = records[b * PAYLOAD + j - 1].rank;
    prior = mod(prior + (rank < 0 ? 0 : rank + 1), 29);
    assert.equal(prior, C[(start + j) % N]);
  }
}
assert.equal(prior, C[mod(PHASE - 1, N)]);

/**
 * The four clocks and four nonce mixes are explicit finite hypotheses;
 * most are not uniquely specified by historical sources.
 * @param {{b:number,j:number,salt:number}} item
 * @param {{clock:string,mix:string,map:string,sign:number,offset:number}} variant
 */
function mask(item, variant) {
  const {b, j, salt} = item;
  let t;
  if (variant.clock === 'global79') t = 79 * b + j;
  else if (variant.clock === 'payload78') t = 78 * b + j - 1;
  else if (variant.clock === 'packetPlusColumn') t = b + j;
  else t = b;
  t += PHASE + variant.offset;
  if (variant.mix === 'addsalt') t += salt;
  else if (variant.mix === 'xorsalt') t ^= salt;
  else if (variant.mix === 'mulsalt') t += b * salt;
  const q = power[mod(t, 78)];
  return mod(variant.map === 'minusOne' ? q - 1 : q, 28);
}

/** @param {number[]} data 28-symbol stream, with -1 excluded */
function collision(data) {
  const h = new Uint16Array(28);
  let n = 0;
  for (const x of data) if (x >= 0) {h[x]++; n++;}
  let hits = 0;
  for (const v of h) hits += v * (v - 1);
  return hits / (n * (n - 1));
}

/**
 * @param {number[]} ranks
 * @param {{clock:string,mix:string,map:string,sign:number,offset:number}} variant
 */
function decodeRanks(ranks, variant) {
  return ranks.map((rank, i) => rank < 0 ? -1
    : mod(rank + variant.sign * mask(records[i], variant), 28));
}

/** Scan 4 * 4 * 2 * 2 * 78 = 4,992 models with a global secret GP28 permutation. */
function scan(ranks) {
  let best = null, worst = null, scanned = 0;
  const clocks = ['global79', 'payload78', 'packetPlusColumn', 'blockOnly'];
  const mixes = ['none', 'addsalt', 'xorsalt', 'mulsalt'];
  for (const clock of clocks) for (const mix of mixes)
    for (const map of ['minusOne', 'raw'])
      for (const sign of [-1, 1]) for (let offset = 0; offset < 78; offset++) {
        const variant = {clock, mix, map, sign, offset};
        const score = collision(decodeRanks(ranks, variant));
        const result = {...variant, score};
        if (best === null || score > best.score) best = result;
        if (worst === null || score < worst.score) worst = result;
        scanned++;
      }
  assert.equal(scanned, 4992);
  return {scanned, best, worst};
}

const ranks = records.map(x => x.rank);
const original = scan(ranks);
assert.ok(original.best.score < 0.036);
assert.ok(original.worst.score > 0.035);

const reference = read('resources/control/shakespeare_first300k.txt')
  .toUpperCase().match(/[A-Z]+/g).flatMap(encode).filter(x => x < 28);
const source = reference.slice(150000, 150000 + 12706);
assert.equal(source.length, 12706);
const sourceIOC = collision(source);

// Planted GP-English positive with a secret substitution unknown to the scan.
// P -> (11P+5) mod28 is bijective, as inverse(11) = 23 modulo28.
// The withheld native GP sample and exact 86 original EA positions are fixed.
const plantedKey = {
  clock: 'global79', mix: 'addsalt', map: 'minusOne', sign: -1, offset: 17
};
let k = 0;
const planted = ranks.map((r, i) => {
  if (r < 0) return -1;
  const v = mod(11 * source[k++] + 5, 28);
  return mod(v - plantedKey.sign * mask(records[i], plantedKey), 28);
});
assert.equal(k, 12706);
const decodedPlant = decodeRanks(planted, plantedKey)
  .filter(x => x >= 0).map(x => mod(23 * (x - 5), 28));
assert.deepEqual(decodedPlant, source);
const plantedScan = scan(planted);
assert.ok(plantedScan.best.score >= sourceIOC - 1e-12);

console.log(JSON.stringify({
  status: 'conditional finite exclusion, no original plaintext or key',
  source: {runes: N, framing: [BLOCKS, WIDTH, PAYLOAD, PHASE],
    eaMarkers: 86, nonEaPayload: 12706},
  original: {sameSymbolCollision: original.best.score,
    bestMask: original.best, worstMask: original.worst,
    testedKeys: original.scanned,
    arbitraryGlobalSecretPermutationCannotChangeCollision: true},
  planted: {nativeGpSourceIOC: sourceIOC,
    originalMaskAndSaltSitesPreserved: true,
    exactRecoveryWithKnownKey: decodedPlant.length,
    bestBlindMaskIOC: plantedScan.best.score,
    maskedModelsTested: plantedScan.scanned},
  caveats: 'Source clock, 53 generator, marker interpretation and 35/79 framing are hypotheses. Excludes only a direct native-GP 28-symbol register with one fixed unknown bijection after the selected F79 mask. Other registers and nonstationary substitutions remain open.'
}, null, 2));
