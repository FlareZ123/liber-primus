'use strict';

/**
 * p27 red13 marker -> hidden DH exponent -> p50 radix transducer.
 *
 * Run:
 *   node sims/lp2_p27_red13_dh_radix_transducer_sft.cjs
 *
 * Source-only structural test. No unknown plaintext.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file */
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const ink = readJson('resources/liber-primus/lp2-ink-annotations.json');
const grid = readJson('resources/liber-primus/base60-grid.json');

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.rows.flat();
const base60Alphabet = grid.alphabet;
const base59Alphabet = base60Alphabet.replace('f', '');
assert.equal(tokens.length, 256);
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

/** @param {number} n */
function primeOrdinal(n) {
  assert(isPrime(n));
  let count = 0;
  for (let value = 2; value <= n; value++) {
    if (isPrime(value)) count++;
  }
  return count;
}

/** @param {string} runes */
function gpPrimeSum(runes) {
  return [...runes].reduce((sum, rune) => {
    const index = runeIndex.get(rune);
    assert.notEqual(index, undefined);
    return sum + corpus.prime[index];
  }, 0);
}

/** @param {string} alphabet @param {string} token */
function decodeToken(alphabet, token) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number[]} map @param {number} start @param {number} hops */
function walk(map, start, hops) {
  const nodes = [start];
  let at = start;
  for (let step = 0; step < hops; step++) {
    at = map[at];
    nodes.push(at);
  }
  return nodes;
}

const comparable = [];
for (const page of ink.pages) {
  for (const span of page.red_spans || []) {
    if (span.length < 13) continue;
    const hasTrailingRed13 = (page.large_punctuation || []).some(mark =>
      mark[0] === span.start + span.length &&
      mark[1] === 13 &&
      mark[2] === 'red'
    );
    if (!hasTrailingRed13) continue;

    const sum = gpPrimeSum(span.runes);
    const values = [...span.runes].map(rune => {
      const index = runeIndex.get(rune);
      return {
        rune,
        index,
        gp: corpus.translit[index],
        prime: corpus.prime[index],
      };
    });

    comparable.push({
      page: page.page,
      start: span.start,
      length: span.length,
      sum,
      primeSum: isPrime(sum),
      rank: isPrime(sum) ? primeOrdinal(sum) : null,
      values,
    });
  }
}

assert.deepEqual(comparable.map(row => row.page), [0, 3, 7, 23, 27, 53]);
assert.deepEqual(comparable.filter(row => row.primeSum).map(row => row.page), [27]);

// A fully local red13 construction independently reaches the same address.
// For every comparable span: gap = red length - 13; select the 13th rune;
// multiply its GP prime by the gap; if the address fits the table, read it.
// P27 is the sole member whose table value returns the source red length.
const localLoopControls = comparable.map(row => {
  const gap = row.length - 13;
  const rune13 = row.values[12];
  const address = rune13.prime * gap;
  const inRange = address >= 0 && address < tokens.length;
  return {
    page: row.page,
    length: row.length,
    gap,
    rune13: rune13.gp,
    rune13Prime: rune13.prime,
    address,
    token: inRange ? tokens[address] : null,
    value59: inRange ? decodeToken(base59Alphabet, tokens[address]) : null,
    value60: inRange ? decodeToken(base60Alphabet, tokens[address]) : null,
  };
});
assert.deepEqual(localLoopControls, [
  {page:0,length:13,gap:0,rune13:'C',rune13Prime:13,address:0,token:'3N',value59:200,value60:203},
  {page:3,length:16,gap:3,rune13:'H',rune13Prime:23,address:69,token:'1D',value59:72,value60:73},
  {page:7,length:14,gap:1,rune13:'EA',rune13Prime:109,address:109,token:'34',value59:181,value60:184},
  {page:23,length:16,gap:3,rune13:'T',rune13Prime:59,address:177,token:'2B',value59:129,value60:131},
  {page:27,length:19,gap:6,rune13:'I',rune13Prime:31,address:186,token:'0J',value59:19,value60:19},
  {page:53,length:51,gap:38,rune13:'J',rune13Prime:37,address:1406,token:null,value59:null,value60:null},
]);
assert.deepEqual(localLoopControls.filter(row =>
  row.value59 === row.length && row.value60 === row.length).map(row => row.page), [27]);
const p27 = comparable.find(row => row.page === 27);
assert(p27);
assert.equal(p27.length, 19);
assert.equal(p27.sum, 1109);
assert.equal(p27.rank, 186);
assert.equal(p27.length - 13, 6);
assert.equal(p27.values[12].prime * (p27.length - 13), p27.rank);
assert.equal(decodeToken(base59Alphabet, tokens[p27.rank]), p27.length);
assert.equal(decodeToken(base60Alphabet, tokens[p27.rank]), p27.length);
assert.equal(p27.values[0].gp, 'M');
assert.equal(p27.values[0].index, 19);

// Four simple ways to interpret a 13-count as a position in a 19-rune span.
// Only ordinary one-based forward position 13 yields a prime divisor of rank186.
const markerSelections = [
  {name: 'one-based-forward', entry: p27.values[12]},
  {name: 'zero-based-forward', entry: p27.values[13]},
  {name: 'one-based-reverse', entry: p27.values[p27.values.length - 13]},
  {name: 'zero-based-reverse', entry: p27.values[p27.values.length - 1 - 13]},
].map(row => ({
  ...row,
  dividesRank: p27.rank % row.entry.prime === 0,
  quotient: p27.rank % row.entry.prime === 0 ? p27.rank / row.entry.prime : null,
}));

assert.deepEqual(markerSelections.map(row => ({
  name: row.name,
  gp: row.entry.gp,
  prime: row.entry.prime,
  dividesRank: row.dividesRank,
  quotient: row.quotient,
})), [
  {name: 'one-based-forward', gp: 'I', prime: 31, dividesRank: true, quotient: 6},
  {name: 'zero-based-forward', gp: 'M', prime: 71, dividesRank: false, quotient: null},
  {name: 'one-based-reverse', gp: 'A', prime: 97, dividesRank: false, quotient: null},
  {name: 'zero-based-reverse', gp: 'O', prime: 7, dividesRank: false, quotient: null},
]);

const selectedPrime = markerSelections[0].entry.prime;
const selectedQuotient = markerSelections[0].quotient;
const markerCount = 13;
const residualRuneCount = p27.length - markerCount;
assert.equal(selectedPrime, 31);
assert.equal(residualRuneCount, 6);
assert.equal(selectedPrime * residualRuneCount, p27.rank);
assert.equal(selectedQuotient, residualRuneCount);

// The same quotient is the hidden server exponent in the signed 2013 worked DH example.
const dh = {p: 23, g: 5, serverPublic: 8, clientPublic: 19, shared: 2};
const serverExponents = [];
const clientExponents = [];
for (let exponent = 1; exponent < dh.p; exponent++) {
  if (modPow(dh.g, exponent, dh.p) === dh.serverPublic) serverExponents.push(exponent);
  if (modPow(dh.g, exponent, dh.p) === dh.clientPublic) clientExponents.push(exponent);
}
assert.deepEqual(serverExponents, [6]);
assert.deepEqual(clientExponents, [15]);
assert.equal(selectedQuotient, serverExponents[0]);

// The marker-derived pair (31,6) is a literal valid coordinate only if rows
// and columns are zero-based. The swapped coordinate is outside the 8 columns.
const zeroBasedIndex = selectedPrime * 8 + selectedQuotient;
const oneBasedIndex = (selectedPrime - 1) * 8 + (selectedQuotient - 1);
assert.equal(zeroBasedIndex, 254);
assert.equal(oneBasedIndex, 245);
assert.equal(tokens[zeroBasedIndex], '39');
assert.equal(tokens[oneBasedIndex], '0u');

const transducerToken = tokens[zeroBasedIndex];
const transducer59 = decodeToken(base59Alphabet, transducerToken);
const transducer60 = decodeToken(base60Alphabet, transducerToken);
assert.equal(transducer59, 186);
assert.equal(transducer60, 189);

// The source-selected token and the same one-based-forward indexing convention
// reconstruct the remaining DH fields directly from p27.
const transducerDigits = [...transducerToken].map(ch => base60Alphabet.indexOf(ch));
assert.deepEqual(transducerDigits, [3, 9]);
const modulusSelector = transducerDigits[1];
const modulusSelections = [
  {name:'one-based-forward', entry:p27.values[modulusSelector - 1]},
  {name:'zero-based-forward', entry:p27.values[modulusSelector]},
  {name:'one-based-reverse', entry:p27.values[p27.values.length - modulusSelector]},
  {name:'zero-based-reverse', entry:p27.values[p27.values.length - 1 - modulusSelector]},
];
assert.deepEqual(modulusSelections.map(row => ({name:row.name,gp:row.entry.gp,prime:row.entry.prime})), [
  {name:'one-based-forward',gp:'H',prime:23},
  {name:'zero-based-forward',gp:'L',prime:73},
  {name:'one-based-reverse',gp:'E',prime:67},
  {name:'zero-based-reverse',gp:'L',prime:73},
]);
const sourceModulus = modulusSelections[0].entry.prime;
const tableWidth = grid.rows[0].length;
const sourceStartAddress = transducer59;
const sourceEndAddress = transducer60;
assert.equal(Math.floor(sourceStartAddress / tableWidth), sourceModulus);
assert.equal(Math.floor(sourceEndAddress / tableWidth), sourceModulus);
const sourceShared = sourceStartAddress % tableWidth;
const sourceBase = sourceEndAddress % tableWidth;
assert.equal(sourceShared, 2);
assert.equal(sourceBase, 5);
assert.equal(selectedPrime % corpus.runes.length, sourceShared);

// The derived base5 selects position5 of the same red heading. Under the
// same one-based-forward convention it is S, whose GP index15 is the
// client secret exponent. All three rival index orientations fail15.
const clientSecretSelections = [
  {name:'one-based-forward', entry:p27.values[sourceBase - 1]},
  {name:'zero-based-forward', entry:p27.values[sourceBase]},
  {name:'one-based-reverse', entry:p27.values[p27.values.length - sourceBase]},
  {name:'zero-based-reverse', entry:p27.values[p27.values.length - 1 - sourceBase]},
];
assert.deepEqual(clientSecretSelections.map(row => ({name:row.name,gp:row.entry.gp,index:row.entry.index})), [
  {name:'one-based-forward',gp:'S',index:15},
  {name:'zero-based-forward',gp:'O',index:3},
  {name:'one-based-reverse',gp:'L',index:20},
  {name:'zero-based-reverse',gp:'M',index:19},
]);
const sourceServerSecret = residualRuneCount;
const sourceClientSecret = clientSecretSelections[0].entry.index;
const sourceServerPublic = modPow(sourceBase, sourceServerSecret, sourceModulus);
const sourceClientPublic = modPow(sourceBase, sourceClientSecret, sourceModulus);
const sourceSharedServer = modPow(sourceClientPublic, sourceServerSecret, sourceModulus);
const sourceSharedClient = modPow(sourceServerPublic, sourceClientSecret, sourceModulus);
assert.equal(sourceServerPublic, tableWidth);
assert.equal(sourceClientPublic, p27.length);
assert.equal(sourceClientPublic, p27.values[0].index);
assert.equal(sourceSharedServer, sourceShared);
assert.equal(sourceSharedClient, sourceShared);
assert.deepEqual({
  p:sourceModulus, g:sourceBase, serverPublic:sourceServerPublic,
  clientPublic:sourceClientPublic, shared:sourceShared,
  serverSecret:sourceServerSecret, clientSecret:sourceClientSecret,
}, {p:23,g:5,serverPublic:8,clientPublic:19,shared:2,serverSecret:6,clientSecret:15});
// Those two radix readings are exactly the signed DH (p,shared) and (p,g)
// addresses in the table's 8-column row-major geometry.
const start = dh.p * 8 + dh.shared;
const end = dh.p * 8 + dh.g;
assert.equal(start, 186);
assert.equal(end, 189);
assert.equal(transducer59, start);
assert.equal(transducer60, end);

// The start cell returns the signed client public share under both alphabets.
assert.equal(tokens[start], '0J');
assert.equal(decodeToken(base59Alphabet, tokens[start]), dh.clientPublic);
assert.equal(decodeToken(base60Alphabet, tokens[start]), dh.clientPublic);
assert.equal(p27.length, dh.clientPublic);
assert.equal(p27.values[0].index, dh.clientPublic);

// The already observed base59 pointer closure uses the signed server-public
// count as the exact hop count and ends at the signed base coordinate.
const values59 = tokens.map(token => decodeToken(base59Alphabet, token));
const values60 = tokens.map(token => decodeToken(base60Alphabet, token));
const path59 = walk(values59, start, dh.serverPublic);
const path60 = walk(values60, start, dh.serverPublic);
assert.deepEqual(path59, [186, 19, 33, 112, 72, 161, 214, 247, 189]);
assert.deepEqual(path60, [186, 19, 33, 114, 197, 115, 247, 192, 0]);
assert.equal(path59.at(-1), end);
assert.equal(values59[end], end);
assert.notEqual(path60.at(-1), end);

// Secondary, predeclared-after-discovery table diagnostic. Hold three source
// assignments fixed in exact token identity, then randomize the exact remaining
// token multiset and ask whether 186 first reaches189 at hop8.
assert.equal(tokens.filter(token => token === '39').length, 2);
assert.equal(tokens.filter(token => token === '0J').length, 1);
assert.equal(tokens.filter(token => token === '3C').length, 4);
const remaining = tokens.slice();
for (const token of ['39', '0J', '3C']) {
  const index = remaining.indexOf(token);
  assert.ok(index >= 0);
  remaining.splice(index, 1);
}

let state = 0x1b0d3106;
/** @returns {number} */
function nextRandom() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}

const trials = 300000;
let exactEight = 0;
for (let trial = 0; trial < trials; trial++) {
  /** @type {Map<number, number>} */
  const assigned = new Map([
    [254, decodeToken(base59Alphabet, '39')],
    [186, decodeToken(base59Alphabet, '0J')],
    [189, decodeToken(base59Alphabet, '3C')],
  ]);
  const used = new Set();
  let at = start;
  let firstReach = -1;

  for (let step = 1; step <= dh.serverPublic; step++) {
    let value = assigned.get(at);
    if (value === undefined) {
      let index;
      do {
        index = nextRandom() % remaining.length;
      } while (used.has(index));
      used.add(index);
      value = decodeToken(base59Alphabet, remaining[index]);
      assigned.set(at, value);
    }
    at = value;
    if (at === end && firstReach < 0) firstReach = step;
  }

  if (firstReach === dh.serverPublic) exactEight++;
}
assert.equal(exactEight, 3102);

const fixedAssignmentProbability = (2 / 256) * (1 / 255) * (4 / 254);
const conditionalEightRate = exactEight / trials;
const impliedMatchedRate = fixedAssignmentProbability * conditionalEightRate;

console.log(JSON.stringify({
  status: 'source-constrained structural closure; NO UNKNOWN PLAINTEXT',
  comparableRed13Spans: comparable.map(row => ({
    page: row.page,
    length: row.length,
    gpPrimeSum: row.sum,
    primeSum: row.primeSum,
    primeOrdinal: row.rank,
  })),
  localRed13Loops: localLoopControls,
  p27: {
    redLength: p27.length,
    firstRune: p27.values[0].gp,
    firstRuneIndex: p27.values[0].index,
    gpPrimeSum: p27.sum,
    primeOrdinal: p27.rank,
    markerSelections: markerSelections.map(row => ({
      interpretation: row.name,
      gp: row.entry.gp,
      gpPrime: row.entry.prime,
      quotient: row.quotient,
    })),
    markerCount,
    residualRuneCount,
    directProductClosure: selectedPrime * residualRuneCount,
  },
  signedDh: {...dh, serverSecretExponent: serverExponents[0], clientSecretExponent: clientExponents[0]},
  sourceDerivedDhCircuit: {
    modulusSelector, modulus:sourceModulus, base:sourceBase,
    serverSecret:sourceServerSecret, clientSecret:sourceClientSecret,
    serverPublic:sourceServerPublic, clientPublic:sourceClientPublic,
    shared:sourceShared,
    sharedCheck:[sourceSharedServer, sourceSharedClient],
    consistentIndexing:'one-based-forward for red13, token digit9, and derived base5',
  },
  markerDerivedTableCoordinate: {
    row: selectedPrime,
    column: selectedQuotient,
    zeroBasedAddress: zeroBasedIndex,
    token: transducerToken,
    base59Value: transducer59,
    base60Value: transducer60,
    oneBasedControlAddress: oneBasedIndex,
    oneBasedControlToken: tokens[oneBasedIndex],
  },
  dhAddressInterpretation: {
    base59: {value: transducer59, row: dh.p, column: dh.shared},
    base60: {value: transducer60, row: dh.p, column: dh.g},
  },
  base59EightHopPath: path59,
  base60EightHopControl: path60,
  matchedTableDiagnostic: {
    trials,
    exactEight,
    conditionalEightRate,
    fixedAssignmentProbability,
    impliedMatchedRate,
    inverseMatchedRate: 1 / impliedMatchedRate,
    warning: 'post-discovery conditional diagnostic; not an authorship probability',
  },
}, null, 2));
