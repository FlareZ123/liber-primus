'use strict';

/**
 * Blind falsifier for the post-hoc I ASK -> DIE arithmetic handoff.
 *
 * The previously published handoff is frozen unchanged:
 *   next center n0 = current center n0 + GP(trailing three plaintext runes)
 *   next start n0  = sum(current ciphertext rune indices) + 1
 *   next source radius = current ciphertext length
 *   next ciphertext length = one 3-rune key period
 *   diagonal row sign follows source-center row displacement
 *
 * Positive control: the known I ASK -> DIE transition must pass the external
 * Reports 17, 18 and 19 filters under these exact implementations.
 *
 * Blind test: use the already-public DIE block as current state, derive its
 * next geometry mechanically, and evaluate Reports 17-19 before decrypting or
 * inspecting any next plaintext. No dictionary or semantic scoring is used.
 *
 * Windows Node.js 22, CommonJS, standard library only.
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
const n0 = ([row, column]) => 27 * (row - 1) + column;
const n1 = ([row, column]) => 27 * (column - 1) + 28 - row;
const n2 = cell => 730 - n0(cell);
const n3 = cell => 730 - n1(cell);
const gp = values => values.reduce((sum, value) => sum + PRIME_WEIGHTS[value], 0);

/** @param {number} a @param {number} b */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {number} n */
function mu(n) {
  assert.ok(n > 0);
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

/** @param {number} value */
function cellFromN0(value) {
  assert.ok(value >= 1 && value <= 729);
  return [Math.floor((value - 1) / 27) + 1, ((value - 1) % 27) + 1];
}

/** @param {number[]} cell */
function rotations(cell) {
  return [n0(cell), n1(cell), n2(cell), n3(cell)];
}

/** @param {number[][]} cells */
function sortedNode(cells) {
  return cells.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

/** @param {number[][]} cipherCells */
function leftmost(cipherCells) {
  return cipherCells.slice().sort((a, b) => a[1] - b[1] || b[0] - a[0])[0];
}

/** @param {number[]} a @param {number[]} b */
function chebyshev(a, b) {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
}

/**
 * Report 17.
 * @param {number[]} currentCenter
 * @param {number[]} nextCenter
 */
function report17(currentCenter, nextCenter) {
  const x = n3(currentCenter) ^ nextCenter[1];
  return { x, mobius: x === 0 ? null : mu(x), pass: x === 0 || mu(x) <= 0 };
}

/**
 * Report 18.
 * @param {number[][]} currentNode
 * @param {number[][]} currentCipher
 * @param {number[]} nextStart
 * @param {number[]} nextEnd
 */
function report18(currentNode, currentCipher, nextStart, nextEnd) {
  const [Ucell, Mcell, Zcell] = sortedNode(currentNode);
  const U = rotations(Ucell);
  const M = rotations(Mcell);
  const Z = rotations(Zcell);
  const B = rotations(currentCipher[0]);
  const E = rotations(currentCipher[currentCipher.length - 1]);
  const L = rotations(leftmost(currentCipher));

  const predicted = [
    (mu(gcd(M[2], L[3])) < 0)
      ^ (mu(Z[3] + B[2]) > 0)
      ^ (mu(gcd(M[3], L[2])) < 0),
    (mu(gcd(M[2], L[0])) === 0)
      ^ (mu(gcd(M[1], B[1])) === 0)
      ^ (mu(gcd(M[2], E[0])) === 0),
    (mu(gcd(U[1], E[0])) === 0)
      ^ (mu(gcd(U[0], B[2])) < 0)
      ^ ((Math.floor(E[3] / 4) % 2) === 1),
  ].map(Boolean);

  const observed = [
    Math.abs(nextEnd[0] - Ucell[0]) >= Math.abs(nextEnd[1] - Ucell[1]),
    mu(n0(nextEnd)) < 0,
    nextStart[1] > currentCipher[0][1],
  ];

  return {
    predicted,
    observed,
    pass: predicted.every((value, index) => value === observed[index]),
  };
}

/**
 * Report 19.
 * @param {number[][]} currentNode
 * @param {number[][]} currentCipher
 * @param {number[]} previousBeginning
 * @param {number[]} nextStart
 */
function report19(currentNode, currentCipher, previousBeginning, nextStart) {
  const Ucell = sortedNode(currentNode)[0];
  const B = currentCipher[0];
  const E = currentCipher[currentCipher.length - 1];
  const L = leftmost(currentCipher);
  const a = ((n2(B) ^ n2(previousBeginning)) % 7) === 0;
  const b = mu(n0(Ucell) + n0(E)) < 0;
  const nearRequired = a === b;
  const distanceFromBeginning = chebyshev(nextStart, B);
  const distanceFromLeftmost = chebyshev(nextStart, L);
  const nearBeginning = distanceFromBeginning <= 7;
  const nearLeftmost = distanceFromLeftmost <= 7;
  return {
    a,
    b,
    nearRequired,
    distanceFromBeginning,
    distanceFromLeftmost,
    pass: nearBeginning === nearRequired && nearLeftmost === nearRequired,
  };
}

/**
 * Mechanical handoff geometry. The source axis is deliberately not guessed:
 * Reports 17-19 need only the source center plus current-node/current-cipher
 * geometry, and failure of these necessary filters already falsifies transfer.
 *
 * @param {{sourceCenter:number[],plaintext:number[],cipher:number[],cipherCells:number[][]}} current
 */
function handoff(current) {
  const tail = current.plaintext.slice(-3);
  const nextCenterN0 = n0(current.sourceCenter) + gp(tail);
  const nextStartN0 = current.cipher.reduce((sum, value) => sum + value, 0) + 1;
  const nextCenter = cellFromN0(nextCenterN0);
  const nextStart = cellFromN0(nextStartN0);
  const rowSign = Math.sign(nextCenter[0] - current.sourceCenter[0]);
  const length = 3;
  const nextEnd = [
    nextStart[0] + rowSign * (length - 1),
    nextStart[1] + length - 1,
  ];
  return {
    tail,
    tailGp: gp(tail),
    nextCenterN0,
    nextCenter,
    nextStartN0,
    nextStart,
    sourceRadius: current.cipher.length,
    length,
    rowSign,
    nextEnd,
  };
}

const iAsk = {
  sourceCenter: [12, 13],
  sourceNode: [[11, 13], [12, 13], [13, 13]],
  plaintext: [10, 24, 15, 5],
  cipher: [26, 14, 14, 21],
  cipherCells: [[5, 17], [6, 17], [7, 17], [8, 17]],
  previousBeginning: [22, 2],
};
assert.deepEqual(iAsk.cipherCells.map(cell => at(...cell)), iAsk.cipher);

const iAskHandoff = handoff(iAsk);
assert.deepEqual(iAskHandoff.nextCenter, [18, 14]);
assert.deepEqual(iAskHandoff.nextStart, [3, 22]);
assert.deepEqual(iAskHandoff.nextEnd, [5, 24]);

const dieNode = [[18, 10], [18, 14], [18, 18]];
const dieCipherCells = [[3, 22], [4, 23], [5, 24]];
const die = {
  sourceCenter: [18, 14],
  sourceNode: dieNode,
  plaintext: [23, 10, 18],
  cipher: [17, 8, 23],
  cipherCells: dieCipherCells,
  previousBeginning: iAsk.cipherCells[0],
};
assert.deepEqual(dieCipherCells.map(cell => at(...cell)), die.cipher);

const positive = {
  report17: report17(iAsk.sourceCenter, iAskHandoff.nextCenter),
  report18: report18(
    iAsk.sourceNode,
    iAsk.cipherCells,
    iAskHandoff.nextStart,
    iAskHandoff.nextEnd
  ),
  report19: report19(
    iAsk.sourceNode,
    iAsk.cipherCells,
    iAsk.previousBeginning,
    iAskHandoff.nextStart
  ),
};
assert.equal(positive.report17.pass, true);
assert.equal(positive.report18.pass, true);
assert.equal(positive.report19.pass, true);

const blind = handoff(die);
assert.equal(n0(die.sourceCenter), 473);
assert.equal(blind.tailGp, 187);
assert.equal(blind.nextCenterN0, 660);
assert.deepEqual(blind.nextCenter, [25, 12]);
assert.equal(blind.nextStartN0, 49);
assert.deepEqual(blind.nextStart, [2, 22]);
assert.equal(blind.sourceRadius, 3);
assert.equal(blind.length, 3);
assert.equal(blind.rowSign, 1);
assert.deepEqual(blind.nextEnd, [4, 24]);

const blindChecks = {
  report17: report17(die.sourceCenter, blind.nextCenter),
  report18: report18(die.sourceNode, die.cipherCells, blind.nextStart, blind.nextEnd),
  report19: report19(
    die.sourceNode,
    die.cipherCells,
    die.previousBeginning,
    blind.nextStart
  ),
};

assert.deepEqual(blindChecks.report17, {x: 381, mobius: 1, pass: false});
assert.deepEqual(blindChecks.report18.predicted, [true, false, true]);
assert.deepEqual(blindChecks.report18.observed, [true, true, false]);
assert.equal(blindChecks.report18.pass, false);
assert.equal(blindChecks.report19.nearRequired, false);
assert.equal(blindChecks.report19.distanceFromBeginning, 1);
assert.equal(blindChecks.report19.distanceFromLeftmost, 1);
assert.equal(blindChecks.report19.pass, false);

console.log(JSON.stringify({
  status: 'PASS',
  positiveControl: {
    transition: 'I ASK -> DIE',
    derivedGeometry: iAskHandoff,
    checks: positive,
  },
  blindForwardTest: {
    current: 'DIE',
    derivedGeometry: blind,
    checks: blindChecks,
    nextPlaintextInspected: false,
  },
  decision:
    'The post-hoc I ASK -> DIE arithmetic handoff fails all three independently frozen Reports 17-19 necessary filters on its first blind forward application. Retire it as a reusable parser unless a new source-authenticated mode switch changes the rules.',
}, null, 2));
