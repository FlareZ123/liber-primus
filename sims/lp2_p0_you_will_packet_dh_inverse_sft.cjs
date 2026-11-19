"use strict";

/**
 * SFT: source-native YOU -> 2L -> p0 141..144 -> WILL recovery.
 *
 * This replaces the earlier packet-dependent interpretation. It does not use
 * DEVOTED, READOUT receiver offsets, or the rejected global p50->LP offset
 * architecture as an upstream premise.
 *
 * Frozen source operations:
 * - authenticated 2016 word order;
 * - whole-word GP0 -> zero-based p50 cell address;
 * - literal p50 token text and conventional base60/base59 numeral readings;
 * - H(x,y)=(x-y,x+y) mod29;
 * - the independently source-derived p28 literal-DH line.
 *
 * Run:
 *   node sims/lp2_p0_you_will_packet_dh_inverse_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

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

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function translit(values) {
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
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function gp0(word) {
  return sum(gp(word));
}

function parsePage(text) {
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      index: words.length,
      start,
      end: start + current.length - 1,
      values: current.slice(),
      length: current.length,
    });
    current = [];
  }

  for (const char of [...text]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if ((char === "-" || char === ".") && current.length) {
      flush();
    }
  }
  flush();
  return { runes, words };
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\r?\n\r?\n/)
    .slice(1)
    .join("\n");
  return clear.split(/[^A-Za-z0-9]+/)
    .filter((token) => /^[A-Za-z]+$/.test(token));
}

function decodeToken(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  if (high < 0 || low < 0) return null;
  return high * alphabet.length + low;
}

function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

function physicalLines(page) {
  assert.ok(page >= 0 && page < 50);
  return parts[page].trim().split("/").filter((line) => line.trim().length > 0);
}

function lineFragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map((fragment) =>
    [...fragment].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

function lineRunes(line) {
  return lineFragments(line).flat();
}

function outerH(fragment) {
  assert.ok(fragment.length >= 2);
  return H(fragment[0], fragment[fragment.length - 1]);
}

function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

const p0 = parsePage(parts[0]);
const p0ByStart = new Map(p0.words.map((word) => [word.start, word]));
const message = signedWords();
assert.equal(p0.words.length, 59);
assert.equal(message.length, 43);

// Source-visible selector: authenticated YOU addresses p50 cell30.
assert.equal(message[32].toLowerCase(), "you");
assert.equal(message[33].toLowerCase(), "will");
assert.equal(gp0("YOU"), 30);
assert.equal(tableTokens[30], "2L");

// Charge the literal token and all four numeral modes across every adjacent
// authenticated signed pair. The token's positive digit must equal the count
// of its letter in the next word. Its numeric reading must land exactly at a
// p0 word start whose rune length equals the next signed word's GP length.
const literalHits = [];
const compoundHits = [];
for (let index = 0; index < message.length - 1; index += 1) {
  const address = gp0(message[index]);
  if (address >= tableTokens.length) continue;
  const token = tableTokens[address];
  const match = token.match(/^([1-9])([A-Za-z])$/);
  if (!match) continue;

  const count = Number(match[1]);
  const letter = match[2].toLowerCase();
  const nextWord = message[index + 1];
  const actual = [...nextWord.toLowerCase()]
    .filter((char) => char === letter).length;
  if (actual !== count) continue;

  const nextGpLength = gp(nextWord).length;
  literalHits.push({
    index,
    from: message[index].toLowerCase(),
    to: nextWord.toLowerCase(),
    address,
    token,
    nextGpLength,
  });

  for (const [radix, alphabet] of [
    ["base60", alphabet60],
    ["base59", alphabet59],
  ]) {
    for (const origin of ["zero", "one"]) {
      const numeric = decodeToken(token, alphabet);
      if (numeric === null) continue;
      const offset = origin === "zero" ? numeric : numeric - 1;
      const receiver = p0ByStart.get(offset);
      if (!receiver || receiver.length !== nextGpLength) continue;
      compoundHits.push({
        index,
        from: message[index].toLowerCase(),
        to: nextWord.toLowerCase(),
        address,
        token,
        radix,
        origin,
        numeric,
        offset,
        p0WordIndex: receiver.index,
        p0Length: receiver.length,
        ciphertext: receiver.values,
      });
    }
  }
}

assert.deepEqual(literalHits, [
  {
    index: 14,
    from: "its",
    to: "words",
    address: 41,
    token: "1O",
    nextGpLength: 5,
  },
  {
    index: 32,
    from: "you",
    to: "will",
    address: 30,
    token: "2L",
    nextGpLength: 4,
  },
]);
assert.deepEqual(compoundHits, [{
  index: 32,
  from: "you",
  to: "will",
  address: 30,
  token: "2L",
  radix: "base60",
  origin: "zero",
  numeric: 141,
  offset: 141,
  p0WordIndex: 32,
  p0Length: 4,
  ciphertext: [19, 16, 9, 18],
}]);

const receiver = p0ByStart.get(141);
assert.ok(receiver);
assert.deepEqual(receiver.values, [19, 16, 9, 18]);
assert.deepEqual(gp("WILL"), [7, 10, 20, 20]);

// Reconstruct DH23 independently from the unique literal-DH source line.
const p28Lines = physicalLines(28);
const lineNumber = 6;
const line6 = p28Lines[lineNumber - 1];
const fragments = lineFragments(line6);
assert.equal(lineRunes(line6).length, 23);
assert.equal(fragments.length, 5);
assert.equal(translit(fragments[0]), "DH");

const hFirst = outerH(fragments[0]);
const hPenultimate = outerH(fragments[fragments.length - 2]);
const hFinal = outerH(fragments[fragments.length - 1]);
assert.deepEqual(hFirst, [15, 2]);
assert.deepEqual(hPenultimate, [23, 12]);
assert.deepEqual(hFinal, [8, 19]);

const state = {
  p: hPenultimate[0],
  g: fragments.length,
  a: lineNumber,
  b: hFirst[0],
  A: hFinal[0],
  B: hFinal[1],
  K: hFirst[1],
};
assert.deepEqual(state, { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });
assert.equal(powMod(state.g, state.a, state.p), state.A);
assert.equal(powMod(state.g, state.b, state.p), state.B);
assert.equal(powMod(state.B, state.a, state.p), state.K);
assert.equal(powMod(state.A, state.b, state.p), state.K);

// Compact source-state inverse, with no READOUT packet dependency.
const exactKey = [
  mod29(state.K * state.a),
  state.a,
  ...H(state.A, state.B),
];
assert.deepEqual(exactKey, [12, 6, 18, 27]);

const plaintext = receiver.values.map((value, index) =>
  mod29(value - exactKey[index])
);
assert.deepEqual(plaintext, gp("WILL"));
assert.deepEqual(
  plaintext.map((value, index) => mod29(value + exactKey[index])),
  receiver.values
);

// Target family: all distinct authenticated signed words of exactly four GP runes.
const targets = new Map();
for (let index = 0; index < message.length; index += 1) {
  const values = gp(message[index]);
  if (values.length !== 4) continue;
  const key = values.join(",");
  if (!targets.has(key)) targets.set(key, []);
  targets.get(key).push({ index, word: message[index].toLowerCase() });
}
assert.equal(targets.size, 9);

// Charge [K*x, x, H(y,z)] for every DH field x,y,z and both signs.
const stateEntries = Object.entries(state);
const familyHits = [];
let configurations = 0;
const coverage = new Map();

function recordCoverage(ciphertext, row) {
  const key = ciphertext.join(",");
  if (!coverage.has(key)) coverage.set(key, []);
  coverage.get(key).push(row);
}

for (const [xName, xValue] of stateEntries) {
  for (const [yName, yValue] of stateEntries) {
    for (const [zName, zValue] of stateEntries) {
      const key = [
        mod29(state.K * xValue),
        xValue,
        ...H(yValue, zValue),
      ];

      for (const sign of ["subtract", "add"]) {
        configurations += 1;
        const candidate = receiver.values.map((value, index) =>
          sign === "subtract"
            ? mod29(value - key[index])
            : mod29(value + key[index])
        );
        const matched = targets.get(candidate.join(","));
        if (matched) {
          familyHits.push({
            x: xName,
            hPair: [yName, zName],
            key,
            sign,
            targets: matched,
          });
        }

        for (const [plainKey, labels] of targets.entries()) {
          const plain = plainKey.split(",").map(Number);
          const ciphertext = plain.map((value, index) =>
            sign === "subtract"
              ? mod29(value + key[index])
              : mod29(value - key[index])
          );
          recordCoverage(ciphertext, {
            x: xName,
            hPair: [yName, zName],
            key,
            sign,
            targets: labels,
          });
        }
      }
    }
  }
}

assert.equal(configurations, 686);
assert.deepEqual(familyHits, [{
  x: "a",
  hPair: ["A", "B"],
  key: [12, 6, 18, 27],
  sign: "subtract",
  targets: [{ index: 33, word: "will" }],
}]);

// Exact ciphertext-space null for the same frozen family and target set.
const totalCiphertexts = 29 ** 4;
const coveredCiphertexts = coverage.size;
const singleHitCiphertexts = [...coverage.values()]
  .filter((rows) => rows.length === 1).length;
const receiverCoverage = coverage.get(receiver.values.join(","));
assert.equal(totalCiphertexts, 707281);
assert.equal(coveredCiphertexts, 6094);
assert.equal(singleHitCiphertexts, 6014);
assert.ok(receiverCoverage);
assert.equal(receiverCoverage.length, 1);


// Downstream holdout after WILL is recovered: under the same conventional
// base60 table reading, two table hops from GP0(WILL)=57 land exactly on
// GP0(BE)=35, where BE is the next authenticated signed word.
function tableHop(address, alphabet) {
  assert.ok(address >= 0 && address < tableTokens.length);
  return decodeToken(tableTokens[address], alphabet);
}

assert.equal(gp0("WILL"), 57);
assert.equal(gp0("BE"), 35);
assert.equal(tableHop(57, alphabet60), 118);
assert.equal(tableHop(118, alphabet60), 35);

// Charge every adjacent authenticated pair, both source-supported radices,
// and fixed hop counts 1..4. This does not use any p0 offset interpretation.
const adjacentHopHits = [];
for (const [radix, alphabet] of [
  ["base60", alphabet60],
  ["base59", alphabet59],
]) {
  for (let hops = 1; hops <= 4; hops += 1) {
    for (let index = 0; index < message.length - 1; index += 1) {
      let value = gp0(message[index]);
      if (value >= tableTokens.length) continue;
      let valid = true;
      for (let step = 0; step < hops; step += 1) {
        value = tableHop(value, alphabet);
        if (value === null || value < 0 || value >= tableTokens.length) {
          valid = false;
          break;
        }
      }
      if (valid && value === gp0(message[index + 1])) {
        adjacentHopHits.push({
          radix,
          hops,
          index,
          from: message[index].toLowerCase(),
          to: message[index + 1].toLowerCase(),
          value,
        });
      }
    }
  }
}

assert.deepEqual(adjacentHopHits, [
  {
    radix: "base60",
    hops: 1,
    index: 7,
    from: "the",
    to: "devoted",
    value: 102,
  },
  {
    radix: "base60",
    hops: 2,
    index: 33,
    from: "will",
    to: "be",
    value: 35,
  },
]);

console.log(JSON.stringify({
  status: "PASS: source-native YOU -> 2L -> WILL recovery",
  selector: {
    literalHits,
    compoundHits,
    chosen: compoundHits[0],
  },
  dh23: state,
  inverse: {
    formula: "[K*a, a, H(A,B)]",
    key: exactKey,
    ciphertext: receiver.values,
    plaintext,
    plaintextText: "WILL",
  },
  downstreamHoldout: { willGp0: 57, path: [57, 118, 35], target: "BE", adjacentHopHits },
  chargedFamily: {
    configurations,
    distinctFourRuneSignedTargets: targets.size,
    hits: familyHits,
  },
  ciphertextNull: {
    totalCiphertexts,
    coveredCiphertexts,
    coveredFraction: coveredCiphertexts / totalCiphertexts,
    singleHitCiphertexts,
    singleHitFraction: singleHitCiphertexts / totalCiphertexts,
    selectedCiphertextHitCount: receiverCoverage.length,
  },
  classification:
    "source-constrained local recovery: the 2L token uniquely selects WILL and base60/zero offset141 in the charged adjacent-word family; p28 independently supplies the DH23 inverse, and recovered WILL prospectively gives the unique base60 two-hop adjacent-word edge WILL->BE.",
}, null, 2));
