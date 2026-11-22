"use strict";

/**
 * SFT: signed-2016 word-direction graph DH-label family gate.
 *
 * Tests whether graph topology prospectively identifies the ordered DH fields,
 * rather than merely containing the already-known DH numbers under a selected
 * feature-to-field assignment.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const modulus = 29;
const alphabet60 = grid.alphabet;
const table = grid.rows.flat();

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @param {number} divisor */
function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

/** @param {string} word */
function gpLength(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  let count = 0;
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      offset += 3;
      count += 1;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      offset += 2;
      count += 1;
      continue;
    }

    const token = gpTokens.find(candidate =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    offset += token.symbol.length;
    count += 1;
  }

  return count;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");

const words = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter(token => /^[A-Za-z]+$/u.test(token))
  .map(word => word.toUpperCase());

assert.equal(words.length, 43);

const wordLengths = words.map(gpLength);

/**
 * @typedef {{
 *   cycles: number[][],
 *   rows: {depth:number, entry:number, cycleKey:string}[],
 *   maxDepth: number,
 *   depthHistogram: number[],
 *   basins: {cycle:number[], size:number, maxDepth:number}[],
 *   commonCycleLength: number|null
 * }} Topology
 */

/**
 * @param {string[]} tokens
 * @returns {Topology}
 */
function directionTopology(tokens) {
  const next = words.map((word, index) => {
    void word;
    const low = alphabet60.indexOf(tokens[index][1]);
    assert.ok(low >= 0);
    return mod(low - index - wordLengths[index], modulus);
  });

  const cycles = [];
  const cycleKeys = new Set();
  const rows = [];

  for (let start = 0; start < words.length; start += 1) {
    const order = [];
    const position = new Map();
    let cursor = start;

    while (!position.has(cursor)) {
      position.set(cursor, order.length);
      order.push(cursor);
      cursor = next[cursor];
    }

    const cycle = order.slice(position.get(cursor));
    const rotations = cycle.map((unused, offset) => {
      void unused;
      return cycle.slice(offset).concat(cycle.slice(0, offset));
    });
    rotations.sort((left, right) =>
      left.join(",").localeCompare(right.join(","))
    );
    const canonical = rotations[0];
    const key = canonical.join(",");

    if (!cycleKeys.has(key)) {
      cycleKeys.add(key);
      cycles.push(canonical);
    }

    rows.push({
      depth: position.get(cursor),
      entry: cursor,
      cycleKey: key,
    });
  }

  cycles.sort((left, right) =>
    left.join(",").localeCompare(right.join(","))
  );

  const maxDepth = Math.max(...rows.map(row => row.depth));
  const depthHistogram = Array.from(
    {length: maxDepth + 1},
    (unused, depth) => {
      void unused;
      return rows.filter(row => row.depth === depth).length;
    }
  );

  const basins = cycles
    .map(cycle => {
      const key = cycle.join(",");
      const members = rows.filter(row => row.cycleKey === key);
      return {
        cycle,
        size: members.length,
        maxDepth: Math.max(...members.map(row => row.depth)),
      };
    })
    .sort((left, right) =>
      right.size - left.size ||
      left.cycle.join(",").localeCompare(right.cycle.join(","))
    );

  const commonCycleLength =
    cycles.length > 0 &&
    cycles.every(cycle => cycle.length === cycles[0].length)
      ? cycles[0].length
      : null;

  return {
    cycles,
    rows,
    maxDepth,
    depthHistogram,
    basins,
    commonCycleLength,
  };
}

/** @param {number} value */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

/** @param {number} base @param {number} exponent @param {number} divisor */
function modPow(base, exponent, divisor) {
  let result = 1 % divisor;
  let value = mod(base, divisor);
  let power = exponent;

  while (power > 0) {
    if (power % 2 === 1) result = (result * value) % divisor;
    value = (value * value) % divisor;
    power = Math.floor(power / 2);
  }

  return result;
}

/** @param {number} value @param {number} divisor */
function multiplicativeInverse(value, divisor) {
  for (let candidate = 1; candidate < divisor; candidate += 1) {
    if ((value * candidate) % divisor === 1) return candidate;
  }
  return null;
}

/** @param {number} generator @param {number} prime */
function multiplicativeOrder(generator, prime) {
  let value = 1;
  for (let exponent = 1; exponent < prime; exponent += 1) {
    value = (value * generator) % prime;
    if (value === 1) return exponent;
  }
  return null;
}

/**
 * @param {{K:number,e:number,a:number,g:number,p:number,b:number}} state
 */
function isIntrinsicDhState(state) {
  const {K, e, a, g, p, b} = state;
  if (!isPrime(p)) return false;
  if (!(1 < g && g < p)) return false;
  if (multiplicativeOrder(g, p) !== p - 1) return false;
  if (!(1 <= a && a <= p - 2)) return false;
  if (!(1 <= b && b <= p - 2)) return false;
  if (!(1 <= K && K < p)) return false;
  if (multiplicativeInverse(b, p - 1) !== e) return false;
  return modPow(g, a * b, p) === K;
}

/** @param {number[]} values */
function permutations(values) {
  const output = [];

  /** @param {number} offset */
  function visit(offset) {
    if (offset === values.length) {
      output.push([...values]);
      return;
    }

    for (let index = offset; index < values.length; index += 1) {
      [values[offset], values[index]] = [values[index], values[offset]];
      visit(offset + 1);
      [values[offset], values[index]] = [values[index], values[offset]];
    }
  }

  visit(0);
  return output;
}

/**
 * The narrow family exactly matches the six topology slots originally used
 * for the published topology->DH assignment. The field order is K,e,a,g,p,b.
 *
 * @param {Topology} topology
 */
function narrowAssignments(topology) {
  if (
    topology.commonCycleLength === null ||
    topology.basins.length < 2
  ) {
    return [];
  }

  const values = [
    topology.cycles.length,
    topology.commonCycleLength,
    topology.cycles.reduce((sum, cycle) => sum + cycle.length, 0),
    topology.maxDepth,
    modulus - topology.cycles.reduce((sum, cycle) => sum + cycle.length, 0),
    modulus - topology.basins.at(-1).size,
  ];

  return permutations(values)
    .map(candidate => ({
      K: candidate[0],
      e: candidate[1],
      a: candidate[2],
      g: candidate[3],
      p: candidate[4],
      b: candidate[5],
    }))
    .filter(isIntrinsicDhState);
}

/**
 * Build the conservative broader family used for the anti-postselection gate.
 * It admits only global topology scalars and the same unary 29-x complement
 * already used in the published p and b assignments.
 *
 * @param {Topology} topology
 * @returns {Map<number,string[]>}
 */
function simpleExpressionPool(topology) {
  const raw = [
    ["cycle_count", topology.cycles.length],
    [
      "total_cycle_nodes",
      topology.cycles.reduce((sum, cycle) => sum + cycle.length, 0),
    ],
    ["max_tail_depth", topology.maxDepth],
  ];

  if (topology.commonCycleLength !== null) {
    raw.push(["common_cycle_length", topology.commonCycleLength]);
  }

  if (topology.basins.length > 0) {
    raw.push(["basin_large_size", topology.basins[0].size]);
    raw.push(["basin_small_size", topology.basins.at(-1).size]);
    raw.push(["basin_large_maxdepth", topology.basins[0].maxDepth]);
    raw.push(["basin_small_maxdepth", topology.basins.at(-1).maxDepth]);
  }

  topology.depthHistogram.forEach((value, depth) => {
    raw.push(["depth[" + depth + "]", value]);
  });

  const byValue = new Map();

  /** @param {number} value @param {string} expression */
  function add(value, expression) {
    if (!byValue.has(value)) byValue.set(value, []);
    byValue.get(value).push(expression);
  }

  for (const [name, value] of raw) {
    add(value, name);
    if (0 <= value && value <= modulus) {
      add(modulus - value, modulus + "-" + name);
    }
  }

  return byValue;
}

/** @param {number} count @param {number} take */
function fallingFactorial(count, take) {
  let result = 1;
  for (let index = 0; index < take; index += 1) {
    result *= count - index;
  }
  return result;
}

/**
 * Count distinct source-expression assignments for an ordered numeric tuple.
 * One expression cannot be reused for two fields.
 *
 * @param {number[]} tuple K,e,a,g,p,b
 * @param {Map<number,string[]>} pool
 */
function provenanceWays(tuple, pool) {
  const multiplicity = new Map();
  for (const value of tuple) {
    multiplicity.set(value, (multiplicity.get(value) || 0) + 1);
  }

  let ways = 1;
  for (const [value, count] of multiplicity) {
    const available = (pool.get(value) || []).length;
    if (available < count) return 0;
    ways *= fallingFactorial(available, count);
  }

  return ways;
}

/**
 * @param {Map<number,string[]>} pool
 */
function broadDhStates(pool) {
  const values = [...pool.keys()]
    .filter(value =>
      Number.isInteger(value) &&
      0 <= value &&
      value <= modulus
    )
    .sort((left, right) => left - right);

  const valueSet = new Set(values);
  const states = [];
  let provenance = 0;

  for (const p of values) {
    if (!isPrime(p) || p < 3) continue;

    for (const g of values) {
      if (!(1 < g && g < p)) continue;
      if (multiplicativeOrder(g, p) !== p - 1) continue;

      for (const b of values) {
        if (!(1 <= b && b <= p - 2)) continue;
        const e = multiplicativeInverse(b, p - 1);
        if (e === null || !valueSet.has(e)) continue;

        for (const a of values) {
          if (!(1 <= a && a <= p - 2)) continue;
          const K = modPow(g, a * b, p);
          if (!(1 <= K && K < p) || !valueSet.has(K)) continue;

          const tuple = [K, e, a, g, p, b];
          const ways = provenanceWays(tuple, pool);
          if (ways === 0) continue;

          states.push({K, e, a, g, p, b, ways});
          provenance += ways;
        }
      }
    }
  }

  return {states, provenance};
}

/**
 * @param {"row"|"col"} major
 * @param {boolean} reverseMajor
 * @param {boolean} reverseMinor
 */
function traverseTable(major, reverseMajor, reverseMinor) {
  const rowCount = grid.rows.length;
  const columnCount = grid.rows[0].length;
  const output = [];

  if (major === "row") {
    const majors = Array.from({length: rowCount}, (unused, index) => {
      void unused;
      return index;
    });
    if (reverseMajor) majors.reverse();

    for (const row of majors) {
      const minors = Array.from({length: columnCount}, (unused, index) => {
        void unused;
        return index;
      });
      if (reverseMinor) minors.reverse();
      for (const column of minors) output.push(grid.rows[row][column]);
    }
  } else {
    const majors = Array.from({length: columnCount}, (unused, index) => {
      void unused;
      return index;
    });
    if (reverseMajor) majors.reverse();

    for (const column of majors) {
      const minors = Array.from({length: rowCount}, (unused, index) => {
        void unused;
        return index;
      });
      if (reverseMinor) minors.reverse();
      for (const row of minors) output.push(grid.rows[row][column]);
    }
  }

  return output;
}

const observedTopology = directionTopology(table.slice(0, words.length));
assert.deepEqual(observedTopology.cycles, [[0, 18, 23], [22, 6, 24]]);
assert.equal(observedTopology.commonCycleLength, 3);
assert.equal(observedTopology.maxDepth, 5);
assert.deepEqual(observedTopology.depthHistogram, [6, 10, 10, 6, 7, 4]);
assert.deepEqual(observedTopology.basins.map(basin => basin.size), [29, 14]);

const narrowObserved = narrowAssignments(observedTopology);
assert.deepEqual(narrowObserved, [{
  K: 2,
  e: 3,
  a: 6,
  g: 5,
  p: 23,
  b: 15,
}]);

const targetTuple = [2, 3, 6, 5, 23, 15];
const observedPool = simpleExpressionPool(observedTopology);
const observedBroad = broadDhStates(observedPool);
const targetWays = provenanceWays(targetTuple, observedPool);

assert.equal(targetWays, 18);
assert.equal(observedBroad.states.length, 161);
assert.equal(observedBroad.provenance, 1736);

const targetExpressions = Object.fromEntries(
  targetTuple.map(value => [
    value,
    observedPool.get(value),
  ])
);

assert.deepEqual(targetExpressions, {
  2: ["cycle_count"],
  3: ["common_cycle_length"],
  5: ["max_tail_depth", "basin_large_maxdepth"],
  6: ["total_cycle_nodes", "depth[0]", "depth[3]"],
  15: ["29-basin_small_size"],
  23: ["29-total_cycle_nodes", "29-depth[0]", "29-depth[3]"],
});

const originRows = [];
for (let origin = 0; origin < table.length; origin += 1) {
  const tokens = Array.from(
    {length: words.length},
    (unused, index) => {
      void unused;
      return table[(origin + index) % table.length];
    }
  );
  const topology = directionTopology(tokens);
  const pool = simpleExpressionPool(topology);
  const broad = broadDhStates(pool);

  originRows.push({
    origin,
    narrowCount: narrowAssignments(topology).length,
    targetWays: provenanceWays(targetTuple, pool),
    broadTupleCount: broad.states.length,
    broadProvenance: broad.provenance,
  });
}

assert.deepEqual(
  originRows
    .filter(row => row.narrowCount > 0)
    .map(row => [row.origin, row.narrowCount]),
  [[0, 1]]
);

assert.deepEqual(
  originRows
    .filter(row => row.targetWays > 0)
    .map(row => [row.origin, row.targetWays]),
  [[0, 18], [98, 4], [105, 8], [209, 4], [250, 2], [255, 16]]
);

const traversals = [];
for (const major of ["row", "col"]) {
  for (const reverseMajor of [false, true]) {
    for (const reverseMinor of [false, true]) {
      const tokens = traverseTable(major, reverseMajor, reverseMinor);
      const topology = directionTopology(tokens.slice(0, words.length));
      traversals.push({
        major,
        reverseMajor,
        reverseMinor,
        targetWays: provenanceWays(
          targetTuple,
          simpleExpressionPool(topology)
        ),
      });
    }
  }
}

assert.deepEqual(
  traversals.filter(row => row.targetWays > 0),
  [{
    major: "row",
    reverseMajor: false,
    reverseMinor: false,
    targetWays: 18,
  }]
);

// The mapping family is frozen above. Only now open the independent source
// consequence: direct zero-based word positions in the authenticated message.
const directState = {
  K: words.indexOf("PATH"),
  e: words.indexOf("LIES"),
  a: words.indexOf("SEEKS"),
  g: words.indexOf("EPIPHANY"),
  p: words.indexOf("ROAD"),
  b: words.indexOf("WORDS"),
  A: words.indexOf("DEVOTED"),
  B: words.indexOf("THEIR"),
  q: words.indexOf("EMPTY"),
  modulus: words.indexOf("DIRECTION"),
};

assert.deepEqual(directState, {
  K: 2,
  e: 3,
  a: 6,
  g: 5,
  p: 23,
  b: 15,
  A: 8,
  B: 19,
  q: 4,
  modulus: 29,
});

assert.equal(modPow(directState.g, directState.a, directState.p), directState.A);
assert.equal(modPow(directState.g, directState.b, directState.p), directState.B);
assert.equal(
  modPow(directState.A, directState.b, directState.p),
  directState.K
);
assert.equal(
  modPow(directState.B, directState.a, directState.p),
  directState.K
);
assert.equal(
  mod(directState.b * directState.e, directState.p - 1),
  1
);

const broadDirectMatches = observedBroad.states.filter(state =>
  state.K === directState.K &&
  state.e === directState.e &&
  state.a === directState.a &&
  state.g === directState.g &&
  state.p === directState.p &&
  state.b === directState.b
);

assert.equal(broadDirectMatches.length, 1);
assert.equal(broadDirectMatches[0].ways, 18);

console.log(JSON.stringify({
  status: "PASS",
  classification:
    "negative topology-label provenance gate; positive independent numeric-state holdout",
  graph: {
    cycles: observedTopology.cycles,
    commonCycleLength: observedTopology.commonCycleLength,
    totalCycleNodes: observedTopology.cycles
      .reduce((sum, cycle) => sum + cycle.length, 0),
    maxTailDepth: observedTopology.maxDepth,
    depthHistogram: observedTopology.depthHistogram,
    basinSizes: observedTopology.basins.map(basin => basin.size),
  },
  narrowSixSlotFamily: {
    validAssignments: narrowObserved,
    cyclicOriginsWithAnyValidAssignment: originRows
      .filter(row => row.narrowCount > 0)
      .map(row => [row.origin, row.narrowCount]),
  },
  broadGlobalSimpleFamily: {
    targetTuple,
    targetProvenanceWays: targetWays,
    targetExpressions,
    dhValidNumericTuples: observedBroad.states.length,
    dhValidProvenanceAssignments: observedBroad.provenance,
    cyclicOriginsContainingTarget: originRows
      .filter(row => row.targetWays > 0)
      .map(row => [row.origin, row.targetWays]),
    traversalTargetHits: traversals.filter(row => row.targetWays > 0),
  },
  sealedSourceHoldout: {
    directState,
    matchingNumericTuples: broadDirectMatches.length,
    survivingTopologyProvenanceAliases: broadDirectMatches[0].ways,
  },
  decision:
    "The direct signed-word positions independently fix the numeric DH tuple, but they cannot choose among the 18 equally simple topology-expression aliases for that tuple. Any receiver consuming only DH field values is identical under all 18 aliases. Topology therefore remains corroborating structure rather than independent field provenance.",
}, null, 2));
