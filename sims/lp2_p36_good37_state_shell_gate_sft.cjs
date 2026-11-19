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
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} page @returns {{ordinal:number,start:number,end:number,values:number[]}[]} */
function canonicalWords(page) {
  const out = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  function flush() {
    if (current.length === 0) return;
    out.push({
      ordinal: out.length + 1,
      start,
      end: runeOffset - 1,
      values: current.slice()
    });
    current = [];
  }

  for (const character of [...physicalPart(page)]) {
    const value = runeToValue.get(character);
    if (value !== undefined) {
      if (current.length === 0) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((character === "-" || character === ".") && current.length) {
      flush();
    }
  }
  flush();
  return out;
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

const start = signed2016.indexOf("Hello.");
const end = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
const sourceWords = signed2016
  .slice(start, end)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[36], "GOOD");

// One-based source ordinal37 selects project p36 canonical word37.
const selected = canonicalWords(36)[36];
assert.deepEqual(selected, {
  ordinal: 37,
  start: 169,
  end: 173,
  values: [2, 22, 4, 1, 20]
});

const shell = H5(selected.values);
assert.deepEqual(shell, [11, 21, 4, 23, 22]);
assert.deepEqual(shell, [
  6 + 5,  // a+g
  23 - 2, // p-K
  4,      // q
  23,     // p
  23 - 1  // p-1
]);

// Exact manuscript-wide shell census over canonical five-rune words.
const shellKey = shell.join(",");
const hits = [];
let fiveRuneWords = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of canonicalWords(page)) {
    if (word.values.length !== 5) continue;
    fiveRuneWords += 1;
    if (H5(word.values).join(",") === shellKey) {
      hits.push({
        page,
        ordinal: word.ordinal,
        start: word.start,
        values: word.values
      });
    }
  }
}
assert.equal(fiveRuneWords, 318);
assert.deepEqual(hits, [{
  page: 36,
  ordinal: 37,
  start: 169,
  values: [2, 22, 4, 1, 20]
}]);

// Precommitted continuation: q=4 means fourth canonical word after visible section1 starts at rune99.
const section1 = canonicalWords(36).filter((word) => word.start >= 99);
assert.deepEqual(
  section1.slice(0, 4).map((word) => ({
    ordinal: word.ordinal,
    start: word.start,
    length: word.values.length
  })),
  [
    { ordinal: 21, start: 99, length: 4 },
    { ordinal: 22, start: 103, length: 3 },
    { ordinal: 23, start: 106, length: 8 },
    { ordinal: 24, start: 114, length: 2 }
  ]
);

const qth = section1[4 - 1];
assert.equal(qth.start, 114);
assert.equal(qth.values.length, 2);

// GOOD is four GP runes, so this receiver fork fails by length before any key fit.
assert.equal(corpus.translit[6], "G");
assert.equal(corpus.translit[3], "O");
assert.equal(corpus.translit[23], "D");
const good = [6, 3, 3, 23];
assert.equal(good.length, 4);
assert.notEqual(qth.values.length, good.length);

console.log(JSON.stringify({
  status: "PASS",
  source: { zeroBasedIndex: 36, oneBasedOrdinal: 37, word: "GOOD" },
  selectedCoordinate: {
    page: 36,
    word: 37,
    offsets: [selected.start, selected.end],
    values: selected.values,
    H5: shell,
    stateTyping: ["a+g", "p-K", "q", "p", "p-1"]
  },
  familyControl: { fiveRuneWords, exactShellHits: hits },
  precommittedQSection1Gate: {
    q: 4,
    selectedOffsets: [qth.start, qth.end],
    selectedLength: qth.values.length,
    goodLength: good.length,
    result: "FAIL_LENGTH_GATE"
  },
  decision:
    "GOOD37 selects a manuscript-unique DH-state H5 packet on p36, strengthening the numbered route as navigation/state evidence. The frozen q-th section1 plaintext branch fails at the length gate, so GOOD plaintext remains unresolved."
}, null, 2));
