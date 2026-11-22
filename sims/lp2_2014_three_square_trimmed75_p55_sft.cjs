"use strict";

/**
 * Original 2014 three-square -> 75 local GP29 runes of p55.
 * Source-constrained additive mask and totient mask; no recovered plaintext.
 * Node.js 22 CommonJS; suitable for Windows 11.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (s) => fs.readFileSync(path.join(root, s), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");

const squares = squareText.trim().split(/\r?\n[ \t]*\r?\n/)
  .filter(Boolean).map((block) =>
    block.split(/\r?\n/).map((line) => line.trim().split(/\s+/).map(Number))
  );
assert.deepEqual(squares.map(s => [s.length, s[0].length]), [[5, 5], [7, 7], [5, 5]]);
assert.deepEqual(squares.map(s => s[Math.floor(s.length / 2)][Math.floor(s.length / 2)]),
  [809, 331, 91]);
const stripped = squares.map((s, i) => i === 1
  ? s.slice(1, -1).map(row => row.slice(1, -1))
  : s);
assert.deepEqual(stripped.map(s => s.map(row => row.length)),
  [Array(5).fill(5), Array(5).fill(5), Array(5).fill(5)]);

function spiral(matrix) {
  const a = [], n = matrix.length;
  let top = 0, left = 0, bottom = n - 1, right = n - 1;
  while (left <= right && top <= bottom) {
    for (let c = left; c <= right; c++) a.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) a.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) a.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) a.push(matrix[r][left]);
      left++;
    }
  }
  return a;
}
function phi(n) {
  let v = n, x = n;
  for (let k = 2; k * k <= x; k++) {
    if (x % k === 0) {
      while (x % k === 0) x /= k;
      v -= v / k;
    }
  }
  if (x > 1) v -= v / x;
  return Math.round(v);
}
function shift(symbols, mask, sign) {
  assert.equal(symbols.length, mask.length);
  return symbols.map((v, i) => (v + 29 + sign * (mask[i] % 29)) % 29);
}
function ioc(symbols) {
  const freq = Array(29).fill(0);
  for (const v of symbols) freq[v]++;
  return freq.reduce((z, v) => z + v * (v - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
const physical = gp.pages.find(p => p.page === 55).indices;
const p55 = physical.slice(1);
assert.equal(physical.length, 76);
assert.equal(p55.length, 75);
assert.equal(gp.pages.find(p => p.page === 57).indices.length, 95);
const control = gp.pages.find(p => p.page === 57).indices.slice(0, 75);


const transcript = read("resources/liber-primus/lp2-transcription.txt").split("%");
const runeIndex = new Map(gp.runes.map((glyph, index) => [glyph, index]));
function sourceWords(s) {
  return s.replace(/[\/\r\n&]/g, "").split(/[-.\s§0-9$]+/g)
    .filter(word => [...word].some(glyph => runeIndex.has(glyph)));
}
const printed55 = sourceWords(transcript[54]);
assert.deepEqual(printed55.map(w => w.length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const wordLengths = printed55.slice(1).map(w => w.length);
assert.deepEqual(
  [...printed55.join("")].map(glyph => runeIndex.get(glyph)),
  physical,
  "original published word breaks preserve every p55 source glyph"
);
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
function nativeGp(original) {
  const text = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith("ING", i)) {
      result.push(21);
      i += 3;
    } else if (text.startsWith("IO", i)) {
      result.push(27);
      i += 2;
    } else {
      const token = tokens.find(t => text.startsWith(t.s, i));
      if (!token) return [];
      result.push(token.i);
      i += token.s.length;
    }
  }
  return result;
}
const english = new Set();
for (const line of read("resources/control/english_wordfreq_textblob.txt").split(/\r?\n/)) {
  const match = /^([a-z]+)\s+\d+$/.exec(line);
  if (match) {
    const indices = nativeGp(match[1]);
    if (indices.length) english.add(indices.join(","));
  }
}
assert.equal(english.size, 29060);
const p57Words = sourceWords(transcript[56]);
assert.equal(p57Words.length, 20);
assert.deepEqual(
  [...p57Words.join("")].map(glyph => runeIndex.get(glyph)),
  gp.pages.find(p => p.page === 57).indices
);
const solvedPositiveCount = p57Words.filter(w =>
  english.has([...w].map(glyph => runeIndex.get(glyph)).join(","))
).length;
const solvedLongPositiveCount = p57Words.filter(w =>
  w.length >= 6 && english.has([...w].map(glyph => runeIndex.get(glyph)).join(","))
).length;
assert.equal(solvedPositiveCount, 16);
assert.equal(solvedLongPositiveCount, 3);

const tests = [];
for (const order of ["rowMajor", "inwardSpiral", "reverseSpiral"]) {
  for (const keyTransform of ["raw", "totient"]) {
    const values = stripped.flatMap(matrix => {
      const row = order === "rowMajor" ? matrix.flat() : spiral(matrix);
      return order === "reverseSpiral" ? row.reverse() : row;
    });
    assert.equal(values.length, 75);
    const mask = values.map(n => keyTransform === "raw" ? n % 29 : phi(n) % 29);
    for (const sign of [-1, +1]) {
      const out = shift(p55, mask, sign);
      const restored = shift(out, mask, -sign);
      assert.deepEqual(restored, p55);
      const plantedCipher = shift(control, mask, -sign);
      assert.deepEqual(shift(plantedCipher, mask, sign), control);
      const chunks = [out.slice(0, 25), out.slice(25, 50), out.slice(50)];
      let cursor = 0;
      const recoveredWords = wordLengths.map(length => {
        const values = out.slice(cursor, cursor + length);
        cursor += length;
        return {length, indices: values, found: english.has(values.join(","))};
      });
      assert.equal(cursor, 75);
      tests.push({
        order, keyTransform, sign,
        ioc: Number(ioc(out).toFixed(9)),
        chunkIocs: chunks.map(x => Number(ioc(x).toFixed(9))),
        lexiconMatches: recoveredWords.filter(w => w.found).length,
        longLexiconMatches: recoveredWords.filter(w => w.found && w.length >= 6).length,
        renderedGp: out.map(x => gp.translit[x]).join(" ")
      });
    }
  }
}

/**
 * Complete 76-rune feedback receiver: first physical rune is the IV, all
 * 75 adjacent differences are consumed. This is mathematically invertible,
 * unlike discarding an unmatched first rune. No source selects this clock.
 */
const sourceDifferences = physical.slice(1).map((v, i) =>
  (v - physical[i] + 29) % 29
);
const feedbackTests = [];
for (const trial of tests) {
  const values = stripped.flatMap(matrix => {
    const row = trial.order === "rowMajor" ? matrix.flat() : spiral(matrix);
    return trial.order === "reverseSpiral" ? row.reverse() : row;
  });
  const mask = values.map(n =>
    trial.keyTransform === "raw" ? n % 29 : phi(n) % 29
  );
  const decoded = shift(sourceDifferences, mask, trial.sign);
  const recipheredDifferences = shift(decoded, mask, -trial.sign);
  const reciphered = [physical[0]];
  for (const increment of recipheredDifferences) {
    reciphered.push((reciphered[reciphered.length - 1] + increment) % 29);
  }
  assert.deepEqual(reciphered, physical, "complete 76-rune inverse");

  const plantedDifferences = shift(control, mask, -trial.sign);
  const plantedCipher = [physical[0]];
  for (const increment of plantedDifferences) {
    plantedCipher.push((plantedCipher[plantedCipher.length - 1] + increment) % 29);
  }
  const plantedReadout = shift(plantedCipher.slice(1).map((v, i) =>
    (v - plantedCipher[i] + 29) % 29
  ), mask, trial.sign);
  assert.deepEqual(plantedReadout, control, "complete solved-native planted inverse");

  let cursor = 0;
  const wordHits = wordLengths.map(length => {
    const word = decoded.slice(cursor, cursor + length);
    cursor += length;
    return {length, known: english.has(word.join(","))};
  });
  assert.equal(cursor, 75);
  feedbackTests.push({
    order: trial.order, keyTransform: trial.keyTransform, sign: trial.sign,
    ioc: Number(ioc(decoded).toFixed(9)),
    longLexiconMatches: wordHits.filter(w => w.length >= 6 && w.known).length,
    lexiconMatches: wordHits.filter(w => w.known).length,
    renderedGp: decoded.map(x => gp.translit[x]).join(" ")
  });
}
assert.equal(feedbackTests.length, 12);
assert.ok(feedbackTests.every(t => t.longLexiconMatches === 0));
assert.ok(feedbackTests.every(t => t.ioc < 0.04));

assert.equal(tests.length, 12);
const best = tests.slice().sort((a, b) => b.ioc - a.ioc)[0];
assert.equal(best.order, "rowMajor");
assert.equal(best.keyTransform, "raw");
assert.equal(best.sign, -1);
assert.ok(best.ioc < 0.04);
assert.ok(tests.every(x => x.ioc < 0.04));
assert.ok(tests.every(x => x.longLexiconMatches === 0));

process.stdout.write(JSON.stringify({
  original: { p55PhysicalRunes: physical.length, p55LocalRunes: p55.length,
    sourceSquareDimensions: [5, 7, 5], transformedSquareSizes: [25, 25, 25],
    p55OriginalIoc: ioc(p55) },
  trials: tests.map(({order, keyTransform, sign, ioc, chunkIocs}) =>
    ({order, keyTransform, sign, ioc, chunkIocs})),
  best: best,
  complete76Feedback: {
    firstRuneAsIv: physical[0], originalDifferenceZeroes: sourceDifferences.filter(x => x === 0).length,
    trials: feedbackTests.map(({order, keyTransform, sign, ioc, longLexiconMatches, lexiconMatches}) =>
      ({order, keyTransform, sign, ioc, longLexiconMatches, lexiconMatches})),
    bestIoc: Math.max(...feedbackTests.map(x => x.ioc))
  },
  sourceNativePositiveControls: 24,
  sourceNativeLexiconControl: { gpTypes: english.size, solvedP57Words: 20,
    recognizedP57Words: solvedPositiveCount,
    recognizedP57LongWords: solvedLongPositiveCount,
    recognizedOriginalCandidateLongWords: 0, recognizedFeedbackCandidateLongWords: 0 },
  conclusion: "Neither fixed original GP additive masks nor invertible first-difference feedback with those masks decrypts the original p55 76-runic cipher into ordinary GP29 English; full reciphering alone is no evidence of an author-selected operation."
}, null, 2) + "\n");
