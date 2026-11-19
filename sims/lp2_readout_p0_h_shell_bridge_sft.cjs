"use strict";

/**
 * SFT: source-selected READ OUT p0 receiver under the already frozen
 * mirrored H shell transform.
 *
 * Run:
 *   node sims/lp2_readout_p0_h_shell_bridge_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * Parse the repository's printed-word convention used by the existing
 * READ OUT/MLCD receiver work.
 * @param {string} text
 * @returns {{start:number,values:number[]}[]}
 */
function pageWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  for (const char of [...text]) {
    if (runeSet.has(char)) {
      if (current.length === 0) start = offset;
      current.push(runeIndex.get(char));
      offset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      words.push({start, values: current});
      current = [];
    }
  }

  if (current.length) words.push({start, values: current});
  return words;
}

/** @param {string} text @returns {number[][]} */
function sourceWords(text) {
  return (text.match(/[\u16A0-\u16FF]+/gu) || [])
    .map((word) => [...word].map((rune) => runeIndex.get(rune)));
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values @returns {number} */
function gp1(values) {
  return values.reduce((sum, value) => sum + value + 1, 0);
}

/** @param {number[]} values @returns {number} */
function gpPrime(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => {
    if (value === 21) return "ING";
    if (value === 27) return "IO";
    return corpus.translit[value];
  }).join("");
}

/**
 * The already frozen reversible circumference map.
 * @param {number} left
 * @param {number} right
 * @returns {[number,number]}
 */
function H(left, right) {
  return [
    ((left - right) % 29 + 29) % 29,
    (left + right) % 29,
  ];
}

/**
 * Apply H to the two mirrored word-shell vectors. The first two outputs are
 * the two shell differences; the second two are the shell sums.
 * @param {number[]} residues
 * @returns {number[]}
 */
function mirroredH4(residues) {
  assert.equal(residues.length, 4);
  const left = [residues[0], residues[1]];
  const rightOut = [residues[3], residues[2]];
  return [
    (left[0] - rightOut[0] + 29) % 29,
    (left[1] - rightOut[1] + 29) % 29,
    (left[0] + rightOut[0]) % 29,
    (left[1] + rightOut[1]) % 29,
  ];
}

const tableBytes = grid.pages.flatMap((page) => page.bytes);

// The already recovered instruction READ OUT supplies the fixed addresses.
const READ = [4, 28, 23];
const OUT = [3, 1, 16];
assert.equal(spell(READ), "READ");
assert.equal(spell(OUT), "OUT");
assert.equal(gp0(READ), 55);
assert.equal(gp0(OUT), 20);
assert.equal(tableBytes[gp0(READ)], 80);
assert.equal(tableBytes[gp0(OUT)], 102);

const p0Words = pageWords(physicalPart(0));
const selected = p0Words.filter(
  (word) =>
    word.start >= 80 &&
    word.start + word.values.length - 1 <= 102
);
assert.equal(selected.length, 4);
assert.deepEqual(
  selected.map((word) => [
    word.start,
    word.values.length,
    gp0(word.values),
    gp0(word.values) % 29,
  ]),
  [
    [80, 3, 48, 19],
    [83, 7, 78, 20],
    [90, 5, 63, 5],
    [95, 8, 139, 23],
  ]
);

const residues = selected.map((word) => gp0(word.values) % 29);
assert.deepEqual(residues, [19, 20, 5, 23]);
assert.equal(spell(residues), "MLCD");

// The independently established DH23 state types three of the four receiver
// residues; the decoded instruction itself types the remaining 20 as OUT.
const dh = {p: 23, g: 5, a: 6, A: 8, B: 19, b: 15, K: 2};
assert.deepEqual(
  [residues[0], residues[1], residues[2], residues[3]],
  [dh.B, gp0(OUT), dh.g, dh.p]
);

// Vector H across the mirrored word shells.
const hOutput = mirroredH4(residues);
assert.deepEqual(hOutput, [25, 15, 13, 25]);

// The solved p57 instruction provides the fixed interpretation register.
const p57Section = solved.sections.find((section) => /p57/i.test(section.name));
assert.ok(p57Section);
const p57Words = sourceWords(p57Section.source_text);
assert.equal(p57Words.length, 20);
const p57Rows = p57Words.map((word, index) => ({
  position: index + 1,
  word: spell(word),
  residue: gp0(word) % 29,
}));

/**
 * @param {number[]} sequence
 * @returns {{position:number,word:string,residue:number}[][]}
 */
function embeddings(sequence) {
  const out = [];

  /**
   * @param {number} sequenceIndex
   * @param {number} p57Index
   * @param {{position:number,word:string,residue:number}[]} chosen
   */
  function visit(sequenceIndex, p57Index, chosen) {
    if (sequenceIndex === sequence.length) {
      out.push(chosen);
      return;
    }
    for (let index = p57Index; index < p57Rows.length; index += 1) {
      if (p57Rows[index].residue === sequence[sequenceIndex]) {
        visit(sequenceIndex + 1, index + 1, [...chosen, p57Rows[index]]);
      }
    }
  }

  visit(0, 0, []);
  return out;
}

const selectedEmbeddings = embeddings(hOutput);
assert.deepEqual(selectedEmbeddings, [[
  {position: 9, word: "WE", residue: 25},
  {position: 14, word: "CIRCUMFERENCES", residue: 15},
  {position: 15, word: "FIND", residue: 13},
  {position: 20, word: "EMERGE", residue: 25},
]]);

// Those positions are exactly the boundary words around the two p57 clauses:
// WE [MUST SHED OUR OWN] CIRCUMFERENCES
// FIND [THE DIVINITY WITHIN AND] EMERGE
assert.deepEqual(
  p57Rows.slice(9, 13).map((row) => row.word),
  ["MUST", "SHED", "OUR", "OWN"]
);
assert.deepEqual(
  p57Rows.slice(15, 19).map((row) => row.word),
  ["THE", "DIUINITY", "WITHIN", "AND"]
);

// Manuscript-wide fixed-family control.
let fourWordWindows = 0;
let p57SubsequenceHits = 0;
let uniqueEmbeddingHits = 0;
const exactOutputHits = [];

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = pageWords(physicalPart(page));

  for (let index = 0; index <= words.length - 4; index += 1) {
    fourWordWindows += 1;
    const window = words.slice(index, index + 4);
    const windowResidues = window.map((word) => gp0(word.values) % 29);
    const output = mirroredH4(windowResidues);
    const matches = embeddings(output);

    if (matches.length > 0) p57SubsequenceHits += 1;
    if (matches.length === 1) uniqueEmbeddingHits += 1;
    if (output.every((value, i) => value === hOutput[i])) {
      exactOutputHits.push({
        page,
        word: index + 1,
        start: window[0].start,
        residues: windowResidues,
      });
    }
  }
}

assert.equal(fourWordWindows, 2763);
assert.equal(p57SubsequenceHits, 11);
assert.equal(uniqueEmbeddingHits, 8);
assert.deepEqual(exactOutputHits, [{
  page: 0,
  word: 18,
  start: 80,
  residues: [19, 20, 5, 23],
}]);

// Bounded consumer negative 1: applying the same H to all eleven mirrored
// rune shells of the 23-rune receiver does not expose a clear instruction.
const p0 = corpus.pages.find((page) => page.page === 0);
assert.ok(p0);
const block = p0.indices.slice(80, 103);
assert.equal(block.length, 23);
assert.equal(block[11], 0);
const leftRunes = block.slice(0, 11);
const rightRunesOut = block.slice(12).reverse();
const diff = [];
const sum = [];
for (let index = 0; index < 11; index += 1) {
  const pair = H(leftRunes[index], rightRunesOut[index]);
  diff.push(pair[0]);
  sum.push(pair[1]);
}
const runeH = [...diff, block[11], ...sum];
assert.equal(
  spell(runeH),
  "AIOINGESEMFTHUCFEDEOTHGIONRAJE"
);

// Bounded consumer negative 2: literal nested rune peeling finds no exact
// DIVINITY metric under GP0, GP1, or GP-prime.
const divinity = p57Words.find((word) => spell(word) === "DIUINITY");
assert.ok(divinity);
const divinityMetrics = {
  gp0: gp0(divinity),
  gp1: gp1(divinity),
  gpPrime: gpPrime(divinity),
};
assert.deepEqual(divinityMetrics, {gp0: 105, gp1: 113, gpPrime: 376});

const nestedMetricHits = [];
for (let peel = 0; peel <= 11; peel += 1) {
  const inside = block.slice(peel, block.length - peel);
  const metrics = {
    gp0: gp0(inside),
    gp1: gp1(inside),
    gpPrime: gpPrime(inside),
  };
  for (const metric of Object.keys(divinityMetrics)) {
    if (metrics[metric] === divinityMetrics[metric]) {
      nestedMetricHits.push({peel, metric, value: metrics[metric]});
    }
  }
}
assert.deepEqual(nestedMetricHits, []);

console.log(JSON.stringify({
  status: "PASS",
  receiver: {
    span: [80, 102],
    wordGp0: selected.map((word) => gp0(word.values)),
    wordResidues: residues,
    residueText: spell(residues),
    typedAs: ["B", "OUT", "g", "p"],
  },
  mirroredH: {
    output: hOutput,
    p57Embedding: selectedEmbeddings[0],
    omittedClauses: [
      ["MUST", "SHED", "OUR", "OWN"],
      ["THE", "DIUINITY", "WITHIN", "AND"],
    ],
  },
  control: {
    fourWordWindows,
    p57SubsequenceHits,
    uniqueEmbeddingHits,
    exactOutputHits,
  },
  boundedNegatives: {
    runeLevelMirroredH: spell(runeH),
    nestedDivinityMetricHits,
  },
  classification:
    "source-constrained word-level state/instruction bridge; no unknown plaintext recovered",
}, null, 2));
