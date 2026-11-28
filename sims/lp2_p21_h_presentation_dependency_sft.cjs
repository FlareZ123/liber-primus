"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const raw = fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-transcription.txt"), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = raw.split(/^\s*%\s*$/m);
const mod29 = (value) => ((value % 29) + 29) % 29;

/** @param {number} page */
function pageGroups(page) {
  assert.notEqual(page, 50);
  const block = parts[page <= 49 ? page : page - 1] || "";
  /** @type {{sites:{value:number}[]}[]} */
  const groups = [];
  /** @type {{sites:{value:number}[]} | null} */
  let current = null;
  const finish = () => {
    if (current) groups.push(current);
    current = null;
  };

  for (const ch of block) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current) current = { sites: [] };
      current.sites.push({ value });
    } else if (ch === "/" || /\s/u.test(ch)) {
      // Printed line breaks and whitespace do not end punctuation groups.
    } else {
      finish();
    }
  }
  finish();
  return groups;
}

const matchings = [
  { name: "adjacent", pairs: [[0, 1], [2, 3]] },
  { name: "cross", pairs: [[0, 2], [1, 3]] },
  { name: "outside-in", pairs: [[0, 3], [1, 2]] },
];

/**
 * @param {number[]} values
 * @param {[number,number][]} pairs
 * @param {1|-1} diffSign
 * @param {"difference-first"|"sum-first"} channelOrder
 * @param {"bounce"|"parallel"} returnMode
 */
function transform(values, pairs, diffSign, channelOrder, returnMode) {
  const secondPairs = returnMode === "bounce" ? pairs.slice().reverse() : pairs.slice();
  const diff = ([left, right]) => diffSign === 1
    ? mod29(values[left] - values[right])
    : mod29(values[right] - values[left]);
  const sum = ([left, right]) => mod29(values[left] + values[right]);
  return channelOrder === "difference-first"
    ? pairs.map(diff).concat(secondPairs.map(sum))
    : pairs.map(sum).concat(secondPairs.map(diff));
}

const presentations = [];
for (const matching of matchings) {
  for (const pairOrder of [
    { name: "forward", pairs: matching.pairs },
    { name: "reverse-pairs", pairs: matching.pairs.slice().reverse() },
  ]) {
    for (const diffSign of [1, -1]) {
      for (const channelOrder of ["difference-first", "sum-first"]) {
        for (const returnMode of ["bounce", "parallel"]) {
          presentations.push({
            name: [
              matching.name,
              pairOrder.name,
              diffSign === 1 ? "left-minus-right" : "right-minus-left",
              channelOrder,
              returnMode,
            ].join("|"),
            matching: matching.name,
            diffSign,
            run: (values) => transform(values, pairOrder.pairs, diffSign, channelOrder, returnMode),
          });
        }
      }
    }
  }
}
assert.equal(presentations.length, 48);

const h4Objects = [];
for (let page = 1; page <= 55; page += 1) {
  if (page === 50) continue;
  const groups = pageGroups(page);
  const group = groups[page - 1];
  if (!group || group.sites.length !== 4) continue;
  h4Objects.push({ page, values: group.sites.map((site) => site.value) });
}
assert.equal(h4Objects.length, 10);

const hits = [];
for (const row of h4Objects) {
  for (const presentation of presentations) {
    const output = presentation.run(row.values);
    for (let omittedIndex = 0; omittedIndex < 4; omittedIndex += 1) {
      const kept = output.filter((_, index) => index !== omittedIndex);
      for (const reversed of [false, true]) {
        const ordered = reversed ? kept.slice().reverse() : kept.slice();
        for (let insertPosition = 0; insertPosition <= 3; insertPosition += 1) {
          const sequence = ordered.slice();
          sequence.splice(insertPosition, 0, row.page);
          if (!sequence.every((value, index) => value === sequence[0] + index)) continue;
          hits.push({
            page: row.page,
            presentation: presentation.name,
            matching: presentation.matching,
            diffSign: presentation.diffSign,
            output,
            omittedIndex,
            omitted: output[omittedIndex],
            reversed,
            insertPosition,
            sequence,
          });
        }
      }
    }
  }
}

assert.equal(hits.length, 4);
assert.deepEqual([...new Set(hits.map((hit) => hit.page))], [21]);
assert.ok(hits.every((hit) => hit.matching === "outside-in"));
assert.ok(hits.every((hit) => hit.diffSign === 1));
assert.ok(hits.every((hit) => hit.omitted === 6));
assert.ok(hits.every((hit) => hit.insertPosition === 1));
assert.ok(hits.every((hit) => JSON.stringify(hit.sequence) === JSON.stringify([20, 21, 22, 23])));

console.log(JSON.stringify({
  status: "PASS",
  classification: "post-observation H-presentation dependency audit; no plaintext/key claim",
  sourceFamily: {
    selfIndexedFourRuneObjects: h4Objects.length,
    pairings: matchings.map((matching) => matching.name),
    presentations: presentations.length,
    omissionOrientationInsertionConfigurationsPerPresentationObject: 32,
    totalConfigurations: h4Objects.length * presentations.length * 32,
  },
  result: {
    hitCount: hits.length,
    hitPages: [...new Set(hits.map((hit) => hit.page))],
    allHitsUseOutsideInPairing: hits.every((hit) => hit.matching === "outside-in"),
    allHitsUseLeftMinusRightDifference: hits.every((hit) => hit.diffSign === 1),
    allHitsOmit: 6,
    allHitsReconstruct: [20, 21, 22, 23],
    hits,
  },
  conclusion: "The p21 correlation is highly specific inside this natural family, but the semantic hit itself selects the outside-in/left-minus-right operator choices. It therefore cannot independently authenticate H as an authored/source-selected transform.",
}, null, 2));
console.log("PASS lp2_p21_h_presentation_dependency_sft");
