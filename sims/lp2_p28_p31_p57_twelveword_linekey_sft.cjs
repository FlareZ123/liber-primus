"use strict";

/**
 * Twelve-word solved p57 instruction against the twelve physical rune lines of
 * the source-selected p28-p31 block. Uses the already established whole-word
 * GP0 number grammar as one constant GP29 Caesar shift per line.
 *
 * Run:
 *   node sims/lp2_p28_p31_p57_twelveword_linekey_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const referenceText = read("resources/liber-primus/lp1-plaintext-reference.txt");
const model = buildSourceNativeTrigramModel({ corpus, referenceText });

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {string} text */
function runeWords(text) {
  return (text.match(/[\u16A0-\u16FF]+/gu) || []).map(word =>
    [...word].map(rune => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/** @param {number} physicalPage */
function physicalLines(physicalPage) {
  const partIndex = physicalPage <= 49 ? physicalPage : physicalPage - 1;
  return parts[partIndex]
    .split(/\r?\n/)
    .filter(line => line.includes("/"))
    .map(line => runeWords(line).flat());
}

const p57 = solved.sections.find(section => section.name === "p57_parable");
assert.ok(p57);
const p57Words = runeWords(p57.source_text);
const gp0 = word => word.reduce((sum, value) => sum + value, 0);
const translit = word => word.map(value => corpus.translit[value]).join("");
const rows = p57Words.map(word => ({ text: translit(word), gp0: gp0(word) }));

const start = rows.findIndex(row => row.text === "WE");
assert.ok(start >= 0);
const instruction = rows.slice(start);
assert.deepEqual(instruction.map(row => row.text), [
  "WE", "MUST", "SHED", "OUR", "OWN", "CIRCUMFERENCES",
  "FIND", "THE", "DIUINITY", "WITHIN", "AND", "EMERGE",
]);
assert.equal(instruction.length, 12);
const key = instruction.map(row => mod29(row.gp0));
assert.deepEqual(key, [25, 22, 6, 8, 19, 15, 13, 20, 18, 9, 27, 25]);

const candidates = [];
for (const physicalPage of [28, 29, 30, 31]) {
  const lines = physicalLines(physicalPage);
  assert.equal(lines.length, 12);
  const page = corpus.pages.find(row => row.page === physicalPage);
  assert.ok(page);
  assert.deepEqual(lines.flat(), page.indices);

  for (const [direction, sign] of [["subtract", -1], ["add", 1]]) {
    const decodedLines = lines.map((line, lineIndex) =>
      line.map(rune => mod29(rune + sign * key[lineIndex]))
    );
    const plain = decodedLines.flat();
    candidates.push({
      page: physicalPage,
      direction,
      score: model.scoreChapters(decodedLines).mean,
      prefix: model.spell(plain.slice(0, 120)),
    });
  }
}

/* Positive control uses the same twelve line shifts on native solved text. */
const controlLines = Array.from({ length: 12 }, (_, i) =>
  model.training.slice(i * 20, i * 20 + 20)
);
const planted = controlLines.map((line, i) =>
  line.map(rune => mod29(rune + key[i]))
);
const recovered = planted.map((line, i) =>
  line.map(rune => mod29(rune - key[i]))
);
assert.deepEqual(recovered, controlLines);
const controlScore = model.scoreChapters(recovered).mean;
assert.ok(controlScore > -2.7);

candidates.sort((a, b) => b.score - a.score);
console.log(JSON.stringify({
  instruction: instruction.map(row => ({ word: row.text, gp0: row.gp0 })),
  key,
  best: candidates,
  controls: {
    solvedP57: model.p57Score,
    planted: controlScore,
  },
}, null, 2));
