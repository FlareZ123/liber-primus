"use strict";

/**
 * Signed-message register-origin gate for Director issue #3354.
 * SFT: node sims/lp2_p50_signed_register_origin_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8")
  .replace(/\r\n/g, "\n");

const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----\nHash: [^\n]+\n\n/u, "");

const words = clear.split(/[^A-Za-z0-9]+/u)
  .filter((x) => /^[A-Za-z]+$/u.test(x))
  .map((x) => x.toUpperCase());

assert.equal(words.length, 43);

const zeroOrigin = (n) => words[n];
const oneBased = (n) => words[n - 1];
const expected = new Map([
  [17, ["THE", "ARE"]],
  [18, ["MAP", "THE"]],
  [19, ["THEIR", "MAP"]],
  [20, ["MEANING", "THEIR"]],
  [21, ["IS", "MEANING"]],
  [22, ["THE", "IS"]],
  [23, ["ROAD", "THE"]],
  [24, ["AND", "ROAD"]],
  [28, ["THE", "ARE"]],
  [29, ["DIRECTION", "THE"]],
  [35, ["FOUND", "BE"]],
  [36, ["GOOD", "FOUND"]],
  [39, ["FALSE", "BEWARE"]],
  [40, ["PATHS", "FALSE"]]
]);

for (const [n, pair] of expected) {
  assert.equal(zeroOrigin(n), pair[0]);
  assert.equal(oneBased(n), pair[1]);
}

assert.equal(zeroOrigin(22) + " " + zeroOrigin(23), "THE ROAD");
assert.equal(oneBased(22) + " " + oneBased(23), "IS THE");
assert.equal(zeroOrigin(17) + " " + zeroOrigin(18), "THE MAP");
assert.equal(oneBased(17) + " " + oneBased(18), "ARE THE");

const lineCounts = clear.split("\n")
  .map((line) => (line.match(/[A-Za-z]+/g) || []).length);
assert.equal(Math.max(...lineCounts), 11);
assert.ok(lineCounts.every((n) => n < 29));

const book2012 = read("im-results/2012-845145127/162667212858-image-payload.asc");
assert.match(book2012, /^1:29$/mu);
assert.match(book2012, /^1:1$/mu);
assert.match(book2012, /^the first prime$/mu);

console.log(JSON.stringify({
  words: words.length,
  integer29: {zero: zeroOrigin(29), one: oneBased(29)},
  rank17_18: {
    zero: [zeroOrigin(17), zeroOrigin(18)],
    one: [oneBased(17), oneBased(18)]
  },
  rank22_23: {
    zero: [zeroOrigin(22), zeroOrigin(23)],
    one: [oneBased(22), oneBased(23)]
  },
  maxLineWords: Math.max(...lineCounts)
}, null, 2));
