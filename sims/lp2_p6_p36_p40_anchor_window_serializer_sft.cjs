"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number[]} values @returns {number[]} */
function h4Inv(values) {
  assert.equal(values.length, 4);
  const inv2 = 15;
  return [
    mod29((values[0] + values[3]) * inv2),
    mod29((values[1] + values[2]) * inv2),
    mod29((values[2] - values[1]) * inv2),
    mod29((values[3] - values[0]) * inv2),
  ];
}

/** @param {number[]} values @returns {number[]} */
function h2x2(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[1]),
    mod29(values[0] + values[1]),
    mod29(values[2] - values[3]),
    mod29(values[2] + values[3]),
  ];
}

/** @param {number[]} values @returns {number[]} */
function h2x2Inv(values) {
  assert.equal(values.length, 4);
  const inv2 = 15;
  return [
    mod29((values[0] + values[1]) * inv2),
    mod29((values[1] - values[0]) * inv2),
    mod29((values[2] + values[3]) * inv2),
    mod29((values[3] - values[2]) * inv2),
  ];
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  const out = [];
  function visit(prefix, rest) {
    if (!rest.length) {
      out.push(prefix);
      return;
    }
    for (let index = 0; index < rest.length; index += 1) {
      visit(prefix.concat(rest[index]), rest.slice(0, index).concat(rest.slice(index + 1)));
    }
  }
  visit([], values);
  return out;
}

/**
 * Parse complete canonical words while retaining page-local rune offsets.
 * @param {string} transcription
 * @param {Map<string, number>} runeIndex
 * @returns {{page:number,endPage:number,start:number,values:number[]}[]}
 */
function parseCanonicalWords(transcription, runeIndex) {
  const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
  const words = [];
  let current = [];
  let startPage = -1;
  let endPage = -1;
  let startOffset = -1;

  function flush() {
    if (!current.length) return;
    words.push({ page: startPage, endPage, start: startOffset, values: current.slice() });
    current = [];
  }

  for (let block = 0; block < parts.length; block += 1) {
    const page = block >= 50 ? block + 1 : block;
    let offset = 0;
    for (const char of [...parts[block]]) {
      const value = runeIndex.get(char);
      if (value !== undefined) {
        if (!current.length) {
          startPage = page;
          startOffset = offset;
        }
        endPage = page;
        current.push(value);
        offset += 1;
      } else if (!/[\s/]/u.test(char)) {
        flush();
      }
    }
  }
  flush();
  return words.filter((word) => word.page === word.endPage);
}

/**
 * Build the frozen source-only paired key family. No authenticated GOOD/PATHS
 * rune values are loaded or embedded here.
 * @returns {{records:object[],meta:object}}
 */
function buildCandidates() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const transcription = read("resources/transcriptions/lp2-image-corrected.txt");
  const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
  const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
  const canonical = parseCanonicalWords(transcription, runeIndex);
  const localWords = (page) => canonical.filter((word) => word.page === page);

  const p6Ink = ink.pages.find((page) => page.page === 6);
  assert.ok(p6Ink);
  assert.deepEqual(p6Ink.red_spans, [{
    start: 71,
    length: 11,
    runes: "ᚪᛇᛄᛒᛗᚫᛡᛉᛒᛄᛇ",
  }]);
  const title = [...p6Ink.red_spans[0].runes].map((rune) => runeIndex.get(rune));
  assert.deepEqual(title, [24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12]);

  const titleLengths = [4, 1, 4, 2];
  const p36Anchor = titleLengths[0];
  const p40Anchor = titleLengths[0] + titleLengths[1] + titleLengths[2] - 1;
  assert.equal(p36Anchor, 4);
  assert.equal(p40Anchor, 8);

  const p36Receiver = localWords(36)[35];
  assert.ok(p36Receiver);
  assert.equal(p36Receiver.start, 169);
  assert.deepEqual(p36Receiver.values, [2, 22, 4, 1, 20]);
  assert.equal(p36Receiver.values[2], titleLengths[0]);
  const p36Prepared = p36Receiver.values.filter((_, index) => index !== 2);
  assert.deepEqual(p36Prepared, [2, 22, 1, 20]);

  const p40Receiver = localWords(40).find((word) => word.start === 71);
  assert.ok(p40Receiver);
  assert.deepEqual(p40Receiver.values, [4, 15, 14, 21]);

  const transforms = Object.freeze([
    ["identity", (values) => values.slice()],
    ["H4", h4],
    ["H4inv", h4Inv],
    ["H2x2", h2x2],
    ["H2x2inv", h2x2Inv],
  ]);
  const coordinatePermutations = permutations([0, 1, 2, 3]);
  assert.equal(coordinatePermutations.length, 24);

  const records = [];
  for (const relativeSlot of [1, 2, 3]) {
    const p36Window = title.slice(p36Anchor - relativeSlot, p36Anchor - relativeSlot + 4);
    const p40Window = title.slice(p40Anchor - relativeSlot, p40Anchor - relativeSlot + 4);
    assert.equal(p36Window.length, 4);
    assert.equal(p40Window.length, 4);
    for (const [transform, applyTransform] of transforms) {
      const p36Base = applyTransform(p36Window);
      const p40Base = applyTransform(p40Window);
      for (const permutation of coordinatePermutations) {
        for (const sign of [1, -1]) {
          const key36 = permutation.map((index) => mod29(sign * p36Base[index]));
          const key40 = permutation.map((index) => mod29(sign * p40Base[index]));
          const out36 = p36Prepared.map((value, index) => mod29(value - key36[index]));
          const out40 = p40Receiver.values.map((value, index) => mod29(value - key40[index]));
          records.push({ relativeSlot, transform, permutation, sign, key36, key40, out36, out40 });
        }
      }
    }
  }

  assert.equal(records.length, 720);
  assert.equal(new Set(records.map((row) => `${row.key36.join(",")}|${row.key40.join(",")}`)).size, 720);
  assert.equal(new Set(records.map((row) => `${row.out36.join(",")}|${row.out40.join(",")}`)).size, 720);

  const digest = crypto.createHash("sha256").update(JSON.stringify(records)).digest("hex");
  return {
    records,
    meta: {
      p36Anchor,
      p40Anchor,
      p36Prepared,
      p40Cipher: p40Receiver.values,
      candidateCount: records.length,
      digest,
    },
  };
}

if (require.main === module) {
  const { meta } = buildCandidates();
  console.log("PASS lp2_p6_p36_p40_anchor_window_serializer_sft");
  console.log(JSON.stringify(meta, null, 2));
}

module.exports = { buildCandidates, mod29 };
