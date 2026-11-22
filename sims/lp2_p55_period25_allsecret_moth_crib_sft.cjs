"use strict";
/**
 * Single-file original p55 source gate for a provisional LP1 p5 terminal crib.
 * Run: node sims/lp2_p55_period25_allsecret_moth_crib_sft.cjs
 * Reads the canonical unmodified LP2 page indices and exact GP rune alphabet.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"));
const runeIndex = new Map(source.runes.map((r, i) => [r, i]));
const page = source.pages.find(p => p.page === 55).indices;
assert.equal(page.length, 76);
const body = page.slice(1);
assert.equal(body.length, 75);
const phrase = ["ᚦᛖ", "ᛏᚩᛏᛁᛖᚾᛏ", "ᚠᚢᚾᚳᛏᛡᚾ", "ᛁᛋ",
  "ᛋᚪᚳᚱᛖᛞ", "ᚪᛚᛚ", "ᚦᛝᛋ"];
assert.deepEqual(phrase.map(w => [...w].length), [2,7,7,2,6,3,3]);
const plain = [...phrase.join("")].map(r => runeIndex.get(r));
assert.equal(plain.length, 30);
assert(plain.every(Number.isInteger));
const cipher = body.slice(45);
assert.equal(cipher.length, 30);

/**
 * For C_i = S_(i mod25)(P_i), every secret S_j is a bijection.
 * Therefore C_i === C_(i+25) necessarily implies P_i === P_(i+25).
 * A changing alphabet at each of 25 phase slots is allowed.
 */
const rows = Array.from({length:5}, (_, i) => ({
  tailIndex: i,
  originalPageOffsetA: i+46,
  originalPageOffsetB: i+71,
  cipherA: cipher[i],
  cipherB: cipher[i+25],
  candidatePlainA: plain[i],
  candidatePlainB: plain[i+25],
  impossible: cipher[i] === cipher[i+25] && plain[i] !== plain[i+25]
}));
assert.deepEqual(rows.filter(x=>x.impossible).map(x=>x.tailIndex), [3,4]);
assert.deepEqual(rows.slice(3).map(x=>[x.cipherA,x.cipherB]), [[18,18],[10,10]]);
assert.deepEqual(rows.slice(3).map(x=>[x.candidatePlainA,x.candidatePlainB]), [[3,21],[16,15]]);
/** @param {number} n */
const mod = n => (n%29+29)%29;
const admissibleAffineMultipliers = Array.from({length:28},(_,i)=>i+1).filter(a =>
  rows.every(row=>mod(row.cipherA-row.cipherB)===
    mod(a*(row.candidatePlainA-row.candidatePlainB))));
assert.equal(admissibleAffineMultipliers.length,0);

// Authentic-solved-p57 source-native plaintext plus the 30-symbol LP1 crib
// is encrypted with independent secret affine GP29 alphabets at each phase.
const p57 = source.pages.find(p=>p.page===57).indices;
const plantedPlain = [...p57.slice(0,45),...plain];
assert.equal(plantedPlain.length,75);
const multipliers = Array.from({length:25},(_,i)=>1+(7*i)%28);
const shifts = Array.from({length:25},(_,i)=>mod(19*i+7));
const inverse = a => {
  for(let k=1;k<29;k++) if(mod(a*k)===1) return k;
  throw new Error("nonunit");
};
const encoded = plantedPlain.map((v,i)=>mod(multipliers[i%25]*v+shifts[i%25]));
const decoded = encoded.map((v,i)=>
  mod(inverse(multipliers[i%25])*(v-shifts[i%25])));
assert.deepEqual(decoded,plantedPlain);
assert.deepEqual(encoded,decoded.map((v,i)=>mod(multipliers[i%25]*v+shifts[i%25])));
assert(Array.from({length:5},(_,i)=>
  encoded[45+i]===encoded[70+i] &&
  plantedPlain[45+i]!==plantedPlain[70+i]).every(v=>!v));

console.log(JSON.stringify({
  status:"PASS",
  originalSource:"resources/liber-primus/lp2-corpus.json, physical p55",
  hypothesis:"provisional LP1 p5 seven-word crib under repeating 25-phase secret rune bijections",
  contradictions:rows.filter(x=>x.impossible),
  admissibleAffineMultipliers:admissibleAffineMultipliers.length,
  sourceNativePositiveRecovered:decoded.length,
  recoveredUnknownPlaintext:0
},null,2));
