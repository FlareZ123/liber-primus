"use strict";

/**
 * SFT: p0 opening ciphertext -> p28 GOODBYE endpoint -> nested parable carrier.
 *
 * Frozen inputs:
 *   - canonical LP2 transcription and p50 table;
 *   - active base59 state after WE MUST SHED;
 *   - authenticated 2013 GOODBYE opcode;
 *   - solved p57 parable vocabulary.
 *
 * Run:
 *   node sims/lp2_p0_opening_goodbye28_p28_nested_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signedProtocol = read("resources/external/2013-tcp-server-signed-source.md");

assert.match(signedProtocol, /GOODBYE/);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const table = grid.pages.flatMap((page) => page.tokens);
const alphabet59 = grid.alphabet.replace("f", "");
const alphabet60 = grid.alphabet;
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {string} text */
function runeWords(text) {
  return (text.replace(/\/\s*/gu, "").match(/[\u16A0-\u16FF]+/gu) || [])
    .map((word) => [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    }));
}

/** @param {number} page */
function wordsOnPage(page) {
  assert.notEqual(page, 50);
  return runeWords(parts[page <= 49 ? page : page - 1]);
}

/** @param {number[]} word */
function gp0(word) {
  return word.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} word */
function gp1(word) {
  return word.reduce((sum, value) => sum + value + 1, 0);
}

/** @param {number[]} word */
function gpPrime(word) {
  return word.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/** @param {number[]} word */
function spell(word) {
  return word.map((value) => corpus.translit[value]).join("");
}

const p0 = wordsOnPage(0);
assert.deepEqual(p0.slice(0, 2).map(gp0), [96, 85]);
assert.equal(table[96], "3g");
assert.equal(table[85], "0S");
assert.equal(decode(table[96], alphabet59), 218);
assert.equal(decode(table[96], alphabet60), 222);
assert.equal(decode(table[85], alphabet59), 28);
assert.equal(decode(table[85], alphabet60), 28);

// The same source opcode has GP0 96 in the authenticated GP alphabet.
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} text */
function englishGp0(text) {
  const normalized = text
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  let offset = 0;
  let total = 0;
  while (offset < normalized.length) {
    const hit = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(hit);
    total += hit.value;
    offset += hit.symbol.length;
  }
  return total;
}
assert.equal(englishGp0("GOODBYE"), 96);

// Exhaust all adjacent LP2 word pairs for the exact typed opening relation.
const pairHits = [];
const exactSumHits = [];
let adjacentPairs = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = wordsOnPage(page);
  for (let index = 0; index + 1 < words.length; index += 1) {
    adjacentPairs += 1;
    const first = gp0(words[index]);
    const second = gp0(words[index + 1]);
    if (
      first === 96 &&
      decode(table[second], alphabet59) === 28 &&
      decode(table[second], alphabet60) === 28
    ) {
      pairHits.push({ page, word: index + 1, first, second });
    }
    if (first === 96 && second === 85) {
      exactSumHits.push({ page, word: index + 1 });
    }
  }
}
assert.equal(adjacentPairs, 2873);
assert.deepEqual(pairHits, [{ page: 0, word: 1, first: 96, second: 85 }]);
assert.deepEqual(exactSumHits, [{ page: 0, word: 1 }]);

// Base59's first output is the authenticated p28 GOODBYE cut.  It is a word boundary.
const p28 = wordsOnPage(28);
let cursor = 0;
const p28Rows = p28.map((word, index) => {
  const start = cursor;
  cursor += word.length;
  return { number: index + 1, start, end: cursor - 1, word };
});
assert.equal(cursor, 269);
const receiver = p28Rows.find((row) => row.start === 218);
assert.ok(receiver);
assert.equal(receiver.number, 47);
assert.equal(decode(table[96], alphabet60), 222);
assert.equal(
  p28Rows.some((row) => row.start === 222),
  false,
  "base60 output must miss the selected word boundary"
);

// Reconstruct the clear p57 target measures.
const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const clearRows = runeWords(p57.source_text).map((word) => ({
  text: spell(word),
  gp0: gp0(word),
  gp1: gp1(word),
  prime: gpPrime(word),
}));
const clear = (text) => {
  const row = clearRows.find((candidate) => candidate.text === text);
  assert.ok(row);
  return row;
};
const targets = {
  circumferenceGp1: clear("CIRCUMFERENCES").gp1,
  tunnelPrime: clear("TUNNELNG").prime,
  instarGp0: clear("INSTAR").gp0,
  emergeGp0: clear("EMERGE").gp0,
};
assert.deepEqual(targets, {
  circumferenceGp1: 145,
  tunnelPrime: 339,
  instarGp0: 78,
  emergeGp0: 83,
});

/** @param {number[]} word */
function layers(word) {
  const output = [];
  for (let current = word.slice(); current.length > 0; current = current.slice(1, -1)) {
    output.push({
      word: current,
      gp0: gp0(current),
      gp1: gp1(current),
      prime: gpPrime(current),
    });
    if (current.length <= 2) break;
  }
  return output;
}

const receiverLayers = layers(receiver.word);
assert.equal(receiver.word.length, 11);
assert.deepEqual(receiver.word, [28, 13, 11, 23, 9, 22, 3, 1, 9, 7, 19]);
assert.equal(receiverLayers[0].gp0, targets.circumferenceGp1);
assert.equal(receiverLayers[1].prime, targets.tunnelPrime);
assert.equal(receiverLayers[2].gp0, targets.instarGp0);
assert.equal(receiverLayers.at(-1).prime, targets.emergeGp0);

// Whole-book holdout over every odd word long enough for two literal peels.
let eligible = 0;
let wholeCirc = 0;
let plusTunnel = 0;
let plusInstar = 0;
const fullHits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = wordsOnPage(page);
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (word.length < 5 || word.length % 2 === 0) continue;
    eligible += 1;
    const ls = layers(word);
    if (ls[0].gp0 === targets.circumferenceGp1) {
      wholeCirc += 1;
      if (ls[1]?.prime === targets.tunnelPrime) {
        plusTunnel += 1;
        if (ls[2]?.gp0 === targets.instarGp0) {
          plusInstar += 1;
          if (ls.at(-1).prime === targets.emergeGp0) {
            fullHits.push({ page, word: index + 1 });
          }
        }
      }
    }
  }
}
assert.equal(eligible, 641);
assert.deepEqual(
  { wholeCirc, plusTunnel, plusInstar, fullHits },
  {
    wholeCirc: 6,
    plusTunnel: 1,
    plusInstar: 1,
    fullHits: [{ page: 28, word: 47 }],
  }
);



// Prospective closure after the carrier: its length is repeated by the successor,
// that singleton returns through the GOODBYE duplicate token, while the boundary
// itself is 3301 mod256 and p50[229]=00 -> p0.
const carrierLength = receiver.word.length;
const carrierNext = receiver.start + carrierLength;
assert.equal(carrierLength, 11);
assert.equal(carrierNext, 229);
assert.equal(3301 % 256, carrierNext);
assert.equal(table[carrierNext], "00");
assert.equal(decode(table[carrierNext], alphabet59), 0);
assert.equal(decode(table[carrierNext], alphabet60), 0);

const receiverIndex = p28Rows.findIndex((row) => row.number === receiver.number);
const successor = p28Rows[receiverIndex + 1];
assert.ok(successor);
assert.deepEqual(successor.word, [carrierLength]);
assert.equal(successor.start, carrierNext);
assert.equal(table[carrierLength], "3g");
assert.equal(table[96], "3g");
assert.deepEqual(
  table.map((token, index) => token === "3g" ? index : null)
    .filter((index) => index !== null),
  [11, 96]
);
assert.equal(decode(table[carrierLength], alphabet59), receiver.start);

let selfLengthSuccessors = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const words = wordsOnPage(page);
  for (let index = 0; index + 1 < words.length; index += 1) {
    if (words[index + 1].length === 1 && words[index + 1][0] === words[index].length) {
      selfLengthSuccessors += 1;
    }
  }
}
assert.equal(selfLengthSuccessors, 3);

console.log(JSON.stringify({
  status: "PASS: p0 opening uniquely back-links to the p28 GOODBYE endpoint and its nested parable carrier",
  p0Opening: {
    gp0: [96, 85],
    base59: [218, 28],
    base60: [222, 28],
    adjacentPairs,
    exactTypedHits: pairHits,
  },
  receiver: {
    page: 28,
    offset: receiver.start,
    word: receiver.number,
    values: receiver.word,
    transliteration: spell(receiver.word),
    nested: receiverLayers.map((layer, depth) => ({
      depth,
      gp0: layer.gp0,
      gp1: layer.gp1,
      prime: layer.prime,
      transliteration: spell(layer.word),
    })),
    semanticTargets: targets,
  },
  holdout: { eligible, wholeCirc, plusTunnel, plusInstar, fullHits },
  caveat:
    "The offset/page coordinate reading and mixed GP registers are route hypotheses; this SFT establishes the exact source relations and uniqueness only.",
}, null, 2));
