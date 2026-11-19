"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const osMessage = read("resources/historical/cicada2013-os-original-message.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find(candidate =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}
function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}
function translit(values) {
  return values.map(value => corpus.translit[value]).join("");
}
function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;
  function flush() {
    if (!current.length) return;
    words.push({
      start,
      end: start + current.length - 1,
      values: current.slice(),
    });
    current = [];
  }
  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}
function lineFragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map(fragment =>
    [...fragment].map(rune => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}
function outerRing() {
  const ring = [];
  for (let column = 0; column < 8; column += 1) ring.push(column);
  for (let row = 1; row < 32; row += 1) ring.push(row * 8 + 7);
  for (let column = 6; column >= 0; column -= 1) ring.push(31 * 8 + column);
  for (let row = 30; row >= 1; row -= 1) ring.push(row * 8);
  return ring;
}
function decodeToken(token, alphabet, radix) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0, "token outside selected alphabet: " + token);
  return radix * high + low;
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

assert.match(osMessage, /The key is all around you\./i);
const phraseWords = ["THE", "KEY", "IS", "ALL", "AROUND", "YOU"];
const phraseValues = phraseWords.map(gp0);
assert.deepEqual(phraseValues, [20, 49, 25, 64, 64, 30]);
const startCell = gp0("ALL");
const keyDistance = gp0("KEY");
const endpointCell = phraseValues.reduce((sum, value) => sum + value, 0);
assert.equal(startCell, 64);
assert.equal(keyDistance, 49);
assert.equal(gp0("AROUND"), 64);
assert.equal(endpointCell, 252);

// The p28 line-six DH object independently supplies a=6.
const p28Lines = parts[28].split("/").filter(line => line.trim().length > 0);
assert.equal(p28Lines.length, 12);
const p28Line6 = lineFragments(p28Lines[5]);
assert.equal(p28Line6.length, 5);
assert.equal(p28Line6.reduce((sum, fragment) => sum + fragment.length, 0), 23);
assert.equal(translit(p28Line6[0]), "DH");
const a = 6;
assert.equal(keyDistance - a, 43);
assert.equal((76 - keyDistance) + a, 33);

// The rune-free p50 table is omitted from the transcription, so p55 is segment54.
const p55 = corpus.pages.find(page => page.page === 55);
assert.ok(p55);
const parsed = parsePage(parts[54]);
assert.equal(parsed.runes.length, 76);
assert.deepEqual(parsed.runes, p55.indices);
assert.deepEqual(
  parsed.words.map(word => word.values.length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]
);

// p55's first page-local rune is the carried final rune of a p54 word.
// For each of the 16 complete words, both endpoints are circumference.
const interiorPositions = [];
const boundaryPositions = [0];
for (const word of parsed.words.slice(1)) {
  boundaryPositions.push(word.start, word.end);
  for (let position = word.start + 1; position < word.end; position += 1) {
    interiorPositions.push(position);
  }
}
assert.equal(interiorPositions.length, 43);
assert.equal(boundaryPositions.length, 33);
assert.equal(interiorPositions.length + boundaryPositions.length, 76);

// The original 32x8 perimeter, walked forward from the source-selected cell64.
const tableTokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tableTokens.length, 256);
const ring = outerRing();
assert.equal(ring.length, 76);
const startIndex = ring.indexOf(startCell);
const endIndex = ring.indexOf(endpointCell);
assert.equal(startIndex, 68);
assert.equal(endIndex, 41);
const ringCells = Array.from({ length: 76 }, (_, index) =>
  ring[(startIndex + index) % 76]
);
assert.equal(ringCells[0], 64);
assert.equal(ringCells[49], 252);

// The 49-edge source arc is shortened by a=6 to 43 interior-key positions.
// Its remaining six edges plus the 27-edge complement make the 33 boundary keys.
assert.equal(ringCells.slice(0, 49).length, 49);
assert.equal(ringCells.slice(0, 43).at(-1), 223);
assert.equal(ringCells.slice(43, 49).length, 6);
assert.equal(ringCells.slice(49).length, 27);
assert.equal(ringCells.slice(43).length, 33);
assert.equal(ringCells[43], 231);

const alphabets = {
  base60: { radix: 60, alphabet: grid.alphabet },
  base59: { radix: 59, alphabet: grid.alphabet.replace("f", "") },
};
const variants = [];
for (const [radixName, definition] of Object.entries(alphabets)) {
  const key = ringCells.map(cell =>
    mod29(decodeToken(tableTokens[cell], definition.alphabet, definition.radix))
  );
  for (const sign of ["minus", "plus"]) {
    const plaintext = Array(76);
    for (let index = 0; index < 43; index += 1) {
      const position = interiorPositions[index];
      plaintext[position] = sign === "minus"
        ? mod29(parsed.runes[position] - key[index])
        : mod29(parsed.runes[position] + key[index]);
    }
    for (let index = 0; index < 33; index += 1) {
      const position = boundaryPositions[index];
      plaintext[position] = sign === "minus"
        ? mod29(parsed.runes[position] - key[43 + index])
        : mod29(parsed.runes[position] + key[43 + index]);
    }

    // Exact forward replay is mandatory for every tested variant.
    const replay = Array(76);
    for (let index = 0; index < 43; index += 1) {
      const position = interiorPositions[index];
      replay[position] = sign === "minus"
        ? mod29(plaintext[position] + key[index])
        : mod29(plaintext[position] - key[index]);
    }
    for (let index = 0; index < 33; index += 1) {
      const position = boundaryPositions[index];
      replay[position] = sign === "minus"
        ? mod29(plaintext[position] + key[43 + index])
        : mod29(plaintext[position] - key[43 + index]);
    }
    assert.deepEqual(replay, parsed.runes);

    variants.push({
      radix: radixName,
      sign,
      keyPrefix: key.slice(0, 10),
      plaintext: translit(plaintext),
      ioc: ioc(plaintext),
      exactForwardReplay: true,
    });
  }
}
assert.equal(variants.length, 4);

console.log(JSON.stringify({
  status: "PASS: exact source-constrained perimeter/interior-boundary test reproduced",
  source: {
    message: "The key is all around you.",
    gp0: Object.fromEntries(phraseWords.map((word, index) => [word, phraseValues[index]])),
    startCell,
    keyDistance,
    endpointCell,
  },
  p28: { line: 6, firstFragment: "DH", runeCount: 23, a },
  p55: {
    runes: parsed.runes.length,
    pageLocalSegments: parsed.words.length,
    wordLengths: parsed.words.map(word => word.values.length),
    interiorCount: interiorPositions.length,
    boundaryCount: boundaryPositions.length,
  },
  perimeter: {
    cells: ring.length,
    startCell: ringCells[0],
    cellAfter49Steps: ringCells[49],
    first43End: ringCells[42],
    remaining33Start: ringCells[43],
    split: [keyDistance - a, (76 - keyDistance) + a],
  },
  variants,
  decision:
    "The source-constrained 43/33 interleaving does not recover p55 plaintext under either base60 or base59 additive reading or either sign. This rejects this exact perimeter-key transducer only; it does not reject other uses of the source-selected perimeter or the p55 43/33 structure.",
}, null, 2));
