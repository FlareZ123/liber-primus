#!/usr/bin/env node
'use strict';
// Source-exact all-secret test: eight LP2 sections, 32x8 numeric table,
// preceding ciphertext rune as the row address, arbitrary outer GP29 alphabet
// independently per section. Node 22, no npm dependencies.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(base, p), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const grid = read('resources/liber-primus/lp2-grid-256.json');
const rawTranscription = fs.readFileSync(path.join(base, 'resources/lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const sourceSections = rawTranscription.split('$').slice(0, 8)
  .map(s => [...s].filter(r => runeIndex.has(r)).map(r => runeIndex.get(r)));
const lengths = sourceSections.map(x => x.length);
const source = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const firstPage = new Set();
let cursor = 0;
for (const page of corpus.pages.filter(p => p.page < 56)) {
  if (!page.indices.length) continue;
  firstPage.add(cursor);
  cursor += page.indices.length;
}
assert.deepEqual(lengths, [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
assert.deepEqual(sourceSections.flat(), source); // independent transcription
assert.equal(source.length, 12956);
assert.equal(firstPage.size, 55);
const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.bytes.length, 256);
const alphabet59 = grid.alphabet.replace('f', '');
const b59 = tokens.map(t => 59 * alphabet59.indexOf(t[0]) + alphabet59.indexOf(t[1]));
const b60 = grid.bytes;
assert(b59.every(x => Number.isInteger(x) && x >= 0 && x < 256));
assert(b60.every(x => Number.isInteger(x) && x >= 0 && x < 256));
const e = corpus.translit.indexOf('E');
const o = corpus.translit.indexOf('O');
assert.deepEqual([e, o], [18, 3]);
const mod = (a, n = 29) => ((a % n) + n) % n;

function hungarianMax(weights) {
  const n = weights.length;
  assert(weights.every(row => row.length === n));
  const largest = Math.max(...weights.flat());
  const u = Array(n + 1).fill(0), v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0), way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = Array(n + 1).fill(Infinity), used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = largest - weights[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }
  const assignment = Array(n);
  for (let j = 1; j <= n; j++) assignment[p[j] - 1] = j - 1;
  return assignment.reduce((sum, j, i) => sum + weights[i][j], 0);
}
function bruteMax(A) {
  let best = -Infinity;
  const perm = (used, row, score) => {
    if (row === A.length) { best = Math.max(best, score); return; }
    for (let j = 0; j < A.length; j++)
      if (!(used & (1 << j))) perm(used | (1 << j), row + 1, score + A[row][j]);
  };
  perm(0, 0, 0);
  return best;
}
for (const A of [
  [[4,1,2], [3,0,5], [1,7,2]],
  [[0,1,2], [3,4,5], [6,7,8]],
  [[-2,-1,3], [0,5,3], [1,9,0]]
]) assert.equal(hungarianMax(A), bruteMax(A));
const rowOptions = [
  { name: '0..28', f: x => x },
  { name: '3..31', f: x => x + 3 },
  { name: '28..0', f: x => 28 - x },
  { name: '31..3', f: x => 31 - x }
];

// Inverse P = sigma_q^{-1}(C) - sign*T[row(C_previous),col(q)] mod29.
// The independent unknown 29! alphabets sigma_q are eliminated EXACTLY:
// for each candidate plaintext class set V, assign every visible current
// C label to one unique pre-shift state x using maximal-weight matching.
function capacities(tape, bytes, row, reflect, sign, freeF) {
  let begin = 0, free = 0;
  const totals = [0, 0];
  let eligible = 0;
  for (let q = 0; q < 8; q++) {
    const end = begin + lengths[q];
    const n = Array.from({length: 29}, () => Array(29).fill(0));
    for (let i = begin; i < end; i++) {
      if (i === begin || firstPage.has(i) || (freeF && tape[i] === 0)) {
        free++;
        continue;
      }
      const observed = tape[i];
      const rowAddress = row(tape[i - 1]);
      assert(rowAddress >= 0 && rowAddress < 32);
      const k = bytes[8 * rowAddress + (reflect ? 7 - q : q)] % 29;
      n[observed][k]++;
      eligible++;
    }
    for (const [z, target] of [[0, [e]], [1, [e, o]]]) {
      const weights = Array.from({length: 29}, (_, c) =>
        Array.from({length: 29}, (_, x) =>
          target.reduce((acc, t) => acc + n[c][mod(sign * (x - t))], 0)));
      totals[z] += hungarianMax(weights);
    }
    begin = end;
  }
  assert.equal(eligible + free, tape.length);
  return { E: totals[0] + free, EO: totals[1] + free, eligible, free };
}

// Full-length source-native planted control, with a DIFFERENT independent
// secret permutation in every manuscript section and actual feedback.
function plantedControl() {
  const bytes = b60, row = rowOptions[0].f;
  let rng = 0x33012026;
  const rand = () => {
    rng ^= rng << 13; rng ^= rng >>> 17; rng ^= rng << 5;
    return rng >>> 0;
  };
  const sigma = Array.from({length: 8}, () => {
    const a = Array.from({length: 29}, (_, i) => i);
    for (let j = 28; j > 0; j--) {
      const k = rand() % (j + 1);
      [a[k], a[j]] = [a[j], a[k]];
    }
    return a;
  });
  const inv = sigma.map(per => {
    const a = Array(29);
    per.forEach((v, i) => { a[v] = i; });
    return a;
  });
  const native = corpus.pages.find(p => p.page === 57).indices;
  assert.equal(native.length, 95);
  assert.equal(native[0], corpus.translit.indexOf('P'));
  const plain = source.map((_, i) => native[i % native.length]);
  const output = [];
  let i = 0;
  for (let q = 0; q < 8; q++) {
    let previous = 0; // explicit chapter start IV
    for (let k = 0; k < lengths[q]; k++, i++) {
      const secret = bytes[8 * row(previous) + q] % 29;
      const c = sigma[q][mod(plain[i] + secret)];
      assert.equal(mod(inv[q][c] - secret), plain[i]);
      output.push(c);
      previous = c;
    }
  }
  const bound = capacities(output, bytes, row, false, 1, false);
  const plainE = plain.filter(x => x === e).length;
  const plainEO = plain.filter(x => x === e || x === o).length;
  assert(bound.E >= plainE && bound.EO >= plainEO);
  assert.equal(output.length, 12956);
  return {length: output.length, E: plainE, EO: plainEO, maxE:bound.E,
    maxEO:bound.EO, exactRecovery:true};
}

const results = [];
for (const [radix, bytes] of [['60', b60], ['59', b59]])
  for (const rr of rowOptions)
    for (const [column, reflect] of [['forward', false], ['reflected', true]]) {
      const strict = capacities(source, bytes, rr.f, reflect, +1, false);
      const tolerant = capacities(source, bytes, rr.f, reflect, +1, true);
      const reversedSign = capacities(source, bytes, rr.f, reflect, -1, false);
      const reversedSignTolerant = capacities(source, bytes, rr.f, reflect, -1, true);
      assert.deepEqual([strict.E, strict.EO], [reversedSign.E, reversedSign.EO]);
      assert.deepEqual([tolerant.E, tolerant.EO],
                       [reversedSignTolerant.E, reversedSignTolerant.EO]);
      results.push({radix, row:rr.name, column, strict, tolerant});
    }
const maxOf = (kind, target) => Math.max(...results.map(r => r[kind][target]));
const maxima = {
  strictE:maxOf('strict','E'), strictEO:maxOf('strict','EO'),
  tolerantE:maxOf('tolerant','E'), tolerantEO:maxOf('tolerant','EO')
};
assert.deepEqual(maxima, {strictE:1061,strictEO:1771,tolerantE:1510,tolerantEO:2213});
assert(results.every(x => x.strict.free === 56 && x.tolerant.free === 512));
const plant = plantedControl();
console.log(JSON.stringify({sectionLengths:lengths,sourceRunes:source.length,
  sourcePages:firstPage.size, cases:results.length, maxima,
  solvedReference:{runes:2979,E:380,O:256,note:'Separate authenticated LP1/LP2 solved profile; not an inference from this decoder'},
  positive:plant, results},null,2));
