'use strict';

/**
 * Source-only base59 subtree partition and bounded p32/p55 common-pad gate.
 * Run from the repository root with Node 22 or newer.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const data = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
const grid = data('resources/liber-primus/lp2-grid-256.json');
const corpus = data('resources/liber-primus/lp2-corpus.json');
const solved = data('resources/external/relikd-solved-gp29-native-v1.json');
const alpha = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx'.replace('f', '');
const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(alpha.length, 59);
assert.equal(tokens.length, 256);
const parent = tokens.map((token) => {
  assert.equal(token.length, 2);
  const a = alpha.indexOf(token[0]);
  const b = alpha.indexOf(token[1]);
  assert.ok(a >= 0 && b >= 0);
  const value = 59 * a + b;
  assert.ok(value >= 0 && value < 256);
  return value;
});
const children = Array.from({ length: 256 }, () => []);
parent.forEach((p, i) => {
  if (i !== p) children[p].push(i);
});

const root = parent.findIndex((p, i) => p === i);
assert.equal(root, 189);
assert.equal(parent.filter((p, i) => p === i).length, 1);

/** @param {number} node @returns {number[]} Descendant-inclusive subtree. */
function descendants(node) {
  const found = [];
  const visit = (i) => {
    found.push(i);
    children[i].forEach(visit);
  };
  visit(node);
  return found;
}
const all = descendants(root);
assert.equal(new Set(all).size, 256);
const size = parent.map((_, i) => descendants(i).length);
const findSize = (n) => size.flatMap((count, i) => count === n ? [i] : []);
assert.deepEqual(findSize(121), [58]);
assert.deepEqual(findSize(76), [244]);
assert.deepEqual(findSize(33), [146]);
const sub121 = new Set(descendants(58));
const sub76 = new Set(descendants(244));
const sub33 = new Set(descendants(146));
assert.ok([...sub76].every((i) => sub121.has(i)));
assert.ok([...sub33].every((i) => sub121.has(i)));
assert.ok([...sub33].every((i) => !sub76.has(i)));
assert.equal(sub121.size - sub76.size - sub33.size, 12);
let depth = 0;
for (let node = 32; node !== root; node = parent[node]) depth++;
assert.equal(depth, 32);
const selfDepthPages = [];
for (let page = 0; page < 56; page++) {
  let distance = 0;
  for (let node = page; node !== root; node = parent[node]) distance++;
  if (distance === page) selfDepthPages.push(page);
}
assert.deepEqual(selfDepthPages, [32]);

/** @param {number} start @param {'bfs'|'pre'|'post'} method @param {boolean} desc */
function traversal(start, method, desc) {
  const childOrder = (i) => desc ? [...children[i]].reverse() : children[i];
  const out = [];
  const visit = (i) => {
    if (method === 'pre') out.push(i);
    for (const j of childOrder(i)) visit(j);
    if (method === 'post') out.push(i);
  };
  if (method === 'bfs') {
    const queue = [start];
    for (let i = 0; i < queue.length; i++) {
      out.push(queue[i]);
      queue.push(...childOrder(queue[i]));
    }
  } else {
    visit(start);
  }
  return out;
}
const orders = ['bfs', 'pre', 'post'].flatMap((method) =>
  [false, true].map((desc) => ({
    name: method + (desc ? '-desc' : '-asc'),
    big: traversal(58, method, desc),
    small: traversal(244, method, desc)
  })));
const p32 = corpus.pages.find((page) => page.page === 32).indices;
const p55 = corpus.pages.find((page) => page.page === 55).indices;
assert.equal(p32.length, 121);
assert.equal(p55.length, 76);
const runeValue = new Map(solved.runes.map((rune, i) => [rune, i]));
const known = solved.sections.flatMap((section) =>
  Array.from(section.source_text).filter((rune) => runeValue.has(rune)).map((rune) => runeValue.get(rune)));
const freq = Array(29).fill(1);
for (const value of known) freq[value]++;
const total = known.length + 29;
const pairProbability = Array(29).fill(0);
for (let i = 0; i < 29; i++) {
  for (let j = 0; j < 29; j++) {
    pairProbability[(i - j + 29) % 29] += freq[i] * freq[j] / (total * total);
  }
}
const pairs = orders.flatMap((big) => orders.map((small) => {
  const index = new Map(big.big.map((node, i) => [node, i]));
  return {
    name: big.name + '/' + small.name,
    one: small.small.map((node) => p32[index.get(node)]),
    two: small.small.map((_, i) => i)
  };
}));
const score = (pair, shift) => {
  let s = 0;
  for (let i = 0; i < 76; i++) {
    const delta = (pair.one[i] - p55[(pair.two[i] + shift) % 76] + 29) % 29;
    s += Math.log(29 * pairProbability[delta]);
  }
  return s / 76;
};
const shiftScores = Array.from({ length: 76 }, (_, shift) => ({
  shift,
  best: Math.max(...pairs.map((pair) => score(pair, shift)))
}));
const real = shiftScores[0].best;
const better = shiftScores.filter((row) => row.best + 1e-12 >= real).length;
const preferred = pairs.map((pair) => ({ name: pair.name, score: score(pair, 0) }))
  .sort((a, b) => b.score - a.score)[0];
assert.equal(pairs.length, 36);
assert.equal(better, 63);
assert.equal(preferred.name, 'pre-asc/post-desc');
assert.ok(Math.abs(real - 0.0170158396748) < 1e-9);

/** Xorshift32 and Fisher-Yates preserve the exact original target multiset. */
let randomState = 0xC1CADA29 >>> 0;
const random32 = () => {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
};
const permuted = Uint16Array.from(parent);
const degree = new Int16Array(256);
const subtreeSize = new Uint16Array(256);
const queue = new Uint16Array(256);
const permutations = 180000;
let rooted = 0, has121 = 0, has76 = 0, has33 = 0, triple = 0, nested = 0;
for (let trial = 0; trial < permutations; trial++) {
  permuted.set(parent);
  for (let i = 255; i > 0; i--) {
    const j = random32() % (i + 1);
    const tmp = permuted[i];
    permuted[i] = permuted[j];
    permuted[j] = tmp;
  }
  degree.fill(0);
  subtreeSize.fill(1);
  for (let i = 0; i < 256; i++) degree[permuted[i]]++;
  let head = 0, tail = 0;
  for (let i = 0; i < 256; i++) if (degree[i] === 0) queue[tail++] = i;
  while (head < tail) {
    const node = queue[head++];
    const next = permuted[node];
    subtreeSize[next] += subtreeSize[node];
    if (--degree[next] === 0) queue[tail++] = next;
  }
  if (tail !== 255) continue;
  const newRoot = degree.findIndex((d) => d > 0);
  if (newRoot < 0 || permuted[newRoot] !== newRoot) continue;
  rooted++;
  const big = [], inner = [], outer = [];
  for (let i = 0; i < 256; i++) {
    if (subtreeSize[i] === 121) big.push(i);
    if (subtreeSize[i] === 76) inner.push(i);
    if (subtreeSize[i] === 33) outer.push(i);
  }
  if (big.length) has121++;
  if (inner.length) has76++;
  if (outer.length) has33++;
  if (!big.length || !inner.length || !outer.length) continue;
  triple++;
  const under = (node, ancestor) => {
    while (node !== newRoot) {
      if (node === ancestor) return true;
      node = permuted[node];
    }
    return newRoot === ancestor;
  };
  if (big.some((top) => inner.some((a) => outer.some((b) => under(a, top) && under(b, top))))) nested++;
}
assert.deepEqual([rooted, has121, has76, has33, triple, nested],
  [682, 73, 124, 323, 8, 2]);


// The actual 2016 PGP-signed source says "epiphany seeks the devoted"
// and explicitly directs the player to use words/numbers. Freeze the simple
// adjacent-word grammar: GP0(word_i) = address, GP0(word_(i+1)) = step count.
const signed = fs.readFileSync(
  path.join(ROOT, 'resources/historical/cicada2016-4gq25-outguess.asc'), 'utf8'
);
const body = signed.split('Hash: SHA1')[1]
  .split('-----BEGIN PGP SIGNATURE-----')[0].split('7A35090F')[0];
const sourceWords = body.toUpperCase().match(/[A-Z]+/g);
assert.equal(sourceWords.length, 43);
const translit = 'F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split(' ');
const gpDigits = new Map(translit.map((symbol, i) => [symbol, i]));
/** @param {string} original Original 2016 source word. */
function gp0(original) {
  const word = original.replaceAll('K', 'C').replaceAll('V', 'U');
  let sum = 0;
  for (let i = 0; i < word.length;) {
    const double = word.slice(i, i + 2);
    const symbol = gpDigits.has(double) ? double : word[i];
    assert.ok(gpDigits.has(symbol), 'Unknown original word sign ' + symbol);
    sum += gpDigits.get(symbol);
    i += symbol.length;
  }
  return sum;
}
const sourceValues = sourceWords.map(gp0);
const pageCounts = corpus.pages.filter((page) => page.page <= 55 && page.runic_count > 0);
const follow = (start, count) => {
  let node = start;
  for (let i = 0; i < count && parent[node] !== node; i++) node = parent[node];
  return node;
};
const pageMatches = (start, count) => {
  const selected = follow(start, count);
  return pageCounts.filter((page) => page.runic_count === size[selected])
    .map((page) => ({ page: page.page, address: selected, size: size[selected] }));
};
const adjacentHits = [];
for (let i = 0; i < sourceValues.length - 1; i++) {
  for (const m of pageMatches(sourceValues[i], sourceValues[i + 1])) {
    adjacentHits.push({ index: i, pair: sourceWords[i] + ' ' + sourceWords[i + 1], ...m });
  }
}
assert.deepEqual(adjacentHits, [
  { index: 6, pair: 'SEEKS THE', page: 55, address: 244, size: 76 }
]);
let allOrderedHits = 0, allOrdered55 = 0;
for (let i = 0; i < sourceValues.length; i++) {
  for (let j = 0; j < sourceValues.length; j++) {
    if (i === j) continue;
    const matches = pageMatches(sourceValues[i], sourceValues[j]);
    allOrderedHits += matches.length;
    allOrdered55 += matches.filter((m) => m.page === 55).length;
  }
}
assert.deepEqual([allOrderedHits, allOrdered55], [28, 6]);
let wordState = 0xBEEFC301 >>> 0;
const nextWordRandom = () => {
  wordState ^= wordState << 13;
  wordState ^= wordState >>> 17;
  wordState ^= wordState << 5;
  return wordState >>> 0;
};
const wordShuffles = 20000;
let anyPage = 0, any55 = 0;
for (let trial = 0; trial < wordShuffles; trial++) {
  const order = Array.from({ length: sourceWords.length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = nextWordRandom() % (i + 1);
    const old = order[i];
    order[i] = order[j];
    order[j] = old;
  }
  let matchedPage = false, matched55 = false;
  for (let i = 0; i < order.length - 1; i++) {
    const matches = pageMatches(sourceValues[order[i]], sourceValues[order[i + 1]]);
    if (matches.length) matchedPage = true;
    if (matches.some((m) => m.page === 55)) matched55 = true;
  }
  if (matchedPage) anyPage++;
  if (matched55) any55++;
}
assert.deepEqual([anyPage, any55], [10187, 2740]);

console.log(JSON.stringify({
  source: { root, uniqueSubtrees: { 121: 58, 76: 244, 33: 146 },
    partition: '121=76+33+12', p32AddressDepth: depth, selfDepthPages },
  commonPad: { model: 'same additive key on overlapping tree nodes',
    traversalPairs: pairs.length, realBest: real, realBestPair: preferred.name,
    circularShiftCount: shiftScores.length, nullAtLeastReal: better },
  signedSource: { words: sourceWords.length, adjacentHits, allOrderedHits, allOrdered55,
    wordOrderControl: { seed: '0xBEEFC301', trials: wordShuffles, anyPage, any55 } },
  fixedMultiset: { seed: '0xC1CADA29', permutations, rooted, has121, has76,
    has33, triple, nested }
}, null, 2));
