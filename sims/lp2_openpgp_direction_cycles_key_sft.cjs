"use strict";

/**
 * SFT: derive the p0 OPENPGP candidate key from the authenticated 2016
 * signed-word direction graph, the original p50 table, and the independently
 * reconstructed p28 DH state.
 *
 * This is a post-discovery source compression / prediction gate. The graph
 * and p0 receiver are reconstructed without reading candidate plaintext.
 * The final H/cube serialization is charged over a finite nearby family.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relative) =>
  fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const table = grid.rows.flat();
const bytes = grid.byte_rows.flat();
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

const mod29 = (value) => ((value % 29) + 29) % 29;

/** @param {number} left @param {number} right */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {number} value @param {number} exponent */
function pow29(value, exponent) {
  let base = mod29(value);
  let result = 1;
  let power = exponent;
  while (power > 0) {
    if (power & 1) result = (result * base) % 29;
    base = (base * base) % 29;
    power = Math.floor(power / 2);
  }
  return result;
}

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
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(offset));
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
    .filter((token) => /^[A-Za-z]+$/u.test(token))
    .map((word) => word.toUpperCase());
}

function physicalLines(page) {
  return transcription
    .split(/^\s*%\s*$/m)[page]
    .split("/")
    .filter((line) => /[\u16A0-\u16FF]/u.test(line));
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

function inverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

/** @param {number[]} direction @param {number} start */
function cycleFrom(direction, start) {
  const seen = new Map();
  const order = [];
  let cursor = start;
  while (!seen.has(cursor)) {
    seen.set(cursor, order.length);
    order.push(cursor);
    cursor = direction[cursor];
  }
  return order.slice(seen.get(cursor));
}

/** @param {number[]} cycle */
function canonicalCycle(cycle) {
  const rotations = cycle.map((_, offset) =>
    cycle.slice(offset).concat(cycle.slice(0, offset))
  );
  rotations.sort((left, right) =>
    left.join(",").localeCompare(right.join(","))
  );
  return rotations[0].join(",");
}

/**
 * The warning report defines an odd outside-in H shell:
 * [H(k0,k6), H(k1,k5), H(k2,k4), k3].
 * @param {number[]} shell
 */
function invertOddHShell(shell) {
  assert.equal(shell.length, 7);
  const inv2 = 15;
  const key = Array(7);
  const pairs = [
    [0, 1, 0, 6],
    [2, 3, 1, 5],
    [4, 5, 2, 4],
  ];
  for (const [dIndex, sIndex, leftIndex, rightIndex] of pairs) {
    const diff = shell[dIndex];
    const sum = shell[sIndex];
    key[leftIndex] = mod29((diff + sum) * inv2);
    key[rightIndex] = mod29((sum - diff) * inv2);
  }
  key[3] = shell[6];
  return key;
}

// Reconstruct p28 DH state from the literal physical DH line.
const p28Lines = physicalLines(28);
assert.equal(p28Lines.length, 12);
const dhLineNumber = 6;
const dhFragments = lineFragments(p28Lines[dhLineNumber - 1]);
assert.equal(dhFragments.length, 5);
assert.deepEqual(
  dhFragments[0].map((value) => corpus.translit[value]),
  ["D", "H"]
);
const firstH = H(dhFragments[0][0], dhFragments[0].at(-1));
const lastH = H(dhFragments.at(-1)[0], dhFragments.at(-1).at(-1));
const state = Object.freeze({
  p: dhFragments.flat().length,
  g: dhFragments.length,
  a: dhLineNumber,
  b: firstH[0],
  A: lastH[0],
  B: lastH[1],
  K: firstH[1],
});
assert.deepEqual(state, { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2 });
const e = inverse(state.b, state.p - 1);
assert.equal(e, 3);

// Reconstruct the frozen authenticated-word direction graph.
const words = signedWords();
assert.equal(words.length, 43);
const gpLengths = words.map((word) => gp(word).length);
const latinLengths = words.map((word) => word.length);
const low60 = table.map((token) => alpha60.indexOf(token[1]));

const direction = words.map((word, index) =>
  mod29(low60[index] - index - gpLengths[index])
);

const cycleKeys = new Set();
const cycles = [];
for (let start = 0; start < 29; start += 1) {
  const cycle = cycleFrom(direction, start);
  const key = canonicalCycle(cycle);
  if (!cycleKeys.has(key)) {
    cycleKeys.add(key);
    cycles.push(cycle);
  }
}
assert.deepEqual(
  cycles.map((cycle) => canonicalCycle(cycle)).sort(),
  ["0,18,23", "22,6,24"]
);

const firstCycle = [0, 18, 23];
const secondCycle = [22, 6, 24];
assert.deepEqual(firstCycle.map((index) => words[index]), ["HELLO", "MAP", "ROAD"]);
assert.deepEqual(secondCycle.map((index) => words[index]), ["THE", "SEEKS", "AND"]);

const firstRaw = firstCycle.map((index) => mod29(low60[index]));
const secondRaw = secondCycle.map((index) => mod29(low60[index]));
assert.deepEqual(firstRaw, [state.p, state.b, mod29(-state.K)]);
assert.deepEqual(secondRaw, [
  mod29(state.a - state.g),
  state.a,
  mod29(state.p - e),
]);
assert.deepEqual(firstRaw, [23, 15, 27]);
assert.deepEqual(secondRaw, [1, 6, 20]);

// Charge all 128 arithmetic conventions x GP/Latin length = 256.
// Require both semantic 3-cycles. Then ask which modes also preserve the raw
// values consumed by the source-shell formula.
const modeRows = [];
const namedCycleModes = [];
const shellModeHits = [];

for (const lengthChoice of [
  { name: "GP", values: gpLengths },
  { name: "Latin", values: latinLengths },
]) {
  for (const addressOrigin of [0, 1]) {
    for (const radix of ["base60", "base59"]) {
      const alphabet = radix === "base60" ? alpha60 : alpha59;
      for (const component of ["low", "high"]) {
        for (const digitOrigin of [0, 1]) {
          for (const numberOrigin of [0, 1]) {
            for (const indexSign of [-1, 1]) {
              for (const lengthSign of [-1, 1]) {
                const raw = [];
                const candidateDirection = [];
                let valid = true;
                for (let index = 0; index < words.length; index += 1) {
                  const token = table[index + addressOrigin];
                  const char = component === "low" ? token[1] : token[0];
                  const componentValue = alphabet.indexOf(char);
                  if (componentValue < 0) {
                    valid = false;
                    break;
                  }
                  raw[index] = mod29(componentValue + digitOrigin);
                  candidateDirection[index] = mod29(
                    componentValue +
                    digitOrigin +
                    indexSign * (index + numberOrigin) +
                    lengthSign * lengthChoice.values[index]
                  );
                }
                if (!valid) continue;

                const found = new Set();
                for (let start = 0; start < 29; start += 1) {
                  found.add(canonicalCycle(cycleFrom(candidateDirection, start)));
                }

                const mode = {
                  lengthType: lengthChoice.name,
                  addressOrigin,
                  radix,
                  component,
                  digitOrigin,
                  numberOrigin,
                  indexSign,
                  lengthSign,
                };
                modeRows.push(mode);

                const hasNamedCycles =
                  found.has("0,18,23") && found.has("22,6,24");
                if (!hasNamedCycles) continue;
                namedCycleModes.push(mode);

                const c1 = firstCycle.map((index) => raw[index]);
                const c2 = secondCycle.map((index) => raw[index]);
                const candidateShell = [
                  ...H(c1[0], c1[2]),
                  c1[1],
                  c2[2],
                  c2[1],
                  pow29(c2[1], e),
                  c2[0],
                ];
                if (candidateShell.every((value, index) =>
                  value === [25, 21, 15, 20, 6, 13, 1][index]
                )) {
                  shellModeHits.push({ ...mode, c1, c2, candidateShell });
                }
              }
            }
          }
        }
      }
    }
  }
}

assert.equal(modeRows.length, 256);
assert.equal(namedCycleModes.length, 2);
assert.ok(namedCycleModes.every((mode) =>
  mode.lengthType === "GP" &&
  mode.addressOrigin === 0 &&
  mode.radix === "base60" &&
  mode.component === "low" &&
  mode.indexSign === -1 &&
  mode.lengthSign === -1
));
assert.deepEqual(
  namedCycleModes.map((mode) => [mode.digitOrigin, mode.numberOrigin]).sort(),
  [[0, 0], [1, 1]]
);
assert.equal(shellModeHits.length, 1);
assert.deepEqual(shellModeHits[0].candidateShell, [25, 21, 15, 20, 6, 13, 1]);

// Finite serialization charge around the discovered source formula.
// First cycle: H the two endpoints in either orientation, then place center in
// any of three output slots. Second cycle: source/reverse raw order, apply one
// member of the established cube orbit to its center, insert that value into
// any of four output slots.
const firstForms = [];
for (const reverseEndpoints of [false, true]) {
  const endpoints = reverseEndpoints
    ? [firstRaw[2], firstRaw[0]]
    : [firstRaw[0], firstRaw[2]];
  const transformed = H(endpoints[0], endpoints[1]);
  for (let centerPosition = 0; centerPosition < 3; centerPosition += 1) {
    const values = [...transformed];
    values.splice(centerPosition, 0, firstRaw[1]);
    firstForms.push({ reverseEndpoints, centerPosition, values });
  }
}

const cubeOrbit = [1, 3, 9, 27, 25, 19];
const secondForms = [];
for (const reverseRaw of [false, true]) {
  const raw = reverseRaw ? [...secondRaw].reverse() : [...secondRaw];
  for (const exponent of cubeOrbit) {
    const extra = pow29(secondRaw[1], exponent);
    for (let insertPosition = 0; insertPosition <= 3; insertPosition += 1) {
      const values = [...raw];
      values.splice(insertPosition, 0, extra);
      secondForms.push({ reverseRaw, exponent, insertPosition, values });
    }
  }
}

const shellFamilyHits = [];
for (const first of firstForms) {
  for (const second of secondForms) {
    const values = first.values.concat(second.values);
    if (values.every((value, index) =>
      value === [25, 21, 15, 20, 6, 13, 1][index]
    )) {
      shellFamilyHits.push({ first, second, values });
    }
  }
}
assert.equal(firstForms.length, 6);
assert.equal(secondForms.length, 48);
assert.equal(shellFamilyHits.length, 1);
assert.deepEqual(shellFamilyHits[0], {
  first: {
    reverseEndpoints: false,
    centerPosition: 2,
    values: [25, 21, 15],
  },
  second: {
    reverseRaw: true,
    exponent: 3,
    insertPosition: 2,
    values: [20, 6, 13, 1],
  },
  values: [25, 21, 15, 20, 6, 13, 1],
});

// The complete source-derived shell and its exact H inverse.
const shell = [
  ...H(firstRaw[0], firstRaw[2]),
  firstRaw[1],
  secondRaw[2],
  secondRaw[1],
  pow29(secondRaw[1], e),
  secondRaw[0],
];
assert.deepEqual(shell, [25, 21, 15, 20, 6, 13, 1]);
const key = invertOddHShell(shell);
assert.deepEqual(key, [23, 3, 24, 1, 18, 17, 27]);

// Independently reproduce the source-selected p0 receiver:
// GP0(OPENPGP)=75 -> p50[75]=2v -> base60 value177; p=23 centers
// the packet at offsets166..188, whose first seven runes are this receiver.
const openpgp = gp("OPENPGP");
const openpgpGp0 = openpgp.reduce((total, value) => total + value, 0);
assert.equal(openpgpGp0, 75);
assert.equal(table[openpgpGp0], "2v");
assert.equal(bytes[openpgpGp0], 177);
const packetStart = bytes[openpgpGp0] - Math.floor(state.p / 2);
assert.equal(packetStart, 166);

const p0 = corpus.pages.find((page) => page.page === 0);
assert.ok(p0);
const cipher = p0.indices.slice(packetStart, packetStart + openpgp.length);
assert.equal(cipher.length, 7);
const plain = cipher.map((value, index) => mod29(value - key[index]));
assert.deepEqual(plain, openpgp);
assert.equal(
  plain.map((value) => corpus.translit[value]).join(""),
  "OPENPGP"
);

console.log(JSON.stringify({
  status: "PASS: signed-word direction cycles derive the complete p0 OPENPGP candidate key",
  directionFormula:
    "s_i = low60(p50[i]) - i - GP_length(word_i) mod29",
  cycles: {
    first: {
      indices: firstCycle,
      words: firstCycle.map((index) => words[index]),
      rawLow: firstRaw,
      labels: ["p", "b", "-K"],
    },
    second: {
      indices: secondCycle,
      words: secondCycle.map((index) => words[index]),
      rawLow: secondRaw,
      labels: ["a-g", "a", "p-e"],
    },
  },
  sourceShell: {
    formula:
      "[H(c1[0],c1[2]),c1[1]] || [c2[2],c2[1],c2[1]^e,c2[0]]",
    values: shell,
    key,
    cubeValue: pow29(secondRaw[1], e),
  },
  familyCharge: {
    arithmeticLengthModes: modeRows.length,
    namedCycleModes: namedCycleModes.length,
    exactShellModes: shellModeHits.length,
    serializationForms: firstForms.length * secondForms.length,
    exactSerializationHits: shellFamilyHits.length,
  },
  receiver: {
    openpgpGp0,
    p50Token: table[openpgpGp0],
    p50Byte: bytes[openpgpGp0],
    packetStart,
    cipher,
    plaintext: plain,
    transliteration: "OPENPGP",
  },
  classification:
    "post-discovery source-derived key compression; requires an untouched holdout before established-plaintext promotion",
}, null, 2));
