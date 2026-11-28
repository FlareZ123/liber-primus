"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

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
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gp(word).reduce((sum, value) => sum + value, 0);
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const message = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word, index) => ({
    index,
    word: word.toUpperCase(),
    values: gp(word),
    gp0: gp0(word),
  }));

assert.equal(message.length, 43);
assert.deepEqual(
  message.filter((row) => row.word === "THEIR").map((row) => row.index),
  [19, 25]
);

const rise = 25 - 19;
assert.equal(rise, 6);

const p = 23;
const g = 5;
const B = 19;
let b = null;
for (let exponent = 1; exponent < p; exponent += 1) {
  if ((g ** exponent) % p === B) {
    assert.equal(b, null);
    b = exponent;
  }
}
assert.equal(b, 15);
assert.equal((g ** b) % p, B);

const events = [];
for (let index = 0; index + rise < message.length; index += 1) {
  const source = message[index];
  const target = message[index + rise];
  events.push({
    index,
    word: source.word,
    length: source.values.length,
    nextIndex: target.index,
    nextWord: target.word,
    rise: mod29(target.gp0 - source.gp0),
  });
}

const bobEvents = events.filter((event) =>
  event.rise === b || event.rise === B
);
assert.deepEqual(bobEvents, [
  { index: 23, word: "ROAD", length: 4, nextIndex: 29, nextWord: "DIRECTION", rise: 15 },
  { index: 28, word: "THE", length: 2, nextIndex: 34, nextWord: "BE", rise: 15 },
  { index: 34, word: "BE", length: 2, nextIndex: 40, nextWord: "PATHS", rise: 19 },
]);

const typedBobEvents = bobEvents.filter((event) => event.length === 2);
assert.deepEqual(typedBobEvents.map((event) => event.index), [28, 34]);

const alreadyOpenedSuccessIndices = new Set([28, 34]);
const unusedTypedBobEvents = typedBobEvents.filter(
  (event) => !alreadyOpenedSuccessIndices.has(event.index)
);
assert.equal(unusedTypedBobEvents.length, 0);

const p7 = events.find((event) => event.index === 7);
assert.ok(p7);
assert.deepEqual(p7, {
  index: 7,
  word: "THE",
  length: 2,
  nextIndex: 13,
  nextWord: "WAY",
  rise: 8,
});
assert.ok(p7.rise !== b && p7.rise !== B);

console.log(JSON.stringify({
  status: "PASS",
  rise,
  bob: { b, B },
  bobEvents,
  typedBobEvents,
  unusedTypedBobEvents,
  p7Control: p7,
  decision: "Bob-pair restriction has no unused two-rune target; it cannot prospectively validate the H-shell exception.",
}, null, 2));
