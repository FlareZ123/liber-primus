"use strict";

/**
 * SFT for Director #1740: common DH/HERE key assembly on ROAD dual-radix receivers.
 *
 * This script implements the exact precommit in:
 * workplace/agent38-road-dualradix-common-key-precommit.md
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const tableTokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(value) {
  return ((value % 29) + 29) % 29;
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

  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }

    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function base29Mod(values, modulus) {
  let value = 0;
  for (const digit of values) value = (value * 29 + digit) % modulus;
  return value;
}

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
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

function signedWords() {
  const clear = signed2016.match(
    /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
  );
  assert.ok(clear);
  return (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word, index) => ({
    index,
    word: word.toUpperCase(),
    gp: gp(word),
  }));
}

function runeLines(source) {
  return source.split("/").filter((line) => /[\u16A0-\u16FF]/u.test(line));
}

function lineValues(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || [])
    .flatMap((fragment) => [...fragment].map((rune) => runeIndex.get(rune)));
}

const state = Object.freeze({ p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });
const hereLine = lineValues(runeLines(parts[28])[0]);
assert.equal(hereLine.length, 23);
assert.equal(hereLine[state.p - 1], 26);
assert.equal(hereLine[state.g - 1], 17);
assert.equal(hereLine[state.a - 1], 10);
assert.equal(hereLine[state.K - 1], 5);

function commonKey(radix, receiverLength) {
  assert.ok(radix === 59 || radix === 60);
  assert.ok(receiverLength >= 1 && receiverLength <= 4);

  const isEven = radix % 2 === 0;
  const privateField = isEven ? "a" : "b";
  const fields = ["g", "p", privateField, "K"].slice(0, receiverLength);
  const key = fields.map((field) => {
    const direct = state[field];
    const useHere = isEven !== (field === "p");
    return useHere ? hereLine[direct - 1] : direct;
  });
  return { fields, key };
}

assert.deepEqual(commonKey(59, 3), {
  fields: ["g", "p", "b"],
  key: [5, 26, 15],
});
assert.deepEqual(commonKey(60, 4), {
  fields: ["g", "p", "a", "K"],
  key: [17, 23, 10, 5],
});

function subtract(ciphertext, key) {
  assert.equal(ciphertext.length, key.length);
  return ciphertext.map((value, index) => mod29(value - key[index]));
}

const message = signedWords();
const p0 = parsePage(parts[0]);
const byStart = new Map(p0.map((word) => [word.start, word]));
const structuralHits = [];

for (let index = 0; index < message.length - 2; index += 1) {
  const source = message[index];
  const number = base29Mod(source.gp, 256);

  for (const addressOrigin of [0, 1]) {
    const address = number - addressOrigin;
    if (address < 0 || address >= 256) continue;

    const token = tableTokens[address];
    const value59 = decodeToken(token, alphabet59);
    const value60 = decodeToken(token, alphabet60);
    if (value59 === null || value60 === null) continue;

    for (const receiverOrigin of [0, 1]) {
      const start59 = value59 - receiverOrigin;
      const start60 = value60 - receiverOrigin;
      const word59 = byStart.get(start59);
      const word60 = byStart.get(start60);
      if (!word59 || !word60 || word59.index + 1 !== word60.index) continue;

      structuralHits.push({
        sourceIndex: index,
        source: source.word,
        addressOrigin,
        receiverOrigin,
        address,
        token,
        branch59: {
          radix: 59,
          receiver: word59,
          target: message[index + 1],
        },
        branch60: {
          radix: 60,
          receiver: word60,
          target: message[index + 2],
        },
      });
    }
  }
}

assert.equal(structuralHits.length, 14);
const road = structuralHits.find((hit) =>
  hit.sourceIndex === 23 &&
  hit.addressOrigin === 1 &&
  hit.receiverOrigin === 0
);
assert.ok(road);
assert.equal(road.token, "3C");
assert.equal(road.branch59.receiver.start, 189);
assert.equal(road.branch60.receiver.start, 192);

function evaluateBranch(branch) {
  if (branch.receiver.length > 4) {
    return {
      radix: branch.radix,
      start: branch.receiver.start,
      length: branch.receiver.length,
      target: branch.target.word,
      eligible: false,
    };
  }

  const assembly = commonKey(branch.radix, branch.receiver.length);
  const plaintext = subtract(branch.receiver.values, assembly.key);
  return {
    radix: branch.radix,
    start: branch.receiver.start,
    length: branch.receiver.length,
    target: branch.target.word,
    eligible: true,
    fields: assembly.fields,
    key: assembly.key,
    ciphertext: branch.receiver.values,
    plaintext,
    translit: spell(plaintext),
    exactTarget: plaintext.join(",") === branch.target.gp.join(","),
  };
}

const evaluations = structuralHits.map((hit) => ({
  sourceIndex: hit.sourceIndex,
  source: hit.source,
  addressOrigin: hit.addressOrigin,
  receiverOrigin: hit.receiverOrigin,
  token: hit.token,
  branch59: evaluateBranch(hit.branch59),
  branch60: evaluateBranch(hit.branch60),
}));

const roadEval = evaluations.find((row) =>
  row.sourceIndex === 23 &&
  row.addressOrigin === 1 &&
  row.receiverOrigin === 0
);
assert.ok(roadEval);
assert.equal(roadEval.branch59.exactTarget, true);
assert.equal(roadEval.branch59.target, "AND");
assert.equal(roadEval.branch60.exactTarget, true);
assert.equal(roadEval.branch60.target, "THEIR");

const holdout = evaluations.find((row) =>
  row.sourceIndex === 1 &&
  row.addressOrigin === 1 &&
  row.receiverOrigin === 1
);
assert.ok(holdout);
assert.equal(holdout.source, "THE");
assert.equal(holdout.branch59.start, 173);
assert.equal(holdout.branch59.length, 3);
assert.equal(holdout.branch59.target, "PATH");

const exactBranchHits = [];
for (const row of evaluations) {
  for (const name of ["branch59", "branch60"]) {
    if (row[name].eligible && row[name].exactTarget) {
      exactBranchHits.push({
        sourceIndex: row.sourceIndex,
        source: row.source,
        branch: name,
        target: row[name].target,
        start: row[name].start,
        key: row[name].key,
        plaintext: row[name].plaintext,
      });
    }
  }
}

console.log(JSON.stringify({
  status: "PASS",
  rule: {
    radix59: commonKey(59, 3),
    radix60: commonKey(60, 4),
  },
  structuralHitCount: structuralHits.length,
  road: roadEval,
  frozenHoldout: holdout.branch59,
  exactBranchHits,
  decision:
    holdout.branch59.exactTarget
      ? "HOLDOUT_HIT"
      : "HOLDOUT_MISS",
}, null, 2));
