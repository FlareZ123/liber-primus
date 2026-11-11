"use strict";
/**
 * LP2 original-word-length source-alignment SFT.
 * Reproduce with Node.js from the repository; all paths are cross-platform.
 * This checks possible reused prose. It does not decrypt ciphertext.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const rune = /[\u16a0-\u16ff]/u;

/** @param {string} s @returns {number[]} */
function runicLengths(s) {
  const lengths = [];
  let n = 0;
  for (const c of s) {
    if (rune.test(c)) n++;
    else if (c === "/" || c === "%" || /\s/u.test(c)) {}
    else if (n) { lengths.push(n); n = 0; }
  }
  if (n) lengths.push(n);
  return lengths;
}
/** @param {string} s @returns {string[]} */
const words = (s) => s.toUpperCase().match(/[A-Z]+/gu) || [];
/** @param {string} s @returns {number} */
const gpLength = (s) => (s.match(/TH|NG|EO|OE|AE|IA|EA|[A-Z]/gu) || []).length;

/**
 * A six-word exact seed, followed by at most two rune-length mismatches.
 * @param {number[]} target @param {string[]} reference
 * @returns {Array<{span:number,errors:number,word:number,at:number,text:string}>}
 */
function scan(target, reference, literalGp = false) {
  const lens = reference.map(w => literalGp ? w.length : gpLength(w));
  const seed = 6, limit = 40;
  /** @type {Map<string,number[]>} */
  const map = new Map();
  for (let i = 0; i + seed <= lens.length; i++) {
    const k = lens.slice(i, i + seed).join(",");
    const a = map.get(k) || []; a.push(i); map.set(k, a);
  }
  const hits = [];
  for (let i = 0; i + seed <= target.length; i++) {
    const matches = map.get(target.slice(i, i + seed).join(",")) || [];
    for (const j of matches) {
      let n = seed, errors = 0;
      while (n < limit && i + n < target.length && j + n < lens.length) {
        if (target[i+n] !== lens[j+n]) {
          if (errors === 2) break;
          errors++;
        }
        n++;
      }
      if (n >= 11) hits.push({span:n, errors, word:i, at:j,
        text:reference.slice(j,j+n).join(" ").slice(0,180)});
    }
  }
  hits.sort((a,b)=>(b.span-3*b.errors)-(a.span-3*a.errors));
  return hits;
}
const source = read("resources/liber-primus/lp2-transcription.txt").split("%");
assert.equal(source.length, 57); // Physical p50 is rune-free.
const target = runicLengths(source.slice(0,55).join("%"));
assert.equal(target.length,2896);
assert.equal(target.reduce((a,b)=>a+b,0),12956);
const control = words("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE").map(gpLength);
const seen = runicLengths(source[56]);
assert.equal(seen.length,20);
assert.deepEqual(seen.flatMap((x,i)=>x===control[i]?[]:[i]),[4]);
console.log("Positive control: solved p57, 20 words, one transliteration mismatch at index 4 (TUNNELNG).");
console.log("Unsolved LP2:",target.length,"words,",target.reduce((a,b)=>a+b,0),"runes");
const references = [
  ["Emerson", "resources/control/emerson_essays_2944.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Solved LP1", "resources/liber-primus/lp1-plaintext-reference.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Latin Vulgate GP", "resources/control/latin-vulgate-gp-wholewords.txt"],
];
for (const [name, filename] of references) {
  let s = read(filename);
  if (name === "Solved LP1") s = s.replace(/^#.*$/gmu,"").replace(/^\s*\[.*\]\s*$/gmu,"");
  const literalGp = name === "Latin Vulgate GP";
  const ref = literalGp ? s.split(/\r?\n/u).filter(w => /^[0-9A-S]+$/u.test(w)) : words(s);
  const hits = scan(target, ref, literalGp);
  console.log(name,ref.length,"source words;",hits.length,"matches of >=11 words (<=2 mismatches)");
  for (const hit of hits.slice(0,3)) console.log("  ",hit);
}
