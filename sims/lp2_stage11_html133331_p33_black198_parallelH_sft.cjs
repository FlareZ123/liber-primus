"use strict";
/**
 * Source-only H2 split of p33's full 49 black words (198 GP29 runes) using
 * 2014 Onion7 HTML <title>133</title><div id="331"> and the 99 values of
 * authentic 2014 Stage7 OpenPuff magic squares.
 *
 * The H2 operations are direct 29-adic sum and difference on 99 *parallel*
 * rune pairs, rather than the previously screened 99 *adjacent* pairs.
 * Fully reversible, no fitted key, source-recipient after 2 original p34
 * carry runes. This is a bounded decoder gate, not a decipherment claim.
 *
 * Node.js 22 CommonJS SFT, read-only.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.join(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const squares=read("resources/cicada2014-openpuff-magic-squares.txt")
  .match(/\d+/g).map(Number);
/** @param {number} x @returns {number} */
const mod=x=>(x%29+29)%29;
/** @param {number[]} v @returns {number} */
function ioc(v) {
 const h=new Array(29).fill(0);
 for(const x of v)h[x]++;
 return h.reduce((s,x)=>s+x*(x-1),0)/(v.length*(v.length-1));
}
/** @param {number[]} original @returns {{sum:number[],delta:number[]}} */
function h2(original) {
 assert.equal(original.length,198);
 const A=original.slice(0,99),B=original.slice(99);
 return {sum:A.map((x,i)=>mod(x+B[i])),
   delta:A.map((x,i)=>mod(x-B[i]))};
}
/** @param {number[]} sum @param {number[]} delta @returns {number[]} */
function hinv(sum,delta) {
 assert.deepEqual([sum.length,delta.length],[99,99]);
 const inv2=15; // 2*15 = 1 mod29.
 const A=sum.map((u,i)=>mod(inv2*(u+delta[i])));
 const B=sum.map((u,i)=>mod(inv2*(u-delta[i])));
 return A.concat(B);
}
/** @param {number[]} v @param {number[]} key @returns {number} */
function sourceMatches(v,key) {
 return v.reduce((s,x,i)=>s+(x===mod(key[i])),0);
}
function main() {
 assert.deepEqual([squares.length,squares[0],squares[25],squares[98]],
   [99,434,7,272]);
 assert.equal(331-133,198);
 assert.equal(331+133,464);
 const pages=corpus.pages;
 const p33=pages.find(p=>p.page===33).indices;
 const p34=pages.find(p=>p.page===34).indices;
 const red=ink.pages.find(p=>p.page===33).red_spans;
 assert.deepEqual(red.map(s=>[s.start,s.length]),[[0,10],[91,8]]);
 assert.equal(p33.length,214);
 const body=p33.filter((_,i)=>!red.some(s=>
   i>=s.start&&i<s.start+s.length)).concat(p34.slice(0,2));
 assert.equal(body.length,198);
 const {sum,delta}=h2(body);
 assert.deepEqual(hinv(sum,delta),body);
 // Literal complete-original first-party square-value equality criterion:
 // a cipher limb should equal the independently ordered source numerals mod29.
 const out={
  source:{htmlTitle:133,htmlDivId:331,rank3301:464,
    printedBlackWords:49,sourceRoneCount:198,
    actualSquares:99,readout:"first99 / second99 in printed rune order"},
  fixedInverse:{
   plus:{ioc:ioc(sum),literalHistoricalSourceMatches:sourceMatches(sum,squares),
     prefix:sum.slice(0,20).map(x=>corpus.translit[x]).join(" ")},
   minus:{ioc:ioc(delta),literalHistoricalSourceMatches:sourceMatches(delta,squares),
     prefix:delta.slice(0,20).map(x=>corpus.translit[x]).join(" ")}
  },
  expectedSourceMatchesUnderUniform:99/29,
  replay:{exactRunes:body.length,mod29Inverse2:15},
  conclusion:"No historical 99-square alignment or continuous GP-native output; no new cipher key or unknown-page plaintext"
 };
 assert.deepEqual(
  [sourceMatches(sum,squares),sourceMatches(delta,squares)],[3,0]);
 assert.ok(Math.abs(ioc(sum)-0.034425891568748715)<1e-14);
 assert.ok(Math.abs(ioc(delta)-0.035868893011750155)<1e-14);
 console.log(JSON.stringify(out,null,2));
 return out;
}
if(require.main===module)main();
module.exports={main,h2,hinv,ioc};
