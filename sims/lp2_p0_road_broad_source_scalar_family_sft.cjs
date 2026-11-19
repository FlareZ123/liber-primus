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
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const parts = transcription.split("%").slice(0, 55);

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

  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((row) =>
      normalized.startsWith(row.symbol, offset));
    assert.ok(token, `unmapped GP spelling: ${word} at ${offset}`);
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

const clear = signed2016
  .slice(
    signed2016.indexOf("Hello."),
    signed2016.indexOf("-----BEGIN PGP SIGNATURE-----"),
  )
  .replace(/\b[0-9A-F]{8}\b/g, "")
  .replace(/\b\d+\b/g, "");

const targetMap = new Map();
for (const word of clear.match(/[A-Za-z]+/g) || []) {
  const values = gp(word);
  const upper = word.toUpperCase();
  if (values.length === 4 && !targetMap.has(upper)) {
    targetMap.set(upper, values);
  }
}
const targets = [...targetMap].map(([word, values]) => ({word, values}));
assert.deepEqual(targets.map((row) => row.word), [
  "LIES", "THEIR", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS",
]);

const p28 = parts[28];
const lines = p28
  .trim()
  .split("/")
  .filter((line) => /[\u16A0-\u16FF]/u.test(line));
assert.equal(lines.length, 12);

const line1Fragments = lines[0].match(/[\u16A0-\u16FF]+/gu) || [];
const line6Fragments = lines[5].match(/[\u16A0-\u16FF]+/gu) || [];
const runeLength = (fragments) =>
  fragments.reduce((total, fragment) => total + [...fragment].length, 0);

assert.equal(line1Fragments.length, 5);
assert.equal(runeLength(line1Fragments), 23);
assert.equal(line6Fragments.length, 5);
assert.equal(runeLength(line6Fragments), 23);
assert.equal((p28.match(/\./g) || []).length, 3);

const cipher = [16, 8, 25, 27];
assert.deepEqual(gp("ROAD"), [4, 3, 24, 23]);

// Freeze a deliberately broad family of simple scalars already exposed by
// the selected p28 page, HERE carrier, DH line, center and reconstructed state.
// Several names intentionally share the same numeric value. They remain
// separate source descriptors so alias multiplicity is visible.
const scalars = [
  ["page-number", 28],
  ["page-rune-lines", lines.length],
  ["here-line-one", 1],
  ["here-line-runes", runeLength(line1Fragments)],
  ["here-line-fragments", line1Fragments.length],
  ["here-fragments-consumed", 2],
  ["here-output-length", 4],
  ["dh-line-one", 6],
  ["dh-line-runes", runeLength(line6Fragments)],
  ["dh-line-fragments", line6Fragments.length],
  ["page-periods", (p28.match(/\./g) || []).length],
  ["center-index-mod29", 134 % 29],
  ["center-value", 9],
  ["page-word-number-mod29", 28],
  ["page-word-length", 5],
  ["p", 23],
  ["g", 5],
  ["a", 6],
  ["b", 15],
  ["A", 8],
  ["B", 19],
  ["K", 2],
  ["dh-inverse-e", 3],
].map(([name, value]) => ({name, value: value % 29}));

assert.equal(scalars.length, 23);

let configurations = 0;
const hits = [];

for (let a = 0; a < scalars.length; a += 1) {
  for (let b = 0; b < scalars.length; b += 1) {
    if (b === a) continue;
    for (let c = 0; c < scalars.length; c += 1) {
      if (c === a || c === b) continue;
      for (let d = 0; d < scalars.length; d += 1) {
        if (d === a || d === b || d === c) continue;
        const tuple = [scalars[a], scalars[b], scalars[c], scalars[d]];
        const key = tuple.map((row) => row.value);

        for (const sign of [-1, 1]) {
          configurations += 1;
          const plaintext = cipher.map((value, index) =>
            mod29(value + sign * key[index]));
          const match = targets.find((target) =>
            target.values.every((value, index) => value === plaintext[index]));
          if (match) {
            hits.push({
              fields: tuple.map((row) => row.name),
              key,
              sign,
              target: match.word,
              plaintext,
            });
          }
        }
      }
    }
  }
}

assert.equal(configurations, 425040);
assert.equal(hits.length, 4);
assert.ok(hits.every((row) => row.target === "ROAD"));
assert.ok(hits.every((row) => row.sign === -1));
assert.ok(hits.every((row) => row.key.join(",") === "12,5,1,4"));
assert.deepEqual(hits.map((row) => row.fields), [
  ["page-rune-lines", "here-line-fragments", "here-line-one", "here-output-length"],
  ["page-rune-lines", "dh-line-fragments", "here-line-one", "here-output-length"],
  ["page-rune-lines", "page-word-length", "here-line-one", "here-output-length"],
  ["page-rune-lines", "g", "here-line-one", "here-output-length"],
]);

console.log(JSON.stringify({
  status: "PASS: broad p28 source-scalar family still selects ROAD only",
  scalarCount: scalars.length,
  targetWords: targets.map((row) => row.word),
  configurations,
  hitCount: hits.length,
  distinctTargets: [...new Set(hits.map((row) => row.target))],
  distinctKeys: [...new Set(hits.map((row) => row.key.join(",")))],
  hits,
  decision:
    "Expanding the HERE descriptor family to 23 natural p28/HERE/DH/page scalars does not create alternate authenticated four-rune targets. The only hits are four source-alias realizations of the same [12,5,1,4] subtraction key, all yielding ROAD.",
}, null, 2));
