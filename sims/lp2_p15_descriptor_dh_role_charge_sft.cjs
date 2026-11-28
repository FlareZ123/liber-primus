"use strict";

const assert = require("node:assert/strict");

const MOD = 29;

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

const descriptors = {
  "w1.L": 4,
  "w1.S": 22,
  "w1.P": 10,
  "w2.L": 2,
  "w2.S": 6,
  "w2.P": 5,
  "w3.L": 5,
  "w3.S": 5,
  "w3.P": 0,
};

// The state values whose descriptor provenance is under audit. These are the
// already-known DH/state targets; matching them is not counted as new recovery.
const target = { K: 2, a: 6, g: 5, q: 4, F: 0, p: 23 };
const roles = Object.keys(target);

const transforms = [
  { name: "x", apply: (x) => mod(x), cost: 0 },
  { name: "-x", apply: (x) => mod(-x), cost: 1 },
  { name: "x+1", apply: (x) => mod(x + 1), cost: 1 },
  { name: "x-1", apply: (x) => mod(x - 1), cost: 1 },
];

/** @returns {Record<string, Array<{field:string,transform:string,cost:number}>>} */
function roleHits(transformList = transforms) {
  const out = {};
  for (const role of roles) {
    out[role] = [];
    for (const [field, value] of Object.entries(descriptors)) {
      for (const transform of transformList) {
        if (transform.apply(value) === target[role]) {
          out[role].push({ field, transform: transform.name, cost: transform.cost });
        }
      }
    }
  }
  return out;
}

/**
 * Enumerate injective descriptor-field allocations. A physical descriptor cell
 * cannot simultaneously be the provenance of two independent state roles.
 * @param {Record<string, Array<{field:string,transform:string,cost:number}>>} hits
 * @param {Set<string>|null} allowedFields
 * @returns {Array<Record<string,{field:string,transform:string,cost:number}>>}
 */
function enumerate(hits, allowedFields = null) {
  const out = [];
  /** @param {number} index @param {Set<string>} used @param {Record<string,any>} current */
  function visit(index, used, current) {
    if (index === roles.length) {
      out.push({ ...current });
      return;
    }
    const role = roles[index];
    for (const hit of hits[role]) {
      if (allowedFields && !allowedFields.has(hit.field)) continue;
      if (used.has(hit.field)) continue;
      used.add(hit.field);
      current[role] = hit;
      visit(index + 1, used, current);
      delete current[role];
      used.delete(hit.field);
    }
  }
  visit(0, new Set(), {});
  return out;
}

/** @param {Record<string,{field:string,transform:string,cost:number}>} mapping */
function fieldAllocationSignature(mapping) {
  return roles.map((role) => `${role}:${mapping[role].field}`).join("|");
}

/** @param {Record<string,{field:string,transform:string,cost:number}>} mapping */
function numericMappingSignature(mapping) {
  // At the observed zero cell, x and -x are the same numeric provenance.
  return roles.map((role) => {
    const hit = mapping[role];
    const transform = descriptors[hit.field] === 0 && hit.transform === "-x" ? "x" : hit.transform;
    return `${role}:${hit.field}:${transform}`;
  }).join("|");
}

const hits = roleHits();
const narrowHits = roleHits(transforms.filter((entry) => entry.name === "x" || entry.name === "x+1"));
const allMaps = enumerate(hits);
assert.equal(allMaps.length, 114);
assert.equal(new Set(allMaps.map(fieldAllocationSignature)).size, 57);

// Reserve the three cells that the published interpretation treats as internal
// redundancy rather than primary state-role sources.
const heldFields = new Set(["w1.P", "w3.L", "w3.S"]);
const selectionFields = new Set(Object.keys(descriptors).filter((field) => !heldFields.has(field)));
const sealedMaps = enumerate(hits, selectionFields);
assert.equal(sealedMaps.length, 6);
const sealedNumeric = new Map();
for (const mapping of sealedMaps) {
  const signature = numericMappingSignature(mapping);
  const prior = sealedNumeric.get(signature);
  const cost = roles.reduce((acc, role) => acc + mapping[role].cost, 0);
  const priorCost = prior ? roles.reduce((acc, role) => acc + prior[role].cost, 0) : Number.POSITIVE_INFINITY;
  if (!prior || cost < priorCost) sealedNumeric.set(signature, mapping);
}
assert.equal(sealedNumeric.size, 3);

const narrowSealedMaps = enumerate(narrowHits, selectionFields);
assert.equal(narrowSealedMaps.length, 1);

const numericAlternatives = [...sealedNumeric.values()].map((mapping) => ({
  mapping: Object.fromEntries(roles.map((role) => [role, `${mapping[role].field}:${mapping[role].transform}`])),
  transformCost: roles.reduce((acc, role) => acc + mapping[role].cost, 0),
})).sort((a, b) => a.transformCost - b.transformCost || JSON.stringify(a.mapping).localeCompare(JSON.stringify(b.mapping)));

assert.deepEqual(numericAlternatives.map((entry) => entry.transformCost), [1, 3, 3]);
assert.deepEqual(numericAlternatives[0].mapping, {
  K: "w2.L:x",
  a: "w2.S:x",
  g: "w2.P:x",
  q: "w1.L:x",
  F: "w3.P:x",
  p: "w1.S:x+1",
});

// Genuine held-out lower-red redundancy. It was excluded from role selection.
const heldActual = [descriptors["w1.P"], descriptors["w3.L"], descriptors["w3.S"]];
const heldExpected = [mod(target.K * target.g), target.g, target.g];
assert.deepEqual(heldActual, [10, 5, 5]);
assert.deepEqual(heldActual, heldExpected);

// Every surviving provenance map yields the same state values, so every one
// necessarily predicts the same held-out relation. This is the key causal
// limitation: downstream state-only cross-holdouts cannot identify provenance.
const heldoutPasses = numericAlternatives.filter(() => JSON.stringify(heldActual) === JSON.stringify(heldExpected)).length;
assert.equal(heldoutPasses, 3);

console.log(JSON.stringify({
  status: "PASS",
  evidenceBoundary: "p15 lower-red descriptor cells; transforms {x,-x,x+1,x-1}; no body ciphertext or fitted body key",
  descriptors,
  target,
  transformFamily: transforms.map((x) => x.name),
  fullCharge: {
    labeledInjectiveMaps: allMaps.length,
    distinctFieldAllocations: new Set(allMaps.map(fieldAllocationSignature)).size,
  },
  sealedHoldoutCharge: {
    selectionFields: [...selectionFields],
    heldFields: [...heldFields],
    labeledMaps: sealedMaps.length,
    distinctNumericRoleMaps: numericAlternatives.length,
    narrowIdentityPlusOneMaps: narrowSealedMaps.length,
    alternatives: numericAlternatives,
  },
  heldout: {
    relation: "[w1.P,w3.L,w3.S] == [K*g,g,g]",
    actual: heldActual,
    expected: heldExpected,
    survivingRoleMapsPassing: heldoutPasses,
  },
  decision: "NON_IDENTIFYING_UNDER_REQUIRED_SIGN_OFFSET_FAMILY",
}, null, 2));
