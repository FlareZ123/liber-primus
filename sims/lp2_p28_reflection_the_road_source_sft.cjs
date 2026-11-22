"use strict";

/**
 * Consolidated source-constrained p28 -> p0 THE ROAD route.
 *
 * The p0 receiver is selected without interpreting p50 token values:
 * canonical whole-word GP0 addresses are reflected within the source-visible
 * 8-column p50 grid. The selected ciphertext words are then decrypted by
 * scalar descriptors visible on the already selected p28 DH/HERE source.
 *
 * Node.js 22, CommonJS, no third-party dependencies.
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
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return values.reduce((total, value) => total + value, 0);
}

/** @param {number} address @returns {number} */
function reflect8(address) {
  return Math.floor(address / 8) * 8 + (7 - (address % 8));
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} left @param {number} right @returns {number[]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number[]} values @returns {string} */
function spell(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

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
    assert.ok(token, `unmapped GP spelling ${word} at ${offset}`);
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

/** @param {string} line @returns {number[][]} */
function fragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((fragment) =>
    [...fragment].map((rune) => runeIndex.get(rune))
  );
}

/** @returns {{word:string,gp:number[]}[]} */
function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\n\n/u)
    .slice(1)
    .join("\n");
  return clear
    .split(/[^A-Za-z0-9]+/u)
    .filter((token) => /^[A-Za-z]+$/u.test(token))
    .map((word) => ({ word: word.toUpperCase(), gp: gp(word) }));
}

/**
 * Canonical complete words across physical page boundaries.
 * @returns {{startPage:number,startOffset:number,values:number[],gp0:number}[]}
 */
function canonicalWords() {
  const words = [];
  let current = [];
  let startPage = null;
  let startOffset = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      startPage,
      startOffset,
      values: current.slice(),
      gp0: gp0(current),
    });
    current = [];
    startPage = null;
  }

  for (let page = 0; page <= 55; page += 1) {
    if (page === 50) continue;
    let offset = 0;
    for (const char of [...physicalPart(page)]) {
      if (runeSet.has(char)) {
        if (!current.length) {
          startPage = page;
          startOffset = offset;
        }
        current.push(runeIndex.get(char));
        offset += 1;
      } else if (char === "-" || char === ".") {
        flush();
      }
    }
  }
  flush();
  return words;
}

/**
 * @param {{name:string,value:number}[]} pool
 * @param {number} length
 * @param {{name:string,value:number}[]} prefix
 * @param {Set<number>} used
 * @returns {{name:string,value:number}[][]}
 */
function orderedTuples(pool, length, prefix = [], used = new Set()) {
  if (prefix.length === length) return [prefix];
  const out = [];
  for (let index = 0; index < pool.length; index += 1) {
    if (used.has(index)) continue;
    const next = new Set(used);
    next.add(index);
    out.push(...orderedTuples(pool, length, [...prefix, pool[index]], next));
  }
  return out;
}

// ---- p28 source state and HERE carrier ----
const p28Lines = physicalPart(28)
  .trim()
  .split("/")
  .filter((line) => /[\u16A0-\u16FF]/u.test(line));
assert.equal(p28Lines.length, 12);

const dhLineNumber = 6;
const dhFragments = fragments(p28Lines[dhLineNumber - 1]);
assert.equal(spell(dhFragments[0]), "DH");
assert.equal(dhFragments.length, 5);
assert.equal(dhFragments.flat().length, 23);
const dhFirst = H(dhFragments[0][0], dhFragments[0].at(-1));
const dhLast = H(dhFragments.at(-1)[0], dhFragments.at(-1).at(-1));
const dh = Object.freeze({
  p: dhFragments.flat().length,
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
assert.deepEqual(
  [hereFragments.flat().length, hereFragments.length, hereFragments[0].length, hereFragments[1].length],
  [dh.p, dh.g, dh.K, dh.g]
);
const HERE = [
  ...H(hereFragments[0][0], hereFragments[0].at(-1)),
  ...H(hereFragments[1][0], hereFragments[1].at(-1)),
];
assert.equal(spell(HERE), "HERE");
assert.deepEqual(HERE, gp("HERE"));

// ---- p50 positional consumer, no token-value decoding ----
const READ = gp("READ");
const OUT = gp("OUT");
const READOUT = [...READ, ...OUT];
assert.deepEqual(READ, [4, 28, 23]);
assert.equal(gp0(READ), 55);
assert.equal(gp0(OUT), 20);
assert.equal(gp0(HERE), 48);
assert.equal(gp0(READOUT), 75);
assert.equal(dh.A, 8);

assert.equal(reflect8(gp0(READ)), gp0(HERE));
assert.equal(reflect8(gp0(HERE)), gp0(READ));
assert.equal(reflect8(gp0(OUT)), dh.B);
const reflectedReadout = reflect8(gp0(READOUT));
assert.equal(reflectedReadout, 76);

assert.deepEqual([Math.floor(gp0(HERE) / dh.A), gp0(HERE) % dh.A], [dh.a, 0]);
assert.deepEqual(
  [Math.floor(gp0(READ) / dh.A), gp0(READ) % dh.A],
  [dh.a, dh.A - 1]
);
assert.deepEqual(
  [Math.floor(gp0(OUT) / dh.A), gp0(OUT) % dh.A],
  [dh.K, dh.a - dh.K]
);

// ---- unique original-cipher receiver ----
const words = canonicalWords();
assert.equal(words.length, 2896);
const receiverHits = [];
for (let index = 0; index + 1 < words.length; index += 1) {
  if (words[index].gp0 === gp0(OUT) && words[index + 1].gp0 === reflectedReadout) {
    receiverHits.push({
      index,
      first: words[index],
      second: words[index + 1],
    });
  }
}
assert.equal(receiverHits.length, 1);
const receiver = receiverHits[0];
assert.equal(receiver.index, 21);
assert.deepEqual(receiver.first, {
  startPage: 0,
  startOffset: 103,
  values: [8, 12],
  gp0: 20,
});
assert.deepEqual(receiver.second, {
  startPage: 0,
  startOffset: 105,
  values: [16, 8, 25, 27],
  gp0: 76,
});

// The authenticated 2016 adjacency shape is independently unique.
const message = signedWords();
assert.equal(message.length, 43);
const shapeHits = [];
for (let index = 0; index + 1 < message.length; index += 1) {
  if (
    message[index].gp.length === receiver.first.values.length &&
    message[index + 1].gp.length === receiver.second.values.length
  ) {
    shapeHits.push(message[index].word + " " + message[index + 1].word);
  }
}
assert.deepEqual(shapeHits, ["THE ROAD"]);

// ---- direct source keys and exact inverse ----
const theKey = [dhLineNumber, dhFragments.flat().length];
assert.deepEqual(theKey, [dh.a, dh.p]);
const THE = receiver.first.values.map((value, index) =>
  mod29(value - theKey[index])
);
assert.deepEqual(THE, gp("THE"));
assert.deepEqual(
  THE.map((value, index) => mod29(value + theKey[index])),
  receiver.first.values
);

const roadKey = [
  p28Lines.length,
  hereFragments.length,
  hereLineNumber,
  HERE.length,
];
assert.deepEqual(roadKey, [12, 5, 1, 4]);
const ROAD = receiver.second.values.map((value, index) =>
  mod29(value - roadKey[index])
);
assert.deepEqual(ROAD, gp("ROAD"));
assert.deepEqual(
  ROAD.map((value, index) => mod29(value + roadKey[index])),
  receiver.second.values
);

// ---- broad p28 source-scalar ROAD control ----
const page28 = physicalPart(28);
const scalars = [
  ["page-number", 28],
  ["page-rune-lines", p28Lines.length],
  ["here-line-one", hereLineNumber],
  ["here-line-runes", hereFragments.flat().length],
  ["here-line-fragments", hereFragments.length],
  ["here-fragments-consumed", 2],
  ["here-output-length", HERE.length],
  ["dh-line-one", dhLineNumber],
  ["dh-line-runes", dhFragments.flat().length],
  ["dh-line-fragments", dhFragments.length],
  ["page-periods", (page28.match(/\./g) || []).length],
  ["center-index-mod29", 134 % 29],
  ["center-value", 9],
  ["page-word-number-mod29", 28],
  ["page-word-length", 5],
  ...Object.entries(dh),
  ["dh-inverse-e", 3],
].map(([name, value]) => ({ name, value: value % 29 }));
assert.equal(scalars.length, 23);

const fourRuneTargets = [...new Map(
  message
    .filter((row) => row.gp.length === 4)
    .map((row) => [row.word, row.gp])
).entries()].map(([word, values]) => ({ word, values }));
assert.deepEqual(
  fourRuneTargets.map((row) => row.word),
  ["LIES", "THEIR", "MEANING", "ROAD", "SEEK", "WILL", "GOOD", "LUCK", "PATHS"]
);

const descriptorHits = [];
const tuples = orderedTuples(scalars, 4);
assert.equal(tuples.length * 2, 425040);
for (const tuple of tuples) {
  const key = tuple.map((field) => field.value);
  for (const sign of [-1, 1]) {
    const plain = receiver.second.values.map((value, index) =>
      mod29(value + sign * key[index])
    );
    const target = fourRuneTargets.find((candidate) =>
      candidate.values.every((value, index) => value === plain[index])
    );
    if (target) {
      descriptorHits.push({
        fields: tuple.map((field) => field.name),
        key,
        sign,
        target: target.word,
      });
    }
  }
}
assert.equal(descriptorHits.length, 4);
assert.ok(descriptorHits.every((hit) => hit.target === "ROAD"));
assert.ok(descriptorHits.every((hit) => hit.sign === -1));
assert.ok(descriptorHits.every((hit) => hit.key.join(",") === "12,5,1,4"));

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "Consolidated source-constrained local plaintext recovery candidate: source-only p28 DH/HERE plus source-selected p50 reflection uniquely selects p0 words22-23 without decoding any p50 token value; direct p28 source descriptors decrypt them to THE ROAD with exact forward reconstruction.",
  p28: {
    dh,
    here: {
      line: hereLineNumber,
      geometry: [
        hereFragments.flat().length,
        hereFragments.length,
        hereFragments[0].length,
        hereFragments[1].length,
      ],
      values: HERE,
      text: spell(HERE),
    },
  },
  reflection: {
    READ_to_HERE: [gp0(READ), reflect8(gp0(READ))],
    OUT_to_B: [gp0(OUT), reflect8(gp0(OUT))],
    READOUT_to_76: [gp0(READOUT), reflectedReadout],
  },
  receiver: {
    canonicalWords: words.length,
    canonicalAdjacencies: words.length - 1,
    hitCount: receiverHits.length,
    first: receiver.first,
    second: receiver.second,
    authenticatedShapeHits: shapeHits,
  },
  recovery: {
    the: { key: theKey, plaintext: THE, text: spell(THE) },
    road: { key: roadKey, plaintext: ROAD, text: spell(ROAD) },
    roadBroadFamily: {
      configurations: tuples.length * 2,
      hits: descriptorHits,
    },
  },
}, null, 2));
