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
function traversal(kind, desc, start = selected) {
  const next = (i) => desc ? [...children[i]].reverse() : children[i];
  const out = [];
  const visit = (node) => {
    if (kind === 'pre') out.push(node);
    for (const child of next(node)) visit(child);
    if (kind === 'post') out.push(node);
  };
  if (kind === 'bfs') {
    const queue = [start];
    for (let i = 0; i < queue.length; i++) {
      out.push(queue[i]);
      queue.push(...next(queue[i]));
    }
  } else {
    visit(start);
  }
  assert.equal(out.length, start === selected ? 76 : 121);
  assert.equal(new Set(out).size, out.length);
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


/** Second signed/DH step: two parent pointers from p55 node244 to p32 node58. */
const innerTreeRoot = parent[parent[selected]];
assert.equal(innerTreeRoot, 58);
const p32 = corpus.pages.find((page) => page.page === 32).indices;
assert.equal(p32.length, 121);
let p32Distance = 0;
for (let node = 32; node !== selected; node = parent[node]) {
  p32Distance++;
  assert.ok(p32Distance < 256);
}
assert.equal(p32Distance, 15);
const source43Positions = [2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,30,31,32,
  33,34,37,38,39,40,43,44,49,50,51,52,53,56,57,58,59,60,65,66,67,68,71,74];
const originalInteriors = source43Positions.map((position) => original[position]);
assert.equal(originalInteriors.length, 43);
const bigOrders = ['bfs', 'pre', 'post'].flatMap((kind) =>
  [false, true].map((desc) => ({
    name: kind + (desc ? '-desc' : '-asc'),
    nodes: traversal(kind, desc, innerTreeRoot)
  })));
const leaves = bigOrders[0].nodes.filter((node) => children[node].length === 0);
assert.equal(leaves.length, 43);
assert.equal(bigOrders[0].nodes.length - leaves.length, 78);
const held121Scores = [];
for (let i = 0; i + 121 <= held.length; i += 50) {
  held121Scores.push(score(held.slice(i, i + 121)));
}
const held121Min = Math.min(...held121Scores);
const folded = [];
for (const assignment of bigOrders) {
  const leafOrder = assignment.nodes.filter((node) => children[node].length === 0);
  const labels = new Map(leafOrder.map((node, i) => [node, originalInteriors[i]]));
  const fold = (node) => {
    if (labels.has(node)) return labels.get(node);
    const value = children[node].reduce((sum, child) => sum + fold(child), 0) % 29;
    labels.set(node, value);
    return value;
  };
  fold(innerTreeRoot);
  for (const reading of bigOrders) {
    const key = reading.nodes.map((node) => labels.get(node));
    for (const sign of [-1, 1]) {
      const output = p32.map((value, i) => mod29(value + sign * key[i]));
      assert.deepEqual(output.map((value, i) => mod29(value - sign * key[i])), p32);
      folded.push({ assignment: assignment.name, reading: reading.name, sign,
        score: score(output) });
    }
  }
}
folded.sort((a, b) => b.score - a.score);
assert.equal(folded.length, 72);
assert.ok(Math.abs(folded[0].score + 11.292399894818) < 1e-7);
assert.ok(Math.abs(held121Min + 9.345100027365) < 1e-7);
assert.ok(folded.every((candidate) => candidate.score < held121Min));


/**
 * Original p55 contains one incoming page-carry rune, followed by 16 complete
 * words. The independent p32 physical address-to-node244 path has 15 edges,
 * or 16 vertices. Apply one graph-derived Caesar key per intact source word.
 */
const p55WordLengths = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(p55WordLengths.length, 16);
assert.equal(p55WordLengths.reduce((sum, length) => sum + length, 0), 75);
const path32To244 = [32];
for (let node = 32; node !== selected;) {
  node = parent[node];
  path32To244.push(node);
}
assert.equal(path32To244.length, 16);
assert.deepEqual(path32To244,
  [32,113,141,45,105,62,122,85,28,148,242,41,83,190,167,244]);
const sourceWordTrials = [];
for (const reverse of [false, true]) {
  const pathNodes = reverse ? [...path32To244].reverse() : path32To244;
  for (const kind of ['node', 'parent', 'edge-delta', 'depth']) {
    const keys = pathNodes.map((node, index) =>
      kind === 'node' ? node : kind === 'parent' ? parent[node] :
        kind === 'edge-delta' ? node - parent[node] : index);
    for (const sign of [-1, +1]) {
      const output = [original[0]];
      let cursor = 1;
      for (let word = 0; word < 16; word++) {
        for (let offset = 0; offset < p55WordLengths[word]; offset++) {
          output.push(mod29(original[cursor++] + sign * keys[word]));
        }
      }
      assert.equal(cursor, 76);
      assert.equal(output.length, 76);
      assert.deepEqual(output.slice(1).map((value, i) => {
        const word = p55WordLengths.findIndex((_, j) => {
          let previous = 0;
          for (let k = 0; k < j; k++) previous += p55WordLengths[k];
          return i < previous + p55WordLengths[j];
        });
        return mod29(value - sign * keys[word]);
      }), original.slice(1));
      sourceWordTrials.push({
        orientation: reverse ? 'reverse' : 'forward', kind, sign,
        score: score(output.slice(1))
      });
    }
  }
}
sourceWordTrials.sort((a, b) => b.score - a.score);
const held75 = [];
for (let i = 0; i + 75 <= held.length; i += 50) {
  held75.push(score(held.slice(i, i + 75)));
}
const held75Min = Math.min(...held75);
assert.equal(sourceWordTrials.length, 16);
assert.ok(Math.abs(sourceWordTrials[0].score + 11.38721771841) < 1e-7);
assert.ok(Math.abs(held75Min + 9.561579642004) < 1e-7);
assert.ok(sourceWordTrials.every((trial) => trial.score < held75Min));


/**
 * Independent 43-to-121 candidate: all 43 source-authenticated 2016 words as
 * the leaf labels of the 43-leaf p32 table subtree, then sum upward mod29.
 * The 43 leaves are data-chosen; neither leaf order nor fold is authoritative.
 */
const signedWords43 = load('resources/historical/cicada2016-4gq25-outguess.asc')
  .split('Hash: SHA1')[1].split('-----BEGIN PGP SIGNATURE-----')[0]
  .split('7A35090F')[0].toUpperCase().match(/[A-Z]+/g);
assert.equal(signedWords43.length, 43);
const signedLeafKeys = {
  GP0: signedWords43.map((word) => gpText(word).reduce((sum, x) => sum + x, 0) % 29),
  prime: signedWords43.map((word) =>
    gpText(word).reduce((sum, x) => sum + corpus.prime[x], 0) % 29)
};
const signedLeafTrials = [];
for (const [keyKind, keys] of Object.entries(signedLeafKeys)) {
  for (const assignment of bigOrders) {
    const leafOrder = assignment.nodes.filter((node) => children[node].length === 0);
    assert.equal(leafOrder.length, 43);
    const values = new Map(leafOrder.map((node, i) => [node, keys[i]]));
    const fold = (node) => {
      if (values.has(node)) return values.get(node);
      const value = children[node].reduce((sum, child) => sum + fold(child), 0) % 29;
      values.set(node, value);
      return value;
    };
    fold(innerTreeRoot);
    for (const reading of bigOrders) {
      const pad = reading.nodes.map((node) => values.get(node));
      for (const sign of [-1, 1]) {
        const output = p32.map((value, i) => mod29(value + sign * pad[i]));
        assert.deepEqual(output.map((value, i) => mod29(value - sign * pad[i])), p32);
        signedLeafTrials.push({ keyKind, assignment: assignment.name,
          reading: reading.name, sign, score: score(output) });
      }
    }
  }
}
signedLeafTrials.sort((a, b) => b.score - a.score);
assert.equal(signedLeafTrials.length, 144);
assert.ok(Math.abs(signedLeafTrials[0].score + 11.29122225863) < 1e-7);
assert.ok(signedLeafTrials.every((trial) => trial.score < held121Min));


/**
 * Row-major printed-table order (and its reverse) is a stronger physical
 * selector than graph DFS/BFS; test this fixed 2x4x2 family on each page.
 */
const rowMajorTrials = [];
for (const [page, sourceNodes, originalCipher, subtreeRoot] of [
  [55, orders[0].nodes, original, selected],
  [32, bigOrders[0].nodes, p32, innerTreeRoot]
]) {
  const sorted = [...sourceNodes].sort((left, right) => left - right);
  const nativeMin = page === 55 ? heldMin : held121Min;
  for (const direction of ['asc', 'desc']) {
    const nodes = direction === 'asc' ? sorted : [...sorted].reverse();
    for (const kind of ['node', 'parent', 'edge-delta', 'depth']) {
      const pad = nodes.map((node) => {
        if (kind === 'node') return node;
        if (kind === 'parent') return parent[node];
        if (kind === 'edge-delta') return node - parent[node];
        let depth = 0;
        for (let current = node; current !== subtreeRoot; current = parent[current]) depth++;
        return depth;
      });
      for (const sign of [-1, +1]) {
        const plaintext = originalCipher.map((value, i) => mod29(value + sign * pad[i]));
        assert.deepEqual(plaintext.map((value, i) => mod29(value - sign * pad[i])),
          originalCipher);
        const result = { page, direction, kind, sign, score: score(plaintext) };
        assert.ok(result.score < nativeMin);
        rowMajorTrials.push(result);
      }
    }
  }
}
rowMajorTrials.sort((a, b) => b.score - a.score);
assert.equal(rowMajorTrials.length, 32);
assert.ok(Math.abs(rowMajorTrials[0].score + 11.15231681556) < 1e-7);


/**
 * Historical p56 transparent literal-F bypass: each ciphertext F may either
 * be copied plaintext F without consuming key, or be encrypted non-F and
 * consume key. All nonliteral consumptions MUST decrypt to a non-F GP rune.
 * All 2^3 and 2^4 exact original F masks are charged, no tuned mask.
 */
const primes256 = [];
for (let n = 2; primes256.length < 256; n++) {
  if (primes256.every((prime) => n % prime !== 0 || prime * prime > n)) primes256.push(n);
}
assert.equal(primes256.length, 256);
const transparentFTrials = [];
const transparentFCounts = [];
for (const { page, root, ciphertext: tape, baseOrders, nativeMin } of [
  { page: 55, root: selected, ciphertext: original, baseOrders: orders, nativeMin: heldMin },
  { page: 32, root: innerTreeRoot, ciphertext: p32, baseOrders: bigOrders,
    nativeMin: held121Min }
]) {
  const physicalOrder = [...baseOrders[0].nodes].sort((a, b) => a - b);
  const readingOrders = [...baseOrders, { name: 'rowmajor-asc', nodes: physicalOrder },
    { name: 'rowmajor-desc', nodes: [...physicalOrder].reverse() }];
  const originalFPositions = tape.flatMap((value, i) => value === 0 ? [i] : []);
  assert.deepEqual(originalFPositions,
    page === 55 ? [15,25,41] : [29,30,42,114]);
  let valid = 0;
  for (const order of readingOrders) {
    for (const sourceKey of ['node', 'parent', 'edge-delta', 'depth',
      'totient-node', 'totient-parent', 'totient-edge-delta', 'totient-depth']) {
      const pad = order.nodes.map((node) => {
        const kind = sourceKey.replace('totient-', '');
        let basis;
        if (kind === 'node') basis = node;
        else if (kind === 'parent') basis = parent[node];
        else if (kind === 'edge-delta') basis = Math.abs(node - parent[node]);
        else {
          let steps = 0;
          for (let current = node; current !== root; current = parent[current]) steps++;
          basis = steps;
        }
        return sourceKey.startsWith('totient-') ? primes256[basis] - 1 :
          kind === 'edge-delta' ? node - parent[node] : basis;
      });
      for (const sign of [-1, +1]) {
        for (let fmask = 0; fmask < 2 ** originalFPositions.length; fmask++) {
          const skipped = new Set(originalFPositions.filter(
            (_, i) => (fmask & (1 << i)) !== 0));
          const plain = [];
          let clock = 0, allowed = true;
          for (let index = 0; index < tape.length; index++) {
            if (skipped.has(index)) {
              plain.push(0);
              continue;
            }
            const value = mod29(tape[index] + sign * pad[clock++]);
            if (value === 0) { allowed = false; break; }
            plain.push(value);
          }
          if (!allowed) continue;
          const reencryption = [];
          clock = 0;
          for (let index = 0; index < plain.length; index++) {
            if (skipped.has(index)) reencryption.push(0);
            else reencryption.push(mod29(plain[index] - sign * pad[clock++]));
          }
          assert.deepEqual(reencryption, tape);
          valid++;
          const result = {
            page, order: order.name, sourceKey, sign, fmask, score: score(plain)
          };
          assert.ok(result.score < nativeMin);
          transparentFTrials.push(result);
        }
      }
    }
  }
  const proposed = readingOrders.length * 8 * 2 * 2 ** originalFPositions.length;
  assert.equal(proposed, page === 55 ? 1024 : 2048);
  assert.equal(valid, page === 55 ? 85 : 25);
  transparentFCounts.push({
    page, originalFPositions, proposed, valid, nativeMin,
    candidatesAtOrAboveNativeFloor: 0
  });
}
transparentFTrials.sort((a, b) => b.score - a.score);
assert.equal(transparentFTrials.length, 110);
assert.ok(Math.abs(transparentFTrials[0].score + 11.213207216832) < 1e-7);

console.log(JSON.stringify({
  selected: { source: 'SEEKS GP0=71; THE GP0=20', address: selected,
    subtreeSize: orders[0].nodes.length },
  scoreSource: {
    original: score(original), solvedP57First76: score(solved.slice(0, 76)),
    nativeHeldMin: heldMin, nativeHeldCount: heldScores.length
  },
  numericKeys: { tested: keyTrials.length, best: keyTrials.slice(0, 3),
    candidatesReachingNativeMin: keyTrials.filter((entry) => entry.score >= heldMin).length },
  literalFBypass: { counts: transparentFCounts,
    best: transparentFTrials.slice(0, 4) },
  rowMajorNumeric: { tested: rowMajorTrials.length, best: rowMajorTrials.slice(0, 4),
    candidatesReachingNativeMin: 0 },
  signedWord43LeafFold: { words: signedWords43.length, treeLeaves: leaves.length,
    tested: signedLeafTrials.length, best: signedLeafTrials.slice(0, 3),
    nativeHeldMin: held121Min,
    candidatesReachingNativeMin: signedLeafTrials.filter((trial) => trial.score >= held121Min).length },
  wordPath16: { path: path32To244, p55WordLengths, tested: sourceWordTrials.length,
    scoreRaw: score(original.slice(1)), nativeHeldMin: held75Min,
    best: sourceWordTrials.slice(0, 3),
    candidatesReachingNativeMin: sourceWordTrials.filter((entry) => entry.score >= held75Min).length },
  p32LeafFold: { fromP55StrictInteriors: originalInteriors.length,
    p32Nodes: p32.length, leaves: leaves.length, internal: p32.length - leaves.length,
    p32AddressToP55NodeSteps: p32Distance, tested: folded.length,
    nativeHeldMin: held121Min, best: folded.slice(0, 3),
    candidatesReachingNativeMin: folded.filter((entry) => entry.score >= held121Min).length },
  graphTranspositions: { tested: permutations.length, best: permutations.slice(0, 3),
    candidatesReachingNativeMin: permutations.filter((entry) => entry.score >= heldMin).length }
}, null, 2));
