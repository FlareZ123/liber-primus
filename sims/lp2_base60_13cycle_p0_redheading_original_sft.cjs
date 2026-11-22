'use strict';

/**
 * Source-original, read-only Node22 SFT: conventional radix60 p50's 11+2
 * directed-cycle nodes as the 13 visible red p0-heading key labels.
 *
 * This is an exploratory, unselected cipher hypothesis; no plaintext is
 * assumed. The full untouched p0-p2 body (716 symbols) and p54-p55 terminal
 * (308 symbols) are tested with the same source-built 256-state pad.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
/** @param {string} name @returns {any} */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'resources',
    'liber-primus', name), 'utf8'));
}
const grid = load('base60-grid.json');
const corpus = load('lp2-corpus.json');
const mod29 = (v) => ((v % 29) + 29) % 29;
/** @param {number} p @returns {number[]} */
const page = (p) => corpus.pages.find((r) => r.page === p).indices;
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
assert.equal(grid.alphabet, alphabet);
const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const next = tokens.map((t) => 60 * alphabet.indexOf(t[0]) + alphabet.indexOf(t[1]));
assert(next.every((v) => v >= 0 && v < 256));
const visited = new Uint8Array(256);
const cycles = [];
for (let start = 0; start < 256; start++) {
  if (visited[start]) continue;
  const here = new Map();
  const walk = [];
  let node = start;
  while (!visited[node] && !here.has(node)) {
    here.set(node, walk.length);
    walk.push(node);
    node = next[node];
  }
  if (here.has(node)) cycles.push(walk.slice(here.get(node)));
  walk.forEach((i) => { visited[i] = 1; });
}
cycles.sort((a, b) => Math.min(...a) - Math.min(...b));
assert.deepEqual(cycles.map((c) => c.length), [11, 2]);
assert.deepEqual(cycles.map((c) => Math.min(...c)), [0, 158]);
const cycleOrder = cycles.flatMap((cycle) => {
  const start = Math.min(...cycle);
  const out = [start];
  let i = next[start];
  while (i !== start) {
    out.push(i);
    i = next[i];
  }
  return out;
});
assert.deepEqual(cycleOrder, [0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192, 158, 249]);
const addressOrder = cycleOrder.slice().sort((a, b) => a - b);
const heading = page(0).slice(0, 13);
const body = page(0).slice(13).concat(page(1), page(2));
const p55 = page(55);
const terminal = page(54).concat(p55);
const clear = page(57);
assert.equal(heading.length, 13);
assert.equal(body.length, 716);
assert.equal(p55.length, 76);
assert.equal(terminal.length, 308);
assert.equal(clear.length, 95);
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const f = Array(29).fill(0);
  a.forEach((v) => { f[v]++; });
  return f.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
/**
 * Traverse each printed table address until one of its 13 cycle labels;
 * the terminal cycle label is the key for that address.
 * @param {number[]} order
 * @param {boolean} reverse
 * @param {boolean} primes
 * @returns {number[]}
 */
function buildKey(order, reverse, primes) {
  const labels = Array(256).fill(-1);
  for (let i = 0; i < heading.length; i++) {
    const rune = heading[reverse ? 12 - i : i];
    labels[order[i]] = primes ? corpus.prime[rune] % 29 : rune;
  }
  return next.map((unused, origin) => {
    let i = origin;
    let count = 0;
    while (labels[i] < 0) {
      i = next[i];
      assert(++count < 256, 'broken graph cycle assignment');
    }
    return labels[i];
  });
}
/**
 * @param {number[]} seq
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[]}
 */
function apply(seq, key, sign) {
  return seq.map((v, i) => mod29(v + sign * key[i % 256]));
}
const experiments = [];
for (const orderName of ['address', 'cycle']) {
  const order = orderName === 'address' ? addressOrder : cycleOrder;
  for (const reverse of [false, true]) for (const primes of [false, true]) {
    const key = buildKey(order, reverse, primes);
    for (const sign of [-1, +1]) {
      const plainBody = apply(body, key, sign);
      const plain55 = apply(p55, key, sign);
      const plainTerminal = apply(terminal, key, sign);
      assert.deepEqual(apply(plainBody, key, -sign), body);
      assert.deepEqual(apply(plain55, key, -sign), p55);
      assert.deepEqual(apply(plainTerminal, key, -sign), terminal);
      const plant = clear.slice(0, 76);
      assert.deepEqual(apply(apply(plant, key, -sign), key, sign), plant);
      experiments.push({
        orderName, reverse, primes, sign,
        iocBody: ioc(plainBody), ioc55: ioc(plain55),
        iocTerminal: ioc(plainTerminal),
        bodyPrefix: plainBody.slice(0, 24).map((v) => corpus.translit[v]).join(' '),
        p55Prefix: plain55.slice(0, 24).map((v) => corpus.translit[v]).join(' ')
      });
    }
  }
}
assert.equal(experiments.length, 16);
const bestBody = experiments.slice().sort((a, b) => b.iocBody - a.iocBody)[0];
const best55 = experiments.slice().sort((a, b) => b.ioc55 - a.ioc55)[0];
const bestTerminal = experiments.slice().sort((a, b) => b.iocTerminal - a.iocTerminal)[0];
assert(Math.abs(bestBody.iocBody - 0.034730632495995624) < 1e-12);
assert(Math.abs(best55.ioc55 - 0.03894736842105263) < 1e-12);
assert(Math.abs(bestTerminal.iocTerminal - 0.0343711662929904) < 1e-12);
console.log(JSON.stringify({
  source: { graphBase: 60, sourceCells: tokens.length,
    sourceDirectedCycleLengths: cycles.map((c) => c.length),
    cycleNodeOrder: cycleOrder, headingGP: heading,
    originalBody: body.length, originalP55: p55.length,
    originalFinalChapter: terminal.length },
  rawIoC: { body: ioc(body), p55: ioc(p55),
    terminal: ioc(terminal), clearP57: ioc(clear) },
  cases: experiments.length, bestBody, best55, bestTerminal,
  all16ForwardReconstructions: true, all16NativeP57Plants: true,
  verdict: 'No source-selected plaintext or nonchance English-like GP29 output.'
}, null, 2));
