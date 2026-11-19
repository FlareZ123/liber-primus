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


// The source prose itself orders the cycle terms as ROAD, then FOUND, then
// PATHS in successive clue-bearing clauses. Under the frozen pointer this is
// ROAD -> FOUND -> PATHS -> FOUND, making PATHS a literal two-state trap.
assert.equal(words[23], "ROAD");
assert.equal(words[35], "FOUND");
assert.equal(words[40], "PATHS");
assert.equal(
  alpha60.indexOf(table[gp0("ROAD")][1]),
  gp0("FOUND")
);
assert.equal(
  alpha60.indexOf(table[gp0("FOUND")][1]),
  gp0("PATHS")
);
assert.equal(
  alpha60.indexOf(table[gp0("PATHS")][1]),
  gp0("FOUND")
);

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

// Stronger authenticated relation route. Charge ten obvious semantic pairs
// from the signed source, including the three parallel noun relations
// WORDS/MAP, MEANING/ROAD and NUMBERS/DIRECTION, across the same 16 modes.
// A hit requires the two source terms to converge after one pointer step and
// the shared pre-cycle path to contain FIND(42) -> p28.
const relationPairs = [
  ["PATH", "EMPTY"],
  ["EPIPHANY", "DEVOTED"],
  ["LIBERPRIMUS", "WAY"],
  ["WORDS", "MAP"],
  ["MEANING", "ROAD"],
  ["NUMBERS", "DIRECTION"],
  ["SEEK", "FOUND"],
  ["GOOD", "LUCK"],
  ["FALSE", "PATHS"],
  ["VERIFY", "OPENPGP"],
];

function stepForMode(mode, state) {
  const alphabet = mode.radix === "base60" ? alpha60 : alpha59;
  const address = state + mode.addressOrigin;
  if (address < 0 || address >= table.length) return null;
  return componentValue(
    table[address],
    alphabet,
    mode.component,
    mode.digitOrigin
  );
}

function traceUntilRepeat(mode, start) {
  const output = [start];
  const seen = new Set(output);
  let state = start;
  while (true) {
    const next = stepForMode(mode, state);
    if (next === null || seen.has(next)) return output;
    output.push(next);
    seen.add(next);
    state = next;
  }
}

const relationRouteHits = [];
for (const mode of modeRows) {
  for (const [leftWord, rightWord] of relationPairs) {
    const left = stepForMode(mode, gp0(leftWord));
    const right = stepForMode(mode, gp0(rightWord));
    if (left === null || left !== right) continue;

    const path = traceUntilRepeat(mode, left);
    const hasFindTo28 = path.some((state, index) =>
      state === gp0("FIND") && path[index + 1] === 28
    );
    if (!hasFindTo28) continue;

    relationRouteHits.push({
      radix: mode.radix,
      component: mode.component,
      addressOrigin: mode.addressOrigin,
      digitOrigin: mode.digitOrigin,
      relation: [leftWord, rightWord],
      firstState: left,
      path,
    });
  }
}

assert.deepEqual(relationRouteHits, [{
  radix: "base60",
  component: "low",
  addressOrigin: 0,
  digitOrigin: 0,
  relation: ["NUMBERS", "DIRECTION"],
  firstState: 13,
  path: [13, 4, 37, 20, 42, 28, 30, 21, 17, 22, 59, 9],
}]);


// Physical-table self-reference. The original 32x8 table spans LP2 p49-p51
// as 10 / 13 / 9 rows; p50 is the rune-free middle page. Among the ten
// charged semantic pairs, NUMBERS/DIRECTION is uniquely the pair whose two
// GP0 addresses both lie on p50 and whose printed two-character cells share
// their right-hand character. That character is D, native-base60 value13.
assert.deepEqual(grid.original_scans, ["66.jpg", "67.jpg", "68.jpg"]);
assert.deepEqual(grid.lp2_pages, [49, 50, 51]);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
const middleStart = grid.page_row_counts[0] * 8;
const middleEnd = middleStart + grid.page_row_counts[1] * 8;
assert.deepEqual([middleStart, middleEnd], [80, 184]);

const physicalRelationRows = relationPairs.map(([leftWord, rightWord]) => {
  const left = gp0(leftWord);
  const right = gp0(rightWord);
  return {
    relation: [leftWord, rightWord],
    addresses: [left, right],
    tokens: [table[left], table[right]],
    bothOnP50:
      left >= middleStart && left < middleEnd &&
      right >= middleStart && right < middleEnd,
    sameRight: table[left][1] === table[right][1],
  };
});
assert.deepEqual(
  physicalRelationRows.filter(row => row.bothOnP50 && row.sameRight),
  [{
    relation: ["NUMBERS", "DIRECTION"],
    addresses: [83, 112],
    tokens: ["3D", "1D"],
    bothOnP50: true,
    sameRight: true,
  }]
);
assert.equal(alpha60.indexOf("D"), 13);
assert.equal(grid.page_row_counts[1], 13);

// The source-only direction route joins the READ OUT route at OUT=20 and then
// shares FIND=42 -> physical p28.
assert.equal(gp0("NUMBERS"), 83);
assert.equal(gp0("DIRECTION"), 112);
assert.deepEqual(
  [83, 112, 13, 4, 37, 20, 42].map(state =>
    alpha60.indexOf(table[state][1])
  ),
  [13, 13, 4, 37, 20, 42, 28]
);


// Independent p28-local checkpoint transfer. HERE is recovered by the frozen
// outer-H page-start mechanism in a separate SFT. Once available, its GP0 state
// enters the same source-selected state-13 tail without introducing a new
// pointer rule.
assert.equal(gp0("HERE"), 48);
assert.equal(table[48], "4D");
assert.equal(alpha60.indexOf(table[48][1]), 13);

// Fixed seven-cell table-multiset calibration for the complete route.
const routeOutputs = [13, 13, 4, 37, 20, 42, 28];
const routeLowCounts = new Map();
for (const token of table) {
  const low = alpha60.indexOf(token[1]);
  routeLowCounts.set(low, (routeLowCounts.get(low) || 0) + 1);
}
const usedOutputs = new Map();
let routeFavorable = 1n;
for (const output of routeOutputs) {
  const used = usedOutputs.get(output) || 0;
  routeFavorable *= BigInt(routeLowCounts.get(output) - used);
  usedOutputs.set(output, used + 1);
}
let routeDenominator = 1n;
for (let index = 0; index < routeOutputs.length; index += 1) {
  routeDenominator *= BigInt(256 - index);
}
assert.equal(routeFavorable, 88000n);
assert.equal(routeDenominator, 66335904391680000n);

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
  sourceOrderTrap: {
    printedWords: [
      {index: 23, word: words[23]},
      {index: 35, word: words[35]},
      {index: 40, word: words[40]},
    ],
    states: [gp0("ROAD"), gp0("FOUND"), gp0("PATHS"), gp0("FOUND")],
  },
  hereTransfer: {
    gp0: gp0("HERE"),
    token: table[gp0("HERE")],
    nextState: alpha60.indexOf(table[gp0("HERE")][1]),
  },
  physicalTableSelector: {
    p50AddressRange: [middleStart, middleEnd],
    p50Rows: grid.page_row_counts[1],
    relationHits: physicalRelationRows.filter(
      row => row.bothOnP50 && row.sameRight
    ),
    sharedRightDigitValue: alpha60.indexOf("D"),
  },
  directionRoute: {
    relationHits: relationRouteHits,
    fixedRouteFavorable: routeFavorable.toString(),
    fixedRouteDenominator: routeDenominator.toString(),
    fixedRouteProbability:
      Number(routeFavorable) / Number(routeDenominator),
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
