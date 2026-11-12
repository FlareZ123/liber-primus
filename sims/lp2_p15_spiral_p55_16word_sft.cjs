"use strict";
/**
 * One source-visible 16-cell numerical-spiral to 16-complete-word candidate.
 * Original physical LP2 page 55 only. Node 22, CommonJS, no network or writes.
 * Execute: node sims/lp2_p15_spiral_p55_16word_sft.cjs
 *
 * Source: physical p15 4x4 square, first red 3299 then clockwise spiral;
 * physical p55 original runes with p54's one-rune carried word excluded.
 * This tests a specified GP29 word-constant additive shift, not a historical
 * decipherment claim. The known clear p57 supplies a native-rune plant.
 */
const assert = require("node:assert/strict");
const { pages, translit, prime } =
  require("../resources/liber-primus/lp2-corpus.json");

const modulus = 29;
const lengths = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const rowMajor = [
  3258,3222,3152,3038,
  3278,3299,3298,2838,
  3288,3294,3296,2472,
  4516,1206,708,1820
];
const outward = [
  3299,3298,3296,3294,
  3288,3278,3258,3222,
  3152,3038,2838,2472,
  1820,708,1206,4516
];
const outwardCells = [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];

/** @param {number} n @returns {number} */
function mod(n) { return ((n % modulus) + modulus) % modulus; }

/** @param {number[]} data @returns {number[][]} */
function partition(data) {
  let cursor = 0;
  const out = lengths.map(length => {
    const part = data.slice(cursor, cursor + length);
    cursor += length;
    assert.equal(part.length, length);
    return part;
  });
  assert.equal(cursor, 75);
  assert.equal(data.length, cursor);
  return out;
}

/**
 * @param {number[][]} words
 * @param {number[]} key
 * @param {number} sign
 * @returns {number[][]}
 */
function transform(words, key, sign) {
  assert.equal(words.length, key.length);
  return words.map((word, i) => word.map(rune => mod(rune + sign * key[i])));
}

/** @param {number[]} runes @returns {number} */
function ioc(runes) {
  const counts = Array(29).fill(0);
  for (const rune of runes) counts[rune]++;
  const repeated = counts.reduce((acc, n) => acc + n*(n-1), 0);
  return repeated / (runes.length*(runes.length-1));
}

/** @param {number[][]} words @returns {string} */
function describe(words) {
  return words.map(w => w.map(n => translit[n]).join("")).join(" ");
}

function main() {
  assert.equal(prime.length,29);
  assert.deepEqual(outwardCells.map(i => rowMajor[i]),outward);
  const originalPage = pages[55].indices;
  assert.equal(originalPage.length,76);
  assert.equal(originalPage[0],21); // NG carries the previous physical-page word
  assert.equal(lengths.reduce((a,b) => a+b,0),75);
  assert.deepEqual(originalPage.slice(-6),[23,11,1,17,18,10]);
  const words = partition(originalPage.slice(1));

  const nativeP57 = partition(pages[57].indices.slice(0,75));
  assert.equal(nativeP57.flat().length,75);
  console.log("p55 original IoC",ioc(words.flat()).toFixed(9));
  console.log("known p57 native control IoC",ioc(nativeP57.flat()).toFixed(9));
  for (const [name,key] of [["outward-spiral",outward],["row-major",rowMajor]]) {
    for (const sign of [-1,1]) {
      const decoded = transform(words,key,sign);
      const recovered = transform(decoded,key,-sign);
      assert.deepEqual(recovered,words);
      const plantCipher = transform(nativeP57,key,-sign);
      assert.deepEqual(transform(plantCipher,key,sign),nativeP57);
      const result = {
        key:name,
        sign,
        ioc: Number(ioc(decoded.flat()).toFixed(9)),
        decoded:describe(decoded)
      };
      console.log(JSON.stringify(result));
    }
  }
  console.log("Conclusion: these four fixed source-square word-shift readings"
    + " do not recover readable native GP29 prose from physical p55.");
}
main();
