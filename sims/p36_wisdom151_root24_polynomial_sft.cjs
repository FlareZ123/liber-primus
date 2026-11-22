'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

/** @param {string} p */
const read = (p) => fs.readFileSync(p, 'utf8');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/lp2-transcription.txt');
const referenceText = read('resources/liber-primus/lp1-plaintext-reference.txt');

/** @param {number} x */
const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number} x */
function inv29(x) {
  for (let i = 1; i < 29; i++) if (mod29(i * x) === 1) return i;
  throw new Error('no inverse');
}

/** @param {number[]} a */
function trimLo(a) {
  let i = a.length - 1;
  while (i > 0 && mod29(a[i]) === 0) i--;
  return a.slice(0, i + 1).map(mod29);
}

/** @param {number[]} a @param {number[]} b */
function divmodLo(a, b) {
  let r = trimLo(a);
  const d = trimLo(b);
  const q = Array(Math.max(1, r.length - d.length + 1)).fill(0);
  const leadInv = inv29(d.at(-1));
  while (r.length >= d.length && !(r.length === 1 && r[0] === 0)) {
    const gap = r.length - d.length;
    const c = mod29(r.at(-1) * leadInv);
    q[gap] = c;
    for (let j = 0; j < d.length; j++) r[gap + j] = mod29(r[gap + j] - c * d[j]);
    r = trimLo(r);
  }
  return { q: trimLo(q), r };
}

/** @param {number[]} a @param {number[]} b */
function gcdLo(a, b) {
  let x = trimLo(a);
  let y = trimLo(b);
  while (!(y.length === 1 && y[0] === 0)) {
    const z = divmodLo(x, y).r;
    x = y;
    y = z;
  }
  const leadInv = inv29(x.at(-1));
  return x.map((v) => mod29(v * leadInv));
}

/** @param {number[]} a @param {number[]} b */
function mulLo(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) out[i + j] = mod29(out[i + j] + a[i] * b[j]);
  }
  return trimLo(out);
}

/** @param {number[]} physical @param {number} x */
function evalPhysicalHighToLow(physical, x) {
  let out = 0;
  for (const c of physical) out = mod29(out * x + c);
  return out;
}

/** @param {number[]} physical @param {number} x */
function derivativePhysicalHighToLow(physical, x) {
  const degree = physical.length - 1;
  let out = 0;
  for (let i = 0; i < physical.length - 1; i++) {
    const exponent = degree - i;
    let xp = 1;
    for (let k = 0; k < exponent - 1; k++) xp = mod29(xp * x);
    out = mod29(out + physical[i] * exponent * xp);
  }
  return out;
}

/** @param {string} text */
function parseGp(text) {
  const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const prose = text.split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#') && !line.trim().startsWith('['))
    .join(' ')
    .replace(/[0-9a-f]{64,}/gi, ' ')
    .toUpperCase();
  const out = [];
  for (const word of prose.match(/[A-Z]+/g) || []) {
    let i = 0;
    while (i < word.length) {
      const token = tokens.find((t) => word.startsWith(t.s, i));
      if (token) {
        out.push(token.i);
        i += token.s.length;
      } else {
        i++;
      }
    }
  }
  return out;
}

const reference = parseGp(referenceText);
const split = Math.floor(reference.length * 0.8);
const train = reference.slice(0, split);
const trigramCounts = new Map();
let trigramTotal = 0;
for (let i = 0; i + 2 < train.length; i++) {
  const key = train[i] * 841 + train[i + 1] * 29 + train[i + 2];
  trigramCounts.set(key, (trigramCounts.get(key) || 0) + 1);
  trigramTotal++;
}

/** @param {number[]} sequence */
function score(sequence) {
  const counts = Array(29).fill(0);
  for (const x of sequence) counts[x]++;
  let logp = 0;
  for (let i = 0; i + 2 < sequence.length; i++) {
    const key = sequence[i] * 841 + sequence[i + 1] * 29 + sequence[i + 2];
    logp += Math.log(((trigramCounts.get(key) || 0) + 0.05) / (trigramTotal + 0.05 * 29 ** 3));
  }
  return {
    ioc: counts.reduce((s, c) => s + c * (c - 1), 0) / (sequence.length * (sequence.length - 1)),
    trigramNatsPerRune: logp / (sequence.length - 2),
  };
}

const p36 = corpus.pages.find((p) => p.page === 36).indices;
assert.equal(p36.length, 238);

const p36Raw = transcription.split('%')[36];
const runeSet = new Set(corpus.runes);
const headingChar = p36Raw.indexOf('1-');
assert(headingChar >= 0);
const headingPosition = Array.from(p36Raw.slice(0, headingChar)).filter((ch) => runeSet.has(ch)).length;
assert.equal(headingPosition, 99);

const p36WithHeading = [...p36.slice(0, headingPosition), 1, ...p36.slice(headingPosition)];
assert.equal(p36WithHeading.length, 239);

const tableLo = grid.pages.flatMap((p) => p.bytes).slice().reverse().map((x) => mod29(x)).slice(0, 255);
assert.equal(trimLo(tableLo).length - 1, 254);

const rootFactor = [5, 1]; // X+5 = X-24
const physicalLo = p36WithHeading.slice().reverse();
const oppositeLo = p36WithHeading.slice();

assert.equal(evalPhysicalHighToLow(p36, 24), 0);
assert.equal(evalPhysicalHighToLow(p36, 16), 0);
assert.notEqual(derivativePhysicalHighToLow(p36, 24), 0);
assert.notEqual(derivativePhysicalHighToLow(p36, 16), 0);
const p36Order7Factor = [7, 18, 1]; // (X-24)(X-16)
assert.deepEqual(divmodLo(p36.slice().reverse(), p36Order7Factor).r, [0]);
assert.equal(evalPhysicalHighToLow(p36WithHeading, 24), 0);
assert.notEqual(derivativePhysicalHighToLow(p36WithHeading, 24), 0);

assert.deepEqual(gcdLo(tableLo, physicalLo), rootFactor);
assert.deepEqual(gcdLo(tableLo, oppositeLo), [1]);

const tableOnce = divmodLo(tableLo, rootFactor);
assert.deepEqual(tableOnce.r, [0]);
const tableTwice = divmodLo(tableOnce.q, rootFactor);
assert.deepEqual(tableTwice.r, [0]);
assert.notDeepEqual(divmodLo(tableTwice.q, rootFactor).r, [0]);

const headingValues24 = [];
const headingValues16 = [];
for (let value = 0; value < 29; value++) {
  const candidate = [...p36.slice(0, headingPosition), value, ...p36.slice(headingPosition)];
  if (evalPhysicalHighToLow(candidate, 24) === 0) headingValues24.push(value);
  if (evalPhysicalHighToLow(candidate, 16) === 0) headingValues16.push(value);
}
assert.deepEqual(headingValues24, [1]);
assert.deepEqual(headingValues16, [17]);

const headingPositions24 = [];
const selectorPairs = [];
for (let position = 0; position <= p36.length; position++) {
  let value24 = null;
  let value16 = null;
  for (let value = 0; value < 29; value++) {
    const candidate = [...p36.slice(0, position), value, ...p36.slice(position)];
    if (evalPhysicalHighToLow(candidate, 24) === 0) value24 = value;
    if (evalPhysicalHighToLow(candidate, 16) === 0) value16 = value;
  }
  assert.notEqual(value24, null);
  assert.notEqual(value16, null);
  selectorPairs.push({ position, value24, value16, sum: mod29(value24 + value16) });
  if (value24 === 1) headingPositions24.push(position);
}
assert.deepEqual(headingPositions24, [18, 65, 99, 204]);
assert.deepEqual(selectorPairs.filter((r) => r.value24 === 1 && r.value16 === 17), [{
  position: 99,
  value24: 1,
  value16: 17,
  sum: 18,
}]);

const pageRootRows = corpus.pages
  .filter((p) => p.page <= 55 && p.indices?.length)
  .map((p) => ({
    page: p.page,
    runes: p.indices.length,
    at24: evalPhysicalHighToLow(p.indices, 24),
    at16: evalPhysicalHighToLow(p.indices, 16),
  }));
const pageRoots24 = pageRootRows.filter((r) => r.at24 === 0).map(({ page, runes }) => ({ page, runes }));
const pageRoots16 = pageRootRows.filter((r) => r.at16 === 0).map(({ page, runes }) => ({ page, runes }));
assert.deepEqual(pageRoots24, [
  { page: 10, runes: 263 },
  { page: 11, runes: 273 },
  { page: 29, runes: 277 },
  { page: 36, runes: 238 },
]);
assert.deepEqual(pageRoots16, [{ page: 36, runes: 238 }]);

const quotient = divmodLo(physicalLo, rootFactor);
assert.deepEqual(quotient.r, [0]);
assert.equal(quotient.q.length, 238);
assert.deepEqual(mulLo(quotient.q, rootFactor), physicalLo);
const quotientPhysical = quotient.q.slice().reverse();

const counterfactual17 = [...p36.slice(0, headingPosition), 17, ...p36.slice(headingPosition)].slice().reverse();
const quotient16 = divmodLo(counterfactual17, [13, 1]); // X-16
assert.deepEqual(quotient16.r, [0]);
assert.equal(quotient16.q.length, 238);
const quotient16Physical = quotient16.q.slice().reverse();

const native238 = [];
for (let i = 0; i + 238 <= reference.length; i++) native238.push(score(reference.slice(i, i + 238)).trigramNatsPerRune);
native238.sort((a, b) => a - b);
const quotientScore = score(quotientPhysical);
const quotient16Score = score(quotient16Physical);
assert(quotientScore.trigramNatsPerRune < native238[0]);
assert(quotient16Score.trigramNatsPerRune < native238[0]);

console.log(JSON.stringify({
  p36: {
    runes: p36.length,
    visibleHeading: 1,
    runesBeforeHeading: headingPosition,
    combinedTokens: p36WithHeading.length,
    rawScore: score(p36),
  },
  sharedTableFactor: {
    factor: rootFactor,
    root: 24,
    tableMultiplicity: 2,
    p36Multiplicity: 1,
    p36RuneOnlySecondRoot: 16,
    p36RuneOnlyQuadraticFactor: p36Order7Factor,
    oppositeCoefficientDirectionGcd: gcdLo(tableLo, oppositeLo),
    pagesWithRuneOnlyRoot24: pageRoots24,
    pagesWithRuneOnlyRoot16: pageRoots16,
  },
  headingLock: {
    sourcePositionSelectors: { root24: headingValues24, root16: headingValues16 },
    positionsWhereVisibleOnePreservesRoot24: headingPositions24,
    uniqueSelectorPairPosition: selectorPairs.filter((r) => r.value24 === 1 && r.value16 === 17)[0],
  },
  quotient238: {
    exactRoundTrip: true,
    score: quotientScore,
    counterfactual17Root16Score: quotient16Score,
    nativeSolved238Worst: native238[0],
    nativeSolved238Median: native238[Math.floor(native238.length / 2)],
    nativeSolved238Best: native238.at(-1),
  },
  decision: 'The routed p36 uniquely carries seventh-order roots 24 and 16. At the printed heading position, value 1 uniquely selects root24 and value17 uniquely selects root16; the pair (1,17) occurs at no other insertion position. The actual heading therefore selects the table-shared root24. Both exact 238-symbol division outputs remain nonlinguistic.'
}, null, 2));
