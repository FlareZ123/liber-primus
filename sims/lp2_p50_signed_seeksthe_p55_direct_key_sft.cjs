'use strict';

/**
 * Fixed signed 2016 SEEKS THE -> base59 cell244 -> 76-node p55 receiver.
 * Direct numeric-key and graph-only permutation original-input decision.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '..');
const load = (filename) => fs.readFileSync(path.join(repo, filename), 'utf8');
const corpus = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(load('resources/liber-primus/lp2-grid-256.json'));
const original = corpus.pages.find((page) => page.page === 55).indices;
const solved = corpus.pages.find((page) => page.page === 57).indices;
assert.equal(original.length, 76);
assert.equal(solved.length, 95);
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'.replace('f', '');
const table = grid.pages.flatMap((page) => page.tokens);
const parent = table.map((token) => 59 * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]));
const children = Array.from({ length: 256 }, () => []);
parent.forEach((value, index) => {
  if (index !== value) children[value].push(index);
});
let selected = 71;
for (let count = 0; count < 20; count++) selected = parent[selected];
assert.equal(selected, 244);

/**
 * @param {'bfs'|'pre'|'post'} kind
 * @param {boolean} desc
 * @returns {number[]}
 */
function traversal(kind, desc) {
  const next = (i) => desc ? [...children[i]].reverse() : children[i];
  const out = [];
  const visit = (node) => {
    if (kind === 'pre') out.push(node);
    for (const child of next(node)) visit(child);
    if (kind === 'post') out.push(node);
  };
  if (kind === 'bfs') {
    const queue = [selected];
    for (let i = 0; i < queue.length; i++) {
      out.push(queue[i]);
      queue.push(...next(queue[i]));
    }
  } else {
    visit(selected);
  }
  assert.equal(out.length, 76);
  assert.equal(new Set(out).size, 76);
  return out;
}
const orders = ['bfs', 'pre', 'post'].flatMap((kind) =>
  [false, true].map((desc) => ({
    name: kind + (desc ? '-desc' : '-asc'),
    nodes: traversal(kind, desc)
  })));

const gpTokens = corpus.translit.map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);
/** @param {string} text */
function gpText(text) {
  return (text.match(/[A-Za-z]+/gu) || []).flatMap((word) => {
    const normalized = word.toUpperCase().replace(/QU/g, 'CW')
      .replace(/V/g, 'U').replace(/[KQ]/g, 'C')
      .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
    const out = [];
    for (let i = 0; i < normalized.length;) {
      const token = gpTokens.find(({ symbol }) => normalized.startsWith(symbol, i));
      if (!token) return [];
      out.push(token.value);
      i += token.symbol.length;
    }
    return out;
  });
}
const native = gpText(load('resources/control/gibran_prophet_58585.txt'));
assert.ok(native.length > 20000);
const cutoff = Math.floor(native.length * 2 / 3);
const training = native.slice(0, cutoff);
const held = native.slice(cutoff);
const counts = new Map();
for (let i = 2; i < training.length; i++) {
  const tri = training[i - 2] * 841 + training[i - 1] * 29 + training[i];
  counts.set(tri, (counts.get(tri) || 0) + 1);
}
const denom = training.length - 2 + 0.25 * 29 ** 3;
/** @param {number[]} values */
const score = (values) => {
  let ll = 0;
  for (let i = 2; i < values.length; i++) {
    const tri = values[i - 2] * 841 + values[i - 1] * 29 + values[i];
    ll += Math.log(((counts.get(tri) || 0) + 0.25) / denom);
  }
  return ll / (values.length - 2);
};
const heldScores = [];
for (let i = 0; i + 76 <= held.length; i += 50) {
  heldScores.push(score(held.slice(i, i + 76)));
}
const heldMin = Math.min(...heldScores);
const mod29 = (value) => ((value % 29) + 29) % 29;
const nodeDepth = (node) => {
  let depth = 0;
  while (node !== selected) {
    node = parent[node];
    depth++;
    assert.ok(depth < 256);
  }
  return depth;
};

const keyTrials = [];
for (const order of orders) {
  for (const key of ['node', 'parent', 'edge-delta', 'depth']) {
    for (const sign of [-1, +1]) {
      const values = order.nodes.map((node) => key === 'node' ? node :
        key === 'parent' ? parent[node] :
          key === 'edge-delta' ? node - parent[node] : nodeDepth(node));
      const candidate = original.map((value, i) => mod29(value + sign * values[i]));
      assert.deepEqual(candidate.map((value, i) => mod29(value - sign * values[i])), original);
      keyTrials.push({ traversal: order.name, key, sign, score: score(candidate) });
    }
  }
}
const permutations = [];
for (const assignment of orders) {
  const sourceIndex = new Map(assignment.nodes.map((node, i) => [node, i]));
  for (const reading of orders) {
    const output = reading.nodes.map((node) => original[sourceIndex.get(node)]);
    assert.equal(output.length, 76);
    assert.equal(output.sort((a, b) => a - b).join(','),
      [...original].sort((a, b) => a - b).join(','));
    // Generate the original order again, since sort mutates the output.
    const orderedOutput = reading.nodes.map((node) => original[sourceIndex.get(node)]);
    permutations.push({
      assignment: assignment.name, reading: reading.name, score: score(orderedOutput)
    });
  }
}
keyTrials.sort((a, b) => b.score - a.score);
permutations.sort((a, b) => b.score - a.score);
assert.equal(keyTrials.length, 48);
assert.equal(permutations.length, 36);
assert.ok(Math.abs(keyTrials[0].score + 11.228530144342) < 1e-7);
assert.ok(Math.abs(permutations[0].score + 11.417888698463) < 1e-7);
assert.ok(Math.abs(heldMin + 9.553197265269) < 1e-7);
assert.ok(keyTrials.every((entry) => entry.score < heldMin));
assert.ok(permutations.every((entry) => entry.score < heldMin));

console.log(JSON.stringify({
  selected: { source: 'SEEKS GP0=71; THE GP0=20', address: selected,
    subtreeSize: orders[0].nodes.length },
  scoreSource: {
    original: score(original), solvedP57First76: score(solved.slice(0, 76)),
    nativeHeldMin: heldMin, nativeHeldCount: heldScores.length
  },
  numericKeys: { tested: keyTrials.length, best: keyTrials.slice(0, 3),
    candidatesReachingNativeMin: keyTrials.filter((entry) => entry.score >= heldMin).length },
  graphTranspositions: { tested: permutations.length, best: permutations.slice(0, 3),
    candidatesReachingNativeMin: permutations.filter((entry) => entry.score >= heldMin).length }
}, null, 2));
