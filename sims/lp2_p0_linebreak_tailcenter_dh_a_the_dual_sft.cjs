"use strict";

/**
 * Source-visible line-break value gate for two signed-2016 p0 phrase candidates.
 *
 * Finite family:
 * - every unknown-page physical line crossing whose immediately preceding
 *   printed word has two GP29 runes;
 * - every authenticated 2016 adjacent pair whose GP29 lengths match;
 * - each of seven source-derived DH23 state values as first key rune;
 * - additive and subtractive signs;
 * - first, last, center when odd, and GP0-sum selectors on the pre-break
 *   part, post-break tail, and whole second source word.
 *
 * A hit requires exact forward reconstruction of the two original ciphertext
 * runes. No language score or p50 numeral-to-LP2-offset interpretation is used.
 *
 * Run:
 *   node sims/lp2_p0_linebreak_tailcenter_dh_a_the_dual_sft.cjs
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const RES = path.join(ROOT, "resources", "liber-primus");
const HIST = path.join(ROOT, "resources", "historical");

const corpus = JSON.parse(
  fs.readFileSync(path.join(RES, "lp2-corpus.json"), "utf8")
);
const transcription = fs
  .readFileSync(path.join(RES, "lp2-transcription.txt"), "utf8")
  .replace(/\r/g, "");
const signed2016 = fs
  .readFileSync(path.join(HIST, "cicada2016-4gq25-outguess.asc"), "utf8")
  .replace(/\r/g, "");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/**
 * @param {string} word
 * @returns {number[]}
 */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/Q/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S");

  /** @type {number[]} */
  const out = [];
  for (let index = 0; index < normalized.length; ) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, index)
    );
    assert(token, "unmapped GP token in " + word + " at " + index);
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

const clear2016 = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const messageWords = clear2016
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((token) => token.toUpperCase());

assert.strictEqual(messageWords.length, 43);

/** @type {{index:number,left:string,right:string,leftGp:number[],rightGp:number[]}[]} */
const signedPairs = messageWords.slice(0, -1).map((left, index) => ({
  index,
  left,
  right: messageWords[index + 1],
  leftGp: gp(left),
  rightGp: gp(messageWords[index + 1]),
}));

/**
 * @typedef {{
 *   number:number,
 *   start:number,
 *   end:number,
 *   length:number,
 *   values:number[]
 * }} Word
 */

/**
 * @typedef {{
 *   page:number,
 *   crossingWord:Word,
 *   predecessor:Word,
 *   breakOffset:number,
 *   headLength:number,
 *   tailLength:number
 * }} Event
 */

/**
 * @param {string} source
 * @param {number} page
 * @returns {Event[]}
 */
function lineCrossingEvents(source, page) {
  const chunks = source.trim().split("/");
  /** @type {number[]} */
  const breakOffsets = [];
  let seenRunes = 0;

  for (let index = 0; index < chunks.length - 1; index += 1) {
    seenRunes += [...chunks[index]].filter((char) => runeSet.has(char)).length;
    breakOffsets.push(seenRunes);
  }

  /** @type {Word[]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  let start = 0;
  let offset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      number: words.length + 1,
      start,
      end: offset - 1,
      length: current.length,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "/" || /\s/u.test(char)) {
      // Physical layout preserves a word across a line wrap.
    } else {
      flush();
    }
  }
  flush();

  /** @type {Event[]} */
  const events = [];
  for (let index = 1; index < words.length; index += 1) {
    const crossingWord = words[index];
    const predecessor = words[index - 1];
    const breakOffset = breakOffsets.find(
      (value) => crossingWord.start < value && value <= crossingWord.end
    );
    if (breakOffset === undefined || predecessor.length !== 2) continue;

    events.push({
      page,
      crossingWord,
      predecessor,
      breakOffset,
      headLength: breakOffset - crossingWord.start,
      tailLength: crossingWord.end - breakOffset + 1,
    });
  }
  return events;
}

const physicalParts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const events = physicalParts.flatMap((source, segment) =>
  lineCrossingEvents(source, segment >= 50 ? segment + 1 : segment)
);
assert.strictEqual(events.length, 66);

const dh = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
});

/**
 * @param {number[]} values
 * @param {string} prefix
 * @returns {{name:string,value:number}[]}
 */
function selectorVariants(values, prefix) {
  assert(values.length > 0);
  const variants = [
    { name: prefix + ":first", value: values[0] },
    { name: prefix + ":last", value: values[values.length - 1] },
    {
      name: prefix + ":sum",
      value: mod29(values.reduce((sum, value) => sum + value, 0)),
    },
  ];
  if (values.length % 2 === 1) {
    variants.push({
      name: prefix + ":center",
      value: values[(values.length - 1) / 2],
    });
  }
  return variants;
}

/** @type {any[]} */
const hits = [];
let shapeMatchedAssignments = 0;
let selectorInstances = 0;

for (const event of events) {
  const candidatePairs = signedPairs.filter(
    (pair) =>
      pair.leftGp.length === 2 &&
      pair.rightGp.length === event.crossingWord.length
  );

  shapeMatchedAssignments += candidatePairs.length;

  for (const pair of candidatePairs) {
    const head = pair.rightGp.slice(0, event.headLength);
    const tail = pair.rightGp.slice(event.headLength);
    assert.strictEqual(tail.length, event.tailLength);

    const selectors = [
      ...selectorVariants(head, "head"),
      ...selectorVariants(tail, "tail"),
      ...selectorVariants(pair.rightGp, "whole"),
    ];
    selectorInstances += selectors.length;

    for (const selector of selectors) {
      for (const [stateName, state] of Object.entries(dh)) {
        for (const sign of ["add", "subtract"]) {
          const key = [state, selector.value];
          const predicted = pair.leftGp.map((plain, index) =>
            sign === "add"
              ? mod29(plain + key[index])
              : mod29(plain - key[index])
          );

          if (
            predicted.every(
              (value, index) => value === event.predecessor.values[index]
            )
          ) {
            hits.push({
              page: event.page,
              receiverWord: event.crossingWord.number,
              shape: [2, event.crossingWord.length],
              split: [event.headLength, event.tailLength],
              phrase: pair.left + " " + pair.right,
              sourceIndex: pair.index,
              stateName,
              state,
              sign,
              selector: selector.name,
              selectorValue: selector.value,
              key,
              predicted,
              ciphertext: event.predecessor.values,
            });
          }
        }
      }
    }
  }
}

assert.strictEqual(shapeMatchedAssignments, 48);
assert.strictEqual(selectorInstances, 520);
assert.strictEqual(selectorInstances * 7 * 2, 7280);
assert.strictEqual(hits.length, 16);

const p0RoadEvent = events.find(
  (event) =>
    event.page === 0 &&
    event.crossingWord.start === 105 &&
    event.crossingWord.end === 108
);
const p0DevotedEvent = events.find(
  (event) =>
    event.page === 0 &&
    event.crossingWord.start === 237 &&
    event.crossingWord.end === 243
);
assert(p0RoadEvent);
assert(p0DevotedEvent);

assert.deepStrictEqual(
  [p0RoadEvent.predecessor.number, p0RoadEvent.crossingWord.number],
  [22, 23]
);
assert.deepStrictEqual(
  [p0RoadEvent.predecessor.start, p0RoadEvent.predecessor.end],
  [103, 104]
);
assert.deepStrictEqual(
  [p0RoadEvent.breakOffset, p0RoadEvent.headLength, p0RoadEvent.tailLength],
  [108, 3, 1]
);
assert.deepStrictEqual(p0RoadEvent.predecessor.values, [8, 12]);

assert.deepStrictEqual(
  [p0DevotedEvent.predecessor.number, p0DevotedEvent.crossingWord.number],
  [53, 54]
);
assert.deepStrictEqual(
  [p0DevotedEvent.predecessor.start, p0DevotedEvent.predecessor.end],
  [235, 236]
);
assert.deepStrictEqual(
  [
    p0DevotedEvent.breakOffset,
    p0DevotedEvent.headLength,
    p0DevotedEvent.tailLength,
  ],
  [239, 2, 5]
);
assert.deepStrictEqual(p0DevotedEvent.predecessor.values, [8, 5]);

const roadPairs = signedPairs.filter(
  (pair) =>
    pair.leftGp.length === 2 &&
    pair.rightGp.length === p0RoadEvent.crossingWord.length
);
const devotedPairs = signedPairs.filter(
  (pair) =>
    pair.leftGp.length === 2 &&
    pair.rightGp.length === p0DevotedEvent.crossingWord.length
);
assert.deepStrictEqual(
  roadPairs.map((pair) => pair.left + " " + pair.right),
  ["THE ROAD"]
);
assert.deepStrictEqual(
  devotedPairs.map((pair) => pair.left + " " + pair.right),
  ["THE DEVOTED"]
);

assert.deepStrictEqual(gp("THE"), [2, 18]);
assert.deepStrictEqual(gp("ROAD"), [4, 3, 24, 23]);
assert.deepStrictEqual(gp("DEVOTED"), [23, 18, 1, 3, 16, 18, 23]);

const dualHits = hits.filter(
  (hit) =>
    hit.stateName === "a" &&
    hit.sign === "add" &&
    hit.selector === "tail:center"
);
assert.deepStrictEqual(
  dualHits.map((hit) => ({
    page: hit.page,
    phrase: hit.phrase,
    key: hit.key,
    ciphertext: hit.ciphertext,
  })),
  [
    {
      page: 0,
      phrase: "THE ROAD",
      key: [6, 23],
      ciphertext: [8, 12],
    },
    {
      page: 0,
      phrase: "THE DEVOTED",
      key: [6, 16],
      ciphertext: [8, 5],
    },
  ]
);

const grouped = new Map();
for (const hit of hits) {
  const config =
    hit.stateName + "|" + hit.sign + "|" + hit.selector;
  if (!grouped.has(config)) grouped.set(config, []);
  grouped.get(config).push(hit);
}

const configsHittingBothP0 = [...grouped.entries()]
  .filter(([, configHits]) => {
    const phrases = new Set(
      configHits.filter((hit) => hit.page === 0).map((hit) => hit.phrase)
    );
    return phrases.has("THE ROAD") && phrases.has("THE DEVOTED");
  })
  .map(([config]) => config);

assert.deepStrictEqual(configsHittingBothP0, ["a|add|tail:center"]);

console.log(
  JSON.stringify(
    {
      status:
        "PASS: a=6 plus post-break source-word center is the sole charged configuration reconstructing both p0 two-rune receivers",
      corpus: {
        signed2016Words: messageWords.length,
        signed2016Adjacencies: signedPairs.length,
        twoRunePredecessorLineCrossingEvents: events.length,
        shapeMatchedAssignments,
        selectorInstances,
        exactComparisons: selectorInstances * 7 * 2,
        exactHits: hits.length,
      },
      p0: dualHits,
      uniqueDualConfiguration: configsHittingBothP0[0],
      decision:
        "Preserve as intermediate source-conditioned value bridge; ROAD and DEVOTED remain source candidates and tail-center lacks an explicit first-party opcode.",
    },
    null,
    2
  )
);
