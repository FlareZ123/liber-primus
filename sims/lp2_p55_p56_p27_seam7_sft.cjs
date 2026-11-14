"use strict";

/**
 * Exact LP2 physical-page seam-bridge census, original page order and
 * all alternative directed page adjacencies. CommonJS, Node.js 20+.
 *
 * Run from repository root: node sims/lp2_p55_p56_p27_seam7_sft.cjs
 * This is a source-level navigation observation, not a decryption.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const input = fs.readFileSync(path.resolve(__dirname,
  "../resources/liber-primus/lp2-corpus.json"));
const source = JSON.parse(input.toString("utf8"));
const all = source.pages.filter(p => p.page >= 0 && p.page <= 57);
const pages = all.filter(p => p.indices.length > 0);
assert.equal(all.length, 58);
assert.equal(pages.length, 57);
assert.equal(all.find(p => p.page === 50).indices.length, 0);
const get = number => all.find(p => p.page === number);
const [p27, p55, p56] = [get(27), get(55), get(56)];
assert.equal(p27.indices.length, 234);
assert.equal(p55.indices.length, 76);
const eq = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);
const key = x => x.join(",");

/** @param {number} length */
function internalIndex(length) {
  const index = new Map();
  for (const p of pages) {
    for (let i = 0; i + length <= p.indices.length; i++) {
      const k = key(p.indices.slice(i, i + length));
      if (!index.has(k)) index.set(k, []);
      index.get(k).push({page: p.page, offset: i});
    }
  }
  return index;
}

/** @param {number} length */
function directedBridges(length) {
  const index = internalIndex(length);
  const arcs = [];
  for (const left of pages) {
    for (const right of pages) {
      if (left.page === right.page) continue;
      for (let suffixLength = 1; suffixLength < length; suffixLength++) {
        if (left.indices.length < suffixLength ||
            right.indices.length < length - suffixLength) continue;
        const joined = left.indices.slice(-suffixLength)
          .concat(right.indices.slice(0, length - suffixLength));
        const matches = index.get(key(joined));
        if (matches) arcs.push({
          left: left.page, right: right.page, suffixLength,
          prefixLength: length - suffixLength,
          runeSequence: joined.map(i => source.translit[i]).join("-"),
          matches
        });
      }
    }
  }
  return {
    length,
    allDirectedPagePairs: pages.length * (pages.length - 1),
    withinPageRepeatedTypes: [...index.values()].filter(v => v.length > 1).length,
    directedBridgeCount: arcs.length,
    arcs
  };
}

const scans = [4, 5, 6, 7, 8].map(directedBridges);
const seven = scans.find(s => s.length === 7);
assert.deepEqual(scans.map(s => s.withinPageRepeatedTypes), [126, 6, 1, 0, 0]);
assert.equal(seven.directedBridgeCount, 1);
assert.deepEqual(seven.arcs, [{
  left: 55, right: 56, suffixLength: 6, prefixLength: 1,
  runeSequence: "D-J-U-B-E-I-AE",
  matches: [{page: 27, offset: 28}]
}]);

const six = p55.indices.slice(-6);
const extension = six.concat(p56.indices[0]);
assert(eq(six, p27.indices.slice(28, 34)));
assert(eq(extension, p27.indices.slice(28, 35)));
assert.equal(p27.indices[35], 0); // F after the bridge
assert.equal(source.translit[p56.indices[0]], "AE");
assert.equal(source.translit[(p56.indices[0] - 1 + 29) % 29], "A");
// The historical p56 first-key shift is phi(2)=1, so its AE decrypts to A.
const initialAE = pages.filter(p => p.indices[0] === p56.indices[0])
  .map(p => p.page);
assert.deepEqual(initialAE, [56]);

// Verify which directed bridge is actually adjacent in the original
// physical page order, retaining the empty p50 position.
const sourceNeighborBridges = seven.arcs.filter(a => a.right === a.left + 1);
assert.deepEqual(sourceNeighborBridges, seven.arcs);

// This 1/57 is conditional on permuting 57 complete rune-bearing pages
// after observing the exact singleton eligible directed arc. It is NOT a
// discovery-wide probability of authorship, or of finding the motif.
const conditionalNeighborFraction = "1/57";

console.log(JSON.stringify({
  inputSha256: crypto.createHash("sha256").update(input).digest("hex"),
  observation: "only possible directed seven-rune seam bridge in the 58-page LP2 source",
  sourcePages: all.length,
  runeBearingPages: pages.length,
  countAllDirectedPairs: pages.length * (pages.length - 1),
  allSeamCensus: scans.map(({length, withinPageRepeatedTypes, directedBridgeCount}) =>
    ({length, withinPageRepeatedTypes, directedBridgeCount})),
  uniqueSevenBridge: seven.arcs[0],
  originalAdjacentPageBridge: sourceNeighborBridges.length,
  p56SoleInitialAEPage: initialAE,
  p56FirstRuneKnownPlain: "A",
  p27NextRuneAfterSeven: source.translit[p27.indices[35]],
  conditionalNeighborFraction,
  recoveredUnknownPlaintext: false
}, null, 2));
