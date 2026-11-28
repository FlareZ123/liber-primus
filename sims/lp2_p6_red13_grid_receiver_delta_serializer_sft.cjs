"use strict";

const assert = require("node:assert/strict");

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function h4(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
    mod29(values[0] + values[3]),
  ];
}

/** @param {number[]} values @returns {number[][]} */
function permutations(values) {
  const output = [];
  /** @param {number[]} prefix @param {number[]} remaining */
  function visit(prefix, remaining) {
    if (!remaining.length) {
      output.push(prefix);
      return;
    }
    for (let i = 0; i < remaining.length; i += 1) {
      visit(
        prefix.concat(remaining[i]),
        remaining.slice(0, i).concat(remaining.slice(i + 1))
      );
    }
  }
  visit([], values);
  return output;
}

const titleLengths = [4, 1, 4, 2];
const H = h4(titleLengths);
const F = 0;
assert.deepEqual(H, [2, 26, 5, 6]);

// Independent original-image work establishes one fixed 13-dot stencil with
// column populations 4/5/4. The target-independent p30-p42 receiver scheduler
// independently establishes these source-index-relative local-word deltas.
const stencilColumns = [4, 5, 4];
const observedDelta = [26, 1, 3, 2, 26, 1, 0, 1, 3, 20, 6, 1, 3];
assert.equal(
  observedDelta.length,
  stencilColumns.reduce((left, right) => left + right, 0)
);

/**
 * Literal p6 grid grammar. roles are the four H4(title-width) coordinates.
 * one is the signed visible singleton width. Orientation choices are charged
 * outside this function.
 * @param {number[]} roles
 * @param {number} one
 * @returns {{left:number[],center:number[],transition:number[],right:number[],flat:number[]}}
 */
function grid(roles, one) {
  const [r0, r1, r2, r3] = roles;
  const left = [r1, one, mod29(-r1), r0];
  const center = [r1, one, F, one, mod29(-r1)];
  const transition = [mod29(-r3), r2, mod29(-r0), one];
  const right = left.map((value, i) => mod29(value + transition[i]));
  return {
    left,
    center,
    transition,
    right,
    flat: [...left, ...center, ...right],
  };
}

const canonical = grid(H, 1);
assert.deepEqual(canonical.left, [26, 1, 3, 2]);
assert.deepEqual(canonical.center, [26, 1, 0, 1, 3]);
assert.deepEqual(canonical.transition, [23, 5, 27, 1]);
assert.deepEqual(canonical.right, [20, 6, 1, 3]);
assert.deepEqual(canonical.flat, observedDelta);

let configurations = 0;
let exactHits = 0;
let prefix9Hits = 0;
let prefix9AndTerminalHits = 0;
const winners = [];

for (const permutation of permutations(H)) {
  for (let signMask = 0; signMask < 16; signMask += 1) {
    const signedRoles = permutation.map((value, i) =>
      mod29(((signMask >> i) & 1) ? -value : value)
    );

    for (const one of [1, -1]) {
      const base = grid(signedRoles, mod29(one));

      for (const reverseColumns of [false, true]) {
        for (const reverseVertical of [false, true]) {
          configurations += 1;
          let columns = [base.left, base.center, base.right].map((column) =>
            column.slice()
          );

          if (reverseVertical) {
            columns = columns.map((column) => column.reverse());
          }
          if (reverseColumns) {
            columns.reverse();
          }

          const candidate = columns.flat();
          const prefix9 = candidate
            .slice(0, 9)
            .every((value, i) => value === observedDelta[i]);
          const terminal4 = candidate
            .slice(9)
            .every((value, i) => value === observedDelta[i + 9]);

          if (prefix9) prefix9Hits += 1;
          if (prefix9 && terminal4) prefix9AndTerminalHits += 1;

          if (prefix9 && terminal4) {
            exactHits += 1;
            winners.push({
              permutation,
              signMask,
              one,
              reverseColumns,
              reverseVertical,
              columns,
              transition: base.transition,
            });
          }
        }
      }
    }
  }
}

assert.equal(configurations, 3072);
assert.equal(prefix9Hits, 8);
assert.equal(prefix9AndTerminalHits, 1);
assert.equal(exactHits, 1);
assert.deepEqual(winners[0], {
  permutation: [2, 26, 5, 6],
  signMask: 0,
  one: 1,
  reverseColumns: false,
  reverseVertical: false,
  columns: [
    [26, 1, 3, 2],
    [26, 1, 0, 1, 3],
    [20, 6, 1, 3],
  ],
  transition: [23, 5, 27, 1],
});

console.log(JSON.stringify({
  status: "PASS",
  p6: {
    titleLengths,
    H4TitleLengths: H,
    Fehu: F,
    red13StencilColumns: stencilColumns,
  },
  serializer: {
    left: canonical.left,
    center: canonical.center,
    transition: canonical.transition,
    right: canonical.right,
    delta: canonical.flat,
  },
  charge: {
    configurations,
    prefix9Hits,
    prefix9AndTerminalHits,
    exactHits,
    note:
      "Post-discovery finite role/sign/orientation charge. The terminal four lanes are an internal held-out column, not a temporally blind prediction.",
  },
}, null, 2));
