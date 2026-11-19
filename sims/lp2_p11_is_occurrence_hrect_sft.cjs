"use strict";

const assert = require("node:assert/strict");
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

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length;) {
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
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.ok(page >= 0 && page <= 55 && page !== 50);
  return parts[page <= 49 ? page : page - 1];
}

/**
 * Canonical printed words. Slash/whitespace preserve a line-wrapped word.
 * @param {number} page
 * @returns {{page:number,ordinal0:number,start:number,values:number[]}[]}
 */
function pageWords(page) {
  const source = physicalPart(page);
  const out = [];
  let current = [];
  let start = 0;
  let offset = 0;

  const flush = () => {
    if (!current.length) return;
    out.push({
      page,
      ordinal0: out.length,
      start,
      values: current.slice(),
    });
    current = [];
  };

  for (const ch of source) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === "." || ch === "&") {
      flush();
    } else if (ch === "/" || /\s/u.test(ch)) {
      // line wrapping preserves a printed word
    } else {
      flush();
    }
  }
  flush();
  return out;
}

/** @param {number} u @param {number} v @returns {[number,number]} */
function hInverse(u, v) {
  const inverse2 = 15;
  return [
    mod29((u + v) * inverse2),
    mod29((v - u) * inverse2),
  ];
}

const clear = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const signedWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);

// Authenticated IS occurs exactly twice, so its occurrence count is K=2.
const occurrences = new Map();
for (let index = 0; index < signedWords.length; index += 1) {
  const word = signedWords[index];
  if (!occurrences.has(word)) occurrences.set(word, []);
  occurrences.get(word).push(index);
}
assert.deepEqual(occurrences.get("IS"), [11, 21]);
const K = occurrences.get("IS").length;
assert.equal(K, 2);

// Existing source-number convention: word number selects physical page and
// the same zero-based local word. The first IS therefore selects p11 word11.
const receiver = pageWords(11)[11];
assert.deepEqual(receiver, {
  page: 11,
  ordinal0: 11,
  start: 49,
  values: [11, 14],
});
assert.equal(receiver.start, 7 ** 2);
assert.equal(signedWords[7], "THE");

// Target-independent raw selector: read the receiver's H coordinates in
// sum-before-difference order. They are the exact authenticated adjacent phrase
// THEIR NUMBERS by source indices 25,26.
const rawDirectionPacket = [
  mod29(receiver.values[0] + receiver.values[1]),
  mod29(receiver.values[0] - receiver.values[1]),
];
assert.deepEqual(rawDirectionPacket, [25, 26]);
assert.deepEqual(
  rawDirectionPacket.map((index) => signedWords[index]),
  ["THEIR", "NUMBERS"]
);

// Charge the exact raw packet over every complete two-rune manuscript word.
const rawDirectionHits = [];
let completeTwoRuneWordsForRaw = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const local of pageWords(page)) {
    if (local.values.length !== 2) continue;
    completeTwoRuneWordsForRaw += 1;
    const packet = [
      mod29(local.values[0] + local.values[1]),
      mod29(local.values[0] - local.values[1]),
    ];
    if (packet.every((value, slot) => value === rawDirectionPacket[slot])) {
      rawDirectionHits.push({
        page,
        ordinal0: local.ordinal0,
        start: local.start,
        cipher: local.values,
        packet,
      });
    }
  }
}
assert.equal(completeTwoRuneWordsForRaw, 465);
assert.deepEqual(rawDirectionHits, [{
  page: 11,
  ordinal0: 11,
  start: 49,
  cipher: [11, 14],
  packet: [25, 26],
}]);

// Reuse the already fixed two-rune H-rectangle grammar.
const key = hInverse(K, 0);
assert.deepEqual(key, [1, 28]);
const plaintext = receiver.values.map((value, index) => mod29(value - key[index]));
assert.deepEqual(plaintext, gp("IS"));
assert.equal(plaintext.map((value) => corpus.translit[value]).join(""), "IS");

// Complete repeated two-GP-rune source-word family. Each repeated word's
// occurrence count supplies the H-coordinate scalar, and every same-index
// occurrence with a complete two-rune receiver is charged under both signs.
const repeatedFamily = [];
for (const [word, indices] of occurrences.entries()) {
  const target = gp(word);
  if (indices.length < 2 || target.length !== 2) continue;
  const familyKey = hInverse(indices.length, 0);

  for (const index of indices) {
    const local = pageWords(index)[index];
    if (!local || local.values.length !== 2) {
      repeatedFamily.push({word, index, eligible: false});
      continue;
    }

    for (const sign of [-1, 1]) {
      const output = local.values.map((value, slot) =>
        mod29(value + sign * familyKey[slot])
      );
      repeatedFamily.push({
        word,
        index,
        count: indices.length,
        key: familyKey,
        eligible: true,
        start: local.start,
        cipher: local.values,
        sign,
        output,
        exactTarget: output.every((value, slot) => value === target[slot]),
      });
    }
  }
}

const repeatedHits = repeatedFamily.filter((row) => row.exactTarget);
assert.deepEqual(repeatedHits, [{
  word: "IS",
  index: 11,
  count: 2,
  key: [1, 28],
  eligible: true,
  start: 49,
  cipher: [11, 14],
  sign: -1,
  output: [10, 15],
  exactTarget: true,
}]);

// Plaintext-side H consequence. Among every distinct authenticated two-GP-rune
// word, IS alone maps to consecutive authenticated source indices.
const twoRuneSourceH = [];
for (const word of signedWords) {
  const values = gp(word);
  if (
    values.length !== 2 ||
    twoRuneSourceH.some((row) => row.word === word)
  ) continue;
  const packet = [
    mod29(values[0] - values[1]),
    mod29(values[0] + values[1]),
  ];
  twoRuneSourceH.push({
    word,
    values,
    packet,
    sourceWords: packet.map((index) => signedWords[index]),
    adjacent: packet[1] === packet[0] + 1,
  });
}
assert.deepEqual(twoRuneSourceH, [
  {word:"THE",values:[2,18],packet:[13,20],sourceWords:["WAY","MEANING"],adjacent:false},
  {word:"IS",values:[10,15],packet:[24,25],sourceWords:["AND","THEIR"],adjacent:true},
  {word:"BE",values:[17,18],packet:[28,6],sourceWords:["THE","SEEKS"],adjacent:false},
]);
assert.deepEqual(signedWords.slice(24, 30), [
  "AND", "THEIR", "NUMBERS", "ARE", "THE", "DIRECTION",
]);

// Broader exact-key control. This is deliberately weaker than the source
// family: freeze [1,28], charge both signs over every complete two-rune word,
// and compare against every authenticated two-GP-rune source target.
const twoRuneTargets = [];
for (const word of signedWords) {
  const values = gp(word);
  if (values.length === 2 && !twoRuneTargets.some((row) => row.word === word)) {
    twoRuneTargets.push({word, values});
  }
}
assert.deepEqual(twoRuneTargets.map((row) => row.word), ["THE", "IS", "BE"]);

let completeTwoRuneWords = 0;
const exactKeyHits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  for (const local of pageWords(page)) {
    if (local.values.length !== 2) continue;
    completeTwoRuneWords += 1;

    for (const sign of [-1, 1]) {
      const output = local.values.map((value, slot) =>
        mod29(value + sign * key[slot])
      );
      for (const target of twoRuneTargets) {
        if (output.every((value, slot) => value === target.values[slot])) {
          exactKeyHits.push({
            page,
            ordinal0: local.ordinal0,
            start: local.start,
            cipher: local.values,
            sign,
            target: target.word,
            output,
          });
        }
      }
    }
  }
}
assert.equal(completeTwoRuneWords, 465);
assert.deepEqual(exactKeyHits, [
  {page:11,ordinal0:11,start:49,cipher:[11,14],sign:-1,target:"IS",output:[10,15]},
  {page:13,ordinal0:35,start:145,cipher:[16,19],sign:1,target:"BE",output:[17,18]},
  {page:39,ordinal0:40,start:179,cipher:[9,16],sign:1,target:"IS",output:[10,15]},
  {page:48,ordinal0:26,start:97,cipher:[16,19],sign:1,target:"BE",output:[17,18]},
]);

console.log(JSON.stringify({
  status: "PASS",
  source: {
    isIndices: occurrences.get("IS"),
    occurrenceCount: K,
    selectedIndex: 11,
    selectedWord: "IS",
  },
  receiver,
  rawDirection: {
    packet: rawDirectionPacket,
    words: rawDirectionPacket.map((index) => signedWords[index]),
    completeTwoRuneWords: completeTwoRuneWordsForRaw,
    hits: rawDirectionHits,
  },
  hRectangle: {
    coordinate: [K, 0],
    key,
    plaintext,
    text: "IS",
  },
  repeatedTwoRuneFamily: {
    rows: repeatedFamily.length,
    hits: repeatedHits,
  },
  plaintextHDirection: {
    family: twoRuneSourceH,
    isContinuation: signedWords.slice(24, 30),
  },
  broaderExactKeyControl: {
    completeTwoRuneWords,
    authenticatedTargets: twoRuneTargets.map((row) => row.word),
    configurations: completeTwoRuneWords * 2 * twoRuneTargets.length,
    hits: exactKeyHits,
  },
  interpretation:
    "Strong local p11 plaintext candidate. Authenticated IS occurs exactly K=2 times; its first source index selects p11 word11 under the existing number-direction grammar. Before plaintext inversion, the untouched receiver has unique [sum,difference]=[25,26], exactly the authenticated adjacent phrase THEIR NUMBERS. The already fixed two-rune H-rectangle maps [K,0] to key [1,28], whose subtraction yields IS. Charging the complete repeated two-GP-rune source-word family leaves this as the sole exact target hit. The exact key alone has four lexical hits manuscript-wide, so the source and raw-packet selectors are essential.",
}, null, 2));
