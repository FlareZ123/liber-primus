"use strict";

/**
 * Original LP2 whole-book approximate ciphertext echo search.
 * Independent complete source stream, including page joins and the rune-free table.
 * Node.js 22, CommonJS, read-only SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const stream = pages.flatMap(p => p.indices);
assert.equal(stream.length, 12956);
assert.equal(pages.length, 55);
assert.equal(corpus.pages[50].indices.length, 0);
const starts = [];
let cursor = 0;
for (const p of pages) {
  starts.push({page:p.page, start:cursor, end:cursor + p.indices.length});
  cursor += p.indices.length;
}

/**
 * All nonoverlapping pairs of n-rune source windows with Hamming <=k.
 * Partition into k+1 consecutive nonempty blocks: any pair with <=k
 * substitutions shares at least one block exactly. Indexing these blocks
 * enumerates every valid pair without a quadratic all-pairs comparison.
 *
 * @param {number[]} source
 * @param {number} n
 * @param {number} k
 * @returns {{comparisons:number,hits:Array<{left:number,right:number,distance:number,changed:number[]}>}}
 */
function findNear(source, n, k) {
  assert(n >= k + 1);
  const partitions = Array.from({length:k+1}, (_, i) => [
    Math.floor(i*n/(k+1)), Math.floor((i+1)*n/(k+1))
  ]);
  /** @type {Map<string,number[]>} */
  const bucket = new Map();
  const tested = new Set();
  const hits = [];
  let comparisons = 0;
  const total = source.length - n + 1;
  for (let right = 0; right < total; right++) {
    for (let b = 0; b < partitions.length; b++) {
      const [first, end] = partitions[b];
      const key = b + "|" + source.slice(right+first, right+end).join(",");
      const lefts = bucket.get(key) || [];
      for (const left of lefts) {
        if (right-left < n) continue;
        const identity = left * total + right;
        if (tested.has(identity)) continue;
        tested.add(identity);
        comparisons++;
        const changed = [];
        for (let j = 0; j < n; j++) {
          if (source[left+j] !== source[right+j]) changed.push(j);
          if (changed.length > k) break;
        }
        if (changed.length <= k) {
          hits.push({left,right,distance:changed.length,changed});
        }
      }
      lefts.push(right);
      bucket.set(key,lefts);
    }
  }
  return {comparisons,hits};
}

/** @param {number} offset @returns {string} */
function position(offset) {
  const site = starts.find(p => p.start <= offset && offset < p.end);
  assert(site);
  return "p" + site.page + ":" + (offset-site.start);
}
const cases = [
  {n:15,k:4,hits:0},
  {n:13,k:3,hits:0},
  {n:12,k:3,hits:0},
  {n:11,k:3,hits:0},
  {n:9,k:2,hits:0},
  {n:8,k:2,hits:5}
];
for (const test of cases) {
  const result = findNear(stream,test.n,test.k);
  assert.equal(result.hits.length,test.hits,
    "Original stream changed for "+test.n+"/"+test.k);
  console.log("n="+test.n+" k="+test.k+
    " qualifying="+result.hits.length+" comparisons="+result.comparisons);
  for(const hit of result.hits) {
    console.log(position(hit.left)+" ↔ "+position(hit.right)+
      ", Hamming="+hit.distance+", substitutions="+hit.changed.join(",")+
      ", left="+stream.slice(hit.left,hit.left+test.n).map(v=>corpus.translit[v]).join(" ")+
      ", right="+stream.slice(hit.right,hit.right+test.n).map(v=>corpus.translit[v]).join(" "));
  }
}
const planted = stream.slice(0,15);
const mutated = planted.map((value,i) => [1,5,9,13].includes(i) ? (value+7)%29 : value);
const artificial = [...planted,...Array(20).fill(0),...mutated];
const positive = findNear(artificial,15,4);
assert.ok(positive.hits.some(h => h.left===0 && h.right===35 &&
  h.distance===4 && h.changed.join(",")==="1,5,9,13"));
console.log("PASS: planted 15-rune, 4-substitution echo recovered completely.");
