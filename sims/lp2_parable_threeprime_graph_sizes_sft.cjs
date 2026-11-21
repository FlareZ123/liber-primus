"use strict";

/**
 * Source-selected 2013 PARABLE prime ordinals -> original LP2 256-cell
 * functional-graph ancestor sizes. Exact source and token-multiset control.
 *
 * The three size comparisons were recognized after the graph was inspected;
 * the fixed-token permutation tail is conditional, not a design-discovery p.
 * Node.js 22 / Windows, CommonJS, no external dependencies, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} file */
function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const p57 = corpus.pages[57].indices;
assert.equal(p57.length, 95);
const clauses = [p57.slice(7, 37), p57.slice(37, 67), p57.slice(67, 95)];
assert.deepEqual(clauses.map(x => x.length), [30, 30, 28]);
const sums = clauses.map(xs => xs.reduce((total, i) => total + corpus.prime[i], 0));
assert.deepEqual(sums, [1259, 1031, 1229]);
assert.equal(sums.reduce((a, b) => a * b, 1), 1595277641);

/** @param {number} n */
function primeRank(n) {
  let result = 0;
  for (let x = 2; x <= n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) result++;
  }
  return result;
}
const selected = sums.map(primeRank);
assert.deepEqual(selected, [205, 173, 201]);
const tokens = grid.pages.flatMap(page => page.tokens);
assert.equal(tokens.length, 256);
assert.equal(grid.alphabet.length, 60);
assert.equal(grid.alphabet.includes("f"), true);
const a59 = grid.alphabet.replace("f", "");
assert.equal(a59.length, 59);

/**
 * @param {number} radix
 * @returns {number[]}
 */
function parseValues(radix) {
  const alphabet = radix === 60 ? grid.alphabet : a59;
  return tokens.map(token => {
    assert.equal(token.length, 2);
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0);
    const value = radix * hi + lo;
    assert(value >= 0 && value < 256);
    return value;
  });
}
const value60 = parseValues(60);
const value59 = parseValues(59);

/**
 * A node v contributes to the reverse-closure of root r iff its repeated
 * forward table-pointer walk eventually visits r. Include r itself.
 * @param {number[]} parent
 * @param {number} rootNode
 * @returns {number[]}
 */
function ancestors(parent, rootNode) {
  const reverse = Array.from({length: parent.length}, () => []);
  parent.forEach((target, node) => reverse[target].push(node));
  const visited = new Uint8Array(parent.length);
  const nodes = [rootNode];
  visited[rootNode] = 1;
  for (let cursor = 0; cursor < nodes.length; cursor++) {
    for (const child of reverse[nodes[cursor]]) {
      if (visited[child]) continue;
      visited[child] = 1;
      nodes.push(child);
    }
  }
  return nodes;
}

/**
 * Build one incoming-edge index for the 3 fixed roots.
 * @param {ArrayLike<number>} parent
 * @returns {number[]}
 */
function sizes(parent) {
  const reverse = Array.from({length: 256}, () => []);
  for (let i = 0; i < 256; i++) reverse[parent[i]].push(i);
  return selected.map(initial => {
    const seen = new Uint8Array(256);
    const q = [initial];
    seen[initial] = 1;
    for (let i = 0; i < q.length; i++) {
      for (const child of reverse[q[i]]) {
        if (seen[child]) continue;
        seen[child] = 1;
        q.push(child);
      }
    }
    return q.length;
  });
}

assert.deepEqual([
  ancestors([1,2,3,3],0).length,
  ancestors([1,2,3,3],1).length,
  ancestors([1,2,3,3],2).length,
  ancestors([1,2,3,3],3).length,
], [1,2,3,4]);
assert.deepEqual(sizes(value60), [58,8,56]);
assert.deepEqual(sizes(value59), [1,10,1]);
assert.deepEqual(selected.map(i => tokens[i]), ["1G","1v","1E"]);
assert.deepEqual(selected.map(i => value60[i]), [76,117,74]);
assert.deepEqual(selected.map(i => value59[i]), [75,115,73]);

assert.equal(value60[201], 74);
assert.equal(value60[74], 205);
const closure205 = new Set(ancestors(value60, 205));
const closure201 = new Set(ancestors(value60, 201));
const closure173 = ancestors(value60, 173);
assert.equal(closure205.size, 58);
assert.equal(closure201.size, 56);
assert.deepEqual(
  [...closure205].filter(i => !closure201.has(i)).sort((a,b) => a-b),
  [74,205]
);
assert.deepEqual(closure173.sort((a,b)=>a-b), [26,41,84,93,147,173,215,239]);
assert.deepEqual([...new Set(closure173.map(i => value60[i]))].sort((a,b)=>a-b),
  [84,117,173]);

// One frozen conditional null: shuffle the actual 256 source values among the
// 256 printed positions. Equal-value multiplicity is preserved exactly.
let seed = 0x33012014;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const N = 100000;
const permuted = Uint16Array.from(value60);
const counts = {
  ordered: 0, unordered: 0, firstThird: 0,
  size58At205: 0, size8At173: 0, size56At201: 0,
};
for (let trial = 0; trial < N; trial++) {
  for (let i = 255; i > 0; i--) {
    const j = random32() % (i + 1);
    const old = permuted[i];
    permuted[i] = permuted[j];
    permuted[j] = old;
  }
  const [a, b, c] = sizes(permuted);
  if (a === 58) counts.size58At205++;
  if (b === 8) counts.size8At173++;
  if (c === 56) counts.size56At201++;
  if (a === 58 && c === 56) counts.firstThird++;
  if (a === 58 && b === 8 && c === 56) counts.ordered++;
  if ([a,b,c].sort((x,y)=>x-y).join(",") === "8,56,58") counts.unordered++;
}
assert.deepEqual(counts, {
  ordered: 0, unordered: 0, firstThird: 0,
  size58At205: 109, size8At173: 3164, size56At201: 199,
});
console.log(JSON.stringify({
  status: "PASS",
  source: {
    clauseSums: sums,
    sourcePrimeRanks: selected,
    cellTokens: selected.map(i=>tokens[i]),
    base60SelectedValues: selected.map(i=>value60[i]),
    base60IncomingClosureSizes: sizes(value60),
    base59IncomingClosureSizes: sizes(value59),
    innerRoute: [201,74,205],
    innerClosureSize: closure201.size,
    allPageClosureSize: closure205.size,
    solvedPageCandidates: [74,205],
    columnSizeClosureNode173: closure173
  },
  null: {
    seedHex: "0x33012014",
    samples: N, counts,
    conditionalUpperTailAddOne: (counts.ordered+1)/(N+1),
    interpretation: "post hoc source-selected graph receiver; no global design p-value"
  },
  receiver: "unspecified; no original LP2 plaintext or key recovered"
}, null, 2));
