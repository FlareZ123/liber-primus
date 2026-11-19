"use strict";

/**
 * SFT: source-matched control for the authenticated 2016 GP0 -> p50 word map.
 *
 * Compares the four predeclared semantic terms ITS / MEANING / NUMBERS /
 * DIRECTION with the other words in the same 2016 message and with earlier
 * signed Cicada texts. The target set is the solved p56/p57 GP29 vocabulary.
 *
 * This calibrates incidental collisions; it does not establish a unique radix,
 * authenticate the GP0-address rule, or recover unknown plaintext.
 *
 * Run: node sims/lp2_2016_keyword_source_matched_control_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const base60Alphabet = grid.alphabet;
const base59Alphabet = grid.alphabet.replace("f", "");

assert.equal(tableTokens.length, 256);
assert.equal(base60Alphabet.length, 60);
assert.equal(base59Alphabet.length, 59);

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S");
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

/** @param {string} relative @returns {string} */
function clearSigned(relative) {
  const source = read(relative);
  const marker = "-----BEGIN PGP SIGNED MESSAGE-----";
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, "missing clear-signed header: " + relative);
  let body = source.slice(start + marker.length);
  const headerEnd = body.indexOf("\n\n");
  assert.notEqual(headerEnd, -1, "missing clear-signed header separator: " + relative);
  body = body.slice(headerEnd + 2);
  const signature = body.indexOf("-----BEGIN PGP SIGNATURE-----");
  assert.notEqual(signature, -1, "missing clear-signed signature: " + relative);
  body = body.slice(0, signature);
  return body.split(/\r?\n/)
    .map((line) => line.startsWith("- ") ? line.slice(2) : line)
    .join("\n")
    .trim();
}

/**
 * Preserve apostrophes inside contractions and do not extract alphabetic
 * fragments from alphanumeric identifiers such as the 2016 key ID.
 * @param {string} text
 * @returns {string[]}
 */
function words(text) {
  return (text.match(/\b[A-Za-z]+(?:'[A-Za-z]+)*\b/g) || [])
    .map((word) => word.replace(/'/g, "").toUpperCase());
}

/** @param {string} sourceText @returns {number[][]} */
function runeWords(sourceText) {
  const out = [];
  let current = [];
  for (const ch of [...sourceText]) {
    const value = runeIndex.get(ch);
    if (value !== undefined) current.push(value);
    else if (current.length) {
      out.push(current);
      current = [];
    }
  }
  if (current.length) out.push(current);
  return out;
}

const targetRows = solved.sections
  .filter((section) => ["p56_an_end", "p57_parable"].includes(section.name))
  .flatMap((section) => runeWords(section.source_text).map((indices) => ({
    page: section.name,
    word: indices.map((value) => corpus.translit[value]).join(""),
    gp0: sum(indices),
  })));
const targetSums = new Set(targetRows.map((row) => row.gp0));

for (const [word, expected] of [["EMERGE", 83], ["SHED", 64], ["DEEP", 72]]) {
  assert.ok(
    targetRows.some((row) => row.word === word && row.gp0 === expected),
    "missing solved-page target word " + word,
  );
}

/** @param {string} token @param {string} alphabet @param {number} radix */
function tokenValue(token, alphabet, radix) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.notEqual(high, -1, "invalid high digit: " + token);
  assert.notEqual(low, -1, "invalid low digit: " + token);
  return high * radix + low;
}

/** @param {string} word @param {number} position */
function mapWord(word, position) {
  const gp0 = sum(gp(word));
  assert.ok(gp0 >= 0 && gp0 < 256, "word outside direct p50 address range: " + word);
  const token = tableTokens[gp0];
  const base59 = tokenValue(token, base59Alphabet, 59);
  const base60 = tokenValue(token, base60Alphabet, 60);
  return {
    word,
    position,
    gp0,
    token,
    base59,
    base60,
    hit59: targetSums.has(base59),
    hit60: targetSums.has(base60),
  };
}

const texts = {
  "2012-signed-image": clearSigned(
    "im-results/2012-845145127/162667212858-image-payload.asc",
  ),
  "2013-signed": clearSigned(
    "resources/external/2013-do-not-share-this-information-2.asc",
  ).replace(/c1231507051321@gmail\.com/gi, " "),
  "2014-signed": clearSigned(
    "resources/cicada2014-may2-signed-message.asc",
  ).replace(/ky2khlqdf7qdznac\.onion/gi, " "),
  "2016-signed": clearSigned(
    "resources/historical/cicada2016-4gq25-outguess.asc",
  ),
};

const mapped = Object.fromEntries(
  Object.entries(texts).map(([name, text]) => [
    name,
    words(text).map((word, index) => mapWord(word, index + 1)),
  ]),
);

const summary = Object.fromEntries(
  Object.entries(mapped).map(([name, rows]) => [
    name,
    {
      words: rows.length,
      base59Hits: rows.filter((row) => row.hit59).length,
      base59Rate: rows.filter((row) => row.hit59).length / rows.length,
      base60Hits: rows.filter((row) => row.hit60).length,
      base60Rate: rows.filter((row) => row.hit60).length / rows.length,
      uniqueBase59HitWords: [...new Set(rows.filter((row) => row.hit59).map((row) => row.word))],
      uniqueBase60HitWords: [...new Set(rows.filter((row) => row.hit60).map((row) => row.word))],
    },
  ]),
);

const message2016 = mapped["2016-signed"];
assert.equal(message2016.length, 43);
assert.deepEqual(
  message2016.slice(0, 9).map((row) => row.word),
  ["HELLO", "THE", "PATH", "LIES", "EMPTY", "EPIPHANY", "SEEKS", "THE", "DEVOTED"],
);

const keyTerms = new Set(["ITS", "MEANING", "NUMBERS", "DIRECTION"]);
const keyRows = message2016.filter((row) => keyTerms.has(row.word));
assert.deepEqual(
  keyRows.map((row) => [row.word, row.position, row.gp0, row.token, row.base59, row.base60]),
  [
    ["ITS", 15, 41, "1O", 83, 84],
    ["MEANING", 21, 87, "15", 64, 65],
    ["NUMBERS", 27, 83, "3D", 190, 193],
    ["DIRECTION", 30, 98, "1C", 71, 72],
  ],
);

const other2016 = message2016.filter((row) => !keyTerms.has(row.word));
assert.equal(keyRows.length, 4);
assert.equal(keyRows.filter((row) => row.hit59).length, 2);
assert.equal(keyRows.filter((row) => row.hit60).length, 1);
assert.equal(other2016.filter((row) => row.hit59).length, 5);
assert.equal(other2016.filter((row) => row.hit60).length, 1);
assert.equal(message2016.filter((row) => row.hit59).length, 7);
assert.equal(message2016.filter((row) => row.hit60).length, 2);

const otherInstructionWords = message2016.filter((row) =>
  ["WORDS", "MAP", "ROAD", "THEIR"].includes(row.word),
);
assert.equal(otherInstructionWords.length, 5); // THEIR occurs twice.
assert.equal(otherInstructionWords.filter((row) => row.hit59 || row.hit60).length, 0);

const expectedControls = {
  "2012-signed-image": {words: 73, base59Hits: 15, base60Hits: 10},
  "2013-signed": {words: 402, base59Hits: 68, base60Hits: 51},
  "2014-signed": {words: 14, base59Hits: 4, base60Hits: 1},
  "2016-signed": {words: 43, base59Hits: 7, base60Hits: 2},
};
for (const [name, expected] of Object.entries(expectedControls)) {
  assert.deepEqual(
    {
      words: summary[name].words,
      base59Hits: summary[name].base59Hits,
      base60Hits: summary[name].base60Hits,
    },
    expected,
    "source-matched control changed: " + name,
  );
}

// Exchangeable random-subset calibration for four selected terms from the
// 43-word 2016 message. These are not p-values for creator intent because the
// semantic subset was not randomly selected.
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= k; i += 1) result = result * (n - i + 1) / i;
  return result;
}
const pAtLeastTwoBase59 = (
  choose(7, 2) * choose(36, 2) +
  choose(7, 3) * choose(36, 1) +
  choose(7, 4)
) / choose(43, 4);
const pAtLeastOneBase60 = 1 - choose(41, 4) / choose(43, 4);
assert.ok(Math.abs(pAtLeastTwoBase59 - 0.11769710720363018) < 1e-12);
assert.ok(Math.abs(pAtLeastOneBase60 - 0.17940199335548168) < 1e-12);

console.log(JSON.stringify({
  status: "PASS: predeclared 2016 keyword subset calibrated against same-message and earlier signed-source controls",
  targetSolvedWords: targetRows.length,
  targetUniqueGp0Sums: targetSums.size,
  keyTerms: keyRows.map((row) => ({
    word: row.word,
    position: row.position,
    gp0: row.gp0,
    tableToken: row.token,
    base59: row.base59,
    base60: row.base60,
    targetWords59: targetRows.filter((target) => target.gp0 === row.base59).map((target) => target.word),
    targetWords60: targetRows.filter((target) => target.gp0 === row.base60).map((target) => target.word),
  })),
  otherInstructionWords,
  sameMessage: {
    keyTermsBase59: "2/4",
    keyTermsBase60: "1/4",
    nonKeyBase59: "5/39",
    nonKeyBase60: "1/39",
    allWordsBase59: "7/43",
    allWordsBase60: "2/43",
    randomSubsetCalibration: {
      probabilityAtLeastTwoBase59Hits: pAtLeastTwoBase59,
      probabilityAtLeastOneBase60Hit: pAtLeastOneBase60,
    },
  },
  signedSourceControls: summary,
  interpretation:
    "The explicit 2016 terms are enriched within their own message, but one term (NUMBERS) misses, the other explicit map words do not hit, no single radix yields all three solved-word matches, and earlier signed texts show substantial incidental collision rates. This is a control, not a decoder or proof of intent.",
}, null, 2));
