"use strict";

/**
 * SFT: LEAD=82 -> p50 -> p0 word -> authenticated 2016 word -> p0 receiver.
 *
 * Frozen upstream premise:
 * - the p0 THE ROAD branch existed before this test;
 * - ROAD's additive key residues are [12,5,1,4], ordinary A1Z26 LEAD;
 * - the later LEAD=atomic-number-82 interpretation was committed before this
 *   route was inspected.
 *
 * This test asks only what the already established p50 word/number pointer
 * grammar does with address 82. It does not assume DEVOTED plaintext letters.
 *
 * Run:
 *   node sims/lp2_p0_lead82_as_epiphany_chain_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tableTokens = grid.pages.flatMap(page => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

assert.equal(tableTokens.length, 256);
assert.equal(grid.bytes.length, 256);

/** @param {number[]} values */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number[]} values */
function translit(values) {
  return values.map(value => corpus.translit[value]).join("");
}

/** @param {string} word */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (normalized.startsWith("ING", i)) {
      out.push(21);
      i += 3;
      continue;
    }
    if (normalized.startsWith("IO", i)) {
      out.push(27);
      i += 2;
      continue;
    }
    const token = gpTokens.find(item => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling " + word + " at " + i);
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @param {string} source */
function parseSolvedWords(source) {
  return (source.match(/[\u16A0-\u16FF]+/gu) || []).map(word =>
    [...word].map(rune => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/** @param {number} pageNumber */
function parsePageWords(pageNumber) {
  const pages = transcription.split(/^\s*%\s*$/m);
  const source = pages[pageNumber];
  assert.ok(source);
  const words = [];
  let current = [];
  let offset = 0;
  let start = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: start + current.length - 1,
      length: current.length,
      indices: current,
      gp0: sum(current),
      translit: translit(current),
    });
    current = [];
  };

  for (const ch of [...source]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === ".") {
      flush();
    }
  }
  flush();

  const page = corpus.pages.find(item => item.page === pageNumber);
  assert.ok(page);
  assert.equal(offset, page.indices.length);
  return words;
}

/** @param {string} alphabet @param {number} address */
function decodeAt(alphabet, address) {
  assert.ok(address >= 0 && address < tableTokens.length);
  const token = tableTokens[address];
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter(token => /^[A-Za-z]+$/.test(token));
}

const p0 = parsePageWords(0);
assert.equal(p0.length, 59);
const p0ByStart = new Map(p0.map(word => [word.start, word]));

const message = signedWords();
assert.equal(message.length, 43);
assert.equal(message[5].toLowerCase(), "epiphany");

const p56Section = solved.find(section => section.name === "p56_an_end");
const p57Section = solved.find(section => section.name === "p57_parable");
assert.ok(p56Section);
assert.ok(p57Section);
const p56Words = parseSolvedWords(p56Section.source_text);
const p57Words = parseSolvedWords(p57Section.source_text);
assert.equal(p56Words.length, 25);
assert.equal(p57Words.length, 20);
assert.equal(translit(p56Words[19]), "PILGRIM");
assert.equal(translit(p57Words[19]), "EMERGE");
assert.equal(sum(p56Words[19]), 82);
assert.equal(sum(p57Words[19]), 83);

// Existing solved-text bracket: 3L is the outer duplicated class.
const duplicate3L = tableTokens
  .map((token, index) => token === "3L" ? index : -1)
  .filter(index => index >= 0);
assert.deepEqual(duplicate3L, [82, 128]);

// Frozen semantic number from the pre-existing ROAD/LEAD branch.
const leadAtomicNumber = 82;
assert.equal(leadAtomicNumber, sum(p56Words[19]));
assert.equal(tableTokens[leadAtomicNumber], "3L");

// Pre-MUST conventional base60 selects a complete p0 word start.
assert.equal(decodeAt(alphabet60, leadAtomicNumber), 201);
assert.equal(decodeAt(alphabet59, leadAtomicNumber), 198);
assert.equal(p0ByStart.has(198), false);
const asWord = p0ByStart.get(201);
assert.ok(asWord);
assert.deepEqual(
  {
    index: asWord.index,
    start: asWord.start,
    end: asWord.end,
    translit: asWord.translit,
    gp0: asWord.gp0,
  },
  { index: 45, start: 201, end: 202, translit: "AS", gp0: 39 }
);

// The same frozen pointer grammar now enters the authenticated signed message.
assert.equal(tableTokens[asWord.gp0], "05");
assert.equal(decodeAt(alphabet60, asWord.gp0), 5);
const selectedSignedWord = message[5];
assert.equal(selectedSignedWord.toLowerCase(), "epiphany");
const epiphanyGp0 = sum(gp(selectedSignedWord));
assert.equal(epiphanyGp0, 121);
assert.equal(tableTokens[epiphanyGp0], "3v");
assert.equal(decodeAt(alphabet60, epiphanyGp0), 237);

// 237 is a source-visible p0 word start, selected without its candidate letters.
const finalWord = p0ByStart.get(237);
assert.ok(finalWord);
assert.equal(finalWord.index, 53);
assert.equal(finalWord.length, 7);

/**
 * Complete same-radix census:
 * address -> p50 value -> p0 complete-word start
 * -> ciphertext-word GP0 -> p50 value -> signed-word index
 * -> signed-word GP0 -> p50 value.
 *
 * @param {string} alphabet
 * @param {string} name
 */
function census(alphabet, name) {
  const rows = [];
  for (let address = 0; address < 256; address += 1) {
    const first = decodeAt(alphabet, address);
    if (first === null) continue;
    const p0Word = p0ByStart.get(first);
    if (!p0Word || p0Word.gp0 >= 256) continue;

    const signedIndex = decodeAt(alphabet, p0Word.gp0);
    if (signedIndex === null || signedIndex >= message.length) continue;

    const signedWord = message[signedIndex];
    const signedGp0 = sum(gp(signedWord));
    if (signedGp0 >= 256) continue;

    const final = decodeAt(alphabet, signedGp0);
    if (final === null) continue;

    rows.push({
      radix: name,
      address,
      token: tableTokens[address],
      first,
      p0Word: p0Word.index,
      p0Translit: p0Word.translit,
      p0Gp0: p0Word.gp0,
      signedIndex,
      signedWord: signedWord.toLowerCase(),
      signedGp0,
      final,
    });
  }
  return rows;
}

const base60 = census(alphabet60, "base60");
const base59 = census(alphabet59, "base59");

assert.equal(base60.length, 5);
assert.deepEqual(base60.map(row => row.address), [82, 91, 128, 169, 176]);
assert.equal(base59.length, 2);
assert.deepEqual(base59.map(row => row.address), [47, 205]);

const target237 = base60.concat(base59)
  .filter(row => row.final === 237);
assert.deepEqual(
  target237.map(row => [row.radix, row.address, row.token]),
  [["base60", 82, "3L"], ["base60", 128, "3L"]]
);

const leadRow = base60.find(row => row.address === leadAtomicNumber);
assert.ok(leadRow);
assert.deepEqual(
  {
    first: leadRow.first,
    p0Translit: leadRow.p0Translit,
    p0Gp0: leadRow.p0Gp0,
    signedIndex: leadRow.signedIndex,
    signedWord: leadRow.signedWord,
    signedGp0: leadRow.signedGp0,
    final: leadRow.final,
  },
  {
    first: 201,
    p0Translit: "AS",
    p0Gp0: 39,
    signedIndex: 5,
    signedWord: "epiphany",
    signedGp0: 121,
    final: 237,
  }
);


// The selected raw p0 word's number is itself a unique signed-message word.
const signedGp0Rows = message.map((word, index) => ({
  index,
  word: word.toLowerCase(),
  gp0: sum(gp(word)),
}));
assert.deepEqual(
  signedGp0Rows.filter((row) => row.gp0 === asWord.gp0),
  [{ index: 2, word: "path", gp0: 39 }]
);

const base60NamedRows = base60.filter((row) =>
  signedGp0Rows.some((signed) => signed.gp0 === row.p0Gp0)
);
assert.deepEqual(
  base60NamedRows.map((row) => [row.address, row.token, row.p0Gp0]),
  [[82, "3L", 39], [128, "3L", 39]]
);

// Prospective downstream consequence of the pre-existing DEVOTED candidate.
const devotedGp0 = sum(gp("DEVOTED"));
assert.equal(devotedGp0, 102);
assert.equal(decodeAt(alphabet60, devotedGp0), 32);
assert.equal(decodeAt(alphabet59, devotedGp0), 32);
assert.equal(message[32].toLowerCase(), "you");

const youGp0 = sum(gp("YOU"));
assert.equal(youGp0, 30);
assert.equal(decodeAt(alphabet60, youGp0), 141);
const youReceiver = p0ByStart.get(141);
assert.ok(youReceiver);
assert.equal(youReceiver.index, 32);
assert.equal(youReceiver.length, 4);

/**
 * @param {string} alphabet
 * @param {"zero"|"one"} origin
 */
function signedSelfIndex(alphabet, origin) {
  const hits = [];
  for (let index = 0; index < message.length; index += 1) {
    const wordGp0 = sum(gp(message[index]));
    if (wordGp0 >= 256) continue;
    const tableValue = decodeAt(alphabet, wordGp0);
    if (tableValue === null) continue;
    const offset = origin === "zero" ? tableValue : tableValue - 1;
    const p0Word = p0ByStart.get(offset);
    if (p0Word && p0Word.index === index) {
      hits.push({
        index,
        word: message[index].toLowerCase(),
        gp0: wordGp0,
        tableValue,
        p0Offset: offset,
      });
    }
  }
  return hits;
}

const signedSelfIndexModes = [
  ["base60", "zero", signedSelfIndex(alphabet60, "zero")],
  ["base60", "one", signedSelfIndex(alphabet60, "one")],
  ["base59", "zero", signedSelfIndex(alphabet59, "zero")],
  ["base59", "one", signedSelfIndex(alphabet59, "one")],
];
assert.deepEqual(signedSelfIndexModes, [
  ["base60", "zero", [{
    index: 32,
    word: "you",
    gp0: 30,
    tableValue: 141,
    p0Offset: 141,
  }]],
  ["base60", "one", []],
  ["base59", "zero", []],
  ["base59", "one", []],
]);

assert.equal(message[33].toLowerCase(), "will");
assert.equal(gp(message[33]).length, youReceiver.length);

console.log(JSON.stringify({
  status: "PASS",
  frozenLeadNumber: leadAtomicNumber,
  solvedBracket: {
    p56Word20: "PILGRIM",
    pilgrimGp0: sum(p56Words[19]),
    p57Word20: "EMERGE",
    emergeGp0: sum(p57Words[19]),
    duplicate3L,
  },
  leadRoute: leadRow,
  semanticNumberBridge: { rawP0Gp0: asWord.gp0, signedWordAtSameGp0: "path", selectedSignedWord: "epiphany" },
  downstreamSelfIndex: { devotedGp0, signedIndex: 32, signedWord: "you", youGp0, p0Offset: 141, p0WordIndex: youReceiver.index, p0WordLength: youReceiver.length, modes: signedSelfIndexModes },
  radixControl: {
    base60Address82: decodeAt(alphabet60, 82),
    base59Address82: decodeAt(alphabet59, 82),
    base59IsP0WordStart: p0ByStart.has(decodeAt(alphabet59, 82)),
  },
  fullCensus: {
    base60Viable: base60.length,
    base59Viable: base59.length,
    final237: target237,
  },
  decision:
    "Frozen LEAD=82 selects the solved PILGRIM outer-bracket cell and uniquely enters the PATH-number -> EPIPHANY -> 237 route. The pre-existing DEVOTED candidate then selects signed YOU, whose GP0 uniquely self-indexes p0 word32 at offset141 under base60/zero origin.",
}, null, 2));
