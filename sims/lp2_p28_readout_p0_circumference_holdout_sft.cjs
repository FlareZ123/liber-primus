"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let out = 1;
  let x = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C").replace(/V/g, "U").replace(/Q/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + word + ":" + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text @returns {Array<{start:number,values:number[]}>} */
function parseWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;
  const flush = () => {
    if (!current.length) return;
    words.push({ start, values: current });
    current = [];
  };
  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {string} text @returns {number[]} */
function allRunes(text) {
  return [...text].map((char) => runeIndex.get(char)).filter((value) => value !== undefined);
}

/** @param {string} token @param {string} alphabet @returns {number} */
function numeralValue(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}

/** @returns {string[]} */
function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/).filter((token) => /^[A-Za-z]+$/.test(token));
}

const p28Runes = allRunes(physicalPart(28));
const p28Words = parseWords(physicalPart(28));
assert.equal(p28Runes.length, 269);
assert.equal(p28Words.length, 59);
const selected = p28Words[27];
assert.equal(selected.start, 135);
assert.deepEqual(selected.values, [28, 24, 10, 1, 20]);
const sourceSpan = [p28Runes[134], ...selected.values];
assert.deepEqual(sourceSpan, [9, 28, 24, 10, 1, 20]);

const decoded = [
  modPow(sourceSpan[0], 3, 29),
  ...sourceSpan.slice(1).map((value) => modPow(value, 27, 29)),
];
assert.deepEqual(decoded, [4, 28, 23, 3, 1, 16]);
assert.equal(translit(decoded), "READOUT");
assert.deepEqual(gp("READOUT"), decoded);

const readoutGp0 = sum(decoded);
assert.equal(readoutGp0, 75);
assert.equal(tableTokens[75], "2v");

const base60Alphabet = grid.alphabet;
const base59Alphabet = base60Alphabet.replace("f", "");
const base59Value = numeralValue(tableTokens[75], base59Alphabet);
const base60Value = numeralValue(tableTokens[75], base60Alphabet);
assert.equal(base59Value, 174);
assert.equal(base60Value, 177);
assert.equal(base59Value, decoded.length * 29);
assert.equal(base59Value % 29, 0);
assert.equal(base60Value % 29, 3);

const cubeOrbit = [2];
while (true) {
  const next = modPow(cubeOrbit[cubeOrbit.length - 1], 3, 29);
  if (next === cubeOrbit[0]) break;
  cubeOrbit.push(next);
}
assert.deepEqual(cubeOrbit, [2, 8, 19, 15, 11, 26]);
assert.equal(cubeOrbit.length, decoded.length);

const zeroBase59Cells = tableTokens
  .map((token, index) => ({ index, value: numeralValue(token, base59Alphabet) }))
  .filter((row) => row.value % 29 === 0)
  .map((row) => row.index);
assert.deepEqual(zeroBase59Cells, [22, 51, 57, 75, 92, 103, 192, 219, 229]);

const p57Words = parseWords(physicalPart(57)).map((word) => word.values);
assert.equal(p57Words.length, 20);
const vocabRows = [];
const signed = signedWords();
assert.equal(signed.length, 43);

for (const word of signed) {
  const values = gp(word);
  const address = sum(values);
  if (address < tableTokens.length) {
    vocabRows.push({
      source: "2016", word: word.toUpperCase(), runes: values.length, gp0: address,
      b59: numeralValue(tableTokens[address], base59Alphabet),
      b60: numeralValue(tableTokens[address], base60Alphabet),
    });
  }
}
for (const values of p57Words) {
  const address = sum(values);
  vocabRows.push({
    source: "p57", word: translit(values), runes: values.length, gp0: address,
    b59: numeralValue(tableTokens[address], base59Alphabet),
    b60: numeralValue(tableTokens[address], base60Alphabet),
  });
}
vocabRows.push({
  source: "candidate", word: "READOUT", runes: decoded.length, gp0: readoutGp0,
  b59: base59Value, b60: base60Value,
});

const exactBase59 = vocabRows
  .filter((row) => row.b59 === row.runes * 29)
  .map((row) => ({ source: row.source, word: row.word, runes: row.runes, gp0: row.gp0, b59: row.b59 }));
assert.deepEqual(exactBase59, [
  { source: "2016", word: "WILL", runes: 4, gp0: 57, b59: 116 },
  { source: "candidate", word: "READOUT", runes: 6, gp0: 75, b59: 174 },
]);
assert.equal(vocabRows.filter((row) => row.b60 === row.runes * 29).length, 0);

const readGp0 = sum(gp("READ"));
assert.equal(readGp0, 55);
assert.equal(corpus.pages.find((page) => page.page === 55).indices.length, 76);

const perimeter = [];
for (let column = 0; column < 8; column += 1) perimeter.push(column);
for (let row = 1; row < 32; row += 1) perimeter.push(row * 8 + 7);
for (let column = 6; column >= 0; column -= 1) perimeter.push(31 * 8 + column);
for (let row = 30; row >= 1; row -= 1) perimeter.push(row * 8);
assert.equal(perimeter.length, 76);
assert.equal(perimeter.indexOf(readGp0), 13);

const p0Cipher = corpus.pages.find((page) => page.page === 0).indices.slice(0, 13);
const p0Plain = [...gp("EPIPHANY"), ...gp("SEEKS")];
assert.equal(p0Plain.length, 13);
const cubeExponents = [1, 3, 9, 27, 25, 19];
const reachable = p0Cipher.filter((cipherValue, index) =>
  cubeExponents.some((exponent) => modPow(cipherValue, exponent, 29) === p0Plain[index])
).length;
assert.equal(reachable, 3);

console.log(JSON.stringify({
  status: "PASS",
  readout: {
    runes: translit(decoded),
    gp0: readoutGp0,
    tableToken: tableTokens[readoutGp0],
    base59Value,
    base60Value,
    runeCount: decoded.length,
    circumferenceCount: base59Value / 29,
    remainder: base59Value % 29,
    cubeOrbit,
    predictedPageReceiver: 0,
  },
  controls: {
    zeroBase59Cells,
    exactBase59,
    exactBase60Count: 0,
    directCubeP0TitleReachable: reachable,
    directCubeP0TitleTotal: p0Plain.length,
  },
  literalSplit: {
    readGp0,
    p55RuneCount: corpus.pages.find((page) => page.page === 55).indices.length,
    perimeterCount: perimeter.length,
    readCellPerimeterOrdinal0: perimeter.indexOf(readGp0),
  },
}, null, 2));
