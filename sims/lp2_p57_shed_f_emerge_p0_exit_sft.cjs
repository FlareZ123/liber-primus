"use strict";

/**
 * Post-SHED missing-f branch and EMERGE exit gate.
 *
 * Exact source arithmetic:
 *   base60 PARABLE -> FIND;
 *   after the source-selected SHED transition removes the sole unused digit f,
 *   base59 PARABLE -> 41, exactly f's old base60 digit position;
 *   base59 cell41 -> EMERGE.
 *
 * Candidate exit:
 *   EMERGE has length6 and GP-prime sum300, so its already established
 *   base59 pointer walk starts at 300 mod256 = 44 and reaches fixed root189
 *   in six edges.  Staying base59 loops forever. Restoring the shed f returns
 *   the original base60 reading, where root189 -> 192 -> 0 in exactly two
 *   edges, equal to the recovered DH shared value2. Value0 is a valid physical
 *   p0 page selector under the same page-number receiver family as FIND -> 28.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")
);
const grid = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8")
);
const solved = JSON.parse(
  fs.readFileSync(path.join(root, "resources/external/relikd-solved-gp29-native-v1.json"), "utf8")
);
const signed2016 = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"),
  "utf8"
);
const transcription = fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-transcription.txt"),
  "utf8"
);

const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const absentDigits = [...alphabet60].filter(
  (digit) => !tokens.some((token) => token.includes(digit))
);
assert.deepEqual(absentDigits, ["f"]);

const fIndex = alphabet60.indexOf("f");
assert.equal(fIndex, 41);

const alphabet59 = alphabet60.replace("f", "");
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} text @returns {number[]} */
function gpText(text) {
  const normalized = text
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let i = 0; i < normalized.length;) {
    const token = gpTokens.find((item) => normalized.startsWith(item.symbol, i));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(i));
    out.push(token.value);
    i += token.symbol.length;
  }
  return out;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values @returns {number} */
function gpPrime(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/** @param {number[]} values @returns {string} */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} text @returns {number[][]} */
function runeWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Words = runeWords(p57.source_text).map((word, index) => ({
  position: index + 1,
  text: translit(word),
  gp0: gp0(word),
  prime: gpPrime(word),
  length: word.length,
}));

/** @param {string} text */
function word(text) {
  const row = p57Words.find((candidate) => candidate.text === text);
  assert.ok(row);
  return row;
}

const parable = word("PARABLE");
const find = word("FIND");
const shed = word("SHED");
const emerge = word("EMERGE");

assert.deepEqual(
  {
    parable: parable.gp0,
    find: find.gp0,
    shed: shed.gp0,
    emerge: emerge.gp0,
    emergePrime: emerge.prime,
    emergeLength: emerge.length,
  },
  {
    parable: 120,
    find: 42,
    shed: 64,
    emerge: 83,
    emergePrime: 300,
    emergeLength: 6,
  }
);

// Pre-SHED conventional state: PARABLE -> FIND.
assert.equal(tokens[parable.gp0], "0g");
assert.equal(decode(tokens[parable.gp0], alphabet60), find.gp0);

// Source-selected SHED state: SHED -> PARABLE, then PARABLE -> old f position.
assert.equal(tokens[shed.gp0], "22");
assert.equal(decode(tokens[shed.gp0], alphabet59), parable.gp0);
assert.equal(decode(tokens[parable.gp0], alphabet59), fIndex);

// The removed digit's old position is itself the base59 address of EMERGE.
assert.equal(tokens[fIndex], "1O");
assert.equal(decode(tokens[fIndex], alphabet59), emerge.gp0);
assert.notEqual(decode(tokens[fIndex], alphabet60), emerge.gp0);

// Existing EMERGE branch: GP-prime sum modulo the visible 256-cell table.
const emergeStart = emerge.prime % tokens.length;
assert.equal(emergeStart, 44);

/**
 * @param {number} start
 * @param {string} alphabet
 * @param {number} steps
 * @returns {number[]}
 */
function walk(start, alphabet, steps) {
  const path = [start];
  let value = start;
  for (let i = 0; i < steps; i += 1) {
    value = decode(tokens[value], alphabet);
    path.push(value);
  }
  return path;
}

const emergeBase59 = walk(emergeStart, alphabet59, emerge.length);
assert.deepEqual(emergeBase59, [44, 226, 72, 161, 214, 247, 189]);

// Root189 is the DH (p,g) coordinate 23*8+5 and a base59 fixed point.
const dhModulus = 23;
const tableWidth = 8;
const dhGenerator = 5;
const dhShared = 2;
const inverseExponent = 3;
const publicA = 8;
const root189 = dhModulus * tableWidth + dhGenerator;
assert.equal(root189, 189);
assert.equal(emergeBase59.at(-1), root189);
assert.equal(tokens[root189], "3C");
assert.equal(decode(tokens[root189], alphabet59), root189);

// New first-party reset support: the clear p57 word SURFACE directly addresses
// the exact same radix-sensitive 3C token before WE MUST SHED.
const surface = word("SURFACE");
assert.equal(surface.position, 8);
assert.equal(surface.gp0, 67);
assert.equal(tokens[surface.gp0], "3C");
assert.equal(tokens[surface.gp0], tokens[root189]);
assert.equal(decode(tokens[surface.gp0], alphabet59), root189);
assert.equal(decode(tokens[surface.gp0], alphabet60), 192);
assert.equal(tokens[192], "00");

// Within the complete 20-word p57 title+body, SURFACE alone directly lands on
// the 3C root-token class by the frozen GP0 -> p50 address primitive.
const p57RootTokenWords = p57Words
  .filter((candidate) => candidate.gp0 < tokens.length)
  .filter((candidate) => tokens[candidate.gp0] === tokens[root189])
  .map((candidate) => ({
    position: candidate.position,
    text: candidate.text,
    gp0: candidate.gp0,
  }));
assert.deepEqual(p57RootTokenWords, [
  { position: 8, text: "SURFACE", gp0: 67 },
]);

// The source word order fixes the semantic state narrative:
// SURFACE -> WE MUST SHED -> ... -> EMERGE.
assert.equal(word("WE").position, 9);
assert.equal(word("MUST").position, 10);
assert.equal(shed.position, 11);
assert.equal(emerge.position, 20);

// The six-edge EMERGE walk visits seven distinct table columns and leaves
// exactly e=3 unvisited. The SURFACE cell is the same 3C token in that
// missing column, so adding SURFACE completes all eight columns exactly once.
const emergeColumns = emergeBase59.map((address) => address % tableWidth);
assert.equal(new Set(emergeColumns).size, 7);
const missingEmergeColumns = Array.from(
  { length: tableWidth },
  (_, value) => value
).filter((value) => !emergeColumns.includes(value));
assert.deepEqual(missingEmergeColumns, [inverseExponent]);
assert.equal(surface.gp0 % tableWidth, inverseExponent);
assert.deepEqual(
  [...emergeColumns, surface.gp0 % tableWidth].sort((a, b) => a - b),
  [0, 1, 2, 3, 4, 5, 6, 7]
);

// Charge this column-completion property against every six-rune word in the
// complete pinned solved GP-native corpus. Only the prime-sum collision class
// EMERGE/INSIDE reproduces the seven-column walk, missing e, at the fixed root.
const solvedSixRuneColumnHits = [];
let solvedSixRuneCount = 0;
for (const section of solved.sections) {
  const sectionWords = runeWords(section.source_text);
  sectionWords.forEach((values, index) => {
    if (values.length !== emerge.length) return;
    solvedSixRuneCount += 1;
    const start = gpPrime(values) % tokens.length;
    const candidatePath = walk(start, alphabet59, values.length);
    const columns = candidatePath.map((address) => address % tableWidth);
    const uniqueColumns = new Set(columns);
    const missing = Array.from(
      { length: tableWidth },
      (_, value) => value
    ).filter((value) => !uniqueColumns.has(value));
    const end = candidatePath.at(-1);
    if (
      uniqueColumns.size === 7 &&
      missing.length === 1 &&
      missing[0] === inverseExponent &&
      decode(tokens[end], alphabet59) === end
    ) {
      solvedSixRuneColumnHits.push({
        section: section.name,
        position: index + 1,
        text: translit(values),
        start,
        end,
      });
    }
  });
}
assert.equal(solvedSixRuneCount, 65);
assert.deepEqual(solvedSixRuneColumnHits, [
  { section: "0_welcome", position: 95, text: "EMERGE", start: 44, end: 189 },
  { section: "jpg107-167", position: 38, text: "INSIDE", start: 44, end: 189 },
  { section: "jpg229", position: 8, text: "INSIDE", start: 44, end: 189 },
  { section: "p57_parable", position: 20, text: "EMERGE", start: 44, end: 189 },
]);

// Exhaust the complete p57 word family under the frozen rule:
// GP-prime mod256 start, word-length base59 walk, fixed endpoint. If the
// endpoint token has a duplicate in a column not visited by the walk and that
// duplicate is itself a p57 GP0 word address, record it. EMERGE is the sole
// source word with any such completion, and SURFACE is the sole receiver.
const p57ByGp0 = new Map(p57Words.map((row) => [row.gp0, row]));
const p57FixedDuplicateCompletions = [];
for (const sourceWord of p57Words) {
  const sourcePath = walk(sourceWord.prime % tokens.length, alphabet59, sourceWord.length);
  const end = sourcePath.at(-1);
  if (decode(tokens[end], alphabet59) !== end) continue;
  const visitedColumns = new Set(sourcePath.map((address) => address % tableWidth));
  const endpointToken = tokens[end];
  const completions = tokens
    .map((token, address) => ({ token, address }))
    .filter((row) => row.token === endpointToken)
    .filter((row) => !visitedColumns.has(row.address % tableWidth))
    .filter((row) => p57ByGp0.has(row.address))
    .map((row) => ({
      address: row.address,
      column: row.address % tableWidth,
      target: p57ByGp0.get(row.address).text,
      targetPosition: p57ByGp0.get(row.address).position,
    }));
  if (completions.length) {
    p57FixedDuplicateCompletions.push({
      source: sourceWord.text,
      sourcePosition: sourceWord.position,
      end,
      token: endpointToken,
      completions,
    });
  }
}
assert.deepEqual(p57FixedDuplicateCompletions, [
  {
    source: "EMERGE",
    sourcePosition: 20,
    end: 189,
    token: "3C",
    completions: [
      { address: 67, column: inverseExponent, target: "SURFACE", targetPosition: 8 },
    ],
  },
]);

// Candidate EMERGE state reset: restoring the uniquely shed f restores base60.
// Two steps, fixed upstream as the DH shared value, reach zero.
const restored = walk(root189, alphabet60, dhShared);
assert.deepEqual(restored, [189, 192, 0]);
assert.equal(tokens[192], "00");
assert.equal(decode(tokens[192], alphabet60), 0);
assert.equal(decode(tokens[192], alphabet59), 0);

// The independent p27 -> 3301 route selects the only other literal 00 cell.
const zeroCells = tokens
  .map((token, address) => ({ token, address }))
  .filter((row) => row.token === "00")
  .map((row) => row.address);
assert.deepEqual(zeroCells, [192, 229]);
assert.equal(3301 % tokens.length, 229);
assert.equal(tokens[3301 % tokens.length], "00");

// Staying in the shed state cannot leave the root.
assert.deepEqual(walk(root189, alphabet59, dhShared), [189, 189, 189]);

// FIND already establishes that a p50 numeral can select a physical LP2 page.
assert.equal(tokens[find.gp0], "0S");
assert.equal(decode(tokens[find.gp0], alphabet60), 28);
assert.ok(corpus.pages.some((page) => page.page === 0));

// The restored-state intermediate 192 uniquely names an authenticated 2016
// adjacent word pair, and that pair's 8/5 rune lengths uniquely match p0's
// physical page opening among p0..p55.
const signedBody = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const signedWords = (signedBody.match(/[A-Za-z]+/g) || []).map((text, index) => {
  const values = gpText(text);
  return {
    index,
    text: text.toUpperCase(),
    values,
    gp0: gp0(values),
    length: values.length,
  };
});
assert.equal(signedWords.length, 43);

// The complete printed duplicate class of the SURFACE/EMERGE root token is
// itself state-shaped. With the visible table width8, every 3C copy lands in
// one of the independently recovered columns K,e,g,g+K.
const rootTokenCopies = tokens
  .map((token, address) =>
    token === tokens[root189]
      ? { address, row: Math.floor(address / tableWidth), col: address % tableWidth }
      : null
  )
  .filter((row) => row !== null);
assert.deepEqual(rootTokenCopies, [
  { address: 67, row: 8, col: 3 },
  { address: 162, row: 20, col: 2 },
  { address: 189, row: 23, col: 5 },
  { address: 247, row: 30, col: 7 },
]);

const stateColumns = [dhShared, inverseExponent, dhGenerator, dhGenerator + dhShared]
  .sort((a, b) => a - b);
assert.deepEqual(
  rootTokenCopies.map((row) => row.col).sort((a, b) => a - b),
  stateColumns
);

// Charge the column set against every original token class. 3C is the only
// token whose complete occurrence-column set is exactly {K,e,g,g+K}.
const tokenAddresses = new Map();
tokens.forEach((token, address) => {
  if (!tokenAddresses.has(token)) tokenAddresses.set(token, []);
  tokenAddresses.get(token).push(address);
});
const stateColumnTokenClasses = [...tokenAddresses.entries()]
  .filter(([, addresses]) => {
    const columns = [...new Set(addresses.map((address) => address % tableWidth))]
      .sort((a, b) => a - b);
    return columns.length === stateColumns.length &&
      columns.every((value, index) => value === stateColumns[index]);
  })
  .map(([token, addresses]) => ({ token, count: addresses.length }));
assert.deepEqual(stateColumnTokenClasses, [{ token: "3C", count: 4 }]);

// The same four zero-based rows are authenticated 2016 source indexes.
// Two are themselves DH state roles (A=DEVOTED and p=ROAD); the other two
// are the source navigation words MEANING and SEEK.
const rootCopySourceRows = rootTokenCopies.map((row) => ({
  address: row.address,
  row: row.row,
  word: signedWords[row.row].text,
  col: row.col,
}));
assert.deepEqual(rootCopySourceRows, [
  { address: publicA * tableWidth + inverseExponent, row: publicA, word: "DEVOTED", col: inverseExponent },
  { address: 20 * tableWidth + dhShared, row: 20, word: "MEANING", col: dhShared },
  { address: dhModulus * tableWidth + dhGenerator, row: dhModulus, word: "ROAD", col: dhGenerator },
  { address: 30 * tableWidth + (dhGenerator + dhShared), row: 30, word: "SEEK", col: dhGenerator + dhShared },
]);

const pair192 = [];
for (let i = 0; i < signedWords.length - 1; i += 1) {
  const left = signedWords[i];
  const right = signedWords[i + 1];
  if (left.gp0 + right.gp0 === 192) {
    pair192.push({
      index: i,
      phrase: left.text + " " + right.text,
      lengths: [left.length, right.length],
    });
  }
}
assert.deepEqual(pair192, [
  { index: 5, phrase: "EPIPHANY SEEKS", lengths: [8, 5] },
]);
assert.equal(gp0(gpText("EPIPHANY")) + gp0(gpText("SEEKS")), 192);

const parts = transcription.split(/\r?\n%\r?\n/);
const openingRows = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const source = parts[page < 50 ? page : page - 1];
  const wordLengths = [];
  let current = 0;
  for (const char of [...source]) {
    if (runeIndex.has(char)) current += 1;
    else if ("-./&$".includes(char) && current > 0) {
      wordLengths.push(current);
      current = 0;
    }
  }
  if (current > 0) wordLengths.push(current);
  if (wordLengths.length >= 2) {
    openingRows.push({ page, first: wordLengths[0], second: wordLengths[1] });
  }
}
assert.deepEqual(
  openingRows.filter((row) => row.first === 8 && row.second === 5),
  [{ page: 0, first: 8, second: 5 }]
);

// Original-ciphertext holdout for the conditional p0 opening.
function firstPageWords() {
  const source = parts[0];
  const out = [];
  let current = [];
  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      current.push(value);
    } else if ("-./&$".includes(char) && current.length > 0) {
      out.push(current);
      current = [];
    }
  }
  if (current.length > 0) out.push(current);
  return out;
}
const p0CipherWords = firstPageWords();
assert.deepEqual(p0CipherWords.slice(0, 2).map((values) => values.length), [8, 5]);
const p0Cipher13 = [...p0CipherWords[0], ...p0CipherWords[1]];
const epiphanySeeksValues = [...signedWords[5].values, ...signedWords[6].values];
assert.equal(signedWords[5].text, "EPIPHANY");
assert.equal(signedWords[6].text, "SEEKS");
assert.equal(epiphanySeeksValues.length, p0Cipher13.length);
const openingResidual = p0Cipher13.map(
  (value, index) => (value - epiphanySeeksValues[index] + 29) % 29
);
assert.deepEqual(openingResidual, [26, 24, 8, 19, 27, 24, 18, 3, 0, 8, 0, 16, 19]);
assert.equal(gp0(openingResidual), 192);
assert.equal(gp0(epiphanySeeksValues), 192);

// Charge every ordered authenticated source-word pair with the same total
// rune length. Forward residual-sum == plaintext-sum has exactly one hit;
// the reverse sign has none.
const forwardChecksumHits = [];
const reverseChecksumHits = [];
let sameLengthSourcePairs = 0;
for (const left of signedWords) {
  for (const right of signedWords) {
    const candidate = [...left.values, ...right.values];
    if (candidate.length !== p0Cipher13.length) continue;
    sameLengthSourcePairs += 1;
    const plainSum = gp0(candidate);
    const forwardSum = gp0(
      p0Cipher13.map((value, index) => (value - candidate[index] + 29) % 29)
    );
    const reverseSum = gp0(
      p0Cipher13.map((value, index) => (candidate[index] - value + 29) % 29)
    );
    if (forwardSum === plainSum) {
      forwardChecksumHits.push({
        left: left.index,
        right: right.index,
        phrase: left.text + " " + right.text,
        sum: plainSum,
      });
    }
    if (reverseSum === plainSum) {
      reverseChecksumHits.push({
        left: left.index,
        right: right.index,
        phrase: left.text + " " + right.text,
        sum: plainSum,
      });
    }
  }
}
assert.equal(sameLengthSourcePairs, 52);
assert.deepEqual(forwardChecksumHits, [
  { left: 5, right: 6, phrase: "EPIPHANY SEEKS", sum: 192 },
]);
assert.deepEqual(reverseChecksumHits, []);

console.log(JSON.stringify({
  status:
    "PASS: post-SHED base59 PARABLE selects the shed f position, then EMERGE; restoring f at the EMERGE root exits to page value0 in shared2 steps",
  digitState: {
    alphabet60: alphabet60.length,
    shedDigit: "f",
    shedDigitIndex: fIndex,
    alphabet59: alphabet59.length,
  },
  branch: {
    beforeShed: ["PARABLE", 120, "0g", 42, "FIND"],
    afterShed: ["SHED", 64, "PARABLE", 120, "0g", 41, "f-index", 41, "EMERGE", 83],
  },
  emergeWalk: emergeBase59,
  root: {
    address: root189,
    token: tokens[root189],
    base59: decode(tokens[root189], alphabet59),
    base60: decode(tokens[root189], alphabet60),
  },
  surfaceResetSupport: {
    wordPosition: surface.position,
    gp0Address: surface.gp0,
    token: tokens[surface.gp0],
    base59: decode(tokens[surface.gp0], alphabet59),
    base60: decode(tokens[surface.gp0], alphabet60),
    p57RootTokenWords,
    emergeColumns,
    missingEmergeColumns,
    solvedSixRuneCount,
    solvedSixRuneColumnHits,
    p57FixedDuplicateCompletions,
    rootTokenCopies,
    stateColumnTokenClasses,
    rootCopySourceRows,
  },
  restoredShared2Walk: restored,
  literalZeroCells: zeroCells,
  independentZeroSelectors: {
    p27_3301: 3301 % tokens.length,
    p57_emergeRestore: restored[1],
  },
  candidateReceiver: "physical p0 via value0",
  conditionalTitleRecovery: {
    exitValue: 192,
    uniqueSignedPair: pair192[0],
    uniquePhysicalOpening: { page: 0, lengths: [8, 5] },
    originalCipherHoldout: {
      residual: openingResidual,
      residualSum: gp0(openingResidual),
      sameLengthSourcePairs,
      forwardChecksumHits,
      reverseChecksumHits,
    },
  },
}, null, 2));
