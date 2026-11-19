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

function H4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

function H5(values) {
  assert.equal(values.length, 5);
  return [
    mod29(values[0] - values[4]),
    mod29(values[1] - values[3]),
    values[2],
    mod29(values[1] + values[3]),
    mod29(values[0] + values[4]),
  ];
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeToValue = new Map(corpus.runes.map((rune, value) => [rune, value]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, "unmapped " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

function canonicalWords(page) {
  const out = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;
  function flush() {
    if (!current.length) return;
    out.push({
      ordinal: out.length + 1,
      start,
      end: runeOffset - 1,
      values: current.slice(),
    });
    current = [];
  }
  for (const character of [...physicalPart(page)]) {
    const value = runeToValue.get(character);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((character === "-" || character === ".") && current.length) {
      flush();
    }
  }
  flush();
  return out;
}

const sourceWords = signed2016
  .slice(signed2016.indexOf("Hello."), signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"))
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());

assert.equal(sourceWords.length, 43);
assert.equal(sourceWords[4], "EMPTY");
assert.equal(sourceWords[36], "GOOD");
assert.equal(sourceWords[40], "PATHS");

const state = Object.freeze({
  p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4,
});
const stateEntries = Object.entries(state);

const fiveRuneWords = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const word of canonicalWords(page)) {
    if (word.values.length === 5) {
      fiveRuneWords.push({page, ...word, shell: H5(word.values)});
    }
  }
}
assert.equal(fiveRuneWords.length, 318);

const qCentered = fiveRuneWords.filter((word) => word.values[2] === state.q);
assert.deepEqual(
  qCentered.map((word) => [word.page, word.ordinal, word.start]),
  [
    [2,9,31],
    [5,37,157],
    [8,22,89],
    [17,17,59],
    [18,57,238],
    [36,37,169],
    [39,24,105],
    [40,41,171],
    [49,16,53],
  ]
);

const diagonalQ = qCentered.filter((word) => word.ordinal === word.page + 1);
assert.deepEqual(
  diagonalQ.map((word) => [word.page, word.ordinal, sourceWords[word.page]]),
  [[36,37,"GOOD"], [40,41,"PATHS"]]
);

const p40 = diagonalQ.find((word) => word.page === 40);
assert.ok(p40);
assert.deepEqual(p40.values, [0,23,4,28,6]);
assert.deepEqual(p40.shell, [
  state.p,
  mod29(state.p + 1),
  state.q,
  mod29(state.p - 1),
  state.a,
]);

let familyComparisons = 0;
const familyHits = [];
for (const [xName, x] of stateEntries) {
  for (const [yName, y] of stateEntries) {
    const shell = [x, mod29(x + 1), state.q, mod29(x - 1), y];
    for (const word of fiveRuneWords) {
      familyComparisons += 1;
      if (word.shell.every((value, index) => value === shell[index])) {
        familyHits.push({
          x: xName,
          y: yName,
          page: word.page,
          ordinal: word.ordinal,
          start: word.start,
          values: word.values,
          shell,
        });
      }
    }
  }
}
assert.equal(familyComparisons, 25758);
assert.deepEqual(familyHits, [{
  x:"p",
  y:"a",
  page:40,
  ordinal:41,
  start:171,
  values:[0,23,4,28,6],
  shell:[23,24,4,22,6],
}]);

const emptied = [p40.values[0], p40.values[1], p40.values[3], p40.values[4]];
assert.deepEqual(emptied, [0,23,28,6]);
assert.deepEqual(H4(emptied), [state.p, state.p + 1, state.p - 1, state.a]);
assert.equal(mod29((state.p + 1) - (state.p - 1)), state.K);

const distinctAuth4 = [];
for (const word of sourceWords) {
  const values = gp(word);
  if (
    values.length === 4 &&
    !distinctAuth4.some((entry) => entry.values.join(",") === values.join(","))
  ) {
    distinctAuth4.push({word, values});
  }
}
assert.equal(distinctAuth4.length, 9);
const targetByValues = new Map(
  distinctAuth4.map((entry) => [entry.values.join(","), entry.word])
);

function permutations(values) {
  const out = [];
  function visit(items, index) {
    if (index === items.length) {
      out.push(items.slice());
      return;
    }
    for (let swap = index; swap < items.length; swap += 1) {
      [items[index], items[swap]] = [items[swap], items[index]];
      visit(items, index + 1);
      [items[index], items[swap]] = [items[swap], items[index]];
    }
  }
  visit(values.slice(), 0);
  return out;
}

const fixedP36Key = [25,19,27,26];
const fixedOutput = emptied.map(
  (value, index) => mod29(value - fixedP36Key[index])
);
assert.deepEqual(fixedOutput, [4,4,1,9]);
assert.equal(targetByValues.has(fixedOutput.join(",")), false);

const transferHits = [];
for (const key of permutations([19,25,26,27])) {
  for (const sign of [-1,1]) {
    const output = emptied.map(
      (value, index) => mod29(value + sign * key[index])
    );
    const target = targetByValues.get(output.join(","));
    if (target) transferHits.push({key, sign, target, output});
  }
}
assert.deepEqual(transferHits, []);

const paths = gp("PATHS");
assert.deepEqual(paths, [13,24,2,15]);
const p40Key = emptied.map((value, index) => mod29(value - paths[index]));
assert.deepEqual(p40Key, [16,28,26,20]);
assert.deepEqual(H4(p40Key), [
  mod29(state.p + state.K),
  state.K,
  mod29(state.p + state.K),
  mod29(state.g + state.K),
]);

console.log(JSON.stringify({
  status:"PASS",
  qCenteredCount:qCentered.length,
  sameDiagonalQ:diagonalQ.map((word) => ({
    page:word.page,
    ordinal:word.ordinal,
    source:sourceWords[word.page],
    start:word.start,
    values:word.values,
    H5:word.shell,
  })),
  p40StateFamily:{
    comparisons:familyComparisons,
    hits:familyHits,
  },
  prospectiveP36Transfer:{
    fixedKey:fixedP36Key,
    fixedOutput,
    completeFamilyOperations:48,
    authenticatedHits:transferHits,
    result:"FAIL",
  },
  targetConditionedReference:{
    target:"PATHS",
    targetValues:paths,
    key:p40Key,
    keyH:H4(p40Key),
    status:"REFERENCE_ONLY_NOT_DECODER",
  },
  decision:"P40 word41 is a unique target-independent [p,p+1,q,p-1,a] state packet in the same EMPTY-center diagonal family as p36. The frozen p36 GOOD decoder does not transfer, so keep p40 word41 as state/navigation evidence rather than PATHS plaintext.",
}, null, 2));
