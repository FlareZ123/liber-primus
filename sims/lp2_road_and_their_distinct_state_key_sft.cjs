"use strict";

/**
 * SFT: ROAD/DH distinct-field family compresses AND THEIR inverse keys.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function parsePage(pageText) {
  const words = [];
  let current = [];

  function flush() {
    if (!current.length) return;
    words.push(current.slice());
    current = [];
  }

  for (const char of [...pageText]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      current.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return words;
}

function physicalLines(pageText) {
  return pageText
    .trim()
    .split("/")
    .map((raw) => [...raw]
      .map((rune) => runeIndex.get(rune))
      .filter((value) => value !== undefined))
    .filter((line) => line.length > 0);
}

const translitTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

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

    const token = translitTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, `unmapped GP spelling: ${word}`);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function permutations(values, length) {
  const output = [];

  function visit(prefix) {
    if (prefix.length === length) {
      output.push(prefix.slice());
      return;
    }

    for (const value of values) {
      if (prefix.includes(value)) continue;
      prefix.push(value);
      visit(prefix);
      prefix.pop();
    }
  }

  visit([]);
  return output;
}

function tuples(values, length) {
  const output = [];

  function visit(prefix) {
    if (prefix.length === length) {
      output.push(prefix.slice());
      return;
    }

    for (const value of values) {
      prefix.push(value);
      visit(prefix);
      prefix.pop();
    }
  }

  visit([]);
  return output;
}

const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 };
const labels = Object.keys(state);
const kinds = ["direct", "HERE", "DH"];

const p28Lines = physicalLines(parts[28]);
const hereLine = p28Lines[0];
const dhLine = p28Lines[5];

assert.equal(hereLine.length, state.p);
assert.equal(dhLine.length, state.p);
assert.deepEqual([dhLine[0], dhLine[1]], [state.p, state.A]);

function sourceValue(label, kind) {
  const position = state[label];
  if (kind === "direct") return position;
  if (kind === "HERE") return hereLine[position - 1];
  if (kind === "DH") return dhLine[position - 1];
  throw new Error(`unknown source kind: ${kind}`);
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\r?\n\r?\n/)
  .slice(1)
  .join("\n");

const vocabularyByLength = new Map();
for (const word of [...new Set(
  clear.split(/[^A-Za-z]+/).filter(Boolean).map((value) => value.toUpperCase())
)]) {
  const values = gp(word);
  if (!vocabularyByLength.has(values.length)) {
    vocabularyByLength.set(values.length, []);
  }
  vocabularyByLength.get(values.length).push({ word, values });
}

function auditReceiver(ciphertext) {
  const length = ciphertext.length;
  const fieldSequences = permutations(labels, length);
  const lookupSequences = tuples(kinds, length);
  const vocabulary = vocabularyByLength.get(length) || [];
  const rawHits = [];
  const numericHits = new Map();

  for (const fields of fieldSequences) {
    for (const lookups of lookupSequences) {
      const key = fields.map((field, index) =>
        sourceValue(field, lookups[index])
      );

      for (const sign of ["subtract", "add"]) {
        const plaintext = ciphertext.map((value, index) =>
          sign === "subtract"
            ? mod(value - key[index], 29)
            : mod(value + key[index], 29)
        );

        for (const target of vocabulary) {
          if (!target.values.every((value, index) => value === plaintext[index])) {
            continue;
          }

          const hit = {
            fields: fields.slice(),
            lookups: lookups.slice(),
            key: key.slice(),
            sign,
            target: target.word,
            plaintext: plaintext.slice(),
          };
          rawHits.push(hit);

          const numericId = `${key.join(",")}|${sign}`;
          if (!numericHits.has(numericId)) numericHits.set(numericId, hit);
        }
      }
    }
  }

  return {
    labelConfigurations:
      fieldSequences.length * lookupSequences.length * 2,
    rawHits,
    distinctNumericHits: [...numericHits.values()],
  };
}

const p0Runes = [...parts[0]]
  .map((rune) => runeIndex.get(rune))
  .filter((value) => value !== undefined);
const andCiphertext = p0Runes.slice(189, 192);
const theirCiphertext = p0Runes.slice(192, 196);
assert.deepEqual(andCiphertext, [0, 6, 9]);
assert.deepEqual(theirCiphertext, [19, 12, 20, 9]);

const andAudit = auditReceiver(andCiphertext);
assert.equal(andAudit.labelConfigurations, 11340);
assert.equal(andAudit.rawHits.length, 3);
assert.deepEqual(
  andAudit.distinctNumericHits.map((hit) => ({
    fields: hit.fields,
    lookups: hit.lookups,
    key: hit.key,
    sign: hit.sign,
    target: hit.target,
    plaintext: hit.plaintext,
  })),
  [
    {
      fields: ["g", "p", "b"],
      lookups: ["direct", "HERE", "direct"],
      key: [5, 26, 15],
      sign: "subtract",
      target: "AND",
      plaintext: [24, 9, 23],
    },
    {
      fields: ["g", "K", "p"],
      lookups: ["direct", "direct", "DH"],
      key: [5, 2, 20],
      sign: "subtract",
      target: "ARE",
      plaintext: [24, 4, 18],
    },
  ]
);
assert.deepEqual(
  andAudit.distinctNumericHits.filter((hit) => hit.target === "AND"),
  [andAudit.distinctNumericHits[0]]
);

const theirAudit = auditReceiver(theirCiphertext);
assert.equal(theirAudit.labelConfigurations, 136080);
assert.equal(theirAudit.rawHits.length, 2);
assert.deepEqual(
  theirAudit.distinctNumericHits.map((hit) => ({
    fields: hit.fields,
    lookups: hit.lookups,
    key: hit.key,
    sign: hit.sign,
    target: hit.target,
    plaintext: hit.plaintext,
  })),
  [{
    fields: ["g", "p", "a", "K"],
    lookups: ["HERE", "direct", "HERE", "HERE"],
    key: [17, 23, 10, 5],
    sign: "subtract",
    target: "THEIR",
    plaintext: [2, 18, 10, 4],
  }]
);

const andKey = andAudit.distinctNumericHits[0].key;
const theirKey = theirAudit.distinctNumericHits[0].key;

assert.deepEqual(
  gp("AND").map((value, index) => mod(value + andKey[index], 29)),
  andCiphertext
);
assert.deepEqual(
  gp("THEIR").map((value, index) => mod(value + theirKey[index], 29)),
  theirCiphertext
);

console.log(JSON.stringify({
  status: "PASS: distinct DH-field family compresses AND THEIR keys",
  AND: {
    receiver: andCiphertext,
    configurations: andAudit.labelConfigurations,
    rawAuthenticatedHits: andAudit.rawHits.length,
    distinctNumericHits: andAudit.distinctNumericHits,
    precommittedTargetKeys:
      andAudit.distinctNumericHits.filter((hit) => hit.target === "AND"),
  },
  THEIR: {
    receiver: theirCiphertext,
    configurations: theirAudit.labelConfigurations,
    rawAuthenticatedHits: theirAudit.rawHits.length,
    distinctNumericHits: theirAudit.distinctNumericHits,
  },
  classification:
    "post-receiver key-family compression on prospectively sealed AND THEIR receivers; lookup masks still require a source-selected pre-target rule for full promotion.",
}, null, 2));
