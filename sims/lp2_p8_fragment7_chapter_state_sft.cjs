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

const corpus = JSON.parse(
  fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8')
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

// Charge every same-page 49-fragment window.
let windows49 = 0;
const rowHits = [];
const colHits = [];
const jointHits = [];
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
  }
}
assert.equal(windows49, 479);
assert.deepEqual(rowHits, [[8,2,12]]);
assert.deepEqual(colHits, [[8,2,12]]);
assert.deepEqual(jointHits, [[8,2,12,p-g]]);

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

console.log(JSON.stringify({
  status: 'PASS',
  classification: 'source-only p8/chapter state-layout serialization; no plaintext or cipher',
  state: { p,g,a,b,A,B,K,e,q,F },
  p8FragmentLengthSquare: {
    matrix,rowRaw,rowMod,rowH:H(rowMod),colRaw,colMod,colH:H(colMod),
    determinant:determinant29(matrix),
    census:{windows49,rowHits,colHits,jointHits},
  },
  chapterPageLengths: {
    pageCounts,quotients,remainders,
    hQuotients:H(quotients),hRemainders:H(remainders),
    total:chapterTotal,
    stateFactorization:[g+K,b-K,B],
    intervalCensus:{intervalCount,exactIntervals,hIntervals,totalIntervals},
  },
  boundary:
    'The 49-fragment and 1729-rune geometries were already known. New evidence is their coupled serialization of the independently reconstructed DH state. Fixed Hill7 on the 1729-rune chapter is already excluded by the repository all-secret Gate E and is not retested here.',
},null,2));
