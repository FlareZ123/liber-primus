"use strict";

/**
 * SFT for Director #1742: cross-page transfer of the committed p28
 * direct/HERE/DH state-index lookup grammars on p0, p2 and p38.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const parts = transcription.split(/^\s*%\s*$/m);

function mod29(value) {
  return ((value % 29) + 29) % 29;
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

function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
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

function runeLines(source) {
  return source.split("/").filter((line) => /[\u16A0-\u16FF]/u.test(line));
}

function lineValues(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || [])
    .flatMap((fragment) => [...fragment].map((rune) => runeIndex.get(rune)));
}

function apply(values, key, sign) {
  assert.equal(values.length, key.length);
  return values.map((value, index) => mod29(value + sign * key[index]));
}

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
});
const fields = Object.keys(state);
const p28Lines = runeLines(parts[28]);
const hereLine = lineValues(p28Lines[0]);
const dhLine = lineValues(p28Lines[5]);

assert.equal(hereLine.length, 23);
assert.equal(dhLine.length, 23);

function sourceValue(field, kind) {
  const value = state[field];
  if (kind === "direct") return value;
  if (kind === "HERE") return hereLine[value - 1];
  if (kind === "DH") return dhLine[value - 1];
  throw new Error("unknown source kind: " + kind);
}

const descriptors = {
  AND: {
    length: 3,
    fields: ["g", "p", "b"],
    kinds: ["direct", "HERE", "direct"],
    sign: -1,
    target: "AND",
  },
  THEIR: {
    length: 4,
    fields: ["g", "p", "a", "K"],
    kinds: ["HERE", "direct", "HERE", "HERE"],
    sign: -1,
    target: "THEIR",
  },
  GOOD: {
    length: 4,
    fields: ["g", "B", "K", "b"],
    kinds: ["DH", "DH", "HERE", "DH"],
    sign: -1,
    target: "GOOD",
  },
  FOUND: {
    length: 5,
    fields: ["a", "b", "A", "a", "p"],
    kinds: ["HERE", "HERE", "DH", "DH", "DH"],
    sign: 1,
    target: "FOUND",
  },
};

for (const descriptor of Object.values(descriptors)) {
  descriptor.key = descriptor.fields.map((field, index) =>
    sourceValue(field, descriptor.kinds[index])
  );
}

assert.deepEqual(descriptors.AND.key, [5, 26, 15]);
assert.deepEqual(descriptors.THEIR.key, [17, 23, 10, 5]);
assert.deepEqual(descriptors.GOOD.key, [24, 28, 5, 3]);
assert.deepEqual(descriptors.FOUND.key, [10, 7, 8, 12, 20]);

const p0 = parsePage(parts[0]);
const p2 = parsePage(parts[2]);
const p38 = parsePage(parts[38]);

function byStart(words, start) {
  const word = words.find((candidate) => candidate.start === start);
  assert.ok(word, "missing word start " + start);
  return word;
}

const receivers = {
  AND: byStart(p0, 189),
  THEIR: byStart(p0, 192),
  GOOD: byStart(p2, 36),
  FOUND38: byStart(p38, 49),
  FOUND0: byStart(p0, 117),
};

assert.deepEqual(receivers.AND.values, [0, 6, 9]);
assert.deepEqual(receivers.THEIR.values, [19, 12, 20, 9]);
assert.deepEqual(receivers.GOOD.values, [1, 2, 8, 26]);
assert.deepEqual(receivers.FOUND38.values, [19, 25, 22, 26, 3]);
assert.deepEqual(receivers.FOUND0.values, [12, 2, 11, 10, 2]);

assert.deepEqual(
  apply(receivers.AND.values, descriptors.AND.key, descriptors.AND.sign),
  gp("AND")
);
assert.deepEqual(
  apply(receivers.THEIR.values, descriptors.THEIR.key, descriptors.THEIR.sign),
  gp("THEIR")
);
assert.deepEqual(
  apply(receivers.GOOD.values, descriptors.GOOD.key, descriptors.GOOD.sign),
  gp("GOOD")
);
assert.deepEqual(
  apply(receivers.FOUND38.values, descriptors.FOUND.key, descriptors.FOUND.sign),
  gp("FOUND")
);

// Equal-length fixed-descriptor cross transfers.
const theirOnGood = apply(
  receivers.GOOD.values,
  descriptors.THEIR.key,
  descriptors.THEIR.sign
);
const goodOnTheir = apply(
  receivers.THEIR.values,
  descriptors.GOOD.key,
  descriptors.GOOD.sign
);
assert.equal(spell(theirOnGood), "PHIANG");
assert.equal(spell(goodOnTheir), "APSG");
assert.notDeepEqual(theirOnGood, gp("GOOD"));
assert.notDeepEqual(goodOnTheir, gp("THEIR"));

// Chronology-blind p0 FOUND receiver selected by the prior WILL->BE->FOUND route.
const p38FoundOnP0Found = apply(
  receivers.FOUND0.values,
  descriptors.FOUND.key,
  descriptors.FOUND.sign
);
assert.equal(spell(p38FoundOnP0Found), "OENMOEOE");
assert.notDeepEqual(p38FoundOnP0Found, gp("FOUND"));

// The union of all per-slot source atoms actually admitted across the fresh
// candidates: direct/HERE/DH at the seven fixed one-based state indices.
const unionValues = [...new Set(
  fields.flatMap((field) =>
    ["direct", "HERE", "DH"].map((kind) => sourceValue(field, kind))
  )
)].sort((left, right) => left - right);

assert.deepEqual(
  unionValues,
  [2, 3, 5, 6, 7, 8, 10, 12, 15, 17, 19, 20, 22, 23, 24, 26, 28]
);

const found = gp("FOUND");
const requiredAdd = found.map((value, index) =>
  mod29(value - receivers.FOUND0.values[index])
);
const requiredSubtract = receivers.FOUND0.values.map((value, index) =>
  mod29(value - found[index])
);

assert.deepEqual(requiredAdd, [17, 1, 19, 28, 21]);
assert.deepEqual(requiredSubtract, [12, 28, 10, 1, 8]);
assert.equal(requiredAdd.every((value) => unionValues.includes(value)), false);
assert.equal(
  requiredSubtract.every((value) => unionValues.includes(value)),
  false
);

// Whole-manuscript fixed-key specificity control.
const clear = signed2016.match(
  /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
);
assert.ok(clear);
const distinctSignedWords = [...new Set(
  (clear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase())
)];

const targetsByLength = new Map();
for (const word of distinctSignedWords) {
  const values = gp(word);
  if (!targetsByLength.has(values.length)) {
    targetsByLength.set(values.length, new Map());
  }
  targetsByLength.get(values.length).set(values.join(","), word);
}

const physicalWords = [];
for (let segment = 0; segment < 55; segment += 1) {
  const page = segment >= 50 ? segment + 1 : segment;
  for (const word of parsePage(parts[segment])) {
    physicalWords.push({ page, ...word });
  }
}

function manuscriptHits(descriptor) {
  const targets = targetsByLength.get(descriptor.length) || new Map();
  const hits = [];
  let tested = 0;

  for (const word of physicalWords) {
    if (word.length !== descriptor.length) continue;
    tested += 1;
    const plaintext = apply(word.values, descriptor.key, descriptor.sign);
    const target = targets.get(plaintext.join(","));
    if (target) {
      hits.push({
        page: word.page,
        word: word.index,
        start: word.start,
        target,
      });
    }
  }

  return { tested, hits };
}

const fixedTransfer = {
  AND: manuscriptHits(descriptors.AND),
  THEIR: manuscriptHits(descriptors.THEIR),
  GOOD: manuscriptHits(descriptors.GOOD),
  FOUND: manuscriptHits(descriptors.FOUND),
};

assert.deepEqual(fixedTransfer.AND, {
  tested: 726,
  hits: [{ page: 0, word: 42, start: 189, target: "AND" }],
});
assert.deepEqual(fixedTransfer.THEIR, {
  tested: 514,
  hits: [{ page: 0, word: 43, start: 192, target: "THEIR" }],
});
assert.deepEqual(fixedTransfer.GOOD, {
  tested: 514,
  hits: [{ page: 2, word: 9, start: 36, target: "GOOD" }],
});
assert.deepEqual(fixedTransfer.FOUND, {
  tested: 318,
  hits: [{ page: 38, word: 9, start: 49, target: "FOUND" }],
});

console.log(JSON.stringify({
  status: "PASS",
  descriptors: Object.fromEntries(
    Object.entries(descriptors).map(([name, descriptor]) => [name, {
      fields: descriptor.fields,
      kinds: descriptor.kinds,
      sign: descriptor.sign,
      key: descriptor.key,
    }])
  ),
  crossTransfers: {
    THEIR_descriptor_on_p2_GOOD: {
      output: theirOnGood,
      translit: spell(theirOnGood),
      exact: false,
    },
    GOOD_descriptor_on_p0_THEIR: {
      output: goodOnTheir,
      translit: spell(goodOnTheir),
      exact: false,
    },
    p38_FOUND_descriptor_on_p0_FOUND: {
      output: p38FoundOnP0Found,
      translit: spell(p38FoundOnP0Found),
      exact: false,
    },
  },
  p0FoundUnionFamily: {
    sourceValues: unionValues,
    requiredAdd,
    requiredSubtract,
    possibleAdd: false,
    possibleSubtract: false,
  },
  fixedTransfer,
  decision:
    "HERE/DH state-index lookup fails cross-page transfer; p0 FOUND is impossible under the complete direct/HERE/DH per-slot union vocabulary.",
}, null, 2));
