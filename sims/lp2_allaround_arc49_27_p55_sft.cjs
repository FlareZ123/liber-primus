"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function read(relative) { return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, ""); }

const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p55 = corpus.pages.find(p => p.page === 55);
const p57 = corpus.pages.find(p => p.page === 57);
const tokens = grid.rows.flat();
const alpha60 = grid.alphabet, alpha59 = alpha60.replace("f", "");
const mod29 = x => ((x % 29) + 29) % 29;
function modPow29(base, exp) {
  let result = 1, value = mod29(base), power = exp;
  while (power > 0) {
    if (power % 2 === 1) result = result * value % 29;
    value = value * value % 29;
    power = Math.floor(power / 2);
  }
  return result;
}
function outerRing() {
  const ring = [];
  for (let c = 0; c < 8; c += 1) ring.push(c);
  for (let r = 1; r < 32; r += 1) ring.push(r * 8 + 7);
  for (let c = 6; c >= 0; c -= 1) ring.push(31 * 8 + c);
  for (let r = 30; r >= 1; r -= 1) ring.push(r * 8);
  return ring;
}
function translit(values) { return values.map(v => corpus.translit[v]).join(""); }
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (values.length * (values.length - 1));
}
function decode(cipher, key, mode, mask) {
  let keyIndex = 0, fIndex = 0;
  return cipher.map(value => {
    if (value === 0) {
      const bypass = (mask & (1 << fIndex)) !== 0;
      fIndex += 1;
      if (bypass) return 0;
    }
    const k = key[keyIndex++];
    if (mode === "minus") return mod29(value - k);
    if (mode === "plus") return mod29(value + k);
    return mod29(k - value);
  });
}
function encode(plain, key, mode) {
  return plain.map((value, i) => {
    if (mode === "minus") return mod29(value + key[i]);
    if (mode === "plus") return mod29(value - key[i]);
    return mod29(key[i] - value);
  });
}

assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
assert.equal(tokens.length, 256);
assert.equal(alpha59.length, 59);
assert.equal(p55.runic_count, 76);
assert.equal(p55.indices.length, 76);
assert.equal(p55.runic_count - 1, 75); // first rune is carried from p54
assert.ok(p57.indices.length >= 76);

const phraseValues = [20,49,25,64,64,30];
assert.equal(phraseValues.reduce((a,b)=>a+b,0),252);
assert.equal(phraseValues[1]+phraseValues[3]+phraseValues[4],177);
assert.equal(phraseValues[0]+phraseValues[2]+phraseValues[5],75);

const ring = outerRing();
const ringIndex = new Map(ring.map((cell, i) => [cell, i]));
assert.equal(ring.length, 76);
assert.equal(ringIndex.get(64), 68);
assert.equal(ringIndex.get(252), 41);
assert.equal((ringIndex.get(252)-ringIndex.get(64)+76)%76,49);
assert.equal((ringIndex.get(64)-ringIndex.get(252)+76)%76,27);
const ringCells = Array.from({length:76},(_,i)=>ring[(ringIndex.get(64)+i)%76]);
assert.equal(ringCells[0],64);
assert.equal(ringCells[49],252);
assert.equal(ringCells.length,76);

const base59Values = tokens.map(token => {
  const hi = alpha59.indexOf(token[0]), lo = alpha59.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, "table token not in drop-f alphabet: " + token);
  return 59 * hi + lo;
});
const base60Values = tokens.map(token => 60 * alpha60.indexOf(token[0]) + alpha60.indexOf(token[1]));
assert.equal(base59Values[252],177);
assert.equal(base60Values[252],180);
assert.equal(base59Values[64],120);
assert.equal(base60Values[64],122);

const fPositions = p55.indices.map((value, i) => value === 0 ? i : -1).filter(i => i >= 0);
assert.deepEqual(fPositions,[15,25,41]);
const footerTarget = [3,1,4,3,7,9]; // conditional OUR OWN
const p28Plain = [9,28,24,10,1,20];
const p28Cipher = p28Plain.map((v,i)=>modPow29(v,i===0?3:27));
assert.deepEqual(p28Cipher,[4,28,23,3,1,16]);
assert.equal(translit(p28Cipher),"READOUT");

const variants = [], positiveControls = [];
for (const radix of ["base59","base60"]) {
  const tableValues = radix === "base59" ? base59Values : base60Values;
  for (const order of ["source","reversed"]) {
    const exponents = order === "source" ? [3,27] : [27,3];
    const key = ringCells.map((cell, i) =>
      modPow29(mod29(tableValues[cell]), i < 49 ? exponents[0] : exponents[1])
    );
    const keyReadout = translit(key);
    for (const mode of ["minus","plus","beaufort"]) {
      const planted = p57.indices.slice(0,76);
      const plantedCipher = encode(planted,key,mode);
      assert.deepEqual(decode(plantedCipher,key,mode,0),planted);
      positiveControls.push({radix,order,mode,passed:true});
      for (let mask = 0; mask < 8; mask += 1) {
        const plain = decode(p55.indices,key,mode,mask);
        const footer = plain.slice(-6);
        variants.push({
          radix,order,mode,mask,ioc:ioc(plain),
          footerMatches:footer.filter((v,i)=>v===footerTarget[i]).length,
          exactFooter:footer.every((v,i)=>v===footerTarget[i]),
          plaintext:translit(plain),keyReadout
        });
      }
    }
  }
}
const primary = variants.filter(v=>v.order==="source");
const reversed = variants.filter(v=>v.order==="reversed");
const bestPrimaryFooter = Math.max(...primary.map(v=>v.footerMatches));
const bestReversedFooter = Math.max(...reversed.map(v=>v.footerMatches));
const exactPrimary = primary.filter(v=>v.exactFooter);
const exactReversed = reversed.filter(v=>v.exactFooter);
assert.equal(variants.length,96);
assert.equal(primary.length,48);
assert.equal(reversed.length,48);
assert.equal(positiveControls.length,12);
assert.equal(bestPrimaryFooter,2);
assert.equal(bestReversedFooter,2);
assert.equal(exactPrimary.length,0);
assert.equal(exactReversed.length,0);
const topPrimary = [...primary].sort((a,b)=>b.ioc-a.ioc||b.footerMatches-a.footerMatches).slice(0,12);

console.log(JSON.stringify({
  status:"PASS: bounded hypothesis reproduced and rejected",
  ring:{length:76,startCell:64,startPosition:68,boundaryCell:252,boundaryPosition:41,segments:[49,27]},
  phrase:{wordValues:phraseValues,keyAllAroundSum:177,theIsYouSum:75,p55LocallyOwnedRunes:75},
  radixAtCell252:{base59:base59Values[252],base60:base60Values[252]},
  radixAtCell64:{base59:base59Values[64],base60:base60Values[64]},
  p55:{runicCount:p55.runic_count,fPositions,conditionalFooter:"OUR OWN"},
  p28PositiveControl:{plain:"READOUT",cipher:translit(p28Cipher),passed:true},
  variants:{total:variants.length,sourceOrder:primary.length,reversedControls:reversed.length,plantedPositiveControls:positiveControls.length},
  result:{sourceOrderExactFooter:exactPrimary.length,sourceOrderBestFooterMatches:bestPrimaryFooter,reversedExactFooter:exactReversed.length,reversedBestFooterMatches:bestReversedFooter},
  topSourceOrderCandidates:topPrimary,
  conclusion:"No p55 plaintext or key recovered; retain the 49/27/75/177 structure as a navigation/checksum hypothesis, not as a successful direct power pad."
},null,2));
