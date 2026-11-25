#!/usr/bin/env node
'use strict';

// Test the source-motivated "remove phone-number zeros" key hypothesis.
// The p40-p55 frame has eight filled/two hollow dots; the historical 2012
// number 2143909608 therefore gives the eight-symbol key 21439968.
// Decrypt with the p56 plaintext-F-transparent clock, without key tuning.

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const src = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const lexText = read('resources/control/english_wordfreq_textblob.txt');
const Q = 29, mod = x => ((x % Q) + Q) % Q;
const check = (v, m) => { if (!v) throw new Error(m); };

const runeMap = new Map(src.runes.map((r, i) => [r, i]));
const all = [], words = [];
let lo = 0;
for (const ch of transcript) {
  if (all.length === 12956) break;
  if (runeMap.has(ch)) all.push(runeMap.get(ch));
  else if (ch !== '/' && ch !== '%' && !/\s/.test(ch) && all.length > lo) {
    words.push([lo, all.length]);
    lo = all.length;
  }
}
if (lo < all.length) words.push([lo, all.length]);
check(all.length === 12956 && words.length === 2896, 'corpus parse counts');
check(
  all.join(',') === src.pages.slice(0, 56).flatMap(p => p.indices).join(','),
  'transcription/corpus mismatch'
);

let offset = 0;
const pages = [];
for (const p of src.pages.slice(0, 56)) {
  const spans = words
    .filter(([a, b]) => a >= offset && b <= offset + p.indices.length)
    .map(([a, b]) => [a - offset, b - offset]);
  pages.push({ page: p.page, c: p.indices, spans });
  offset += p.indices.length;
}
const target = pages.filter(p => p.page >= 40 && p.page <= 55);
check(target.length === 16, 'p40-p55 scope');
const tokens = src.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);

function gp(s) {
  s = s.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  while (s.length) {
    const t = tokens.find(t => s.startsWith(t.s));
    if (!t) return null;
    out.push(t.i);
    s = s.slice(t.s.length);
  }
  return out;
}
const lex = new Set();
for (const line of lexText.split(/\r?\n/)) {
  const m = line.match(/^([a-z]+)\s+\d+$/);
  if (!m) continue;
  const a = gp(m[1]);
  if (a && a.length < 20) lex.add(a.join(','));
}

function options(c, key, phase) {
  const out = [];
  if (c === 0) out.push([0, phase]); // plaintext F: transparent, no key advance
  const p = mod(c - key[phase]);
  if (p !== 0) out.push([p, (phase + 1) % key.length]);
  return out;
}
function reach(streamPages, key, startPhase, resetEachPage) {
  let states = new Set([startPhase]);
  for (const page of streamPages) {
    if (resetEachPage) states = new Set([startPhase]);
    for (let i = 0; i < page.c.length; i++) {
      const next = new Set();
      for (const phase of states)
        for (const [, nextPhase] of options(page.c[i], key, phase))
          next.add(nextPhase);
      if (!next.size) return { full: false, failedPage: page.page, failedOffset: i };
      states = next;
    }
  }
  return { full: true, endPhases: [...states].sort((a, b) => a - b) };
}
function ioc(a) {
  const h = Array(29).fill(0);
  for (const x of a) h[x]++;
  return h.reduce((v, n) => v + n * (n - 1), 0) / (a.length * (a.length - 1));
}
function best(c, spans, key, startPhase) {
  const chunks = [];
  let at = 0;
  for (const [a, b] of spans) {
    if (a > at) chunks.push([at, a, false]);
    chunks.push([a, b, true]);
    at = b;
  }
  if (at < c.length) chunks.push([at, c.length, false]);

  let states = new Map([[startPhase, { score: 0, p: [], start: startPhase }]]);
  for (const [a, b, scored] of chunks) {
    const next = new Map();
    for (const [phase, old] of states) {
      function visit(i, q, part) {
        if (i === b) {
          const score = old.score + (scored && lex.has(part.join(',')) ? 1 : 0);
          const current = next.get(q);
          if (!current || score > current.score)
            next.set(q, { score, p: old.p.concat(part), start: old.start });
          return;
        }
        for (const [v, r] of options(c[i], key, q)) visit(i + 1, r, part.concat(v));
      }
      visit(a, phase, []);
    }
    states = next;
    if (!states.size) return null;
  }
  const result = [...states.values()].sort((a, b) => b.score - a.score)[0];
  let phase = result.start;
  const replay = result.p.map(x => {
    if (x === 0) return 0;
    const y = mod(x + key[phase]);
    phase = (phase + 1) % key.length;
    return y;
  });
  check(replay.join(',') === c.join(','), 'forward replay');
  return {
    score: result.score,
    ioc: ioc(result.p),
    endPhase: result.p.reduce((q, x) => x === 0 ? q : (q + 1) % key.length, startPhase),
    opening: result.p.slice(0, 48).map(x => src.translit[x]).join(' ')
  };
}

const cAll = target.flatMap(p => p.c);
const spansAll = [];
let pageOffset = 0;
for (const p of target) {
  for (const [a, b] of p.spans) spansAll.push([pageOffset + a, pageOffset + b]);
  pageOffset += p.c.length;
}
const keys = [
  { name: 'forward', values: [2, 1, 4, 3, 9, 9, 6, 8] },
  { name: 'right-to-left', values: [8, 6, 9, 9, 3, 4, 1, 2] }
];
const results = [];
for (const item of keys) {
  const continuous = [], pageReset = [];
  for (let phase = 0; phase < 8; phase++) {
    continuous.push({
      phase,
      reach: reach(target, item.values, phase, false),
      best: best(cAll, spansAll, item.values, phase)
    });
    let score = 0, validPages = 0, failedPages = [], pageScores = [];
    for (const page of target) {
      if (!page.c.length) continue;
      const r = best(page.c, page.spans, item.values, phase);
      if (!r) failedPages.push(page.page);
      else {
        validPages++;
        score += r.score;
        pageScores.push({ page: page.page, score: r.score, ioc: r.ioc });
      }
    }
    pageReset.push({ phase, score, validPages, failedPages, pageScores });
  }
  results.push({ key: item.name, values: item.values, continuous, pageReset });
}
console.log(JSON.stringify({
  source: {
    historicalPhoneNumber: '2143909608',
    dotMask: '1111101101',
    rule: 'omit the two zero digits at hollow-dot positions; apply the remaining eight numeric offsets',
    plaintextF: 'transparent and does not advance the key'
  },
  scope: { pages: target.map(p => p.page), runeCount: cAll.length, wordCount: target.reduce((n, p) => n + p.spans.length, 0), lexiconSize: lex.size },
  results
}, null, 2));
