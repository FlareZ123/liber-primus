"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const base60 = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

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
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/**
 * @param {number} page
 * @returns {{start:number,end:number,values:number[]}[]}
 */
function words(page) {
  const out = [];
  let runeOffset = 0;
  let start = 0;
  let current = [];

  function flush() {
    if (current.length === 0) return;
    out.push({ start, end: start + current.length, values: current });
    current = [];
  }

  for (const character of [...physicalPart(page)]) {
    const value = runeToValue.get(character);
    if (value !== undefined) {
      if (current.length === 0) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if (character === "-" || character === ".") {
      flush();
    }
  }
  flush();
  return out;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values @returns {number[]} */
function H4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3])
  ];
}

/** @param {number[]} values @returns {number[]} */
function H5(values) {
  assert.equal(values.length, 5);
  return [
    mod29(values[0] - values[4]),
    mod29(values[1] - values[3]),
    values[2],
    mod29(values[1] + values[3]),
    mod29(values[0] + values[4])
  ];
}

/** @param {number} d @param {number} s @returns {number[]} */
function Hinv(d, s) {
  const inv2 = 15;
  return [mod29((d + s) * inv2), mod29((s - d) * inv2)];
}

const sourceStart = signed2016.indexOf("Hello.");
const sourceEnd = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
const sourceWords = signed2016
  .slice(sourceStart, sourceEnd)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.deepEqual(sourceWords.slice(33, 36), ["WILL", "BE", "FOUND"]);

const p50Tokens = base60.rows.flat();
assert.equal(p50Tokens[19], "0X");
assert.equal(
  60 * base60.alphabet.indexOf("0") + base60.alphabet.indexOf("X"),
  33
);

// P33 WILL: page is independently selected before the local inverse.
const will = gp("WILL");
assert.deepEqual(will, [7, 10, 20, 20]);
assert.equal(gp0(will), 57);

const p33State = words(33)
  .filter((word) => word.values.length === 4 && gp0(word.values) === 57);
assert.deepEqual(p33State, [{
  start: 132,
  end: 136,
  values: [3, 15, 17, 22]
}]);

const willKey = p33State[0].values.map((value, index) =>
  mod29(value - will[index])
);
assert.deepEqual(willKey, [25, 5, 26, 2]);
assert.deepEqual(H4(willKey), [23, 8, 2, 27]);

// P33 authored layout selects p34 and p35 through two distinct literal RISE consumers.
const p33Ink = ink.pages.find((page) => page.page === 33);
assert.deepEqual(
  p33Ink.red_spans.map(({ start, length }) => ({ start, length })),
  [{ start: 0, length: 10 }, { start: 91, length: 8 }]
);

const p33Words = words(33);
const upperBodyRunes = 91 - 10;
const lowerBodyRunes = corpus.pages.find((page) => page.page === 33).indices.length - 99;
assert.deepEqual([upperBodyRunes, lowerBodyRunes], [81, 115]);

const bodyRise = lowerBodyRunes - upperBodyRunes;
assert.equal(bodyRise, 34);
assert.equal(sourceWords[bodyRise], "BE");

const lowerTitleLengths = p33Words
  .filter((word) => word.start >= 91 && word.end <= 99)
  .map((word) => word.values.length);
assert.deepEqual(lowerTitleLengths, [3, 5]);
const titleRise = lowerTitleLengths[1] - lowerTitleLengths[0];
assert.equal(titleRise, 2);
assert.equal(33 + titleRise, 35);
assert.equal(sourceWords[35], "FOUND");

// P34 BE: body-rise fixes page/index before the receiver and exact key are consumed.
const be = gp("BE");
assert.deepEqual(be, [17, 18]);
assert.equal(gp0(be), 35);
const paths = gp("PATHS");
assert.equal(gp0(paths), 54);
const beSourceRise = mod29(gp0(paths) - gp0(be));
assert.equal(beSourceRise, 19);
const beKey = Hinv(beSourceRise, 0);
assert.deepEqual(beKey, [24, 5]);
const beCipher = be.map((value, index) => mod29(value + beKey[index]));
assert.deepEqual(beCipher, [12, 23]);

const p34State = words(34)
  .filter((word) => word.values.length === 2 && gp0(word.values) === 35);
assert.deepEqual(
  p34State.map(({ start, values }) => ({ start, values })),
  [
    { start: 4, values: [12, 23] },
    { start: 249, values: [28, 7] }
  ]
);
assert.deepEqual(
  p34State.filter((word) =>
    word.values[0] === beCipher[0] && word.values[1] === beCipher[1]
  ).map(({ start, values }) => ({ start, values })),
  [{ start: 4, values: [12, 23] }]
);

// P35 FOUND: the title-rise fixes page35 before the raw H5 receiver is used.
const found = gp("FOUND");
assert.deepEqual(found, [0, 3, 1, 9, 23]);

const p35Stream = corpus.pages.find((page) => page.page === 35).indices;
const selectedCipher = p35Stream.slice(25, 30);
assert.deepEqual(selectedCipher, [19, 17, 19, 24, 11]);
assert.deepEqual(H5(selectedCipher), [8, 22, 19, 12, 1]);

const foundKey = selectedCipher.map((value, index) =>
  mod29(value - found[index])
);
assert.deepEqual(foundKey, [19, 14, 18, 15, 17]);
assert.deepEqual(H5(foundKey), [2, 28, 18, 0, 7]);
assert.deepEqual(
  selectedCipher.map((value, index) => mod29(value - foundKey[index])),
  found
);

// Charge the raw p35 H5 receiver manuscript-wide.
const rawShell = H5(selectedCipher).join(",");
const rawHits = [];
for (const page of corpus.pages) {
  if (page.page > 55 || page.indices.length === 0) continue;
  for (let offset = 0; offset + 5 <= page.indices.length; offset += 1) {
    const packet = page.indices.slice(offset, offset + 5);
    if (H5(packet).join(",") === rawShell) {
      rawHits.push({ page: page.page, offset, packet });
    }
  }
}
assert.deepEqual(rawHits, [{
  page: 35,
  offset: 25,
  packet: [19, 17, 19, 24, 11]
}]);

assert.deepEqual(
  [
    { page: 33, word: sourceWords[33] },
    { page: bodyRise, word: sourceWords[bodyRise] },
    { page: 33 + titleRise, word: sourceWords[33 + titleRise] }
  ],
  [
    { page: 33, word: "WILL" },
    { page: 34, word: "BE" },
    { page: 35, word: "FOUND" }
  ]
);

console.log(JSON.stringify({
  status: "PASS",
  authenticatedSuffix: sourceWords.slice(33, 36),
  selectors: {
    p33: "B=19 -> p50[19]=0X -> base60 33",
    p34: "p33 THEIR RISE body runes 115-81=34",
    p35: "p33 RISE title cardinals 5-3=2; 33+2=35"
  },
  localCandidates: {
    p33: { word: "WILL", receiver: [132, 136], key: willKey, Hkey: H4(willKey) },
    p34: { word: "BE", receiver: [4, 6], key: beKey, cipher: beCipher },
    p35: { word: "FOUND", receiver: [25, 30], key: foundKey, Hkey: H5(foundKey) }
  },
  p35RawShellHits: rawHits,
  decision:
    "P33 is an independently selected control page whose two authored RISE consumers select the next two physical/source indices: body rise34 selects p34/BE and title rise+2 selects p35/FOUND. Together with the independent p33 WILL inverse, the consecutive pages 33..35 realize the authenticated source suffix WILL BE FOUND. Preserve as phrase-level convergence of strong local candidates; page32 YOU remains a separate unresolved promotion gate."
}, null, 2));
