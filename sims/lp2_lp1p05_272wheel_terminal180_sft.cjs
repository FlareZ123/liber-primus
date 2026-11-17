"use strict";

/**
 * Source-frozen terminal-wheels test.
 *
 * Original solved LP1 p05 explicitly elevates prime/totient operations and
 * prints 272 in the first/last corners of its 5x5 number square.
 * The original p56 plaintext and p57 cleartext have GP prime sum 29*272
 * and GP ordinal sum 29*76. A running prime wheel modulo 272 supplies
 * exactly 29 crossing-trigger runes, giving a deterministic GP29 key.
 *
 * Node 22 CommonJS; read-only, no dependencies and no network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/liber-primus/lp1-plaintext-reference.txt");
const lp1P5 = lp1.split("### 5")[1].split("### 6")[0];
assert.match(lp1P5, /THE PRIMES ARE SACRED/);
assert.match(lp1P5, /THE TOTIENT FUNCTION IS SACRED/);
assert.match(lp1P5, /272\s+138\s+341\s+131\s+151/);
assert.match(lp1P5, /151\s+131\s+341\s+138\s+272/);
assert.equal(corpus.prime.length, 29);
const mod29 = x => ((x % 29) + 29) % 29;
const tokens = corpus.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} word @returns {number[]} */
function gpWord(word) {
  word = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) {
      result.push(21);
      i += 3;
    } else if (word.startsWith("IO", i)) {
      result.push(27);
      i += 2;
    } else {
      const token = tokens.find(t => word.startsWith(t.s, i));
      assert(token, "unknown GP source character");
      result.push(token.i);
      i += token.s.length;
    }
  }
  return result;
}
const p56Words = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const p56 = p56Words.split(" ").flatMap(gpWord);
const p57 = corpus.pages[57].indices;
assert.equal(p56.length, 85);
assert.equal(p57.length, 95);
assert.equal(p56.indexOf(0), 56);
const first84Totients = [];
for (let n = 2; first84Totients.length < 84; n++) {
  let prime = true;
  for (let d = 2; d * d <= n; d++)
    if (n % d === 0) {prime = false; break;}
  if (prime) first84Totients.push(n - 1);
}
let consumed = 0;
const reconstructedP56 = p56.map(rune => rune === 0 ? 0
  : mod29(rune + first84Totients[consumed++]));
assert.equal(consumed, 84);
assert.deepEqual(reconstructedP56, corpus.pages[56].indices);
const source = p56.concat(p57);
assert.equal(source.length, 180);
assert.equal(source.reduce((s, x) => s + x, 0), 29 * 76);
assert.equal(source.reduce((s, x) => s + corpus.prime[x], 0), 29 * 272);

/**
 * Each crossing of the LP1-p05 number 272 is a complete turn.
 * With weights <=109, there can be at most one crossing per source rune.
 * @param {number[]} runes
 * @param {boolean} primeResidue
 * @returns {number[]}
 */
function key272(runes, primeResidue) {
  let position = 0;
  const key = [];
  for (const rune of runes) {
    const weight = corpus.prime[rune];
    const total = position + weight;
    if (total >= 272)
      key.push(primeResidue ? weight % 29 : rune);
    position = total % 272;
  }
  assert.equal(position, 0);
  assert.equal(key.length, 29);
  return key;
}
const naturalKey = key272(source, false);
assert.deepEqual(naturalKey, [23,23,18,18,15,18,24,16,18,26,26,19,5,24,24,18,18,4,21,4,18,18,4,5,23,10,10,18,18]);
assert.equal(new Set(naturalKey).size, 11);
const p55 = corpus.pages[55].indices;
const chapter = corpus.pages[54].indices.concat(p55);
assert.equal(p55.length, 76);
assert.equal(corpus.pages[54].indices.length, 232);
assert.equal(chapter.length, 308);
assert.equal(232 % 29, 0);

/** @param {number[]} arr @returns {number} */
function scaledIoC(arr) {
  const hist = Array(29).fill(0);
  for (const rune of arr) hist[rune]++;
  return 29 * hist.reduce((s, n) => s + n * (n - 1), 0)
    / (arr.length * (arr.length - 1));
}

/**
 * All key positions and plaintext-F skip choices, with no language filter.
 * The decoder is exact for the established p56-style transparent-F model.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @returns {{paths:number,firstImpossible:number|null}}
 */
function skipPaths(cipher, key, sign) {
  let states = new Map([[0, 1]]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Map();
    const add = (position, paths) =>
      next.set(position, (next.get(position) || 0) + paths);
    for (const [position, paths] of states) {
      const plain = mod29(cipher[i] + sign * key[position % 29]);
      if (cipher[i] === 0) {
        add(position, paths); // Transparent F; key pointer stays.
        if (plain !== 0) add(position + 1, paths); // Encrypted non-F.
      } else if (plain !== 0) {
        add(position + 1, paths);
      }
    }
    if (next.size === 0) return {paths: 0, firstImpossible: i};
    states = next;
  }
  return {paths: [...states.values()].reduce((a, b) => a + b, 0),
    firstImpossible: null};
}

/** @param {number[]} plain @param {number[]} key @param {number} sign @returns {number[]} */
function skipEncrypt(plain, key, sign) {
  const out = [];
  let pointer = 0;
  for (const rune of plain) {
    if (rune === 0) out.push(0);
    else {
      out.push(mod29(rune - sign * key[pointer % 29]));
      pointer++;
    }
  }
  return out;
}
const results = [];
for (const [order, known] of [
  ["natural-p56-p57", source],
  ["control-p57-p56", p57.concat(p56)]
]) for (const [readout, primeResidue] of [
  ["trigger-GP-index", false], ["trigger-prime-mod29", true]
]) {
  const key = key272(known, primeResidue);
  for (const sign of [-1, 1]) {
    const plant = p57.slice(0, 76);
    const recipheredPlant = skipEncrypt(plant, key, sign);
    assert(skipPaths(recipheredPlant, key, sign).paths > 0);
    for (const [receiver, cipher] of [["p55", p55], ["p54-p55", chapter]]) {
      const decoded = cipher.map((v, i) => mod29(v + sign * key[i % 29]));
      assert.deepEqual(decoded.map((v, i) => mod29(v - sign * key[i % 29])), cipher);
      const skip = skipPaths(cipher, key, sign);
      results.push({order, readout, sign, receiver,
        scaledIoC: +scaledIoC(decoded).toFixed(6), ...skip});
    }
  }
}
assert.equal(results.length, 16);
assert.deepEqual(results.filter(r => r.receiver === "p54-p55")
  .map(r => r.paths), Array(8).fill(0));
assert.deepEqual(results.filter(r => r.receiver === "p55")
  .map(r => r.paths), [0, 3, 0, 0, 0, 0, 0, 0]);
assert.equal(Math.max(...results.filter(r => r.receiver === "p55")
  .map(r => r.scaledIoC)), 1.170175);
console.log(JSON.stringify({sourceLength: source.length,
  primeTotal: 29 * 272, ordinalTotal: 29 * 76,
  sourceGP29Key: naturalKey.map(i => corpus.translit[i]),
  results}, null, 2));
