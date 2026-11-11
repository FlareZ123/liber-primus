"use strict";
/**
 * Reproduce the exact 2013-Parable / 2014 seventh-onion cross-artifact rule:
 * the solved LP2 Parable heading GP-prime sum 449 is a common modulus.
 * Body clauses have sums [1259,1031,1229], leaving [361,133,331].
 * The last two remainders, in printed order, match 2014 HTML title and div id.
 *
 * Established facts: original rune/Gematria arithmetic, archived HTML bytes.
 * Open hypothesis: author intended this as an instruction or secret key.
 * Source text itself was present in 2013 Cicada OS AUDIO/761.MP3 metadata.
 *
 * Run: node sims/parable_449_onion7_header_modulo_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const original = read("resources/lp2-transcription.txt");
const sourceHtml = read("resources/cicada2014-onion7-index.html");
const solved = corpus.pages.filter(p=>p.status === "solved");
assert.deepEqual(solved.map(p=>p.page), [56,57]);
assert.equal(solved[1].indices.length, 95);
const runeToPrime = new Map(corpus.runes.map((r,i)=>[r,corpus.prime[i]]));
assert.equal(runeToPrime.size,29);
const segments = original.split("%");
assert.equal(segments.length,57);
const parable = segments[56];
const clauses = parable.split(".").map(str=>[...str].filter(ch=>runeToPrime.has(ch)))
  .filter(clause=>clause.length);
const sums = clauses.map(clause=>clause.reduce((total,rune)=>
  total+runeToPrime.get(rune),0));
assert.deepEqual(clauses.map(clause=>clause.length),[7,30,30,28]);
assert.deepEqual(sums,[449,1259,1031,1229]);
assert.deepEqual(clauses.flat().map(r=>corpus.runes.indexOf(r)),
  solved[1].indices);
const metadata = {
  title:Number(/<title>(\d+)<\/title>/.exec(sourceHtml)[1]),
  elementId:Number(/<div id="(\d+)">/.exec(sourceHtml)[1])
};
assert.deepEqual(metadata,{title:133,elementId:331});
const modulus = sums[0], body = sums.slice(1);
const remainders = body.map(sum=>sum%modulus);
const quotients = body.map(sum=>Math.floor(sum/modulus));
assert.deepEqual(quotients,[2,2,2]);
assert.deepEqual(remainders,[361,133,331]);
assert.deepEqual(remainders.slice(1),Object.values(metadata));
assert.equal(remainders[0],19*19);
assert.equal(metadata.title+metadata.elementId,464);
const images=[...sourceHtml.matchAll(/<img src="(\d+)\.jpg"/g)].map(m=>+m[1]);
assert.deepEqual(images,Array.from({length:58},(_,i)=>i));
const matches=[];
for(let parent=0;parent<sums.length;parent++){
  for(let a=0;a<sums.length;a++)for(let b=0;b<sums.length;b++){
    if(parent===a||parent===b||a===b)continue;
    if(sums[a]%sums[parent]===metadata.title &&
      sums[b]%sums[parent]===metadata.elementId)matches.push({modulusClause:parent,
        firstBodyClause:a,secondBodyClause:b});
  }
}
assert.deepEqual(matches,[{modulusClause:0,firstBodyClause:2,secondBodyClause:3}]);
console.log(JSON.stringify({
  evidence:"Exact cross-artifact source arithmetic, not decoded unsolved LP2 or proven intent",
  input:"Original 95 clear-text runes of physical LP2 p57, GP prime alphabet, original archived 2014 seventh-onion HTML",
  originalClauseLengths:clauses.map(a=>a.length),
  gpPrimeSums:sums,
  headingModulus:modulus,
  bodyQuotients:quotients,
  bodyRemainders:remainders,
  htmlMetadata:metadata,
  exactFinalTwoOrdered:true,
  unusedFirstBodyRemainder:361,
  allOrderedClauseModuloAssignments:24,
  assignmentsReproducingHtml:matches,
  htmlImageCount:images.length,
  creatorIntent:"hypothesis requiring independent evidence",
  recoveredUnknownPlaintext:false
},null,2));
