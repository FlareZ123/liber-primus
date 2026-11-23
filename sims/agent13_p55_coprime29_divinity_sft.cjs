"use strict";
/**
 * Frozen source-led p55 coprime strict-interior selector -> authentic LP1
 * DIVINITY Vigenere cipher. Original physical p55 ends a 16-word
 * chapter, solved p7 mentions totient, solved p57 explicitly directs
 * us to shed circumferences and find divinity within.
 *
 * The actual LP1 cipher is P=(C-key[clock]) mod29, with literal
 * plaintext F emitted as ciphertext F without advancing the clock.
 * Every ciphertext-F bypass mask is enumerated. A positive native-GP
 * planted passage exercises the actual bypass and reencryption.
 *
 * No password, phase, word order, extra layer, or cipher sign is fitted.
 * SFT: Node.js 22, CommonJS, read-only.
 */
const assert = require("node:assert/strict");
const {createHash} = require("node:crypto");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const authentic = require("./authentic_lp1_p03_p04_vigenere_recovery.cjs");

const WORD_LENGTHS = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const SOURCE_SHA = "9a991437b541673c35cca0ba877eddee719c6fad7ec68c495100d2e27c61529f";
const EXPECTED = [10,2,5,28,0,14,10,19,1,5,13,8,21,20,13,12,18,10,6,14,6,15,12,2,2,18,5,11,18];
const BASE29 = "0123456789ABCDEFGHIJKLMNOPQRS";
const KEY = authentic.key;
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} a @param {number} b @returns {number} */
function gcd(a, b) {
  while (b !== 0) [a,b] = [b,a%b];
  return a;
}

/** @param {number[]} p55 @returns {number[]} */
function coprimeInteriors(p55) {
  let offset = 1;
  const selected = [];
  for (const n of WORD_LENGTHS) {
    for (let position = 2; position < n; position++) {
      if (gcd(position,n) === 1) selected.push(p55[offset+position-1]);
    }
    offset += n;
  }
  assert.equal(offset,76);
  return selected;
}

/**
 * Exact historical plaintext F branch semantics.
 * A set bit at each ciphertext-F position selects literal F bypass.
 * @param {number[]} ciphertext
 * @param {number} mask
 * @returns {{plain:number[],phase:number}|{firstFailure:number}}
 */
function decodeMask(ciphertext,mask) {
  const plain = [];
  let clock = 0;
  let fIndex = 0;
  for (let i=0;i<ciphertext.length;i++) {
    const c = ciphertext[i];
    const bypass = c === 0 && ((mask >> fIndex++) & 1) === 1;
    if (bypass) {
      plain.push(0);
      continue;
    }
    const p = mod(c-KEY[clock % KEY.length]);
    if (p === 0) return {firstFailure:i+1};
    plain.push(p);
    clock++;
  }
  return {plain,phase:clock % KEY.length};
}

/** @param {number[]} plain @returns {number[]} */
function encrypt(plain) {
  let clock = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const c = mod(p + KEY[clock % KEY.length]);
    clock++;
    return c;
  });
}

assert.deepEqual(KEY,[23,10,1,10,9,10,16,26]);
assert.equal(authentic.cipher.length,515);
assert.equal(authentic.plaintext.length,515);
assert.equal(authentic.allRecoveredFs.length,11);
const source = corpus.pages.find(p => p.page === 55).indices;
assert.equal(source.length,76);
assert.equal(createHash("sha256").update(Buffer.from(source)).digest("hex"),SOURCE_SHA);
const cipher = coprimeInteriors(source);
assert.deepEqual(cipher,EXPECTED);
assert.equal(cipher.length,29);
assert.equal(cipher.map(x => BASE29[x]).join(""),"A25S0EAJ15D8LKDCIA6E6FC22I5BI");
const fPositions = cipher.flatMap((c,i) => c === 0 ? [i] : []);
assert.deepEqual(fPositions,[4]);
const originalMasks = Array.from({length:2**fPositions.length},(_,mask)=>decodeMask(cipher,mask));
assert.deepEqual(originalMasks.map(o=>o.firstFailure),[18,7],
  "every original p55 coprime29 candidate is strictly inconsistent with the authentic LP1 DIVINITY cipher");

// Plant actual solved p57 native GP rune spellings in the same 29 positions.
// Insert a genuine F at the original selected cipher-F index to exercise bypass.
const native = corpus.pages.find(p => p.page === 57).indices.slice(0,29);
assert.equal(native.length,29);
native[4] = 0;
const plantedCipher = encrypt(native);
const fPlant = plantedCipher.filter(x=>x===0).length;
const recovered = Array.from({length:2**fPlant},(_,mask)=>decodeMask(plantedCipher,mask))
  .filter(o=>o.plain).some(o=>o.plain.every((x,i)=>x===native[i]));
assert.equal(recovered,true,"known native-GP plant must recover under correct F-bypass mask");

console.log("SOURCE",JSON.stringify({physicalPage:55,originalRunes:source.length,completeWords:WORD_LENGTHS.length,selected:cipher.length,sourceSHA256:SOURCE_SHA}));
console.log("EXACT_COPRIME29_BASE29",cipher.map(x=>BASE29[x]).join(""));
console.log("AUTHENTIC_DIVINITY_KEY",KEY.join(","));
console.log("BYPASS_MASKS",JSON.stringify(originalMasks.map((v,mask)=>({mask,firstFailure:v.firstFailure}))));
console.log("NATIVE_GP_POSITIVE",JSON.stringify({length:native.length,plaintextFPositions:[4],ciphertextFCount:fPlant,recovered}));
console.log("DECISION","0/2 legal source-F branch masks; the selected 29 p55 runes cannot be ciphertext of the historical LP1 DIVINITY law at phase0.");
