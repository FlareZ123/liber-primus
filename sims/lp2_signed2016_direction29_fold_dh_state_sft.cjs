"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} left @param {number} right @returns {[number,number]} */
function H(left, right) {
  return [mod29(left - right), mod29(left + right)];
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const output = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      output.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      output.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    output.push(token.value);
    offset += token.symbol.length;
  }
  return output;
}

/** @param {number} value @param {number} modulus @returns {number | null} */
function inverseModulo(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  return null;
}

/** @param {number} base @param {number} exponent @param {number} modulus @returns {number} */
function powModulo(base, exponent, modulus) {
  let result = 1;
  let current = modValue(base, modulus);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * current) % modulus;
    current = (current * current) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {number} value @param {number} modulus @returns {number} */
function modValue(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

/** @param {number} value @returns {boolean} */
function isPrime(value) {
  if (value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

const clear = signed2016
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const words = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(words.length, 43);

const gp0 = words.map((word) =>
  gp(word).reduce((total, value) => total + value, 0)
);
assert.equal(words[0], "HELLO");
assert.equal(words[29], "DIRECTION");
assert.deepEqual(
  words.slice(1, 14),
  ["THE","PATH","LIES","EMPTY","EPIPHANY","SEEKS","THE","DEVOTED",
   "LIBER","PRIMUS","IS","THE","WAY"]
);
assert.deepEqual(
  words.slice(30, 43),
  ["SEEK","AND","YOU","WILL","BE","FOUND","GOOD","LUCK",
   "BEWARE","FALSE","PATHS","VERIFY","OPENPGP"]
);

/**
 * Fold the 13 post-DIRECTION words onto the 13-word pre-instruction block.
 * shift=0 is the literal equal-word-number modulo29 pairing.
 *
 * @param {number} shift
 * @param {boolean} reverseH
 * @returns {Array<{
 *   residue:number,leftWord:string,rightWord:string,leftIndex:number,rightIndex:number,
 *   leftGp0:number,rightGp0:number,h:[number,number]
 * }>}
 */
function foldedRows(shift, reverseH) {
  const rows = [];
  for (let offset = 0; offset < 13; offset += 1) {
    const leftIndex = offset + 1;
    const rightOffset = (offset + shift) % 13;
    const rightIndex = 30 + rightOffset;
    const leftGp0 = gp0[leftIndex];
    const rightGp0 = gp0[rightIndex];
    rows.push({
      residue: leftIndex,
      leftWord: words[leftIndex],
      rightWord: words[rightIndex],
      leftIndex,
      rightIndex,
      leftGp0,
      rightGp0,
      h: reverseH ? H(rightGp0, leftGp0) : H(leftGp0, rightGp0),
    });
  }
  return rows;
}

/**
 * Charge every assignment of five distinct folded rows to the fixed DH packet
 * roles [Ka,A], [q,a], [Kg,Ka], [-b,p], [B,p-K].
 *
 * @param {ReturnType<typeof foldedRows>} rows
 * @param {boolean} stopAtFirst
 * @returns {Array<{
 *   kaA:any,qa:any,kgKa:any,minusBp:any,bPk:any,
 *   state:{p:number,g:number,a:number,b:number,A:number,B:number,K:number,e:number,q:number}
 * }>}
 */
function solveRows(rows, stopAtFirst = false) {
  const hits = [];

  for (const kaA of rows) {
    const [Ka, A] = kaA.h;

    for (const qa of rows) {
      if (qa === kaA) continue;
      const [q, a] = qa.h;
      const inverseA29 = inverseModulo(a, 29);
      if (inverseA29 === null) continue;
      const K = mod29(Ka * inverseA29);
      if (K === 0) continue;

      for (const kgKa of rows) {
        if (kgKa === kaA || kgKa === qa) continue;
        const [Kg, repeatedKa] = kgKa.h;
        if (repeatedKa !== Ka) continue;
        const inverseK29 = inverseModulo(K, 29);
        if (inverseK29 === null) continue;
        const g = mod29(Kg * inverseK29);

        for (const minusBp of rows) {
          if (minusBp === kaA || minusBp === qa || minusBp === kgKa) {
            continue;
          }
          const [minusB, p] = minusBp.h;
          const b = mod29(-minusB);
          if (!isPrime(p)) continue;
          if (!(g > 1 && g < p && a > 0 && a < p && b > 0 && b < p)) {
            continue;
          }
          if (!(K > 0 && K < p && A > 0 && A < p)) continue;
          if (powModulo(g, a, p) !== A) continue;
          if (powModulo(A, b, p) !== K) continue;

          for (const bPk of rows) {
            if (
              bPk === kaA || bPk === qa || bPk === kgKa || bPk === minusBp
            ) {
              continue;
            }
            const [B, pMinusK] = bPk.h;
            if (!(B > 0 && B < p)) continue;
            if (pMinusK !== mod29(p - K)) continue;
            if (powModulo(g, b, p) !== B) continue;
            if (powModulo(B, a, p) !== K) continue;
            const e = inverseModulo(b, p - 1);
            if (e === null) continue;

            hits.push({
              kaA,
              qa,
              kgKa,
              minusBp,
              bPk,
              state: { p, g, a, b, A, B, K, e, q },
            });
            if (stopAtFirst) return hits;
          }
        }
      }
    }
  }
  return hits;
}

const canonicalRows = foldedRows(0, false);
assert.deepEqual(
  canonicalRows.map((row) => [
    row.residue,
    row.leftWord,
    row.rightWord,
    row.leftGp0,
    row.rightGp0,
    row.h,
  ]),
  [
    [1,"THE","SEEK",20,56,[22,18]],
    [2,"PATH","AND",39,56,[12,8]],
    [3,"LIES","YOU",63,30,[4,6]],
    [4,"EMPTY","WILL",92,57,[6,4]],
    [5,"EPIPHANY","BE",121,35,[28,11]],
    [6,"SEEKS","FOUND",71,36,[6,20]],
    [7,"THE","GOOD",20,35,[14,26]],
    [8,"DEVOTED","LUCK",102,31,[13,17]],
    [9,"LIBER","BEWARE",69,88,[10,12]],
    [10,"PRIMUS","FALSE",62,77,[14,23]],
    [11,"IS","PATHS",25,54,[0,21]],
    [12,"THE","VERIFY",20,59,[19,21]],
    [13,"WAY","OPENPGP",57,75,[11,16]],
  ]
);

const roleAssignmentsPerFold = 13 * 12 * 11 * 10 * 9;
assert.equal(roleAssignmentsPerFold, 154440);
const canonicalHits = solveRows(canonicalRows);
assert.equal(canonicalHits.length, 1);
const exact = canonicalHits[0];
assert.deepEqual(
  [
    [exact.kaA.residue, exact.kaA.leftWord, exact.kaA.rightWord],
    [exact.qa.residue, exact.qa.leftWord, exact.qa.rightWord],
    [exact.kgKa.residue, exact.kgKa.leftWord, exact.kgKa.rightWord],
    [exact.minusBp.residue, exact.minusBp.leftWord, exact.minusBp.rightWord],
    [exact.bPk.residue, exact.bPk.leftWord, exact.bPk.rightWord],
  ],
  [
    [2,"PATH","AND"],
    [3,"LIES","YOU"],
    [9,"LIBER","BEWARE"],
    [10,"PRIMUS","FALSE"],
    [12,"THE","VERIFY"],
  ]
);
assert.deepEqual(exact.state, {
  p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4,
});

// Source semantic/index checks do not participate in solveRows.
const s = exact.state;
assert.equal(words[s.K], "PATH");
assert.equal(words[s.e], "LIES");
assert.equal(words[s.q], "EMPTY");
assert.equal(words[s.g], "EPIPHANY");
assert.equal(words[s.a], "SEEKS");
assert.equal(words[mod29(s.g + s.K)], "THE");
assert.equal(words[s.A], "DEVOTED");
assert.equal(words[s.b], "WORDS");
assert.equal(words[s.B], "THEIR");
assert.equal(words[s.p], "ROAD");
assert.equal(gp0[4], 92);
assert.equal(gp0[4] / s.p, s.q);

// Direct source-word DH equations.
assert.equal(powModulo(s.g, s.a, s.p), s.A);
assert.equal(powModulo(s.g, s.b, s.p), s.B);
assert.equal(powModulo(s.A, s.b, s.p), s.K);
assert.equal(powModulo(s.B, s.a, s.p), s.K);
assert.equal(inverseModulo(s.b, s.p - 1), s.e);

// Charge every cyclic fold alignment and both uniform H directions.
const foldHits = [];
for (let shift = 0; shift < 13; shift += 1) {
  for (const reverseH of [false, true]) {
    const hits = solveRows(foldedRows(shift, reverseH));
    if (hits.length > 0) {
      foldHits.push({
        shift,
        reverseH,
        hits: hits.map((hit) => ({
          roles: [
            hit.kaA.residue,
            hit.qa.residue,
            hit.kgKa.residue,
            hit.minusBp.residue,
            hit.bPk.residue,
          ],
          state: hit.state,
        })),
      });
    }
  }
}
assert.deepEqual(foldHits, [{
  shift:0,
  reverseH:false,
  hits:[{
    roles:[2,3,9,10,12],
    state:{p:23,g:5,a:6,b:15,A:8,B:19,K:2,e:3,q:4},
  }],
}]);
const foldConfigurations = 13 * 2;
const chargedRoleConfigurations = foldConfigurations * roleAssignmentsPerFold;
assert.equal(chargedRoleConfigurations, 4015440);

console.log(JSON.stringify({
  status:"PASS",
  classification:
    "authenticated-2016 DIRECTION-at-index29 fold reconstructs the complete DH23 state. Pair the 13 words before the self-referential instruction with the 13 words after DIRECTION by equal zero-based word number mod29, apply the frozen forward H to each GP0 pair, and charge five DH packet roles. Across 13 cyclic alignments, both H directions and 154440 role assignments per fold, exactly one of 4015440 configurations closes: PATH/AND=[Ka,A], LIES/YOU=[q,a], LIBER/BEWARE=[Kg,Ka], PRIMUS/FALSE=[-b,p], THE/VERIFY=[B,p-K], yielding p23 g5 a6 b15 A8 B19 K2 e3 q4. No unknown LP2 ciphertext participates.",
  layout:{
    directionIndex:29,
    firstBlock:words.slice(1,14),
    instructionBlock:words.slice(14,30),
    foldedBlock:words.slice(30,43),
  },
  canonicalRows:canonicalRows.map((row)=>({
    residue:row.residue,
    words:[row.leftWord,row.rightWord],
    gp0:[row.leftGp0,row.rightGp0],
    H:row.h,
  })),
  exact:{
    roles:{
      KaA:[exact.kaA.residue,exact.kaA.leftWord,exact.kaA.rightWord],
      qa:[exact.qa.residue,exact.qa.leftWord,exact.qa.rightWord],
      KgKa:[exact.kgKa.residue,exact.kgKa.leftWord,exact.kgKa.rightWord],
      minusBp:[exact.minusBp.residue,exact.minusBp.leftWord,exact.minusBp.rightWord],
      BpK:[exact.bPk.residue,exact.bPk.leftWord,exact.bPk.rightWord],
    },
    state:exact.state,
    indexedWords:{
      K:[s.K,words[s.K]],
      e:[s.e,words[s.e]],
      q:[s.q,words[s.q]],
      g:[s.g,words[s.g]],
      a:[s.a,words[s.a]],
      gPlusK:[mod29(s.g+s.K),words[mod29(s.g+s.K)]],
      A:[s.A,words[s.A]],
      b:[s.b,words[s.b]],
      B:[s.B,words[s.B]],
      p:[s.p,words[s.p]],
    },
  },
  family:{
    cyclicAlignments:13,
    HDirections:2,
    roleAssignmentsPerFold,
    chargedRoleConfigurations,
    survivingFoldConfigurations:foldHits,
  },
},null,2));
