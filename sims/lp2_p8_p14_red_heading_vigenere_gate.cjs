#!/usr/bin/env node
'use strict';

// One frozen hypothesis: p8's visible 12-rune red span is a repeating GP29
// Vigenere key for the body of the p8-p14 section. No parameter search.

const fs = require('node:fs');

const read = (p) => fs.readFileSync(p, 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const lp1Reference = read('resources/liber-primus/lp1-plaintext-reference.txt');

const page = (n) => corpus.pages.find((p) => p.page === n);
const inkPage = (n) => ink.pages.find((p) => p.page === n);
const red = inkPage(8)?.red_spans?.[0];
if (!red || red.start !== 0 || red.length !== 12) {
  throw new Error('Expected exactly the source-annotated 12-rune red span at p8 offset 0');
}
const terminal = inkPage(14)?.large_punctuation?.some(
  ([offset, dots, color]) => offset === 137 && dots === 13 && color === 'red'
);
if (!terminal) throw new Error('Expected p14 terminal red 13-dot mark at rune offset 137');

const key = Array.from(red.runes, (r) => corpus.runes.indexOf(r));
if (key.length !== 12 || key.some((x) => x < 0)) throw new Error('Invalid GP29 key');
const sourcePages = [];
for (let n = 8; n <= 14; n += 1) {
  const p = page(n);
  if (!p) throw new Error('Missing canonical page ' + n);
  sourcePages.push({
    page: n,
    values: n === 8 ? p.indices.slice(red.start + red.length) : p.indices.slice(),
    fullCount: p.runic_count,
  });
}

const decodedPages = [];
let clock = 0;
for (const p of sourcePages) {
  const decoded = p.values.map((c) => {
    const plain = (c - key[clock % key.length] + 29) % 29;
    clock += 1;
    return plain;
  });
  decodedPages.push({ page: p.page, values: decoded });
}
const source = sourcePages.flatMap((p) => p.values);
const decoded = decodedPages.flatMap((p) => p.values);
const reencrypted = decoded.map((p, i) => (p + key[i % key.length]) % 29);
const exactReencrypt = reencrypted.length === source.length &&
  reencrypted.every((value, i) => value === source[i]);

const latin = (values) => values.map((i) => corpus.translit[i]).join('');
const lp1Only = lp1Reference.split(/^### 56\s*$/m)[0];
const reference = lp1Only
  .split(/\r?\n/)
  .filter((line) => line.trim() &&
    !line.trim().startsWith('#') &&
    !line.trim().startsWith('[') &&
    !/^\d/.test(line.trim()))
  .join(' ')
  .toUpperCase()
  .replace(/[^A-Z]/g, '');

const counts = Array.from({ length: 26 }, () => Array(26).fill(0));
const totals = Array(26).fill(0);
for (let i = 1; i < reference.length; i += 1) {
  const a = reference.charCodeAt(i - 1) - 65;
  const b = reference.charCodeAt(i) - 65;
  counts[a][b] += 1;
  totals[a] += 1;
}
function bigramLogScore(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, '');
  let total = 0;
  let n = 0;
  for (let i = 1; i < s.length; i += 1) {
    const a = s.charCodeAt(i - 1) - 65;
    const b = s.charCodeAt(i) - 65;
    total += Math.log((counts[a][b] + 1) / (totals[a] + 26));
    n += 1;
  }
  return total / n;
}

const p57 = page(57);
if (!p57) throw new Error('Missing clear p57 control');
const p57Text = latin(p57.indices);
const bodyTraining = decodedPages.filter((p) => p.page <= 12).flatMap((p) => p.values);
const bodyHoldout = decodedPages.filter((p) => p.page >= 13).flatMap((p) => p.values);
const runeBlocks = transcription.split(/^\s*%\s*$/m);
const lineCounts = runeBlocks.slice(8, 15).map((block) =>
  block.split(/\r?\n/).filter((line) => line.trim() && line.trim() !== '&').length
);

const result = {
  hypothesis: 'p8 red 12-rune span as repeating GP29 Vigenere key; continuous p8-p14 clock',
  keyRunes: red.runes,
  keyIndices: key,
  pageRunes: sourcePages.map((p) => ({ page: p.page, bodyRunes: p.values.length, fullRunes: p.fullCount })),
  printedLineCounts: lineCounts,
  bodyRunes: source.length,
  referenceLetters: reference.length,
  scores: {
    originalBody: bigramLogScore(latin(source)),
    decodedBody: bigramLogScore(latin(decoded)),
    decodedTrainingP8P12: bigramLogScore(latin(bodyTraining)),
    decodedHoldoutP13P14: bigramLogScore(latin(bodyHoldout)),
    clearP57HoldoutControl: bigramLogScore(p57Text),
  },
  exactForwardReencryption: exactReencrypt,
  decodedPrefix: latin(decoded).slice(0, 140),
};
console.log(JSON.stringify(result, null, 2));
if (!exactReencrypt) process.exitCode = 1;
