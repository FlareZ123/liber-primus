#!/usr/bin/env node
'use strict';

// Apply the solved-parable 55-step Josephus sequence to the printed 32x8 token table's
// 180-cell interior (the printed layout is visible; byte conversion remains a base60-versus-radix59 hypothesis). Test the resulting per-page prime-totient starts and
// direct additive-key readings. Run from repository root.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const read = (p) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const english = read('resources/control/shakespeare_first300k.txt');
const bytes = grid.pages.flatMap((p) => p.bytes);
const N = 31, START = 29, END = 30;
const alphabet = corpus.translit;
const glyphIndex = new Map(corpus.runes.map((g, i) => [g, i]));
const tokenIndex = new Map(alphabet.map((g, i) => [g, i]));
const mod = (x, n = 29) => ((x % n) + n) % n;

function encodeWord(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const pair = s.slice(i, i + 2);
    if (tokenIndex.has(pair)) { out.push(tokenIndex.get(pair)); i += 2; }
    else { if (tokenIndex.has(s[i])) out.push(tokenIndex.get(s[i])); i += 1; }
  }
  return out;
}

function trainBigram(text) {
  const counts = new Float64Array(N * N), totals = new Float64Array(N), unigram = new Float64Array(N);
  for (const word of (text.slice(0, 240000).match(/[A-Za-z]+/g) || [])) {
    let previous = START;
    for (const current of [...encodeWord(word), END]) {
      counts[previous * N + current] += 1;
      totals[previous] += 1;
      unigram[current] += 1;
      previous = current;
    }
  }
  const total = unigram.reduce((a, b) => a + b, 0);
  const prior = Float64Array.from(unigram, (x) => (x + 1) / (total + N));
  const lm = new Float64Array(N * N);
  for (let p = 0; p < N; p++) for (let c = 0; c < N; c++)
    lm[p * N + c] = Math.log((counts[p * N + c] + 5 * prior[c]) / (totals[p] + 5));
  return lm;
}

function parsePages() {
  const segments = transcription.split('%');
  const pageNumbers = [...Array(50).keys(), ...Array.from({ length: 7 }, (_, i) => 51 + i)];
  const pages = new Map();
  let activeWord = false, last = null;
  for (const pageNo of pageNumbers) {
    const raw = segments[pageNo >= 51 ? pageNo - 1 : pageNo];
    const d = { C: [], starts: [], ends: [] };
    pages.set(pageNo, d);
    for (const ch of raw) {
      if (glyphIndex.has(ch)) {
        d.C.push(glyphIndex.get(ch));
        d.starts.push(!activeWord);
        d.ends.push(false);
        activeWord = true;
        last = { d, index: d.C.length - 1 };
      } else if ('-.$&§'.includes(ch)) {
        if (last) last.d.ends[last.index] = true;
        activeWord = false;
        last = null;
      }
    }
  }
  if (last) last.d.ends[last.index] = true;
  for (const [pageNo, d] of pages) {
    const source = corpus.pages.find((p) => p.page === pageNo);
    assert.ok(source, 'missing corpus page ' + pageNo);
    assert.deepEqual(d.C, source.indices, 'transcription/corpus mismatch on p' + pageNo);
  }
  return pages;
}

function josephus(count, steps) {
  const remaining = Array.from({ length: count }, (_, i) => i);
  const removed = [];
  let cursor = 0;
  for (const step of steps) {
    const index = (cursor + step - 1) % remaining.length;
    removed.push(remaining.splice(index, 1)[0]);
    cursor = index % remaining.length;
  }
  return { removed, remaining };
}

function decodePage(pageNo, start, pages, key, lm) {
  const d = pages.get(pageNo), n = d.C.length;
  if (start < 0) return { ok: false, page: pageNo, start, failedAt: 0 };
  const keyOf = (k, p) => k * 31 + p;
  const unkey = (id) => ({ k: Math.floor(id / 31), p: id % 31 });
  let states = new Map([[keyOf(0, START), { score: 0, prev: null, plain: null, kind: null }]]);
  const layers = [];
  for (let i = 0; i < n; i++) {
    const next = new Map(), cipher = d.C[i];
    const add = (k, p, previous, plain, kind, delta) => {
      const id = keyOf(k, p), score = previous.score + delta, old = next.get(id);
      if (!old || score > old.score) next.set(id, { score, prev: previous.id, plain, kind });
    };
    for (const [id, state] of states) {
      const { k, p: previousPlain } = unkey(id);
      state.id = id;
      const scoreFor = (plain) => {
        if (i === 0 && !d.starts[i]) return d.ends[i] ? lm[plain * N + END] : 0;
        const previous = d.starts[i] ? START : previousPlain;
        return lm[previous * N + plain] + (d.ends[i] ? lm[plain * N + END] : 0);
      };
      if (cipher === 0) add(k, 0, state, 0, 'literal-F', scoreFor(0));
      if (k < key.length - start) {
        const plain = mod(cipher - key[start + k]);
        if (plain !== 0) add(k + 1, plain, state, plain, 'keyed', scoreFor(plain));
      }
    }
    layers.push(next);
    states = next;
    if (!states.size) return { ok: false, page: pageNo, start, failedAt: i };
  }
  let best = -Infinity, bestId = null;
  for (const [id, state] of states) if (state.score > best) { best = state.score; bestId = id; }
  const plain = new Array(n), kinds = new Array(n);
  let id = bestId;
  for (let i = n - 1; i >= 0; i--) {
    const state = layers[i].get(id);
    plain[i] = state.plain;
    kinds[i] = state.kind;
    id = state.prev;
  }
  let preview = '';
  for (let i = 0; i < n; i++) {
    if (d.starts[i] && i) preview += ' ';
    preview += alphabet[plain[i]];
  }
  const events = n - (d.starts[0] ? 0 : 1) + d.ends.filter(Boolean).length;
  return {
    ok: true, page: pageNo, start, n, score: best, events,
    scorePerRune: best / n, scorePerEvent: best / events,
    fBypass: kinds.filter((x) => x === 'literal-F').length,
    preview, plain,
  };
}

const pages = parsePages();
const lm = trainBigram(english);
const parableRaw = transcription.split('%')[56];
const words = [];
let word = '';
for (const ch of parableRaw) {
  if (glyphIndex.has(ch)) word += ch;
  else if ('-.$&§'.includes(ch)) { if (word) words.push(word); word = ''; }
}
if (word) words.push(word);
const interiorRunes = words.flatMap((w) => Array.from(w, (g) => glyphIndex.get(g)).slice(1, -1));
const steps = interiorRunes.map((i) => corpus.prime[i] - 1);
assert.equal(words.length, 20);
assert.equal(interiorRunes.length, 55);
assert.equal(steps.reduce((a, b) => a + b, 0), 1952);

const pageWalk = josephus(56, steps);
const innerWalk = josephus(180, steps);
assert.deepEqual(pageWalk.remaining, [50]);
assert.equal(innerWalk.removed.length, 55);
assert.equal(innerWalk.remaining.length, 125);

const innerRow = [];
for (let r = 1; r <= 30; r++) for (let c = 1; c <= 6; c++) innerRow.push(bytes[r * 8 + c]);
const innerColumn = [];
for (let c = 1; c <= 6; c++) for (let r = 1; r <= 30; r++) innerColumn.push(bytes[r * 8 + c]);
assert.equal(innerRow.length, 180);

function primeTotientStream(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate++) {
    let prime = true;
    for (let d = 2; d * d <= candidate; d++) if (candidate % d === 0) { prime = false; break; }
    if (prime) out.push(mod(candidate - 1));
  }
  return out;
}
const key = primeTotientStream(6000);

const p56Expected = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
  .split(' ').flatMap(encodeWord);
const p56Control = decodePage(56, 0, pages, key, lm);
assert.ok(p56Control.ok);
assert.deepEqual(p56Control.plain, p56Expected, 'known p56 positive control must recover exactly');

const scheduleVariants = [];
for (const layout of ['row-major', 'column-major']) {
  const values = layout === 'row-major' ? innerRow : innerColumn;
  for (const reverse of [false, true]) {
    for (const offset of [0, 1]) {
      const selected = innerWalk.removed.map((i) => values[i]);
      if (reverse) selected.reverse();
      const startsByPage = new Map();
      for (let i = 0; i < 55; i++) startsByPage.set(pageWalk.removed[i], selected[i] - offset);
      const results = pageWalk.removed.map((pageNo) => decodePage(pageNo, startsByPage.get(pageNo), pages, key, lm));
      const valid = results.filter((x) => x.ok);
      const failed = results.filter((x) => !x.ok);
      scheduleVariants.push({
        layout, reverse, oneBased: offset === 1,
        validPages: valid.length, failedPages: failed.map((x) => x.page),
        bestValid: valid.slice().sort((a, b) => b.scorePerRune - a.scorePerRune).slice(0, 3)
          .map((x) => ({ page: x.page, start: x.start, scorePerRune: x.scorePerRune, preview: x.preview.slice(0, 140) })),
      });
    }
  }
}

const p55 = pages.get(55);
const directKeyTests = [];
for (const source of ['survivors', 'removed']) {
  const positions = source === 'survivors' ? innerWalk.remaining : innerWalk.removed;
  for (const layout of ['row-major', 'column-major']) {
    const values = layout === 'row-major' ? innerRow : innerColumn;
    for (const mapping of [
      { name: 'mod29', convert: (b) => b % 29 },
      { name: 'scaled29', convert: (b) => Math.floor(b * 29 / 256) },
    ]) {
      const mapped = values.map(mapping.convert);
      const keyValues = positions.map((i) => mapped[i]);
      for (const reverse of [false, true]) {
        const K = reverse ? keyValues.slice().reverse() : keyValues;
        for (const sign of [-1, 1]) {
          const plain = p55.C.map((c, i) => mod(c + sign * K[i % K.length]));
          let score = 0;
          for (let i = 0; i < plain.length; i++) {
            if (i === 0 && !p55.starts[i]) {
              if (p55.ends[i]) score += lm[plain[i] * N + END];
              continue;
            }
            const previous = p55.starts[i] ? START : plain[i - 1];
            score += lm[previous * N + plain[i]];
            if (p55.ends[i]) score += lm[plain[i] * N + END];
          }
          const events = p55.C.length - (p55.starts[0] ? 0 : 1) + p55.ends.filter(Boolean).length;
          let preview = '~' + alphabet[plain[0]] + ' | ';
          for (let i = 1; i < plain.length; i++) {
            if (p55.starts[i]) preview += ' ';
            preview += alphabet[plain[i]];
          }
          directKeyTests.push({ source, layout, mapping: mapping.name, reverse, sign, scorePerEvent: score / events, preview });
        }
      }
    }
  }
}
directKeyTests.sort((a, b) => b.scorePerEvent - a.scorePerEvent);

console.log(JSON.stringify({
  parable: { words: words.length, interiorRunes: interiorRunes.length, stepSum: steps.reduce((a, b) => a + b, 0) },
  pageJosephus: { removed: pageWalk.removed, survivor: pageWalk.remaining },
  innerJosephus: { cells: innerRow.length, removed: innerWalk.removed, remaining: innerWalk.remaining.length },
  p56PositiveControl: { exact: true, plaintextRunes: p56Control.plain.length, literalFBypasses: p56Control.fBypass, scorePerEvent: p56Control.scorePerEvent },
  pageStartScheduleVariants: scheduleVariants,
  bestValidPageCount: Math.max(...scheduleVariants.map((x) => x.validPages)),
  directKeyVariantCount: directKeyTests.length,
  bestDirectP55Key: directKeyTests[0],
  conclusion: 'The explicit inner-180 Josephus byte-to-page-start schedule and direct additive-key readings do not produce plaintext. The p56 F-transparent positive control is exact. This rejects only these specified consumers of the inner grid.',
}, null, 2));
