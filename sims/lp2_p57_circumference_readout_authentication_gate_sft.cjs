"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function modPow(base, exponent, modulus) {
  let result = 1;
  let x = ((base % modulus) + modulus) % modulus;
  let e = exponent;
  while (e > 0) {
    if (e % 2 === 1) result = (result * x) % modulus;
    x = (x * x) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

/** @param {number} value @param {number} modulus @returns {number|null} */
function inverseModulo(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const table = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;

/** @param {string} token @returns {number} */
function decode60(token) {
  return alphabet60.indexOf(token[0]) * 60 + alphabet60.indexOf(token[1]);
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} text @returns {number[][]} */
function looseRuneWords(text) {
  const words = [];
  let current = [];
  function flush() {
    if (!current.length) return;
    words.push(current.slice());
    current = [];
  }
  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length && "•⁘⁜⁚ \n".includes(character)) {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * Physical-page parser using LP2 '-' and '.' boundaries.
 * @param {string} text
 * @returns {{runes:number[],words:Array<{one:number,zero:number,start:number,end:number,len:number,values:number[]}>}}
 */
function parsePhysical(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      one: words.length + 1,
      zero: words.length,
      start,
      end: offset - 1,
      len: current.length,
      values: current.slice(),
    });
    current = [];
  }

  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      runes.push(value);
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if ((character === "-" || character === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number[]} values @returns {number} */
function nonemptyLayerCount(values) {
  let count = 0;
  let current = values.slice();
  while (current.length > 0) {
    count += 1;
    current = current.slice(1, -1);
  }
  return count;
}

/** @param {number[]} values @returns {number} */
function shedActionCount(values) {
  let count = 0;
  let current = values.slice();
  while (current.length > 1) {
    current = current.slice(1, -1);
    count += 1;
  }
  return count;
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Rows = looseRuneWords(p57.source_text).map((values, index) => {
  const address = gp0(values);
  const token = table[address];
  return {
    index,
    word: spell(values),
    values,
    address,
    token,
    value60: decode60(token),
  };
});

/** @param {string} word */
function p57Row(word) {
  const row = p57Rows.find((candidate) => candidate.word === word);
  assert.ok(row, "missing p57 word " + word);
  return row;
}

const cueWords = [
  "SHED", "OUR", "OWN", "CIRCUMFERENCES",
  "FIND", "THE", "DIUINITY", "WITHIN", "AND", "EMERGE",
];
const p57Spelling = p57Rows.map((row) => row.word);
const cueStart = p57Spelling.findIndex((_, start) =>
  cueWords.every((word, offset) => p57Spelling[start + offset] === word)
);
assert.ok(cueStart >= 0);

// Frozen state. The direct signed-2016 reconstruction independently supplies
// the same tuple; this issue permits the frozen tuple as starting evidence.
const state = { p:23, g:5, a:6, b:15, A:8, B:19, K:2, e:3, q:4 };
assert.deepEqual(
  [p57Row("DIUINITY").value60, p57Row("THE").value60,
   p57Row("AND").value60, p57Row("EMERGE").value60]
    .map((value) => [Math.floor(value / 29), value % 29]),
  [[state.K,state.g],[state.e,state.b],[state.A,state.p-1],[state.a,state.B]]
);

// FIND selects p28 through the fixed whole-word GP0 -> p50 -> native-base60 map.
const find = p57Row("FIND");
assert.equal(find.address, 42);
assert.equal(find.value60, 28);
const selectedPage = find.value60;
const p28 = parsePhysical(physicalPart(selectedPage));
assert.equal(p28.runes.length, 269);
const p28Center = (p28.runes.length - 1) / 2;
assert.equal(p28Center, 134);

// Charge one-based and zero-based page-number word origins before output.
const originRows = [
  { origin:"one", word:p28.words[selectedPage - 1] },
  { origin:"zero", word:p28.words[selectedPage] },
].map((row) => ({
  ...row,
  adjacentToCenter: row.word.start === p28Center + 1,
  lengthIsG: row.word.len === state.g,
  layers: nonemptyLayerCount(row.word.values),
  sheds: shedActionCount(row.word.values),
}));
assert.deepEqual(
  originRows.map((row) => [
    row.origin,row.word.one,row.word.start,row.word.len,
    row.adjacentToCenter,row.lengthIsG,row.layers,row.sheds,
  ]),
  [
    ["one",28,135,5,true,true,3,2],
    ["zero",29,140,2,false,false,1,1],
  ]
);
const structurallySelected = originRows.filter((row) =>
  row.adjacentToCenter &&
  row.lengthIsG &&
  row.layers === state.e &&
  row.sheds === state.K
);
assert.equal(structurallySelected.length, 1);
assert.equal(structurallySelected[0].origin, "one");
const p28Word = structurallySelected[0].word;
const p28CenterValues = [p28.runes[p28Center]];

// Complete low-description action-count/direction controls.
const inverseE = inverseModulo(state.e, 28);
assert.equal(inverseE, 19);
const countModes = [
  { name:"nonempty", wordCount:nonemptyLayerCount(p28Word.values) },
  { name:"shed-actions", wordCount:shedActionCount(p28Word.values) },
];
const centerModes = [
  { name:"nonempty", centerCount:1 },
  { name:"zero-index", centerCount:0 },
];
const directionModes = [
  { name:"forward-e", base:state.e },
  { name:"inverse-e", base:inverseE },
];

const family = [];
for (const countMode of countModes) {
  for (const centerMode of centerModes) {
    for (const directionMode of directionModes) {
      const centerExponent = modPow(directionMode.base, centerMode.centerCount, 28);
      const wordExponent = modPow(directionMode.base, countMode.wordCount, 28);
      family.push({
        countMode:countMode.name,
        centerMode:centerMode.name,
        direction:directionMode.name,
        centerExponent,
        wordExponent,
      });
    }
  }
}
assert.equal(family.length, 8);
const chargedConfigurations = originRows.length * family.length;
assert.equal(chargedConfigurations, 16);
assert.deepEqual(
  family.find((row) =>
    row.countMode === "nonempty" &&
    row.centerMode === "nonempty" &&
    row.direction === "forward-e"
  ),
  {
    countMode:"nonempty",
    centerMode:"nonempty",
    direction:"forward-e",
    centerExponent:3,
    wordExponent:27,
  }
);
// The source itself makes both K=2 sheds and e=3 nonempty layers typed.
// Hence p57 does not mathematically force the word action-count convention:
assert.deepEqual(
  family.find((row) =>
    row.countMode === "shed-actions" &&
    row.centerMode === "nonempty" &&
    row.direction === "forward-e"
  ),
  {
    countMode:"shed-actions",
    centerMode:"nonempty",
    direction:"forward-e",
    centerExponent:3,
    wordExponent:9,
  }
);

// Diagnostic only after the family is frozen: the nonempty/forward grammar is
// the previously reported p28 output.
const canonical = family.find((row) =>
  row.countMode === "nonempty" &&
  row.centerMode === "nonempty" &&
  row.direction === "forward-e"
);
const p28Source = [...p28CenterValues, ...p28Word.values];
const p28Output = [
  modPow(p28CenterValues[0], canonical.centerExponent, 29),
  ...p28Word.values.map((value) => modPow(value, canonical.wordExponent, 29)),
];
assert.deepEqual(p28Source, [9,28,24,10,1,20]);
assert.deepEqual(p28Output, [4,28,23,3,1,16]);

// Held-out solved transfer was frozen before output inspection.
// TUNNELNG is a solved p57 word; its fixed map selects physical p56.
const tunnel = p57Row("TUNNELNG");
assert.equal(tunnel.address, 94);
assert.equal(tunnel.value60, 56);
const transferPage = tunnel.value60;
const p56Cipher = parsePhysical(physicalPart(transferPage));
assert.equal(p56Cipher.runes.length, 85);
const p56Center = (p56Cipher.runes.length - 1) / 2;
assert.equal(p56Center, 42);
const p56NextWord = p56Cipher.words.find((word) => word.start === p56Center + 1);
assert.ok(p56NextWord);
assert.equal(p56NextWord.len, 2);

// Apply the unchanged nonempty-layer/forward-e grammar.
// Singleton center has one layer; the two-rune word has one nonempty layer.
const p56CenterExponent = modPow(state.e, 1, 28);
const p56WordExponent = modPow(
  state.e,
  nonemptyLayerCount(p56NextWord.values),
  28
);
assert.deepEqual([p56CenterExponent,p56WordExponent],[3,3]);
const p56CipherSpan = [p56Cipher.runes[p56Center], ...p56NextWord.values];
const p56PredictedPlain = [
  modPow(p56CipherSpan[0], p56CenterExponent, 29),
  ...p56CipherSpan.slice(1).map((value) => modPow(value,p56WordExponent,29)),
];
assert.deepEqual(p56CipherSpan,[2,5,25]);
assert.deepEqual(p56PredictedPlain,[8,9,23]);

// Exact solved plaintext runes are aligned by rune offset even though the
// solved text has different word segmentation.
const p56Solved = solved.sections.find((section) => section.name === "p56_an_end");
assert.ok(p56Solved);
const p56PlainRunes = [...p56Solved.source_text]
  .map((character) => runeIndex.get(character))
  .filter((value) => value !== undefined);
assert.equal(p56PlainRunes.length,p56Cipher.runes.length);
const p56ActualPlain = p56PlainRunes.slice(p56Center,p56Center+3);
assert.deepEqual(p56ActualPlain,[15,16,3]);
assert.notDeepEqual(p56PredictedPlain,p56ActualPlain);

// Census the p57 words whose fixed map points to physical LP2 pages.
// This confirms p28 is the only direct p57-selected page whose page-numbered
// word itself starts at an integer center+1.
const physicalPointers = p57Rows
  .filter((row) => row.value60 >= 0 && row.value60 <= 57 && row.value60 !== 50)
  .map((row) => {
    const page = row.value60;
    const parsed = parsePhysical(physicalPart(page));
    const integerCenter = parsed.runes.length % 2 === 1;
    const center = integerCenter ? (parsed.runes.length - 1) / 2 : null;
    const pageWord = parsed.words[page - 1] || null;
    return {
      word:row.word,
      page,
      integerCenter,
      pageWord:pageWord ? {start:pageWord.start,len:pageWord.len} : null,
      pageWordAtCenter:
        integerCenter && pageWord !== null && pageWord.start === center + 1,
    };
  });
assert.deepEqual(
  physicalPointers.filter((row) => row.pageWordAtCenter).map((row) => [row.word,row.page]),
  [["FIND",28]]
);

// Manuscript-wide matched geometry census. P28 is the sole exact-center page
// whose immediately following complete word is odd-length and therefore has a
// literal single-rune "divinity within" after repeated circumference shedding.
const centerAdjacentFamily = [];
for (let page = 0; page <= 57; page += 1) {
  if (page === 50) continue;
  const parsed = parsePhysical(physicalPart(page));
  if (parsed.runes.length % 2 === 0) continue;
  const center = (parsed.runes.length - 1) / 2;
  const nextWord = parsed.words.find((word) => word.start === center + 1);
  if (!nextWord) continue;
  centerAdjacentFamily.push({
    page,
    runes:parsed.runes.length,
    center,
    word:nextWord.one,
    length:nextWord.len,
    oddWord:nextWord.len % 2 === 1,
  });
}
assert.deepEqual(
  centerAdjacentFamily.map((row) => [row.page,row.length]),
  [[3,4],[17,4],[25,4],[28,5],[56,2]]
);
assert.deepEqual(
  centerAdjacentFamily.filter((row) => row.oddWord).map((row) => row.page),
  [28]
);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "Director #1779 negative authentication gate: solved p57 circumference language strongly compresses the local p28 (3,27) model and uniquely selects one-based word28 by pre-output geometry, but the source types both K=2 circumference removals and e=3 nonempty layers, so the action-count convention is not uniquely forced. More decisively, the unchanged nonempty-layer/forward-e grammar fails the p57-selected solved p56 center-plus-word holdout at all three runes.",
  p57:{
    cue:cueWords,
    find:{address:find.address,token:find.token,page:selectedPage},
    tunnel:{address:tunnel.address,token:tunnel.token,page:transferPage},
    state,
  },
  p28:{
    originRows:originRows.map((row)=>({
      origin:row.origin,word:row.word.one,start:row.word.start,len:row.word.len,
      adjacentToCenter:row.adjacentToCenter,lengthIsG:row.lengthIsG,
      layers:row.layers,sheds:row.sheds,
    })),
    structurallySelectedOrigin:structurallySelected[0].origin,
    chargedConfigurations,
    actionFamily:family,
    source:p28Source,
    canonicalExponents:[canonical.centerExponent,canonical.wordExponent],
    diagnosticOutput:p28Output,
  },
  transfer:{
    selector:"p57 TUNNELNG -> GP0 94 -> p50 native-base60 56 -> physical p56",
    center:p56Center,
    nextWord:{start:p56NextWord.start,len:p56NextWord.len},
    exponents:[p56CenterExponent,p56WordExponent],
    cipher:p56CipherSpan,
    predicted:p56PredictedPlain,
    actual:p56ActualPlain,
    exactMatch:false,
  },
  physicalPointerControls:physicalPointers,
  centerAdjacentFamily,
},null,2));
