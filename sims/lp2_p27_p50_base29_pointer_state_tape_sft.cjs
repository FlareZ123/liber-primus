'use strict';

/**
 * Source-locked test for the p27-selected p50 base59 pointer path viewed as
 * BASE29 address pairs. The path/radix/start/hop count are upstream facts;
 * this file audits the newly observed state serialization without plaintext.
 */

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const GRID_PATH = path.join(
  __dirname,
  '..',
  'resources',
  'liber-primus',
  'lp2-grid-256.json'
);

const grid = JSON.parse(fs.readFileSync(GRID_PATH, 'utf8'));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace('f', '');

assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(tokens.length, 256);
assert.equal(tokens.some((token) => token.includes('f')), false);
assert.equal(grid.pages.reduce((n, page) => n + page.rows, 0), 32);
assert.equal(grid.pages.every((page) => page.tokens.length === page.rows * 8), true);

/** @param {number} x @param {number} m */
function mod(x, m) {
  return ((x % m) + m) % m;
}

/** @param {number} base @param {number} exp @param {number} modulus */
function modPow(base, exp, modulus) {
  let b = mod(base, modulus);
  let e = exp;
  let out = 1;
  while (e > 0) {
    if (e & 1) out = (out * b) % modulus;
    b = (b * b) % modulus;
    e >>= 1;
  }
  return out;
}

/** @param {number} x @param {number} p */
function inverse(x, p) {
  for (let y = 1; y < p; y += 1) {
    if ((x * y) % p === 1) return y;
  }
  throw new Error(`No inverse for ${x} mod ${p}`);
}

/** @param {string} token @param {59|60} base */
function decodeToken(token, base) {
  const alphabet = base === 59 ? alphabet59 : alphabet60;
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.notEqual(hi, -1, `Unknown high digit in ${token}`);
  assert.notEqual(lo, -1, `Unknown low digit in ${token}`);
  return hi * base + lo;
}

const values59 = tokens.map((token) => decodeToken(token, 59));
const values60 = tokens.map((token) => decodeToken(token, 60));
const historicalBase29Alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
assert.equal(historicalBase29Alphabet.length, 29);

/** @param {number} n */
function encodeHistoricalBase29(n) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  if (n === 0) return '0';
  let x = n;
  let out = '';
  while (x > 0) {
    out = historicalBase29Alphabet[x % 29] + out;
    x = Math.floor(x / 29);
  }
  return out;
}


/**
 * @param {number[]} values
 * @param {number} start
 * @param {number} steps
 */
function walk(values, start, steps) {
  const nodes = [];
  let current = start;
  for (let i = 0; i < steps; i += 1) {
    assert.ok(current >= 0 && current < values.length);
    nodes.push(current);
    current = values[current];
  }
  return { nodes, end: current };
}

/** @param {number[]} values */
function adjacentH(values) {
  assert.equal(values.length % 2, 0);
  const out = [];
  for (let i = 0; i < values.length; i += 2) {
    out.push(mod(values[i] - values[i + 1], 29));
    out.push(mod(values[i] + values[i + 1], 29));
  }
  return out;
}

const state = {
  F: 0,
  one: 1,
  K: 2,
  e: 3,
  q: 4,
  g: 5,
  a: 6,
  A: 8,
  b: 15,
  B: 19,
  p: 23,
};

assert.equal(modPow(state.g, state.a, state.p), state.A);
assert.equal(modPow(state.g, state.b, state.p), state.B);
assert.equal(modPow(state.B, state.a, state.p), state.K);
assert.equal(inverse(state.A, 29), 11);

const expectedPath59 = [186, 19, 33, 112, 72, 161, 214, 247, 189];
const path59 = walk(values59, 186, state.A);
assert.deepEqual([...path59.nodes, path59.end], expectedPath59);
const historicalBase29Path = expectedPath59.map(encodeHistoricalBase29);
assert.deepEqual(
  historicalBase29Path,
  ['6C', 'J', '14', '3P', '2E', '5G', '7B', '8F', '6F']
);

// Upstream row-major DH geometry, now cross-read in BASE29.
assert.equal(state.p * state.A + state.K, 186);
assert.equal(state.p * state.A + state.g, 189);
assert.equal(state.a * 29 + mod(state.a * state.K, 29), 186);
assert.equal(state.a * 29 + state.b, 189);
assert.equal(values59[186], state.B);
assert.equal(values59[189], 189);

const addressPairs = expectedPath59.map((address) => ({
  address,
  high: Math.floor(address / 29),
  low: address % 29,
}));

assert.deepEqual(addressPairs, [
  { address: 186, high: state.a, low: mod(state.a * state.K, 29) },
  { address: 19, high: state.F, low: state.B },
  { address: 33, high: state.one, low: state.q },
  { address: 112, high: state.e, low: mod(-state.q, 29) },
  { address: 72, high: state.K, low: mod(-state.b, 29) },
  { address: 161, high: state.g, low: mod(state.A * state.K, 29) },
  { address: 214, high: state.g + state.K, low: inverse(state.A, 29) },
  { address: 247, high: state.A, low: state.b },
  { address: 189, high: state.a, low: state.b },
]);

const sourceNodeLows = addressPairs.slice(0, 8).map((pair) => pair.low);
assert.deepEqual(sourceNodeLows, [12, 19, 4, 25, 14, 16, 11, 15]);

const hPacket = adjacentH(sourceNodeLows);
const expectedHPacket = [
  state.p - 1,
  state.K,
  state.A,
  state.F,
  mod(-state.K, 29),
  state.one,
  mod(-state.q, 29),
  mod(-state.e, 29),
];
assert.deepEqual(hPacket, expectedHPacket);
assert.deepEqual(hPacket, [22, 2, 8, 0, 27, 1, 25, 26]);

// The competing conventional radix60 walk does not preserve this packet.
const path60 = walk(values60, 186, state.A);
assert.deepEqual(
  [...path60.nodes, path60.end],
  [186, 19, 33, 114, 197, 115, 247, 192, 0]
);
assert.notDeepEqual(adjacentH(path60.nodes.map((address) => address % 29)), hPacket);

// Post-discovery exact census: charge every possible start under each live radix.
// This is descriptive specificity, not a discovery-adjusted authorship p-value.
const targetLowSet = [...sourceNodeLows].sort((a, b) => a - b);

/**
 * @param {number[]} values
 * @returns {{ setHits: number[], hHits: number[] }}
 */
function census(values) {
  const setHits = [];
  const hHits = [];
  for (let start = 0; start < 256; start += 1) {
    const run = walk(values, start, state.A);
    const lows = run.nodes.map((address) => address % 29);
    const sorted = [...lows].sort((a, b) => a - b);
    if (sorted.every((value, i) => value === targetLowSet[i])) {
      setHits.push(start);
    }
    const h = adjacentH(lows);
    if (h.every((value, i) => value === expectedHPacket[i])) {
      hHits.push(start);
    }
  }
  return { setHits, hHits };
}

/**
 * State-label-free structural census of eight-hop quotient/remainder tapes.
 * @param {number[]} values
 */
function structuralCensus(values) {
  const distinctLow = [];
  const distinctHigh = [];
  const both = [];
  const bothThenFixed = [];
  for (let start = 0; start < 256; start += 1) {
    const run = walk(values, start, state.A);
    const lows = run.nodes.map((address) => address % 29);
    const highs = run.nodes.map((address) => Math.floor(address / 29));
    const lowUnique = new Set(lows).size === state.A;
    const highUnique = new Set(highs).size === state.A;
    if (lowUnique) distinctLow.push(start);
    if (highUnique) distinctHigh.push(start);
    if (lowUnique && highUnique) both.push(start);
    if (lowUnique && highUnique && values[run.end] === run.end) {
      bothThenFixed.push(start);
    }
  }
  return { distinctLow, distinctHigh, both, bothThenFixed };
}

const census59 = census(values59);
const census60 = census(values60);
const structural59 = structuralCensus(values59);
const structural60 = structuralCensus(values60);
assert.deepEqual(structural59.distinctHigh, [19, 66, 104, 108, 186, 254]);
assert.deepEqual(structural59.both, [66, 186, 254]);
assert.deepEqual(structural59.bothThenFixed, [186]);
assert.deepEqual(structural60.distinctHigh, []);
assert.deepEqual(structural60.both, []);
assert.deepEqual(structural60.bothThenFixed, []);
assert.deepEqual(census59.setHits, [186]);
assert.deepEqual(census59.hHits, [186]);
assert.deepEqual(census60.setHits, []);
assert.deepEqual(census60.hHits, []);

// Direct first-recipient gate from the integrated inversion challenge:
// use the eight path remainders as an 8-rune GP29 key on the 66+92 runes
// physically flanking the p49-p51 numerical panel. Charge both additive
// signs and the two already documented p51 clocks (reset0 vs continuous66).
const corpus = JSON.parse(
  fs.readFileSync(path.join(path.dirname(GRID_PATH), 'lp2-corpus.json'), 'utf8')
);
const byPage = new Map(corpus.pages.map((page) => [page.page, page]));
const p49 = byPage.get(49).indices;
const p51 = byPage.get(51).indices;
const p57 = byPage.get(57).indices;
assert.equal(p49.length, 66);
assert.equal(p51.length, 92);
assert.equal(p57.length, 95);

/**
 * @param {number[]} input
 * @param {number[]} key
 * @param {number} phase
 * @param {-1|1} sign
 */
function applyAdditive(input, key, phase, sign) {
  return input.map((value, i) => mod(
    value + sign * key[(phase + i) % key.length],
    29
  ));
}

/** @param {number[]} input */
function indexOfCoincidence(input) {
  const counts = Array(29).fill(0);
  for (const value of input) counts[value] += 1;
  const n = input.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (n * (n - 1));
}

/** @param {number[]} input */
function transliterate(input) {
  return input.map((value) => corpus.translit[value]).join('');
}

/**
 * @param {number[]} key
 * @returns {{sign:-1|1,p51Phase:number,ioc:number,p49:string,p51:string}[]}
 */
function flankModels(key) {
  const out = [];
  for (const sign of [-1, 1]) {
    for (const p51Phase of [0, 66]) {
      const plain49 = applyAdditive(p49, key, 0, sign);
      const plain51 = applyAdditive(p51, key, p51Phase, sign);
      assert.deepEqual(applyAdditive(plain49, key, 0, /** @type {-1|1} */ (-sign)), p49);
      assert.deepEqual(
        applyAdditive(plain51, key, p51Phase, /** @type {-1|1} */ (-sign)),
        p51
      );
      out.push({
        sign: /** @type {-1|1} */ (sign),
        p51Phase,
        ioc: indexOfCoincidence([...plain49, ...plain51]),
        p49: transliterate(plain49),
        p51: transliterate(plain51),
      });
    }
  }
  return out;
}

const stateKey = [...sourceNodeLows];
const base60RivalKey = path60.nodes.map((address) => address % 29);
assert.deepEqual(stateKey, [12, 19, 4, 25, 14, 16, 11, 15]);
assert.deepEqual(base60RivalKey, [12, 19, 4, 27, 23, 28, 15, 18]);

const stateFlankModels = flankModels(stateKey);
const rivalFlankModels = flankModels(base60RivalKey);
const bestStateFlankIoC = Math.max(...stateFlankModels.map((model) => model.ioc));
const bestRivalFlankIoC = Math.max(...rivalFlankModels.map((model) => model.ioc));
assert.ok(Math.abs(bestStateFlankIoC - 0.03732967830363622) < 1e-15);
assert.ok(Math.abs(bestRivalFlankIoC - 0.03861968878497138) < 1e-15);
assert.ok(bestStateFlankIoC < bestRivalFlankIoC);

const stateHKey = [...hPacket];
const base60RivalHKey = adjacentH(path60.nodes.map((address) => address % 29));
assert.deepEqual(stateHKey, [22, 2, 8, 0, 27, 1, 25, 26]);
assert.deepEqual(base60RivalHKey, [22, 2, 6, 2, 24, 22, 26, 4]);
const stateHFlankModels = flankModels(stateHKey);
const rivalHFlankModels = flankModels(base60RivalHKey);
const bestStateHFlankIoC = Math.max(...stateHFlankModels.map((model) => model.ioc));
const bestRivalHFlankIoC = Math.max(...rivalHFlankModels.map((model) => model.ioc));
assert.ok(Math.abs(bestStateHFlankIoC - 0.03813593485447069) < 1e-15);
assert.ok(Math.abs(bestRivalHFlankIoC - 0.03668467306296864) < 1e-15);
assert.ok(indexOfCoincidence(p57) > 0.06);

// Native GP implementation plant: encrypt solved p57 with the state key and
// recover it exactly with the conventional subtraction inverse.
const p57PlantCipher = applyAdditive(p57, stateKey, 0, 1);
const p57PlantRecovered = applyAdditive(p57PlantCipher, stateKey, 0, -1);
assert.deepEqual(p57PlantRecovered, p57);

const summary = {
  dhState: state,
  path59: expectedPath59,
  historicalBase29Path,
  base29Pairs: addressPairs,
  sourceNodeLows,
  adjacentHPacket: hPacket,
  dualPacking: {
    start186: {
      rowMajor: `${state.p}*${state.A}+${state.K}`,
      base29: `${state.a}*29+${mod(state.a * state.K, 29)}`,
      cellValue59: values59[186],
    },
    sink189: {
      rowMajor: `${state.p}*${state.A}+${state.g}`,
      base29: `${state.a}*29+${state.b}`,
      cellValue59: values59[189],
    },
  },
  base59Census: census59,
  base60Census: census60,
  structuralCensus: { base59: structural59, base60: structural60 },
  base60Path: [...path60.nodes, path60.end],
  flankGate: {
    ciphertextIoC: indexOfCoincidence([...p49, ...p51]),
    solvedP57IoC: indexOfCoincidence(p57),
    stateKey,
    base60RivalKey,
    stateModels: stateFlankModels,
    base60RivalModels: rivalFlankModels,
    bestStateIoC: bestStateFlankIoC,
    bestBase60RivalIoC: bestRivalFlankIoC,
    hStateKey: stateHKey,
    hBase60RivalKey: base60RivalHKey,
    hStateModels: stateHFlankModels,
    hBase60RivalModels: rivalHFlankModels,
    bestHStateIoC: bestStateHFlankIoC,
    bestHBase60RivalIoC: bestRivalHFlankIoC,
    nativePlantRecovered95of95: p57PlantRecovered.length,
  },
};

console.log(JSON.stringify(summary, null, 2));
console.log('PASS lp2_p27_p50_base29_pointer_state_tape_sft');
