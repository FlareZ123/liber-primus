#!/usr/bin/env node
'use strict';

// Reproduce the source-dimension 8/16/32 table-key screen.
// Run from the repository root: node sims/lp2_three_block_table_key_gate.cjs
// No external packages are required.

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(read(p));

const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const quadCounts = new Map();
let quadTotal = 0;

for (const line of read('resources/control/dukotah_english_quadgrams.txt').trim().split(/\r?\n/)) {
  const [gram, rawCount] = line.trim().split(/\s+/);
  const count = Number(rawCount);
  if (/^[A-Z]{4}$/.test(gram) && Number.isFinite(count)) {
    quadCounts.set(gram, count);
    quadTotal += count;
  }
}

const mod29 = (n) => ((n % 29) + 29) % 29;
const cells = grid.pages.flatMap((p) => p.tokens).map((token) => {
  const a = grid.alphabet.indexOf(token[0]);
  const b = grid.alphabet.indexOf(token[1]);
  if (a < 0 || b < 0) throw new Error('Unrecognized base-60 table token: ' + token);
  return a * 60 + b;
});

if (cells.length !== 256) throw new Error('Expected 256 table cells, got ' + cells.length);
if (Math.min(...cells) !== 0 || Math.max(...cells) !== 255) {
  throw new Error('Expected the printed base-60 tokens to encode byte values 0..255');
}
const table = Array.from({ length: 32 }, (_, r) => cells.slice(r * 8, (r + 1) * 8));

function scoreTexts(texts) {
  let score = 0;
  let hits = 0;
  let n = 0;
  for (const text of texts) {
    const letters = text.replace(/[^A-Z]/g, '');
    for (let i = 0; i + 3 < letters.length; i++) {
      const count = quadCounts.get(letters.slice(i, i + 4)) || 0;
      score += Math.log((count + 0.1) / (quadTotal + 0.1 * quadCounts.size));
      if (count) hits++;
      n++;
    }
  }
  return { meanLog: n ? score / n : null, hits, quadgrams: n };
}

function decodePage(page, key, sign) {
  if (!key.length) throw new Error('Empty key');
  return page.indices.map((cipher, i) => corpus.translit[mod29(cipher + sign * key[i % key.length])]).join('');
}

function blockStats(start, end) {
  const pages = corpus.pages.slice(start, end);
  let runes = 0;
  let equalPairs = 0;
  let adjacentPositions = 0;
  for (const page of pages) {
    const a = page.indices;
    runes += a.length;
    if (a.length) adjacentPositions += a.length - 1;
    for (let i = 1; i < a.length; i++) if (a[i] === a[i - 1]) equalPairs++;
  }
  return {
    pages: [start, end - 1],
    pageCount: end - start,
    runeBearingPages: pages.filter((p) => p.indices.length > 0).length,
    runes,
    samePageAdjacentPositions: adjacentPositions,
    equalPairs,
    equalPairRate: equalPairs / adjacentPositions
  };
}

function best(candidates) {
  candidates.sort((a, b) => b.score.meanLog - a.score.meanLog);
  return candidates[0];
}

const blocks = [
  { name: '8-page block', start: 0, end: 8 },
  { name: '16-page block', start: 8, end: 24 },
  { name: '32-page block', start: 24, end: 56 }
];
const stats = blocks.map((b) => ({ name: b.name, ...blockStats(b.start, b.end) }));

// Block 1: read each of the table's eight columns as a 32-symbol page key.
const block1Candidates = [];
for (const reverseRows of [false, true]) {
  for (const reverseColumns of [false, true]) {
    for (const sign of [-1, 1]) {
      const texts = [];
      for (let pageOffset = 0; pageOffset < 8; pageOffset++) {
        const column = reverseColumns ? 7 - pageOffset : pageOffset;
        const key = Array.from({ length: 32 }, (_, r) =>
          mod29(table[reverseRows ? 31 - r : r][column]));
        texts.push(decodePage(corpus.pages[pageOffset], key, sign));
      }
      block1Candidates.push({ reverseRows, reverseColumns, sign, score: scoreTexts(texts), sample: texts[0].slice(0, 180) });
    }
  }
}

// Block 2: split 32x8 into two 16x8 halves, fold to 16x16, and use rows as page keys.
// Enumerate only the elementary mirror/half-order choices.
const block2Candidates = [];
for (const flipRows of [false, true]) {
  for (const flipColumns of [false, true]) {
    for (const swapHalves of [false, true]) {
      for (const reverseFoldedRows of [false, true]) {
        for (const sign of [-1, 1]) {
          const top = table.slice(0, 16).map((row) => row.map(mod29));
          let bottom = table.slice(16).map((row) => row.map(mod29));
          if (flipRows) bottom.reverse();
          if (flipColumns) bottom = bottom.map((row) => row.slice().reverse());
          let folded = top.map((row, i) => row.concat(bottom[i]));
          if (swapHalves) folded = folded.map((row) => row.slice(8).concat(row.slice(0, 8)));
          if (reverseFoldedRows) folded.reverse();
          const texts = corpus.pages.slice(8, 24).map((page, i) => decodePage(page, folded[i], sign));
          block2Candidates.push({
            flipRows, flipColumns, swapHalves, reverseFoldedRows, sign,
            score: scoreTexts(texts), sample: texts[0].slice(0, 180)
          });
        }
      }
    }
  }
}

// Block 3: read each of the table's 32 rows as an eight-symbol page key.
const block3Candidates = [];
for (const reverseRows of [false, true]) {
  for (const reverseColumns of [false, true]) {
    for (const sign of [-1, 1]) {
      const texts = [];
      for (let pageOffset = 0; pageOffset < 32; pageOffset++) {
        let key = table[reverseRows ? 31 - pageOffset : pageOffset].map(mod29);
        if (reverseColumns) key = key.slice().reverse();
        texts.push(decodePage(corpus.pages[24 + pageOffset], key, sign));
      }
      block3Candidates.push({ reverseRows, reverseColumns, sign, score: scoreTexts(texts), sample: texts[0].slice(0, 180) });
    }
  }
}

const rawScores = [
  scoreTexts(corpus.pages.slice(0, 8).map((p) => p.indices.map((i) => corpus.translit[i]).join(''))),
  scoreTexts(corpus.pages.slice(8, 24).map((p) => p.indices.map((i) => corpus.translit[i]).join(''))),
  scoreTexts(corpus.pages.slice(24, 56).map((p) => p.indices.map((i) => corpus.translit[i]).join('')))
];

const output = {
  markerPages: [7, 23, 56],
  pageNumberSum: 7 + 23 + 56,
  pageBlocks: stats,
  total: {
    runes: stats.reduce((n, b) => n + b.runes, 0),
    equalPairs: stats.reduce((n, b) => n + b.equalPairs, 0),
    samePageAdjacentPositions: stats.reduce((n, b) => n + b.samePageAdjacentPositions, 0)
  },
  table: {
    sourcePages: grid.pages.map((p) => p.page),
    rows: table.length,
    columns: table[0].length,
    cells: cells.length,
    minimum: Math.min(...cells),
    maximum: Math.max(...cells),
    foldShape: '16x16'
  },
  directAdditiveKeyScreen: {
    languageModel: 'resources/control/dukotah_english_quadgrams.txt',
    note: 'Mean log quadgram likelihood is a rough screen only; inspect samples before interpreting a score.',
    blocks: [
      { name: blocks[0].name, raw: rawScores[0], best: best(block1Candidates) },
      { name: blocks[1].name, raw: rawScores[1], best: best(block2Candidates) },
      { name: blocks[2].name, raw: rawScores[2], best: best(block3Candidates) }
    ]
  }
};

console.log(JSON.stringify(output, null, 2));
