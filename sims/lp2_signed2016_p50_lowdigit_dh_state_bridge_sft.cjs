"use strict";

/**
 * SFT: authenticated 2016 signed-word numbers -> p50 low digits -> p28 DH state.
 *
 * This reproduces a post-discovery cross-source bridge. It does not claim
 * unknown LP2 plaintext. The arithmetic rule was recognized after the p28
 * DH state and the terminal signed words were known, so the finite family
 * charge is a calibration rather than a blind-discovery probability.
 *
 * Run:
 *   node sims/lp2_signed2016_p50_lowdigit_dh_state_bridge_sft.cjs
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

const table = grid.rows.flat();
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);
const mod29 = value => (value % 29 + 29) % 29;

/** @param {number} left @param {number} right */
const H = (left, right) => [
  mod29(left - right),
  mod29(left + right),
];

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
    .filter(token => /^[A-Za-z]+$/u.test(token))
    .map(word => word.toUpperCase());
}

function multiplicativeInverse(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

function physicalLines(page) {
  const parts = transcription.split(/^\s*%\s*$/m);
  return parts[page]
    .split("/")
    .filter(line => /[\u16A0-\u16FF]/u.test(line));
}

function lineFragments(line) {
  return (line.match(/[\u16A0-\u16FF]+/gu) || []).map(fragment =>
    [...fragment].map(rune => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

// Independently reconstruct the existing p28 DH state from the literal-DH line.
const p28Lines = physicalLines(28);
assert.equal(p28Lines.length, 12);
const dhLineNumber = 6;
const dhFragments = lineFragments(p28Lines[dhLineNumber - 1]);
assert.equal(dhFragments.length, 5);
assert.deepEqual(
  dhFragments[0].map(value => corpus.translit[value]),
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
assert.deepEqual(state, {
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
});
const e = multiplicativeInverse(state.b, state.p - 1);
assert.equal(e, 3);

const words = signedWords();
assert.equal(words.length, 43);
const lengths = words.map(word => gp(word).length);
const latinLengths = words.map(word => word.length);
assert.deepEqual(words.slice(36), [
  "GOOD",
  "LUCK",
  "BEWARE",
  "FALSE",
  "PATHS",
  "VERIFY",
  "OPENPGP",
]);
assert.deepEqual(lengths.slice(36), [4, 4, 6, 5, 4, 6, 7]);

/**
 * @typedef {{
 *   addressOrigin: 0|1,
 *   radix: "base60"|"base59",
 *   component: "low"|"high",
 *   digitOrigin: 0|1,
 *   numberOrigin: 0|1,
 *   indexSign: -1|1,
 *   lengthSign: -1|1
 * }} Mode
 */

/** @param {string} token @param {string} alphabet @param {"low"|"high"} component */
function componentValue(token, alphabet, component) {
  const char = component === "low" ? token[1] : token[0];
  const value = alphabet.indexOf(char);
  return value < 0 ? null : value;
}

/**
 * @param {Mode} mode
 * @param {number[]} wordLengths
 */
function derive(mode, wordLengths = lengths) {
  const alphabet = mode.radix === "base60" ? alpha60 : alpha59;
  const sequence = [];

  for (let index = 0; index < words.length; index += 1) {
    const address = index + mode.addressOrigin;
    const token = table[address];
    assert.ok(token);
    const raw = componentValue(token, alphabet, mode.component);
    if (raw === null) return null;

    sequence.push(mod29(
      raw +
      mode.digitOrigin +
      mode.indexSign * (index + mode.numberOrigin) +
      mode.lengthSign * wordLengths[index]
    ));
  }
  return sequence;
}

const frozenMode = Object.freeze({
  addressOrigin: 0,
  radix: "base60",
  component: "low",
  digitOrigin: 0,
  numberOrigin: 0,
  indexSign: -1,
  lengthSign: -1,
});

const sequence = derive(frozenMode);
assert.ok(sequence);
const tail = sequence.slice(36);
assert.deepEqual(tail, [
  mod29(-state.b),
  state.A,
  mod29(-state.K),
  state.B,
  state.g,
  state.a,
  state.A,
]);
assert.deepEqual(tail, [14, 8, 27, 19, 5, 6, 8]);

const terminalRows = words.slice(36).map((word, offset) => {
  const index = 36 + offset;
  const token = table[index];
  const low = alpha60.indexOf(token[1]);
  return {
    index,
    word,
    token,
    low,
    gpLength: lengths[index],
    residue: sequence[index],
  };
});
assert.deepEqual(terminalRows, [
  {index: 36, word: "GOOD", token: "0s", low: 54, gpLength: 4, residue: 14},
  {index: 37, word: "LUCK", token: "1K", low: 20, gpLength: 4, residue: 8},
  {index: 38, word: "BEWARE", token: "2D", low: 13, gpLength: 6, residue: 27},
  {index: 39, word: "FALSE", token: "05", low: 5, gpLength: 5, residue: 19},
  {index: 40, word: "PATHS", token: "1K", low: 20, gpLength: 4, residue: 5},
  {index: 41, word: "VERIFY", token: "1O", low: 24, gpLength: 6, residue: 6},
  {index: 42, word: "OPENPGP", token: "0S", low: 28, gpLength: 7, residue: 8},
]);

// Punctuation-preserving 2 / 3 / 2 grouping of the final alphabetic words.
const goodLuck = tail.slice(0, 2);
const bewareFalsePaths = tail.slice(2, 5);
const verifyOpenpgp = tail.slice(5, 7);

assert.deepEqual(H(goodLuck[0], goodLuck[1]), [
  state.a,
  state.p - 1,
]);
assert.deepEqual(
  [...H(bewareFalsePaths[0], bewareFalsePaths[2]), bewareFalsePaths[1]],
  [state.p - 1, e, state.B]
);
assert.deepEqual(H(verifyOpenpgp[0], verifyOpenpgp[1]), [
  mod29(-state.K),
  mod29(-state.b),
]);

// The raw tail plus those H outputs recover the complete DH tuple and e.
assert.equal(mod29(-tail[0]), state.b);
assert.equal(tail[1], state.A);
assert.equal(mod29(-tail[2]), state.K);
assert.equal(tail[3], state.B);
assert.equal(tail[4], state.g);
assert.equal(tail[5], state.a);
assert.equal(tail[6], state.A);
assert.equal(H(tail[0], tail[6])[1] + 1, state.p);
assert.equal(H(tail[2], tail[4])[1], e);

// Family charge: signed primitive DH values.
const signedPrimitive = new Set(
  [state.p, state.g, state.a, state.b, state.A, state.B, state.K]
    .flatMap(value => [value, mod29(-value)])
);

function allSignedPrimitive(values) {
  return values.every(value => signedPrimitive.has(value));
}

const fiveStarts = [];
for (let start = 0; start + 5 <= sequence.length; start += 1) {
  if (allSignedPrimitive(sequence.slice(start, start + 5))) {
    fiveStarts.push(start);
  }
}
assert.deepEqual(fiveStarts, [36, 37, 38]);

const sevenStarts = [];
for (let start = 0; start + 7 <= sequence.length; start += 1) {
  if (allSignedPrimitive(sequence.slice(start, start + 7))) {
    sevenStarts.push(start);
  }
}
assert.deepEqual(sevenStarts, [36]);

const modes = [];
for (const addressOrigin of [0, 1]) {
  for (const [radix, alphabet] of [
    ["base60", alpha60],
    ["base59", alpha59],
  ]) {
    void alphabet;
    for (const component of ["low", "high"]) {
      for (const digitOrigin of [0, 1]) {
        for (const numberOrigin of [0, 1]) {
          for (const indexSign of [-1, 1]) {
            for (const lengthSign of [-1, 1]) {
              /** @type {Mode} */
              const mode = {
                addressOrigin,
                radix,
                component,
                digitOrigin,
                numberOrigin,
                indexSign,
                lengthSign,
              };
              const values = derive(mode);
              if (!values) continue;
              let windows7 = 0;
              let exactTailWindows = 0;
              for (let start = 0; start + 7 <= values.length; start += 1) {
                const window = values.slice(start, start + 7);
                if (allSignedPrimitive(window)) windows7 += 1;
                if (window.every((value, i) => value === tail[i])) {
                  exactTailWindows += 1;
                }
              }
              modes.push({
                ...mode,
                final7: allSignedPrimitive(values.slice(36)),
                windows7,
                exactTailWindows,
                tail: values.slice(36),
              });
            }
          }
        }
      }
    }
  }
}
assert.equal(modes.length, 128);

const final7Modes = modes.filter(mode => mode.final7);
assert.equal(final7Modes.length, 2);
assert.ok(final7Modes.every(mode =>
  mode.addressOrigin === 0 &&
  mode.radix === "base60" &&
  mode.component === "low" &&
  mode.indexSign === -1 &&
  mode.lengthSign === -1
));
assert.deepEqual(
  [...new Set(final7Modes.map(mode => mode.tail.join(",")))],
  [tail.join(",")]
);

// The two syntactic modes are numerically identical because +1 digit origin
// and +1 number origin cancel under subtraction.
assert.deepEqual(
  final7Modes.map(mode => [mode.digitOrigin, mode.numberOrigin]).sort(),
  [[0, 0], [1, 1]]
);

const anySevenWindowModes = modes.filter(mode => mode.windows7 > 0);
assert.equal(anySevenWindowModes.length, 6);

// GP-rune length is discriminating. Re-run every one of the 128 arithmetic
// conventions with ordinary Latin-letter count. None keeps the terminal
// seven inside the signed primitive-DH register.
const latinFinal7Modes = modes.filter(mode => {
  /** @type {Mode} */
  const base = {
    addressOrigin: mode.addressOrigin,
    radix: mode.radix,
    component: mode.component,
    digitOrigin: mode.digitOrigin,
    numberOrigin: mode.numberOrigin,
    indexSign: mode.indexSign,
    lengthSign: mode.lengthSign,
  };
  const values = derive(base, latinLengths);
  return values && allSignedPrimitive(values.slice(36));
});
assert.equal(latinFinal7Modes.length, 0);
assert.equal(latinLengths[40], 5);
assert.equal(lengths[40], 4);

const exactTailModes = modes.filter(mode => mode.exactTailWindows > 0);
assert.equal(exactTailModes.length, 2);
assert.ok(exactTailModes.every(mode => mode.exactTailWindows === 1));

/**
 * Exact probability under a uniform random permutation of all 256 labeled
 * original p50 token instances into the seven fixed terminal addresses.
 *
 * @param {(low:number, position:number)=>boolean} accepts
 */
function exactAssignmentCount(accepts) {
  let dp = Array(1 << 7).fill(0n);
  dp[0] = 1n;

  for (const token of table) {
    const low = alpha60.indexOf(token[1]);
    const next = dp.slice();
    for (let mask = 0; mask < dp.length; mask += 1) {
      const base = dp[mask];
      if (base === 0n) continue;
      for (let position = 0; position < 7; position += 1) {
        if (mask & (1 << position)) continue;
        if (!accepts(low, position)) continue;
        next[mask | (1 << position)] += base;
      }
    }
    dp = next;
  }
  return dp.at(-1);
}

let denominator = 1n;
for (let offset = 0; offset < 7; offset += 1) {
  denominator *= BigInt(256 - offset);
}

const primitiveAssignments = exactAssignmentCount((low, position) => {
  const index = 36 + position;
  return signedPrimitive.has(mod29(low - index - lengths[index]));
});
assert.equal(primitiveAssignments, 210363202181784n);

const exactAssignments = exactAssignmentCount((low, position) => {
  const index = 36 + position;
  return mod29(low - index - lengths[index]) === tail[position];
});
assert.equal(exactAssignments, 13305600n);

const primitiveProbability =
  Number(primitiveAssignments) / Number(denominator);
const exactTailProbability =
  Number(exactAssignments) / Number(denominator);

assert.ok(Math.abs(primitiveProbability - 0.003171181641539031) < 1e-15);
assert.ok(Math.abs(exactTailProbability - 2.0057916029058945e-10) < 1e-22);

// Charge all 256 cyclic table origins under the frozen numeric operation.
const low60Table = table.map(token => alpha60.indexOf(token[1]));
const cyclicOrigins = [];
for (let offset = 0; offset < table.length; offset += 1) {
  const candidate = [];
  for (let index = 36; index <= 42; index += 1) {
    candidate.push(mod29(
      low60Table[(offset + index) % table.length] -
      index -
      lengths[index]
    ));
  }
  if (
    allSignedPrimitive(candidate) ||
    candidate.every((value, i) => value === tail[i])
  ) {
    cyclicOrigins.push({
      offset,
      primitive: allSignedPrimitive(candidate),
      exact: candidate.every((value, i) => value === tail[i]),
      tail: candidate,
    });
  }
}
assert.deepEqual(
  cyclicOrigins.filter(row => row.primitive).map(row => row.offset),
  [0, 93, 253]
);
assert.deepEqual(
  cyclicOrigins.filter(row => row.exact).map(row => row.offset),
  [0]
);

// Charge the eight obvious 32x8 source-table traversals.
const traversals = [];
for (const major of ["row", "column"]) {
  for (const reverseMajor of [false, true]) {
    for (const reverseMinor of [false, true]) {
      const tokens = [];
      if (major === "row") {
        const rowOrder = reverseMajor ? [...grid.rows].reverse() : grid.rows;
        for (const row0 of rowOrder) {
          const row = reverseMinor ? [...row0].reverse() : row0;
          tokens.push(...row);
        }
      } else {
        const columns = Array.from({length: 8}, (_, i) => i);
        const columnOrder = reverseMajor ? [...columns].reverse() : columns;
        const rows = Array.from({length: 32}, (_, i) => i);
        const rowOrder = reverseMinor ? [...rows].reverse() : rows;
        for (const column of columnOrder) {
          for (const row of rowOrder) tokens.push(grid.rows[row][column]);
        }
      }

      const low = tokens.map(token => alpha60.indexOf(token[1]));
      const candidate = [];
      for (let index = 36; index <= 42; index += 1) {
        candidate.push(mod29(low[index] - index - lengths[index]));
      }
      traversals.push({
        major,
        reverseMajor,
        reverseMinor,
        primitive: allSignedPrimitive(candidate),
        exact: candidate.every((value, i) => value === tail[i]),
        tail: candidate,
      });
    }
  }
}
assert.equal(traversals.filter(row => row.primitive).length, 1);
assert.equal(traversals.filter(row => row.exact).length, 1);
assert.deepEqual(
  traversals.find(row => row.exact),
  {
    major: "row",
    reverseMajor: false,
    reverseMinor: false,
    primitive: true,
    exact: true,
    tail,
  }
);

// Independent transfer: Agent8 committed EPIPHANY SEEKS THE DEVOTED as the
// unique p=23/base60 p32 route before this formula was applied to that phrase.
// Under the already frozen operation it becomes a second compact DH packet.
const epiphanyStart = 5;
assert.deepEqual(words.slice(epiphanyStart, epiphanyStart + 4), [
  "EPIPHANY", "SEEKS", "THE", "DEVOTED",
]);
const epiphanyPacket = sequence.slice(epiphanyStart, epiphanyStart + 4);
assert.deepEqual(epiphanyPacket, [
  state.b,
  state.p - 1,
  state.p,
  state.b + state.K,
]);
assert.deepEqual(epiphanyPacket, [15, 24, 23, 17]);

const epiphanyHShell = [
  ...H(epiphanyPacket[0], epiphanyPacket[3]),
  ...H(epiphanyPacket[1], epiphanyPacket[2]),
];
assert.deepEqual(epiphanyHShell, [
  mod29(-state.K),
  e,
  state.a - state.g,
  state.p - state.g,
]);
assert.deepEqual(epiphanyHShell, [27, 3, 1, 18]);

// Charge the exact independently selected four-word transfer against the full
// 128 numeric conventions x GP/Latin length choice = 256 modes, and every
// possible four-word start in the authenticated message.
const epiphanyFamilyHits = [];
for (const wordLengths of [
  {name: "GP", values: lengths},
  {name: "Latin", values: latinLengths},
]) {
  for (const mode of modes) {
    /** @type {Mode} */
    const base = {
      addressOrigin: mode.addressOrigin,
      radix: mode.radix,
      component: mode.component,
      digitOrigin: mode.digitOrigin,
      numberOrigin: mode.numberOrigin,
      indexSign: mode.indexSign,
      lengthSign: mode.lengthSign,
    };
    const values = derive(base, wordLengths.values);
    if (!values) continue;
    for (let start = 0; start + epiphanyPacket.length <= values.length; start += 1) {
      if (epiphanyPacket.every((value, i) => values[start + i] === value)) {
        epiphanyFamilyHits.push({
          lengthType: wordLengths.name,
          start,
          ...base,
        });
      }
    }
  }
}
assert.equal(epiphanyFamilyHits.length, 2);
assert.ok(epiphanyFamilyHits.every(hit =>
  hit.lengthType === "GP" &&
  hit.start === epiphanyStart &&
  hit.addressOrigin === 0 &&
  hit.radix === "base60" &&
  hit.component === "low" &&
  hit.indexSign === -1 &&
  hit.lengthSign === -1
));
assert.deepEqual(
  epiphanyFamilyHits.map(hit => [hit.digitOrigin, hit.numberOrigin]).sort(),
  [[0, 0], [1, 1]]
);

/**
 * Exact labeled-token assignment count for a fixed source-word vector.
 *
 * @param {number} start
 * @param {number[]} target
 */
function exactVectorAssignments(start, target) {
  let dp = Array(1 << target.length).fill(0n);
  dp[0] = 1n;
  for (const token of table) {
    const low = alpha60.indexOf(token[1]);
    const next = dp.slice();
    for (let mask = 0; mask < dp.length; mask += 1) {
      const base = dp[mask];
      if (base === 0n) continue;
      for (let position = 0; position < target.length; position += 1) {
        if (mask & (1 << position)) continue;
        const index = start + position;
        if (mod29(low - index - lengths[index]) !== target[position]) continue;
        next[mask | (1 << position)] += base;
      }
    }
    dp = next;
  }
  return dp.at(-1);
}

const epiphanyAssignments = exactVectorAssignments(
  epiphanyStart,
  epiphanyPacket
);
assert.equal(epiphanyAssignments, 7200n);
let epiphanyDenominator = 1n;
for (let offset = 0; offset < epiphanyPacket.length; offset += 1) {
  epiphanyDenominator *= BigInt(256 - offset);
}
const epiphanyExactProbability =
  Number(epiphanyAssignments) / Number(epiphanyDenominator);
assert.ok(
  Math.abs(epiphanyExactProbability - 0.0000017163194056683395) < 1e-18
);

// Origin/orientation controls for the independently selected phrase.
const epiphanyCyclicExactOffsets = [];
for (let offset = 0; offset < table.length; offset += 1) {
  const candidate = [];
  for (
    let index = epiphanyStart;
    index < epiphanyStart + epiphanyPacket.length;
    index += 1
  ) {
    candidate.push(mod29(
      low60Table[(offset + index) % table.length] -
      index -
      lengths[index]
    ));
  }
  if (epiphanyPacket.every((value, i) => candidate[i] === value)) {
    epiphanyCyclicExactOffsets.push(offset);
  }
}
assert.deepEqual(epiphanyCyclicExactOffsets, [0]);

const epiphanyTraversalHits = [];
for (const traversal of traversals) {
  const tokens = [];
  if (traversal.major === "row") {
    const rowOrder = traversal.reverseMajor
      ? [...grid.rows].reverse()
      : grid.rows;
    for (const row0 of rowOrder) {
      const row = traversal.reverseMinor ? [...row0].reverse() : row0;
      tokens.push(...row);
    }
  } else {
    const columns = Array.from({length: 8}, (_, i) => i);
    const columnOrder = traversal.reverseMajor
      ? [...columns].reverse()
      : columns;
    const rows = Array.from({length: 32}, (_, i) => i);
    const rowOrder = traversal.reverseMinor ? [...rows].reverse() : rows;
    for (const column of columnOrder) {
      for (const row of rowOrder) tokens.push(grid.rows[row][column]);
    }
  }
  const low = tokens.map(token => alpha60.indexOf(token[1]));
  const candidate = [];
  for (
    let index = epiphanyStart;
    index < epiphanyStart + epiphanyPacket.length;
    index += 1
  ) {
    candidate.push(mod29(low[index] - index - lengths[index]));
  }
  if (epiphanyPacket.every((value, i) => candidate[i] === value)) {
    epiphanyTraversalHits.push({
      major: traversal.major,
      reverseMajor: traversal.reverseMajor,
      reverseMinor: traversal.reverseMinor,
    });
  }
}
assert.deepEqual(epiphanyTraversalHits, [{
  major: "row",
  reverseMajor: false,
  reverseMinor: false,
}]);

console.log(JSON.stringify({
  status: "PASS: signed 2016 terminal words map through p50 low digits to p28 DH state",
  formula: "s_i = low60(p50[i]) - i - GP_length(word_i) mod29",
  terminalRows,
  rawTail: tail,
  rawTailLabels: ["-b", "A", "-K", "B", "g", "a", "A"],
  punctuationGroups: {
    goodLuck: {
      raw: goodLuck,
      H: H(goodLuck[0], goodLuck[1]),
      labels: ["a", "p-1"],
    },
    bewareFalsePaths: {
      raw: bewareFalsePaths,
      HOuterAndCenter: [
        ...H(bewareFalsePaths[0], bewareFalsePaths[2]),
        bewareFalsePaths[1],
      ],
      labels: ["p-1", "e", "B"],
    },
    verifyOpenpgp: {
      raw: verifyOpenpgp,
      H: H(verifyOpenpgp[0], verifyOpenpgp[1]),
      labels: ["-K", "-b"],
    },
  },
  familyCharge: {
    modes: modes.length,
    lengthAugmentedModes: modes.length * 2,
    finalSevenModes: final7Modes.length,
    latinLetterFinalSevenModes: latinFinal7Modes.length,
    distinctFinalSevenNumericOutputs: new Set(
      final7Modes.map(mode => mode.tail.join(","))
    ).size,
    modesWithAnySevenRun: anySevenWindowModes.length,
    actualFiveRunStarts: fiveStarts,
    actualSevenRunStarts: sevenStarts,
    exactTailModes: exactTailModes.length,
    cyclicOriginsWithPrimitiveTail: cyclicOrigins
      .filter(row => row.primitive)
      .map(row => row.offset),
    cyclicOriginsWithExactTail: cyclicOrigins
      .filter(row => row.exact)
      .map(row => row.offset),
    sourceTableTraversalsWithPrimitiveTail: traversals
      .filter(row => row.primitive).length,
    sourceTableTraversalsWithExactTail: traversals
      .filter(row => row.exact).length,
  },
  independentEpiphanyTransfer: {
    words: words.slice(epiphanyStart, epiphanyStart + 4),
    raw: epiphanyPacket,
    rawLabels: ["b", "p-1", "p", "b+K"],
    HShell: epiphanyHShell,
    HShellLabels: ["-K", "e", "a-g", "p-g"],
    chargedFamilyHits: epiphanyFamilyHits.length,
    exactTokenAssignments: epiphanyAssignments.toString(),
    exactTokenDenominator: epiphanyDenominator.toString(),
    exactTokenProbability: epiphanyExactProbability,
    cyclicExactOffsets: epiphanyCyclicExactOffsets,
    sourceTraversalHits: epiphanyTraversalHits,
  },
  exactTokenMultisetNull: {
    denominator: denominator.toString(),
    signedPrimitiveAssignments: primitiveAssignments.toString(),
    signedPrimitiveProbability: primitiveProbability,
    exactOrderedAssignments: exactAssignments.toString(),
    exactOrderedProbabilityDiagnostic: exactTailProbability,
  },
  caveat: "Rule discovered after the state and tail were visible; exact ordered probability is diagnostic only.",
}, null, 2));
