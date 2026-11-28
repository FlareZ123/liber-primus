'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const Q = 29;
const mod = (x) => ((x % Q) + Q) % Q;
const sum = (v) => mod(v.reduce((a, b) => a + b, 0));
const product = (v) => v.reduce((a, b) => mod(a * b), 1);

/** @param {number[]} v */
function H(v) {
  const n = v.length;
  const m = Math.floor(n / 2);
  const out = [];
  for (let i = 0; i < m; i += 1) out.push(mod(v[i] - v[n - 1 - i]));
  if (n % 2) out.push(v[m]);
  for (let i = m - 1; i >= 0; i -= 1) out.push(mod(v[i] + v[n - 1 - i]));
  return out;
}

function inv(x) {
  for (let y = 1; y < Q; y += 1) if (mod(x * y) === 1) return y;
  throw new Error('noninvertible');
}

function powMod(base, exponent, modulus) {
  let out = 1;
  let b = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * b) % modulus;
    b = (b * b) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

function determinant29(matrix) {
  const rows = matrix.map((row) => row.map(mod));
  let determinant = 1;
  for (let col = 0; col < rows.length; col += 1) {
    let pivot = -1;
    for (let row = col; row < rows.length; row += 1) {
      if (rows[row][col] !== 0) {
        pivot = row;
        break;
      }
    }
    if (pivot < 0) return 0;
    if (pivot !== col) {
      [rows[pivot], rows[col]] = [rows[col], rows[pivot]];
      determinant = mod(-determinant);
    }
    const lead = rows[col][col];
    determinant = mod(determinant * lead);
    const scale = inv(lead);
    rows[col] = rows[col].map((x) => mod(x * scale));
    for (let row = col + 1; row < rows.length; row += 1) {
      if (!rows[row][col]) continue;
      const factor = rows[row][col];
      rows[row] = rows[row].map((x, j) => mod(x - factor * rows[col][j]));
    }
  }
  return determinant;
}

/** @param {number[][]} A @param {number[][]} B */
function matrixMultiply(A, B) {
  const n = A.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i += 1) {
    for (let k = 0; k < n; k += 1) {
      if (!A[i][k]) continue;
      for (let j = 0; j < n; j += 1) {
        out[i][j] = mod(out[i][j] + A[i][k] * B[k][j]);
      }
    }
  }
  return out;
}

/** @param {number[][]} A @param {number} exponent */
function matrixPower(A, exponent) {
  const n = A.length;
  let out = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => Number(i === j))
  );
  let base = A.map((row) => row.map(mod));
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = matrixMultiply(out, base);
    base = matrixMultiply(base, base);
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number[][]} A */
function inverseMatrix29(A) {
  const n = A.length;
  const eye = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => Number(i === j))
  );
  const rows = A.map((row, i) => row.map(mod).concat(eye[i]));
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    while (pivot < n && rows[pivot][col] === 0) pivot += 1;
    if (pivot === n) throw new Error('singular matrix');
    [rows[pivot], rows[col]] = [rows[col], rows[pivot]];
    const scale = inv(rows[col][col]);
    rows[col] = rows[col].map((x) => mod(x * scale));
    for (let row = 0; row < n; row += 1) {
      if (row === col || rows[row][col] === 0) continue;
      const factor = rows[row][col];
      rows[row] = rows[row].map((x, j) => mod(x - factor * rows[col][j]));
    }
  }
  return rows.map((row) => row.slice(n));
}

/** @param {number[][]} A */
function transpose(A) {
  return A[0].map((_, col) => A.map((row) => row[col]));
}

/** Characteristic polynomial coefficients [1,c1,...,cn] over GF(29). */
function characteristicCoefficients29(A) {
  const n = A.length;
  const traces = Array(n + 1).fill(0);
  let power = A.map((row) => row.map(mod));
  for (let k = 1; k <= n; k += 1) {
    traces[k] = mod(power.reduce((z, row, i) => z + row[i], 0));
    power = matrixMultiply(power, A);
  }
  const elementary = Array(n + 1).fill(0);
  elementary[0] = 1;
  for (let k = 1; k <= n; k += 1) {
    let acc = 0;
    for (let i = 1; i <= k; i += 1) {
      const term = mod(elementary[k - i] * traces[i]);
      acc = mod(acc + (i % 2 ? term : -term));
    }
    elementary[k] = mod(acc * inv(k));
  }
  return [1, ...Array.from({ length: n }, (_, i) =>
    mod((i + 1) % 2 ? -elementary[i + 1] : elementary[i + 1])
  )];
}

/** @param {number[]} left @param {number[]} right */
function polynomialMultiply(left, right) {
  const out = Array(left.length + right.length - 1).fill(0);
  for (let i = 0; i < left.length; i += 1) {
    for (let j = 0; j < right.length; j += 1) {
      out[i + j] = mod(out[i + j] + left[i] * right[j]);
    }
  }
  return out;
}

/** Companion matrix for x^3+c2*x^2+c1*x+c0. */
function cubicCompanion(coefficients) {
  const [c2, c1, c0] = coefficients;
  return [
    [0, 1, 0],
    [0, 0, 1],
    [mod(-c0), mod(-c1), mod(-c2)],
  ];
}

/** @param {number[]} coefficients @param {number[]} seed @param {number} length */
function lfsr(coefficients, seed, length) {
  const [c2, c1, c0] = coefficients;
  const out = seed.slice();
  while (out.length < length) {
    const i = out.length;
    out.push(mod(-c2 * out[i - 1] - c1 * out[i - 2] - c0 * out[i - 3]));
  }
  return out.slice(0, length);
}

/** @param {number[][]} A @param {number[]} v */
function matrixVector(A, v) {
  return A.map((row) => mod(row.reduce((z, x, i) => z + x * v[i], 0)));
}

/** Apply successive powers base^(block+origin) to 7-rune column blocks. */
function powerClock(base, body, origin) {
  assert.equal(body.length % 7, 0);
  const n = base.length;
  let power = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => Number(i === j))
  );
  if (origin === 1) power = base.map((row) => row.slice());
  const out = [];
  for (let offset = 0; offset < body.length; offset += 7) {
    out.push(...matrixVector(power, body.slice(offset, offset + 7)));
    power = matrixMultiply(power, base);
  }
  return out;
}

/** Ascending-degree polynomial evaluation in GF29. */
function polynomialScalar(coefficients, value) {
  let out = 0;
  let power = 1;
  for (const coefficient of coefficients) {
    out = mod(out + coefficient * power);
    power = mod(power * value);
  }
  return out;
}

/** Ascending-degree polynomial evaluation on a square GF29 matrix. */
function polynomialMatrix(coefficients, matrix) {
  const n = matrix.length;
  const identity = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => Number(i === j))
  );
  let out = Array.from({ length: n }, () => Array(n).fill(0));
  let power = identity;
  for (const coefficient of coefficients) {
    out = out.map((row, i) =>
      row.map((value, j) => mod(value + coefficient * power[i][j]))
    );
    power = matrixMultiply(power, matrix);
  }
  return out;
}

function ioc(values) {
  const counts = Array(Q).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((z, n) => z + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const corpus = JSON.parse(
  fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8')
);
const ink = JSON.parse(
  fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-ink-annotations.json'), 'utf8')
);
const transcription = fs
  .readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8')
  .replace(/\r/g, '');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);

function pageFragments(page) {
  const source = corpus.pages.find((x) => x.page === page).indices;
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
      assert.equal(source[offset], value, 'transcription mismatch p' + page + '@' + offset);
      current.push(value);
      offset += 1;
    } else if (ch === '/' || /\s/u.test(ch)) {
      continue;
    } else {
      flush();
    }
  }
  flush();
  assert.equal(offset, source.length, 'transcription length p' + page);
  return fragments;
}

// Independently published p15 lower-red/grid DH state reconstruction.
const p15 = corpus.pages.find((x) => x.page === 15);
const lower = p15.indices.slice(9, 20);
const lowerWords = [lower.slice(0, 4), lower.slice(4, 6), lower.slice(6, 11)];
const desc = lowerWords.map((v) => ({ L: v.length, S: sum(v), P: product(v) }));
assert.deepEqual(desc, [
  { L: 4, S: 22, P: 10 },
  { L: 2, S: 6, P: 5 },
  { L: 5, S: 5, P: 0 },
]);
const K = desc[1].L;
const a = desc[1].S;
const g = desc[1].P;
const q = desc[0].L;
const F = desc[2].P;
const p = desc[0].S + 1;
const A = powMod(g, a, p);
const grid = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820],
];
const residues = grid.map((row) => row.map((x) => x % Q));
const columns = Array.from({ length: 4 }, (_, c) =>
  H(Array.from({ length: 4 }, (_, r) => residues[r][c]))
);
const bColumn = columns.filter(
  (v) => v[0] === p - g && v[2] === a * K && v[3] === K
);
assert.equal(bColumn.length, 1);
const B = bColumn[0][1];
let b = null;
for (let exponent = 0; exponent < p - 1; exponent += 1) {
  if (powMod(g, exponent, p) === B) {
    b = exponent;
    break;
  }
}
assert.equal(b, 15);
const e = (() => {
  for (let x = 1; x < p - 1; x += 1) if ((b * x) % (p - 1) === 1) return x;
  throw new Error('missing inverse exponent');
})();
assert.deepEqual({ p, g, a, b, A, B, K, e, q, F }, {
  p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4, F: 0,
});

// P8 page composition is itself a state-selected source packet.
const pageCountRecords = [];
for (const pageObj of corpus.pages.filter((x) => x.page <= 55 && x.page !== 50)) {
  const fragments = pageFragments(pageObj.page);
  const ann = ink.pages.find((x) => x.page === pageObj.page);
  const spans = ann?.red_spans || [];
  const redRunes = spans.reduce((z, span) => z + span.length, 0);
  const redFragments = fragments.filter((fragment) =>
    spans.some(
      (span) =>
        fragment.start >= span.start &&
        fragment.end <= span.start + span.length
    )
  ).length;
  pageCountRecords.push({
    page: pageObj.page,
    totalRunes: pageObj.indices.length,
    totalFragments: fragments.length,
    redRunes,
    redFragments,
    blackRunes: pageObj.indices.length - redRunes,
    blackFragments: fragments.length - redFragments,
  });
}
const p8CountTarget = {
  redFragments: K,
  redRunes: a * K,
  totalFragments: e * (b + K),
  totalRunes: g * e * (b + K),
  blackFragments: (g + K) ** 2,
  blackRunes: e ** g,
};
assert.deepEqual(p8CountTarget, {
  redFragments: 2,
  redRunes: 12,
  totalFragments: 51,
  totalRunes: 255,
  blackFragments: 49,
  blackRunes: 243,
});
const countSignatureHits = pageCountRecords.filter((row) =>
  Object.entries(p8CountTarget).every(([key, value]) => row[key] === value)
);
assert.deepEqual(countSignatureHits.map((x) => x.page), [8]);
assert.deepEqual(
  pageCountRecords
    .filter((x) => x.redFragments === K && x.redRunes === a * K)
    .map((x) => x.page),
  [8]
);
assert.deepEqual(
  pageCountRecords
    .filter(
      (x) =>
        x.totalFragments === e * (b + K) &&
        x.totalRunes === g * e * (b + K)
    )
    .map((x) => x.page),
  [8]
);
assert.deepEqual(
  pageCountRecords
    .filter(
      (x) =>
        x.blackFragments === (g + K) ** 2 &&
        x.blackRunes === e ** g
    )
    .map((x) => x.page),
  [8]
);

// P8 has 49 page-local black fragments. The last is only the one-rune p8
// tail of a six-rune word that continues onto p9; this test intentionally
// preserves page-local fragment geometry rather than calling all 49 words.
const p8Fragments = pageFragments(8);
assert.deepEqual(p8Fragments.slice(0, 2).map((x) => x.values.length), [q, A]);
const blackFragments = p8Fragments.slice(2);
assert.equal(blackFragments.length, 49);
assert.equal(blackFragments.reduce((z, x) => z + x.values.length, 0), 243);
assert.equal(blackFragments.at(-1).values.length, 1);

const lengths = blackFragments.map((x) => x.values.length);
const matrix = Array.from({ length: 7 }, (_, r) => lengths.slice(7 * r, 7 * r + 7));
assert.deepEqual(matrix, [
  [3,2,3,9,4,3,4],
  [2,2,6,3,7,3,4],
  [3,8,4,3,4,5,5],
  [2,3,4,4,7,5,10],
  [6,12,4,5,3,2,6],
  [10,4,9,6,5,6,8],
  [8,3,2,9,6,6,1],
]);
const rowRaw = matrix.map((row) => row.reduce((x, y) => x + y, 0));
const rowMod = rowRaw.map((x) => x % Q);
const colRaw = Array.from({ length: 7 }, (_, c) =>
  matrix.reduce((z, row) => z + row[c], 0)
);
const colMod = colRaw.map((x) => x % Q);
assert.deepEqual(rowRaw, [28,27,32,35,38,48,35]);
assert.deepEqual(rowMod, [28,27,e,a,q+g,B,a]);
assert.deepEqual(colRaw, [34,34,32,39,36,30,38]);
assert.deepEqual(colMod, [g,g,e,K*g,g+K,1,q+g]);
const rowHTarget = [p-1,A,p,a,a*K,b+K,g];
const colHTarget = [mod(-q),q,mod(-q),K*g,K*g,a,mod(-b)];
assert.deepEqual(H(rowMod), rowHTarget);
assert.deepEqual(H(colMod), colHTarget);
assert.equal(determinant29(matrix), p - g);

// Stronger algebraic self-description: the full characteristic polynomial is
// predicted by the independently reconstructed p15/p8 DH state.
const characteristicTarget = [
  1,
  a,
  inv(A),
  K * g,
  mod(-b),
  K * g,
  mod(-A),
  inv(A),
].map(mod);
assert.deepEqual(characteristicCoefficients29(matrix), characteristicTarget);

const factorLinear = [1, g];
const factorCubicA = [1, g, mod(-q), a];
const factorCubicB = [1, mod(-q), 1, inv(A)];
const factored = polynomialMultiply(
  polynomialMultiply(factorLinear, factorCubicA),
  factorCubicB
);
assert.deepEqual(factored, characteristicTarget);

const cubicA = factorCubicA.slice(1);
const cubicB = factorCubicB.slice(1);
const companionA = cubicCompanion(cubicA);
const companionB = cubicCompanion(cubicB);
const identity3 = Array.from({ length: 3 }, (_, i) =>
  Array.from({ length: 3 }, (_, j) => Number(i === j))
);
assert.deepEqual(matrixPower(companionA, 469), identity3);
for (const primeFactor of [7, 67]) {
  assert.notDeepEqual(matrixPower(companionA, 469 / primeFactor), identity3);
}
assert.deepEqual(matrixPower(companionB, 24388), identity3);
for (const primeFactor of [2, 7, 13, 67]) {
  assert.notDeepEqual(matrixPower(companionB, 24388 / primeFactor), identity3);
}

// Direct order certificate. Since M^24388=I and division by every prime
// factor of 24388 breaks identity, ord(M)=24388=29^3-1 exactly.
const identity7 = Array.from({ length: 7 }, (_, i) =>
  Array.from({ length: 7 }, (_, j) => Number(i === j))
);
const matrixOrder = 29 ** 3 - 1;
assert.equal(matrixOrder, 24388);
assert.deepEqual(matrixPower(matrix, matrixOrder), identity7);
for (const primeFactor of [2, 7, 13, 67]) {
  assert.notDeepEqual(matrixPower(matrix, matrixOrder / primeFactor), identity7);
}

// Adjacent-page bridge: the already-established five p7 red products are the
// ascending coefficients of P(x). Starting at GP0 and iterating once per
// marked p7 red word reaches g after exactly five steps; the next seven states
// are the unique source-frozen cycle used here as p8 column weights.
const p7Polynomial = [inv(A), inv(B), A, inv(K), K];
assert.deepEqual(p7Polynomial, [11, 26, 8, 15, 2]);
const zeroPath = [F];
for (let i = 0; i < 5; i += 1) {
  zeroPath.push(polynomialScalar(p7Polynomial, zeroPath.at(-1)));
}
assert.deepEqual(zeroPath, [F, inv(A), p, b + K, p - g, g]);

const p7Orbit = [g];
for (let i = 1; i < 7; i += 1) {
  p7Orbit.push(polynomialScalar(p7Polynomial, p7Orbit.at(-1)));
}
assert.deepEqual(p7Orbit, [g, b, mod(-1), q + g, K * g, mod(-g), g + K]);
assert.equal(polynomialScalar(p7Polynomial, p7Orbit.at(-1)), p7Orbit[0]);

const p7WeightedRows = matrixVector(matrix, p7Orbit);
const p7WeightedColumns = matrixVector(transpose(matrix), p7Orbit);
assert.deepEqual(p7WeightedRows, [K, mod(-1), g, mod(-1), p, mod(-1), mod(-K)]);
assert.deepEqual(
  p7WeightedColumns,
  [K * g, a, 1, e, mod(-1), mod(K - b), p - g]
);

// The p7 polynomial can itself act directly on the p8 matrix.
const p7OfP8Matrix = polynomialMatrix(p7Polynomial, matrix);
const p7OfP8Characteristic = [
  1,
  g,
  b - K,
  B,
  mod(-K),
  1,
  mod(-(q + g)),
  mod(K - b),
];
assert.deepEqual(
  characteristicCoefficients29(p7OfP8Matrix),
  p7OfP8Characteristic
);
const p7OfP8Factored = polynomialMultiply(
  [1, mod(-(g + K))],
  polynomialMultiply(
    [1, K, mod(-1), inv(A)],
    [1, K * g, mod(-(q + g)), B]
  )
);
assert.deepEqual(p7OfP8Factored, p7OfP8Characteristic);
assert.equal(determinant29(p7OfP8Matrix), b - K);

// Charge every same-page 49-fragment window.
let windows49 = 0;
const rowHits = [];
const colHits = [];
const jointHits = [];
const characteristicHits = [];
const p7OrbitRowHits = [];
const p7OrbitColumnHits = [];
const p7OrbitShapeHits = [];
const p7OrbitNaturalOrientationShapeHits = [];
const p7NaturalOrientations = [];
for (const reversed of [false, true]) {
  const source = reversed ? p7Orbit.slice().reverse() : p7Orbit.slice();
  for (let rotation = 0; rotation < 7; rotation += 1) {
    p7NaturalOrientations.push({
      reversed,
      rotation,
      values: source.slice(rotation).concat(source.slice(0, rotation)),
    });
  }
}
assert.equal(p7NaturalOrientations.length, 14);
for (const pageObj of corpus.pages.filter((x) => x.page <= 55 && x.page !== 50)) {
  const fragments = pageFragments(pageObj.page);
  const lens = fragments.map((x) => x.values.length);
  for (let start = 0; start + 49 <= lens.length; start += 1) {
    windows49 += 1;
    const values = lens.slice(start, start + 49);
    const candidate = Array.from({ length: 7 }, (_, r) => values.slice(7*r, 7*r+7));
    const rows = candidate.map((row) => row.reduce((x,y) => x+y, 0) % Q);
    const cols = Array.from({ length: 7 }, (_, c) =>
      candidate.reduce((z, row) => z + row[c], 0) % Q
    );
    const rowOK = H(rows).every((x, i) => x === rowHTarget[i]);
    const colOK = H(cols).every((x, i) => x === colHTarget[i]);
    if (rowOK) rowHits.push([pageObj.page, start, fragments[start].start]);
    if (colOK) colHits.push([pageObj.page, start, fragments[start].start]);
    if (rowOK && colOK) {
      jointHits.push([
        pageObj.page,
        start,
        fragments[start].start,
        determinant29(candidate),
      ]);
    }
    if (
      characteristicCoefficients29(candidate).every(
        (x, i) => x === characteristicTarget[i]
      )
    ) {
      characteristicHits.push([pageObj.page, start, fragments[start].start]);
    }
    const weightedRows = matrixVector(candidate, p7Orbit);
    const weightedColumns = matrixVector(transpose(candidate), p7Orbit);
    if (weightedRows.every((x, i) => x === p7WeightedRows[i])) {
      p7OrbitRowHits.push([pageObj.page, start, fragments[start].start]);
    }
    if (weightedColumns.every((x, i) => x === p7WeightedColumns[i])) {
      p7OrbitColumnHits.push([pageObj.page, start, fragments[start].start]);
    }
    if (
      weightedRows[1] === weightedRows[3] &&
      weightedRows[3] === weightedRows[5] &&
      mod(weightedRows[0] + weightedRows[6]) === 0
    ) {
      p7OrbitShapeHits.push([
        pageObj.page,
        start,
        fragments[start].start,
        weightedRows,
      ]);
    }
    for (const orientation of p7NaturalOrientations) {
      const candidateRows = matrixVector(candidate, orientation.values);
      if (
        candidateRows[1] === candidateRows[3] &&
        candidateRows[3] === candidateRows[5] &&
        mod(candidateRows[0] + candidateRows[6]) === 0
      ) {
        p7OrbitNaturalOrientationShapeHits.push([
          pageObj.page,
          start,
          fragments[start].start,
          orientation.reversed,
          orientation.rotation,
          candidateRows,
        ]);
      }
    }
  }
}
assert.equal(windows49, 479);
assert.deepEqual(rowHits, [[8,2,12]]);
assert.deepEqual(colHits, [[8,2,12]]);
assert.deepEqual(jointHits, [[8,2,12,p-g]]);
assert.deepEqual(characteristicHits, [[8,2,12]]);
assert.deepEqual(p7OrbitRowHits, [[8,2,12]]);
assert.deepEqual(p7OrbitColumnHits, [[8,2,12]]);
assert.deepEqual(
  p7OrbitShapeHits.map((x) => x.slice(0, 3)),
  [[8,2,12]]
);
assert.deepEqual(
  p7OrbitNaturalOrientationShapeHits.map((x) => x.slice(0, 5)),
  [[8,2,12,false,0]]
);

// Seven-page physical chapter counts, base29 quotient/remainder state packet.
const pageCounts = Array.from({ length: 7 }, (_, i) =>
  corpus.pages.find((x) => x.page === 8 + i).indices.length
);
assert.deepEqual(pageCounts, [255,268,263,273,261,272,137]);
const quotients = pageCounts.map((x) => Math.floor(x / Q));
const remainders = pageCounts.map((x) => x % Q);
const quotientTarget = [A,q+g,q+g,q+g,q+g,q+g,q];
const remainderTarget = [p,g+K,K,a*K,F,inv(A),mod(-A)];
assert.deepEqual(quotients, quotientTarget);
assert.deepEqual(remainders, remainderTarget);
assert.deepEqual(H(quotients), [q,F,F,q+g,p-g,p-g,a*K]);
assert.deepEqual(H(remainders), [K,mod(-q),K,a*K,K,p-g,b]);

const chapterTotal = pageCounts.reduce((x,y) => x+y, 0);
assert.equal(chapterTotal, 1729);
assert.equal(chapterTotal, (g+K) * (b-K) * B);

let intervalCount = 0;
const exactIntervals = [];
const hIntervals = [];
const totalIntervals = [];
const targetHQ = H(quotientTarget);
const targetHR = H(remainderTarget);
for (let start = 0; start + 6 <= 55; start += 1) {
  intervalCount += 1;
  const counts = Array.from({ length: 7 }, (_, i) =>
    corpus.pages.find((x) => x.page === start + i).indices.length
  );
  const qs = counts.map((x) => Math.floor(x / Q));
  const rs = counts.map((x) => x % Q);
  if (
    qs.every((x,i) => x === quotientTarget[i]) &&
    rs.every((x,i) => x === remainderTarget[i])
  ) exactIntervals.push([start,start+6]);
  if (
    H(qs).every((x,i) => x === targetHQ[i]) &&
    H(rs).every((x,i) => x === targetHR[i])
  ) hIntervals.push([start,start+6]);
  if (counts.reduce((x,y) => x+y,0) === chapterTotal) totalIntervals.push([start,start+6]);
}
assert.equal(intervalCount, 50);
assert.deepEqual(exactIntervals, [[8,14]]);
assert.deepEqual(hIntervals, [[8,14]]);
assert.deepEqual(totalIntervals, [[8,14]]);

// Two direct consumers are finite negatives rather than open cipher families.
// (1) Successive powers of the source 7x7 matrix across all 247 chapter blocks.
const chapterBody = [];
for (let page = 8; page <= 14; page += 1) {
  chapterBody.push(...corpus.pages.find((x) => x.page === page).indices);
}
assert.equal(chapterBody.length, 1729);
assert.equal(chapterBody.length / 7, 247);

const matrixInverse = inverseMatrix29(matrix);
const matrixTranspose = transpose(matrix);
const matrixTransposeInverse = inverseMatrix29(matrixTranspose);
const powerVariants = {};
for (const [orientation, plus, minus] of [
  ['column', matrix, matrixInverse],
  ['row', matrixTranspose, matrixTransposeInverse],
]) {
  for (const [direction, base] of [['plus', plus], ['minus', minus]]) {
    for (const origin of [0, 1]) {
      const name = orientation + '_' + direction + '_origin' + origin;
      const decoded = powerClock(base, chapterBody, origin);
      const replayBase = direction === 'plus' ? minus : plus;
      assert.deepEqual(powerClock(replayBase, decoded, origin), chapterBody);
      powerVariants[name] = decoded;
    }
  }
}

// (2) Literal page-length BASE29 affine inverse P=a^-1(C-b), where
// page length = 29*a+b. This varies by physical page and is distinct from a
// single fixed Hill7 key.
const pageAffine = [];
for (let page = 8; page <= 14; page += 1) {
  const source = corpus.pages.find((x) => x.page === page).indices;
  const quotient = Math.floor(source.length / Q);
  const remainder = source.length % Q;
  const scale = inv(quotient);
  const decoded = source.map((x) => mod(scale * (x - remainder)));
  assert.deepEqual(
    decoded.map((x) => mod(quotient * x + remainder)),
    source
  );
  pageAffine.push(...decoded);
}

// Established native-GP scorer used by neighboring receiver gates.
const nativeSource = JSON.parse(
  fs.readFileSync(
    path.join(root, 'resources/external/relikd-solved-gp29-native-v1.json'),
    'utf8'
  )
);
const nativeSections = nativeSource.sections.map((section) =>
  [...section.source_text].filter((ch) => runeIndex.has(ch)).map((ch) => runeIndex.get(ch))
);
const unigram = Array(Q).fill(0.5);
const bigram = Array.from({ length: Q }, () => Array(Q).fill(0));
for (const section of nativeSections) {
  for (let i = 0; i < section.length; i += 1) {
    unigram[section[i]] += 1;
    if (i) bigram[section[i - 1]][section[i]] += 1;
  }
}
const total = (array) => array.reduce((x, y) => x + y, 0);
const probabilities = unigram.map((x) => x / total(unigram));
const logUni = probabilities.map((x) => Math.log(Q * x));
const logBi = bigram.map((row) =>
  row.map((x, j) => Math.log(Q * (x + 12 * probabilities[j]) / (total(row) + 12)))
);
const score = (values) => values.reduce(
  (z, x, i) => z + (i ? logBi[values[i - 1]][x] : logUni[x]),
  0
) / values.length;
const nativeScores = nativeSections.map(score);
const nativeMin = Math.min(...nativeScores);
const powerScores = Object.fromEntries(
  Object.entries(powerVariants).map(([name, values]) => [
    name,
    { score: score(values), ioc: ioc(values) },
  ])
);
assert.ok(Object.values(powerScores).every((x) => x.score < nativeMin));
const pageAffineResult = { score: score(pageAffine), ioc: ioc(pageAffine) };
assert.ok(pageAffineResult.score < nativeMin);

// The factorization itself suggests a 3-state recurrence. Freeze the minimal
// cross-seeded construction: one cubic's ordered nonleading coefficients seed
// the other. Test only the two additive signs on p8 black and p8-p14.
const p8Black = p8.indices.slice(a * K);
assert.equal(p8Black.length, e ** g);
const lfsrResults = [];
for (const [polyName, polynomial, seedName, seed] of [
  ['A', cubicA, 'B', cubicB],
  ['B', cubicB, 'A', cubicA],
]) {
  for (const [receiverName, receiver] of [
    ['p8black', p8Black],
    ['chapter', chapterBody],
  ]) {
    const key = lfsr(polynomial, seed, receiver.length);
    for (const sign of [-1, 1]) {
      const decoded = receiver.map((x, i) => mod(x + sign * key[i]));
      const replay = decoded.map((x, i) => mod(x - sign * key[i]));
      assert.deepEqual(replay, receiver);
      lfsrResults.push({
        polynomial: polyName,
        seedFrom: seedName,
        receiver: receiverName,
        sign,
        score: score(decoded),
        ioc: ioc(decoded),
      });
    }
  }
}
assert.ok(lfsrResults.every((x) => x.score < nativeMin));

console.log(JSON.stringify({
  status: 'PASS',
  classification: 'source-only p8/chapter state-layout serialization; no plaintext or cipher',
  state: { p,g,a,b,A,B,K,e,q,F },
  p8PageComposition: {
    target:p8CountTarget,
    countSignatureHits:countSignatureHits.map((x) => x.page),
  },
  p8FragmentLengthSquare: {
    matrix,rowRaw,rowMod,rowH:H(rowMod),colRaw,colMod,colH:H(colMod),
    determinant:determinant29(matrix),
    characteristic:{
      coefficients:characteristicCoefficients29(matrix),
      target:characteristicTarget,
      factors:[factorLinear,factorCubicA,factorCubicB],
      cubicOrders:[469,24388],
      order:matrixOrder,
    },
    p7Bridge:{
      polynomial:p7Polynomial,
      zeroPath,
      orbit:p7Orbit,
      weightedRows:p7WeightedRows,
      weightedColumns:p7WeightedColumns,
      polynomialOfMatrixCharacteristic:p7OfP8Characteristic,
    },
    census:{
      windows49,rowHits,colHits,jointHits,characteristicHits,
      p7OrbitRowHits,p7OrbitColumnHits,p7OrbitShapeHits,
      p7OrbitNaturalOrientationShapeHits,
    },
  },
  chapterPageLengths: {
    pageCounts,quotients,remainders,
    hQuotients:H(quotients),hRemainders:H(remainders),
    total:chapterTotal,
    stateFactorization:[g+K,b-K,B],
    intervalCensus:{intervalCount,exactIntervals,hIntervals,totalIntervals},
  },
  directConsumers:{
    nativeScoreRange:[Math.min(...nativeScores),Math.max(...nativeScores)],
    rawChapter:{score:score(chapterBody),ioc:ioc(chapterBody)},
    matrixPowerClock:powerScores,
    pageLengthAffineInverse:pageAffineResult,
    crossSeededCubicLfsr:lfsrResults,
  },
  boundary:
    'The 49-fragment and 1729-rune geometries were already known. New evidence is their coupled serialization of the independently reconstructed DH state: page composition, characteristic polynomial, and page-length BASE29 packet. The 7x7 grid is an inferred reshape, not a visibly drawn grid on original 25.jpg. Fixed Hill7 is already excluded; changing matrix powers, page-length affine inversion, and the minimal cross-seeded cubic LFSR are tested here and remain ciphertext-like.',
},null,2));
