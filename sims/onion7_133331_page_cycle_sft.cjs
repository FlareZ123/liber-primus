"use strict";
/**
 * Source-exact structural arithmetic on the contemporary 2014 seventh-onion
 * archive's title 133, div id 331, and its 58 numerically ordered image links.
 * Distinguish the observed HTML order from a HYPOTHETICAL multiplier-based
 * page traversal. No decryption, authored key, or intentionality is inferred.
 *
 * Run: node sims/onion7_133331_page_cycle_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT,p),"utf8");
const html = read("resources/cicada2014-onion7-index.html");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const imageIds = [...html.matchAll(/<img src="(\d+)\.jpg"/g)]
  .map(match => Number(match[1]));
assert.deepEqual(imageIds,Array.from({length:58},(_,i)=>i));
const pageCount=imageIds.length;
const title = Number(/<title>(\d+)<\/title>/.exec(html)[1]);
const elementId = Number(/<div id="(\d+)">/.exec(html)[1]);
assert.deepEqual([title,elementId],[133,331]);
const primes = [];
for(let n=2;primes.length<464;n++){
  let isPrime=true;
  for(let d=2;d*d<=n;d++)if(n%d===0){isPrime=false;break;}
  if(isPrime)primes.push(n);
}
assert.equal(primes[463],3301);
assert.equal(title+elementId,464);
assert.equal(title+elementId,8*58);
assert.equal(title+elementId,16*29);
const a=title%pageCount, b=elementId%pageCount;
assert.deepEqual([a,b],[17,41]);
assert.equal(a*b%pageCount,1);
assert.equal(a*a%pageCount,pageCount-1);
assert.equal(b*b%pageCount,pageCount-1);
const imageOrderByMultiplier = m => imageIds.map(i=>(i*m)%58);
const forward=imageOrderByMultiplier(a),backward=imageOrderByMultiplier(b);
assert.equal(new Set(forward).size,58);
assert.equal(new Set(backward).size,58);
for(let i=0;i<58;i++)assert.equal(backward[forward[i]],i);
const seen=new Set(),orbits=[];
for(let i=0;i<58;i++){
  if(seen.has(i))continue;
  const orbit=[];let x=i;
  do{assert.ok(!seen.has(x));seen.add(x);orbit.push(x);x=(a*x)%58;}while(x!==i);
  orbits.push(orbit);
}
assert.equal(orbits.filter(x=>x.length===1).length,2);
assert.equal(orbits.filter(x=>x.length===4).length,14);
assert.deepEqual(orbits.filter(x=>x.length===1),[[0],[29]]);
const solved=corpus.pages.filter(p=>p.status==="solved");
assert.deepEqual(solved.map(p=>p.page),[56,57]);

/**
 * The transcription contains one percent-separated block per rune-bearing
 * page; numeric-only physical page50 has no segment. Keep printed punctuation.
 * @param {number} page
 */
function pageText(page) {
  if(corpus.pages[page].indices.length===0)return "&";
  const blocks=read("resources/lp2-transcription.txt").split("%");
  const blockIndex=corpus.pages.slice(0,page).filter(p=>p.indices.length).length;
  return [...blocks[blockIndex].replace(/[\s/]/g,"")]
    .filter(ch=>/[\u16a0-\u16ff.&$§-]/u.test(ch)).join("");
}
const printable=corpus.pages.map(p=>pageText(p.page));
const wordStats=order=>{
  const text=order.map(i=>printable[i]).join("");
  const wordLengths=[...text.matchAll(/[\u16a0-\u16ff]+/gu)]
    .map(m=>[...m[0]].length);
  return {words:wordLengths.length, largest:Math.max(...wordLengths),
    longerThan14:wordLengths.filter(n=>n>14).length,
    totalRunes:wordLengths.reduce((sum,n)=>sum+n,0)};
};
const original=wordStats(imageIds);
const hypothetical={
  by133:wordStats(forward),
  by331:wordStats(backward)
};
assert.deepEqual(original,{words:2941,largest:14,longerThan14:0,totalRunes:13136});
assert.deepEqual(hypothetical.by133,{words:2942,largest:16,longerThan14:1,totalRunes:13136});
assert.deepEqual(hypothetical.by331,{words:2944,largest:16,longerThan14:1,totalRunes:13136});
const records=[56,57].map(p=>({
  solvedPhysicalPage:p,
  originalLength:corpus.pages[p].indices.length,
  forwardImageId:(a*p)%58,
  backwardImageId:(b*p)%58,
  positionInForwardPageReadOrder:forward.indexOf(p),
  positionInBackwardPageReadOrder:backward.indexOf(p),
  forwardMultiplicationOrbit:orbits.find(orb=>orb.includes(p))
}));
console.log(JSON.stringify({
  source:"Archived 2014 onion7 index title/id, 58 ordered original LP2 images; independent 2013 ISO list of 464 primes p464=3301",
  sourceArithmetic:{title,elementId,sum:title+elementId,primeAtRank464:primes[463],
    imageCount:58,gpAlphabetSize:29,mod58Residues:[a,b],
    inverseProductModulo58:a*b%58,quarterTurnsModulo58:[a*a%58,b*b%58]},
  multiplicationCycles:{fixed:[0,29],fourCycles:14,solvedPageOrbits:records},
  explicitArchivedImageOrder:"0..57, not the hypothetical multiplier order",
  originalTypography:original,
  hypotheticalPageReorderTypography:hypothetical,
  interpretation:"A source-defined finite reversible page-index permutation, with no original instruction to apply it; differences in word lengths are descriptive, not decisive",
  recoveredUnknownPlaintext:false
},null,2));
