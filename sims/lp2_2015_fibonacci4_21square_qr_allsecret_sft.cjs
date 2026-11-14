"use strict";

/**
 * Four specific original LP2 Fibonacci pages 13/21/34/55 have 882 runes:
 * 2 * (21*21), the module count of two version-1 QR symbols.
 * Test whether either source-direct 21x21 array contains mandatory QR
 * 7x7 corner finders under ANY secret stationary GP29->binary assignment.
 * Input original, positive finder plant, no key brute force.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const file = fs.readFileSync(path.join(__dirname, "..", "resources",
  "liber-primus", "lp2-corpus.json"), "utf8");
const corpus = JSON.parse(file);
const pageIds = [13, 21, 34, 55];
const sourcePages = pageIds.map(n => {
  const p = corpus.pages.find(x => x.page === n);
  assert(p && p.status === "unsolved");
  return p.indices;
});
assert.deepEqual(sourcePages.map(p => p.length), [272, 273, 261, 76]);
const tape = sourcePages.flat();
assert.equal(tape.length, 882);
assert.equal(tape.length, 2 * 21 * 21);

function finderSites(omittedCorner) {
  const corners = [[0, 0], [0, 14], [14, 0], [14, 14]];
  const sites = [];
  for (let i = 0; i < corners.length; i++) {
    if (i === omittedCorner) continue;
    const [r0, c0] = corners[i];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const ring = Math.min(r, c, 6-r, 6-c);
        const black = +(ring === 0 || ring >= 2);
        sites.push([21*(r+r0)+c+c0, black]);
      }
    }
  }
  assert.equal(sites.length, 147);
  return sites;
}

/** Exact min Hamming distance across ALL 2^29 stationary binary maps. */
function allSecretFinderBound(panel, omit) {
  assert.equal(panel.length, 441);
  const counts = Array.from({length: 29}, () => [0, 0]);
  for (const [pos, color] of finderSites(omit)) {
    assert(Number.isInteger(panel[pos]) && panel[pos] >= 0 && panel[pos] < 29);
    counts[panel[pos]][color]++;
  }
  return {
    forcedWrong: counts.reduce((n, x) => n + Math.min(x[0], x[1]), 0),
    conflictingRunes: counts.filter(x => x[0] && x[1]).length
  };
}

const partitions = [
  ["contiguous", [tape.slice(0, 441), tape.slice(441)]],
  ["paired-lanes", [
    tape.filter((_, i) => i % 2 === 0),
    tape.filter((_, i) => i % 2 === 1)
  ]]
];

function run() {
  const result = partitions.map(([partition, panels]) => ({
    partition,
    panels:panels.map(panel => [0, 1, 2, 3].map(omit =>
      allSecretFinderBound(panel, omit)))
  }));
  assert.deepEqual(result.map(r => r.panels.map(row =>
    row.map(x => x.forcedWrong))), [
    [[42, 42, 40, 43], [42, 42, 42, 45]],
    [[45, 43, 46, 45], [40, 45, 42, 43]]
  ]);

  // Valid source-sized planted black/white finder using only two GP labels.
  const plant = Array(441).fill(0);
  for (const [site, bit] of finderSites(3)) plant[site] = bit;
  assert.equal(allSecretFinderBound(plant, 3).forcedWrong, 0);

  // Strengthen by requiring one common codebook for both panels, freely
  // sharing the same missing corner. The individual strict positives above
  // already rule out any such shared mapping.
  const minSingle = Math.min(...result.flatMap(r =>
    r.panels.flat().map(x => x.forcedWrong)));
  assert.equal(minSingle, 40);
  return {
    originalCorpusSha256:crypto.createHash("sha256").update(file).digest("hex"),
    pageIds, pageLengths:sourcePages.map(p => p.length),
    runes:tape.length, qrV1ModuleCount:441,
    independentlyMappedPanelFinderBounds:result,
    minimumForcedWrongFinderModules:minSingle,
    sourceSizedPositiveFinderMismatches:allSecretFinderBound(plant, 3).forcedWrong,
    interpretation:"No exact QR-v1 direct GP-rune bitmap, source link remains speculative"
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, allSecretFinderBound, finderSites};
