"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");

/** Source-fixed p55 terminal 6-rune bridge to p27, and circular preceding tape.
 * For a candidate native plaintext, includes an independent p57 plant.
 */
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
/** @param {number} n @returns {number[]} */
const page = (n) => corpus.pages.find((p) => p.page === n).indices;
/** @param {number[]} xs @returns {string} */
const spell = (xs) => xs.map((i) => corpus.translit[i]).join("");
/** @param {number[]} xs @returns {number} */
const ioc = (xs) => {
  const hist = new Array(29).fill(0);
  for (const i of xs) hist[i]++;
  return hist.reduce((s, n) => s + n * (n - 1), 0) / (xs.length * (xs.length - 1));
};
/** @param {number} n @returns {number} */
const mod29 = (n) => ((n % 29) + 29) % 29;

const wing = page(27), terminal = page(55), solved = page(57);
assert.equal(wing.length, 234);
assert.equal(terminal.length, 76);
assert.equal(solved.length, 95);
assert.equal(spell(wing.slice(28, 34)), "DJUBEI");
assert.deepEqual(terminal.slice(70), wing.slice(28, 34));

const shift = 70 - 28;
/** @param {number} i @returns {number} */
const source = (i) => wing[(i - shift + wing.length) % wing.length];
for (let i = 70; i < 76; i++) assert.equal(terminal[i], source(i));

const expected = { "-1": [0.036491228070175435, 0.029399585921325053, 12],
                    "1": [0.031228070175438598, 0.031055900621118012, 26] };
const records = [];
for (const sign of [-1, 1]) {
  const originalPlain = terminal.map((c, i) => mod29(c + sign * source(i)));
  const firstForbiddenF = originalPlain.findIndex((v, i) => v === 0 && terminal[i] !== 0);
  const [fullIoc, prefixIoc, forbidden] = expected[String(sign)];
  assert.ok(Math.abs(ioc(originalPlain) - fullIoc) < 1e-12);
  assert.ok(Math.abs(ioc(originalPlain.slice(0,70)) - prefixIoc) < 1e-12);
  assert.equal(firstForbiddenF, forbidden);
  assert.deepEqual(originalPlain.map((p,i) => mod29(p - sign * source(i))), terminal);
  const plant = solved.slice(0, 76);
  const cipher = plant.map((p,i) => mod29(p - sign * source(i)));
  assert.deepEqual(cipher.map((c,i) => mod29(c + sign * source(i))), plant);
  records.push({sign, fullIoc, prefixIoc, firstForbiddenF, output:spell(originalPlain)});
}
assert.ok(Math.abs(ioc(terminal) - 0.037894736842105266) < 1e-12);
console.log("ORIGINAL_BRIDGE_BACKWARD_WRAP", JSON.stringify({
  matchedFooter:"DJUBEI", keySource:"p27 original runes modulo234",
  sourceAlignedShift:shift, originalTerminalIoc:ioc(terminal),
  nativeP57PositiveRunes:76, records
},null,2));
