'use strict';

/**
 * p34/p36 source-selected primitive-root transposition discriminator.
 *
 * The exact p34<->p36 pointer gives p=139 and phi(p)=138. The repeated
 * cuneiform header supplies 3301. Since 3301 mod 139 is a primitive root,
 * its successive powers enumerate every nonzero residue exactly once.
 *
 * This SFT applies that one source-selected position order to the 138-rune
 * p34 partner clause, in both traversal directions. A native-GP trigram law
 * is calibrated from pinned Shakespeare. A planted Gibran positive proves
 * exact inversion and scorer sensitivity.
 *
 * Run: node sims/lp2_p34_p36_3301_primitive_root_transposition_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const {encodeSourceNativeGP} =
  require('./lp2_native_gp_source_orthography_sft.cjs');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const P = 139;
const HEADER = 3301;
const G = HEADER % P;

/** @param {number} a @param {number} e */
function modPow(a, e) {
  let x = a % P;
  let n = e;
  let out = 1;
  while (n > 0) {
    if (n & 1) out = (out * x) % P;
    x = (x * x) % P;
    n = Math.floor(n / 2);
  }
  return out;
}

/** @param {number} g */
function order(g) {
  let x = 1;
  for (let n = 1; n <= P - 1; n++) {
    x = (x * g) % P;
    if (x === 1) return n;
  }
  throw new Error('unreachable');
}

assert.equal(G, 104);
assert.equal(order(G), 138);
const H = 1033 % P;
assert.equal(H, 60);
assert.equal(order(H), 46);
assert.equal(modPow(G, 39), H);

const forwardResidues = Array.from({length: 138}, (_, k) => modPow(G, k));
assert.equal(new Set(forwardResidues).size, 138);
assert.ok(forwardResidues.every((x) => x >= 1 && x <= 138));
const reverseResidues = [forwardResidues[0], ...forwardResidues.slice(1).reverse()];
assert.equal(new Set(reverseResidues).size, 138);

const p34 = corpus.pages.find((p) => p.page === 34).indices;
const p36 = corpus.pages.find((p) => p.page === 36).indices;
assert.equal(p34.length, 261);
assert.equal(p36.length, 238);

// Exact source units from the verified mutual-pointer census.
const clause34 = p34.slice(16, 16 + 138);
const item36 = p36.slice(99);
assert.equal(clause34.length, 138);
assert.equal(item36.length, 139);

/**
 * Gather a 138-symbol sequence by nonzero field residues interpreted as
 * one-based positions.
 * @param {number[]} values
 * @param {number[]} residues
 */
function gather(values, residues) {
  assert.equal(values.length, 138);
  return residues.map((r) => values[r - 1]);
}

/**
 * Exact inverse of gather.
 * @param {number[]} values
 * @param {number[]} residues
 */
function scatter(values, residues) {
  assert.equal(values.length, 138);
  const out = new Array(138);
  residues.forEach((r, i) => { out[r - 1] = values[i]; });
  assert.ok(out.every((x) => Number.isInteger(x)));
  return out;
}

/** @param {number[]} values */
function translit(values) {
  return values.map((x) => corpus.translit[x]).join('');
}

/** @param {number[]} values */
function trigrams(values) {
  const counts = new Uint32Array(29 * 29 * 29);
  for (let i = 0; i + 2 < values.length; i++) {
    counts[(values[i] * 29 + values[i + 1]) * 29 + values[i + 2]]++;
  }
  return counts;
}

const shakespeare = encodeSourceNativeGP(read(
  'resources/control/shakespeare_first300k.txt'
));
const tri = trigrams(shakespeare);
const alpha = 0.25;
const denom = shakespeare.length - 2 + alpha * tri.length;
const logP = Array.from(tri, (count) => Math.log((count + alpha) / denom));

/** @param {number[]} values */
function score(values) {
  let ll = 0;
  for (let i = 0; i + 2 < values.length; i++) {
    ll += logP[(values[i] * 29 + values[i + 1]) * 29 + values[i + 2]];
  }
  return ll / Math.max(values.length - 2, 1);
}

/**
 * The second printed header number H=1033 mod139 has order46. Since G is a
 * primitive root, the group splits into the three canonical cosets
 * H, G*H, G^2*H. Enumerate cosets by c=0,1,2 and powers e=0..45.
 * @param {boolean} reverseCosets
 * @param {boolean} reversePowers
 */
function cosetResidues(reverseCosets, reversePowers) {
  const cosets = reverseCosets ? [2, 1, 0] : [0, 1, 2];
  const exponents = Array.from({length: 46}, (_, i) =>
    reversePowers && i > 0 ? 46 - i : i
  );
  const out = [];
  for (const coset of cosets) {
    for (const exponent of exponents) {
      out.push((modPow(G, coset) * modPow(H, exponent)) % P);
    }
  }
  assert.equal(out.length, 138);
  assert.equal(new Set(out).size, 138);
  return out;
}

const candidates = [
  {name: 'source-order', values: clause34},
  {name: '3301-power-forward', values: gather(clause34, forwardResidues)},
  {name: '3301-power-reverse', values: gather(clause34, reverseResidues)},
  {name: '1033-cosets-forward', values: gather(clause34, cosetResidues(false, false))},
  {name: '1033-cosets-power-reverse', values: gather(clause34, cosetResidues(false, true))},
  {name: '1033-cosets-order-reverse', values: gather(clause34, cosetResidues(true, false))},
  {name: '1033-cosets-both-reverse', values: gather(clause34, cosetResidues(true, true))}
].map((row) => ({
  name: row.name,
  scorePerTrigram: score(row.values),
  preview: translit(row.values).slice(0, 220)
}));

// Matched independent native-GP reference windows.
const reference = [];
for (const [name, file] of [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
]) {
  const native = encodeSourceNativeGP(read(file));
  for (let start = 0; start + 138 <= native.length; start += 138) {
    const values = native.slice(start, start + 138);
    reference.push({name, start, scorePerTrigram: score(values)});
  }
}
assert.ok(reference.length >= 100);
const refScores = reference.map((r) => r.scorePerTrigram).sort((a, b) => a - b);

/*
 * Positive: scramble a native 138-rune Gibran window with the exact inverse
 * permutation. The source-selected forward gather must recover it exactly.
 */
const plantPlain = encodeSourceNativeGP(
  read('resources/control/gibran_prophet_58585.txt')
).slice(0, 138);
const plantCipher = scatter(plantPlain, forwardResidues);
const plantRecovered = gather(plantCipher, forwardResidues);
assert.deepEqual(plantRecovered, plantPlain);

console.log(JSON.stringify({
  classification:
    'source-selected primitive-root transposition gate; no plaintext/key assumed',
  source: {
    modulusFromP36ItemRunes: P,
    totientAndP34ClauseRunes: 138,
    repeatedCuneiformHeaderValues: [1033, HEADER],
    residues: [H, G],
    orders: [order(H), order(G)],
    relation: '3301^39 mod139 = 1033 mod139',
    cosets: 3,
    coversAllNonzeroResidues: new Set(forwardResidues).size === 138
  },
  original: {
    p34ClauseRunes: clause34.length,
    p36ItemRunes: item36.length,
    candidates
  },
  nativeReference: {
    windows: reference.length,
    min: refScores[0],
    median: refScores[Math.floor(refScores.length / 2)],
    max: refScores[refScores.length - 1],
    originalCandidatesAtOrAboveNativeMin: candidates.filter(
      (row) => row.scorePerTrigram >= refScores[0]
    ).map((row) => row.name)
  },
  positive: {
    exactRecovery: true,
    plainScorePerTrigram: score(plantPlain),
    scrambledScorePerTrigram: score(plantCipher),
    recoveredScorePerTrigram: score(plantRecovered)
  }
}, null, 2));
