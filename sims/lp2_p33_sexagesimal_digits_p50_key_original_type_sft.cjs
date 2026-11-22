"use strict";

/**
 * Frozen, source-typed transfer of p33's authentic Babylonian sexagesimal
 * digits (17,13)/(55,1) into the conventional base60 two-character
 * p49–51 numeric table. Uses the period-familiar Vigenere add/subtract
 * operation on the two-digit alphabet, starting at original table cell 0.
 * An inverse should preserve p50's independently established byte type.
 * Deterministic Node22 CommonJS, Windows11 compatible.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
const gp = JSON.parse(fs.readFileSync(
  path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
assert.equal(grid.alphabet, alphabet);
assert.deepEqual(grid.page_row_counts, [10,13,9]);
assert.equal(grid.rows.length,32);
const originalTokens = grid.rows.flat();
assert.equal(originalTokens.length,256);
const digits = originalTokens.flatMap(token => {
  assert.equal(token.length,2);
  const values = Array.from(token,c=>alphabet.indexOf(c));
  assert(values.every(x=>x>=0&&x<60));
  return values;
});
const mod60 = n=>((n%60)+60)%60;
const byteValues = array => Array.from({length:256},(_,i)=>
  array[2*i]*60+array[2*i+1]);
const cipherBytes = byteValues(digits);
assert(cipherBytes.every(n=>n>=0&&n<256));
const key = [17,13,55,1];
assert.equal(key.map(i=>alphabet[i]).join(""),"HDt1",
  "cuneiform row digits explicitly select the table's own alphabet");
const forward = plain => plain.map((v,i)=>mod60(v+key[i%4]));
const backward = cipher => cipher.map((v,i)=>mod60(v-key[i%4]));
const plusCandidate = forward(digits),minusCandidate = backward(digits);
const plusValues=byteValues(plusCandidate),minusValues=byteValues(minusCandidate);
for(const result of [plusValues,minusValues])
  assert.equal(result.filter(v=>v<256).length,0,
    "all 256 original cells are outside 8-bit byte range under the source key");
const plainGP = gp.pages.find(p=>p.page===57).indices;
assert.equal(plainGP.length,95);
const plantedBytes = Array.from({length:256},(_,i)=>plainGP[i%95]);
assert(plantedBytes.every(v=>v>=0&&v<29));
const plantedDigits=plantedBytes.flatMap(byte=>[
  Math.floor(byte/60),byte%60]);
const encryptedPlant=forward(plantedDigits);
assert.deepEqual(backward(encryptedPlant),plantedDigits);
assert.deepEqual(byteValues(backward(encryptedPlant)),plantedBytes);
if(require.main===module)console.log(JSON.stringify({
  status:"one source-typed p33→p50 base60-Vigenere key cannot decode byte table",
  source:"p33 cuneiform (17,13) and (55,1), conventional sexagesimal",
  keyAsOriginalBase60Alphabet:"HDt1",
  sourceTable:"original p49–51 32x8 cells",
  conventionalCipherBytes:256,
  sourceKeystreamDigits:key,
  directSubtraction:{
    nativeByteCells:minusValues.filter(x=>x<256).length,
    min:Math.min(...minusValues),
    max:Math.max(...minusValues),
    first16:minusValues.slice(0,16)
  },
  directAddition:{
    nativeByteCells:plusValues.filter(x=>x<256).length,
    min:Math.min(...plusValues),
    max:Math.max(...plusValues),
    first16:plusValues.slice(0,16)
  },
  authenticSolvedGP57NativePlant:{
    sourceRunes:95,
    plantedByteSlots:256,
    recoveredExactly:true
  },
  caveat:"Only direct repeated-digit Vigenere on original 512 base60 characters with p33 key, byte output. No author-authenticated opcode or recovered unknown plaintext."
},null,2));
module.exports={forward,backward};
