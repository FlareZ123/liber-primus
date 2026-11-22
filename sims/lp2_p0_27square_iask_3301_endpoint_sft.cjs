'use strict';

/**
 * SFT: independently reproduce the external fixed-AS endpoint census that
 * conditionally recovers I ASK from unchanged LP2 pp0-2.
 *
 * This is a conditional audit. Reports 00-15 and the selected prefix through
 * AS are granted. The two 3301 arithmetic criteria were found retrospectively
 * by the external author, so uniqueness here is evidence about that frozen
 * rule pair rather than authentication of the whole route.
 *
 * Run:
 *   node sims/lp2_p0_27square_iask_3301_endpoint_sft.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'),
  'utf8'
));
const tape = corpus.pages.filter(page => page.page <= 2).flatMap(page => page.indices);
assert.equal(tape.length, 729);

const PRIME_WEIGHTS = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
  31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109,
];

const at = (row, column) => tape[(row - 1) * 27 + column - 1];
const n0 = (row, column) => 27 * (row - 1) + column;
const n1 = (row, column) => 27 * (column - 1) + 28 - row;
const n2 = (row, column) => 730 - n0(row, column);
const n3 = (row, column) => 730 - n1(row, column);
const gp = values => values.reduce((sum, value) => sum + PRIME_WEIGHTS[value], 0);

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {number} n @returns {number} */
function phi(n) {
  let value = n;
  let remaining = n;
  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor !== 0) continue;
    value -= value / factor;
    while (remaining % factor === 0) remaining /= factor;
  }
  if (remaining > 1) value -= value / remaining;
  return value;
}

/** @param {number} n @returns {number} */
function mu(n) {
  let sign = 1;
  let remaining = n;
  for (let factor = 2; factor * factor <= remaining; factor += 1) {
    if (remaining % factor !== 0) continue;
    remaining /= factor;
    sign = -sign;
    if (remaining % factor === 0) return 0;
    while (remaining % factor === 0) remaining /= factor;
  }
  return remaining > 1 ? -sign : sign;
}

/** @param {number[]} first @param {number[]} second @returns {number} */
function rayDeviation(first, second) {
  const dr = Math.abs(first[0] - second[0]);
  const dc = Math.abs(first[1] - second[1]);
  return Math.min(dr, dc, Math.abs(dr - dc));
}

/*
 * Fixed outgoing forecast from AS under Reports 00-15:
 * signature (0,0,0), phase0; vertical non-mirror source; even-row/odd-column
 * center; odd radius; vertical ciphertext read downward with bottommost
 * endpoint = leftmost; endpoint even row, odd column; exact ray deviation1
 * from previous leftmost (22,1); Direct local leftmost class.
 */
const rawSources = [];
for (let row = 2; row <= 26; row += 2) {
  for (let column = 1; column <= 27; column += 2) {
    for (let radius = 1; radius <= Math.min(row - 1, 27 - row); radius += 2) {
      const upper = at(row - radius, column);
      const center = at(row, column);
      const lower = at(row + radius, column);
      if ([upper, center, lower].some(value => value === 0) || upper === lower) continue;

      for (const raw of [
        [upper, center, lower],
        [lower, center, upper],
      ]) {
        for (const transformCenter of [false, true]) {
          const key = [
            raw[0],
            transformCenter ? phi(raw[1]) : raw[1],
            raw[2],
          ];
          if (key.some(value => mu(phi(value)) !== 0)) continue;
          rawSources.push({
            center: [row, column],
            radius,
            cells: [
              [row - radius, column],
              [row, column],
              [row + radius, column],
            ],
            raw,
            transformCenter,
            key,
          });
        }
      }
    }
  }
}

// Collapse direct/totient or orientation variants only when the aligned phase0
// key and physical source are identical.
const sourceMap = new Map();
for (const source of rawSources) {
  const id = JSON.stringify([source.cells, source.key]);
  if (!sourceMap.has(id)) sourceMap.set(id, source);
}
const sources = [...sourceMap.values()];
assert.equal(sources.length, 350);

const segments = [];
for (let column = 1; column <= 27; column += 2) {
  for (let beginRow = 1; beginRow <= 27; beginRow += 1) {
    if (rayDeviation([22, 1], [beginRow, column]) !== 1) continue;
    for (let length = 2; length <= 27; length += 1) {
      const endRow = beginRow + length - 1;
      if (endRow > 27) break;
      if (endRow % 2 !== 0) continue;
      if (mu(n1(endRow, column)) < 0) continue;
      segments.push({
        start: [beginRow, column],
        end: [endRow, column],
        ciphertext: Array.from(
          { length },
          (_, index) => at(beginRow + index, column)
        ),
      });
    }
  }
}
assert.equal(segments.length, 196);

/** @param {object} source @param {object} segment @returns {boolean} */
function report10Passes(source, segment) {
  const [mr, mc] = source.center;
  const [br, bc] = segment.start;
  const [er, ec] = segment.end;
  const values = [
    gcd(n0(mr, mc), n0(br, bc)),
    gcd(n0(mr, mc), n0(er, ec)),
    gcd(n1(mr, mc), n3(er, ec)),
    gcd(n0(mr, mc), n2(er, ec)),
  ];
  return values.every(value => mu(value) !== 0);
}

const assignments = [];
for (const source of sources) {
  for (const segment of segments) {
    if (!report10Passes(source, segment)) continue;
    const plaintext = segment.ciphertext.map(
      (ciphertext, index) => (ciphertext - source.key[index % 3] + 29) % 29
    );
    assert.deepEqual(
      plaintext.map(
        (plain, index) => (plain + source.key[index % 3]) % 29
      ),
      segment.ciphertext
    );

    assignments.push({
      source,
      segment,
      plaintext,
      plaintextGp: gp(plaintext),
      plaintextIndexSum: plaintext.reduce((sum, value) => sum + value, 0),
      keyGp: gp(source.key),
      sourcePositionSum: source.cells.reduce(
        (sum, [row, column]) => sum + n0(row, column),
        0
      ),
    });
  }
}

assert.equal(assignments.length, 21342);

const g = assignments.filter(item => item.plaintextGp === 194);
const c = assignments.filter(item =>
  item.sourcePositionSum + item.keyGp + item.plaintextIndexSum === 1223
);
const gc = assignments.filter(item =>
  item.plaintextGp === 194
  && item.sourcePositionSum + item.keyGp + item.plaintextIndexSum === 1223
);

assert.equal(g.length, 48);
assert.equal(c.length, 15);
assert.equal(gc.length, 1);

const winner = gc[0];
assert.deepEqual(winner.plaintext, [10, 24, 15, 5]);
assert.deepEqual(winner.segment.start, [5, 17]);
assert.deepEqual(winner.segment.end, [8, 17]);
assert.deepEqual(winner.source.center, [12, 13]);
assert.equal(winner.source.radius, 1);
assert.deepEqual(winner.source.raw, [16, 19, 28]);
assert.equal(winner.source.transformCenter, false);
assert.deepEqual(winner.source.key, [16, 19, 28]);
assert.equal(winner.plaintextGp, 194);
assert.equal(winner.plaintextIndexSum, 54);
assert.equal(winner.keyGp, 239);
assert.equal(winner.sourcePositionSum, 930);
assert.equal(930 + 239 + 54, 1223);

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let factor = 2; factor * factor <= n; factor += 1) {
    if (n % factor === 0) return false;
  }
  return true;
}

const primes = [];
for (let value = 2; value <= 3400; value += 1) {
  if (isPrime(value)) primes.push(value);
}
const centerIndex = primes.indexOf(3301);
assert.equal(centerIndex + 1, 464);

const sensitivity = primes.slice(centerIndex - 5, centerIndex + 6).map(value => {
  const ordinal = primes.indexOf(value) + 1;
  const gTarget = ordinal - 270;
  const cTarget = value - 2004 - 74;
  const survivors = assignments.filter(item =>
    item.plaintextGp === gTarget
    && item.sourcePositionSum + item.keyGp + item.plaintextIndexSum === cTarget
  ).length;
  return { value, ordinal, survivors };
});
assert.deepEqual(
  sensitivity.map(item => item.survivors),
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
);


/*
 * Broader same-form control: let the target prime q vary wherever the two
 * retrospective equations themselves are simultaneously satisfiable.
 *
 *   pi(q) = plaintextGp + 270
 *   q = sourcePositionSum + keyGp + plaintextIndexSum + 2078
 *
 * This asks whether the algebra isolates 3301 without restricting attention
 * to its ten nearest prime neighbors.
 */
const maxCandidateQ = Math.max(
  ...assignments.map(item =>
    item.sourcePositionSum + item.keyGp + item.plaintextIndexSum + 2078
  )
);
for (let value = primes[primes.length - 1] + 1; value <= maxCandidateQ; value += 1) {
  if (isPrime(value)) primes.push(value);
}
const primeOrdinal = new Map(primes.map((value, index) => [value, index + 1]));
const familyHits = [];
for (const item of assignments) {
  const q = item.sourcePositionSum + item.keyGp + item.plaintextIndexSum + 2078;
  const ordinal = primeOrdinal.get(q);
  if (ordinal === undefined || ordinal !== item.plaintextGp + 270) continue;
  familyHits.push({
    q,
    ordinal,
    plaintext: item.plaintext,
    text: item.plaintext.map(value => corpus.translit[value]).join(''),
    ciphertextStart: item.segment.start,
    ciphertextEnd: item.segment.end,
    sourceCenter: item.source.center,
    sourceRadius: item.source.radius,
    originalKey: item.source.raw,
  });
}
familyHits.sort((first, second) => first.q - second.q);

assert.deepEqual(
  familyHits.map(item => item.q),
  [2657, 3301, 3557]
);
assert.deepEqual(
  familyHits.map(item => item.text),
  ['BS', 'IASC', 'EUAB']
);
assert.equal(new Set(familyHits.map(item => item.q)).size, 3);
assert.equal(familyHits.filter(item => item.q === 3301).length, 1);

console.log(JSON.stringify({
  source: 'unchanged LP2 pp0-2, 729 GP29 runes',
  fixedPrefix: 'external selected route through block37 AS',
  reports00to15Assignments: assignments.length,
  conditionG_plaintextGp194: g.length,
  conditionC_compositeTotal1223: c.length,
  jointGC: gc.length,
  uniqueContinuation: {
    plaintextRunes: winner.plaintext.map(value => corpus.translit[value]),
    ciphertextStart: winner.segment.start,
    ciphertextEnd: winner.segment.end,
    sourceCenter: winner.source.center,
    sourceRadius: winner.source.radius,
    originalKey: winner.source.raw.map(value => corpus.translit[value]),
  },
  neighboringPrimeSensitivity: sensitivity,
  sameFormPrimeFamily: familyHits,
  decision: 'The frozen retrospective G+C pair uniquely recovers I ASK from the fixed AS prefix. This does not independently authenticate the selected prefix or prove the criteria were author-specified.',
}, null, 2));
