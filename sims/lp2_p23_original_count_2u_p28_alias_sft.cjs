"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tape = grid.pages.flatMap((page) => page.tokens);
assert.equal(tape.length, 256);

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} text @returns {number[]} */
function gp(text) {
  const normalized = text
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
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, offset));
    assert.ok(token, "Unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} text @returns {number} */
function gp0(text) {
  return gp(text).reduce((sum, value) => sum + value, 0);
}

/** @type {Map<string,number[]>} */
const classes = new Map();
for (let address = 0; address < tape.length; address += 1) {
  const token = tape[address];
  if (!classes.has(token)) classes.set(token, []);
  classes.get(token).push(address);
}

const classSizeHistogram = {};
for (const addresses of classes.values()) {
  classSizeHistogram[addresses.length] =
    (classSizeHistogram[addresses.length] || 0) + 1;
}
assert.deepEqual(classSizeHistogram, {1:92, 2:49, 3:14, 4:6});

const p23 = corpus.pages.find((page) => page.page === 23);
assert.ok(p23);
const p23RuneCount = p23.indices.length;
assert.equal(p23RuneCount, 213);

const originalAddress = gp0("THE ORIGINAL");
assert.equal(originalAddress, 97);

const token = tape[p23RuneCount];
assert.equal(token, "2U");
assert.equal(tape[originalAddress], token);

const aliasClass = classes.get(token);
assert.deepEqual(aliasClass, [28,97,213]);
const forcedRemaining = aliasClass.filter(
  (address) => address !== p23RuneCount && address !== originalAddress
);
assert.deepEqual(forcedRemaining, [28]);

// Charge every size-three class against the same typed family:
// physical p0-p55 page addresses and p0-p55 page-rune-count addresses <256.
const physicalPages = new Set(Array.from({length:56}, (_, index) => index));
/** @type {Map<number,number[]>} */
const countOwners = new Map();
for (const page of corpus.pages.filter((row) => row.page <= 55)) {
  const count = page.indices.length;
  if (count >= 256) continue;
  if (!countOwners.has(count)) countOwners.set(count, []);
  countOwners.get(count).push(page.page);
}

const typedTripleClasses = [];
for (const [classToken, addresses] of classes) {
  if (addresses.length !== 3) continue;
  const pageAddresses = addresses.filter((address) => physicalPages.has(address));
  const countAddresses = addresses
    .filter((address) => countOwners.has(address))
    .map((address) => ({address, pages: countOwners.get(address)}));
  if (pageAddresses.length > 0 && countAddresses.length > 0) {
    typedTripleClasses.push({
      token: classToken,
      addresses,
      pageAddresses,
      countAddresses,
    });
  }
}

assert.deepEqual(typedTripleClasses, [{
  token: "2U",
  addresses: [28,97,213],
  pageAddresses: [28],
  countAddresses: [{address:213, pages:[23]}],
}]);

// Broader control: same-token page-number/page-count aliases of any class size.
// This shows why the three-role closure, rather than aliasing alone, is the useful object.
const allPageCountAliases = [];
for (let targetPage = 0; targetPage <= 55; targetPage += 1) {
  for (const page of corpus.pages.filter((row) => row.page <= 55)) {
    const count = page.indices.length;
    if (count >= 256) continue;
    if (tape[targetPage] === tape[count]) {
      allPageCountAliases.push({
        targetPage,
        sourcePage: page.page,
        count,
        token: tape[targetPage],
        class: classes.get(tape[targetPage]),
      });
    }
  }
}

assert.equal(allPageCountAliases.length, 8);
assert.ok(allPageCountAliases.some((row) =>
  row.targetPage === 28 &&
  row.sourcePage === 23 &&
  row.count === 213 &&
  row.token === "2U"
));

console.log(JSON.stringify({
  status: "PASS",
  selectedP23Inputs: {
    physicalPage: 23,
    runeCount: p23RuneCount,
    recoveredPhrase: "THE ORIGINAL",
    phraseGp0: originalAddress,
  },
  aliasClosure: {
    token,
    exactClass: aliasClass,
    twoKnownAddresses: [originalAddress, p23RuneCount],
    forcedRemainingAddress: forcedRemaining[0],
    interpretation: "physical p28",
  },
  controls: {
    duplicateClassSizeHistogram: classSizeHistogram,
    sizeThreeClassesWithPageAndRuneCountRoles: typedTripleClasses,
    allPageNumberPageCountAliases: allPageCountAliases,
  },
  decision:
    "The independently selected p23 contributes two typed addresses, GP0(THE ORIGINAL)=97 and rune count213, that converge on p50 token2U. Its exact three-address class forces the remaining address28. Preserve this as a p23->p28 alias/navigation closure; it is retrospective with respect to the already known p28 READ OUT result.",
}, null, 2));
