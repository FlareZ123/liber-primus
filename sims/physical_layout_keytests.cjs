'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const base = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(base, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const chunks = read('resources/transcriptions/liber_primus_master.txt').split('%');
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const ref = read('resources/liber-primus/lp1-plaintext-reference.txt');
const id = new Map(corpus.runes.map((r, i) => [r, i]));

/** @returns {Array<{page:number, text:number[], lines:number[][], starts:number[], ends:number[], red:boolean[]}>} */
function load() {
  const out = [];
  for (const entry of corpus.pages) {
    if (entry.page > 55 || !entry.indices.length) continue;
    const lines = chunks[entry.page + 16].split('/').map((s) =>
      [...s].filter((r) => id.has(r)).map((r) => id.get(r))
    ).filter((a) => a.length);
    assert.deepEqual(lines.flat(), entry.indices);
    let offset = 0;
    const starts = [], ends = [];
    for (const line of lines) {
      starts.push(offset);
      offset += line.length;
      ends.push(offset - 1);
    }
    const marks = new Set();
    for (const span of ink.pages.find((x) => x.page === entry.page)?.red_spans || [])
      for (let i = span.start; i < span.start + span.length; i++) marks.add(i);
    out.push({
      page: entry.page, text: entry.indices, lines, starts, ends,
      red: starts.map((i) => marks.has(i)),
    });
  }
  assert.equal(out.length, 55);
  assert.equal(out.reduce((s, p) => s + p.text.length, 0), 12956);
  assert.equal(out.reduce((s, p) => s + p.lines.length, 0), 594);
  return out;
}

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let x = seed >>> 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0; };
}

/** @param {number[]} a @param {number[]} e @returns {number} */
const chi = (a, e) => a.reduce((s, n, i) => s + (n - e[i]) ** 2 / e[i], 0);

/** @param {ReturnType<typeof load>} pages @param {number} trials */
function column0(pages, trials = 50000) {
  const E = Array(29).fill(0), EB = Array(29).fill(0);
  const O = Array(29).fill(0), Last = Array(29).fill(0), Black = Array(29).fill(0);
  for (const page of pages) {
    const freq = Array(29).fill(0);
    for (const v of page.text) freq[v]++;
    const bn = page.red.filter((v) => !v).length;
    for (let k = 0; k < 29; k++) {
      E[k] += freq[k] * page.starts.length / page.text.length;
      EB[k] += freq[k] * bn / page.text.length;
    }
    for (let k = 0; k < page.starts.length; k++) {
      const r = page.text[page.starts[k]];
      O[r]++;
      if (!page.red[k]) Black[r]++;
      Last[page.text[page.ends[k]]]++;
    }
  }
  const observed = [chi(O, E), chi(Last, E)], b = chi(Black, EB);
  assert(Math.abs(observed[0] - 78.29749431962246) < 1e-9);
  assert(Math.abs(observed[1] - 24.201916865943456) < 1e-9);
  assert(Math.abs(b - 73.90854042798482) < 1e-9);
  const random = rng(0x31e06a3b), ge = [0, 0, 0], mean = [0, 0];
  for (let t = 0; t < trials; t++) {
    const A = Array(29).fill(0), B = Array(29).fill(0);
    for (const page of pages) {
      const shift = random() % page.text.length;
      for (const k of page.starts) A[page.text[(k + shift) % page.text.length]]++;
      for (const k of page.ends) B[page.text[(k + shift) % page.text.length]]++;
    }
    const values = [chi(A, E), chi(B, E)];
    for (let k = 0; k < 2; k++) { ge[k] += Number(values[k] >= observed[k]); mean[k] += values[k]; }
    ge[2] += Number(Math.max(...values) >= Math.max(...observed));
  }
  return {
    lines: O.reduce((s, n) => s + n), observed, blackCount: Black.reduce((s, n) => s + n),
    blackChi: b, observedFrequency: O, expectedFrequency: E,
    nullMeans: mean.map((s) => s / trials), ge,
    p: ge.map((n) => (n + 1) / (trials + 1)), trials,
  };
}

/** @param {number[][]} A @param {number[][]} B @returns {{n:number,score:number,exact:number}} */
function symmetric(A, B) {
  const H = Array(29).fill(0);
  let n = 0;
  for (let y = 0; y < Math.min(A.length, B.length); y++) {
    for (let x = 0; x < Math.min(A[y].length, B[y].length); x++) {
      H[(A[y][x] - B[y][x] + 29) % 29]++;
      n++;
    }
  }
  const e = n / 29;
  let score = (H[0] - e) ** 2 / e;
  for (let k = 1; k < 15; k++) score += (H[k] + H[29 - k] - 2 * e) ** 2 / (2 * e);
  return { n, score, exact: H[0] };
}

/** @returns {number[]} */
function referenceCdf() {
  const latin = ref.replace(/^#.*$/gm, '').toUpperCase().replace(/[^A-Z]/g, '')
    .replace(/[KVQZ]/g, (r) => ({ K: 'C', V: 'U', Q: 'C', Z: 'S' })[r]);
  const tokens = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const count = Array(29).fill(0);
  let n = 0;
  for (let i = 0; i < latin.length;) {
    const t = tokens.find((x) => latin.startsWith(x.s, i));
    if (!t) { i++; continue; }
    count[t.i]++; n++; i += t.s.length;
  }
  assert.equal(n, 3528);
  let acc = 0;
  return count.map((x) => { acc += x / n; return acc; });
}

/** @param {ReturnType<typeof load>} pages @param {number} trials */
function rowColumnPad(pages, trials = 5000) {
  const A = pages.find((x) => x.page === 28);
  const B = pages.find((x) => x.page === 42);
  assert(A && B);
  const visual = symmetric(A.lines, B.lines), continuous = symmetric([A.text], [B.text]);
  const all = [];
  for (let i = 0; i < pages.length; i++)
    for (let j = i + 1; j < pages.length; j++)
      all.push(symmetric(pages[i].lines, pages[j].lines).score);
  const rank = all.filter((score) => score > visual.score).length + 1;
  assert.equal(all.length, 1485);
  assert.equal(visual.n, 259);
  assert(Math.abs(visual.score - 6.7027027027027035) < 1e-9);
  assert.equal(rank, 1402);
  assert(Math.abs(continuous.score - 65.20074349442378) < 1e-9);
  const rand = rng(0x7a992043), cdf = referenceCdf();
  const draw = () => { const u = rand() / 4294967296; return cdf.findIndex((x) => u < x); };
  const planted = [];
  for (const repair of [0, 81]) {
    const scores = [];
    for (let t = 0; t < trials; t++) {
      const C = A.lines.map((line) => new Array(line.length));
      const D = B.lines.map((line) => new Array(line.length));
      let lastC = -1, lastD = -1;
      for (let y = 0; y < Math.max(C.length, D.length); y++)
        for (let x = 0; x < Math.max(C[y]?.length || 0, D[y]?.length || 0); x++) {
          const key = rand() % 29;
          if (C[y] && x < C[y].length) {
            let v = (draw() + key) % 29;
            if (v === lastC && rand() % 100 < repair) v = (lastC + 1 + rand() % 28) % 29;
            C[y][x] = v; lastC = v;
          }
          if (D[y] && x < D[y].length) {
            let v = (draw() + key) % 29;
            if (v === lastD && rand() % 100 < repair) v = (lastD + 1 + rand() % 28) % 29;
            D[y][x] = v; lastD = v;
          }
        }
      scores.push(symmetric(C, D).score);
    }
    const atMostReal = scores.filter((v) => v <= visual.score).length;
    planted.push({
      repair, mean: scores.reduce((s, x) => s + x, 0) / trials,
      atMostReal, p: (atMostReal + 1) / (trials + 1),
    });
  }
  return { visual, continuous, rank, totalPairs: all.length, planted, trials };
}

function main() {
  const pages = load();
  process.stdout.write(JSON.stringify({
    firstColumn: column0(pages), samePrintedCoordinate: rowColumnPad(pages),
  }, null, 2) + '\n');
}

if (require.main === module) main();
module.exports = { load, column0, symmetric, rowColumnPad };
