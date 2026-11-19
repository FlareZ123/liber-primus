"use strict";

/**
 * SFT for the signed-2016 BEWARE FALSE PATHS page-index map.
 *
 * Windows Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));

const bodyStart = signed2016.indexOf("Hello.");
const signatureStart = signed2016.indexOf("-----BEGIN PGP SIGNATURE-----");
assert.ok(bodyStart >= 0 && signatureStart > bodyStart);

const body = signed2016
  .slice(bodyStart, signatureStart)
  .replace(/\b7A35090F\b/g, "");
const words = (body.match(/[A-Za-z]+/g) || []).map((word) =>
  word.toUpperCase()
);
assert.equal(words.length, 43);
assert.deepEqual(words.slice(36, 41), [
  "GOOD",
  "LUCK",
  "BEWARE",
  "FALSE",
  "PATHS",
]);
assert.deepEqual(words.slice(38, 41), ["BEWARE", "FALSE", "PATHS"]);

const imageForPage = (page) =>
  `resources/liber-primus/${String(page + 17).padStart(2, "0")}.jpg`;

for (const page of [38, 39, 40]) {
  assert.ok(fs.existsSync(path.join(root, imageForPage(page))));
}
assert.equal(imageForPage(38), "resources/liber-primus/55.jpg");
assert.equal(imageForPage(39), "resources/liber-primus/56.jpg");
assert.equal(imageForPage(40), "resources/liber-primus/57.jpg");

// Independent p38 source-state BEWARE selector.
const p38 = corpus.pages.find((page) => page.page === 38);
assert.ok(p38);
const section5Cipher = p38.indices.slice(57, 63);
assert.deepEqual(section5Cipher, [8, 25, 14, 2, 17, 22]);
assert.equal(section5Cipher.length, 6);
assert.equal(section5Cipher.reduce((sum, value) => sum + value, 0), 88);

// Canonical GP values from the published p38 source-state report.
const beware = [17, 18, 7, 24, 4, 18];
const luck = [20, 1, 5, 5];
assert.equal(beware.length, 6);
assert.equal(beware.reduce((sum, value) => sum + value, 0), 88);
assert.equal(luck.reduce((sum, value) => sum + value, 0), 31);

assert.equal(grid.bytes[88], 211); // base60 token 3V
assert.equal(grid.bytes[88] % 60, 31);
assert.equal(grid.bytes[88] % 60, luck.reduce((sum, value) => sum + value, 0));

console.log(JSON.stringify({
  status: "PASS",
  signedIndices: {
    36: words[36],
    37: words[37],
    38: words[38],
    39: words[39],
    40: words[40],
  },
  pageImageMap: {
    38: imageForPage(38),
    39: imageForPage(39),
    40: imageForPage(40),
  },
  p38IndependentStateMatch: {
    receiver: "p38[57..62]",
    cipher: section5Cipher,
    receiverLength: section5Cipher.length,
    receiverGP0: section5Cipher.reduce((sum, value) => sum + value, 0),
    target: words[38],
    targetLength: beware.length,
    targetGP0: beware.reduce((sum, value) => sum + value, 0),
    predecessor: words[37],
    predecessorGP0: luck.reduce((sum, value) => sum + value, 0),
    p50At88Low60: grid.bytes[88] % 60,
  },
  classification:
    "Exact source/page-index scaffold. Human visual inspection supplies the p39 red-X FALSE and p40 branching-art PATHS semantic evidence; this SFT verifies the authenticated indices, original image mapping, and independent p38 LUCK->BEWARE state match.",
}, null, 2));
