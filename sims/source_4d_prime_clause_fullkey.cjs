'use strict';
/**
 * Exhaustive author-native prime-clause inversion of LP2 under three frozen
 * original-source four-coordinate F29 transition matrices.
 *
 * Every one of 29^4 initial states is scored on original p0..27 *only*.
 * Original p28..55 are a frozen, unseen continuation. The published solved
 * Cicada clue (prime GP sums of clauses) supplies a distinct, language-free
 * score from all prior GP unigram/bigram likelihoods.
 *
 * Original page layout, GP-EA zero step and base-15 nonzero step channel
 * exactly match source_4d_fourier_fullkey_inverse.cjs.
 *
 * Positive control is a separately ciphered GP-native source whose short
 * clauses are authored to be prime-valued at the solved-Cicada 13/16 rate.
 *
 * Run: node sims/source_4d_prime_clause_fullkey.cjs
 * Optional: LP_MATRIX=red16|visible|printed
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const red = require('./red16_spiral_4d_native_crib.cjs');
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const master = fs.readFileSync(path.join(__dirname, '..',
  'resources', 'transcriptions', 'liber_primus_master.txt'), 'utf8').split('%');
const P = 29, STATES = P ** 4, MAXLEN = 76;
const C = Array.from(red.C), N = C.length;
const gpPrime = corpus.prime;
const symbolMap = new Map(corpus.runes.map((x, i) => [x, i]));
const mod = x => (x % P + P) % P;
assert.equal(N, 12956);
assert.equal(red.N, N);
assert.equal(STATES, 707281);
assert.equal(gpPrime.length, P);

const heads = new Uint8Array(N);
let cursor = 0, trainingEnd = 0;
for (const page of red.pages) {
  heads[cursor] = 1;
  assert.deepEqual(page.indices, corpus.pages[page.page].indices);
  cursor += page.indices.length;
  if (page.page === 27) trainingEnd = cursor;
}
assert.equal(cursor, N);
assert.equal(trainingEnd, 6761);

let t = 0;
const clauseEnds = [];
for (let p = 0; p <= 55; p++) {
  const segment = master[16 + p];
  assert.equal(typeof segment, 'string', 'every physical page must have a source segment');
  for (const ch of segment) {
    if (symbolMap.has(ch)) {
      assert.equal(symbolMap.get(ch), C[t], 'original master GP rune alignment');
      t++;
    }
    if (ch === '.') clauseEnds.push(t);
  }
}
assert.equal(t, N);
const uniqEnds = [...new Set(clauseEnds)].filter(x => x > 0 && x < N);
uniqEnds.push(N);
let at = 0;
const clauses = uniqEnds.map(end => {
  const result = {start: at, end, length: end - at};
  at = end;
  return result;
}).filter(q => q.length > 0);
const selected = clauses.filter(q => q.length >= 3 && q.length <= MAXLEN);
const train = selected.filter(q => q.end <= trainingEnd);
const hold = selected.filter(q => q.start >= trainingEnd);
assert.equal(clauses.length, 168);
assert.equal(selected.length, 101);
assert.equal(train.length, 50);
assert.equal(hold.length, 51);
assert.equal(train.reduce((s, q) => s + q.length, 0), 1590);
assert.equal(hold.reduce((s, q) => s + q.length, 0), 1759);

const sieve = new Uint8Array(20000).fill(1);
sieve[0] = 0; sieve[1] = 0;
for (let i = 2; i * i < sieve.length; i++) if (sieve[i])
  for (let j = i * i; j < sieve.length; j += i) sieve[j] = 0;

const pow15 = Array.from({length: 28}, (_, i) => {
  let a = 1;
  for (let j = 0; j < i; j++) a = a * 15 % P;
  return a;
});
const log15 = new Int8Array(P).fill(-1);
pow15.forEach((x, i) => { log15[x] = i; });
assert.equal(new Set(pow15).size, 28);

const matrices = [
  {id: 'red16', A: red.A, secret: [11, 7, 22, 3]},
  {id: 'visible', A: [[9, 11, 16, 19], [12, 13, 16, 10],
    [14, 11, 3, 8], [9, 22, 8, 3]], secret: [5, 12, 19, 27]},
  {id: 'printed', A: [[3258, 3222, 3152, 3038],
    [3278, 3299, 3298, 2838], [3288, 3294, 3296, 2472],
    [4516, 1206, 708, 1820]].map(row => row.map(mod)),
    secret: [1, 9, 18, 27]}
];

/** @param {number[][]} A - Row-vector state transition mod29. */
function vectors(A) {
  const out = new Uint8Array(N * 4);
  let a = 1, b = 0, c = 0, d = 0;
  for (let t = 0; t < N; t++) {
    let at = t * 4;
    out[at] = a; out[at + 1] = b; out[at + 2] = c; out[at + 3] = d;
    const x = (a * A[0][0] + b * A[1][0] +
      c * A[2][0] + d * A[3][0]) % P;
    const y = (a * A[0][1] + b * A[1][1] +
      c * A[2][1] + d * A[3][1]) % P;
    const z = (a * A[0][2] + b * A[1][2] +
      c * A[2][2] + d * A[3][2]) % P;
    const w = (a * A[0][3] + b * A[1][3] +
      c * A[2][3] + d * A[3][3]) % P;
    a = x; b = y; c = z; d = w;
  }
  return out;
}
function stateOf(index) {
  const a = index % P;
  const b = Math.floor(index / P) % P;
  const c = Math.floor(index / (P * P)) % P;
  const d = Math.floor(index / (P ** 3)) % P;
  return [a, b, c, d];
}
function indexOf(state) {
  return state[0] + P * (state[1] + P * (state[2] + P * state[3]));
}
function keyAt(V, t, s) {
  const j = t * 4;
  return (V[j] * s[0] + V[j + 1] * s[1] +
    V[j + 2] * s[2] + V[j + 3] * s[3]) % P;
}
/** @param {number[]} cipher @param {Uint8Array} V @param {number[]} s */
function decrypt(cipher, V, s) {
  const plain = new Array(N);
  for (let i = 0; i < N; i++) {
    const k = keyAt(V, i, s);
    if (heads[i]) plain[i] = mod(cipher[i] - k);
    else {
      const d = mod(cipher[i] - cipher[i - 1]);
      plain[i] = d ? (log15[d] - (k % 28) + 28) % 28 : 28;
    }
  }
  return plain;
}
/** @param {number[]} plain @param {Uint8Array} V @param {number[]} s */
function encrypt(plain, V, s) {
  const cipher = new Array(N);
  for (let i = 0; i < N; i++) {
    const k = keyAt(V, i, s);
    if (heads[i]) cipher[i] = (plain[i] + k) % P;
    else cipher[i] = plain[i] === 28 ? cipher[i - 1] :
      (cipher[i - 1] + pow15[(plain[i] + k % 28) % 28]) % P;
  }
  return cipher;
}
/**
 * Compile exact score table for all 29 projections at each rune, preserving
 * printed clause ends and the complete key-independent zero-step EA rule.
 *
 * @param {number[]} cipher
 * @param {{start:number,end:number,length:number}[]} spans
 * @param {Uint8Array} V
 */
function compile(cipher, spans, V) {
  return spans.map(span => {
    const vec = V.subarray(span.start * 4, span.end * 4);
    const emit = new Uint8Array(span.length * P);
    for (let j = 0; j < span.length; j++) {
      const i = span.start + j;
      const delta = heads[i] ? -1 : mod(cipher[i] - cipher[i - 1]);
      const exponent = delta > 0 ? log15[delta] : -1;
      for (let k = 0; k < P; k++) {
        let decoded;
        if (heads[i]) decoded = mod(cipher[i] - k);
        else decoded = !delta ? 28 :
          (exponent - (k % 28) + 28) % 28;
        emit[j * P + k] = gpPrime[decoded];
      }
    }
    return {vec, emit, length: span.length};
  });
}
/** @param {number[]} state @param {ReturnType<typeof compile>} records */
function scoreKey(state, records) {
  const a = state[0], b = state[1], c = state[2], d = state[3];
  let primes = 0;
  for (const rec of records) {
    let sum = 0;
    const v = rec.vec, values = rec.emit;
    for (let j = 0; j < rec.length; j++) {
      const k = (v[4 * j] * a + v[4 * j + 1] * b +
        v[4 * j + 2] * c + v[4 * j + 3] * d) % P;
      sum += values[j * P + k];
    }
    primes += sieve[sum];
  }
  return primes;
}
/**
 * Exhaust all 707,281 secret states. Training scores select every candidate;
 * no heldout original rune or clause is consulted until the ranking is frozen.
 */
function exhaustive(records) {
  const scores = new Uint8Array(STATES);
  const histogram = Array.from({length: records.length + 1}, () => 0);
  let best = -1;
  for (let idx = 0; idx < STATES; idx++) {
    const count = scoreKey(stateOf(idx), records);
    scores[idx] = count;
    histogram[count]++;
    if (count > best) best = count;
  }
  const top = [];
  for (let value = best; value >= 0 && top.length < 10; value--) {
    for (let idx = 0; idx < STATES && top.length < 10; idx++) {
      if (scores[idx] === value) top.push({index: idx, state: stateOf(idx),
        primes: value});
    }
  }
  assert.equal(histogram.reduce((a, b) => a + b, 0), STATES);
  return {scores, histogram, best, top, ties: histogram[best]};
}

/** Conditional planted source, at solved-Cicada short-clause prime propensity. */
function plantedText() {
  const source = red.nativeSymbols;
  assert.ok(source.length >= 2000);
  const plain = Array.from({length: N},
    (_, i) => source[(i + 3301) % source.length]);
  let changed = 0, enforced = 0;
  for (let i = 0; i < selected.length; i++) {
    if (i % 16 >= 13) continue;
    const rec = selected[i];
    enforced++;
    const originalSum = plain.slice(rec.start, rec.end)
      .reduce((sum, p) => sum + gpPrime[p], 0);
    if (sieve[originalSum]) continue;
    let found = false;
    for (let t = rec.end - 1; t >= rec.start && !found; t--) {
      const former = plain[t];
      for (let delta = 1; delta <= 28; delta++) {
        const next = (former + delta) % 28;
        const newSum = originalSum - gpPrime[former] + gpPrime[next];
        if (sieve[newSum]) {
          plain[t] = next;
          changed++;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      // A short prime-length clause can resist all one-rune GP adjustments.
      // Exhaust two changed runes to make the authored control lossless.
      const u = rec.end - 2, v = rec.end - 1;
      const baseline = originalSum - gpPrime[plain[u]] - gpPrime[plain[v]];
      for (let x = 0; x < P && !found; x++) {
        for (let y = 0; y < P; y++) {
          if (sieve[baseline + gpPrime[x] + gpPrime[y]]) {
            changed += Number(plain[u] !== x) + Number(plain[v] !== y);
            plain[u] = x; plain[v] = y;
            found = true;
            break;
          }
        }
      }
    }
    assert.ok(found, 'author-prime clause must be craftable within two edits');
  }
  const primeClauses = selected.reduce((n, rec) =>
    n + Number(sieve[plain.slice(rec.start, rec.end)
      .reduce((s, p) => s + gpPrime[p], 0)]), 0);
  assert.ok(primeClauses >= enforced);
  return {plain, sourceSymbols: source.length, enforced, changed,
    primeClauses};
}
function ioc(v) {
  const freq = new Float64Array(P);
  for (const x of v) freq[x]++;
  return freq.reduce((s, n) => s + n * (n - 1), 0) /
    (v.length * (v.length - 1));
}
function experiment(model) {
  const started = Date.now(), V = vectors(model.A);
  const original = exhaustive(compile(C, train, V));
  const heldoutCompiled = compile(C, hold, V);
  const originalTop = original.top.map(entry => {
    const decoded = decrypt(C, V, entry.state);
    assert.deepEqual(encrypt(decoded, V, entry.state), C);
    return {state: entry.state, trainPrimeClauses: entry.primes,
      heldoutPrimeClauses: scoreKey(entry.state, heldoutCompiled),
      heldoutIOC: ioc(decoded.slice(trainingEnd)),
      firstHeldoutIndices: decoded.slice(trainingEnd, trainingEnd + 24)};
  });
  const synthetic = plantedText();
  const plantedCipher = encrypt(synthetic.plain, V, model.secret);
  assert.deepEqual(decrypt(plantedCipher, V, model.secret), synthetic.plain);
  assert.deepEqual(encrypt(decrypt(plantedCipher, V, model.secret),
    V, model.secret), plantedCipher);
  const plant = exhaustive(compile(plantedCipher, train, V));
  const realKey = indexOf(model.secret), trueTrain = plant.scores[realKey];
  const trueRank = plant.scores.reduce((n, val) =>
    n + Number(val > trueTrain), 1);
  assert.equal(trueRank, 1, 'blind prime-clause key recovery');
  const plantedHoldout = scoreKey(model.secret,
    compile(plantedCipher, hold, V));
  return {
    matrix: model.id, sourceMatrix: model.A, states: STATES,
    original: {trainClauses: train.length, heldoutClauses: hold.length,
      primeTrainMaximum: original.best, tiedMaxKeys: original.ties,
      trainingHistogram: original.histogram, topFrozenCandidates: originalTop,
      bestFrozenHoldout: originalTop[0].heldoutPrimeClauses},
    syntheticControl: {
      source: 'solved Cicada GP runes with independent prescribed prime short-clause edits',
      exactRecoveredAndReencrypted: N,
      sourceGPCount: synthetic.sourceSymbols,
      primesInAllSelectedClauses: synthetic.primeClauses,
      enforcedPrimeClauses: synthetic.enforced,
      numberOfEdits: synthetic.changed,
      secretState: model.secret,
      trueStateRank: trueRank,
      trainingTruePrimeClauses: trueTrain,
      heldoutTruePrimeClauses: plantedHoldout
    }, elapsedMs: Date.now() - started
  };
}
function main() {
  const enabled = process.env.LP_MATRIX;
  const filtered = enabled ? matrices.filter(x => x.id === enabled) : matrices;
  assert.ok(filtered.length);
  const outputs = filtered.map(experiment);
  console.log(JSON.stringify({
    status: 'author-prime-clause 29^4 exact-key test; original plaintext is an unresolved hypothesis',
    source: 'original p0..55 / 2013 Cicada 761.MP3 independent clause-prime convention',
    model: 'transparent GP-EA zero step and base15 nonzero step with F29 four-coordinate state',
    clausePolicy: {maxLength: MAXLEN, allSourceClauses: clauses.length,
      selectedClauses: selected.length, trainingClauses: train.length,
      heldoutClauses: hold.length, trainingEnd, sectionClock: 'globally continuous',
      excludeCrossBoundaryClauses: true},
    results: outputs
  }, null, 2));
}
if (require.main === module) main();
module.exports = {experiment, compile, scoreKey, decrypt, encrypt};
