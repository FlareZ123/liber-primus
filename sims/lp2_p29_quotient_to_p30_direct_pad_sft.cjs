"use strict";

/**
 * SFT: Source-constrained p29/G quotient -> full p30 one-shot GP29 additive pad.
 * Precommitted at workplace/agent5-p29-quotient-to-p30-direct-pad-precommit.md.
 * Read-only Node 22, CommonJS, no external dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));

/** @param {number} value @returns {number} */
const mod29 = (value) => ((value % 29) + 29) % 29;

/**
 * High-first long division by the original red p39 factor.
 * @param {number[]} coefficients
 * @param {number[]} factor
 * @returns {{key:number[],remainder:number[]}}
 */
function divide(coefficients, factor) {
  const remainder = coefficients.slice();
  const key = [];
  const lead = factor[0];
  const inverse = Array.from({length:28}, (_,i) => i+1).find(
    (v) => mod29(v*lead) === 1
  );
  assert.notEqual(inverse, undefined);
  for (let i=0; i<=coefficients.length-factor.length; i++) {
    const q=mod29(remainder[i]*inverse);
    key.push(q);
    for(let j=0;j<factor.length;j++) {
      remainder[i+j]=mod29(remainder[i+j]-q*factor[j]);
    }
  }
  return {key, remainder:remainder.slice(key.length)};
}

/** @param {number[]} values */
function ioc(values) {
  const frequency = Array(29).fill(0);
  for (const v of values) frequency[v]++;
  return frequency.reduce((a,n) => a+n*(n-1), 0)/(values.length*(values.length-1));
}

/** @param {number[]} values */
function transliterate(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

const p29=corpus.pages.find((p)=>p.page===29).indices;
const p30=corpus.pages.find((p)=>p.page===30).indices;
const solvedP57=corpus.pages.find((p)=>p.page===57).indices;
assert.equal(p29.length,277);
assert.equal(p30.length,263);
const {key,remainder}=divide(p29,[15,5,27]);
assert.equal(key.length,275);
assert.deepEqual(remainder,[0,0]);

const selectedKey=key.slice(0,p30.length);
const decrypted=p30.map((cipher,i)=>mod29(cipher-selectedKey[i]));
const reencryption=decrypted.map((plain,i)=>mod29(plain+selectedKey[i]));
assert.deepEqual(reencryption,p30);

// Independent authentic native-GP plant, with EXACT same key.
const native=Array.from({length:p30.length},(_,i)=>solvedP57[i%solvedP57.length]);
const encryptedPlant=native.map((plain,i)=>mod29(plain+selectedKey[i]));
const recoveredPlant=encryptedPlant.map((cipher,i)=>mod29(cipher-selectedKey[i]));
assert.deepEqual(recoveredPlant,native);

const observedIoc=ioc(decrypted);
assert.ok(observedIoc>0.0357 && observedIoc<0.0359);
console.log(JSON.stringify({
  classification:"NEGATIVE: no p30 plaintext under precommitted quotient pad",
  p29Length:p29.length,
  p30Length:p30.length,
  factor:[15,5,27],
  quotientLength:key.length,
  remainder,
  decodedFirst130:transliterate(decrypted.slice(0,130)),
  decodedLast75:transliterate(decrypted.slice(-75)),
  originalIoc:ioc(p30),
  decodedIoc:observedIoc,
  nativeSolvedP57Ioc:ioc(solvedP57),
  reencryptionExact:true,
  nativePlantRecoveryExact:true
},null,2));
