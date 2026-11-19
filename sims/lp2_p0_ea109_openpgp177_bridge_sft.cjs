"use strict";

/**
 * SFT: EA109 exits the p0 PATHS/LUCK loop through an OPENPGP=75 direction.
 *
 * Frozen upstream input: EA selects local p0 start109. This test walks forward
 * on p0, uses only authenticated warning-word GP0 values as the charged source
 * family, and checks the original p50 table under conventional base60 against
 * the live drop-f base59 rival.
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
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedText = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const tokens = grid.pages.flatMap((page) => page.tokens);
const table60 = grid.pages.flatMap((page) => page.bytes);
const alphabet59 = grid.alphabet.replace("f", "");

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
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
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/**
 * @param {string} text
 * @returns {Array<{start:number,end:number,values:number[]}>}
 */
function parseWords(text) {
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    words.push({start, end:offset - 1, values:current.slice()});
    current = [];
  }

  for (const character of [...text]) {
    if (runeSet.has(character)) {
      if (!current.length) start = offset;
      current.push(runeIndex.get(character));
      offset += 1;
    } else if (character === "-" || character === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/** @param {string} token @returns {number|null} */
function base59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * 59 + low;
}

const table59 = tokens.map(base59);
const clearSigned = signedText
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/, "")
  .replace(/\b3301\b/g, "")
  .replace(/\b[0-9A-F]{8,}\b/g, "");
const signedWords = (clearSigned.match(/[A-Za-z]+/g) || [])
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);
assert.deepEqual(signedWords.slice(38, 43), [
  "BEWARE","FALSE","PATHS","VERIFY","OPENPGP"
]);

const warningWords = signedWords.slice(38, 43);
const warningSums = new Map(
  warningWords.map((word) => [gp0(gp(word)), word])
);
assert.deepEqual(
  [...warningSums.entries()].sort((a, b) => a[0] - b[0]),
  [[54,"PATHS"],[59,"VERIFY"],[75,"OPENPGP"],[77,"FALSE"],[88,"BEWARE"]]
);
assert.equal(gp0(gp("OPENPGP")), 75);
assert.equal(gp0(gp("READOUT")), 75);

const p0 = parseWords(parts[0]);
const ea = corpus.translit.indexOf("EA");
assert.equal(ea, 28);
assert.equal(corpus.prime[ea], 109);

const selectedStart = corpus.prime[ea];
const resetWordIndex = p0.findIndex((word) => word.start === selectedStart);
assert.equal(resetWordIndex, 23);
assert.deepEqual(p0[resetWordIndex].values, [14,26]);

const matchesAfterEa = [];
for (let index = resetWordIndex; index < p0.length; index += 1) {
  const word = p0[index];
  const sum = gp0(word.values);
  const warning = warningSums.get(sum);
  if (!warning) continue;
  matchesAfterEa.push({
    word:index + 1,
    start:word.start,
    end:word.end,
    values:word.values,
    gp0:sum,
    warning,
    p50Base60:table60[sum],
    p50Base59:table59[sum],
  });
}

assert.deepEqual(matchesAfterEa, [{
  word:29,
  start:124,
  end:126,
  values:[26,21,28],
  gp0:75,
  warning:"OPENPGP",
  p50Base60:177,
  p50Base59:174,
}]);

const allP0Gp75 = p0
  .map((word, index) => ({
    word:index + 1,
    start:word.start,
    end:word.end,
    values:word.values,
    gp0:gp0(word.values),
  }))
  .filter((row) => row.gp0 === 75);
assert.deepEqual(allP0Gp75, [{
  word:29,
  start:124,
  end:126,
  values:[26,21,28],
  gp0:75,
}]);

assert.equal(tokens[75], "2v");
assert.equal(table60[75], 177);
assert.equal(table59[75], 174);

// Frozen DH modulus p=23 gives an 11-rune radius around the selected center.
const p = 23;
const radius = (p - 1) / 2;
const start60 = table60[75] - radius;
const end60 = table60[75] + radius;
const start59 = table59[75] - radius;
const end59 = table59[75] + radius;
assert.deepEqual([start60,end60], [166,188]);
assert.deepEqual([start59,end59], [163,185]);

const wordStarts = new Set(p0.map((word) => word.start));
const wordEnds = new Set(p0.map((word) => word.end));
const p0Values = p0.flatMap((word) => word.values);
assert.equal(wordStarts.has(start60), true);
assert.equal(wordEnds.has(end60), true);
assert.equal(p0Values[table60[75]], 0);
assert.equal(wordStarts.has(start59), false);
assert.equal(wordEnds.has(end59), false);
assert.notEqual(p0Values[table59[75]], 0);

// Reproduce the two p0 23-rune whole-word-bounded center-F spans.
const centerFSpans = [];
for (let start = 0; start + p - 1 < p0Values.length; start += 1) {
  const end = start + p - 1;
  const center = start + radius;
  if (!wordStarts.has(start) || !wordEnds.has(end)) continue;
  if (p0Values[center] !== 0) continue;
  centerFSpans.push({start,end,center});
}
assert.deepEqual(centerFSpans, [
  {start:80,end:102,center:91},
  {start:166,end:188,center:177},
]);

console.log(JSON.stringify({
  status:"PASS",
  frozenSelector:{eaValue:ea,eaPrime:selectedStart},
  warningGp0:Object.fromEntries(
    [...warningSums.entries()].map(([sum,word]) => [word,sum])
  ),
  firstAndOnlyWarningMatchAfterEa:matchesAfterEa[0],
  p0Gp75Occurrences:allP0Gp75,
  radixControl:{
    token75:tokens[75],
    base60Center:table60[75],
    base60Packet:[start60,end60],
    base59Center:table59[75],
    base59Packet:[start59,end59],
  },
  centerFSpans,
  route:[
    "EA prime109",
    "p0 word29 GP0=75 = OPENPGP",
    "p50[75]=177 under base60",
    "p0 packet166..188",
  ],
  classification:
    "Source-constrained bridge between the EA109 p0 loop and the independently derived OPENPGP warning packet. The bridge is retrospective but target-free inside the frozen warning-word GP0 family.",
}, null, 2));
