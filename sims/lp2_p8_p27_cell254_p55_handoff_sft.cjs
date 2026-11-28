'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const Q = 29;
const mod = (x) => ((x % Q) + Q) % Q;
const sum = (values) => mod(values.reduce((a, b) => a + b, 0));
const product = (values) => values.reduce((a, b) => mod(a * b), 1);

/** @param {number} x */
function inv(x) {
  for (let y = 1; y < Q; y += 1) if (mod(x * y) === 1) return y;
  throw new Error(`noninvertible: ${x}`);
}

/** @param {number[][]} matrix */
function determinant3(matrix) {
  const [a, b, c] = matrix[0];
  const [d, e, f] = matrix[1];
  const [g, h, i] = matrix[2];
  return mod(a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g));
}

/** Characteristic polynomial [1,c2,c1,c0] for a 3x3 GF(29) matrix. */
function characteristic3(matrix) {
  const trace = mod(matrix[0][0] + matrix[1][1] + matrix[2][2]);
  const e2 = mod(
    matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0] +
    matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0] +
    matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]
  );
  return [1, mod(-trace), e2, mod(-determinant3(matrix))];
}

/** @param {number[]} coefficients @param {number} x */
function polynomialValue(coefficients, x) {
  return coefficients.reduce((acc, coefficient) => mod(acc * x + coefficient), 0);
}

/** @param {number[][]} matrix @param {number[]} vector */
function matrixVector(matrix, vector) {
  return matrix.map((row) => mod(row.reduce((acc, value, i) => acc + value * vector[i], 0)));
}

/** @param {number[]} vector @param {number[][]} matrix */
function vectorMatrix(vector, matrix) {
  return Array.from({ length: matrix[0].length }, (_, col) =>
    mod(vector.reduce((acc, value, row) => acc + value * matrix[row][col], 0))
  );
}

const corpus = JSON.parse(
  fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8')
);
const transcription = fs
  .readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8')
  .replace(/\r/g, '');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);

/** Parse physically printed page-local fragments, preserving page seams. */
function pageFragments(page) {
  assert.notEqual(page, 50, 'p50 is the rune-free numerical panel');
  const source = corpus.pages.find((entry) => entry.page === page).indices;
  const segment = parts[page >= 51 ? page - 1 : page];
  const fragments = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    fragments.push({ start, end: offset, values: current.slice() });
    current = [];
  };
  for (const ch of segment) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      assert.equal(source[offset], value, `transcription mismatch p${page}@${offset}`);
      current.push(value);
      offset += 1;
    } else if (ch === '/' || /\s/u.test(ch)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  assert.equal(offset, source.length, `transcription length p${page}`);
  return fragments;
}

// Frozen DH23 state already reconstructed from the p15 lower red/grid source.
const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4, F: 0 };
const { p, g, a, b, A, B, K, e, q, F } = state;
assert.equal(inv(A), 11);
assert.equal(mod(b - K), 13);
assert.equal(mod(q + g), 9);

// Source-fixed p7->p8 weighted-row fragment schedule. Reconstruct its three
// held-out descriptor rows from actual p8..p14 fragments rather than hardcode
// the later p15..p21 schedules.
const signedSchedule = [K, -1, g, -1, p, -1, -K];
const selected = signedSchedule.map((signedIndex, i) => {
  const page = 8 + i;
  const fragments = pageFragments(page);
  const index = signedIndex >= 0 ? signedIndex : fragments.length + signedIndex;
  assert.ok(index >= 0 && index < fragments.length, `schedule invalid on p${page}`);
  const fragment = fragments[index];
  return {
    page,
    index,
    fragment,
    L: fragment.values.length,
    S: sum(fragment.values),
    P: product(fragment.values),
  };
});

const schedules = {
  L: selected.map((entry) => entry.L),
  S: selected.map((entry) => entry.S),
  P: selected.map((entry) => entry.P),
};
assert.deepEqual(schedules.L, [e, K * g, K, e, K, a, K]);
assert.deepEqual(schedules.S, [p, F, K, K * g, mod(-K), mod(K - b), b - K]);
assert.deepEqual(schedules.P, [K, A, mod(-g), b + K, b + K, g + K, g]);

/** Aggregate fragments picked by one frozen schedule over an anchored block. */
function aggregateSchedule(anchorPage, schedule, firstPosition = 0) {
  const fragments = [];
  const picks = [];
  for (let position = firstPosition; position < 7; position += 1) {
    const page = anchorPage + position;
    if (page === 50 || page > 55) return null;
    const pageParts = pageFragments(page);
    const index = schedule[position];
    if (index < 0 || index >= pageParts.length) return null;
    const fragment = pageParts[index];
    fragments.push(...fragment.values);
    picks.push({
      page,
      index,
      start: fragment.start,
      L: fragment.values.length,
      S: sum(fragment.values),
      P: product(fragment.values),
    });
  }
  return {
    picks,
    descriptor: [mod(fragments.length), sum(fragments), product(fragments)],
    rawLength: fragments.length,
  };
}

/** Build L/S/P rows for one anchor; firstPosition=1 excludes the anchor page. */
function descriptorMatrix(anchorPage, firstPosition = 0) {
  const rows = [];
  const details = {};
  for (const name of ['L', 'S', 'P']) {
    const aggregate = aggregateSchedule(anchorPage, schedules[name], firstPosition);
    if (!aggregate) return null;
    rows.push(aggregate.descriptor);
    details[name] = aggregate;
  }
  return { matrix: rows, details };
}

// The physical continuation immediately after p8..p14 is p15..p21.
const full = descriptorMatrix(15, 0);
assert.ok(full);
assert.deepEqual(full.matrix, [
  [23, 1, 0],
  [14, 13, 23],
  [10, 13, 28],
]);
assert.deepEqual(characteristic3(full.matrix), [1, p, A, 1]);

// Do not count the anchor page p15 as independent evidence: two of its picked
// fragments overlap the already-used lower-red state source. Remove the whole
// anchor contribution and test only p16..p21, whose picked fragment contents
// were not used to reconstruct the state or schedules.
const held = descriptorMatrix(15, 1);
assert.ok(held);
assert.deepEqual(held.matrix, [
  [21, 24, 0],
  [9, 2, 11],
  [6, 20, 26],
]);

// Frozen state prediction for the disjoint p16..p21 matrix:
// chi(x) = x^3 + (q+g)x^2 + x + qg
//        = (x-q)(x^2 + (b-K)x - g).
const heldCharacteristic = characteristic3(held.matrix);
const heldTarget = [1, mod(q + g), 1, mod(q * g)];
assert.deepEqual(heldCharacteristic, heldTarget);
for (let x = 0; x < Q; x += 1) {
  const left = polynomialValue(heldTarget, x);
  const right = mod((x - q) * mod(x * x + (b - K) * x - g));
  assert.equal(left, right, `factorization mismatch at ${x}`);
}
const nativeRoots = Array.from({ length: Q }, (_, x) => x)
  .filter((x) => polynomialValue(heldCharacteristic, x) === 0);
assert.deepEqual(nativeRoots, [q]);

const rightEigenvector = [mod(-g), a * K, 1];
const leftEigenvector = [mod(-1), mod(-K), 1];
assert.deepEqual(
  matrixVector(held.matrix, rightEigenvector),
  rightEigenvector.map((x) => mod(q * x))
);
assert.deepEqual(
  vectorMatrix(leftEigenvector, held.matrix),
  leftEigenvector.map((x) => mod(q * x))
);

// Finite matched census: keep the schedules, descriptor order, page order and
// tail semantics fixed; move the anchor across every legal original interval.
const legal = [];
for (let anchor = 0; anchor + 6 <= 55; anchor += 1) {
  if (anchor < 50 && anchor + 6 >= 50) continue;
  const candidate = descriptorMatrix(anchor, 1);
  if (!candidate) continue;
  const characteristic = characteristic3(candidate.matrix);
  const roots = Array.from({ length: Q }, (_, x) => x)
    .filter((x) => polynomialValue(characteristic, x) === 0);
  legal.push({ anchor, matrix: candidate.matrix, characteristic, roots });
}
assert.equal(legal.length, 42);
const exactHits = legal.filter((entry) =>
  entry.characteristic.every((value, i) => value === heldTarget[i])
);
assert.deepEqual(exactHits.map((entry) => entry.anchor), [15]);
const uniqueQRootHits = legal.filter((entry) =>
  entry.roots.length === 1 && entry.roots[0] === q
);
assert.deepEqual(uniqueQRootHits.map((entry) => entry.anchor), [15]);

console.log('state', state);
console.log('p8-p14 descriptor schedules', schedules);
console.log('p15-p21 full transfer matrix', full.matrix, 'chi', characteristic3(full.matrix));
console.log('p16-p21 disjoint transfer matrix', held.matrix);
console.log('held chi', heldCharacteristic, 'native roots', nativeRoots);
console.log('right q-eigenvector', rightEigenvector, 'left q-eigenvector', leftEigenvector);
console.log('matched legal tail intervals', legal.length, 'exact hits', exactHits.map((x) => x.anchor));
console.log('PASS p8->p15 descriptor transfer SFT');


// --- q-eigenvector continuation into p22..p27 and p27/cell254/p55 cross-lock ---

const tailScheduleMatrix = ['L', 'S', 'P'].map((name) => schedules[name].slice(1));
const nextRawSchedule = vectorMatrix(leftEigenvector, tailScheduleMatrix);
assert.deepEqual(nextRawSchedule, [mod(-K), p - g, p, B, mod(-K), a]);
const nextStateSignedSchedule = [-K, p - g, p, B, -K, a];
assert.deepEqual(nextStateSignedSchedule.map(mod), nextRawSchedule);

/** @param {number} anchorPage @param {number[]} indexSchedule */
function sixPagePacket(anchorPage, indexSchedule) {
  const picks = [];
  for (let position = 0; position < 6; position += 1) {
    const page = anchorPage + position;
    if (page === 50 || page > 55) return null;
    const fragments = pageFragments(page);
    const sourceIndex = indexSchedule[position];
    const index = sourceIndex < 0 ? fragments.length + sourceIndex : sourceIndex;
    if (index < 0 || index >= fragments.length) return null;
    const fragment = fragments[index];
    picks.push({
      page, sourceIndex, index, start: fragment.start, end: fragment.end,
      values: fragment.values, L: fragment.values.length,
      S: sum(fragment.values), P: product(fragment.values),
    });
  }
  return {
    picks,
    L: picks.map((entry) => entry.L),
    S: picks.map((entry) => entry.S),
    P: picks.map((entry) => entry.P),
  };
}

/** @param {number[]} values */
function hEven(values) {
  assert.equal(values.length % 2, 0);
  const half = values.length / 2;
  const out = [];
  for (let i = 0; i < half; i += 1) {
    out.push(mod(values[i] - values[values.length - 1 - i]));
  }
  for (let i = half - 1; i >= 0; i -= 1) {
    out.push(mod(values[i] + values[values.length - 1 - i]));
  }
  return out;
}

const rawP22 = sixPagePacket(22, nextRawSchedule);
const signedP22 = sixPagePacket(22, nextStateSignedSchedule);
assert.ok(rawP22 && signedP22);
assert.deepEqual(rawP22.L, [e, e, q, q + g, e, e]);
assert.deepEqual(rawP22.S, [p, A, mod(-A), A, B, mod(K - b)]);
assert.deepEqual(rawP22.P, [F, b, a * K, q + g, mod(K - b), b]);
assert.deepEqual(hEven(rawP22.L), [F, F, mod(-g), b - K, a, a]);
assert.deepEqual(hEven(rawP22.S), [g + K, p - g, b - K, F, mod(-K), K * g]);
assert.deepEqual(hEven(rawP22.P), [mod(-b), mod(-1), e, mod(-A), K, b]);

assert.deepEqual(signedP22.L, [e, e, q, q + g, e, e]);
assert.deepEqual(signedP22.S, [e, A, mod(-A), A, g + K, mod(K - b)]);
assert.deepEqual(signedP22.P, [q + g, b, a * K, q + g, F, b]);

const rawPackets = [];
const signedPackets = [];
for (let anchor = 0; anchor + 5 <= 55; anchor += 1) {
  if (anchor <= 50 && anchor + 5 >= 50) continue;
  const raw = sixPagePacket(anchor, nextRawSchedule);
  if (raw) rawPackets.push({ anchor, packet: raw });
  const signed = sixPagePacket(anchor, nextStateSignedSchedule);
  if (signed) signedPackets.push({ anchor, packet: signed });
}
assert.equal(rawPackets.length, 42);
assert.equal(signedPackets.length, 44);
const samePacket = (candidate, target) => ['L', 'S', 'P'].every((name) =>
  candidate[name].every((value, i) => value === target[name][i])
);
assert.deepEqual(rawPackets.filter((e0) => samePacket(e0.packet, rawP22)).map((e0) => e0.anchor), [22]);
assert.deepEqual(signedPackets.filter((e0) => samePacket(e0.packet, signedP22)).map((e0) => e0.anchor), [22]);
assert.deepEqual(rawPackets.filter((e0) => e0.packet.L.every((v, i) => v === rawP22.L[i])).map((e0) => e0.anchor), [22]);
assert.deepEqual(signedPackets.filter((e0) => e0.packet.L.every((v, i) => v === signedP22.L[i])).map((e0) => e0.anchor), [22]);

const rawP27 = rawP22.picks.at(-1);
const signedP27 = signedP22.picks.at(-1);
assert.equal(rawP27.page, 27);
assert.equal(rawP27.index, 6);
assert.equal(rawP27.start, 31);
assert.deepEqual(rawP27.values, [b + K, p - g, K * g]);
assert.deepEqual(signedP27, rawP27);
assert.deepEqual([rawP27.L, rawP27.S, rawP27.P], [e, mod(K - b), b]);
assert.deepEqual([
  mod(rawP27.values[0] - rawP27.values[2]),
  rawP27.values[1],
  mod(rawP27.values[0] + rawP27.values[2]),
], [g + K, p - g, mod(-K)]);
assert.equal(rawP27.start, p + A);
assert.equal(rawP27.index, a);
assert.equal(A * (p + A) + a, 254);

const fragmentMatches = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  pageFragments(page).forEach((fragment, index) => {
    if (fragment.values.length === rawP27.values.length &&
        fragment.values.every((value, i) => value === rawP27.values[i])) {
      fragmentMatches.push({ page, index, start: fragment.start, end: fragment.end });
    }
  });
}
assert.deepEqual(fragmentMatches, [
  { page: 27, index: 6, start: 31, end: 34 },
  { page: 55, index: 16, start: 73, end: 76 },
]);

const p27Fragments = pageFragments(27);
const p55Fragments = pageFragments(55);
assert.equal(p55Fragments.length, 17);
assert.deepEqual(p27Fragments[5].values, [p, inv(A), 1]);
assert.deepEqual(p27Fragments[6].values, [b + K, p - g, K * g]);
assert.deepEqual(p55Fragments[15].values, p27Fragments[5].values);
assert.deepEqual(p55Fragments[16].values, p27Fragments[6].values);
const marker6 = p27Fragments.slice(5, 7).flatMap((entry) => entry.values);
assert.deepEqual(marker6, [p, inv(A), 1, b + K, p - g, K * g]);
assert.deepEqual(hEven(marker6), [b - K, p - 1, b - K, p - g, F, q]);

const contiguousMatches = [];
for (const page of corpus.pages.filter((entry) => entry.page <= 55 && entry.page !== 50)) {
  for (let offset = 0; offset + rawP27.values.length <= page.indices.length; offset += 1) {
    if (rawP27.values.every((value, i) => page.indices[offset + i] === value)) {
      contiguousMatches.push({ page: page.page, offset });
    }
  }
}
assert.deepEqual(contiguousMatches, [
  { page: 27, offset: 31 },
  { page: 55, offset: 73 },
]);

const p27Page = corpus.pages.find((entry) => entry.page === 27).indices;
const p55Page = corpus.pages.find((entry) => entry.page === 55).indices;
const p56Page = corpus.pages.find((entry) => entry.page === 56).indices;
assert.deepEqual(p27Page.slice(28, 35), p55Page.slice(-6).concat(p56Page[0]));
assert.deepEqual(p27Page.slice(28, 35), [23, 11, 1, 17, 18, 10, 25]);

const displacement = [mod(55 - 27), mod(15 - 5), mod(70 - 28), mod(73 - 31)];
assert.deepEqual(displacement, [mod(-1), K * g, b - K, b - K]);
const displacementH = [
  mod(displacement[0] - displacement[3]),
  mod(displacement[1] - displacement[2]),
  mod(displacement[1] + displacement[2]),
  mod(displacement[0] + displacement[3]),
];
assert.deepEqual(displacementH, [b, mod(-e), p, a * K]);

console.log('next raw p22-p27 schedule', nextRawSchedule);
console.log('next state-signed schedule', nextStateSignedSchedule);
console.log('p22-p27 raw packet', { L: rawP22.L, S: rawP22.S, P: rawP22.P });
console.log('p22-p27 signed packet', { L: signedP22.L, S: signedP22.S, P: signedP22.P });
console.log('selected p27 coordinate', [rawP27.start, rawP27.index], '=> p50 cell254');
console.log('selected seven-rune bookend', p27Page.slice(28, 35));
console.log('marker H6', hEven(marker6));
console.log('PASS p8->p16-21->p22-27->p27/cell254/p55 handoff');
