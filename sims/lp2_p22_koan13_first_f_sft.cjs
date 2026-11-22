"use strict";
/**
 * Exact source-selected candidate: reuse the solved LP1 pp14-15
 * FIRFUMFERENFE (13 GP indices) on LP2 p22, with a single non-consuming
 * literal-F at the first original F, local index 13.
 *
 * This gate is distinct from the previously tested no-skip and all-F-skip
 * cases. It tests the source-visible relationship 131 = 10*13+1;
 * the first F is printed after the initial 13-rune cipher cycle.
 * A negative here excludes only this one fixed transfer schedule.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const data = JSON.parse(fs.readFileSync(path.join(__dirname,
  "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const key = [0,10,4,0,1,19,0,18,4,18,9,0,18];
const c = data.pages.find(p => p.page === 22).indices;
const p57 = data.pages.find(p => p.page === 57).indices;
assert.equal(c.length, 131);
assert.deepEqual(c.flatMap((v,i) => v === 0 ? [i] : []),
  [13,51,55,119,124,128]);
assert.equal(key.length, 13);
assert.equal(c[13], 0);

/** @param {number[]} x @param {number|null} skip @returns {number[]} */
function decode(x, skip) {
  let phase = 0;
  return x.map((v,i) => {
    if (i === skip) return v;
    const p = ((v-key[phase % key.length]) % 29+29) % 29;
    phase++;
    return p;
  });
}

/** @param {number[]} p @param {number|null} skip @returns {number[]} */
function encode(p, skip) {
  let phase = 0;
  return p.map((v,i) => {
    if (i === skip) return v;
    const c = (v+key[phase % key.length]) % 29;
    phase++;
    return c;
  });
}

/** @param {number[]} x @returns {number} */
function ioc(x) {
  const h = Array(29).fill(0);
  x.forEach(v => h[v]++);
  return h.reduce((total,n) => total+n*(n-1), 0)/(x.length*(x.length-1));
}

/** @param {number[]} x @returns {string} */
function translit(x) {
  return x.map(v => data.translit[v]).join("");
}

const noSkip = decode(c, null);
const oneSkip13 = decode(c, 13);
const fAll = [];
let k = 0;
for(const v of c) {
  if (v === 0) { fAll.push(0); continue; }
  fAll.push(((v-key[k % 13])%29+29)%29);
  k++;
}
assert.deepEqual(encode(oneSkip13, 13), c);
assert.ok(Math.abs(ioc(c)-0.0358191426893717) < 1e-13);
assert.ok(Math.abs(ioc(noSkip)-0.034879624192601294) < 1e-13);
assert.ok(Math.abs(ioc(oneSkip13)-0.03358778625954199) < 1e-13);
assert.ok(Math.abs(ioc(fAll)-0.03429242513211979) < 1e-13);

// A genuine GP text plant with literal F at the exact skip position.
const native = Array.from({length:131}, (_,i) => p57[i % p57.length]);
native[13] = 0;
const encryptedPlant = encode(native, 13);
assert.deepEqual(decode(encryptedPlant, 13), native);
assert.equal(encryptedPlant[13], 0);

console.log(JSON.stringify({
  hypothesis:"LP1 13-rune koan key, one literal F at LP2 p22 index 13",
  originalPage:22,runicCount:c.length,key,
  literalFAt:13,remainingCipherRuneCount:130,cycles:10,
  originalIoC:ioc(c),noSkipIoC:ioc(noSkip),
  firstFSkipIoC:ioc(oneSkip13),allFSkipIoC:ioc(fAll),
  oneSkipLatin:translit(oneSkip13),
  trueGPPlantLength:native.length,positiveControlPassed:true,
  ciphertextRoundtripPassed:true,
  result:"No coherent original plaintext under this exact rule"
},null,2));
