"use strict";

/**
 * SFT: solved p57 words as a typed grammar on the original base60 p50
 * pointer graph and the complete rooted in-tree at cycle state 115.
 *
 * Strongest source relation:
 *   GP0(SHED)=64; SHED has four GP runes;
 *   T^4(64)=115; the rooted 115 component has 131 cells;
 *   GP0(CIRCUMFERENCES)=131.
 *
 * Windows Node 22:
 *   node sims/lp2_p57_p50_tree_word_grammar_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const table = grid.byte_rows.flat();

const cycle = [0,203,68,199,47,76,114,197,115,247,192];
const cycleSet = new Set(cycle);

const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/**
 * Canonical GP values for one Latin word.
 * @param {string} word
 * @returns {number[]}
 */
function gpValues(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");

  const values = [];
  let offset = 0;
  while (offset < normalized.length) {
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
    assert.ok(token, "unmapped GP spelling " + word + " at " + offset);
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} word @returns {number} */
function gp0(word) {
  return gpValues(word).reduce((sum, value) => sum + value, 0);
}

/**
 * @param {number} start
 * @param {number} steps
 * @returns {number[]}
 */
function walk(start, steps) {
  const route = [start];
  let state = start;
  for (let step = 0; step < steps; step += 1) {
    state = table[state];
    route.push(state);
  }
  return route;
}

const p57Words = (
  "PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN " +
  "CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE"
).split(" ");

const p57Values = p57Words.flatMap(gpValues);
const p57Corpus = corpus.pages.find((page) => page.page === 57);
assert.ok(p57Corpus);
assert.deepEqual(p57Values, p57Corpus.indices);

const reverse = Array.from({ length: 256 }, () => []);
for (let source = 0; source < 256; source += 1) {
  reverse[table[source]].push(source);
}

/**
 * Complete attached rooted in-tree at a main-cycle node, including root.
 * @param {number} rootNode
 * @returns {{nodes:number[],depth:Map<number,number>}}
 */
function rootedTree(rootNode) {
  const nodes = [];
  const depth = new Map([[rootNode, 0]]);
  const queue = [rootNode];

  while (queue.length > 0) {
    const node = queue.shift();
    assert.notEqual(node, undefined);
    nodes.push(node);

    for (const predecessor of reverse[node]) {
      if (cycleSet.has(predecessor)) continue;
      if (depth.has(predecessor)) continue;
      depth.set(predecessor, depth.get(node) + 1);
      queue.push(predecessor);
    }
  }

  return { nodes, depth };
}

const rooted = new Map(cycle.map((rootNode) => [rootNode, rootedTree(rootNode)]));
const rootedSizes = new Map(
  [...rooted.entries()].map(([rootNode, tree]) => [rootNode, tree.nodes.length])
);

assert.deepEqual(
  cycle.map((rootNode) => rootedSizes.get(rootNode)),
  [3,1,2,13,2,59,23,3,131,2,13]
);

const shedValues = gpValues("SHED");
assert.deepEqual(shedValues.length, 4);
assert.equal(gp0("SHED"), 64);
const shedRoute = walk(gp0("SHED"), shedValues.length);
assert.deepEqual(shedRoute, [64,122,86,111,115]);
assert.equal(shedRoute.at(-1), 115);
assert.equal(rootedSizes.get(115), 131);
assert.equal(gp0("CIRCUMFERENCES"), 131);

const theRoute = walk(gp0("THE"), gpValues("THE").length);
assert.deepEqual(theRoute, [20,102,32]);

/**
 * For a source word, walk its own GP0 for its own GP-rune count.
 * If the endpoint is a main-cycle root, expose that root's component size.
 * @param {string} word
 * @returns {{word:string,gp0:number,runes:number,endpoint:number,componentSize:number|null}}
 */
function ownLengthEndpoint(word) {
  const values = gpValues(word);
  const route = walk(values.reduce((sum, value) => sum + value, 0), values.length);
  const endpoint = route.at(-1);
  return {
    word,
    gp0: values.reduce((sum, value) => sum + value, 0),
    runes: values.length,
    endpoint,
    componentSize: rootedSizes.get(endpoint) || null,
  };
}

const p57Unique = [...new Set(p57Words)];
const p57ByGp0 = new Map();
for (const word of p57Unique) {
  const value = gp0(word);
  if (!p57ByGp0.has(value)) p57ByGp0.set(value, []);
  p57ByGp0.get(value).push(word);
}

const p57ComponentWordMatches = [];
for (const sourceWord of p57Unique) {
  const endpoint = ownLengthEndpoint(sourceWord);
  if (!endpoint.componentSize) continue;
  const targets = p57ByGp0.get(endpoint.componentSize);
  if (!targets) continue;
  p57ComponentWordMatches.push({ ...endpoint, targets });
}

assert.deepEqual(p57ComponentWordMatches, [{
  word: "SHED",
  gp0: 64,
  runes: 4,
  endpoint: 115,
  componentSize: 131,
  targets: ["CIRCUMFERENCES"],
}]);

const signedClear = signed2016.match(
  /Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u
);
assert.ok(signedClear);
const signedWords = [...new Set(
  (signedClear[1].match(/\b[A-Za-z]+\b/gu) || []).map((word) => word.toUpperCase())
)];

const authenticatedVocabulary = [...new Set([...signedWords, ...p57Unique])];
const authByGp0 = new Map();
for (const word of authenticatedVocabulary) {
  const value = gp0(word);
  if (!authByGp0.has(value)) authByGp0.set(value, []);
  authByGp0.get(value).push(word);
}

const authenticatedComponentWordMatches = [];
for (const sourceWord of authenticatedVocabulary) {
  const endpoint = ownLengthEndpoint(sourceWord);
  if (!endpoint.componentSize) continue;
  const targets = authByGp0.get(endpoint.componentSize);
  if (!targets) continue;
  authenticatedComponentWordMatches.push({ ...endpoint, targets });
}

assert.deepEqual(authenticatedComponentWordMatches, [
  { word:"ARE", gp0:46, runes:3, endpoint:76, componentSize:59, targets:["VERIFY"] },
  { word:"SURFACE", gp0:67, runes:7, endpoint:76, componentSize:59, targets:["VERIFY"] },
  { word:"SHED", gp0:64, runes:4, endpoint:115, componentSize:131, targets:["CIRCUMFERENCES"] },
]);

const tree115 = rooted.get(115);
assert.ok(tree115);
const depthHistogram = Array(25).fill(0);
for (const depth of tree115.depth.values()) depthHistogram[depth] += 1;
assert.deepEqual(depthHistogram, [
  1,2,4,7,9,7,13,10,8,10,7,4,6,5,6,6,3,3,4,4,3,3,3,2,1,
]);

let cumulativeIncludingRoot = 0;
const prefixRows = [];
for (let depth = 0; depth < depthHistogram.length; depth += 1) {
  cumulativeIncludingRoot += depthHistogram[depth];
  prefixRows.push({
    depth,
    includingRoot: cumulativeIncludingRoot,
    nonroot: cumulativeIncludingRoot - 1,
  });
}

assert.equal(prefixRows[6].nonroot, gp0("FIND"));
assert.equal(prefixRows[7].includingRoot, gp0("LIKE"));
assert.equal(prefixRows[10].includingRoot, gp0("INSTAR"));
assert.equal(prefixRows[15].includingRoot, gp0("DIVINITY"));
assert.equal(prefixRows[20].nonroot, gp0("EPIPHANY"));
assert.equal(prefixRows[24].includingRoot, gp0("CIRCUMFERENCES"));

// Secondary exact split inside the depth-20 EPIPHANY receiver.
// Root115 has children32 and111. The 111 branch is complete by depth20;
// the 32 branch is truncated only beyond depth20.
const selectedDepth20 = new Set(
  [...tree115.depth.entries()]
    .filter(([, depth]) => depth <= 20)
    .map(([node]) => node)
);
const children115 = reverse[115].filter((node) => !cycleSet.has(node)).sort((a,b)=>a-b);
assert.deepEqual(children115, [32,111]);

/**
 * @param {number} child
 * @param {Set<number>} allowed
 * @returns {number}
 */
function subtreeCount(child, allowed) {
  let count = 0;
  const queue = [child];
  const seen = new Set([child]);
  while (queue.length > 0) {
    const node = queue.shift();
    assert.notEqual(node, undefined);
    if (!allowed.has(node)) continue;
    count += 1;
    for (const predecessor of reverse[node]) {
      if (cycleSet.has(predecessor) || seen.has(predecessor)) continue;
      seen.add(predecessor);
      queue.push(predecessor);
    }
  }
  return count;
}

const selectedDepth15 = new Set(
  [...tree115.depth.entries()]
    .filter(([, depth]) => depth <= 15)
    .map(([node]) => node)
);
const completeTreeNodes = new Set(tree115.nodes);

const branch32Full = subtreeCount(32, completeTreeNodes);
const branch111Full = subtreeCount(111, completeTreeNodes);
const branch32Depth15 = subtreeCount(32, selectedDepth15);
const branch111Depth15 = subtreeCount(111, selectedDepth15);
const branch32Depth20 = subtreeCount(32, selectedDepth20);
const branch111Depth20 = subtreeCount(111, selectedDepth20);

assert.deepEqual(
  {
    branch32Full,
    branch111Full,
    branch32Depth15,
    branch111Depth15,
    branch32Depth20,
    branch111Depth20,
  },
  {
    branch32Full:93,
    branch111Full:37,
    branch32Depth15:67,
    branch111Depth15:37,
    branch32Depth20:84,
    branch111Depth20:37,
  }
);

// The complete rooted p32 branch plus root is TUNNELING; the sibling branch
// plus root is WITHIN. They cover the whole CIRCUMFERENCES tree with the root
// counted in both descriptions.
assert.equal(1 + branch32Full, gp0("TUNNELING"));
assert.equal(1 + branch111Full, gp0("WITHIN"));
assert.equal(
  gp0("TUNNELING") + gp0("WITHIN") - 1,
  gp0("CIRCUMFERENCES")
);

// At DH private exponent b=15, the p32 branch itself is SURFACE and the
// complementary rooted sibling object is WITHIN, exactly partitioning
// DIVINITY=105.
assert.equal(branch32Depth15, gp0("SURFACE"));
assert.equal(branch111Depth15, branch111Full);
assert.equal(
  gp0("SURFACE") + gp0("WITHIN"),
  gp0("DIVINITY")
);

// At the authenticated THE=20 cut, the 83 descendants below physical p32
// equal EMERGE. The selected nonroot receiver minus the p32 node itself is
// PARABLE=120. Swapping the distinguished p32 node for root115 turns the
// same 120-node remainder into WITHIN+EMERGE=EPIPHANY by cardinality.
const belowP32Depth20 = branch32Depth20 - 1;
const selectedMinusRootAndP32 = branch111Depth20 + belowP32Depth20;
assert.equal(belowP32Depth20, gp0("EMERGE"));
assert.equal(selectedMinusRootAndP32, gp0("PARABLE"));
assert.equal(1 + branch111Depth20, gp0("WITHIN"));
assert.equal(gp0("WITHIN") + gp0("EMERGE"), gp0("EPIPHANY"));

console.log(JSON.stringify({
  status: "PASS",
  p57PrimaryGrammar: {
    SHED: {
      gp0: gp0("SHED"),
      runes: gpValues("SHED").length,
      route: shedRoute,
      endpointRoot: 115,
    },
    CIRCUMFERENCES: gp0("CIRCUMFERENCES"),
    root115ComponentSize: rootedSizes.get(115),
    THE: {
      gp0: gp0("THE"),
      runes: gpValues("THE").length,
      route: theRoute,
    },
    p57ComponentWordMatches,
    authenticatedComponentWordMatches,
  },
  tree115: {
    depthHistogram,
    sourceWordPrefixIdentities: {
      depth6Nonroot_FIND: prefixRows[6].nonroot,
      depth7IncludingRoot_LIKE: prefixRows[7].includingRoot,
      depth10IncludingRoot_INSTAR: prefixRows[10].includingRoot,
      depth15IncludingRoot_DIVINITY: prefixRows[15].includingRoot,
      depth20Nonroot_EPIPHANY: prefixRows[20].nonroot,
      depth24IncludingRoot_CIRCUMFERENCES: prefixRows[24].includingRoot,
    },
    semanticBranchGrammar: {
      complete: {
        branch32: branch32Full,
        branch111: branch111Full,
        TUNNELING: gp0("TUNNELING"),
        WITHIN: gp0("WITHIN"),
        CIRCUMFERENCES: gp0("CIRCUMFERENCES"),
      },
      depth15: {
        branch32: branch32Depth15,
        branch111: branch111Depth15,
        SURFACE: gp0("SURFACE"),
        WITHIN: gp0("WITHIN"),
        DIVINITY: gp0("DIVINITY"),
      },
      depth20: {
        branch32: branch32Depth20,
        branch111: branch111Depth20,
        belowP32: belowP32Depth20,
        PARABLE: gp0("PARABLE"),
        WITHIN: gp0("WITHIN"),
        EMERGE: gp0("EMERGE"),
        EPIPHANY: gp0("EPIPHANY"),
      },
    },
  },
  decision:
    "Solved p57 supplies a typed graph instruction: SHED's own GP0/rune-count walk lands root115, whose complete tree is CIRCUMFERENCES=131. The same tree has exact branch cardinalities TUNNELING/WITHIN at full depth, SURFACE+WITHIN=DIVINITY at depth15, and PARABLE/WITHIN/EMERGE/EPIPHANY relations at the THE=20 cut. These are structural constraints rather than recovered p32 plaintext.",
}, null, 2));
