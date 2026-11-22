"use strict";

/**
 * SFT for Director issue #1839.
 * Tests whether a single source-visible one-operation scheduler can reproduce
 * any two of three independently selected four-rune key shells before a third
 * is used as a holdout.
 */

const assert = require("node:assert/strict");

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function h4Interleaved(values) {
  assert.equal(values.length, 4);
  return [
    mod29(values[0] - values[3]),
    mod29(values[0] + values[3]),
    mod29(values[1] - values[2]),
    mod29(values[1] + values[2]),
  ];
}

const candidates = Object.freeze([
  {
    name: "WILL",
    sourceIndex: 33,
    cipher: [3, 15, 17, 22],
    plain: [7, 10, 20, 20],
    expectedShell: [23, 27, 8, 2],
  },
  {
    name: "LUCK",
    sourceIndex: 37,
    cipher: [3, 2, 6, 27],
    plain: [20, 1, 5, 5],
    expectedShell: [19, 5, 0, 2],
  },
  {
    name: "PATHS",
    sourceIndex: 40,
    cipher: [4, 15, 14, 21],
    plain: [13, 24, 2, 15],
    expectedShell: [14, 26, 8, 3],
  },
]);

for (const candidate of candidates) {
  const key = candidate.cipher.map((value, index) =>
    mod29(value - candidate.plain[index])
  );
  candidate.key = key;
  candidate.shell = h4Interleaved(key);
  assert.deepEqual(candidate.shell, candidate.expectedShell);
  assert.deepEqual(
    candidate.plain.map((value, index) => mod29(value + key[index])),
    candidate.cipher
  );
}

const state = Object.freeze({
  p: 23,
  g: 5,
  a: 6,
  b: 15,
  A: 8,
  B: 19,
  K: 2,
  e: 3,
  q: 4,
  one: 1,
  zero: 0,
});

/**
 * Family A:
 * - direct source index r=i mod29 or target GP length L;
 * - direct signed DH/p6 state atom;
 * - one binary operation (+,-,*) between one state atom and r or L;
 * - one binary operation between r and L;
 * - one binary operation between two fixed state atoms.
 *
 * No expression contains two binary operations.
 *
 * @returns {{label:string, eval:(r:number,L:number)=>number}[]}
 */
function arithmeticForms() {
  const out = [
    { label: "r", eval: (r) => mod29(r) },
    { label: "-r", eval: (r) => mod29(-r) },
    { label: "L", eval: (_r, L) => mod29(L) },
    { label: "-L", eval: (_r, L) => mod29(-L) },
    { label: "r+L", eval: (r, L) => mod29(r + L) },
    { label: "r-L", eval: (r, L) => mod29(r - L) },
    { label: "L-r", eval: (r, L) => mod29(L - r) },
    { label: "r*L", eval: (r, L) => mod29(r * L) },
  ];

  const signedAtoms = [];
  for (const [name, value] of Object.entries(state)) {
    signedAtoms.push({ name, value: mod29(value) });
    if (mod29(value) !== 0) {
      signedAtoms.push({ name: "-" + name, value: mod29(-value) });
    }
  }

  for (const atom of signedAtoms) {
    const x = atom.value;
    const name = atom.name;
    out.push({ label: name, eval: () => x });
    out.push({ label: name + "+r", eval: (r) => mod29(x + r) });
    out.push({ label: name + "-r", eval: (r) => mod29(x - r) });
    out.push({ label: "r-" + name, eval: (r) => mod29(r - x) });
    out.push({ label: name + "*r", eval: (r) => mod29(x * r) });
    out.push({ label: name + "+L", eval: (_r, L) => mod29(x + L) });
    out.push({ label: name + "-L", eval: (_r, L) => mod29(x - L) });
    out.push({ label: "L-" + name, eval: (_r, L) => mod29(L - x) });
    out.push({ label: name + "*L", eval: (_r, L) => mod29(x * L) });
  }

  const baseEntries = Object.entries(state);
  for (const [leftName, left] of baseEntries) {
    for (const [rightName, right] of baseEntries) {
      out.push({
        label: leftName + "+" + rightName,
        eval: () => mod29(left + right),
      });
      out.push({
        label: leftName + "-" + rightName,
        eval: () => mod29(left - right),
      });
      out.push({
        label: leftName + "*" + rightName,
        eval: () => mod29(left * right),
      });
    }
  }

  return out;
}

const forms = arithmeticForms();
assert.equal(forms.length, 560);

/**
 * @param {typeof candidates[number]} left
 * @param {typeof candidates[number]} right
 * @returns {number[]}
 */
function arithmeticFitCounts(left, right) {
  return [0, 1, 2, 3].map((coordinate) =>
    forms.filter((form) =>
      form.eval(mod29(left.sourceIndex), 4) === left.shell[coordinate] &&
      form.eval(mod29(right.sourceIndex), 4) === right.shell[coordinate]
    ).length
  );
}

// Family B: field-position scheduler over the ordered signed-source DH register.
// The source-visible order is K,e,q,g,a,g+K,A,b,B,p,0.
// Selector: tape[(alpha*i + offset) mod tape.length], optional global sign.
// alpha is charged over ±{1,K,e,q,g,a,A,b,B,p}.
const stateTape = Object.freeze([
  state.K,
  state.e,
  state.q,
  state.g,
  state.a,
  mod29(state.g + state.K),
  state.A,
  state.b,
  state.B,
  state.p,
  0,
]);
const alphaSet = [...new Set([
  1, -1,
  state.K, -state.K,
  state.e, -state.e,
  state.q, -state.q,
  state.g, -state.g,
  state.a, -state.a,
  state.A, -state.A,
  state.b, -state.b,
  state.B, -state.B,
  state.p, -state.p,
])];

assert.equal(stateTape.length, 11);
assert.equal(alphaSet.length, 20);

/**
 * @param {typeof candidates[number]} left
 * @param {typeof candidates[number]} right
 * @returns {number[]}
 */
function positionFitCounts(left, right) {
  return [0, 1, 2, 3].map((coordinate) => {
    let count = 0;
    for (const alpha of alphaSet) {
      for (let offset = 0; offset < stateTape.length; offset += 1) {
        for (const sign of [1, -1]) {
          const predict = (sourceIndex) => {
            const position = mod29(alpha * sourceIndex + offset) % stateTape.length;
            return mod29(sign * stateTape[position]);
          };
          if (
            predict(left.sourceIndex) === left.shell[coordinate] &&
            predict(right.sourceIndex) === right.shell[coordinate]
          ) {
            count += 1;
          }
        }
      }
    }
    return count;
  });
}

const pairRows = [];
for (let i = 0; i < candidates.length; i += 1) {
  for (let j = i + 1; j < candidates.length; j += 1) {
    const left = candidates[i];
    const right = candidates[j];
    const arithmetic = arithmeticFitCounts(left, right);
    const positions = positionFitCounts(left, right);

    const arithmeticWhole = arithmetic.reduce((product, count) => product * count, 1);
    const positionWhole = positions.reduce((product, count) => product * count, 1);

    assert.equal(arithmeticWhole, 0);
    assert.equal(positionWhole, 0);

    pairRows.push({
      training: [left.name, right.name],
      arithmeticCoordinateFits: arithmetic,
      arithmeticWholeSchedulers: arithmeticWhole,
      positionCoordinateFits: positions,
      positionWholeSchedulers: positionWhole,
    });
  }
}

assert.deepEqual(
  pairRows.map((row) => row.arithmeticCoordinateFits),
  [
    [1, 0, 0, 23],
    [0, 0, 20, 0],
    [0, 0, 0, 0],
  ]
);

assert.deepEqual(
  pairRows.map((row) => row.positionCoordinateFits),
  [
    [3, 0, 2, 0],
    [1, 3, 0, 3],
    [0, 0, 2, 2],
  ]
);

console.log("PASS #1839 p6 scheduler gate");
console.log(JSON.stringify({
  candidates: candidates.map((row) => ({
    name: row.name,
    sourceIndex: row.sourceIndex,
    key: row.key,
    interleavedShell: row.shell,
  })),
  arithmeticForms: forms.length,
  positionScheduler: {
    tape: stateTape,
    alphaCount: alphaSet.length,
  },
  pairRows,
}, null, 2));
