"use strict";
/**
 * Source-only 180-degree orbit quotient of Cicada's three original 2014
 * magic squares, tested as one complete 51-rune key on the original p53
 * printed red51 span. Node 22 / Windows 11, read-only reproducible SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");

const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/)
  .map(group => group.trim().split(/\r?\n/)
    .map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(s => s.length), [5, 7, 5]);
const orbit = [];
for (const matrix of squares) {
  const n = matrix.length;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      assert.equal(matrix[y][x], matrix[n - 1 - y][n - 1 - x]);
    }
  }
  orbit.push((n * n + 1) / 2);
}
assert.deepEqual(orbit, [13, 25, 13]);
assert.equal(orbit.reduce((a, b) => a + b), 51);

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const a53 = ink.pages.find(p => p.page === 53);
const red = a53.red_spans.find(span => span.start === 128 && span.length === 51);
assert.ok(red);
assert.ok(a53.large_punctuation.some(m => m[0] === 179 && m[1] === 13));
const printed = corpus.pages[53].indices.slice(red.start, red.start + red.length);
assert.equal(printed.length, 51);
assert.deepEqual([...red.runes].map(r => corpus.runes.indexOf(r)), printed);

const red51 = printed;
const pairCount = digits => {
  const counts = Array(29).fill(0);
  for (const rune of digits) counts[rune]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0);
};
const normalize = n => (n % 29 + 29) % 29;
const native = corpus.pages[57].indices;
const nativePairs = [];
for (let i = 0; i + 51 <= native.length; i++) {
  nativePairs.push(pairCount(native.slice(i, i + 51)));
}
assert.equal(Math.min(...nativePairs), 140);
assert.equal(Math.max(...nativePairs), 174);

// Scan only source-visible row / column order and entire-orbit reversal,
// both additive directions. No crib, key tuning or original rune edits.
const results = [];
const lookupObstructions = [];
for (const layout of ["row", "column"]) {
  const key = squares.flatMap((matrix, q) => {
    const n = matrix.length;
    const entries = Array.from({ length: n * n }, (_, i) =>
      layout === "row" ? matrix[Math.floor(i / n)][i % n] :
        matrix[i % n][Math.floor(i / n)]);
    return entries.slice(0, orbit[q]).map(normalize);
  });
  assert.equal(key.length, 51);
  const rawKey = squares.flatMap((matrix, q) => {
    const n = matrix.length;
    return Array.from({ length: n * n }, (_, i) =>
      layout === "row" ? matrix[Math.floor(i / n)][i % n] :
        matrix[i % n][Math.floor(i / n)])
      .slice(0, orbit[q]);
  });
  assert.equal(new Set(rawKey).size, 50);
  for (const reverse of [false, true]) {
    const nativeKey = reverse ? [...rawKey].reverse() : rawKey;
    const pos = new Map();
    const rawConflicts = [];
    const residueSeen = new Map();
    let residueConflicts = 0;
    for (let i = 0; i < 51; i++) {
      const v = nativeKey[i];
      if (pos.has(v) && red51[pos.get(v)] !== red51[i]) {
        rawConflicts.push([pos.get(v), i, v]);
      } else if (!pos.has(v)) {
        pos.set(v, i);
      }
      const residue = normalize(v);
      if (residueSeen.has(residue) && residueSeen.get(residue) !== red51[i]) {
        residueConflicts++;
      } else if (!residueSeen.has(residue)) {
        residueSeen.set(residue, red51[i]);
      }
    }
    assert.equal(rawConflicts.length, 1);
    assert.ok(rawConflicts[0][2] === 7);
    assert.ok(residueConflicts >= 25);
    lookupObstructions.push([rawConflicts.length, residueConflicts]);
    console.log(layout + " order, reversed=" + reverse +
      ": arbitrary stationary integer→rune lookup is inconsistent at raw 7, " +
      "and mod29 lookup has " + residueConflicts + " conflicting positions");
  }
  for (const reverse of [false, true]) {
    const adjusted = reverse ? [...key].reverse() : key;
    for (const sign of [-1, 1]) {
      const result = red51.map((v, i) => normalize(v + sign * adjusted[i]));
      const pairs = pairCount(result);
      results.push(pairs);
      const readable = result.map(v => corpus.translit[v]).join(" ");
      console.log(layout + " order, reversed=" + reverse + ", sign=" + sign +
        ": GP29 equal-pair score " + pairs + "/2550; " +
        "native p57 51-rune score range [140,174]; " +
        "first 20 transliterations " + result.slice(0, 20)
          .map(v => corpus.translit[v]).join(" "));
      assert.ok(readable.length > 0);
    }
  }

  // Complete original-genre planted positive: the same key exactly reverses
  // when added to the first 51 native runes of the solved PARABLE.
  const planted = native.slice(0, 51).map((v, i) => normalize(v + key[i]));
  const recovered = planted.map((v, i) => normalize(v - key[i]));
  assert.deepEqual(recovered, native.slice(0, 51));
}
assert.deepEqual(results, [96, 72, 82, 120, 82, 108, 102, 94]);
assert.deepEqual(lookupObstructions, [[1,25], [1,25], [1,25], [1,26]]);
assert.ok(results.every(n => n < Math.min(...nativePairs)));
console.log("PASS 13+25+13 full rotated source positions, exact 51-rune p53 red anchor");
console.log("PASS 2/2 native 51-rune source-language plants; all eight raw inverses non-native");
console.log("NO new original plaintext or source-authenticated key/recipient grammar.");
