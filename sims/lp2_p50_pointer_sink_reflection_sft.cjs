"use strict";

/**
 * p50 base59 pointer-sink + source-reflection + authenticated DH closure.
 * SFT: node sims/lp2_p50_pointer_sink_reflection_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const dhSource = fs.readFileSync(
  path.join(ROOT, "resources/external/2013-tcp-server-signed-source.md"), "utf8");
assert.match(dhSource,
  /worked DH 23 exchange: server base 5 and public share 8, client public share 19, shared key 2/u);

const dh = {p:23, g:5, A:8, B:19, K:2};
const a60 = grid.alphabet;
const a59 = a60.replace("f", "");
assert.equal(a60.length, 60);
assert.equal(a59.length, 59);
assert.equal(grid.bytes.length, 256);

/** @param {number} value */
function tokenFrom60(value) {
  return a60[Math.floor(value / 60)] + a60[value % 60];
}
/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  return alphabet.length * alphabet.indexOf(token[0]) + alphabet.indexOf(token[1]);
}
const tokens = grid.bytes.map(tokenFrom60);
const values60 = tokens.map((token) => decode(token, a60));
const values59 = tokens.map((token) => decode(token, a59));
assert.deepEqual(values60, grid.bytes);
const missingSymbols = [...a60].filter((ch) => !tokens.join("").includes(ch));
assert.deepEqual(missingSymbols, ["f"]);
assert.ok(values59.every((value) => value >= 0 && value < 256));

const width = 8;
assert.equal(width, dh.A);
const sinkCell = dh.p * width + dh.g;
assert.equal(sinkCell, 189);
/** @param {number} cell */
function reflect(cell) {
  return Math.floor(cell / width) * width + (width - 1 - cell % width);
}
const reflectedCell = reflect(sinkCell);
assert.equal(width - 1 - dh.g, dh.K);
assert.equal(reflectedCell, dh.p * width + dh.K);
assert.equal(reflectedCell, 186);

// Prior work already established the base59 all-to-189 pointer sink. This SFT
// rechecks it because the new result composes that sink with the independent
// source-selected horizontal reflection and the authenticated DH tuple.
assert.equal(tokens[sinkCell], "3C");
assert.equal(values59[sinkCell], sinkCell);
assert.equal(values60[sinkCell], 192);
assert.equal(tokens[reflectedCell], "0J");
assert.equal(values59[reflectedCell], dh.B);
assert.equal(values60[reflectedCell], dh.B);

/** @param {number[]} map @param {number} root */
function allReachRoot(map, root) {
  if (map[root] !== root) return false;
  const done = new Uint8Array(map.length);
  done[root] = 1;
  for (let start = 0; start < map.length; start += 1) {
    if (done[start]) continue;
    let cell = start;
    const pathNodes = [];
    const local = new Set();
    while (!done[cell]) {
      if (local.has(cell)) return false;
      local.add(cell);
      pathNodes.push(cell);
      cell = map[cell];
    }
    for (const node of pathNodes) done[node] = 1;
  }
  return true;
}
assert.equal(allReachRoot(values59, sinkCell), true);
assert.equal(allReachRoot(values60, sinkCell), false);

/** @param {number} base @param {number} exponent @param {number} modulus */
function powMod(base, exponent, modulus) {
  let out = 1;
  for (let i = 0; i < exponent; i += 1) out = out * base % modulus;
  return out;
}
/** @param {number} base @param {number} value @param {number} modulus */
function discreteLog(base, value, modulus) {
  let x = 1;
  for (let exponent = 0; exponent < modulus - 1; exponent += 1) {
    if (x === value) return exponent;
    x = x * base % modulus;
  }
  return null;
}
const a = discreteLog(dh.g, dh.A, dh.p);
const b = discreteLog(dh.g, dh.B, dh.p);
assert.equal(a, 6);
assert.equal(b, 15);
assert.equal(powMod(dh.B, a, dh.p), dh.K);

/** @param {number} value @param {number} modulus */
function inverseMod(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if (value * candidate % modulus === 1) return candidate;
  }
  return null;
}
const e = inverseMod(b, dh.p - 1);
assert.equal(e, 3);
const reconstructedState = {p:dh.p,g:dh.g,a,b,A:width,B:values59[reflectedCell],K:width-1-dh.g,e};
assert.deepEqual(reconstructedState, {p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3});

// Complete finite DH23 charge: preserve p=23,g=5 and enumerate all 22x22
// nonzero exponent residues. The table width fixes A=8; the source mirror
// fixes K=A-1-g=2; the mirrored cell fixes B=19.
const dhFamily = [];
const mirrorStateFamily = [];
const fullGeometryFamily = [];
for (let candidateA = 1; candidateA <= dh.p - 1; candidateA += 1) {
  const publicA = powMod(dh.g, candidateA, dh.p);
  for (let candidateB = 1; candidateB <= dh.p - 1; candidateB += 1) {
    const publicB = powMod(dh.g, candidateB, dh.p);
    const shared = powMod(publicB, candidateA, dh.p);
    const row = {a:candidateA,b:candidateB,A:publicA,B:publicB,K:shared};
    dhFamily.push(row);
    if (publicA === width && shared === width - 1 - dh.g) {
      mirrorStateFamily.push(row);
      if (publicB === values59[reflectedCell]) fullGeometryFamily.push(row);
    }
  }
}
assert.equal(dhFamily.length, 484);
assert.deepEqual(mirrorStateFamily, [
  {a:6,b:4,A:8,B:4,K:2},
  {a:6,b:15,A:8,B:19,K:2}
]);
assert.deepEqual(fullGeometryFamily, [
  {a:6,b:15,A:8,B:19,K:2}
]);

// Exact coordinate-placement charge under a uniform permutation of all 256
// source tokens. Value 19 is unique in both radices; value189 occurs four
// times in base59 and twice in base60. The two sink-value token classes are
// disjoint, so the either-radix placement probabilities add.
const count = (array, wanted) => array.filter((value) => value === wanted).length;
assert.equal(count(values59, 189), 4);
assert.equal(count(values60, 189), 2);
assert.equal(count(values59, 19), 1);
assert.equal(count(values60, 19), 1);
const placement59 = 4 / (256 * 255);
const placement60 = 2 / (256 * 255);
const placementEither = placement59 + placement60;
assert.equal(placementEither, 1 / 10880);

/** @param {number} seed */
function mulberry32(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6D2B79F5) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}
/** @param {number[]} array @param {() => number} random */
function shuffle(array, random) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = array[i]; array[i] = array[j]; array[j] = tmp;
  }
}
/** @param {number[]} values @param {number} wanted */
function removeOne(values, wanted) {
  const out = values.slice();
  const index = out.indexOf(wanted);
  assert.ok(index >= 0);
  out.splice(index, 1);
  return out;
}
/**
 * Importance-sample the basin condition after forcing the two independently
 * locked coordinate values: sinkCell=189 and mirror(sinkCell)=19.
 * @param {number[]} sourceValues
 * @param {number} trials
 * @param {number} seed
 */
function conditionedFullBasin(sourceValues, trials, seed) {
  const remaining = removeOne(removeOne(sourceValues, 189), 19);
  const positions = Array.from({length:256}, (_, i) => i)
    .filter((i) => i !== sinkCell && i !== reflectedCell);
  const map = new Array(256);
  map[sinkCell] = 189;
  map[reflectedCell] = 19;
  const random = mulberry32(seed);
  let hits = 0;
  for (let trial = 0; trial < trials; trial += 1) {
    shuffle(remaining, random);
    for (let i = 0; i < positions.length; i += 1) map[positions[i]] = remaining[i];
    if (allReachRoot(map, sinkCell)) hits += 1;
  }
  return {trials, hits, conditionalRate:hits/trials};
}

/** @param {number} trials @param {number} seed */
function conditionedRowBasin59(trials, seed) {
  // Under within-row shuffles, base60 cannot self-point at 189 because row23
  // contains no base60 value189. Base59 row23 contains one 189 and one19.
  assert.equal(values60.slice(184,192).includes(189), false);
  assert.equal(count(values59.slice(184,192), 189), 1);
  assert.equal(count(values59.slice(184,192), 19), 1);
  const rowValues = [];
  const rowPositions = [];
  for (let row = 0; row < 32; row += 1) {
    const values = [];
    const positions = [];
    for (let col = 0; col < 8; col += 1) {
      const cell = row * 8 + col;
      if (cell === sinkCell || cell === reflectedCell) continue;
      values.push(values59[cell]); positions.push(cell);
    }
    rowValues.push(values); rowPositions.push(positions);
  }
  const map = new Array(256);
  map[sinkCell] = 189;
  map[reflectedCell] = 19;
  const random = mulberry32(seed);
  let hits = 0;
  for (let trial = 0; trial < trials; trial += 1) {
    for (let row = 0; row < 32; row += 1) {
      shuffle(rowValues[row], random);
      for (let i = 0; i < rowPositions[row].length; i += 1) {
        map[rowPositions[row][i]] = rowValues[row][i];
      }
    }
    if (allReachRoot(map, sinkCell)) hits += 1;
  }
  return {trials, hits, conditionalRate:hits/trials};
}

const fullTrials = Number(process.env.LP_POINTER_TRIALS || 300000);
const rowTrials = Number(process.env.LP_POINTER_ROW_TRIALS || 200000);
const full59 = conditionedFullBasin(values59, fullTrials, 20261128);
const full60 = conditionedFullBasin(values60, fullTrials, 20261128 ^ 0x9E3779B9);
const row59 = conditionedRowBasin59(rowTrials, 20261128 ^ 0x85EBCA6B);
const estimatedFullJointRate =
  placement59 * full59.conditionalRate + placement60 * full60.conditionalRate;
const rowPlacement59 = 1 / (8 * 7);
const estimatedRowJointRate = rowPlacement59 * row59.conditionalRate;

console.log(JSON.stringify({
  classification:"prior sink + new source-reflection/DH closure; no unknown plaintext",
  priorRechecked:{base59AllTo189:true,base60AllTo189:false},
  dhGeometry:{
    width, widthEqualsA:dh.A, sinkCell, sinkCoordinates:[dh.p,dh.g],
    mirrorColumn:width-1-dh.g, mirrorColumnEqualsK:dh.K,
    reflectedCell, reflectedToken:tokens[reflectedCell], reflectedValue:dh.B,
    derivedPrivateExponents:{a,b}, inverseExponent:e,
    reconstructedState, sharedFromB:powMod(dh.B,a,dh.p)
  },
  exactPlacementCharge:{placement59,placement60,placementEither},
  conditionalBasinMonteCarlo:{full59,full60,row59},
  estimatedJointRates:{
    fullTokenShuffleEitherRadix:estimatedFullJointRate,
    rowConditionedBase59:estimatedRowJointRate
  }
}, null, 2));
