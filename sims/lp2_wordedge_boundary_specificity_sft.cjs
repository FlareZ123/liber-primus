"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");
const sections = transcription.split("%").slice(0, 55);
assert.equal(sections.length, 55);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const pages = Array.from({length: 55}, () => []);
const words = [];
let page = 0, word = 0, current = [];
function flushWord() {
  if (!current.length) return;
  words.push([current[0].page, current.at(-1).page]);
  current = [];
  word++;
}
for (const ch of sections.join("%")) {
  if (runeIndex.has(ch)) {
    const item = {rune: runeIndex.get(ch), page, word};
    current.push(item);
    pages[page].push(item);
  } else if (ch === "%") page++;
  else if (ch === "/" || /\s/u.test(ch)) { /* visual wrap */ }
  else flushWord();
}
flushWord();

const carried = words.filter(([first, last]) => first !== last).length;
const stats = pages.map(runes => {
  const s = {n: 0, k: 0, b: 0, be: 0, w: 0, we: 0};
  for (let i = 1; i < runes.length; i++) {
    const a = runes[i - 1], z = runes[i], eq = a.rune === z.rune;
    s.n++; if (eq) s.k++;
    if (a.word === z.word) { s.w++; if (eq) s.we++; }
    else { s.b++; if (eq) s.be++; }
  }
  return s;
});
const totals = stats.reduce((a, s) => {
  for (const k of Object.keys(a)) a[k] += s[k];
  return a;
}, {n: 0, k: 0, b: 0, be: 0, w: 0, we: 0});

const flat = pages.flat();
const edges = {n: 0, k: 0, carry: 0, carryK: 0, word: 0, wordK: 0};
for (let i = 1; i < flat.length; i++) {
  const a = flat[i - 1], z = flat[i];
  if (a.page === z.page) continue;
  const eq = a.rune === z.rune;
  edges.n++; if (eq) edges.k++;
  if (a.word === z.word) { edges.carry++; if (eq) edges.carryK++; }
  else { edges.word++; if (eq) edges.wordK++; }
}
assert.equal(flat.length, 12956);
assert.equal(words.length, 2896);
assert.equal(carried, 32);
assert.deepEqual(totals, {n: 12901, k: 86, b: 2873, be: 23, w: 10028, we: 63});
assert.deepEqual(edges, {n: 54, k: 0, carry: 32, carryK: 0, word: 22, wordK: 0});

// Conditional null: on each page, distribute its k observed repeat events
// uniformly among n same-page transitions; b positions are word boundaries.
const maxN = Math.max(...stats.map(s => s.n));
const logF = [0];
for (let i = 1; i <= maxN; i++) logF[i] = logF[i - 1] + Math.log(i);
const logC = (n, k) => k < 0 || k > n ? -Infinity : logF[n] - logF[k] - logF[n-k];
let dist = [1], offset = 0, mean = 0, variance = 0;
for (const s of stats) {
  const lo = Math.max(0, s.b - (s.n - s.k));
  const hi = Math.min(s.k, s.b);
  const pmf = [];
  for (let x = lo; x <= hi; x++) {
    pmf.push(Math.exp(logC(s.k, x) + logC(s.n - s.k, s.b - x) - logC(s.n, s.b)));
  }
  const next = Array(dist.length + pmf.length - 1).fill(0);
  for (let i = 0; i < dist.length; i++)
    for (let j = 0; j < pmf.length; j++) next[i + j] += dist[i] * pmf[j];
  dist = next; offset += lo;
  if (s.n) {
    const q = s.k / s.n;
    mean += s.b * q;
    if (s.n > 1) variance += s.b * q * (1 - q) * (s.n - s.b) / (s.n - 1);
  }
}
const observed = totals.be, index = observed - offset, pObserved = dist[index];
const upper = dist.slice(index).reduce((a, b) => a + b, 0);
const twoSided = dist.reduce((a, p) => a + (p <= pObserved + 1e-15 ? p : 0), 0);
const sd = Math.sqrt(variance);
assert.ok(Math.abs(mean - 18.972540096305156) < 1e-10);
assert.ok(Math.abs(sd - 3.8286885676054485) < 1e-10);
assert.ok(Math.abs(upper - 0.17735404489082907) < 1e-10);
assert.ok(Math.abs(twoSided - 0.2965366821625493) < 1e-10);

console.log(JSON.stringify({
  source: {runes: flat.length, words: words.length, carriedWords: carried, runeBearingPages: pages.length},
  withinPage: {
    transitions: totals.n, equalities: totals.k,
    wordEdges: totals.b, wordEdgeEqualities: totals.be,
    withinWord: totals.w, withinWordEqualities: totals.we,
    wordEdgeRate: totals.be / totals.b, withinWordRate: totals.we / totals.w
  },
  physicalPageEdges: edges,
  pageStratifiedNull: {
    expectedWordEdgeEqualities: mean, sd,
    upperTailP: upper, twoSidedProbabilityOrderingP: twoSided
  }
}, null, 2));
