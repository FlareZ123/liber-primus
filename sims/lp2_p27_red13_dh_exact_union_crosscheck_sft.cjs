'use strict';

/**
 * Independent exact-union matched-multiset cross-check for Director #1634.
 *
 * This complements the #1636 origin-by-origin union bound by conditioning on
 * the complete frozen upstream source event and sampling the union of the two
 * documented global coordinate origins directly.
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const ink = require('../resources/liber-primus/lp2-ink-annotations.json');
const grid = require('../resources/liber-primus/base60-grid.json');

const tokens = grid.rows.flat();
const a60 = grid.alphabet;
const a59 = a60.replace('f', '');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const publicSteps = new Set([2, 5, 8, 19, 23]);
const coordinateAddresses = new Set([245, 254]);

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let divisor = 2; divisor * divisor <= n; divisor += 1) {
    if (n % divisor === 0) return false;
  }
  return true;
}

/** @param {number} n */
function primeOrdinal(n) {
  let count = 0;
  for (let value = 2; value <= n; value += 1) if (isPrime(value)) count += 1;
  return count;
}

const comparable = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    if (span.length < 13) continue;
    const end = span.start + span.length;
    const hasRed13 = (page.large_punctuation || []).some(mark =>
      mark[0] === end && mark[1] === 13 && mark[2] === 'red'
    );
    if (!hasRed13) continue;
    const indices = [...span.runes].map(rune => runeIndex.get(rune));
    const sum = indices.reduce((total, index) => total + corpus.prime[index], 0);
    comparable.push({
      page: page.page,
      length: span.length,
      indices,
      sum,
      ordinal: isPrime(sum) ? primeOrdinal(sum) : null,
    });
  }
}
assert.deepEqual(comparable.map(row => [row.page, row.length, row.sum, row.ordinal]), [
  [0,13,662,null], [3,16,742,null], [7,14,766,null],
  [23,16,786,null], [27,19,1109,186], [53,51,2262,null],
]);

const p27 = comparable.find(row => row.page === 27);
assert(p27);
assert.equal(corpus.prime[p27.indices[12]], 31);
assert.equal(31 * (p27.length - 13), p27.ordinal);
assert.equal(tokens[p27.ordinal], '0J');
assert.equal(decode(tokens[p27.ordinal], a59), 19);
assert.equal(decode(tokens[p27.ordinal], a60), 19);
assert.deepEqual(
  [[254, tokens[254], decode(tokens[254], a59), decode(tokens[254], a60)],
   [245, tokens[245], decode(tokens[245], a59), decode(tokens[245], a60)]],
  [[254, '39', 186, 189], [245, '0u', 55, 56]]
);

const eligiblePairs = [];
for (let first = 0; first < 256; first += 1) {
  if (first === 186) continue;
  for (let second = first + 1; second < 256; second += 1) {
    if (second === 186) continue;
    if (coordinateAddresses.has(first) || coordinateAddresses.has(second)) {
      eligiblePairs.push([first, second]);
    }
  }
}
assert.equal(eligiblePairs.length, 507);
const allPairsAfter0J = 255 * 254 / 2;
const upstreamProbability = (1 / 256) * (eligiblePairs.length / allPairsAfter0J);

const tokenNames = [...new Set(tokens)];
const tokenId = new Map(tokenNames.map((token, id) => [token, id]));
const id39 = tokenId.get('39');
const poolBase = tokens
  .filter(token => token !== '0J' && token !== '39')
  .map(token => tokenId.get(token));
// filter removes the unique 0J and both copies of 39.
assert.equal(poolBase.length, 253);
const values59 = tokenNames.map(token => decode(token, a59));
const values60 = tokenNames.map(token => decode(token, a60));

let rngState = 0x1634BEEF >>> 0;
function random32() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  rngState >>>= 0;
  return rngState;
}

const assignedToken = new Int16Array(256);
const assignedStamp = new Uint32Array(256);
const poolSwap = new Int16Array(poolBase.length);
const poolStamp = new Uint32Array(poolBase.length);
let stamp = 0;

/** @param {number} trials */
function runMatchedControl(trials) {
  let broadPointer = 0;
  let strictPointer = 0;
  let endpointSelfPointer = 0;
  let broadAndSelf = 0;

  for (let trial = 0; trial < trials; trial += 1) {
    stamp += 1;
    const pair = eligiblePairs[random32() % eligiblePairs.length];
    let poolLength = poolBase.length;

    /** @param {number} position */
    function poolIndex(position) {
      return poolStamp[position] === stamp ? poolSwap[position] : position;
    }

    function drawToken() {
      const position = random32() % poolLength;
      const index = poolIndex(position);
      const lastPosition = poolLength - 1;
      const lastIndex = poolIndex(lastPosition);
      poolStamp[position] = stamp;
      poolSwap[position] = lastIndex;
      poolLength -= 1;
      return poolBase[index];
    }

    /** @param {number} position */
    function tokenAt(position) {
      if (position === 186) return tokenId.get('0J');
      if (position === pair[0] || position === pair[1]) return id39;
      if (assignedStamp[position] === stamp) return assignedToken[position];
      const id = drawToken();
      assignedStamp[position] = stamp;
      assignedToken[position] = id;
      return id;
    }

    /** @param {number} position @param {number} radix */
    function valueAt(position, radix) {
      if (position < 0 || position >= 256) return null;
      const id = tokenAt(position);
      return radix === 59 ? values59[id] : values60[id];
    }

    /** @param {number} start @param {number} target @param {number} radix */
    function firstReach(start, target, radix) {
      let at = start;
      for (let step = 1; step <= 23; step += 1) {
        at = valueAt(at, radix);
        if (at === null || at < 0 || at >= 256) return null;
        if (at === target) return step;
      }
      return null;
    }

    const reaches = [
      firstReach(186, 189, 59),
      firstReach(189, 186, 59),
      firstReach(186, 189, 60),
      firstReach(189, 186, 60),
    ];
    const broad = reaches.some(step => publicSteps.has(step));
    const strict = reaches[0] === 8;
    const self = values59[tokenAt(189)] === 189;
    broadPointer += Number(broad);
    strictPointer += Number(strict);
    endpointSelfPointer += Number(self);
    broadAndSelf += Number(broad && self);
  }

  return {trials, broadPointer, strictPointer, endpointSelfPointer, broadAndSelf};
}

const control = runMatchedControl(500000);
assert.deepEqual(control, {
  trials: 500000,
  broadPointer: 62370,
  strictPointer: 6504,
  endpointSelfPointer: 8109,
  broadAndSelf: 664,
});

const broadFamilyRate = upstreamProbability * control.broadPointer / control.trials;
const strictFamilyRate = upstreamProbability * control.strictPointer / control.trials;
const broadWithSelfRate = upstreamProbability * control.broadAndSelf / control.trials;

console.log(JSON.stringify({
  status: 'PASS: exact-union cross-check of p27 red13/DH23 familywise null',
  sourceGate: {
    comparablePages: comparable.map(row => row.page),
    uniquePrimeOrdinalPage: p27.page,
    ordinal: p27.ordinal,
    markerPrime: 31,
    residual: 6,
    tableReturn: tokens[p27.ordinal],
  },
  coordinateOrigins: {
    zeroBased: {address: 254, token: tokens[254]},
    oneBased: {address: 245, token: tokens[245]},
  },
  exactUnion: {
    eligible39PositionPairsAfterFixing0J: eligiblePairs.length,
    totalPositionPairsAfterFixing0J: allPairsAfter0J,
    upstreamProbability,
  },
  matchedControl: {
    seed: '0x1634BEEF',
    ...control,
    broadConditionalRate: control.broadPointer / control.trials,
    strictConditionalRate: control.strictPointer / control.trials,
  },
  familywise: {
    broadFamilyRate,
    broadInverseRate: 1 / broadFamilyRate,
    strictFamilyRate,
    strictInverseRate: 1 / strictFamilyRate,
    broadWithEndpointSelfPointerRate: broadWithSelfRate,
    broadWithEndpointSelfPointerInverseRate: 1 / broadWithSelfRate,
  },
  interpretation: 'Directly sampling the union of the two documented global coordinate origins corroborates the independent origin-by-origin union-bound audit. The earlier fixed-assignment 1-in-200m figure remains post-discovery and should not be used as the familywise rate.',
}, null, 2));
