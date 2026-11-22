"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")
);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} left @param {number[]} right @returns {number[]} */
function sub(left, right) {
  return left.map((value, index) => mod29(value - right[index]));
}

/** @param {number[]} left @param {number[]} right @returns {number[]} */
function add(left, right) {
  return left.map((value, index) => mod29(value + right[index]));
}

/** @param {number[]} left @param {number[]} right @returns {boolean} */
function same(left, right) {
  return left.length === right.length &&
    left.every((value, index) => value === right[index]);
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  if (values.length <= 1) return [values.slice()];
  const out = [];
  for (let index = 0; index < values.length; index += 1) {
    const head = values[index];
    const tail = values.slice(0, index).concat(values.slice(index + 1));
    for (const rest of permutations(tail)) out.push([head, ...rest]);
  }
  return out;
}

const p35 = corpus.pages.find((page) => page.page === 35);
const p38 = corpus.pages.find((page) => page.page === 38);
assert.ok(p35 && p38);

const found = [0, 3, 1, 9, 23];
const cipher35 = p35.indices.slice(25, 30);
const cipher38 = p38.indices.slice(49, 54);
assert.deepEqual(cipher35, [19, 17, 19, 24, 11]);
assert.deepEqual(cipher38, [19, 25, 22, 26, 3]);

// Normalize both local recoveries as an additive decryption vector P-C.
const addKey35 = sub(found, cipher35);
const addKey38 = sub(found, cipher38);
assert.deepEqual(addKey35, [10, 15, 11, 14, 12]);
assert.deepEqual(addKey38, [10, 7, 8, 12, 20]);
assert.deepEqual(add(cipher35, addKey35), found);
assert.deepEqual(add(cipher38, addKey38), found);

// Published p35 grammar: [x,-y,u-v,y,y+K], with fields drawn from
// {p,g,a,b,A,B,K,e,q}. Charge every field tuple, every coordinate
// permutation and both global signs. Reversal is already one permutation.
const state = { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 };
const stateValues = Object.values(state);
const coordinatePermutations = permutations([0, 1, 2, 3, 4]);
assert.equal(coordinatePermutations.length, 120);

let p35GrammarPublishedHits = 0;
let p35GrammarAnyHits = 0;
let p38GrammarAnyHits = 0;
let p35GrammarCommonTupleHits = 0;
const distinctP35GrammarKeys = new Set();

for (const x of stateValues) {
  for (const y of stateValues) {
    for (const u of stateValues) {
      for (const v of stateValues) {
        const raw = [x, mod29(-y), mod29(u - v), y, mod29(y + state.K)];
        distinctP35GrammarKeys.add(raw.join(","));

        if (same(raw, sub(cipher35, found))) p35GrammarPublishedHits += 1;

        let matches35 = false;
        let matches38 = false;
        for (const order of coordinatePermutations) {
          const ordered = order.map((index) => raw[index]);
          for (const sign of [1, -1]) {
            const key = ordered.map((value) => mod29(sign * value));
            if (same(key, addKey35)) matches35 = true;
            if (same(key, addKey38)) matches38 = true;
          }
        }
        if (matches35) p35GrammarAnyHits += 1;
        if (matches38) p38GrammarAnyHits += 1;
        if (matches35 && matches38) p35GrammarCommonTupleHits += 1;
      }
    }
  }
}

assert.equal(stateValues.length ** 4, 6561);
assert.equal(distinctP35GrammarKeys.size, 2349);
assert.equal(p35GrammarPublishedHits, 3);
assert.equal(p35GrammarAnyHits, 3);
assert.equal(p38GrammarAnyHits, 0);
assert.equal(p35GrammarCommonTupleHits, 0);

// A broader-than-p38 lookup control uses every numeric atom admitted by the
// prior direct/HERE/DH union. If a required key coordinate is absent from this
// superset, no narrower p38 lookup descriptor can express the recovery.
const p38LookupUnion = new Set([
  2, 3, 5, 6, 7, 8, 10, 12, 15, 17, 19, 20, 22, 23, 24, 26, 28,
]);

const p35AddMissing = addKey35.filter((value) => !p38LookupUnion.has(value));
const p35SubtractMissing = sub(cipher35, found)
  .filter((value) => !p38LookupUnion.has(value));
assert.deepEqual(p35AddMissing, [11, 14]);
assert.deepEqual(p35SubtractMissing, [14, 18]);
assert.ok(addKey38.every((value) => p38LookupUnion.has(value)));

// Published p38 geometry family. Shell order is
// [d0,s0,d1,s1,center] = H(k0,k4) || H(k1,k3) || [k2].
const inv2 = 15;

/** @param {number[]} shell @returns {number[]} */
function keyFromPairShell(shell) {
  const [d0, s0, d1, s1, center] = shell;
  return [
    mod29((s0 + d0) * inv2),
    mod29((s1 + d1) * inv2),
    center,
    mod29((s1 - d1) * inv2),
    mod29((s0 - d0) * inv2),
  ];
}

/**
 * @typedef {{page:number,start:number,end:number,length:number,span:number}} Geometry
 */

/** @returns {{name:string,derive:(geometry:Geometry)=>number[]}[]} */
function geometryRules() {
  const xRules = [
    ["page", (g) => mod29(g.page)],
    ["page/2", (g) => mod29(g.page * inv2)],
    ["2page", (g) => mod29(2 * g.page)],
  ];
  const secondRules = [
    ["start-x", (g, x) => mod29(g.start - x)],
    ["x-start", (g, x) => mod29(x - g.start)],
  ];
  const thirdRules = [
    ["+start", (g) => mod29(g.start)],
    ["-start", (g) => mod29(-g.start)],
    ["+end", (g) => mod29(g.end)],
    ["-end", (g) => mod29(-g.end)],
  ];
  const centerRules = [
    ["+length", (g) => mod29(g.length)],
    ["-length", (g) => mod29(-g.length)],
    ["+span", (g) => mod29(g.span)],
    ["-span", (g) => mod29(-g.span)],
    ["+2span", (g) => mod29(2 * g.span)],
    ["-2span", (g) => mod29(-2 * g.span)],
    ["+2length", (g) => mod29(2 * g.length)],
    ["-2length", (g) => mod29(-2 * g.length)],
  ];

  const placements = [];
  for (let first = 0; first < 4; first += 1) {
    for (let second = first + 1; second < 4; second += 1) {
      const rest = [0, 1, 2, 3]
        .filter((index) => index !== first && index !== second);
      placements.push({ xSlots: [first, second], rest, swap: false });
      placements.push({ xSlots: [first, second], rest, swap: true });
    }
  }
  assert.equal(placements.length, 12);

  const out = [];
  for (const [xName, xRule] of xRules) {
    for (const [yName, yRule] of secondRules) {
      for (const [zName, zRule] of thirdRules) {
        for (const [centerName, centerRule] of centerRules) {
          for (const placement of placements) {
            out.push({
              name: [
                xName,
                yName,
                zName,
                centerName,
                "x@" + placement.xSlots.join(","),
                placement.swap ? "z,y" : "y,z",
              ].join("|"),
              derive(geometry) {
                const x = xRule(geometry);
                const y = yRule(geometry, x);
                const z = zRule(geometry);
                const center = centerRule(geometry);
                const shell = new Array(5);
                shell[4] = center;
                shell[placement.xSlots[0]] = x;
                shell[placement.xSlots[1]] = x;
                const ordered = placement.swap ? [z, y] : [y, z];
                shell[placement.rest[0]] = ordered[0];
                shell[placement.rest[1]] = ordered[1];
                return keyFromPairShell(shell);
              },
            });
          }
        }
      }
    }
  }
  return out;
}

const rules = geometryRules();
assert.equal(rules.length, 2304);

const geometry35 = { page: 35, start: 25, end: 29, length: 5, span: 4 };
const geometry38 = { page: 38, start: 49, end: 53, length: 5, span: 4 };
let geometryP35Hits = 0;
let geometryP38Hits = 0;
let geometryCommonHits = 0;
const p38RuleNames = [];

for (const rule of rules) {
  const base35 = rule.derive(geometry35);
  const base38 = rule.derive(geometry38);
  for (const reverse of [false, true]) {
    const oriented35 = reverse ? base35.slice().reverse() : base35;
    const oriented38 = reverse ? base38.slice().reverse() : base38;
    for (const sign of [1, -1]) {
      const key35 = oriented35.map((value) => mod29(sign * value));
      const key38 = oriented38.map((value) => mod29(sign * value));
      const hit35 = same(key35, addKey35);
      const hit38 = same(key38, addKey38);
      if (hit35) geometryP35Hits += 1;
      if (hit38) {
        geometryP38Hits += 1;
        p38RuleNames.push(rule.name + "|reverse=" + reverse + "|sign=" + sign);
      }
      if (hit35 && hit38) geometryCommonHits += 1;
    }
  }
}

assert.equal(rules.length * 2 * 2, 9216);
assert.equal(geometryP35Hits, 0);
assert.equal(geometryP38Hits, 1);
assert.equal(geometryCommonHits, 0);
assert.deepEqual(p38RuleNames, [
  "page/2|start-x|+end|+2span|x@0,3|y,z|reverse=false|sign=1",
]);

console.log(JSON.stringify({
  receivers: {
    p35: { cipher: cipher35, addKey: addKey35 },
    p38: { cipher: cipher38, addKey: addKey38 },
    plaintext: found,
  },
  p35Grammar: {
    labeledTuples: 6561,
    distinctNumericKeys: distinctP35GrammarKeys.size,
    coordinatePermutations: coordinatePermutations.length,
    globalSigns: 2,
    chargedRepresentations: 6561 * coordinatePermutations.length * 2,
    p35TupleHits: p35GrammarAnyHits,
    p38TupleHits: p38GrammarAnyHits,
    sharedTupleHits: p35GrammarCommonTupleHits,
  },
  p38LookupUnion: {
    numericAtoms: p38LookupUnion.size,
    p35AddMissing,
    p35SubtractMissing,
  },
  p38Geometry: {
    baseRules: rules.length,
    chargedWithOrientationAndSign: rules.length * 4,
    p35Hits: geometryP35Hits,
    p38Hits: geometryP38Hits,
    sharedHits: geometryCommonHits,
    p38Rule: p38RuleNames[0],
  },
}, null, 2));
