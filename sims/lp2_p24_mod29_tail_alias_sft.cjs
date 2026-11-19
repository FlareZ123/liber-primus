"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const clear = signed2016.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const source = (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase());
assert.equal(source.length, 43);

// Frozen upstream packets, each reproduced independently by its own SFT:
// - p24 line-wrap H union: consecutive authenticated-source residues 9..15.
// - p55 local state route: authenticated source indices 36..38 = GOOD LUCK BEWARE.
// - source-register coverage already established through index29.
// - p31 distance route already establishes the interval through index35.
const p24ResidueRun = [9,10,11,12,13,14,15];
const p55TailAnchor = [36,37,38];
const establishedPrefix = Array.from({length:30}, (_, index) => index);
const p31Corridor = Array.from({length:13}, (_, index) => index + 23);

assert.deepEqual(
  p24ResidueRun.map((index) => source[index]),
  ["LIBER","PRIMUS","IS","THE","WAY","ITS","WORDS"]
);
assert.deepEqual(
  p55TailAnchor.map((index) => source[index]),
  ["GOOD","LUCK","BEWARE"]
);

// H lives modulo29. For each residue in the selected p24 run, enumerate every
// source index congruent to it modulo29 within the 43-word authenticated source.
/** @param {number} residue @returns {number[]} */
function sourceAliases(residue) {
  const values = [];
  for (let value = residue; value < source.length; value += 29) {
    values.push(value);
  }
  return values;
}

const aliases = Object.fromEntries(
  p24ResidueRun.map((residue) => [residue, sourceAliases(residue)])
);
assert.deepEqual(aliases, {
  9:[9,38],
  10:[10,39],
  11:[11,40],
  12:[12,41],
  13:[13,42],
  14:[14],
  15:[15],
});

// The independently recovered BEWARE38 fixes the high congruent branch at the
// first p24 residue. Continuing that same +29 branch while it remains inside
// the authenticated source is deterministic.
assert.equal(p24ResidueRun[0] + 29, p55TailAnchor[2]);
assert.equal(source[p55TailAnchor[2]], "BEWARE");

const highBranch = p24ResidueRun
  .map((residue) => residue + 29)
  .filter((index) => index < source.length);
assert.deepEqual(highBranch, [38,39,40,41,42]);
assert.deepEqual(
  highBranch.map((index) => source[index]),
  ["BEWARE","FALSE","PATHS","VERIFY","OPENPGP"]
);

const completedTail = [...p55TailAnchor, ...highBranch.slice(1)];
assert.deepEqual(completedTail, [36,37,38,39,40,41,42]);
assert.deepEqual(
  completedTail.map((index) => source[index]),
  ["GOOD","LUCK","BEWARE","FALSE","PATHS","VERIFY","OPENPGP"]
);

// Combining independently established source-register coverage with this
// alias branch closes every authenticated source index 0..42.
const completeCoverage = [...new Set([
  ...establishedPrefix,
  ...p31Corridor,
  ...p55TailAnchor,
  ...highBranch,
])].sort((left, right) => left - right);
assert.deepEqual(
  completeCoverage,
  Array.from({length:43}, (_, index) => index)
);

console.log(JSON.stringify({
  status:"PASS",
  upstream:{
    p24ResidueRun,
    p24Words:p24ResidueRun.map((index)=>source[index]),
    p55TailAnchor,
    p55Words:p55TailAnchor.map((index)=>source[index]),
    establishedPrefix:[0,29],
    p31Corridor:[23,35],
  },
  congruence:{
    modulus:29,
    sourceLength:source.length,
    aliases,
    anchoredAt:{residue:9,index:38,word:source[38]},
    highBranch,
    highWords:highBranch.map((index)=>source[index]),
  },
  completedTail:{
    indices:completedTail,
    words:completedTail.map((index)=>source[index]),
  },
  sourceCoverage:{
    indices:[completeCoverage[0],completeCoverage[completeCoverage.length-1]],
    count:completeCoverage.length,
    words:source,
  },
  decision:"P55's independently recovered BEWARE38 selects the sole higher congruent branch of p24's established residue run 9..15. That branch deterministically yields 38..42 = BEWARE FALSE PATHS VERIFY OPENPGP. Together with established coverage through35 and p55 GOOD LUCK BEWARE at36..38, the manuscript-side source register now covers every signed-source index0..42.",
}, null, 2));
