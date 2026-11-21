#!/usr/bin/env node
'use strict';

// One frozen source-aligned candidate: p8's red 12-rune heading ranks the
// 12 columns of the following p8-p14 body. No parameter fitting or search.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const lp1Reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const page = (n) => corpus.pages.find((p) => p.page === n);
const inkPage = (n) => ink.pages.find((p) => p.page === n);

const red = inkPage(8)?.red_spans?.[0];
assert.ok(red && red.start === 0 && red.length === 12,
  'expected p8 red 12-rune heading at offset 0');
const terminal = inkPage(14)?.large_punctuation?.some(
  ([offset, dots, color]) => offset === 137 && dots === 13 && color === 'red'
);
assert.ok(terminal, 'expected p14 terminal red 13-dot mark');

const key = Array.from(red.runes, (r) => corpus.runes.indexOf(r));
assert.equal(key.length, 12);
assert.ok(key.every((v) => v >= 0), 'invalid GP29 key');
const sourcePages = [];
for (let n = 8; n <= 14; n += 1) {
  const p = page(n);
  assert.ok(p, 'missing canonical page ' + n);
  sourcePages.push(n === 8 ? p.indices.slice(12) : p.indices.slice());
}
const body = sourcePages.flat();
assert.equal(body.length, 1717, 'unexpected p8-p14 body length');

const lp1Only = lp1Reference.split(/^### 56\\s*$/m)[0];
const reference = lp1Only
  .split(/\\r?\\n/)
  .filter((line) => line.trim() &&
    !line.trim().startsWith('#') &&
    !line.trim().startsWith('[') &&
    !/^\\d/.test(line.trim()))
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
function bigramLogScore(values) {
  const text = values.map((i) => corpus.translit[i]).join('')
    .toUpperCase().replace(/[^A-Z]/g, '');
  let total = 0;
  let n = 0;
  for (let i = 1; i < text.length; i += 1) {
    const a = text.charCodeAt(i - 1) - 65;
    const b = text.charCodeAt(i) - 65;
    total += Math.log((counts[a][b] + 1) / (totals[a] + 26));
    n += 1;
  }
  return total / n;
}

function rankOrder(values, descending, reverseSource) {
  let entries = values.map((value, column) => ({ value, column }));
  if (reverseSource) entries = entries.reverse();
  entries = entries.map((entry, tie) => ({ ...entry, tie }));
  entries.sort((a, b) =>
    (descending ? b.value - a.value : a.value - b.value) || a.tie - b.tie
  );
  return entries.map((entry) => entry.column);
}

function encryptColumnar(plain, order) {
  const columns = order.length;
  const rows = Math.ceil(plain.length / columns);
  const grid = Array.from({ length: rows }, () => Array(columns).fill(null));
  for (let i = 0; i < plain.length; i += 1) {
    grid[Math.floor(i / columns)][i % columns] = plain[i];
  }
  const out = [];
  for (const column of order) {
    for (let row = 0; row < rows; row += 1) {
      if (grid[row][column] !== null) out.push(grid[row][column]);
    }
  }
  return out;
}

function decryptColumnar(cipher, order) {
  const columns = order.length;
  const rows = Math.ceil(cipher.length / columns);
  const extra = cipher.length % columns;
  const lengths = Array.from({ length: columns }, (_, column) =>
    rows - (extra > 0 && column >= extra ? 1 : 0)
  );
  const gridColumns = Array(columns);
  let offset = 0;
  for (const column of order) {
    gridColumns[column] = cipher.slice(offset, offset + lengths[column]);
    offset += lengths[column];
  }
  assert.equal(offset, cipher.length);
  const out = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (row < gridColumns[column].length) out.push(gridColumns[column][row]);
    }
  }
  return out;
}

function render(values) {
  return values.map((i) => corpus.translit[i]).join('');
}
const p57 = page(57);
assert.ok(p57, 'missing clear p57 control');
const variants = [];
for (const reverseSource of [false, true]) {
  for (const descending of [false, true]) {
    const order = rankOrder(key, descending, reverseSource);
    const inverseCandidate = decryptColumnar(body, order);
    const forwardCandidate = encryptColumnar(body, order);
    const exactForwardReencrypt = encryptColumnar(inverseCandidate, order)
      .every((value, i) => value === body[i]) &&
      encryptColumnar(inverseCandidate, order).length === body.length;
    const exactInverseReencrypt = decryptColumnar(forwardCandidate, order)
      .every((value, i) => value === body[i]) &&
      decryptColumnar(forwardCandidate, order).length === body.length;
    assert.ok(exactForwardReencrypt && exactInverseReencrypt,
      'columnar roundtrip failed');
    variants.push({
      keySourceOrder: reverseSource ? 'reverse' : 'forward',
      rankDirection: descending ? 'descending' : 'ascending',
      rankOrder: order,
      inverseScore: bigramLogScore(inverseCandidate),
      forwardScore: bigramLogScore(forwardCandidate),
      inversePrefix: render(inverseCandidate).slice(0, 180),
      forwardPrefix: render(forwardCandidate).slice(0, 180),
      exactRoundtrip: true
    });
  }
}

const result = {
  hypothesis: 'p8 red 12-rune heading as stable-rank key for standard 12-column transposition of p8-p14 body',
  keyRunes: red.runes,
  keyIndices: key,
  keyTransliteration: key.map((i) => corpus.translit[i]).join(''),
  bodyRunes: body.length,
  columns: 12,
  rows: 144,
  columnLengths: Array.from({ length: 12 }, (_, column) => column === 0 ? 144 : 143),
  lp1ReferenceLetters: reference.length,
  originalBodyScore: bigramLogScore(body),
  clearP57ControlScore: bigramLogScore(p57.indices),
  variants
};
console.log(JSON.stringify(result, null, 2));
if (!variants.every((variant) => variant.exactRoundtrip)) process.exitCode = 1;
