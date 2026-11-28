"use strict";

const assert = require("node:assert/strict");

/** @param {string[]} items @returns {string[][]} */
function permutations(items) {
  if (items.length <= 1) return [items.slice()];
  const out = [];
  for (let i = 0; i < items.length; i += 1) {
    const head = items[i];
    const rest = items.slice(0, i).concat(items.slice(i + 1));
    for (const tail of permutations(rest)) out.push([head, ...tail]);
  }
  return out;
}

/** @param {string[]} items @param {string} start @param {1|-1} direction @returns {string[]} */
function cyclicRead(items, start, direction) {
  const startIndex = items.indexOf(start);
  assert.notEqual(startIndex, -1);
  return items.map((_, offset) => {
    const index = (startIndex + direction * offset + items.length * 4) % items.length;
    return items[index];
  });
}

/** @param {string[]} order @returns {string} */
function key(order) {
  return order.join(",");
}

const qRoles = ["one", "F", "K", "q"];
const dRoles = ["u", "F", "minusG", "plusG"];
const all576 = [];
for (const qOrder of permutations(qRoles)) {
  for (const dOrder of permutations(dRoles)) all576.push({ qOrder, dOrder });
}
assert.equal(all576.length, 576);

// Original p6 visible register, left-to-right:
//   Fehu | W1(q) W2(1) W3(q) W4(K) | red13 marker.
// Q needs one q-valued field although the source has two physically distinct q occurrences.
// Give the source its strongest natural anchor (the unique singleton W2=1), retain either
// q occurrence, and charge both cyclic reading directions. This produces four source-local
// Q serializations without receiver information.
const qSerializers = [];
for (const qRepresentative of ["qLeft", "qRight"]) {
  const physical = qRepresentative === "qLeft"
    ? ["F", "q", "one", "K"]     // drop the later W3=q occurrence
    : ["F", "one", "q", "K"];    // drop the earlier W1=q occurrence
  for (const direction of [1, -1]) {
    qSerializers.push({
      qRepresentative,
      direction,
      order: cyclicRead(physical, "one", direction),
    });
  }
}
assert.equal(new Set(qSerializers.map((x) => key(x.order))).size, 4);

// D has three physically ordered anchors on the same red object: F at the left, W1.first=-g,
// and W4.last=u at the right. +g is the H4-derived partner of the visible -g. Give the source
// the strongest natural anchor (terminal u), place +g immediately on either side of -g, and
// charge both cyclic directions. Again, no receiver information enters.
const dSerializers = [];
for (const gPlacement of ["afterMinus", "beforeMinus"]) {
  const physical = gPlacement === "afterMinus"
    ? ["F", "minusG", "plusG", "u"]
    : ["F", "plusG", "minusG", "u"];
  for (const direction of [1, -1]) {
    dSerializers.push({
      gPlacement,
      direction,
      order: cyclicRead(physical, "u", direction),
    });
  }
}
assert.equal(new Set(dSerializers.map((x) => key(x.order))).size, 4);

const sourceOnly = [];
for (const q of qSerializers) {
  for (const d of dSerializers) sourceOnly.push({ q, d });
}
assert.equal(sourceOnly.length, 16);

const canonicalQ = ["one", "F", "K", "q"];
const canonicalD = ["u", "F", "minusG", "plusG"];
const canonical = sourceOnly.filter((x) =>
  key(x.q.order) === key(canonicalQ) && key(x.d.order) === key(canonicalD));
assert.equal(canonical.length, 1);
assert.equal(canonical[0].q.qRepresentative, "qRight");
assert.equal(canonical[0].q.direction, -1);
assert.equal(canonical[0].d.gPlacement, "afterMinus");
assert.equal(canonical[0].d.direction, 1);

// A single shared physical traversal direction is the simplest common serializer one could
// infer from the p6 geometry. It leaves eight models, but none is the receiver-selected order:
// the latter needs Q read in reverse while D is read forward.
const commonDirection = sourceOnly.filter((x) => x.q.direction === x.d.direction);
assert.equal(commonDirection.length, 8);
assert.equal(commonDirection.filter((x) =>
  key(x.q.order) === key(canonicalQ) && key(x.d.order) === key(canonicalD)).length, 0);

// Direct non-cyclic printed scans are even stricter. Q's two possible q representatives and
// both physical directions yield four orders; none is the receiver-selected Q order.
const directQ = new Set();
for (const qRepresentative of ["qLeft", "qRight"]) {
  const physical = qRepresentative === "qLeft"
    ? ["F", "q", "one", "K"]
    : ["F", "one", "q", "K"];
  directQ.add(key(physical));
  directQ.add(key(physical.slice().reverse()));
}
assert.equal(directQ.has(key(canonicalQ)), false);

const sourceOnlyKeys = new Set(sourceOnly.map((x) => `${key(x.q.order)}|${key(x.d.order)}`));
const filtered576 = all576.filter((x) => sourceOnlyKeys.has(`${key(x.qOrder)}|${key(x.dOrder)}`));
assert.equal(filtered576.length, 16);

console.log(JSON.stringify({
  status: "PASS",
  frozenFamily: 576,
  sourceOnlyAnchoredCyclic: {
    qOrders: qSerializers,
    dOrders: dSerializers,
    combinedSurvivors: filtered576.length,
    commonDirectionSurvivors: commonDirection.length,
  },
  receiverSelectedOrder: {
    q: canonicalQ,
    d: canonicalD,
    presentInGenerousSourceFamily: canonical.length === 1,
    requiredChoices: canonical[0] ? {
      qRepresentative: canonical[0].q.qRepresentative,
      qDirection: canonical[0].q.direction,
      gPlacement: canonical[0].d.gPlacement,
      dDirection: canonical[0].d.direction,
    } : null,
    selectedBySingleSharedTraversal: false,
    selectedByDirectPrintedScan: false,
  },
  conclusion: "p6 source geometry narrows 576 to a 16-model anchored cyclic class, but does not select the receiver-fitted field order; a shared traversal excludes it. Holdout remains sealed.",
}, null, 2));
