'use strict';

/**
 * Source-exact candidate: GP29 ciphertext is a cumulative sum on the
 * conditional base59 tree. Invert descendant-subtree sums or ancestor-path
 * sums on complete original p32/p55 ciphertext. Positive native-GP plants
 * and full forward re-encryption are mandatory.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'
  .replace('f', '');
assert.equal(alphabet.length, 59);
const parent = grid.pages.flatMap((page) => page.tokens).map((token) => {
  assert.equal(token.length, 2);
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  const value = a * 59 + b;
  assert.ok(value >= 0 && value < 256);
  return value;
});
assert.equal(parent.length, 256);
const children = Array.from({ length: 256 }, () => []);
parent.forEach((node, i) => { if (node !== i) children[node].push(i); });
assert.equal(parent[189], 189);
const mod = (x) => (x % 29 + 29) % 29;

/** @param {number} root @param {'bfs'|'pre'|'post'} kind @param {boolean} desc */
function traverse(root, kind, desc) {
  const orderedChildren = (node) => desc
    ? [...children[node]].reverse() : children[node];
  const out = [];
  if (kind === 'bfs') {
    const queue = [root];
    for (let i = 0; i < queue.length; i++) {
      out.push(queue[i]);
      queue.push(...orderedChildren(queue[i]));
    }
  } else {
    const visit = (node) => {
      if (kind === 'pre') out.push(node);
      for (const next of orderedChildren(node)) visit(next);
      if (kind === 'post') out.push(node);
    };
    visit(root);
  }
  assert.equal(new Set(out).size, out.length);
  return out;
}

/** @param {number} root */
function orders(root) {
  const canonical = ['bfs', 'pre', 'post'].flatMap((kind) =>
    [false, true].map((desc) => ({
      name: kind + (desc ? '-desc' : '-asc'),
      nodes: traverse(root, kind, desc)
    })));
  const rowMajor = [...canonical[0].nodes].sort((a, b) => a - b);
  return [
    ...canonical,
    { name: 'rowmajor-asc', nodes: rowMajor },
    { name: 'rowmajor-desc', nodes: [...rowMajor].reverse() }
  ];
}

/** @param {number} root @param {number[]} order @param {number[]} cipher @param {'subtree'|'ancestor'} kind */
function invert(root, order, cipher, kind) {
  const C = new Map(order.map((node, index) => [node, cipher[index]]));
  return order.map((node) => kind === 'subtree'
    ? mod(C.get(node) - children[node].reduce((s, child) => s + C.get(child), 0))
    : node === root ? C.get(node) : mod(C.get(node) - C.get(parent[node])));
}

/** @param {number} root @param {number[]} order @param {number[]} plain @param {'subtree'|'ancestor'} kind */
function encrypt(root, order, plain, kind) {
  const P = new Map(order.map((node, index) => [node, plain[index]]));
  const memo = new Map();
  const subtreeSum = (node) => {
    if (memo.has(node)) return memo.get(node);
    const sum = mod(P.get(node) + children[node].reduce(
      (s, child) => s + subtreeSum(child), 0));
    memo.set(node, sum);
    return sum;
  };
  const pathSum = (node) => {
    if (memo.has(node)) return memo.get(node);
    const sum = node === root ? P.get(node)
      : mod(P.get(node) + pathSum(parent[node]));
    memo.set(node, sum);
    return sum;
  };
  return order.map((node) => kind === 'subtree'
    ? subtreeSum(node) : pathSum(node));
}

const tokens = corpus.translit.map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} text */
function gpText(text) {
  return (text.match(/[A-Za-z]+/gu) || []).flatMap((word) => {
    const normalized = word.toUpperCase().replace(/QU/g, 'CW')
      .replace(/V/g, 'U').replace(/[KQ]/g, 'C')
      .replace(/Z/g, 'S').replace(/ING/g, 'NG').replace(/IO/g, 'IA');
    const out = [];
    for (let i = 0; i < normalized.length;) {
      const token = tokens.find(({ symbol }) => normalized.startsWith(symbol, i));
      if (!token) return [];
      out.push(token.value);
      i += token.symbol.length;
    }
    return out;
  });
}
const native = gpText(read('resources/control/gibran_prophet_58585.txt'));
assert.ok(native.length > 20000);
const cutoff = Math.floor(native.length * 2 / 3);
const train = native.slice(0, cutoff), held = native.slice(cutoff);
const tri = new Map();
for (let i = 2; i < train.length; i++) {
  const key = 841 * train[i - 2] + 29 * train[i - 1] + train[i];
  tri.set(key, (tri.get(key) || 0) + 1);
}
const denom = train.length - 2 + 0.25 * 29 ** 3;
/** @param {number[]} values */
function score(values) {
  let sum = 0;
  for (let i = 2; i < values.length; i++) {
    const key = 841 * values[i - 2] + 29 * values[i - 1] + values[i];
    sum += Math.log(((tri.get(key) || 0) + 0.25) / denom);
  }
  return sum / (values.length - 2);
}

const summaries = [];
for (const { page, root } of [{ page: 32, root: 58 }, { page: 55, root: 244 }]) {
  const ciphertext = corpus.pages.find((p) => p.page === page).indices;
  const readingOrders = orders(root);
  assert.equal(readingOrders[0].nodes.length, ciphertext.length);
  assert.equal(ciphertext.length, page === 32 ? 121 : 76);
  const heldScores = [];
  for (let start = 0; start + ciphertext.length <= held.length; start += 50) {
    heldScores.push(score(held.slice(start, start + ciphertext.length)));
  }
  const nativeMin = Math.min(...heldScores);
  const candidates = [];
  for (const reading of readingOrders) {
    for (const kind of ['subtree', 'ancestor']) {
      const plaintext = invert(root, reading.nodes, ciphertext, kind);
      assert.deepEqual(encrypt(root, reading.nodes, plaintext, kind), ciphertext);
      const plant = native.slice(51, 51 + ciphertext.length);
      const plantedCipher = encrypt(root, reading.nodes, plant, kind);
      assert.deepEqual(invert(root, reading.nodes, plantedCipher, kind), plant);
      candidates.push({
        order: reading.name, kind, score: score(plaintext),
        prefix: plaintext.slice(0, 45).map((v) => corpus.translit[v]).join('')
      });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  assert.equal(candidates.length, 16);
  assert.ok(candidates.every((candidate) => candidate.score < nativeMin));
  summaries.push({
    page, root, tested: candidates.length, nativeMin,
    nativeWindows: heldScores.length, originalScore: score(ciphertext),
    candidatesAtOrAboveNative: 0, best: candidates.slice(0, 6)
  });
}
console.log(JSON.stringify({ source: 'original base59 p49-51 table; exact p32/p55 GP29',
  models: 'unconstrained tree-subtree or ancestor cumulative sums; 8 source orderings',
  results: summaries }, null, 2));
