"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeToValue = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const parts = raw.split(/^\s*%\s*$/m);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} page */
function pageWords(page) {
  const text = parts[page <= 49 ? page : page - 1];
  const out = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;
  const flush = () => {
    if (!current.length) return;
    out.push({
      ordinal: out.length + 1,
      start,
      end: runeOffset - 1,
      values: current.slice(),
    });
    current = [];
  };
  for (const char of [...text]) {
    const value = runeToValue.get(char);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return out;
}

/** @param {string} word */
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
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

for (const page of [3, 39]) {
  const pageInk = ink.pages.find((row) => row.page === page);
  const red = pageInk.red_spans.find((span) => span.start === 119 && span.length === 3);
  assert.ok(red);
  const firstFive = pageWords(page)
    .filter((word) => word.start >= 122)
    .find((word) => word.values.length === 5);
  assert.ok(firstFive);
  assert.equal(firstFive.start, 132);
  assert.equal(firstFive.end, 136);
}

const p39 = pageWords(39).find((word) => word.start === 132 && word.end === 136);
assert.ok(p39);
assert.deepEqual(p39.values, [19, 7, 10, 17, 23]);

const key = [19, 12, 19, 2, 5];
const FALSE = gp("FALSE");
assert.deepEqual(FALSE, [0, 24, 20, 15, 18]);
assert.deepEqual(
  p39.values.map((value, index) => mod29(value - key[index])),
  FALSE
);

const p3 = pageWords(3).find((word) => word.start === 132 && word.end === 136);
assert.ok(p3);
assert.deepEqual(p3.values, [7, 19, 26, 2, 1]);
const output = p3.values.map((value, index) => mod29(value - key[index]));
assert.deepEqual(output, [17, 7, 7, 0, 25]);

const start = signed2016.indexOf("Hello.");
const end = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
const sourceWords = signed2016
  .slice(start, end)
  .replace(/\b7A35090F\b/g, "")
  .match(/[A-Za-z]+/g)
  .map((word) => word.toUpperCase());
const fiveRuneTargets = [
  ...new Map(
    sourceWords
      .map((word) => ({ word, values: gp(word) }))
      .filter((row) => row.values.length === 5)
      .map((row) => [row.values.join(","), row])
  ).values(),
];
assert.deepEqual(
  fiveRuneTargets.map((row) => row.word),
  ["HELLO", "EMPTY", "SEEKS", "LIBER", "WORDS", "FOUND", "FALSE"]
);
assert.ok(
  !fiveRuneTargets.some((target) =>
    target.values.every((value, index) => value === output[index])
  )
);

console.log("PASS p39 exact-key -> matched p3 prospective negative");
console.log(JSON.stringify({
  matchedGeometry: {
    redSpan: [119, 121],
    receiver: [132, 136],
  },
  p39: {
    cipher: p39.values,
    key,
    output: FALSE,
    target: "FALSE",
  },
  p3: {
    cipher: p3.values,
    key,
    output,
    authenticatedFiveRuneHit: null,
  },
}, null, 2));
