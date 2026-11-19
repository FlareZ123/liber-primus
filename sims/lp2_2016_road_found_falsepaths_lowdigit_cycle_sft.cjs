"use strict";

/**
 * SFT: authenticated 2016 ROAD / FOUND / PATHS low-digit cycle.
 *
 * This tests the p50 native-base60 low digit as a state-pointer operation
 * independently of unknown LP2 ciphertext. The same operation already appears
 * in the p28 READ OUT candidate's READ -> OUT -> FIND -> p28 self-closure.
 *
 * Run:
 *   node sims/lp2_2016_road_found_falsepaths_lowdigit_cycle_sft.cjs
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

const table = grid.rows.flat();
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

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

/** @param {string} word */
function gp0(word) {
  return gp(word).reduce((total, value) => total + value, 0);
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

/**
 * @param {string} token
 * @param {string} alphabet
 * @param {"low"|"high"} component
 * @param {0|1} digitOrigin
 */
function componentValue(token, alphabet, component, digitOrigin) {
  const char = component === "low" ? token[1] : token[0];
  const raw = alphabet.indexOf(char);
  return raw < 0 ? null : raw + digitOrigin;
}

const words = signedWords();
assert.equal(words.length, 43);
assert.equal(words[23], "ROAD");
assert.equal(words[35], "FOUND");
assert.equal(words[40], "PATHS");

const roadState = gp0("ROAD");
const pathsState = gp0("PATHS");
const foundState = gp0("FOUND");
assert.equal(roadState, 54);
assert.equal(pathsState, 54);
assert.equal(foundState, 36);

// Positive control: the operation already active in the READ OUT route.
assert.equal(gp0("READ"), 55);
assert.equal(gp0("OUT"), 20);
assert.equal(gp0("FIND"), 42);
assert.equal(table[55], "1K");
assert.equal(table[20], "1g");
assert.equal(table[42], "0S");
assert.equal(alpha60.indexOf(table[55][1]), gp0("OUT"));
assert.equal(alpha60.indexOf(table[20][1]), gp0("FIND"));
assert.equal(alpha60.indexOf(table[42][1]), 28);

// Independent authenticated-source transfer.
assert.equal(table[roadState], "2a");
assert.equal(table[foundState], "0s");
assert.equal(alpha60.indexOf(table[roadState][1]), foundState);
assert.equal(alpha60.indexOf(table[foundState][1]), roadState);

const distinctWords = [...new Set(words)];
assert.equal(distinctWords.length, 34);

const wordsByState = new Map();
for (const word of distinctWords) {
  const state = gp0(word);
  if (!wordsByState.has(state)) wordsByState.set(state, []);
  wordsByState.get(state).push(word);
}
assert.equal(wordsByState.size, 27);
assert.deepEqual(wordsByState.get(36), ["FOUND"]);
assert.deepEqual(wordsByState.get(54), ["ROAD", "PATHS"]);

// Charge the 16 obvious component conventions used in the READ OUT audit.
const modeRows = [];
for (const [radix, alphabet] of [
  ["base60", alpha60],
  ["base59", alpha59],
]) {
  for (const component of ["low", "high"]) {
    for (const addressOrigin of [0, 1]) {
      for (const digitOrigin of [0, 1]) {
        const edges = new Map();
        for (const state of wordsByState.keys()) {
          const address = state + addressOrigin;
          if (address < 0 || address >= table.length) continue;
          const output = componentValue(
            table[address],
            alphabet,
            component,
            digitOrigin
          );
          if (output !== null && wordsByState.has(output)) {
            edges.set(state, output);
          }
        }

        const cycles = [];
        for (const [left, right] of edges) {
          if (left < right && edges.get(right) === left) {
            cycles.push([left, right]);
          }
        }

        modeRows.push({
          radix,
          component,
          addressOrigin,
          digitOrigin,
          edgeCount: edges.size,
          cycles,
        });
      }
    }
  }
}
assert.equal(modeRows.length, 16);

const cycleModes = modeRows.filter(row => row.cycles.length > 0);
assert.deepEqual(cycleModes, [{
  radix: "base60",
  component: "low",
  addressOrigin: 0,
  digitOrigin: 0,
  edgeCount: 7,
  cycles: [[36, 54]],
}]);

// Fixed-pair table-multiset calibration.
const lowCounts = new Map();
for (const token of table) {
  const low = alpha60.indexOf(token[1]);
  lowCounts.set(low, (lowCounts.get(low) || 0) + 1);
}
assert.equal(lowCounts.get(36), 4);
assert.equal(lowCounts.get(54), 8);
const favorable = BigInt(lowCounts.get(36)) * BigInt(lowCounts.get(54));
const denominator = 256n * 255n;
assert.equal(favorable, 32n);
assert.equal(denominator, 65280n);
assert.equal(Number(favorable) / Number(denominator), 1 / 2040);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "independent authenticated-source support for the native base60 low-digit p50 state pointer; no unknown LP2 plaintext recovered",
  source: {
    distinctWords: distinctWords.length,
    distinctGp0States: wordsByState.size,
    state36: wordsByState.get(36),
    state54: wordsByState.get(54),
  },
  cycle: {
    road: roadState,
    paths: pathsState,
    found: foundState,
    p50_54: table[54],
    p50_36: table[36],
    transitions: [[54, 36], [36, 54]],
  },
  conventionCharge: {
    modes: modeRows.length,
    survivingModes: cycleModes,
  },
  fixedPairCalibration: {
    favorable: favorable.toString(),
    denominator: denominator.toString(),
    probability: Number(favorable) / Number(denominator),
  },
}, null, 2));
