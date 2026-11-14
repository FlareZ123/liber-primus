"use strict";

/**
 * Original LP2 page55 terminal six-rune to p27 offset28 loopback.
 * Page numbers/offsets are zero-based LP2 physical page and rune positions.
 * Exact source link and one frozen, directionally motivated key consumer.
 *
 * SFT: node sims/lp2_p55_final6_p27_28loop_original_sft.cjs
 * Node.js 20+ CommonJS. Original corpus read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const ps = source.pages.filter(p => p.page < 56 && p.indices.length > 0);
assert.equal(ps.length, 55);
const p27 = ps.find(p => p.page === 27);
const p55 = ps.find(p => p.page === 55);
const p57 = source.pages.find(p => p.page === 57);
assert(p27 && p55 && p57);
assert.equal(p27.indices.length, 234);
assert.equal(p55.indices.length, 76);
const same = (a, b) => a.length === b.length &&
  a.every((v, i) => v === b[i]);
const tail = p55.indices.slice(-6);
const anchor = p27.indices.slice(28, 34);
assert(same(tail, anchor));
assert.equal(p55.page - p27.page, 28);

// Search every source-page six-rune endpoint against every other page.
// A match is counted even when its target page is later rather than earlier.
const links = [];
for (const from of ps) {
  const suffix = from.indices.slice(-6);
  for (const to of ps) {
    if (from.page === to.page) continue;
    for (let offset = 0; offset + 6 <= to.indices.length; offset++) {
      if (same(suffix, to.indices.slice(offset, offset + 6))) {
        links.push({
          from: from.page, to: to.page,
          offset, gap: from.page - to.page
        });
      }
    }
  }
}
assert.deepEqual(links, [{from: 55, to: 27, offset: 28, gap: 28}]);
assert.equal(tail.map(i => source.translit[i]).join("."), "D.J.U.B.E.I");
const afterAnchor = p27.indices.slice(34, 104);
const front = p55.indices.slice(0, 70);
assert.equal(afterAnchor.length, front.length);

/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const s of symbols) counts[s]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}
const subtract = front.map((c, i) => (c - afterAnchor[i] + 29) % 29);
const add = front.map((c, i) => (c + afterAnchor[i]) % 29);
const plant = p57.indices.slice(0, 70);
assert.equal(plant.length, 70);
const reencr = plant.map((p, i) => (p + afterAnchor[i]) % 29);
assert(same(reencr.map((c, i) => (c - afterAnchor[i] + 29) % 29), plant));
assert(!same(subtract, plant));
assert(indexOfCoincidence(plant) > indexOfCoincidence(subtract));
assert(indexOfCoincidence(plant) > indexOfCoincidence(add));

// Conditional after selecting this exact pair and six-rune marker, there
// are 76*234 possible independent circular shifts, and exactly one pair
// puts both marker positions at the observed endpoint/offset. This is a
// positional reference, never an uncorrected discovery significance.
const conditionalRotations = p55.indices.length * p27.indices.length;
console.log(JSON.stringify({
  claim: "candidate terminal-page navigation marker, not plaintext",
  source: {runeBearingPages: ps.length,
    p55Len: p55.indices.length, p27Len: p27.indices.length},
  endpointLinksOfSixRunesAcrossAllPages: links,
  repeatedGematria: tail.map(i => source.translit[i]).join("-"),
  conditionalRotationalPlacements: conditionalRotations,
  fixedHypothesis: "p27 following six-rune marker at offset34 supplies 70 GP29 key runes for p55 preceding 70 cipher runes",
  directAdditiveResults: {
    subtractIoC: indexOfCoincidence(subtract),
    addIoC: indexOfCoincidence(add),
    solvedP57First70IoC: indexOfCoincidence(plant),
    subtractLatin: subtract.map(i => source.translit[i]).join(""),
    addLatin: add.map(i => source.translit[i]).join("")
  },
  recoveredUnknownPlaintext: false
}, null, 2));
