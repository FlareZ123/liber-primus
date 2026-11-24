'use strict';

// Reproduce the p7 -> 189 ten-byte path and its matched-null tests.
// Run with Node.js 22: node sims/lp2_p7_rooted_path_tor_v2_candidate_gate_sft.cjs
// Source input: resources/liber-primus/base60-grid.json.
// No network access or external packages are required.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'base60-grid.json'),
  'utf8'
));
const tokens = source.rows.flat();
const alphabet60 = source.alphabet;
const alphabet59 = alphabet60.replace('f', '');
const n = 256;
const start = 61;
const root = 189;

assert.equal(source.rows.length, 32);
assert(source.rows.every((row) => row.length === 8));
assert.equal(tokens.length, n);
assert.equal(tokens.some((token) => token.includes('f')), false);
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);

function decode(alphabet) {
  const radix = alphabet.length;
  return tokens.map((token) => {
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0);
    const value = hi * radix + lo;
    assert(value >= 0 && value < n);
    return value;
  });
}

function walk(next, first) {
  const seen = new Map();
  const seq = [];
  let x = first;
  while (!seen.has(x)) {
    seen.set(x, seq.length);
    seq.push(x);
    x = next[x];
  }
  return { seq, repeat: x, cycleStart: seen.get(x) };
}

function allPathLengths(next) {
  const state = new Uint8Array(n);
  const position = new Int16Array(n);
  const length = new Uint16Array(n);
  position.fill(-1);
  for (let first = 0; first < n; first += 1) {
    if (state[first] !== 0) continue;
    const trail = [];
    let x = first;
    while (state[x] === 0) {
      state[x] = 1;
      position[x] = trail.length;
      trail.push(x);
      x = next[x];
    }
    if (state[x] === 1) {
      const cycleStart = position[x];
      const cycleLength = trail.length - cycleStart;
      for (let i = cycleStart; i < trail.length; i += 1) {
        length[trail[i]] = cycleLength;
        state[trail[i]] = 2;
      }
      for (let i = cycleStart - 1; i >= 0; i -= 1) {
        length[trail[i]] = length[next[trail[i]]] + 1;
        state[trail[i]] = 2;
      }
    } else {
      for (let i = trail.length - 1; i >= 0; i -= 1) {
        length[trail[i]] = length[next[trail[i]]] + 1;
        state[trail[i]] = 2;
      }
    }
    for (const v of trail) position[v] = -1;
  }
  return length;
}

function base32(bytes) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
  let buffer = 0;
  let bits = 0;
  let out = '';
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += alphabet[(buffer >> bits) & 31];
    }
    buffer &= (1 << bits) - 1;
  }
  if (bits > 0) out += alphabet[(buffer << (5 - bits)) & 31];
  return out;
}

function makeRng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

function randomBelow(random, max) {
  const limit = Math.floor(0x100000000 / max) * max;
  let value;
  do {
    value = random();
  } while (value >= limit);
  return value % max;
}

function shuffle(values, random) {
  const out = values.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = randomBelow(random, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const values59 = decode(alphabet59);
const values60 = decode(alphabet60);
assert.deepEqual(values60, source.byte_rows.flat());

const p7 = walk(values59, start);
const p7Base60 = walk(values60, start);
assert.deepEqual(p7.seq, [61, 193, 153, 33, 112, 72, 161, 214, 247, 189]);
assert.equal(p7.repeat, root);
assert.equal(p7.seq.length, 10);
assert.equal(base32(p7.seq), 'hxazsilqjcq5n555');
assert.equal(p7Base60.seq.length, 18);
assert.equal(p7Base60.repeat, 115);

const originalLengths = allPathLengths(values59);
const originalLength10Count = Array.from(originalLengths).filter((x) => x === 10).length;
assert.equal(originalLength10Count, 8);

function unconditionalMultisetNull(trials, seed) {
  const random = makeRng(seed);
  const histogram = new Uint32Array(n + 1);
  let start61 = 0;
  let any = 0;
  let sum = 0;
  for (let trial = 0; trial < trials; trial += 1) {
    const mapping = shuffle(values59, random);
    const lengths = allPathLengths(mapping);
    let count = 0;
    for (let i = 0; i < n; i += 1) {
      if (lengths[i] === 10) count += 1;
    }
    histogram[count] += 1;
    sum += count;
    if (count > 0) any += 1;
    if (lengths[start] === 10) start61 += 1;
  }
  const mean = sum / trials;
  let variance = 0;
  for (let count = 0; count < histogram.length; count += 1) {
    variance += histogram[count] * (count - mean) ** 2 / trials;
  }
  const atLeastObserved = histogram.reduce(
    (total, value, count) => total + (count >= originalLength10Count ? value : 0),
    0
  );
  return {
    trials,
    seed: '0x' + seed.toString(16),
    observedLength10Starts: originalLength10Count,
    meanCount: mean,
    sdCount: Math.sqrt(variance),
    pCountAtLeastObserved: atLeastObserved / trials,
    pAnyLength10: any / trials,
    pFixedStart61Length10: start61 / trials
  };
}

class MinHeap {
  constructor() { this.items = []; }
  push(value) {
    const a = this.items;
    let i = a.length;
    a.push(value);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (a[parent] <= value) break;
      a[i] = a[parent];
      i = parent;
    }
    a[i] = value;
  }
  pop() {
    const a = this.items;
    const minimum = a[0];
    const last = a.pop();
    if (a.length > 0) {
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = left + 1;
        if (left >= a.length) break;
        const child = right < a.length && a[right] < a[left] ? right : left;
        if (a[child] >= last) break;
        a[i] = a[child];
        i = child;
      }
      a[i] = last;
    }
    return minimum;
  }
  get size() { return this.items.length; }
}

function fixedRootTreeNull(trials, seed) {
  const multiplicity = new Uint16Array(n);
  for (const value of values59) multiplicity[value] += 1;
  assert.equal(multiplicity[root], 4);

  // For a tree oriented toward fixed root r with one root self-loop,
  // the Prüfer multiplicity is c[v] for v != r and c[r]-2 for r.
  const pruferCounts = Array.from(multiplicity, (count, value) =>
    value === root ? count - 2 : count
  );
  const expanded = [];
  for (let value = 0; value < n; value += 1) {
    for (let k = 0; k < pruferCounts[value]; k += 1) expanded.push(value);
  }
  assert.equal(expanded.length, n - 2);

  const random = makeRng(seed);
  const histogram = new Uint32Array(n + 1);
  const head = new Int16Array(n);
  const to = new Int16Array(2 * (n - 1));
  const nextEdge = new Int16Array(2 * (n - 1));
  const degree = new Int16Array(n);
  const depth = new Int16Array(n);
  const queue = new Int16Array(n);
  let start61 = 0;
  let sum = 0;

  for (let trial = 0; trial < trials; trial += 1) {
    const sequence = shuffle(expanded, random);
    head.fill(-1);
    for (let value = 0; value < n; value += 1) {
      degree[value] = pruferCounts[value] + 1;
    }
    let edge = 0;
    function addEdge(a, b) {
      to[edge] = b;
      nextEdge[edge] = head[a];
      head[a] = edge;
      edge += 1;
      to[edge] = a;
      nextEdge[edge] = head[b];
      head[b] = edge;
      edge += 1;
    }

    const leaves = new MinHeap();
    for (let value = 0; value < n; value += 1) {
      if (degree[value] === 1) leaves.push(value);
    }
    for (const value of sequence) {
      const leaf = leaves.pop();
      addEdge(leaf, value);
      degree[leaf] -= 1;
      degree[value] -= 1;
      if (degree[value] === 1) leaves.push(value);
    }
    assert.equal(leaves.size, 2);
    addEdge(leaves.pop(), leaves.pop());

    depth.fill(-1);
    let read = 0;
    let write = 0;
    queue[write] = root;
    write += 1;
    depth[root] = 0;
    while (read < write) {
      const vertex = queue[read];
      read += 1;
      for (let e = head[vertex]; e !== -1; e = nextEdge[e]) {
        const neighbor = to[e];
        if (depth[neighbor] !== -1) continue;
        depth[neighbor] = depth[vertex] + 1;
        queue[write] = neighbor;
        write += 1;
      }
    }
    assert.equal(write, n);
    let count = 0;
    for (let value = 0; value < n; value += 1) {
      if (depth[value] === 9) count += 1;
    }
    histogram[count] += 1;
    sum += count;
    if (depth[start] === 9) start61 += 1;
  }

  const mean = sum / trials;
  let variance = 0;
  for (let count = 0; count < histogram.length; count += 1) {
    variance += histogram[count] * (count - mean) ** 2 / trials;
  }
  const atLeastObserved = histogram.reduce(
    (total, value, count) => total + (count >= originalLength10Count ? value : 0),
    0
  );
  return {
    trials,
    seed: '0x' + seed.toString(16),
    fixedRoot: root,
    rootMultiplicity: multiplicity[root],
    pruferSequenceLength: expanded.length,
    observedDepth9Vertices: originalLength10Count,
    meanCount: mean,
    sdCount: Math.sqrt(variance),
    pCountAtLeastObserved: atLeastObserved / trials,
    pFixedStart61Depth9: start61 / trials
  };
}

const result = {
  source: 'resources/liber-primus/base60-grid.json; original p49-p51 32x8 table',
  conditionalRadix: 'base59 = source alphabet with lowercase f removed; not globally authenticated',
  candidate: {
    start,
    path: p7.seq,
    repeatedAddress: p7.repeat,
    byteHex: p7.seq.map((x) => x.toString(16).padStart(2, '0')).join(''),
    base32: base32(p7.seq)
  },
  base60CompetingPath: {
    path: p7Base60.seq,
    repeatedAddress: p7Base60.repeat,
    length: p7Base60.seq.length
  },
  original: {
    length10Starts: originalLength10Count,
    targetMultiplicityAtRoot: 4
  },
  unconditionalMultisetNull: unconditionalMultisetNull(250000, 0x33012423),
  fixedRootTreeNull: fixedRootTreeNull(100000, 0x33012424),
  interpretation: 'A ten-byte path always serializes to 16 Base32 characters. The nulls do not authenticate the candidate as a Cicada destination.'
};

console.log(JSON.stringify(result, null, 2));
