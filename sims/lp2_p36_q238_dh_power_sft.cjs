"use strict";

/**
 * Exact p36 / grid-Q238 high-degree finite-field power-transport gate.
 *
 * Source-based candidate, not an authenticated Cicada decoder:
 *  - Original pp49-51 base60 256-byte table has an irreducible degree238
 *    GF29 factor after removal of its four documented low-degree factors.
 *  - Physical p36 has 238 runes and an Arabic numeral 1 after rune 99.
 *  - Signed 2013 Cicada BASE29/DH worked example includes private exponent15
 *    and modulus23. A separate 2013 tester analysis conditionally selects1661.
 *
 * Map original p36 plus its printed 1 into GF(29^238). Test whether it can
 * be a 15th power (a necessary condition for a native ^15 encoding), and
 * try exact power inverses for 23 and 1661. The table, p36 glyph order,
 * numeral position and exponents are fixed before seeing decoded output.
 *
 * Node 22 (standard library only): node sims/lp2_p36_q238_dh_power_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");

const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/base60-grid.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
assert.equal(createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const mod = x => ((x % 29) + 29) % 29;

/** @param {number[]} a ascending GF29 polynomial
 *  @param {number[]} b ascending GF29 polynomial */
function multiplyRaw(a, b) {
  const r = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      r[i+j] = mod(r[i+j] + a[i]*b[j]);
  return r;
}

// Exact established low-degree factorization of the original printed table:
// (X+5)^2 (X²+18X+11) (X³+14X²+16X+24)
// (X⁹+12X⁸+20X⁷+10X⁶+5X⁵+X⁴+9X³+15X+11).
const factors = [
  [5,1], [5,1], [11,18,1], [24,16,14,1],
  [11,15,0,9,1,5,10,20,12,1]
];
let lowFactor = [1];
for (const factor of factors) lowFactor = multiplyRaw(lowFactor, factor);
assert.equal(lowFactor.length, 17);
assert.equal(lowFactor[16],1);

// The first printed 256-byte coefficient is zero mod29.
// Divide ascending GF29 polynomial, preserving the fixed top zero.
const residual = bytes.map(mod).reverse();
const quotient = Array(240).fill(0);
for (let i = 255; i >= 16; i--) {
  const coefficient = mod(residual[i]);
  quotient[i-16] = coefficient;
  for (let j = 0; j <= 16; j++)
    residual[i-16+j] = mod(residual[i-16+j] - coefficient*lowFactor[j]);
}
assert(residual.every(x => x === 0));
assert.equal(quotient[239], 0);
// Leading coefficient is 28; multiply by its inverse 28 to obtain monic Q238.
const Q = quotient.slice(0,239).map(x => mod(-x));
const DEGREE = 238;
assert.equal(Q[238],1);
assert.deepEqual(Q.slice(0,10), [5,9,18,5,15,8,11,3,19,21]);
assert.deepEqual(Q.slice(-5), [27,26,15,11,1]);
// A known numeral can be lifted at 231/239 fixed source positions; the
// printed offset99 is distinguished by root24, not generic field invertibility.
const fieldZeroPositions=Q.slice(0,238).map((v,j)=>v===0?238-j:-1)
  .filter(offset=>offset>=0).sort((a,b)=>a-b);
assert.deepEqual(fieldZeroPositions,[16,24,66,69,154,162,164,172]);
assert.equal(239-fieldZeroPositions.length,231);

/** @param {number[]} left GF29^238 element, ascending coefficients
 *  @param {number[]} right GF29^238 element, ascending coefficients */
function multiplyField(left, right) {
  const accumulator = new Int32Array(2*DEGREE-1);
  for (let i=0; i<DEGREE; i++) if (left[i]) {
    const t=left[i];
    for (let j=0; j<DEGREE; j++)
      accumulator[i+j] += t*right[j];
  }
  // Q is monic; every high coefficient is reduced into lower positions.
  for (let i=2*DEGREE-2; i>=DEGREE; i--) {
    const coefficient=mod(accumulator[i]);
    if (coefficient) for (let j=0;j<DEGREE;j++)
      accumulator[i-DEGREE+j] -= coefficient*Q[j];
  }
  return Array.from(accumulator.slice(0,DEGREE),mod);
}

/** @param {number[]} source original high-to-low source polynomial, reversed */
function reduceField(source) {
  const r=source.slice();
  for (let i=r.length-1;i>=DEGREE;i--){
    const coefficient=mod(r[i]);
    if (coefficient) for(let j=0;j<DEGREE;j++)
      r[i-DEGREE+j]=mod(r[i-DEGREE+j]-coefficient*Q[j]);
  }
  return Array.from({length:DEGREE},(_,j)=>mod(r[j]||0));
}

/**
 * Invert the affine inclusion of 238 original rune slots and one known
 * printed numeral 1 into the 238-dimensional quotient field.
 * The heading at printed position99 occupies ascending power139. Since
 * Q[139]=27 is invertible, the omitted degree238 coefficient is uniquely
 * recovered: original[238]=(1 - field[139])/Q[139].
 *
 * @param {number[]} field reduced GF29^238 element
 * @returns {number[]} exact 238 GP29 rune indices (high-to-low page order)
 */
function liftFixedNumeral(field) {
  assert.equal(field.length,DEGREE);
  assert.equal(Q[139],27);
  // Inverse of 27 mod29 is 14.
  const highest = mod((1-field[139])*14);
  const full = field.map((x,j) => mod(x + highest*Q[j]));
  full.push(highest);
  assert.equal(full[139],1,"Known original numeral coefficient restored");
  const printed = full.reverse();
  assert.equal(printed[99],1);
  return printed.filter((_,i) => i !== 99);
}

/** @param {number[]} element @param {bigint} exponent */
function powerField(element,exponent){
  let output=Array(DEGREE).fill(0);
  output[0]=1;
  let base=element;
  for(let e=exponent;e>0n;){
    if(e&1n)output=multiplyField(output,base);
    e>>=1n;
    if(e>0n)base=multiplyField(base,base);
  }
  return output;
}

/** @param {bigint} value @param {bigint} modulus */
function inverseExponent(value,modulus){
  let old=modulus, r=value, t=0n,s=1n;
  while(r!==0n){
    const k=old/r;
    [old,r]=[r,old-k*r];
    [t,s]=[s,t-k*s];
  }
  assert.equal(old,1n,"Exponent must be invertible on multiplicative group");
  return (t%modulus+modulus)%modulus;
}

/** @param {number[]} values */
function ioc(values) {
  const bins=Array(29).fill(0);
  for(const v of values)bins[v]++;
  return bins.reduce((sum,n)=>sum+n*(n-1),0)/(values.length*(values.length-1));
}

const p36 = corpus.pages.find(page=>page.page===36).indices;
assert.equal(p36.length,238);
// The physical page's Arabic heading 1 is immediately after 99 rune glyphs.
const withNumeral = [...p36.slice(0,99),1,...p36.slice(99)];
assert.equal(withNumeral.length,239);
const polynomialAt24 = values => values.reduce((acc, coefficient) =>
  mod(acc*24 + coefficient),0);
const wrongNumeralOffsets=[98,100].map(offset =>
  polynomialAt24([...p36.slice(0,offset),1,...p36.slice(offset)]));
assert.equal(polynomialAt24(withNumeral),0);
assert.deepEqual(wrongNumeralOffsets,[9,14]);

const ciphertextField = reduceField(withNumeral.slice().reverse());
assert.deepEqual(liftFixedNumeral(ciphertextField),p36,
  "Exact original p36 238-rune plus fixed-numeral field recovery");
const order = 29n**238n-1n;
assert.equal(order%15n,0n);

// A 15th power must be a cube: y^(|GF*|/3) must be 1.
// The original source value is not a cube, so no ^15 preimage exists.
const cubeResidue = powerField(ciphertextField,order/3n);
const isCube = cubeResidue[0]===1 && cubeResidue.slice(1).every(n=>n===0);
assert.equal(isCube,false);
assert.deepEqual(cubeResidue.slice(0,24),
  [10,26,11,26,0,7,11,10,7,6,15,20,27,4,9,26,16,12,16,10,20,26,2,23]);

// Source-fixed DH23 shared result 2, interpreted only hypothetically as
// a square-power cipher operand, requires an exact field-square receiver.
const squareResidue=powerField(ciphertextField,order/2n);
assert.deepEqual(squareResidue,[28,...Array(DEGREE-1).fill(0)],
  "Original p36 is a quadratic nonresidue in the Q238 field");
const squarePlantSeed=Array(DEGREE).fill(0);
squarePlantSeed[0]=1;
squarePlantSeed[1]=1;
const squarePlantCipher=multiplyField(squarePlantSeed,squarePlantSeed);
assert.deepEqual(powerField(squarePlantCipher,order/2n),
  [1,...Array(DEGREE-1).fill(0)],
  "Genuine field-square positive control must pass Euler's criterion");

const reversiblePowers=[];
for (const exponent of [23n,1661n,1067n,11n]) {
  const inverse = inverseExponent(exponent,order);
  const p=powerField(ciphertextField,inverse);
  const reencoded=powerField(p,exponent);
  assert.deepEqual(reencoded,ciphertextField);
  const basis = p.slice().reverse();
  const gp = liftFixedNumeral(p);
  const record={
    exponent:exponent.toString(),
    inverseExponentBits:inverse.toString(2).length,
    decodedIoc:ioc(gp),
    rawFieldBasisIoc:ioc(basis),
    gpPrefix:gp.slice(0,55).map(x=>corpus.translit[x]).join(""),
    first20Indices:gp.slice(0,20)
  };
  reversiblePowers.push(record);
}
assert(Math.abs(reversiblePowers[0].rawFieldBasisIoc-0.03471261922490515)<1e-14);
assert(Math.abs(reversiblePowers[1].rawFieldBasisIoc-0.03524447753785059)<1e-14);
assert(Math.abs(reversiblePowers[2].rawFieldBasisIoc-0.03506719143353544)<1e-14);
assert(Math.abs(reversiblePowers[0].decodedIoc-0.033294330390384)<1e-14);
assert(Math.abs(reversiblePowers[1].decodedIoc-0.03464170478317909)<1e-14);
assert(Math.abs(reversiblePowers[2].decodedIoc-0.03669822359323476)<1e-14);
assert.deepEqual(reversiblePowers[0].first20Indices,
  [6,25,14,26,18,17,0,3,7,20,14,8,0,8,5,16,14,22,14,10]);
assert.deepEqual(reversiblePowers[1].first20Indices,
  [11,25,11,13,16,1,15,12,26,16,8,23,22,3,9,4,5,14,18,9]);
assert.deepEqual(reversiblePowers[2].first20Indices,
  [28,3,18,4,4,5,26,5,19,24,17,25,4,15,1,20,14,22,7,14]);
const canonicalParticipantExponent = reversiblePowers.find(x => x.exponent === "11");
assert(Math.abs(canonicalParticipantExponent.decodedIoc - 0.03251427153139737) < 1e-14);
assert.deepEqual(canonicalParticipantExponent.first20Indices,
  [28,23,6,13,0,26,15,17,10,25,23,13,23,22,23,27,18,0,22,26]);


// Native-source regression: a complete p36-shaped 238-rune GP text with
// the very same literal heading position must survive 23rd-power encryption
// and full quotient-field inverse, including the formerly omitted coefficient.
const p57 = corpus.pages.find(page=>page.page===57).indices;
assert.equal(p57.length,95);
const plantRunes=Array.from({length:238},(_,j)=>p57[j%95]);
const plantedFull=[...plantRunes.slice(0,99),1,...plantRunes.slice(99)];
const plantElement=reduceField(plantedFull.slice().reverse());
const plantCipher=powerField(plantElement,23n);
const plantRecovered=liftFixedNumeral(powerField(plantCipher,
  inverseExponent(23n,order)));
assert.deepEqual(plantRecovered,plantRunes);
assert.equal(ioc(plantRecovered),ioc(plantRunes));

console.log(JSON.stringify({
  source:{physicalPage:36,runicLength:238,numeralOffset:99,
    printedNumeral:1,wrongNumeralOffsetRoot24:wrongNumeralOffsets,
    correctNumeralOffsetRoot24:0,fieldLiftCoefficientAt139:Q[139],
    fieldLiftNoninvertibleOffsets:fieldZeroPositions,
    invertibleFixedNumeralPlacements:231,
    gridBytes:256,lowFactorDegree:16,
    irreducibleFieldFactorDegree:238,
    addedExponent:{value:1067,role:'DH3301 participant-transcript shared secret',
      authentication:'unsigned participant transcript; protocol only is signed'},
    participantExponentClass:{congruence:'e = 11 (mod 550)',leastPositiveRepresentative:11,
      authentication:'unsigned participant transcript; no LP2 instruction'}},
  exactPower2:{source:'signed 2013 DH23 shared value 2 (hypothetical power operand)',
    eulerResidue:squareResidue.slice(0,24),quadraticNonResidue:true,
    thereforePossibleAsSquare:false,squaredSourceControlPass:true},
  exactPower15:{originalIsCube:isCube,thereforePossibleAs15thPower:false,
    cubeResidualNonzeroCoefficients:cubeResidue.filter(n=>n!==0).length,
    cubeResidualFirst24:cubeResidue.slice(0,24)},
  candidateReversibleInverses:reversiblePowers,
  nativePlant:{source:'p57 repeated to 238 runes, heading 1 at99',
    exact238RunesRecovered:true,ioc:ioc(plantRecovered)},
  p36OriginalIoc:ioc(p36),
  status:"No original plaintext/key. Literal field-power^2 and ^15 impossible; inverses ^11, ^23, ^1661 and ^1067 ciphertext-like."
},null,2));
