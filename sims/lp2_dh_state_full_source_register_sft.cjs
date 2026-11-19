"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const signed = fs.readFileSync(
  path.join(root, "resources/historical/cicada2016-4gq25-outguess.asc"),
  "utf8"
);

const clear = signed.slice(
  signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----")
);
const words = clear
  .replace(/\b7A35090F\b/gu, "")
  .match(/[A-Za-z]+/gu)
  .map((word) => word.toUpperCase());
assert.equal(words.length, 43);

// Independently reconstructed authenticated DH/state tuple.
const state = {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
};

const u = state.q - state.e;
const t = state.g + state.K;
const axis = [u, state.K, state.e, state.q, state.g, state.a, t, state.A];
assert.deepEqual(axis, [1, 2, 3, 4, 5, 6, 7, 8]);

const rows = [{expression: "0", value: 0}];

for (const [expression, value] of [
  ["u", u],
  ["K", state.K],
  ["e", state.e],
  ["q", state.q],
  ["g", state.g],
  ["a", state.a],
  ["t=g+K", t],
  ["A", state.A],
]) rows.push({expression, value});

for (const [label, value] of [
  ["u", u],
  ["K", state.K],
  ["e", state.e],
  ["q", state.q],
  ["g", state.g],
  ["a", state.a],
]) rows.push({expression: "A+" + label, value: state.A + value});

for (const [expression, value] of [
  ["b", state.b],
  ["2A", 2 * state.A],
  ["2A+u", 2 * state.A + u],
  ["2A+K", 2 * state.A + state.K],
]) rows.push({expression, value});

for (const [label, value] of [
  ["0", 0],
  ["u", u],
  ["K", state.K],
  ["e", state.e],
]) rows.push({
  expression: label === "0" ? "B" : "B+" + label,
  value: state.B + value,
});

for (const [label, value] of [
  ["0", 0],
  ["u", u],
  ["K", state.K],
  ["e", state.e],
  ["q", state.q],
  ["g", state.g],
  ["a", state.a],
  ["t", t],
  ["A", state.A],
]) rows.push({
  expression: label === "0" ? "p" : "p+" + label,
  value: state.p + value,
});

for (const [label, value] of [
  ["u", u],
  ["K", state.K],
  ["e", state.e],
  ["q", state.q],
  ["g", state.g],
  ["a", state.a],
]) rows.push({
  expression: "p+A+" + label,
  value: state.p + state.A + value,
});

for (const [label, value] of [
  ["0", 0],
  ["u", u],
  ["K", state.K],
  ["e", state.e],
]) rows.push({
  expression: label === "0" ? "2B" : "2B+" + label,
  value: 2 * state.B + value,
});

rows.push({expression: "B+p", value: state.B + state.p});

assert.equal(rows.length, 43);
assert.deepEqual(rows.map((row) => row.value), [...Array(43).keys()]);

const register = rows.map((row, index) => ({
  index,
  expression: row.expression,
  value: row.value,
  word: words[index],
}));

assert.deepEqual(words.slice(1, 9), [
  "THE", "PATH", "LIES", "EMPTY",
  "EPIPHANY", "SEEKS", "THE", "DEVOTED",
]);
assert.deepEqual(words.slice(19, 24), [
  "THEIR", "MEANING", "IS", "THE", "ROAD",
]);
assert.deepEqual(words.slice(23, 30), [
  "ROAD", "AND", "THEIR", "NUMBERS", "ARE", "THE", "DIRECTION",
]);
assert.deepEqual(words.slice(38, 43), [
  "BEWARE", "FALSE", "PATHS", "VERIFY", "OPENPGP",
]);

assert.equal(register[13].expression, "A+g");
assert.equal(register[13].word, "WAY");
assert.equal(register[15].expression, "b");
assert.equal(register[15].word, "WORDS");
assert.equal(register[19].expression, "B");
assert.equal(register[19].word, "THEIR");
assert.equal(register[23].expression, "p");
assert.equal(register[23].word, "ROAD");
assert.equal(register[29].expression, "p+a");
assert.equal(register[29].word, "DIRECTION");
assert.equal(register[42].expression, "B+p");
assert.equal(register[42].word, "OPENPGP");

console.log(JSON.stringify({
  status: "PASS",
  state,
  derived: {u, t, axis},
  register,
  phraseBlocks: {
    axis1to8: words.slice(1, 9),
    BthroughP: words.slice(19, 24),
    PthroughPa: words.slice(23, 30),
    twoBthroughBp: words.slice(38, 43),
  },
}, null, 2));
