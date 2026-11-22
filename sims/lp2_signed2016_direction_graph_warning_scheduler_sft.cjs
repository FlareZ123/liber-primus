"use strict";

/**
 * SFT: signed-2016 direction graph -> p0 warning-packet scheduler gate.
 *
 * Reconstructs the frozen signed-word direction rule
 *   next_i = low60(p50[i]) - i - GP_length(word_i) mod 29
 * and tests whether graph walks supply one common scheduler for the fixed
 * p0 OPENPGP / PATHS / VERIFY / BEWARE candidate packet.
 *
 * This is a bounded negative on the tested consumers. It does not establish
 * or reject the packet plaintext itself.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const mod29 = value => ((value % 29) + 29) % 29;
const inv2 = 15;
const H = (left, right) => [
  mod29(left - right),
  mod29(left + right),
];
const Hinv = (diff, sum) => [
  mod29((diff + sum) * inv2),
  mod29((sum - diff) * inv2),
];

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const table = grid.rows.flat();
const bytes = grid.byte_rows.flat();
const alpha60 = grid.alphabet;

/** @param {string} word */
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
    const token = gpTokens.find(candidate =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .split(/\n\n/u)
    .slice(1)
    .join("\n");

  return clear
    .split(/[^A-Za-z0-9]+/u)
    .filter(token => /^[A-Za-z]+$/u.test(token))
    .map(word => word.toUpperCase());
}

function outer(values, mode) {
  const out = [];
  for (
    let left = 0, right = values.length - 1;
    left < right;
    left += 1, right -= 1
  ) {
    out.push(...(mode === "H"
      ? H(values[left], values[right])
      : Hinv(values[left], values[right])));
  }
  if (values.length % 2 === 1) {
    out.push(values[Math.floor(values.length / 2)]);
  }
  return out;
}

function physicalLines(page) {
  const parts = transcription.split(/^\s*%\s*$/m);
  return parts[page]
    .split("/")
    .filter(line => /[\u16A0-\u16FF]/u.test(line));
}

function runeValues(text) {
  return [...text]
    .map(rune => runeIndex.get(rune))
    .filter(value => value !== undefined);
}

function powMod(base, exponent, modulus) {
  let result = 1;
  let value = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power & 1) result = (result * value) % modulus;
    value = (value * value) % modulus;
    power >>= 1;
  }
  return result;
}

function cubeIterate(values, count, inverse) {
  let exponent = 1;
  const step = inverse ? 19 : 3;
  for (let i = 0; i < count; i += 1) {
    exponent = (exponent * step) % 28;
  }
  return values.map(value =>
    value === 0 ? 0 : powMod(value, exponent, 29)
  );
}

function repeatedOuter(values, count, inverse) {
  let current = [...values];
  for (let round = 0; round < count; round += 1) {
    const next = [...current];
    for (
      let left = 0, right = current.length - 1;
      left < right;
      left += 1, right -= 1
    ) {
      const pair = inverse
        ? Hinv(current[left], current[right])
        : H(current[left], current[right]);
      next[left] = pair[0];
      next[right] = pair[1];
    }
    current = next;
  }
  return current;
}

// Reconstruct the independent p28 DH state.
const p28 = physicalLines(28);
assert.equal(p28.length, 12);
const dhLine = runeValues(p28[5]);
const dhFragments = p28[5]
  .match(/[\u16A0-\u16FF]+/gu)
  .map(fragment => runeValues(fragment));
assert.equal(dhLine.length, 23);
assert.equal(dhFragments.length, 5);
const firstH = H(dhFragments[0][0], dhFragments[0].at(-1));
const lastH = H(dhFragments.at(-1)[0], dhFragments.at(-1).at(-1));
const state = {
  p: dhLine.length,
  g: dhFragments.length,
  a: 6,
  b: firstH[0],
  A: lastH[0],
  B: lastH[1],
  K: firstH[1],
};
assert.deepEqual(state, {p:23, g:5, a:6, b:15, A:8, B:19, K:2});

// Reconstruct the frozen source graph.
const words = signedWords();
assert.equal(words.length, 43);
const rows = words.map((word, index) => {
  const values = gp(word);
  const gp0 = values.reduce((sum, value) => sum + value, 0);
  const length = values.length;
  const delta = mod29(index - gp0);
  const [hdiff, hsum] = H(delta, length);
  const token = table[index];
  const high = alpha60.indexOf(token[0]);
  const low = alpha60.indexOf(token[1]);
  const p50 = address => bytes[address] === undefined
    ? null
    : mod29(bytes[address]);

  return {
    word,
    index,
    gp0mod: mod29(gp0),
    length,
    delta,
    hdiff,
    hsum,
    high: mod29(high),
    low: mod29(low),
    byte: mod29(bytes[index]),
    sum: mod29(high + low),
    diff: mod29(high - low),
    p50gp: p50(gp0),
    p50delta: p50(delta),
    next: mod29(low - index - length),
  };
});

const byWord = new Map(rows.map(row => [row.word, row.index]));
assert.deepEqual(
  [0, rows[0].next, rows[18].next, rows[23].next],
  [0, 18, 23, 0]
);
assert.deepEqual(
  [22, rows[22].next, rows[6].next, rows[24].next],
  [22, 6, 24, 22]
);

/** @param {number} start */
function cycleEntry(start) {
  const seen = new Map();
  const order = [];
  let node = start;
  while (!seen.has(node)) {
    seen.set(node, order.length);
    order.push(node);
    node = rows[node].next;
  }
  const distance = seen.get(node);
  return {distance, entry: node, order};
}

// Fixed warning packet and its exact candidate key.
const packetWords = ["OPENPGP", "PATHS", "VERIFY", "BEWARE"];
const packetLengths = packetWords.map(word => gp(word).length);
assert.deepEqual(packetLengths, [7,4,6,6]);

const p0 = corpus.pages.find(page => page.page === 0);
assert.ok(p0);
const cipher = p0.indices.slice(166, 189);
const plain = packetWords.flatMap(gp);
const key = cipher.map((value, index) => mod29(value - plain[index]));
assert.deepEqual(key, [
  23,3,24,1,18,17,27,
  9,13,18,13,
  28,25,21,3,6,17,
  12,2,0,17,12,7,
]);

const shell = [];
let packetOffset = 0;
for (const length of packetLengths) {
  shell.push(...outer(
    key.slice(packetOffset, packetOffset + length),
    "H"
  ));
  packetOffset += length;
}
assert.deepEqual(shell, [
  25,21,15,20,6,13,1,
  25,22,24,2,
  11,16,19,2,18,24,
  5,19,19,14,12,17,
]);

// New source-only observation: warning words enter the two frozen cycles after
// [5,4,1,2] edges, exactly [g,a-K,K-1,K].
const entries = packetWords.map(word => cycleEntry(byWord.get(word)));
const distances = entries.map(row => row.distance);
assert.deepEqual(distances, [5,4,1,2]);
assert.deepEqual(distances, [
  state.g,
  state.a - state.K,
  state.K - 1,
  state.K,
]);
assert.deepEqual(
  entries.map(row => row.entry),
  [0,22,6,24]
);

// The already-authenticated primitive families do not turn those distances
// directly into the claimed words when applied to the fixed ciphertext.
const distanceTransforms = [];
for (let segment = 0, offset = 0; segment < packetLengths.length; segment += 1) {
  const length = packetLengths[segment];
  const source = cipher.slice(offset, offset + length);
  const target = plain.slice(offset, offset + length);
  const d = distances[segment];
  for (const [name, values] of [
    ["H^d", repeatedOuter(source, d, false)],
    ["Hinv^d", repeatedOuter(source, d, true)],
    ["cube^d", cubeIterate(source, d, false)],
    ["cubeInv^d", cubeIterate(source, d, true)],
  ]) {
    distanceTransforms.push({
      segment: packetWords[segment],
      name,
      exact: values.every((value, i) => value === target[i]),
    });
  }
  offset += length;
}
assert.equal(distanceTransforms.filter(row => row.exact).length, 0);

const features = [
  "index","gp0mod","length","delta","hdiff","hsum","high","low",
  "byte","sum","diff","p50gp","p50delta","next",
];

const graphHits = [];

// 1. Node-walk emitters, with source/first-successor starts, current/next
// timing, and raw/H/Hinv segment serialization.
for (const startMode of ["source", "firstNext"]) {
  for (const emitTiming of ["current", "next"]) {
    for (const feature of features) {
      for (const transform of ["raw", "H", "Hinv"]) {
        const generated = [];
        for (let segment = 0; segment < packetWords.length; segment += 1) {
          let node = byWord.get(packetWords[segment]);
          if (startMode === "firstNext") node = rows[node].next;
          const values = [];
          for (let i = 0; i < packetLengths[segment]; i += 1) {
            if (emitTiming === "next") node = rows[node].next;
            values.push(rows[node][feature]);
            if (emitTiming === "current") node = rows[node].next;
          }
          generated.push(...(transform === "raw"
            ? values
            : outer(values, transform)));
        }
        for (const [targetName, target] of [["key", key], ["shell", shell]]) {
          if (generated.every((value, i) => value === target[i])) {
            graphHits.push({
              family:"node",
              startMode,
              emitTiming,
              feature,
              transform,
              targetName,
            });
          }
        }
      }
    }
  }
}

// 2. Fixed pairwise edge emitters. The left feature is evaluated at the
// current node and the right feature at its graph successor.
const pairOps = {
  hdiff: (left, right) => H(left, right)[0],
  hsum: (left, right) => H(left, right)[1],
  hinvLeft: (left, right) => Hinv(left, right)[0],
  hinvRight: (left, right) => Hinv(left, right)[1],
  add: (left, right) => mod29(left + right),
  sub: (left, right) => mod29(left - right),
  rsub: (left, right) => mod29(right - left),
};

for (const leftFeature of features) {
  for (const rightFeature of features) {
    for (const [opName, op] of Object.entries(pairOps)) {
      const generated = [];
      for (let segment = 0; segment < packetWords.length; segment += 1) {
        let node = byWord.get(packetWords[segment]);
        for (let i = 0; i < packetLengths[segment]; i += 1) {
          const next = rows[node].next;
          generated.push(op(
            rows[node][leftFeature],
            rows[next][rightFeature]
          ));
          node = next;
        }
      }
      for (const [targetName, target] of [["key", key], ["shell", shell]]) {
        if (generated.every((value, i) => value === target[i])) {
          graphHits.push({
            family:"edge",
            leftFeature,
            rightFeature,
            opName,
            targetName,
          });
        }
      }
    }
  }
}

// 3. Start at the first cycle node reached by each warning word, then walk
// the frozen road. This tests the literal "reach the road, then read" variant.
for (const feature of features) {
  for (const transform of ["raw","H","Hinv"]) {
    const generated = [];
    for (let segment = 0; segment < packetWords.length; segment += 1) {
      let node = entries[segment].entry;
      const values = [];
      for (let i = 0; i < packetLengths[segment]; i += 1) {
        values.push(rows[node][feature]);
        node = rows[node].next;
      }
      generated.push(...(transform === "raw"
        ? values
        : outer(values, transform)));
    }
    for (const [targetName, target] of [["key", key], ["shell", shell]]) {
      if (generated.every((value, i) => value === target[i])) {
        graphHits.push({
          family:"cycle-entry",
          feature,
          transform,
          targetName,
        });
      }
    }
  }
}

assert.deepEqual(graphHits, []);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "bounded negative: frozen signed-2016 direction graph does not generate the warning-packet key/shell under the charged graph consumers",
  directionCycles: [
    ["HELLO","MAP","ROAD","HELLO"],
    ["THE","SEEKS","AND","THE"],
  ],
  warningEntries: packetWords.map((word, index) => ({
    word,
    distance: distances[index],
    entryIndex: entries[index].entry,
    entryWord: rows[entries[index].entry].word,
  })),
  distanceStateLabels: ["g","a-K","K-1","K"],
  distanceTransforms: {
    charged: distanceTransforms.length,
    exactPlaintextHits: distanceTransforms.filter(row => row.exact).length,
  },
  graphConsumers: {
    nodeConfigurations: 2 * 2 * features.length * 3 * 2,
    edgeConfigurations:
      features.length * features.length * Object.keys(pairOps).length * 2,
    cycleEntryConfigurations: features.length * 3 * 2,
    exactHits: graphHits.length,
  },
}, null, 2));
