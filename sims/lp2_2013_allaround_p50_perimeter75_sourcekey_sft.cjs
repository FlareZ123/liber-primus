"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const lexText = fs.readFileSync(path.join(root, "resources/control/english_wordfreq_textblob.txt"), "utf8");

const page55 = corpus.pages.find((p) => p.page === 55);
assert.ok(page55, "physical p55 corpus record exists");
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every((row) => row.length === 8));

const perimeter = [];
for (let col = 0; col < 8; col++) perimeter.push(col);
for (let row = 1; row < 31; row++) perimeter.push(row * 8 + 7);
for (let col = 7; col >= 0; col--) perimeter.push(31 * 8 + col);
for (let row = 30; row >= 1; row--) perimeter.push(row * 8);
assert.equal(perimeter.length, 76);
assert.equal(new Set(perimeter).size, 76);

const anchorCell = 64; // authenticated 2013 wordwise ALL/AROUND=64 candidate
const anchorPosition = perimeter.indexOf(anchorCell);
assert.notEqual(anchorPosition, -1);
const keyCells = Array.from({ length: 75 }, (_, i) => perimeter[(anchorPosition + i + 1) % 76]);
assert.equal(keyCells.length, 75);
assert.equal(keyCells[48], 252); // KEY=49 fixes the clockwise endpoint
assert.equal((perimeter.indexOf(252) - anchorPosition + 76) % 76, 49);

const body = page55.indices.slice(1); // exclude the one inherited p54 carry rune
const wordLengths = [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(page55.indices.length, 76);
assert.equal(body.length, 75);
assert.equal(wordLengths.reduce((a, b) => a + b, 0), 75);
const zeroPositions = body.map((v, i) => v === 0 ? i : -1).filter((i) => i >= 0);
assert.deepEqual(zeroPositions, [14, 24, 40]);

const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

function decodeToken(token, alphabet, radix) {
  assert.equal(token.length, 2);
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, "all printed table tokens belong to the frozen alphabet");
  return hi * radix + lo;
}

const tokens = grid.rows.flat();
const bytes60 = grid.byte_rows.flat();
assert.equal(tokens.length, 256);
assert.equal(bytes60.length, 256);
const bytes59 = tokens.map((t) => decodeToken(t, alphabet59, 59));
assert.deepEqual(tokens.map((t) => decodeToken(t, alphabet60, 60)), bytes60);

const translit = corpus.translit;
function wordsOf(values) {
  let offset = 0;
  return wordLengths.map((n) => {
    const word = values.slice(offset, offset + n).map((v) => translit[v]).join("");
    offset += n;
    return { word, runeLength: n };
  });
}

const lexicon = new Set(
  lexText.split(/\r?\n/)
    .filter((line) => line && !line.startsWith(";"))
    .map((line) => line.trim().split(/\s+/)[0].toLowerCase())
);

function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  const n = values.length;
  return counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
}

function summarize(values) {
  const words = wordsOf(values);
  const hits = words.filter((x) => lexicon.has(x.word.toLowerCase()));
  return {
    words: words.map((x) => x.word).join(" "),
    exactLexiconHits: hits.map((x) => x.word),
    longLexiconHits: hits.filter((x) => x.runeLength >= 3).map((x) => x.word),
    ioc: ioc(values)
  };
}

console.log("Source-frozen route:");
console.log(JSON.stringify({
  anchorCell,
  anchorPosition,
  clockwiseStepsToCell252: 49,
  keyCellsLength: keyCells.length,
  p55PhysicalRunes: page55.indices.length,
  inheritedCarryExcluded: 1,
  p55BodyRunes: body.length,
  ciphertextFPositions: zeroPositions
}, null, 2));

const models = [];
for (const [radix, bytes] of [["base59", bytes59], ["base60", bytes60]]) {
  const key = keyCells.map((cell) => bytes[cell] % 29);
  for (const sign of [-1, 1]) {
    const standard = body.map((c, i) => (c + sign * key[i] + 29) % 29);
    models.push({
      radix,
      convention: sign === -1 ? "ordinary-subtract" : "ordinary-add",
      keySymbolsUsed: 75,
      ...summarize(standard)
    });

    // Exact p56-style transparent-F branch family. A plaintext F (0) is
    // emitted as ciphertext F without consuming a key symbol. Every ciphertext
    // F can instead be an ordinary enciphered symbol; all 2^3 masks are charged.
    for (let mask = 0; mask < (1 << zeroPositions.length); mask++) {
      let keyIndex = 0;
      const plain = [];
      const bypassed = [];
      let valid = true;
      for (let i = 0; i < body.length; i++) {
        const zeroIndex = zeroPositions.indexOf(i);
        const bypass = zeroIndex >= 0 && ((mask >> zeroIndex) & 1) === 1;
        if (bypass) {
          plain.push(0);
          bypassed.push(i);
          continue;
        }
        const p = (body[i] + sign * key[keyIndex] + 29) % 29;
        // Under the transparent-F rule, a consumed-key inverse cannot emit F:
        // F would have passed through and left the key clock unchanged.
        if (p === 0) {
          valid = false;
          break;
        }
        plain.push(p);
        keyIndex++;
      }
      if (!valid) continue;
      models.push({
        radix,
        convention: sign === -1 ? "transparent-F-subtract" : "transparent-F-add",
        mask,
        bypassedCiphertextFPositions: bypassed,
        keySymbolsUsed: keyIndex,
        ...summarize(plain)
      });
    }
  }
}

models.sort((a, b) =>
  b.longLexiconHits.length - a.longLexiconHits.length ||
  b.exactLexiconHits.length - a.exactLexiconHits.length ||
  b.ioc - a.ioc
);

console.log("Candidate family results:");
for (const model of models) console.log(JSON.stringify(model));
console.log("Summary:");
console.log(JSON.stringify({
  totalModels: models.length,
  transparentFModels: models.filter((m) => m.convention.startsWith("transparent-F")).length,
  bestLongLexiconHits: Math.max(...models.map((m) => m.longLexiconHits.length)),
  bestExactLexiconHits: Math.max(...models.map((m) => m.exactLexiconHits.length)),
  bestCandidates: models.slice(0, 5)
}, null, 2));
