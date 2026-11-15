"use strict";

/**
 * Full-book LP2 approximate-repeat search allowing substitution, insertion,
 * and deletion of ciphertext runes. Node.js 22, read-only CommonJS SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = corpus.pages.slice(0, 56);
const original = pages.flatMap(page => page.indices);
assert.equal(original.length, 12956);
assert.equal(pages[50].indices.length, 0);

/**
 * Exact unit-cost Levenshtein distance on equally long windows, limited to k.
 * Cells more than k away from the diagonal cannot be on a <=k edit path.
 * @param {number[]} input
 * @param {number} left
 * @param {number} right
 * @param {number} n
 * @param {number} k
 * @returns {number} k+1 when distance exceeds k
 */
function editDistance(input, left, right, n, k) {
  let previous = Array.from({length:n+1}, (_, i) => i);
  let current = new Array(n+1);
  for (let i = 1; i <= n; i++) {
    current[0] = i;
    let best = i;
    for (let j = 1; j <= n; j++) {
      if (Math.abs(i-j) > k) {
        current[j] = k+1;
        continue;
      }
      current[j] = Math.min(
        current[j-1]+1,
        previous[j]+1,
        previous[j-1]+Number(input[left+i-1] !== input[right+j-1]));
      best = Math.min(best,current[j]);
    }
    if (best > k) return k+1;
    [previous,current] = [current,previous];
  }
  return Math.min(previous[n],k+1);
}

/**
 * Exhaustive nonoverlapping pairs of n-rune windows with <=k arbitrary
 * substitutions/insertions/deletions, including all physical-page joins.
 *
 * If <=k edits map a left window to a right window, then among any k+1
 * disjoint source partitions there is one unchanged contiguous partition.
 * It appears in the right window with starting displacement <=k.
 * Index each such substring and inspect every admissible displacement,
 * then check the *exact* Levenshtein metric. No keyword or key is fitted.
 *
 * @param {number[]} source
 * @param {number} n
 * @param {number} k
 * @returns {{comparisons:number,hits:{left:number,right:number,distance:number}[]}}
 */
function findNear(source,n,k) {
  assert(n>k);
  const partitions = Array.from({length:k+1},(_,i) => [
    Math.floor(i*n/(k+1)), Math.floor((i+1)*n/(k+1))
  ]);
  const blockLengths = [...new Set(partitions.map(([first,end])=>end-first))];
  /** @type {Map<string,number[]>} */
  const occurrences = new Map();
  for (const length of blockLengths) {
    for (let site=0;site+length<=source.length;site++) {
      const key = length+"|"+source.slice(site,site+length).join(",");
      const list = occurrences.get(key)||[];
      list.push(site);
      occurrences.set(key,list);
    }
  }
  const count = source.length-n+1;
  const tested = new Set();
  const hits = [];
  let comparisons = 0;
  for (let left=0;left<count;left++) {
    for (const [first,end] of partitions) {
      const key=(end-first)+"|"+source.slice(left+first,left+end).join(",");
      const possible = occurrences.get(key)||[];
      for (const match of possible) {
        for (let displacement=-k;displacement<=k;displacement++) {
          const right=match-first+displacement;
          if(right-left<n || right+n>source.length)continue;
          const pair=left*count+right;
          if(tested.has(pair))continue;
          tested.add(pair);
          comparisons++;
          const distance=editDistance(source,left,right,n,k);
          if(distance<=k)hits.push({left,right,distance});
        }
      }
    }
  }
  return {comparisons,hits};
}

/** @param {number} position */
function location(position) {
  let offset=0;
  for(const page of pages) {
    if(position<offset+page.indices.length) return "p"+page.page+":"+(position-offset);
    offset+=page.indices.length;
  }
  throw new Error("Position outside original LP2 stream");
}

const cases=[
  {n:20,k:4,count:0},
  {n:17,k:3,count:0},
  {n:15,k:3,count:0},
  {n:13,k:2,count:0},
  {n:12,k:2,count:0},
  {n:10,k:2,count:0}
];
for (const {n,k,count} of cases) {
  const result=findNear(original,n,k);
  assert.equal(result.hits.length,count, "Original edit-distance hit-count drift");
  console.log("n="+n+" k="+k+" candidates="+result.comparisons+
    " qualified="+result.hits.length);
  for(const hit of result.hits) console.log(
    location(hit.left)+" ↔ "+location(hit.right)+": edit distance "+hit.distance);
}

// Native source-size positive: one *inserted* symbol and one *deleted*
// symbol are not representable as <=2 aligned substitutions in general.
// They must nevertheless be detected by the full Levenshtein scan.
for(const n of [10,20]) {
  const base=Array.from({length:n},(_,i)=>(3*i+1)%29);
  const spliceAt=Math.floor(n/2);
  const modified=base.slice(0,spliceAt).concat(
    [(base[spliceAt]+7)%29],base.slice(spliceAt,-1));
  const sample=base.concat(Array(20).fill(0),modified);
  const actual=editDistance(sample,0,n+20,n,2);
  assert.equal(actual,2,"Inserted/deleted source positive changed");
  const found=findNear(sample,n,2);
  assert.ok(found.hits.some(hit=>hit.left===0 &&
    hit.right===n+20 && hit.distance===2),
  "Failed to recover actual insertion/deletion echo");
  console.log("PASS planted n="+n+" +1 insertion/-1 deletion.");
}
console.log("PASS complete LP2 edit-distance echo original-input gate.");
