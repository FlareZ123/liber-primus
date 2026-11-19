"use strict";

/**
 * SFT: source-native READ OUT HERE -> THE ROAD on p0.
 *
 * The receiver is selected before values are decrypted:
 * - p28 source recovers READ OUT and HERE;
 * - GP0(READ), GP0(OUT) address p50 endpoints 80 and 102;
 * - the next complete p0 word is 103..104 and the following line-crossing
 *   word is 105..108, giving signed-source length shape [2,4];
 * - among authenticated 2016 adjacencies, [2,4] uniquely selects THE ROAD.
 *
 * Keys are then derived only from p28 source geometry and the DH object.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const pathLib = require("node:path");

const root = pathLib.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(pathLib.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const tableValues = grid.pages.flatMap((page) => page.bytes);
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(value) {
  return ((value % 29) + 29) % 29;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      out.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      out.push(27);
      offset += 2;
      continue;
    }

    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token);
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function parsePage(source) {
  const words = [];
  let current = [];
  let start = 0;
  let runeOffset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: runeOffset - 1,
      length: current.length,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runeOffset;
      current.push(value);
      runeOffset += 1;
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return words;
}

function runeLines(page) {
  return parts[page]
    .split("/")
    .filter((line) => /[\u16A0-\u16FF]/u.test(line));
}

function fragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((fragment) =>
    [...fragment].map((rune) => runeIndex.get(rune))
  );
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\n\n/u)
    .slice(1)
    .join("\n");

  return clear
    .split(/[^A-Za-z0-9]+/u)
    .filter((token) => /^[A-Za-z]+$/u.test(token))
    .map((word, index) => ({ index, word: word.toUpperCase(), gp: gp(word) }));
}

function orderedTuples(pool, length, prefix = [], used = new Set()) {
  if (prefix.length === length) return [prefix];
  const out = [];
  for (let index = 0; index < pool.length; index += 1) {
    if (used.has(index)) continue;
    const nextUsed = new Set(used);
    nextUsed.add(index);
    out.push(
      ...orderedTuples(pool, length, [...prefix, pool[index]], nextUsed)
    );
  }
  return out;
}

// Reconstruct the literal p28 DH line and the source-native HERE carrier.
const p28Lines = runeLines(28);
assert.equal(p28Lines.length, 12);

const dhLineNumber = 6;
const dhFragments = fragments(p28Lines[dhLineNumber - 1]);
assert.equal(spell(dhFragments[0]), "DH");
assert.equal(dhFragments.length, 5);
assert.equal(dhFragments.flat().length, 23);

const dhFirst = H(dhFragments[0][0], dhFragments[0].at(-1));
const dhLast = H(dhFragments.at(-1)[0], dhFragments.at(-1).at(-1));
const dh = Object.freeze({
  p: 23,
  g: dhFragments.length,
  a: dhLineNumber,
  b: dhFirst[0],
  A: dhLast[0],
  B: dhLast[1],
  K: dhFirst[1],
});
assert.deepEqual(dh, { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });

const hereLineNumber = 1;
const hereFragments = fragments(p28Lines[hereLineNumber - 1]);
assert.equal(hereFragments.length, 5);
assert.deepEqual(
  [hereFragments[0].length, hereFragments[1].length],
  [dh.K, dh.g]
);
const here = [
  ...H(hereFragments[0][0], hereFragments[0].at(-1)),
  ...H(hereFragments[1][0], hereFragments[1].at(-1)),
];
assert.equal(spell(here), "HERE");
assert.deepEqual(here, gp("HERE"));

// The independently recovered READ OUT words address the packet endpoints.
assert.equal(tableValues[sum(gp("READ"))], 80);
assert.equal(tableValues[sum(gp("OUT"))], 102);

const p0 = parsePage(parts[0]);
const afterPacket = p0.find((word) => word.start === 103);
const roadReceiver = p0.find((word) => word.start === 105);
assert.deepEqual(afterPacket, {
  index: 21,
  start: 103,
  end: 104,
  length: 2,
  values: [8, 12],
});
assert.deepEqual(roadReceiver, {
  index: 22,
  start: 105,
  end: 108,
  length: 4,
  values: [16, 8, 25, 27],
});

// Confirm that the four-rune receiver crosses a physical p0 line break.
let runesSeen = 0;
const p0Breaks = [];
const p0Chunks = parts[0].split("/");
for (let index = 0; index < p0Chunks.length - 1; index += 1) {
  runesSeen += [...p0Chunks[index]]
    .filter((char) => runeIndex.has(char)).length;
  p0Breaks.push(runesSeen);
}
assert.ok(
  p0Breaks.some((offset) =>
    roadReceiver.start < offset && offset <= roadReceiver.end
  )
);

const message = signedWords();
assert.equal(message.length, 43);
const shapeMatches = [];
for (let index = 0; index < message.length - 1; index += 1) {
  if (
    message[index].gp.length === afterPacket.length &&
    message[index + 1].gp.length === roadReceiver.length
  ) {
    shapeMatches.push({
      index,
      phrase: message[index].word + " " + message[index + 1].word,
    });
  }
}
assert.deepEqual(shapeMatches, [{ index: 22, phrase: "THE ROAD" }]);

// THE: p28 visibly supplies [line number, line length] = [a,p] = [6,23].
// Charge every ordered pair of distinct DH fields and both signs at the fixed
// receiver. The natural source order with subtractive decryption is THE.
const twoRuneTargets = [...new Map(
  message
    .filter((row) => row.gp.length === 2)
    .map((row) => [row.word, row])
).values()];

const dhPairHits = [];
for (const [leftName, left] of Object.entries(dh)) {
  for (const [rightName, right] of Object.entries(dh)) {
    if (leftName === rightName) continue;
    for (const sign of ["subtract", "add"]) {
      const key = [left, right];
      const plain = afterPacket.values.map((value, index) =>
        sign === "subtract"
          ? mod29(value - key[index])
          : mod29(value + key[index])
      );
      const matches = twoRuneTargets
        .filter((target) =>
          target.gp.every((value, index) => value === plain[index])
        )
        .map((target) => target.word);
      if (matches.length) {
        dhPairHits.push({
          fields: [leftName, rightName],
          key,
          sign,
          plain,
          matches,
        });
      }
    }
  }
}

assert.deepEqual(dhPairHits, [
  {
    fields: ["p", "a"],
    key: [23, 6],
    sign: "add",
    plain: gp("THE"),
    matches: ["THE"],
  },
  {
    fields: ["a", "p"],
    key: [6, 23],
    sign: "subtract",
    plain: gp("THE"),
    matches: ["THE"],
  },
]);

const theKey = [dh.a, dh.p];
const thePlain = afterPacket.values.map((value, index) =>
  mod29(value - theKey[index])
);
assert.deepEqual(thePlain, gp("THE"));
assert.deepEqual(
  thePlain.map((value, index) => mod29(value + theKey[index])),
  afterPacket.values
);

// ROAD: after HERE has been source-selected, its carrier supplies four nested
// scalar descriptors in natural order:
// [page rune-line count, selected-line fragment count,
//  selected one-based line number, selected output length].
// This is exactly [12,5,1,4].
const roadKey = [
  p28Lines.length,
  hereFragments.length,
  hereLineNumber,
  here.length,
];
assert.deepEqual(roadKey, [12, 5, 1, 4]);

const roadPlain = roadReceiver.values.map((value, index) =>
  mod29(value - roadKey[index])
);
assert.deepEqual(roadPlain, gp("ROAD"));
assert.deepEqual(
  roadPlain.map((value, index) => mod29(value + roadKey[index])),
  roadReceiver.values
);

// Broader descriptor charge. Use eight obvious small scalars exposed by the
// source-native p28 READ OUT/HERE/DH objects. Test all ordered 4-tuples without
// replacement and both signs against every distinct authenticated four-rune
// source word. The natural HERE descriptor is the sole hit.
const sourceScalars = [
  { name: "page-number", value: 28 },
  { name: "page-rune-lines", value: p28Lines.length },
  { name: "here-line-one-based", value: hereLineNumber },
  { name: "here-line-runes", value: hereFragments.flat().length },
  { name: "here-line-fragments", value: hereFragments.length },
  { name: "here-fragments-consumed", value: 2 },
  { name: "here-output-length", value: here.length },
  { name: "dh-line-one-based", value: dhLineNumber },
];

const fourRuneTargets = [...new Map(
  message
    .filter((row) => row.gp.length === 4)
    .map((row) => [row.word, row])
).values()];

const descriptorTuples = orderedTuples(sourceScalars, 4);
assert.equal(descriptorTuples.length, 1680);
const descriptorHits = [];

for (const tuple of descriptorTuples) {
  const key = tuple.map((field) => field.value);
  for (const sign of ["subtract", "add"]) {
    const plain = roadReceiver.values.map((value, index) =>
      sign === "subtract"
        ? mod29(value - key[index])
        : mod29(value + key[index])
    );
    const matches = fourRuneTargets
      .filter((target) =>
        target.gp.every((value, index) => value === plain[index])
      )
      .map((target) => target.word);

    if (matches.length) {
      descriptorHits.push({
        fields: tuple.map((field) => field.name),
        key,
        sign,
        plain,
        matches,
      });
    }
  }
}

assert.deepEqual(descriptorHits, [{
  fields: [
    "page-rune-lines",
    "here-line-fragments",
    "here-line-one-based",
    "here-output-length",
  ],
  key: [12, 5, 1, 4],
  sign: "subtract",
  plain: gp("ROAD"),
  matches: ["ROAD"],
}]);

// Fixed-key manuscript transfer for ROAD.
const physicalParts = parts.slice(0, 55);
const targetByGp = new Map(
  fourRuneTargets.map((target) => [target.gp.join(","), target.word])
);
let manuscriptFourRuneWords = 0;
const manuscriptRoadKeyHits = [];

for (let segment = 0; segment < physicalParts.length; segment += 1) {
  const page = segment >= 50 ? segment + 1 : segment;
  for (const word of parsePage(physicalParts[segment])) {
    if (word.length !== 4) continue;
    manuscriptFourRuneWords += 1;

    const plain = word.values.map((value, index) =>
      mod29(value - roadKey[index])
    );
    const target = targetByGp.get(plain.join(","));
    if (target) {
      manuscriptRoadKeyHits.push({
        page,
        wordIndex: word.index,
        start: word.start,
        end: word.end,
        ciphertext: word.values,
        plaintext: plain,
        target,
      });
    }
  }
}

assert.equal(manuscriptFourRuneWords, 514);
assert.deepEqual(manuscriptRoadKeyHits, [{
  page: 0,
  wordIndex: 22,
  start: 105,
  end: 108,
  ciphertext: [16, 8, 25, 27],
  plaintext: gp("ROAD"),
  target: "ROAD",
}]);

// Prospective ROAD consumer. Only after ROAD has been recovered, consume
// the untouched raw GP0 of its original ciphertext. Base60 sends 76 to the
// exact start of p0 114..116; base59 lands inside the preceding word.
// The next authenticated source word after ROAD is AND, also three runes.
const roadRawGp0 = sum(roadReceiver.values);
assert.equal(roadRawGp0, 76);
assert.equal(grid.pages.flatMap((page) => page.tokens)[roadRawGp0], "1s");

const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const tableTokens = grid.pages.flatMap((page) => page.tokens);

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

const roadDirection60 = decodeToken(tableTokens[roadRawGp0], alphabet60);
const roadDirection59 = decodeToken(tableTokens[roadRawGp0], alphabet59);
assert.equal(roadDirection60, 114);
assert.equal(roadDirection59, 112);

const andReceiver = p0.find((word) => word.start === roadDirection60);
assert.deepEqual(andReceiver, {
  index: 25,
  start: 114,
  end: 116,
  length: 3,
  values: [5, 0, 9],
});

const roadSourceIndex = message.findIndex((row) => row.word === "ROAD");
assert.equal(roadSourceIndex, 23);
assert.equal(message[roadSourceIndex + 1].word, "AND");
assert.equal(message[roadSourceIndex + 1].gp.length, andReceiver.length);
assert.equal(p0.find((word) => word.start === roadDirection59), undefined);

// AND consumer family. The p28 lines already independently selected are the
// HERE carrier line and literal DH line. Charge either line in either of the
// first two slots, every DH-state value as a one-based index into that line,
// every DH-state value as the final scalar, and both signs. AND is fixed by
// the ROAD holdout before this family is evaluated.
const hereLineValues = hereFragments.flat();
const dhLineValues = dhFragments.flat();
const privilegedLines = { HERE: hereLineValues, DH: dhLineValues };
const threeRuneTargets = [...new Map(
  message
    .filter((row) => row.gp.length === 3)
    .map((row) => [row.word, row])
).values()];

const andFamilyHits = [];
for (const [firstLineName, firstLine] of Object.entries(privilegedLines)) {
  for (const [secondLineName, secondLine] of Object.entries(privilegedLines)) {
    for (const [firstField, firstIndex] of Object.entries(dh)) {
      for (const [secondField, secondIndex] of Object.entries(dh)) {
        for (const [thirdField, thirdValue] of Object.entries(dh)) {
          const key = [
            firstLine[firstIndex - 1],
            secondLine[secondIndex - 1],
            thirdValue,
          ];
          for (const sign of ["subtract", "add"]) {
            const plain = andReceiver.values.map((value, index) =>
              sign === "subtract"
                ? mod29(value - key[index])
                : mod29(value + key[index])
            );
            const matches = threeRuneTargets
              .filter((target) =>
                target.gp.every((value, index) => value === plain[index])
              )
              .map((target) => target.word);
            if (matches.length) {
              andFamilyHits.push({
                lines: [firstLineName, secondLineName],
                fields: [firstField, secondField, thirdField],
                key,
                sign,
                plain,
                matches,
              });
            }
          }
        }
      }
    }
  }
}

assert.equal(2 * 2 * 7 * 7 * 7 * 2, 2744);
assert.deepEqual(
  andFamilyHits.filter((hit) => hit.matches.includes("AND")),
  [{
    lines: ["HERE", "DH"],
    fields: ["a", "p", "b"],
    key: [10, 20, 15],
    sign: "subtract",
    plain: gp("AND"),
    matches: ["AND"],
  }]
);

const andKey = [hereLineValues[dh.a - 1], dhLineValues[dh.p - 1], dh.b];
assert.deepEqual(andKey, [10, 20, 15]);
const andPlain = andReceiver.values.map((value, index) =>
  mod29(value - andKey[index])
);
assert.deepEqual(andPlain, gp("AND"));
assert.deepEqual(
  andPlain.map((value, index) => mod29(value + andKey[index])),
  andReceiver.values
);

// Fixed-key manuscript transfer for AND.
const threeRuneTargetByGp = new Map(
  threeRuneTargets.map((target) => [target.gp.join(","), target.word])
);
let manuscriptThreeRuneWords = 0;
const manuscriptAndKeyHits = [];

for (let segment = 0; segment < physicalParts.length; segment += 1) {
  const page = segment >= 50 ? segment + 1 : segment;
  for (const word of parsePage(physicalParts[segment])) {
    if (word.length !== 3) continue;
    manuscriptThreeRuneWords += 1;

    const plain = word.values.map((value, index) =>
      mod29(value - andKey[index])
    );
    const target = threeRuneTargetByGp.get(plain.join(","));
    if (target) {
      manuscriptAndKeyHits.push({
        page,
        wordIndex: word.index,
        start: word.start,
        end: word.end,
        ciphertext: word.values,
        plaintext: plain,
        target,
      });
    }
  }
}

assert.equal(manuscriptThreeRuneWords, 726);
assert.deepEqual(manuscriptAndKeyHits, [{
  page: 0,
  wordIndex: 25,
  start: 114,
  end: 116,
  ciphertext: [5, 0, 9],
  plaintext: gp("AND"),
  target: "AND",
}]);

console.log(JSON.stringify({
  status: "PASS: source-native READ OUT HERE recovers p0 THE ROAD",
  p28: {
    dh,
    readOutPacketEndpoints: [80, 102],
    here: {
      line: hereLineNumber,
      pageRuneLines: p28Lines.length,
      fragments: hereFragments.length,
      output: here,
      text: spell(here),
    },
  },
  receiverSelection: {
    shapeMatches,
    theCiphertext: afterPacket,
    roadCiphertext: roadReceiver,
  },
  the: {
    key: theKey,
    plaintext: thePlain,
    text: spell(thePlain),
    chargedDhPairHits: dhPairHits,
  },
  road: {
    key: roadKey,
    plaintext: roadPlain,
    text: spell(roadPlain),
    descriptorFamilyConfigs: descriptorTuples.length * 2,
    descriptorHits,
    manuscriptFourRuneWords,
    manuscriptRoadKeyHits,
    prospectiveDirection: {
      rawGp0: roadRawGp0,
      base60: roadDirection60,
      base59: roadDirection59,
      nextAuthenticatedWord: message[roadSourceIndex + 1].word,
    },
  },
  and: {
    receiver: andReceiver,
    key: andKey,
    plaintext: andPlain,
    text: spell(andPlain),
    familyConfigs: 2744,
    allAuthenticatedHits: andFamilyHits,
    manuscriptThreeRuneWords,
    manuscriptAndKeyHits,
  },
  classification:
    "strong source-constrained local plaintext chain: READ OUT fixes the packet ending102; unique [2,4] geometry selects THE ROAD; p28 DH/HERE source objects decrypt THE and ROAD; ROAD's untouched raw number prospectively selects the AND receiver; the charged HERE/DH state-index family then uniquely decrypts the fixed target AND.",
}, null, 2));
