"use strict";
/**
 * P57's historically meaningful CIRCUMFERENCES/DIVINITY pair:
 * frozen, two-authentic-key Vigenere decoding of original LP2 p55.
 *
 * The creator-era sources already establish the two GP29 keys independently:
 * FIRFUMFERENCE (2014 LP1 pp107/167) and DIVINITY (2014 LP1 pp03/04).
 * This gate tests their direct sequential composition with zero fitted phases.
 *
 * Node.js 22, CommonJS, read-only SFT. No inferred plaintext is asserted.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const gp = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const circumference = [0,10,4,0,1,19,0,18,4,18,9,5,18];
const divinity = [23,10,1,10,9,10,16,26];
const original = gp.pages[55].indices;
assert.equal(original.length, 76);
assert.equal(gp.pages[57].indices.length, 95);
/** @param {number[]} data @param {number[]} key @returns {number[]} */
function decrypt(data, key) {
  return data.map((v, i) => (v - key[i % key.length] + 29) % 29);
}
/** @param {number[]} data @param {number[]} key @returns {number[]} */
function encrypt(data, key) {
  return data.map((v, i) => (v + key[i % key.length]) % 29);
}
/**
 * The authentic LP1 DIVINITY exception treats a literal ciphertext F (index 0)
 * as an unconsumed F. An encrypted non-F mapping to F would be ambiguous and
 * contradict this exact automatic-decoder convention.
 * @param {number[]} data @param {number[]} key
 * @returns {{plain:number[],invalid:number[],consumed:number}}
 */
function decryptLiteralF(data, key) {
  const plain = [], invalid = [];
  let clock = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i] === 0) { plain.push(0); continue; }
    const p = (data[i] - key[clock % key.length] + 29) % 29;
    if (p === 0) invalid.push(i);
    plain.push(p);
    clock++;
  }
  return {plain,invalid,consumed:clock};
}
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const f = Array(29).fill(0);
  for (const v of arr) f[v]++;
  return f.reduce((sum,n) => sum + n*(n-1), 0)/(arr.length*(arr.length-1));
}
const outer = decrypt(original, circumference);
const plain = decrypt(outer, divinity);
assert.deepEqual(encrypt(encrypt(plain, divinity), circumference), original);
const native = gp.pages[57].indices.slice(0, 76);
assert.deepEqual(decrypt(decrypt(encrypt(encrypt(native, divinity), circumference), circumference), divinity), native);
const fInner = decryptLiteralF(outer, divinity);
const fOuter = decryptLiteralF(original, divinity);
const reverseLayer = decrypt(fOuter.plain, circumference);
assert.deepEqual(fInner.invalid, [3,24,36]);
assert.deepEqual(fOuter.invalid, [3,27]);
assert.equal(fInner.consumed, 73);
assert.equal(fOuter.consumed, 73);
assert(Math.abs(ioc(original)-0.037894736842105266)<1e-12);
assert(Math.abs(ioc(plain)-0.035789473684210524)<1e-12);
assert(Math.abs(ioc(fInner.plain)-0.03508771929824561)<1e-12);
assert(Math.abs(ioc(reverseLayer)-0.031578947368421054)<1e-12);
const answer = {
  interpretation:"p57 CIRCUMFERENCES then DIVINITY as two authentic direct GP29 Vigenere keys on adjacent unknown p55",
  originalRunes:original.length,sourceExactKeys:{circumference,divinity},
  fullConsume:{originalIoC:ioc(original),decodedIoC:ioc(plain),
    decodedTranslit:plain.map(x=>gp.translit[x]).join(" "),
    syntheticSolvedP57RunesRecovered:native.length,
    exactOriginalReconstruction:true},
  authenticLiteralFVariants:{
    circumferenceOuterDivinityInner:{intermediateFOffsets:outer.flatMap((x,i)=>x===0?[i]:[]),
      illegalEncryptedFOffsets:fInner.invalid,decodedIoC:ioc(fInner.plain)},
    divinityOuterCircumferenceInner:{sourceFOffsets:original.flatMap((x,i)=>x===0?[i]:[]),
      illegalEncryptedFOffsets:fOuter.invalid,decodedIoC:ioc(reverseLayer)}
  },
  verdict:"No original LP2 plaintext. The exact two-key zero-phase composition is nonlinguistic; both literal-F layer orders violate the automatic-F convention."
};
console.log(JSON.stringify(answer, null, 2));
