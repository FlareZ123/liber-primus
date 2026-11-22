'use strict';

/**
 * LP1 p05 Onion3 179-byte length -> original LP2 p0-2 post-red 4x179 register.
 * Tests two clue-fixed direct consumers:
 * (1) all eight four-share +/- additive folds; and
 * (2) every 179-phase shared unknown GP29 permutation, via an exact
 *     cross-lane same-symbol invariant independent of all 29! keys per phase.
 * Native GP29 English controls use held-back Shakespeare, Gibran and Emerson.
 * Read-only, dependency-free Node 22 CommonJS single-file test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name));
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const image = read('resources/liber-primus/05.jpg');

assert.equal(image.length, 673066);
assert.equal(sha256(image),
  '2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7');
const firstEoi = image.indexOf(Buffer.from([0xff, 0xd9]));
assert.equal(firstEoi, 336351);
const wrapped = image.subarray(firstEoi + 2, firstEoi + 2 + 360);
assert.deepEqual([...wrapped.subarray(0, 2)], [10, 10]);
const payload = Buffer.from(wrapped.subarray(2).toString('ascii'), 'hex');
assert.equal(payload.length, 179);
assert.equal(sha256(payload),
  '82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa');

const opening = [0, 1, 2].map(index => source.pages.find(p => p.page === index));
assert.deepEqual(opening.map(p => p.indices.length), [262, 266, 201]);
assert.deepEqual(opening[0].indices.slice(0, 13),
  [15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]);
const body = [...opening[0].indices.slice(13), ...opening[1].indices, ...opening[2].indices];
const phaseCount = payload.length;
assert.equal(body.length, 4 * phaseCount);
const lanes = Array.from({length:4},
  (_, lane) => body.slice(lane * phaseCount, (lane + 1) * phaseCount));

const letters = {
  A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8, I:10, J:11, L:20,
  M:19, N:9, O:3, P:13, R:4, S:15, T:16, U:1, W:7, X:14, Y:26
};
const pairs = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const aliases = {K:'C', Q:'C', V:'U', Z:'S'};
function gpText(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, '')
    .replace(/[KQVZ]/g, ch => aliases[ch]);
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = pairs[s.slice(i, i + 2)];
    if (pair !== undefined) {
      out.push(pair);
      i += 2;
    } else {
      assert.ok(letters[s[i]] !== undefined, 'unknown GP romanization');
      out.push(letters[s[i]]);
      i++;
    }
  }
  return out;
}
const shakespeare = read('resources/control/shakespeare_first300k.txt')
  .toString('utf8').replace(/\r\n/g, '\n');
assert.equal(shakespeare.length, 300000);
const gibran = read('resources/control/gibran_prophet_58585.txt').toString('utf8');
const emerson = read('resources/control/emerson_essays_2944.txt').toString('utf8');
const native = [shakespeare, gibran, emerson].map(gpText);

function pairEqual(four) {
  let pairsEqual = 0, columns = 0, tripleColumns = 0;
  for (let j = 0; j < phaseCount; j++) {
    let matches = 0;
    for (let x = 0; x < 4; x++) {
      for (let y = x + 1; y < 4; y++) {
        if (four[x][j] === four[y][j]) matches++;
      }
    }
    pairsEqual += matches;
    if (matches) columns++;
    if (matches >= 3) tripleColumns++;
  }
  return {pairsEqual, columns, tripleColumns};
}
const observed = pairEqual(lanes);
assert.deepEqual(observed, {pairsEqual:29, columns:28, tripleColumns:0});
const adjacent = lanes.map(lane =>
  lane.slice(1).filter((v, i) => v === lane[i]).length);
assert.deepEqual(adjacent, [1, 1, 1, 1]);

/* Deterministic, unaltered-text, independent-section four-stream controls. */
function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}
const random = xorshift(20261117);
const controls = [];
for (let trial = 0; trial < 20000; trial++) {
  const four = [];
  for (let lane = 0; lane < 4; lane++) {
    const reference = native[lane % 3];
    const start = random() % (reference.length - phaseCount);
    four.push(reference.slice(start, start + phaseCount));
  }
  controls.push(pairEqual(four).pairsEqual);
}
controls.sort((a, b) => a - b);
const lessOrEqual = controls.filter(x => x <= observed.pairsEqual).length;
assert.equal(lessOrEqual, 1);
assert.equal(controls[0], 27);
assert.equal(controls[10000], 62);

/* 179 independently secret complete alphabets, reused for four lanes.
 * For any such secret, same-phase symbol equality is exactly preserved.
 * The positive recovers all four planted authentic English windows. */
const positivePlain = [
  native[0].slice(1000, 1179),
  native[1].slice(4000, 4179),
  native[2].slice(10000, 10179),
  native[1].slice(40000, 40179)
];
const keyRandom = xorshift(0x33010579);
const tables = [], reverse = [];
for (let phase = 0; phase < phaseCount; phase++) {
  const table = Array.from({length:29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = keyRandom() % (i + 1);
    [table[i], table[j]] = [table[j], table[i]];
  }
  const inverse = new Array(29);
  table.forEach((v, i) => { inverse[v] = i; });
  tables.push(table);
  reverse.push(inverse);
}
const positiveCipher = positivePlain.map(lane =>
  lane.map((p, j) => tables[j][p]));
const positiveDecoded = positiveCipher.map(lane =>
  lane.map((c, j) => reverse[j][c]));
assert.deepEqual(positiveDecoded, positivePlain);
assert.deepEqual(pairEqual(positiveCipher), pairEqual(positivePlain));
// Even a deterministic many-to-one secret table cannot erase a genuine
// equal-plaintext pair when reused at the same column: it can only add matches.
const lossyCipher = positivePlain.map(lane =>
  lane.map((p, j) => (p + j) % 15));
assert.ok(pairEqual(lossyCipher).pairsEqual >= pairEqual(positivePlain).pairsEqual);

/* The distinct literal four-share sum/difference candidate has eight
 * source-ordered sign readings (fixing first sign +1 removes global negation).
 * Each fold is a reversible four-lane compression GIVEN three other lanes.
 * Test for a directly exposed 179-rune GP-native plaintext, not for a
 * speculative second changing-key layer. */
const mod = v => (v % 29 + 29) % 29;
const ioc = seq => {
  const counts = new Uint32Array(29);
  for (const x of seq) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
};
const train = gpText(shakespeare.slice(0, 200000));
const heldout = gpText(shakespeare.slice(200000));
const unigrams = new Uint32Array(29), bigrams = new Uint32Array(841),
  trigrams = new Uint32Array(24389);
for (let i = 0; i < train.length; i++) {
  unigrams[train[i]]++;
  if (i) bigrams[29 * train[i - 1] + train[i]]++;
  if (i > 1) trigrams[(29 * train[i - 2] + train[i - 1]) * 29 + train[i]]++;
}
const logU = Array.from(unigrams, x => Math.log((x + 1) / (train.length + 29)));
const logB = new Float64Array(841), logT = new Float64Array(24389);
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const ab = 29 * a + b;
    logB[ab] = Math.log((bigrams[ab] + 12 * Math.exp(logU[b])) /
      (unigrams[a] + 12));
    for (let c = 0; c < 29; c++) {
      const abc = 29 * ab + c;
      logT[abc] = Math.log((trigrams[abc] + 9 * Math.exp(logB[29 * b + c])) /
        (bigrams[ab] + 9));
    }
  }
}
function score(seq) {
  let sum = logU[seq[0]] + logB[29 * seq[0] + seq[1]];
  for (let i = 2; i < seq.length; i++) {
    sum += logT[(29 * seq[i - 2] + seq[i - 1]) * 29 + seq[i]];
  }
  return sum / seq.length;
}
const folds = [];
for (let mask = 0; mask < 8; mask++) {
  const signs = [1, ...[0, 1, 2].map(i => mask & (1 << i) ? 1 : -1)];
  const folded = Array.from({length:phaseCount}, (_, j) =>
    mod(signs.reduce((sum, sign, lane) => sum + sign * lanes[lane][j], 0)));
  for (let j = 0; j < phaseCount; j++) {
    const recoveredLast = mod(signs[3] *
      (folded[j] - signs.slice(0, 3).reduce((sum, sign, k) =>
        sum + sign * lanes[k][j], 0)));
    assert.equal(recoveredLast, lanes[3][j]);
  }
  folds.push({signs, ioc:ioc(folded), trigram:score(folded)});
}
/* Authenticated Cicada historical Shamir-secret-sharing idiom: the four
 * source-aligned 179-rune lanes can also be read as degree-three polynomial
 * shares at x=1,2,3,4 over GF29, evaluated at x=0. This exact conventional
 * four-of-four Lagrange inverse uses [4,-6,4,-1], not just +/- folds.
 * No first-party LP2 source instructs this interpretation. */
const shamirWeights = [4, -6, 4, -1];
const shamirCandidate = Array.from({length:phaseCount}, (_, j) =>
  mod(shamirWeights.reduce((sum, w, lane) =>
    sum + w * lanes[lane][j], 0)));
const shamirScore = score(shamirCandidate);
const shamirIoC = ioc(shamirCandidate);
const shamirPlain = heldout.slice(179, 358);
const shamirRandom = xorshift(0x33010429);
const shamirShares = Array.from({length:4}, () => new Array(phaseCount));
for (let j = 0; j < phaseCount; j++) {
  const a1 = shamirRandom() % 29;
  const a2 = shamirRandom() % 29;
  const a3 = shamirRandom() % 29;
  for (let k = 0; k < 4; k++) {
    const x = k + 1;
    shamirShares[k][j] = mod(shamirPlain[j] +
      a1 * x + a2 * x * x + a3 * x * x * x);
  }
}
const shamirRecovered = Array.from({length:phaseCount}, (_, j) =>
  mod(shamirWeights.reduce((total, w, lane) =>
    total + w * shamirShares[lane][j], 0)));
assert.deepEqual(shamirRecovered, shamirPlain);

const heldScores = [];
const stride = Math.floor((heldout.length - phaseCount) / 1999);
for (let j = 0; j < 2000; j++) {
  heldScores.push(score(heldout.slice(j * stride, j * stride + phaseCount)));
}
heldScores.sort((a, b) => a - b);
assert.ok(folds.every(f => f.trigram < heldScores[0]));
assert.ok(shamirScore < heldScores[0]);
// Compare every decoded candidate with native heldout. Avoid a hard-coded
// score equality because the reference file's line endings can vary by checkout.

/* Source-native shamir-style positive: four random GP29 shares sum to an
 * actual 179-rune heldout plaintext, and the same direct fold recovers it. */
const plantedPlain = heldout.slice(0, phaseCount);
const shareRand = xorshift(0x05a1179);
const share = Array.from({length:4}, () => new Array(phaseCount));
for (let j = 0; j < phaseCount; j++) {
  let partial = 0;
  for (let k = 0; k < 3; k++) {
    share[k][j] = shareRand() % 29;
    partial += share[k][j];
  }
  share[3][j] = mod(plantedPlain[j] - partial);
}
const recovered = Array.from({length:phaseCount}, (_, j) =>
  mod(share.reduce((sum, lane) => sum + lane[j], 0)));
assert.deepEqual(recovered, plantedPlain);


/* Source-selected alternative outer layer: invert one of two standard rank-28
 * no-adjacent-repeat encoders BEFORE applying a shared secret phase179 table.
 * The opening's four actual repeated-cipher events and the first register
 * rune are treated as erasures, not silently assigned favorable ranks. */
const erased = body.map((value, i) => i === 0 || value === body[i - 1]);
assert.equal(erased.filter(Boolean).length, 5);
const native28 = native.map(sequence =>
  sequence.map(value => value === 28 ? 25 : value));
const rankModes = ['sorted', 'cyclic'];
const rankGates = rankModes.map(method => {
  const rank = body.map((value, i) => {
    if (erased[i]) return null;
    const preceding = body[i - 1];
    if (method === 'sorted') return value - Number(value > preceding);
    return (value - preceding + 29) % 29 - 1;
  });
  const pairCoordinates = [];
  let originalMatches = 0;
  for (let column = 0; column < phaseCount; column++) {
    for (let first = 0; first < 4; first++) {
      for (let second = first + 1; second < 4; second++) {
        const a = column + phaseCount * first;
        const b = column + phaseCount * second;
        if (rank[a] !== null && rank[b] !== null) {
          pairCoordinates.push([column, first, second]);
          originalMatches += Number(rank[a] === rank[b]);
        }
      }
    }
  }
  return {
    method,
    validRanks:rank.filter(x => x !== null).length,
    comparedLanePairs:pairCoordinates.length,
    originalMatches,
    pairCoordinates,
    rank
  };
});
assert.deepEqual(rankGates.map(x =>
  [x.validRanks, x.comparedLanePairs, x.originalMatches]),
[[711, 1059, 29], [711, 1059, 45]]);
const rankNullRandom = xorshift(0x20141179);
const rankControlScores = rankGates.map(() => []);
for (let trial = 0; trial < 10000; trial++) {
  const quartet = [];
  for (let lane = 0; lane < 4; lane++) {
    const reference = native28[lane % 3];
    const start = rankNullRandom() % (reference.length - phaseCount);
    quartet.push(reference.slice(start, start + phaseCount));
  }
  rankGates.forEach((gate, index) => {
    let matches = 0;
    for (const [column, first, second] of gate.pairCoordinates)
      matches += Number(quartet[first][column] === quartet[second][column]);
    rankControlScores[index].push(matches);
  });
}
rankControlScores.forEach(control => control.sort((a, b) => a - b));
const rankedPlain = positivePlain.flat().map(v => v === 28 ? 25 : v);
const rankSecretRandom = xorshift(0x28c1179);
const rankSecret = [], rankInverse = [];
for (let column = 0; column < phaseCount; column++) {
  const table = Array.from({length:28}, (_, i) => i);
  for (let k = 27; k > 0; k--) {
    const j = rankSecretRandom() % (k + 1);
    [table[k], table[j]] = [table[j], table[k]];
  }
  const inv = new Array(28);
  table.forEach((v, i) => { inv[v] = i; });
  rankSecret.push(table);
  rankInverse.push(inv);
}
function encodeRank(mode, rank, previous) {
  if (mode === 'sorted') return rank + Number(rank >= previous);
  return (previous + rank + 1) % 29;
}
function decodeRank(mode, value, previous) {
  if (mode === 'sorted') return value - Number(value > previous);
  return (value - previous + 29) % 29 - 1;
}
const rankResult = rankGates.map((gate, index) => {
  const simulated = new Array(body.length);
  simulated[0] = 13;
  for (let i = 1; i < simulated.length; i++) {
    if (erased[i]) {
      simulated[i] = simulated[i - 1];
    } else {
      const phase = i % phaseCount;
      const scrambled = rankSecret[phase][rankedPlain[i]];
      simulated[i] = encodeRank(gate.method, scrambled, simulated[i - 1]);
      assert.notEqual(simulated[i], simulated[i - 1]);
    }
  }
  const recovered = new Array(body.length);
  let completeLegal = 0;
  for (let i = 0; i < simulated.length; i++) {
    if (erased[i]) {
      // These five symbols are true outside-channel exceptions, given
      // separately only as a deliberately stronger synthetic positive.
      recovered[i] = rankedPlain[i];
    } else {
      const phase = i % phaseCount;
      const inner = decodeRank(gate.method, simulated[i], simulated[i - 1]);
      assert.equal(inner, rankSecret[phase][rankedPlain[i]]);
      recovered[i] = rankInverse[phase][inner];
      completeLegal++;
    }
  }
  assert.equal(completeLegal, 711);
  assert.deepEqual(recovered, rankedPlain);
  const control = rankControlScores[index];
  return {
    rankInverse:gate.method,
    sourceValidPositions:gate.validRanks,
    sourceErasedPositions:erased.flatMap((v, i) => v ? [i] : []),
    comparedLanePairs:gate.comparedLanePairs,
    originalMatches:gate.originalMatches,
    sourceMatchedControlCount:control.length,
    controlsAtOrBelowOriginal:control.filter(x =>
      x <= gate.originalMatches).length,
    controlMinimum:control[0],
    controlMedian:control[5000],
    plantedLegalRecovered:completeLegal,
    plantedExceptionSidecar:erased.filter(Boolean).length,
    plantedFullRecovered:recovered.length
  };
});
assert.deepEqual(rankResult.map(r => [
  r.controlsAtOrBelowOriginal, r.controlMinimum, r.controlMedian
]), [[0,36,62],[174,36,62]]);

console.log(JSON.stringify({
  source:{
    originalJpeg:'resources/liber-primus/05.jpg',
    lp1PayloadSha256:sha256(payload), lp1PayloadBytes:phaseCount,
    openingLengths:[262,266,201], postRedOriginalRunes:body.length,
    blackBodyFourLanes:lanes.map(x => x.length), adjacentEqualPerLane:adjacent
  },
  keyIndependentPhase179:{
    claim:'Every shared 179-phase secret GP29 alphabet preserves same-column equality across four lanes',
    original:observed,
    controlCount:controls.length, controlAtOrBelowOriginal:lessOrEqual,
    controlMin:controls[0], controlP1:controls[200],
    controlMedian:controls[10000], controlMax:controls.at(-1),
    plantedSourceNativeExact:positiveDecoded.every((lane, i) =>
      lane.every((v, j) => v === positivePlain[i][j])),
    plantedSameColumnEqual:pairEqual(positiveCipher).pairsEqual,
    deterministicNoninjectiveNecessaryBoundHolds:
      pairEqual(lossyCipher).pairsEqual >= pairEqual(positivePlain).pairsEqual
  },
  conventionalGF29FourOfFourShamir:{
    shares:'four consecutive original 179-rune ciphertext lanes at x=1,2,3,4',
    interpolationWeights:shamirWeights,
    originalScore:shamirScore,
    originalIoC:shamirIoC,
    authenticNativePlantRecovered:shamirRecovered.length,
    nativeWorstHeldout179:heldScores[0],
    modelCaveat:'No original instruction says these are Shamir shares; only conventional direct plaintext interpolation tested'
  },
  rank28ThenSharedSecret179:{
    interpretation:'Two rank-28 no-repeat outer inverses plus unknown 179-phase shared secret 28-alphabet; original repeat sites conservatively erased',
    modelScope:'Strict rank-28 output itself cannot produce the four repeated ciphertext transitions without an independent escape channel',
    results:rankResult
  },
  signedFourShareFold:{
    candidates:folds, bestOriginalScore:Math.max(...folds.map(x => x.trigram)),
    nativeHeldoutWindows:heldScores.length, nativeMinScore:heldScores[0],
    nativeMedianScore:heldScores[1000],
    plantedFourShareExact:recovered.every((x, j) => x === plantedPlain[j])
  },
  decision:'No authentic unknown plaintext recovered. This specific four-lane shared-secret GP29-permutation/period179-register and the eight source-ordered direct additive folds are incompatible with the tested native GP29 English controls. A layer after or before this clock, a differently segmented text, and another plaintext register remain untested.'
}, null, 2));
