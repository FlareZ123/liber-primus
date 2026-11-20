"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const rawP0 = corpus.pages[0].indices.slice(80, 103);
const cipherP55 = corpus.pages[55].indices;
assert.equal(rawP0.length, 23);
assert.equal(cipherP55.length, 76);

// The p28 READ OUT candidate selects p0 offsets 80..102. The original
// transcription groups these 23 runes into four printed words of lengths
// 3, 7, 5, 8. Apply the already-defined p57 H(x,y)=(x-y,x+y) mod 29
// outside-in to each word; odd centers are emitted last and unchanged.
const wordLengths = [3, 7, 5, 8];
const expectedRaw = [
  21,25,2,
  10,25,8,14,2,13,6,
  26,0,21,5,11,
  2,24,19,10,21,10,27,26
];
assert.deepEqual(rawP0, expectedRaw);
assert.equal(wordLengths.reduce((a,b)=>a+b,0), rawP0.length);
const hKey = [];
let cursor = 0;
for (const length of wordLengths) {
  const word = rawP0.slice(cursor, cursor + length);
  cursor += length;
  for (let i = 0; i < Math.floor(length / 2); i++) {
    const x = word[i], y = word[length - 1 - i];
    hKey.push((x - y + 29) % 29, (x + y) % 29);
  }
  if (length % 2) hKey.push(word[Math.floor(length / 2)]);
}
assert.deepEqual(hKey, [
  19,23,25,4,16,12,9,6,10,14,15,8,24,5,21,5,28,26,22,9,0,18,2
]);
assert.equal(hKey.length, 23);
assert.equal(new Set(hKey).size, 21);

// The DH modulus p=23 motivates 23 columns. The p55 stream has 76 runes:
// 76 = 3*23 + 7, where 3 is the DH exponent e and 7 = g+K (5+2).
// Standard row-major fill therefore makes a 4x23 grid with 7 cells in row 4.
const width = 23;
const rows = Math.ceil(cipherP55.length / width);
const extra = cipherP55.length % width;
assert.equal(rows, 4);
assert.equal(extra, 7);

function rankOrder(key, descending) {
  return key.map((value, index) => ({ value, index }))
    .sort((a, b) => (descending ? b.value - a.value : a.value - b.value) || a.index - b.index)
    .map(x => x.index);
}
function getOrder(key, reverseKey, descending) {
  const source = reverseKey ? [...key].reverse() : key;
  return rankOrder(source, descending).map(i => reverseKey ? key.length - 1 - i : i);
}
function columnarReadRows(input, order) {
  const columns = Array.from({ length: width }, (_, col) => {
    const values = [];
    for (let row = 0; row < rows; row++) {
      const at = row * width + col;
      if (at < input.length) values.push(input[at]);
    }
    return values;
  });
  return order.flatMap(col => columns[col]);
}
function columnarUndoRead(input, order) {
  const columns = Array(width);
  let at = 0;
  for (const col of order) {
    const length = Math.floor(input.length / width) + (col < extra ? 1 : 0);
    columns[col] = input.slice(at, at + length);
    at += length;
  }
  assert.equal(at, input.length);
  const output = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < width; col++) {
      if (row < columns[col].length) output.push(columns[col][row]);
    }
  }
  return output;
}

// Round-trip the ragged 76-symbol layout before scoring any real candidate.
const synthetic = Array.from({ length: 76 }, (_, i) => i);
for (const reverseKey of [false, true]) {
  for (const descending of [false, true]) {
    const order = getOrder(hKey, reverseKey, descending);
    assert.deepEqual(columnarUndoRead(columnarReadRows(synthetic, order), order), synthetic);
    assert.deepEqual(columnarReadRows(columnarUndoRead(synthetic, order), order), synthetic);
  }
}

const training = reference.toUpperCase().replace(/[^A-Z]/g, "");
const counts = new Map();
let total = 0;
for (let i = 0; i + 2 < training.length; i++) {
  const tri = training.slice(i, i + 3);
  counts.set(tri, (counts.get(tri) || 0) + 1);
  total++;
}
const alpha = 0.5;
const denominator = total + alpha * 26 ** 3;
const floor = Math.log(alpha / denominator);
const logp = new Map();
for (const [tri, count] of counts) logp.set(tri, Math.log((count + alpha) / denominator));

function score(indices) {
  const text = indices.map(i => corpus.translit[i]).join("");
  let sum = 0, n = 0;
  for (let i = 0; i + 2 < text.length; i++) {
    sum += logp.get(text.slice(i, i + 3)) ?? floor;
    n++;
  }
  return { text, score: sum / n };
}
function variants(key) {
  const out = [];
  for (const reverseKey of [false, true]) {
    for (const descending of [false, true]) {
      const order = getOrder(key, reverseKey, descending);
      for (const direction of ["undo-column-read", "column-read"]) {
        const candidate = direction === "undo-column-read"
          ? columnarUndoRead(cipherP55, order)
          : columnarReadRows(cipherP55, order);
        const result = score(candidate);
        out.push({
          name: (reverseKey ? "reverse" : "forward") + "-" +
            (descending ? "desc" : "asc") + "-" + direction,
          order,
          ...result
        });
      }
    }
  }
  return out;
}

const baseline = score(cipherP55);
const observed = variants(hKey).sort((a, b) => b.score - a.score);
assert.equal(observed[0].name, "reverse-desc-column-read");
assert.ok(Math.abs(observed[0].score - (-9.517626003593021)) < 1e-12);

// Familywise null: preserve the H-key multiset (including repeated 5 and 9),
// randomly reorder it, and take the maximum over the same eight conventions.
let seed = 0x23763301;
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const trials = 20000;
const nullMax = [];
let exceedances = 0, sum = 0, min = Infinity, max = -Infinity;
for (let t = 0; t < trials; t++) {
  const shuffled = [...hKey];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const best = Math.max(...variants(shuffled).map(x => x.score));
  nullMax.push(best);
  sum += best;
  min = Math.min(min, best);
  max = Math.max(max, best);
  if (best >= observed[0].score) exceedances++;
}
nullMax.sort((a, b) => a - b);
const familywiseP = (exceedances + 1) / (trials + 1);
const nullMean = sum / trials;
const p95 = nullMax[Math.floor(0.95 * (trials - 1))];
assert.equal(exceedances, 3098);
assert.ok(Math.abs(familywiseP - 0.15494225288735564) < 1e-12);

console.log(JSON.stringify({
  source: {
    p0Offsets: [80, 102],
    wordLengths,
    rawP0,
    hKey,
    hKeyDistinct: new Set(hKey).size,
    p55Runes: cipherP55.length,
    layout: "4 rows x 23 columns; final row has 7 cells"
  },
  baseline,
  candidates: observed,
  null: {
    trials,
    seed: "0x23763301",
    exceedances,
    plusOneFamilywiseP: familywiseP,
    meanMaximumScore: nullMean,
    p95MaximumScore: p95,
    minMaximumScore: min,
    maxMaximumScore: max
  }
}, null, 2));
