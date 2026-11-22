"use strict";

/**
 * P28 READ OUT low-digit p50 self-closure.
 *
 * Reconstructs the pre-existing 36 cube-orbit exponent family across every
 * eligible five-rune predecessor object, then tests a finite p50 component
 * family on every two-word English parse. No LP2 rune-offset interpretation
 * of p50 numerals is used.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);
const tape = grid.pages.flatMap((page) => page.tokens);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const gpTokens = corpus.translit
  .map((symbol, index) => ({ symbol: symbol.toUpperCase(), index }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/**
 * @param {number} base
 * @param {number} exponent
 * @returns {number}
 */
function pow29(base, exponent) {
  if (base === 0 && exponent > 0) return 0;
  let out = 1;
  let x = ((base % 29) + 29) % 29;
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * x) % 29;
    x = (x * x) % 29;
    e = Math.floor(e / 2);
  }
  return out;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.ok(page >= 0 && page <= 55 && page !== 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * @param {string} source
 * @returns {{runes:number[],words:Array<{start:number,values:number[]}>}}
 */
function parsePage(source) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    words.push({ start, values: current.slice() });
    current = [];
  };

  for (const char of [...source]) {
    if (runeSet.has(char)) {
      const value = runeIndex.get(char);
      runes.push(value);
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return { runes, words };
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("").toLowerCase();
}

/** @param {string} word @returns {number} */
function gp0(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  let total = 0;
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      total += 21;
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      total += 27;
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    total += token.index;
    offset += token.symbol.length;
  }
  return total;
}

const dictionaryWords = read("resources/control/english_wordfreq_textblob.txt")
  .toLowerCase()
  .split(/\s+/u)
  .filter(Boolean);
for (const relative of [
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
]) {
  dictionaryWords.push(
    ...(read(relative).toLowerCase().match(/[a-z]+/gu) || [])
  );
}
const lexicon = new Set(
  dictionaryWords.filter(
    (word) => /^[a-z]+$/u.test(word) && word.length >= 3
  )
);

/** @param {string} text @returns {string[][]} */
function parses(text) {
  const out = [];
  if (lexicon.has(text)) out.push([text]);
  for (let cut = 3; cut <= text.length - 3; cut += 1) {
    const left = text.slice(0, cut);
    const right = text.slice(cut);
    if (lexicon.has(left) && lexicon.has(right)) out.push([left, right]);
  }
  return out;
}

/**
 * @param {number} address
 * @param {string} alphabet
 * @param {"high"|"low"} side
 * @param {0|1} origin
 * @returns {number|null}
 */
function component(address, alphabet, side, origin) {
  if (!Number.isInteger(address) || address < 0 || address >= tape.length) {
    return null;
  }
  const char = tape[address][side === "high" ? 0 : 1];
  const index = alphabet.indexOf(char);
  return index < 0 ? null : index + origin;
}

// Reconstruct the already charged six-state GP29 cube orbit.
const cubeOrbit = [1, 3, 9, 27, 25, 19];
for (let index = 0; index < cubeOrbit.length; index += 1) {
  assert.equal(
    (cubeOrbit[index] * 3) % 28,
    cubeOrbit[(index + 1) % cubeOrbit.length]
  );
}

const twoWordPhraseHits = [];
let eligibleObjects = 0;

for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parsePage(physicalPart(page));

  for (let wordIndex = 0; wordIndex < parsed.words.length; wordIndex += 1) {
    const word = parsed.words[wordIndex];
    if (word.values.length !== 5 || word.start === 0) continue;
    eligibleObjects += 1;

    const input = [parsed.runes[word.start - 1], ...word.values];

    for (const centerExponent of cubeOrbit) {
      for (const wordExponent of cubeOrbit) {
        const output = [
          pow29(input[0], centerExponent),
          ...input.slice(1).map((value) => pow29(value, wordExponent)),
        ];
        const latin = spell(output);

        for (const parse of parses(latin)) {
          if (parse.length !== 2) continue;
          twoWordPhraseHits.push({
            page,
            word: wordIndex + 1,
            start: word.start,
            centerExponent,
            wordExponent,
            latin,
            parse,
          });
        }
      }
    }
  }
}

assert.equal(eligibleObjects, 314);
assert.equal(eligibleObjects * cubeOrbit.length * cubeOrbit.length, 11304);
assert.equal(twoWordPhraseHits.length, 21);

const modes = [];
for (const [radix, alphabet] of [
  [60, alpha60],
  [59, alpha59],
]) {
  for (const side of ["high", "low"]) {
    for (const origin of [0, 1]) {
      for (const direction of ["forward", "reverse"]) {
        const hits = [];

        for (const phrase of twoWordPhraseHits) {
          const pair =
            direction === "forward"
              ? phrase.parse
              : [phrase.parse[1], phrase.parse[0]];
          const firstGp0 = gp0(pair[0]);
          const secondGp0 = gp0(pair[1]);
          const firstOutput = component(
            firstGp0,
            alphabet,
            side,
            /** @type {0|1} */ (origin)
          );
          const secondOutput = component(
            secondGp0,
            alphabet,
            side,
            /** @type {0|1} */ (origin)
          );
          const thirdOutput =
            secondOutput === null
              ? null
              : component(
                  secondOutput,
                  alphabet,
                  side,
                  /** @type {0|1} */ (origin)
                );

          if (
            firstOutput === secondGp0 &&
            thirdOutput === phrase.page
          ) {
            hits.push({
              ...phrase,
              direction,
              pair,
              walk: [firstGp0, firstOutput, secondOutput, thirdOutput],
            });
          }
        }

        modes.push({ radix, side, origin, direction, hits });
      }
    }
  }
}

assert.equal(modes.length, 16);

const forwardHits = modes.flatMap((mode) =>
  mode.direction === "forward"
    ? mode.hits.map((hit) => ({ mode, hit }))
    : []
);
assert.equal(forwardHits.length, 1);

const winner = forwardHits[0];
assert.equal(winner.mode.radix, 60);
assert.equal(winner.mode.side, "low");
assert.equal(winner.mode.origin, 0);
assert.deepEqual(winner.hit.parse, ["read", "out"]);
assert.equal(winner.hit.page, 28);
assert.equal(winner.hit.centerExponent, 3);
assert.equal(winner.hit.wordExponent, 27);
assert.deepEqual(winner.hit.walk, [55, 20, 42, 28]);

// Exact raw table path.
assert.equal(gp0("READ"), 55);
assert.equal(tape[55], "1K");
assert.equal(component(55, alpha60, "low", 0), 20);
assert.equal(gp0("OUT"), 20);
assert.equal(tape[20], "1g");
assert.equal(component(20, alpha60, "low", 0), 42);
assert.equal(tape[42], "0S");
assert.equal(component(42, alpha60, "low", 0), 28);

// The intermediate state is independently named by solved p57 FIND.
const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Runes = [...p57.source_text]
  .map((char) => runeIndex.get(char))
  .filter((value) => value !== undefined);
assert.ok(p57Runes.length > 0);
assert.equal(gp0("FIND"), 42);

// Report the only reverse artifacts so the source-order claim is explicit.
const reverseHits = modes.flatMap((mode) =>
  mode.direction === "reverse"
    ? mode.hits.map((hit) => ({
        radix: mode.radix,
        side: mode.side,
        origin: mode.origin,
        parse: hit.parse,
        page: hit.page,
        walk: hit.walk,
      }))
    : []
);
assert.deepEqual(reverseHits, [
  {
    radix: 60,
    side: "low",
    origin: 0,
    parse: ["ord", "owe"],
    page: 17,
    walk: [28, 30, 21, 17],
  },
  {
    radix: 59,
    side: "low",
    origin: 0,
    parse: ["ord", "owe"],
    page: 17,
    walk: [28, 30, 21, 17],
  },
]);

console.log(JSON.stringify({
  status: "PASS",
  chargedPhraseFamily: {
    eligibleObjects,
    exponentPairs: cubeOrbit.length * cubeOrbit.length,
    configurations: eligibleObjects * cubeOrbit.length * cubeOrbit.length,
    twoWordPhraseParses: twoWordPhraseHits.length,
  },
  chargedPointerFamily: {
    modes: modes.length,
    forwardSelfClosures: forwardHits.map(({ mode, hit }) => ({
      radix: mode.radix,
      side: mode.side,
      origin: mode.origin,
      direction: mode.direction,
      page: hit.page,
      word: hit.word,
      exponents: [hit.centerExponent, hit.wordExponent],
      phrase: hit.parse,
      walk: hit.walk,
    })),
    reverseSelfClosures: reverseHits,
  },
  readOut: {
    path: [
      { state: "READ", gp0: 55, token: tape[55], low60: 20 },
      { state: "OUT", gp0: 20, token: tape[20], low60: 42 },
      { state: "FIND", gp0: 42, token: tape[42], low60: 28 },
      { state: "p28", page: 28 },
    ],
  },
  classification:
    "source-order internal self-closure of the preferred p28 READ OUT candidate; strong post-discovery corroboration that avoids p50-numeral-to-LP-rune-offset semantics, but the low-digit pointer interpretation was recognized after READ OUT and is not a blind plaintext recovery",
}, null, 2));
