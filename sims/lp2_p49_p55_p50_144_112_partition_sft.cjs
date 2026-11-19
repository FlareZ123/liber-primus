"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8").replace(/\r/g, "");
}
function mod29(x) { return ((x % 29) + 29) % 29; }
function H(a, b) { return [mod29(a - b), mod29(a + b)]; }
function recursiveCore(values) {
  let x = values.slice();
  while (x.length > 1) x = x.slice(1, -1);
  return x.length === 1 ? x[0] : null;
}
function signature(page) {
  const cores = page.words.map(w => recursiveCore(w.values)).filter(x => x !== null);
  const pairs = [];
  for (let i = 0; i < Math.floor(cores.length / 2); i++) {
    pairs.push(H(cores[i], cores[cores.length - 1 - i]));
  }
  const h0 = pairs.reduce((s, p) => s + p[0], 0);
  const h1 = pairs.reduce((s, p) => s + p[1], 0);
  const middle = cores.length % 2 ? cores[(cores.length - 1) / 2] : 0;
  const gp0 = cores.reduce((s, x) => s + x, 0);
  return { page: page.page, wordCount: page.words.length, cores, gp0, h0, h1, middle, packet: [gp0, h0, h1, middle], packetTotal: gp0 + h0 + h1 + middle };
}
function H4(v) {
  assert.equal(v.length, 4);
  return [mod29(v[0] - v[3]), mod29(v[1] - v[2]), mod29(v[1] + v[2]), mod29(v[0] + v[3])];
}
function decodeToken(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, "unmapped table token " + token);
  return hi * alphabet.length + lo;
}
function invMod29(x) {
  for (let i = 1; i < 29; i++) if (mod29(x * i) === 1) return i;
  return null;
}
function inverse4(matrix) {
  const a = matrix.map((row, i) => row.map(mod29).concat([0, 1, 2, 3].map(j => i === j ? 1 : 0)));
  for (let c = 0; c < 4; c++) {
    let pivot = c;
    while (pivot < 4 && a[pivot][c] === 0) pivot++;
    if (pivot === 4) return null;
    if (pivot !== c) [a[pivot], a[c]] = [a[c], a[pivot]];
    const scale = invMod29(a[c][c]);
    for (let j = 0; j < 8; j++) a[c][j] = mod29(a[c][j] * scale);
    for (let r = 0; r < 4; r++) {
      if (r === c) continue;
      const factor = a[r][c];
      for (let j = 0; j < 8; j++) a[r][j] = mod29(a[r][j] - factor * a[c][j]);
    }
  }
  return a.map(row => row.slice(4));
}
function applyLeft(matrix, vector) {
  return matrix.map(row => mod29(row.reduce((s, x, i) => s + x * vector[i], 0)));
}
function applyRight(vector, matrix) {
  return matrix[0].map((_, j) => mod29(vector.reduce((s, x, i) => s + x * matrix[i][j], 0)));
}
function ioc(values) {
  if (values.length < 2) return 0;
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
assert.equal(parts.length, 55);
const pageRunes = parts.map(part => Array.from(part).map(ch => runeIndex.get(ch)).filter(Number.isInteger));
const pageRecords = parts.map((_, i) => ({ page: i >= 50 ? i + 1 : i, words: [] }));
let current = [], startSegment = -1, endSegment = -1, startOffset = 0, crossPageWords = 0;
const offsets = Array(parts.length).fill(0);
function flushWord() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pageRecords[startSegment];
    page.words.push({ ordinal: page.words.length + 1, start: startOffset, end: offsets[endSegment] - 1, values: current.slice() });
  } else {
    crossPageWords++;
  }
  current = [];
}
for (let s = 0; s < parts.length; s++) {
  for (const ch of Array.from(parts[s])) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) { startSegment = s; startOffset = offsets[s]; }
      endSegment = s;
      current.push(value);
      offsets[s]++;
    } else if (ch !== "/" && !/\s/u.test(ch)) {
      flushWord();
    }
  }
}
flushWord();
const allWords = pageRecords.flatMap(p => p.words);
assert.equal(crossPageWords, 32);
assert.equal(allWords.length, 2864);
const byPhysical = new Map(pageRecords.map(p => [p.page, p]));
const summaries = pageRecords.map(signature);
summaries.push(signature({ page: 50, words: [] }));
summaries.sort((a, b) => a.page - b.page);
const fiveCorePages = summaries.filter(p => p.cores.length === 5).map(p => p.page);
assert.deepEqual(fiveCorePages, [49, 55]);
const p49 = summaries.find(p => p.page === 49);
const p55 = summaries.find(p => p.page === 55);
assert.deepEqual(p49.cores, [20, 19, 19, 14, 4]);
assert.deepEqual(p55.cores, [1, 6, 2, 11, 18]);
assert.deepEqual(p49.packet, [76, 21, 28, 19]);
assert.deepEqual(p55.packet, [38, 36, 36, 2]);
assert.equal(p49.packetTotal, 144);
assert.equal(p55.packetTotal, 112);
assert.deepEqual(summaries.filter(p => p.packetTotal === 144).map(p => p.page), [49]);
assert.deepEqual(summaries.filter(p => p.packetTotal === 112).map(p => p.page), [55]);

const tokens = grid.pages.flatMap(p => p.tokens);
assert.equal(tokens.length, 256);
const tableRows = Array.from({ length: 32 }, (_, r) => tokens.slice(r * 8, r * 8 + 8));
assert.ok(tableRows.every(r => r.length === 8));
const outerRing = 2 * (32 + 8) - 4;
const secondRing = 2 * (30 + 6) - 4;
const inner = tableRows.slice(2, 30).map(row => row.slice(2, 6));
assert.equal(outerRing, 76);
assert.equal(secondRing, 68);
assert.equal(inner.length, 28);
assert.ok(inner.every(row => row.length === 4));
assert.equal(inner.flat().length, 112);
assert.equal(outerRing + secondRing, p49.packetTotal);
assert.equal(inner.flat().length, p55.packetTotal);
assert.equal(p49.packetTotal + p55.packetTotal, tokens.length);
assert.equal(pageRunes[54].length, 76);
assert.equal(pageRunes[54].length, 19 * 4);

const p29Word30 = byPhysical.get(29).words[29].values;
assert.deepEqual(p29Word30, [11, 26, 11, 18]);
const rowSelectors = H4(p29Word30);
assert.deepEqual(rowSelectors, [22, 15, 8, 0]);
assert.ok(rowSelectors.every(x => x >= 0 && x < 28));

const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
assert.equal(alpha60.length, 60);
assert.equal(alpha59.length, 59);
assert.equal(tokens[76], "1s");
assert.equal(decodeToken(tokens[76], alpha59), 112);
assert.equal(tokens[38], "2D");
assert.equal(decodeToken(tokens[38], alpha59), 131);

const outputs = [];
for (const [radix, alphabet] of [["base59", alpha59], ["base60", alpha60]]) {
  const key = rowSelectors.map(r => inner[r].map(token => mod29(decodeToken(token, alphabet))));
  const inverse = inverse4(key);
  assert.ok(inverse, radix + " selected matrix must be invertible");
  const columnPlain = [], rowPlain = [];
  for (let i = 0; i < pageRunes[54].length; i += 4) {
    const cipherBlock = pageRunes[54].slice(i, i + 4);
    const cPlain = applyLeft(inverse, cipherBlock);
    const rPlain = applyRight(cipherBlock, inverse);
    assert.deepEqual(applyLeft(key, cPlain), cipherBlock);
    assert.deepEqual(applyRight(rPlain, key), cipherBlock);
    columnPlain.push(...cPlain);
    rowPlain.push(...rPlain);
  }
  outputs.push({
    radix,
    key,
    inverse,
    columnVector: corpus.translit.map ? columnPlain.map(x => corpus.translit[x]).join("") : "",
    rowVector: rowPlain.map(x => corpus.translit[x]).join(""),
    columnIoC: ioc(columnPlain),
    rowIoC: ioc(rowPlain)
  });
}
const result = {
  status: "PASS: source parsing, unique packet partition, selector derivation, matrix inverses, and exact re-encryption",
  fiveCorePages,
  p49Packet: { fields: p49.packet, total: p49.packetTotal },
  p55Packet: { fields: p55.packet, total: p55.packetTotal },
  p50Geometry: { outerRing, secondRing, removed: outerRing + secondRing, innerRows: 28, innerColumns: 4, innerCells: inner.flat().length },
  p55BlockShape: { runes: pageRunes[54].length, blocks: pageRunes[54].length / 4 },
  p29Selector: { word30: p29Word30, H4: rowSelectors },
  base59AddressControls: { p50_76: { token: tokens[76], value: 112 }, p50_38: { token: tokens[38], value: 131 } },
  directHill4Candidates: outputs,
  decision: "The 144/112 partition is a unique structural correspondence. The exact p29-selected inner-core Hill4 consumer round-trips but yields no readable p55 plaintext; do not widen this matrix family without a new source selector."
};
console.log(JSON.stringify(result, null, 2));
