"use strict";

/**
 * Direct periodic-key gate for the source-selected p28 centered word.
 * Tests only the literal five-rune word, its once-shed three-rune interior,
 * and the interior GP0 scalar35 against p28 and the selected p28-p31 block.
 *
 * Run:
 *   node sims/lp2_p28_centerword_periodic_key_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const referenceText = read("resources/liber-primus/lp1-plaintext-reference.txt");
const model = buildSourceNativeTrigramModel({ corpus, referenceText });

const selected = [28, 24, 10, 1, 20];
const interior = selected.slice(1, -1);
assert.deepEqual(interior, [24, 10, 1]);
assert.equal(interior.reduce((a, b) => a + b, 0), 35);

const p28 = corpus.pages.find(page => page.page === 28).indices;
const block = [28, 29, 30, 31].flatMap(pageNumber => {
  const page = corpus.pages.find(candidate => candidate.page === pageNumber);
  assert.ok(page);
  return page.indices;
});

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 */
function apply(cipher, key, sign) {
  return cipher.map((value, index) =>
    mod29(value + sign * key[index % key.length])
  );
}

const keyFamilies = {
  interior,
  fullWord: selected,
  scalar35: [35 % 29],
};

const candidates = [];
for (const [targetName, cipher] of Object.entries({ p28, block })) {
  for (const [keyName, key] of Object.entries(keyFamilies)) {
    for (const [direction, sign] of [["subtract", -1], ["add", 1]]) {
      const plain = apply(cipher, key, sign);
      candidates.push({
        targetName,
        keyName,
        direction,
        score: model.scoreStream(plain).mean,
        prefix: model.spell(plain.slice(0, 140)),
      });
    }
  }
}

const control = model.training.slice(0, 269);
const planted = apply(control, interior, 1);
const recovered = apply(planted, interior, -1);
assert.deepEqual(recovered, control);
const controlScore = model.scoreStream(recovered).mean;
assert.ok(controlScore > -2.7);

candidates.sort((a, b) => b.score - a.score);
console.log(JSON.stringify({
  selected,
  interior,
  keys: keyFamilies,
  candidates,
  controls: {
    solvedP57: model.p57Score,
    planted: controlScore,
  },
}, null, 2));
