"use strict";

/**
 * An independently archived 2013 Cicada server specification explicitly
 * gives BASE29 3301 => 3QO. Compare its coefficients, without fitting to LP2,
 * with two independently marked algebraic factors of the original 2014 grid.
 *
 * Run: node sims/base29_2013_grid_factor_sft.cjs
 * Node.js 22, built-in dependencies only.
 *
 * This checks an exact source relationship; it does not recover LP2 plaintext.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} file */
const json = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
/** @param {number} n */
const mod = n => (n % 29 + 29) % 29;

/** @param {number} a */
function inverse(a) {
  for (let b = 1; b < 29; b++) if (mod(a * b) === 1) return b;
  throw new Error("Zero leading coefficient");
}

/** Descending-power, fixed-slot polynomial quotient/remainder in F29.
 * @param {number[]} polynomial @param {number[]} divisor
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divide(polynomial, divisor) {
  const remainder = polynomial.slice();
  const quotient = [];
  const leadingInverse = inverse(divisor[0]);
  for (let i = 0; i <= polynomial.length - divisor.length; i++) {
    const coefficient = mod(remainder[i] * leadingInverse);
    quotient.push(coefficient);
    for (let j = 0; j < divisor.length; j++) {
      remainder[i + j] = mod(remainder[i + j] - coefficient * divisor[j]);
    }
  }
  return {
    quotient,
    remainder: remainder.slice(quotient.length)
  };
}

/** @param {number[]} left @param {number[]} right */
function multiply(left, right) {
  const result = Array(left.length + right.length - 1).fill(0);
  left.forEach((x, i) => right.forEach((y, j) => {
    result[i + j] = mod(result[i + j] + x * y);
  }));
  return result;
}

/** F29[u] with 13+23u+2u²=0, hence u²=3u+8.
 * @param {[number,number]} z @param {[number,number]} w
 * @returns {[number,number]}
 */
function mulExt(z, w) {
  const [a, b] = z, [c, d] = w;
  return [mod(a*c + 8*b*d), mod(a*d + b*c + 3*b*d)];
}

/** @param {[number,number]} x @param {[number,number]} y
 * @returns {[number,number]} */
const addExt = (x, y) => [mod(x[0] + y[0]), mod(x[1] + y[1])];
/** @param {number} n @param {[number,number]} x
 * @returns {[number,number]} */
const scaleExt = (n, x) => [mod(n*x[0]), mod(n*x[1])];
/** @param {number[]} xs */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((sum, n) => sum + n*(n-1), 0)/(xs.length*(xs.length-1));
}

const grid = json("resources/liber-primus/lp2-grid-256.json");
const corpus = json("resources/liber-primus/lp2-corpus.json");
const ink = json("resources/liber-primus/lp2-ink-annotations.json");
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(grid.bytes))
  .digest("hex"), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
assert.equal(alphabet.length, 29);
const historicalResponse = "3QO"; // 2013 published server protocol example
const base29Digits = [...historicalResponse].map(character => alphabet.indexOf(character));
assert.deepEqual(base29Digits, [3,26,24]);
assert.equal(base29Digits.reduce((n,d) => 29*n+d,0), 3301);

const red3 = ink.pages.find(x => x.page === 3).red_spans
  .filter(x => x.length === 3);
const red39 = ink.pages.find(x => x.page === 39).red_spans
  .filter(x => x.length === 3);
assert.deepEqual(red3.map(x => [x.start, [...x.runes].map(r => corpus.runes.indexOf(r))]),
  [[119,[13,23,2]]]);
assert.deepEqual(red39.map(x => [x.start, [...x.runes].map(r => corpus.runes.indexOf(r))]),
  [[119,[27,5,15]]]);

// Historical display order 3QO is adopted as increasing-power coefficients,
// exactly as the two original red rune triplets were read in earlier work.
// The descending coefficient array for polynomial division is reversed.
const base29Ascending = base29Digits;
const base29Descending = base29Ascending.slice().reverse();
// The SAME published 2013 protocol gives this complete DH example:
// C: DH 23; S: 01 OK 5 8; C: 19; S: 03 DATA 2.
// Compute both private exponents, rather than inserting the p39 rune values.
/** @param {number} x @param {number} k @param {number} p */
function powMod(x,k,p) {
  let y=1;
  for(let i=0;i<k;i++)y=y*x%p;
  return y;
}
/** @param {number} root @param {number} target @param {number} p */
function discreteLog(root,target,p) {
  for(let i=0;i<p-1;i++)if(powMod(root,i,p)===target)return i;
  throw new Error("Historical DH example has no discrete log");
}
const dhModulus=23,dhBase=5,serverPublic=8,clientPublic=19;
const serverExponent=discreteLog(dhBase,serverPublic,dhModulus);
const clientExponent=discreteLog(dhBase,clientPublic,dhModulus);
assert.equal(serverExponent,6);
assert.equal(clientExponent,15);
const sharedSecret=powMod(clientPublic,serverExponent,dhModulus);
assert.equal(sharedSecret,2);
assert.equal(powMod(serverPublic,clientExponent,dhModulus),sharedSecret);
const rootFrom2013=3301%29;
assert.equal(rootFrom2013,24);
// DH-derived public exponent times the square of source 3301's GP residue.
const historicalDHQuadratic=[
  mod(clientExponent*rootFrom2013*rootFrom2013),
  mod(-2*clientExponent*rootFrom2013),
  clientExponent
];
assert.deepEqual(historicalDHQuadratic,[27,5,15]);
assert.equal(historicalDHQuadratic[0],mod(-sharedSecret));
assert.equal(historicalDHQuadratic[1],dhBase);
assert.deepEqual(
  historicalDHQuadratic,
  [...red39[0].runes].map(r=>corpus.runes.indexOf(r))
);
// A separate but much more interpretive source-number rendering of p3:
// [base+server public, DH modulus, shared key] = [13,23,2].
assert.deepEqual(
  [dhBase+serverPublic,dhModulus,sharedSecret],
  [...red3[0].runes].map(r=>corpus.runes.indexOf(r))
);
const p39Ascending = historicalDHQuadratic;
const p39Descending = p39Ascending.slice().reverse();
assert.deepEqual(base29Descending, [24,26,3]);
assert.deepEqual(base29Ascending.map(x => mod(23*x)), [11,18,1]);
assert.deepEqual(p39Ascending.map((x,i) => x), [27,5,15]);
assert.equal(mod(27+5*24+15*24*24),0);
assert.equal(mod(5+2*15*24),0);
assert.notEqual(mod(2*15),0);

// Independent original table, no ciphertext-selected parameters.
const polynomial = grid.bytes.map(mod);
assert.equal(polynomial[0],0);
const historical = divide(polynomial, base29Descending);
assert.deepEqual(historical.remainder, [0,0]);
assert.deepEqual(multiply(historical.quotient,base29Descending),polynomial);
const manuscript = divide(historical.quotient, p39Descending);
assert.deepEqual(manuscript.remainder, [0,0]);
assert.deepEqual(multiply(
  multiply(manuscript.quotient,p39Descending),
  base29Descending
), polynomial);
assert.equal(historical.quotient.length,254);
assert.equal(manuscript.quotient.length,252);
assert.equal(manuscript.quotient[0],0);

// Orientation matters. Standard left-to-right *descending* source polynomial
// does not divide the grid. This is not silently treated as a positive.
const oppositeOrientation = divide(polynomial,base29Ascending);
assert.deepEqual(oppositeOrientation.remainder,[1,6]);

// Source p3 red quadratic specifies a primitive element u in F(29^2).
// A concrete field change z=23-2u takes its root to the 2013 quadratic.
const u = /** @type {[number,number]} */ ([0,1]);
const z = /** @type {[number,number]} */ ([23,27]);
const z2 = mulExt(z,z);
const historicalAtZ = addExt(
  addExt(scaleExt(3,[1,0]),scaleExt(26,z)),scaleExt(24,z2)
);
assert.deepEqual(historicalAtZ,[0,0]);
let power = /** @type {[number,number]} */ ([1,0]);
let exponent = -1;
for(let i=0;i<840;i++){
  if(power[0] === z[0] && power[1] === z[1]) exponent=i;
  power=mulExt(power,u);
}
assert.deepEqual(power,[1,0]);
assert.equal(exponent,433);
let zPower = /** @type {[number,number]} */ ([1,0]);
for(let i=1;i<=840;i++){
  zPower=mulExt(zPower,z);
  if(i<840)assert.notDeepEqual(zPower,[1,0]);
}
assert.deepEqual(zPower,[1,0]);

const result = {
  classification:"exact cross-round source relation, not decrypted text",
  historicalProtocol:"BASE29 3301 => 3QO",
  historicalDigits:base29Digits,
  historicalDhExample:{modulus:dhModulus,base:dhBase,serverPublic,clientPublic,serverExponent,clientExponent,sharedSecret},
  p39QuadraticGeneratedFromDh:historicalDHQuadratic,
  p3TriadArithmetic:[dhBase+serverPublic,dhModulus,sharedSecret],
  historicalPolynomialAscending:base29Ascending,
  normalizedFactorAscending:[11,18,1],
  originalRedP3:[13,23,2],
  originalRedP39:p39Ascending,
  historicalDivisionRemainder:historical.remainder,
  p39DivisionRemainder:manuscript.remainder,
  reversedConventionRemainder:oppositeOrientation.remainder,
  originalTableCoefficientSlots:polynomial.length,
  twiceDividedCoefficientSlots:manuscript.quotient.length,
  twiceDividedFirstSlot:manuscript.quotient[0],
  twiceDividedIndexOfCoincidence:ioc(manuscript.quotient),
  exactReconstruction:true,
  fieldRootMapping:"z=23-2u in F29[u], u^2=3u+8",
  sourceRootLogBaseU:exponent,
  bothFieldElementsPrimitive:true
};
console.log(JSON.stringify(result,null,2));
