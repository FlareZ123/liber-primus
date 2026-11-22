'use strict';
/**
 * Phase-35 79/78 fixed-cycle key attack on the ORIGINAL LP2 ciphertext.
 *
 * Exact CSP enumerates 29-symbol cyclic-order candidates consistent with
 * 95 original no-repeat packet prefixes. A frozen GP-Shakespeare trigram
 * likelihood on only the FIRST 48 packets guides deterministic enumeration
 * and local permutation search. All last 47 original packets remain untouched
 * until the final check. Full 78-digit GP decoding and forward re-encryption
 * is done only for selected candidate keys.
 *
 * A disjoint 95-packet native-GP plant with an unknown random cyclic order is
 * searched in precisely the same way. True-key recovery on that plant is the
 * substantive power test. The script never describes a selected random
 * candidate as a decipherment.
 *
 * Node 22, CJS. Run under the existing MANUAL adaptive-radix workflow.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {prefixTwoDigitGate, cleanStarts} =
  require('./prime79_radix29_28_exact_gate.cjs');
const {toGematria} = require('./previous_cipher_sbox_invariant.cjs');

const ROOT = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.filter(p => p.page < 56)
  .flatMap(p => p.indices);
const allStarts = cleanStarts(original, 35);
assert.equal(original.length, 12956);
assert.equal(allStarts.length, 95);

const source = toGematria(read('resources/control/shakespeare_first300k.txt'));
assert(source.length > 150000);
const gpTrain = source.slice(0, 100000);
const raw = Array.from({length: 29}, () => 0);
const bi = new Uint32Array(29 ** 2);
const tri = new Uint32Array(29 ** 3);
for (let i = 0; i < gpTrain.length; i++) {
  raw[gpTrain[i]]++;
  if (i > 0) bi[gpTrain[i - 1] * 29 + gpTrain[i]]++;
  if (i > 1)
    tri[gpTrain[i - 2] * 841 + gpTrain[i - 1] * 29 + gpTrain[i]]++;
}
const gpLog = (a, b, x) => Math.log(
  .8 * (tri[a * 841 + b * 29 + x] + .25) /
    (bi[a * 29 + b] + 7.25) +
  .2 * (bi[b * 29 + x] + .25) / (raw[b] + 7.25)
);

const GP_PLAIN = 78;
const GP_CIPHER = 79;
const LIMIT = 29n ** 78n;
const PREFIX_RUNE_COUNT = 8;
const PREFIX_CIPHER_COUNT = 12;
const TAIL_28 = 28n ** BigInt(GP_CIPHER - PREFIX_CIPHER_COUNT);
const REMOVE_29 = 29n ** BigInt(GP_PLAIN - PREFIX_RUNE_COUNT);
const PREFIX_LIMIT = 29n ** BigInt(PREFIX_RUNE_COUNT);
const reference = [
  0, 24, 11, 21, 7, 28, 10, 16, 25, 3, 15, 9, 22, 27, 2,
  20, 26, 19, 1, 18, 5, 17, 14, 13, 6, 12, 23, 8, 4
];

function triples(cipher, starts) {
  return starts.map(s => [cipher[s - 1], cipher[s], cipher[s + 1]]);
}

/**
 * The exact necessary first-two-digit capacity gate.
 * @param {number[]} pi - GP rune index to cyclic order position.
 * @param {number[][]} rows - Original observed cipher-prefix triples.
 */
function valid(pi, rows) {
  for (const [a, b, c] of rows) {
    const d0 = (pi[b] - pi[a] + 28) % 29;
    const d1 = (pi[c] - pi[b] + 28) % 29;
    if (d0 > 15 || (d0 === 15 && d1 > 12)) return false;
  }
  return true;
}

/**
 * Exactly determine the first eight base29 plaintext digits using only
 * twelve observed base28 digits. If the unknown suffix could influence the
 * result, calculate the entire 79-digit value instead of approximating.
 * @param {number[]} pi
 * @param {number[]} cipher
 * @param {number} start
 */
function prefix(pi, cipher, start) {
  let rank = cipher[start - 1], v = 0n;
  for (let j = 0; j < PREFIX_CIPHER_COUNT; j++) {
    const cur = cipher[start + j];
    v = v * 28n + BigInt((pi[cur] - pi[rank] + 28) % 29);
    rank = cur;
  }
  let low = v * TAIL_28;
  const bottom = low / REMOVE_29;
  const top = (low + TAIL_28 - 1n) / REMOVE_29;
  let digitsInteger;
  if (bottom === top) digitsInteger = bottom;
  else {
    rank = cipher[start - 1];
    low = 0n;
    for (let j = 0; j < GP_CIPHER; j++) {
      const cur = cipher[start + j];
      low = low * 28n + BigInt((pi[cur] - pi[rank] + 28) % 29);
      rank = cur;
    }
    digitsInteger = low / REMOVE_29;
  }
  if (digitsInteger >= PREFIX_LIMIT) return null;
  const digits = Array(PREFIX_RUNE_COUNT);
  for (let j = PREFIX_RUNE_COUNT - 1; j >= 0; j--) {
    digits[j] = Number(digitsInteger % 29n);
    digitsInteger /= 29n;
  }
  return digits;
}

/**
 * Training fitness. The fixed symbols and 3-gram model were determined by
 * original manuscript-wide study; only the key is selected here.
 * @param {number[]} pi
 * @param {number[]} cipher
 * @param {number[]} starts
 * @param {number} begin
 * @param {number} end
 */
function score(pi, cipher, starts, begin, end) {
  let log = 0, symbols = 0;
  for (let k = begin; k < end; k++) {
    const digits = prefix(pi, cipher, starts[k]);
    if (!digits) return -Infinity;
    for (let j = 2; j < digits.length; j++) {
      log += gpLog(digits[j - 2], digits[j - 1], digits[j]);
      symbols++;
    }
  }
  return log / symbols;
}

/**
 * Exact packed-number decoder and encoder for every selected 79-digit packet.
 * Returns independent heldout statistics and the forward roundtrip count.
 */
function fullCheck(pi, cipher, starts, begin, end) {
  const inv = Array(29);
  for (let i = 0; i < 29; i++) inv[pi[i]] = i;
  assert.equal(new Set(pi).size, 29);
  const frequencies = new Uint32Array(29);
  let n = 0, language = 0, nLanguage = 0, intact = 0;
  for (let i = begin; i < end; i++) {
    const start = starts[i];
    let v = 0n, prev = cipher[start - 1];
    const ds = [];
    for (let j = 0; j < 79; j++) {
      const cur = cipher[start + j];
      const d = (pi[cur] - pi[prev] + 28) % 29;
      ds.push(d);
      v = v * 28n + BigInt(d);
      prev = cur;
    }
    if (v >= LIMIT) return {invalidPacket: start};
    const plain = Array(78);
    for (let j = 77; j >= 0; j--) {
      plain[j] = Number(v % 29n);
      v /= 29n;
    }
    assert.equal(v, 0n);
    for (let j = 0; j < plain.length; j++) {
      const x = plain[j];
      frequencies[x]++;
      if (j > 1) {
        language += gpLog(plain[j - 2], plain[j - 1], x);
        nLanguage++;
      }
      n++;
    }
    v = 0n;
    for (const x of plain) v = v * 29n + BigInt(x);
    const rebuilt = Array(79);
    for (let j = 78; j >= 0; j--) {
      rebuilt[j] = Number(v % 28n);
      v /= 28n;
    }
    assert.equal(v, 0n);
    assert.deepEqual(rebuilt, ds);
    prev = cipher[start - 1];
    for (let j = 0; j < 79; j++) {
      prev = inv[(pi[prev] + rebuilt[j] + 1) % 29];
      assert.equal(prev, cipher[start + j]);
    }
    intact++;
  }
  return {
    validPackets: intact,
    exactReencryptedCipherRunes: intact * 79,
    decodedGpRunes: n,
    gpIoC: frequencies.reduce((s, v) => s + v * (v - 1), 0) /
      (n * (n - 1)),
    meanGpTrigramLn: language / nLanguage,
  };
}

function random32(seed) {
  let v = seed >>> 0;
  return () => {
    v ^= v << 13; v ^= v >>> 17; v ^= v << 5;
    return v >>> 0;
  };
}

/** True native-GP plant: unknown randomized 29-rune order, 95×78 runes. */
function plant() {
  const next = random32(0x79357829);
  const pi = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = next() % (i + 1);
    [pi[i], pi[j]] = [pi[j], pi[i]];
  }
  const shift = pi[0];
  for (let i = 0; i < pi.length; i++) pi[i] = (pi[i] - shift + 29) % 29;
  const inv = Array(29);
  for (let i = 0; i < 29; i++) inv[pi[i]] = i;
  const sourceSegment = source.slice(140000, 140000 + 95 * 78);
  assert.equal(sourceSegment.length, 95 * 78);
  const cipher = [0], starts = [];
  let prev = 0;
  for (let k = 0; k < 95; k++) {
    starts.push(cipher.length);
    let v = 0n;
    for (const x of sourceSegment.slice(k * 78, (k + 1) * 78))
      v = v * 29n + BigInt(x);
    const digits = Array(79);
    for (let j = 78; j >= 0; j--) {
      digits[j] = Number(v % 28n);
      v /= 28n;
    }
    assert.equal(v, 0n);
    for (const d of digits) {
      prev = inv[(pi[prev] + d + 1) % 29];
      cipher.push(prev);
    }
  }
  assert.equal(cipher.length, 1 + 95 * 79);
  assert(valid(pi, triples(cipher, starts)));
  const recovered = fullCheck(pi, cipher, starts, 0, starts.length);
  assert.equal(recovered.decodedGpRunes, sourceSegment.length);
  assert.equal(recovered.exactReencryptedCipherRunes, 95 * 79);
  return {cipher, starts, truePi: pi, exactControl: recovered};
}

function keySearch(cipher, starts, firstPi, budget) {
  const rows = triples(cipher, starts);
  const roots = [], collected = new Set();
  const push = (pi, sourceTag) => {
    if (!pi || !valid(pi, rows)) return;
    const key = pi.join(',');
    if (collected.has(key)) return;
    collected.add(key);
    const s = score(pi, cipher, starts, 0, 48);
    if (!Number.isFinite(s)) return;
    roots.push({pi: pi.slice(), s, sourceTag});
    roots.sort((a, b) => b.s - a.s);
    if (roots.length > 5) roots.pop();
  };
  push(firstPi, 'original-prime79-witness');
  let enumerated = 0;
  const gate = prefixTwoDigitGate(rows, 'forward', budget.nodes, pi => {
    enumerated++;
    push(pi, 'exact-original-CSP');
    return enumerated >= budget.enumerate;
  });
  assert(enumerated > 0);
  const next = random32(budget.seed);
  const iterations = budget.iterations;
  let validMoves = 0, acceptedMoves = 0, best = roots[0];
  for (const root of roots) {
    let current = root.pi.slice(), currentScore = root.s;
    for (let iter = 0; iter < iterations; iter++) {
      const trial = current.slice();
      const a = 1 + next() % 28;
      let b = 1 + next() % 28;
      if (a === b) continue;
      if (iter % 9 === 0) {
        let c = 1 + next() % 28;
        if (c === a || c === b) continue;
        [trial[a], trial[b], trial[c]] = [trial[c], trial[a], trial[b]];
      } else {
        [trial[a], trial[b]] = [trial[b], trial[a]];
      }
      if (!valid(trial, rows)) continue;
      validMoves++;
      const ss = score(trial, cipher, starts, 0, 48);
      if (!Number.isFinite(ss)) continue;
      const temp = iter < iterations / 2 ? 7 :
        iter < iterations * .82 ? 3 : 1;
      const rawDelta = (ss - currentScore) * 48 * 6;
      if (rawDelta >= 0 ||
          next() / 4294967296 < Math.exp(rawDelta / temp)) {
        acceptedMoves++;
        current = trial;
        currentScore = ss;
        if (ss > best.s)
          best = {pi: trial.slice(), s: ss, sourceTag: 'guided-local-move'};
      }
    }
  }
  assert(valid(best.pi, rows));
  return {
    search: {
      CSPResult: gate.status, enumerated, cspNodes: gate.nodes,
      candidateSeeds: roots.length,
      proposals: iterations * roots.length,
      prefix2ValidProposals: validMoves,
      acceptedLanguageMoves: acceptedMoves,
      trainingOnly: 'first 48 of 95 intact packets',
    },
    selectedOrder: best.pi,
    selectedOn: best.sourceTag,
    prefix8: {
      trainMeanGpTrigramLn: best.s,
      untouchedHeldoutMeanGpTrigramLn:
        score(best.pi, cipher, starts, 48, 95),
    },
    trainFull: fullCheck(best.pi, cipher, starts, 0, 48),
    untouchedHeldoutFull: fullCheck(best.pi, cipher, starts, 48, 95),
  };
}

const options = {
  enumerate: Number(process.env.PRIME79_ENUMERATE || 12000),
  nodes: Number(process.env.PRIME79_NODES || 800000),
  iterations: Number(process.env.PRIME79_MOVES || 130000),
  seed: 0x79350008,
};
assert(options.enumerate > 0 && options.enumerate <= 100000);
assert(options.iterations > 0 && options.iterations <= 1000000);
const originalResult = keySearch(original, allStarts, reference, options);
const control = plant();
const plantedResult = keySearch(control.cipher, control.starts, null,
  {...options, seed: 0x79350009});
const recovered = plantedResult.selectedOrder.every(
  (v, i) => v === control.truePi[i]);
process.stdout.write(JSON.stringify({
  test: 'source-original fixed-cyclic-radix79/78 cryptanalytic key search',
  corpus: 'LP2 physical pages0..55, 12956 runes',
  model: 'first2 exact numeric CSP plus first8 GP-trigram guided cyclic-order search',
  sourceModel: '100000 independent GP Shakespeare runes',
  original: originalResult,
  plant: {
    plantedGpSource: '7410 runes after index140000, independent of score source',
    trueOrderHiddenFromSearch: true,
    trueOrder: control.truePi,
    actualGpTrigramLn: control.exactControl.meanGpTrigramLn,
    trueKeyFullForwardRoundtrip: control.exactControl.exactReencryptedCipherRunes,
    blindSearch: plantedResult,
    blindRecoveredExactOrder: recovered,
  },
  conclusion: 'Treat any original selected permutation as tentative without native heldout scores; random planted-key recovery calibrates power.',
}, null, 2) + '\n');
