'use strict';

/**
 * Exact all-secret source-native H2 with historically authentic plaintext-F
 * transparency, plus otherwise optional preceding-equal ciphertext rejects:
 *
 *   P=F: C=F, hold prime key pointer (genuine LP2 p56 feature).
 *   P!=F: C=(tau[P] + phi(prime[J])) mod29; consume accepted key row,
 *         optionally consume rejected candidate rows only when proposed
 *         ciphertext equals the immediately previous emitted ciphertext.
 *
 * tau is an unrestricted unknown *single* GP29 alphabet permutation.
 * Source-printed one-rune GP29-English words require plaintext A/I/O and
 * therefore <=3 distinct unknown underlying tau(A/I/O) labels.
 *
 * Exact all-branch states: (mask of <=3 singleton source base labels,
 * delta = next-key pointer - next-source-rune ordinal). On ciphertext
 * F outside a singleton, branch literal plaintext F with delta-1 and
 * no key consumption; other branches consume a non-F key and change
 * delta by 0,1,2 legal collision skips. No unknown tau fit is needed.
 *
 * Tested on unchanged original black text after distinct red p15 title.
 * Read-only Windows Node22 SFT:
 * node sims/lp2_h2_cyclic_allsecret_ftransparent_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const text = read('resources/liber-primus/lp2-transcription.txt');
const runeMap = new Map(gp.runes.map((r, i) => [r, i]));
const cipher = gp.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
const parsed = [];
const words = [];
let pending = -1;
for (const ch of text) {
  if (parsed.length === cipher.length) break;
  if (runeMap.has(ch)) {
    if (pending < 0) pending = parsed.length;
    parsed.push(runeMap.get(ch));
  } else if (ch !== '/' && ch !== '%' &&
    !/\s/.test(ch) && pending >= 0) {
    words.push([pending, parsed.length]);
    pending = -1;
  }
}
if (pending >= 0) words.push([pending, parsed.length]);
assert.equal(cipher.length, 12956);
assert.deepEqual(parsed, cipher);
assert.equal(words.length, 2896);
const singleton = new Set(words.filter(([a, b]) => b-a === 1)
  .map(([a]) => a));
assert.equal(singleton.size, 83);

const pageStarts = [];
let position = 0;
for (const p of gp.pages) {
  pageStarts[p.page] = position;
  if (p.page <= 55) position += p.indices.length;
}
assert.equal(position, 12956);
const p15Red = ink.pages.find(p => p.page === 15).red_spans;
assert.deepEqual(p15Red.map(x => [x.start, x.length]),
  [[0, 9], [9, 11]]);
assert.equal(pageStarts[15], 3603);
const blackFrom = pageStarts[15] + 20;
const blackEnd = pageStarts[23];
assert.deepEqual([blackFrom, blackEnd, blackEnd-blackFrom],
  [3623, 5506, 1883]);
assert.ok(!ink.pages.some(p => p.page >= 16 && p.page <= 22
  && p.red_spans && p.red_spans.length > 0));
const key = [];
const sieve = new Uint8Array(400000);
for (let p = 2; p < sieve.length && key.length < 16000; p++) {
  if (sieve[p]) continue;
  key.push((p - 1) % 29);
  if (p * p < sieve.length)
    for (let j = p * p; j < sieve.length; j += p) sieve[j] = 1;
}
assert.equal(key.length, 16000);
assert.ok(key.every((v, i) => i + 2 >= key.length ||
  !(v === key[i + 1] && v === key[i + 2])));
const mod = x => ((x % 29) + 29) % 29;
function bitCount(mask) {
  let count = 0;
  for (let v = mask; v; v &= v - 1) count++;
  return count;
}
/**
 * All lawful hidden literal-F and same-cipher rejection histories.
 * A state after processing rune i stores next-key-index - (i+1).
 *
 * @param {number[]} tape
 * @param {number} sourceStart
 * @param {{delta:number[],labels:number[]}|null} [oracle]
 */
function invert(tape, sourceStart, oracle = null) {
  let state = new Map([[0, new Set([0])]]);
  let oracleMask = 0;
  const trace = [];
  for (let i = 0; i < tape.length; i++) {
    const ci = tape[i];
    const previous = i ? tape[i - 1] : -1;
    const isSingleton = singleton.has(sourceStart + i);
    const next = new Map();
    const push = (mask, delta) => {
      let set = next.get(mask);
      if (!set) {
        set = new Set();
        next.set(mask, set);
      }
      set.add(delta);
    };
    if (oracle && isSingleton)
      oracleMask |= 1 << oracle.labels[i];
    for (const [mask, deltas] of state) {
      for (const delta of deltas) {
        const initialKey = i + delta;
        // Literal plaintext F is the sole key-nonconsuming operation.
        // Overallow non-F paths which might map to the unknown tau(F);
        // any impossibility remains a mathematically valid exclusion.
        if (ci === 0 && !isSingleton) push(mask, delta - 1);
        // Candidate rejection occurs only if the proposed prior key row
        // would exactly reproduce the preceding accepted ciphertext.
        for (let skip = 0; skip <= (i ? 2 : 0); skip++) {
          const candidateIndex = initialKey + skip;
          if (candidateIndex < 0 || candidateIndex >= key.length) continue;
          const base = mod(ci - key[candidateIndex]);
          if (skip >= 1 &&
            mod(base + key[initialKey]) !== previous) continue;
          if (skip >= 2 &&
            mod(base + key[initialKey + 1]) !== previous) continue;
          const nextMask = isSingleton ? mask | (1 << base) : mask;
          if (isSingleton && bitCount(nextMask) > 3) continue;
          push(nextMask, delta + skip);
        }
      }
    }
    state = next;
    if (oracle) {
      const legal = state.get(oracleMask);
      assert.ok(legal && legal.has(oracle.delta[i]),
        'planted true F-skip/collision pointer and unseen tau labels retained');
    }
    if (isSingleton) trace.push({
      sourceOffset: sourceStart + i,
      localOffset: i,
      masks: state.size,
      states: [...state.values()].reduce((n, set) => n + set.size, 0),
    });
    if (!state.size) return {pass: false,
      firstImpossibleGlobal: sourceStart + i,
      firstImpossibleLocal: i, trace};
  }
  return {pass: true,
    trace, masks: state.size,
    states: [...state.values()].reduce((n, set) => n + set.size, 0),
    terminal: state};
}

/** All original p15-black through p22, fresh prime2 at first black rune. */
const black = invert(cipher.slice(blackFrom, blackEnd), blackFrom);
assert.equal(black.pass, false);
assert.equal(black.firstImpossibleGlobal, 4176);
assert.deepEqual(black.trace.slice(-2).map(x =>
  [x.sourceOffset, x.masks, x.states]),
  [[4148, 19, 20], [4176, 0, 0]]);

/** Independent black p16..p22 and p17..p21 prime2 restarts. */
const p16to22 = invert(cipher.slice(pageStarts[16], blackEnd),
  pageStarts[16]);
assert.equal(p16to22.firstImpossibleGlobal, 4233);
const p17to21 = invert(cipher.slice(pageStarts[17], pageStarts[22]),
  pageStarts[17]);
assert.equal(p17to21.firstImpossibleGlobal, 5319);
const p18to21 = invert(cipher.slice(pageStarts[18], pageStarts[22]),
  pageStarts[18]);
assert.equal(p18to21.pass, true);

/** The original isolated p28-only no-F obstruction is rescued by F bypass. */
const p28 = gp.pages.find(p => p.page === 28);
const p28At = pageStarts[28];
assert.deepEqual([p28At, p28.indices.length], [6761, 269]);
const p28F = invert(p28.indices, p28At);
assert.equal(p28F.pass, true);
assert.deepEqual(p28F.trace.map(s => [s.localOffset,s.masks,s.states]),
  [[32,1,1],[163,11,12],[229,77,84],[233,2,2]]);
assert.deepEqual([p28F.masks, p28F.states], [2,3]);

/** Native source GP29 forward positive with true secret tau and F holds. */
function rng(seed) {
  let state = seed >>> 0;
  const u = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  return {u, int: n => Math.floor(u() * n)};
}
const rand = rng(0x330143af);
const perm = Array.from({length: 29}, (_, i) => i);
for (let i = perm.length - 1; i > 0; i--) {
  const j = rand.int(i + 1);
  [perm[i], perm[j]] = [perm[j], perm[i]];
}
const clearP57 = gp.pages.find(p => p.page === 57).indices;
assert.equal(clearP57.length, 95);
const plaintext = Array.from({length: p28.indices.length}, (_, i) =>
  clearP57[i % clearP57.length]);
const p28Singletons = [32, 163, 229, 233];
p28Singletons.forEach((j, i) => {
  plaintext[j] = [24, 10, 3, 24][i]; // English A,I,O,A
});
const ciphertext = [];
const truthDelta = [];
const truthLabels = plaintext.map(p => perm[p]);
let ptr = 0;
let last = -1;
let transparent = 0;
let collisions = 0;
for (let i = 0; i < plaintext.length; i++) {
  const p = plaintext[i];
  let v;
  if (p === 0) {
    transparent++;
    v = 0; // actual p56 plaintext F bypass; key pointer is held
  } else {
    v = mod(truthLabels[i] + key[ptr]);
    let rejected = 0;
    while (v === last && rand.u() < 0.81) {
      rejected++;
      collisions++;
      ptr++;
      assert.ok(rejected <= 2);
      v = mod(truthLabels[i] + key[ptr]);
    }
    ptr++;
  }
  ciphertext.push(v);
  truthDelta.push(ptr - (i + 1));
  last = v;
}
assert.ok(transparent > 0);
const planted = invert(ciphertext, p28At,
  {delta: truthDelta, labels: truthLabels});
assert.ok(planted.pass);
console.log(JSON.stringify({
  status: 'PASS',
  exactOriginal: 'all 12956 original runes; 2896 true source words; 83 singleton sites',
  mechanism: 'arbitrary secret 29-permutation τ(P) plus prime-totient rows, optional previous-equal ciphertext collision rejection AND genuine literal plaintext-F transparent bypass',
  allHiddenFSplits: true,
  noExcludedNonFPlaintextExtraFilter: true,
  modelKeyStart: 'prime2 at each independently tested source start',
  originalBlackFromP15: {
    fromGlobal: blackFrom, endExclusive: blackEnd,
    runes: blackEnd - blackFrom,
    redHeadingIgnored: 'p15 source-visible first 20 red runes (two titles 9+11)',
    firstImpossibleGlobal: black.firstImpossibleGlobal,
    lastSingletons: black.trace.slice(-4),
  },
  originalFullyBlackOtherStarts: {
    p16ThroughP22: {startGlobal: pageStarts[16],
      impossibleGlobal: p16to22.firstImpossibleGlobal},
    p17ThroughP21: {startGlobal: pageStarts[17],
      impossibleGlobal: p17to21.firstImpossibleGlobal},
    p18ThroughP21: {startGlobal: pageStarts[18],
      survives: p18to21.pass},
  },
  importantOriginalScopeCorrection: {
    physicalPage28Alone: 'SURVIVES with F bypass, so prior collision-only p28 impossibility is not transferable',
    sourceSingletons: p28F.trace,
    endingMaskCount: p28F.masks,
    endingStateCount: p28F.states,
  },
  fullyBlindPlantedPositive: {
    originalSizedSourceRunes: ciphertext.length,
    seed: '0x330143af',
    nativeGP29: 'clear p57 repeated, A/I/O/A injected only at source singletons',
    literalPlaintextF: transparent,
    actualHiddenCollisionRejects: collisions,
    trueSecretTauMaskAndPrimePointerRetained: true,
    terminalMaskCount: planted.masks,
  },
  decision: 'This exact source-black cyclic Latin tau(P)+phi(prime) H2 model fails p15 black and p17-through-p21 even if all original authentic F-bypass and lawful collision-reject histories are allowed. Other phases, word breaks, row families remain unexcluded; no original plaintext or key.'
}, null, 2));
