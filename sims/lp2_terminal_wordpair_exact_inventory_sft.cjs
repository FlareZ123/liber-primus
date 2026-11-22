"use strict";

/**
 * Exact conditional probability of the original LP2 p27/p55 terminal echo.
 * SFT: node sims/lp2_terminal_wordpair_exact_inventory_sft.cjs
 *
 * Hold all original three-rune word counts and their page/word-slot geometry
 * fixed; uniformly permute those identities over the original three-rune
 * slots. Analytically count duplicate directed adjacent 3+3 word pairs.
 *
 * This is a conditional randomization test, not an LP2 decryption.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "../resources/liber-primus/lp2-transcription.txt"),
  "utf8"
).replace(/\r\n/g, "\n");

const rawPages = source.split("%").slice(0, -2);
assert.equal(rawPages.length, 55);
const pageRuneCounts = rawPages.map(s => (s.match(/[\u16A0-\u16FF]/gu) || []).length);
const book = rawPages.join("").replace(/\/\n/g, "").replace(/\n/g, "");
const re = /[\u16A0-\u16FF]+/gu;

/** @type {{word:string,index:number,page:number,offset:number,before:string}[]} */
const words = [];
let match;
let runeOffset = 0;
let previousEnd = 0;
while ((match = re.exec(book)) !== null) {
  let page = 0;
  let pageStart = 0;
  while (page < pageRuneCounts.length - 1 &&
    pageStart + pageRuneCounts[page] <= runeOffset) {
    pageStart += pageRuneCounts[page];
    page++;
  }
  words.push({
    word:match[0],
    index:words.length,
    page:page >= 50 ? page + 1 : page,
    offset:runeOffset - pageStart,
    before:book.slice(previousEnd, match.index)
  });
  runeOffset += match[0].length;
  previousEnd = re.lastIndex;
}
assert.equal(runeOffset, 12956);
assert.equal(words.length, 2896);

const triples = words.filter(w => w.word.length === 3);
assert.equal(triples.length, 720);
const wordCounts = new Map();
for (const w of triples) wordCounts.set(w.word, (wordCounts.get(w.word) || 0) + 1);
const histogram = new Map();
for (const n of wordCounts.values()) histogram.set(n, (histogram.get(n) || 0) + 1);
assert.deepEqual([...histogram].sort((a,b)=>a[0]-b[0]), [[1,689],[2,14],[3,1]]);

/** @type {{left:number,right:number,key:string}[]} */
const edges = [];
for (let i = 0; i + 1 < words.length; i++) {
  const left = words[i], right = words[i+1];
  if (left.word.length === 3 && right.word.length === 3 &&
      left.page === right.page && right.before === "-")
    edges.push({left:i,right:i+1,key:left.word+"-"+right.word});
}
assert.equal(edges.length, 173);

const byPair = new Map();
for (const e of edges) {
  const occurrences = byPair.get(e.key) || [];
  occurrences.push(e);
  byPair.set(e.key, occurrences);
}
const repeated = [...byPair].filter(([,arr]) => arr.length > 1);
assert.equal(repeated.length, 1);
assert.equal(repeated[0][0], "ᛞᛄᚢ-ᛒᛖᛁ");
assert.deepEqual(repeated[0][1].map(x=>[words[x.left].page,words[x.left].offset,
  words[x.left].index,words[x.right].index]),[
  [27,28,1462,1463],
  [55,70,2894,2895]
]);
assert.equal(words[1464].word,"ᚫᚠ");
assert.equal((source.split("%").at(-2).match(/[\u16A0-\u16FF]/u) || [])[0], "ᚫ");

let overlapping = 0;
for (let i=0;i<edges.length;i++)
  for (let j=i+1;j<edges.length;j++)
    if(edges[i].right===edges[j].left)overlapping++;
assert.equal(overlapping,33);

const c = [...wordCounts.values()];
const N = triples.length;
const falling=(n,k)=>{let product=1;for(let j=0;j<k;j++)product*=n-j;return product;};
const s2=c.reduce((sum,n)=>sum+falling(n,2),0);
const square2=c.reduce((sum,n)=>sum+falling(n,2)**2,0);
const n4=s2**2-square2+c.reduce((sum,n)=>sum+falling(n,4),0);
const n3=c.reduce((sum,n)=>sum+falling(n,3),0);
assert.equal(n4,1064);
assert.equal(n3,6);

const disjoint=edges.length*(edges.length-1)/2-overlapping;
assert.equal(disjoint,14845);
const p4=n4/falling(N,4);
const p3=n3/falling(N,3);
const expectation=disjoint*p4+overlapping*p3;
const exactNumerator=7968523n,exactDenominator=133252385040n;
assert.ok(Math.abs(expectation-Number(exactNumerator)/Number(exactDenominator))<1e-16);
assert.equal(repeated[0][1].length,2);

console.log(JSON.stringify({
  pages:55,runes:runeOffset,words:words.length,threeRuneWords:N,
  threeRuneInventory:[...histogram],
  eligibleAdjacentThreeRunePairs:edges.length,
  disjointEdgePairs:disjoint,overlappingEdgePairs:overlapping,
  repeatedPhrase:repeated[0][0],
  occurrences:repeated[0][1].map(x=>({page:words[x.left].page,
    offset:words[x.left].offset,wordIndex:words[x.left].index})),
  probabilityFormula:{p4Numerator:n4,p3Numerator:n3},
  expectedDuplicatePairsExact:String(exactNumerator)+"/"+String(exactDenominator),
  probabilityOfAnyRepeatUpperBound:expectation,
  classification:"Exact source-cipher coincidence under a specified conditional null; no plaintext/key"
},null,2));
console.log("PASS: original LP2 source terminal-word echo exact inventory null");
